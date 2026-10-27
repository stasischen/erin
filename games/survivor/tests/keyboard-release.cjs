const assert=require('node:assert/strict');
// Capture the callbacks actually registered by unmodified classic input loading.
const run=require('./maker-support.cjs')({captureWindowEvents:true});
const plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
function send(type,key,repeat=false){for(const handler of run.windowListeners[type]||[])handler({key,repeat,target:{tagName:'BODY'},preventDefault(){}});}
function fresh(){run("resetGame();state.mode='playing';settingsPanel.hidden=true;state.joy=null;state.player.x=400;state.player.y=300;state.player.damageDisabled=true;state.spawnTimer=999;state.eliteTimer=999;state.bearSpawned=true;state.weaponId='candy-sword';updateCamera()");}
const directions=[['ArrowLeft',-1,0],['ArrowRight',1,0],['ArrowUp',0,-1],['ArrowDown',0,1]];
for(const [key,x,y]of [...directions,['a',-1,0],['d',1,0],['w',0,-1],['s',0,1],['A',-1,0],['D',1,0],['W',0,-1],['S',0,1]]){
 fresh();send('keydown',key);send('keydown',key,true);assert.deepEqual(plain('movementInput()'),{x,y},key+' down');
 run('globalThis.old={x:state.player.x,y:state.player.y};tick(.05)');assert.equal(run('state.player.x!==old.x||state.player.y!==old.y'),true,key+' actually moves');
 const released=key.length===1?(key===key.toLowerCase()?key.toUpperCase():key.toLowerCase()):key;
 send('keyup',released);assert.deepEqual(plain('movementInput()'),{x:0,y:0},key+' released');
 run('globalThis.stopped={x:state.player.x,y:state.player.y};tick(.05)');assert.deepEqual(plain('({x:state.player.x,y:state.player.y})'),plain('stopped'),key+' stops on real tick');
}
fresh();send('keydown','ArrowLeft');send('keydown','ArrowUp');send('keyup','ArrowLeft');assert.deepEqual(plain('movementInput()'),{x:0,y:-1});send('keyup','ArrowUp');assert.deepEqual(plain('movementInput()'),{x:0,y:0});
for(const [key]of directions){
 fresh();send('keydown',key);send('keydown','Escape');assert.equal(run('state.mode'),'paused');assert.deepEqual(plain('movementInput()'),{x:0,y:0});send('keyup',key);run.elements.startButton.listeners.click();assert.equal(run('state.mode'),'playing');assert.deepEqual(plain('movementInput()'),{x:0,y:0});
 fresh();send('keydown',key);send('blur');assert.equal(run('state.mode'),'paused');assert.deepEqual(plain('movementInput()'),{x:0,y:0});run.elements.startButton.listeners.click();run('globalThis.stopped={x:state.player.x,y:state.player.y};tick(.05)');assert.deepEqual(plain('({x:state.player.x,y:state.player.y})'),plain('stopped'));
}
for(const key of ['j','J','k','K']){
 fresh();const kind=key.toLowerCase()==='j'?'attack':'special';send('keydown',key);assert.equal(run(`manualHolds.${kind}!==null`),true);run('tickManualAttack(.2)');send('keyup',key===key.toUpperCase()?key.toLowerCase():key.toUpperCase());assert.equal(run(`manualHolds.${kind}`),null);assert.equal(run('state.lastAttackInput.kind'),kind);
 if(kind==='attack'){run('for(let i=0;i<20;i++)tick(.01)');assert.equal(run('state.swingCount'),1);}else assert.ok(run('state.specialCooldown>0'));
 fresh();send('keydown',key);send('blur');send('keyup',key);assert.equal(run(`manualHolds.${kind}`),null);assert.equal(run('state.swingCount'),0);assert.equal(run('state.specialCooldown'),0);
 fresh();send('keydown',key);send('keydown','Escape');send('keyup',key);assert.equal(run(`manualHolds.${kind}`),null);assert.equal(run('state.swingCount'),0);assert.equal(run('state.specialCooldown'),0);
}
console.log('PASS: registered keyboard handlers release all four arrows / repeats / mixed-case WASD, real ticks stop, partial diagonal release, Escape / blur clear held movement, mixed-case J/K release and cancellation');
