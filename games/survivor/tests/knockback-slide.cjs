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
// Maker persistence, legacy migration, and rejecting invalid seconds.
for(const expression of ['d.knockback.slideSeconds=.14','d.knockback.slideSeconds=Infinity',"d.cards[0].effects=[{...SurvivorData.PARAMS,type:'knockback',trigger:'skill',slideSeconds:.3}]"])assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expression};return SurvivorData.validate(d).valid})()`),false);
near(run('(()=>{const d=SurvivorData.defaults();delete d.knockback.slideSeconds;return SurvivorData.validate(d).data.knockback.slideSeconds})()'),.2);
console.log('PASS: exact ease-out distance at five dt values, capped stacking, swept body/wall/arena stop, fog crossing, real barrier/arrow endpoint, hitstop/pause/reset, Maker migration/bounds');
