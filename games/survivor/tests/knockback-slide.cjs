const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
const run=create(),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
for(const dt of [1/30,1/60,1/120,.05,.3]) {
 run('globalThis.m=SurvivorSlide.impulse(null,80,0,.2);globalThis.total=0;globalThis.speeds=[];');
 for(let i=0;i<Math.ceil(.2/dt);i++)run(`{const r=SurvivorSlide.step(m,${dt});total+=r.dx;speeds.push(r.dx/${dt});m=r.motion;}`);
 near(run('total'),80);assert.equal(run('m'),null);
 assert.ok(run('speeds.every((v,i)=>!i||v<=speeds[i-1]+1e-7)'));
}
run('globalThis.m=null;for(let i=0;i<1000;i++)m=SurvivorSlide.impulse(m,80,0);');near(run('m.x'),160);
run('m=SurvivorSlide.impulse(m,-80,0)');near(run('m.x'),80);
// 固定步長：不足一步先不動；不同渲染分段在同一物理時刻相同，輸入不變。
run('m=SurvivorSlide.impulse(null,80,20,.173);globalThis.before=JSON.stringify(m);globalThis.partial=SurvivorSlide.step(m,1/240)');
near(run('partial.dx'),0);near(run('partial.motion.pending'),1/240);assert.equal(run('JSON.stringify(m)===before'),true);
run('globalThis.whole=SurvivorSlide.step(m,.05);globalThis.parts=SurvivorSlide.step(partial.motion,.05-1/240)');
near(run('whole.dx'),run('parts.dx'));near(run('whole.dy'),run('parts.dy'));near(run('whole.motion.time'),run('parts.motion.time'));
run('globalThis.rest=SurvivorSlide.step(whole.motion,1)');near(run('whole.dx+rest.dx'),80);near(run('whole.dy+rest.dy'),20);
// 斜向薄牆與移動後相對座標，每種渲染步長都在同一位置停止。
for(const dt of [1/30,1/60,1/144,.3]) {
 run('m=SurvivorSlide.impulse(null,100,30);globalThis.px=0;globalThis.py=0');
 for(let i=0;i<Math.ceil(.3/dt);i++)run(`{const r=SurvivorSlide.step(m,${dt},10,[],[{x:50-px,y:-50-py,width:1,height:100}]);px+=r.dx;py+=r.dy;m=r.motion;}`);
 near(run('px'),40);near(run('py'),12);assert.equal(run('m'),null);
}
// Swept circle, thin wall, arena boundary: no tunnelling even for one long frame.
near(run('SurvivorSlide.step(SurvivorSlide.impulse(null,100,0),1,10,[{x:50,y:0,r:10}]).dx'),30);
near(run('SurvivorSlide.step(SurvivorSlide.impulse(null,100,0),1,10,[],[{x:50,y:-50,width:1,height:100}]).dx'),40);
near(run('SurvivorSlide.step(SurvivorSlide.impulse(null,100,0),1,10,[],[],{left:-100,right:60,top:-100,bottom:100}).dx'),50);
near(run('SurvivorSlide.step(SurvivorSlide.impulse(null,100,0),1,10,[],[],{left:-Infinity,right:Infinity,top:-Infinity,bottom:Infinity,zone:{x:0,y:0,r:60}}).dx'),50);
function fresh(){run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;state.bossSpawned=true;GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;globalThis.e=spawnEnemy({typeId:'jaben'});e.x=state.player.x+80;e.y=state.player.y;e.speed=0;e.hp=10000;globalThis.x=e.x;`);}
fresh();run('shiftTarget(e,state.player.x,state.player.y,80)');near(run('e.x-x'),0);near(run('slidePrediction(e).dx'),80);
run('state.hitStop=.05;tick(.05)');near(run('e.x-x'),0);run('tick(.05)');near(run('e.x-x'),35);
run('state.mode="paused";tick(1)');near(run('e.x-x'),35);run('state.mode="playing";tick(.05);tick(.05);tick(.05)');near(run('e.x-x'),80);
fresh();run('shiftTarget(e,state.player.x,state.player.y,80);resetGame()');assert.equal(run('state.player.slide||null'),null);
fresh();run('globalThis.b=spawnEnemy({typeId:"jaben"});b.x=e.x+60;b.y=e.y;b.speed=0;b.hp=10000;shiftTarget(e,state.player.x,state.player.y,100);globalThis.end=slidePrediction(e).dx;updateTargetSlide(e,1)');near(run('e.x-x'),run('end'));assert.equal(run('e.slide'),null);
// 紫霧圈內、圈外，以及老師跳躍推主角，都可以越過傷害圈。
for(const offset of [170,190]) {
 fresh();run(`state.bossZone={x:state.player.x,y:state.player.y,radius:180};e.x=state.player.x+${offset};x=e.x;shiftTarget(e,e.x-10,e.y,45);`);
 near(run('slidePrediction(e).dx'),45);run('updateTargetSlide(e,1)');near(run('e.x-x'),45);
}
fresh();run(`state.bossZone={x:state.player.x-190,y:state.player.y,radius:180};x=state.player.x;shiftTarget(state.player,state.player.x-10,state.player.y,45);updateTargetSlide(state.player,1)`);near(run('state.player.x-x'),45);
// 真正的老師障壁仍擋住滑動，箭頭終點與落點一致。
fresh();run(`state.bossMoves=[{kind:'barriers',active:true,x:e.x+80,y:e.y,wallWidth:30,radius:100}];shiftTarget(e,e.x-10,e.y,100);globalThis.end=slidePrediction(e).dx;updateTargetSlide(e,1)`);
near(run('e.x-x'),run('end'));assert.ok(run('end>0 && end<100'));
// 擊退時不能追人、出招或衝刺；結束後下一幀恢復自主移動。
fresh();run("GAME_DATA.bodySeparation.enabled=false;e.speed=100;e.x=state.player.x+180;x=e.x;shiftTarget(e,e.x-10,e.y,80);tick(.05)");near(run('e.x-x'),35);
run('tick(.05);tick(.05);tick(.05)');near(run('e.x-x'),80);run('tick(.05)');assert.ok(run('e.x-x<80'));
fresh();run("e.x=state.player.x+180;globalThis.px=state.player.x;GAME_DATA.bodySeparation.enabled=false;state.keys.add('d');shiftTarget(state.player,px-10,state.player.y,80);globalThis.charges=state.dashCharges;activateDash();activateSkill();fireAtNearest();");
assert.equal(run('state.dashCharges'),run('charges'));assert.equal(run('state.bomb'),null);assert.equal(run('state.projectiles.length'),0);assert.equal(run("beginManualAttack('attack')"),false);
run('tick(.05)');near(run('state.player.x-px'),35);run('tick(.05);tick(.05);tick(.05)');near(run('state.player.x-px'),80);run('tick(.05)');assert.ok(run('state.player.x-px>80'));
// 小頭目／精英的招式倒數，與可被推的老師招式，在失控時暫停。
fresh();run("e.miniboss=true;e.slamTimer=0;e.elite='teleport';e.abilityTimer=0;shiftTarget(e,e.x-10,e.y,10);updateEncounters(.05)");assert.equal(run('state.enemyHazards.length'),0);assert.equal(run('e.teleport||null'),null);
fresh();run("state.boss=e;state.enemies=[];GAME_DATA.knockback.bossMultiplier=1;state.bossIntro=0;state.bossRest=0;e.maxHp=e.hp;shiftTarget(e,e.x-10,e.y,20);globalThis.bx=e.x;updateBoss(.05)");near(run('e.x-bx'),0);assert.equal(run('state.bossMoves.length'),0);
// Maker persistence, legacy migration, and rejecting invalid seconds.
for(const expression of ['d.knockback.slideSeconds=.14','d.knockback.slideSeconds=Infinity',"d.cards[0].effects=[{...SurvivorData.PARAMS,type:'knockback',trigger:'skill',slideSeconds:.3}]"])assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expression};return SurvivorData.validate(d).valid})()`),false);
near(run('(()=>{const d=SurvivorData.defaults();delete d.knockback.slideSeconds;return SurvivorData.validate(d).data.knockback.slideSeconds})()'),.2);
console.log('PASS: fixed-step immutable rules, control lock/recovery, exact ease-out distance at five dt values, capped stacking, swept body/wall/arena stop, fog crossing, real barrier/arrow endpoint, hitstop/pause/reset, Maker migration/bounds');
