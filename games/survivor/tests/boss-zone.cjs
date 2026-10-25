// 真正引擎的三階段縮圈、環狀幾何、傷害、Maker 與展示隔離。
const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
function fresh() { run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;summonTeacher();state.bossIntro=0;state.bossRest=999;`); }
function seconds(n) { for(let i=0;i<Math.round(n/.05);i++)run('updateBossZone(.05)'); }
fresh();
assert.equal(run('state.bossZone.x===state.player.x && state.bossZone.y===state.player.y'),true);
assert.equal(run('state.bossZone.radius'),1200);
run('updateBossZone(0)');
assert.equal(run('state.bossZone.warning'),4);
assert.equal(run('state.bossZone.target'),1000);
seconds(3);assert.equal(run('state.bossZone.radius'),1200,'full warning before movement');
seconds(1);assert.equal(run('state.bossZone.warning'),0);
seconds(1);assert.equal(run('state.bossZone.radius'),1160,'continuous 40 units per second');
seconds(4);assert.equal(run('state.bossZone.completed'),1);
seconds(8);assert.equal(run('state.bossZone.radius'),1000,'one shrink per phase');
run('state.boss.hp=state.boss.maxHp*.2;updateBoss(0);updateBossZone(0)');
assert.equal(run('state.bossPhase'),2);assert.equal(run('state.bossZone.warning'),4);
seconds(9);assert.equal(run('state.bossZone.completed'),2);
run('state.bossPhasePause=0;updateBoss(0);updateBossZone(0)');
assert.equal(run('state.bossPhase'),3);assert.equal(run('state.bossZone.warning'),4);
seconds(9);assert.equal(run('state.bossZone.completed'),3);
assert.equal(run('state.bossZone.radius*2'),1200,'minimum diameter = 1.5 screen widths');
// Same shape and damage in all four seams and the corner; center does not move with player.
for(const [cx,cy,px,py,out] of [[5,5,-15,5,false],[5,5,5,-15,false],[-5,-5,15,15,false],[5,5,-700,5,true],[5,5,5,-700,true]]) {
  run(`state.bossZone.x=wrapCoordinate(${cx},state.worldWidth);state.bossZone.y=wrapCoordinate(${cy},state.worldHeight);state.player.x=wrapCoordinate(${px},state.worldWidth);state.player.y=wrapCoordinate(${py},state.worldHeight);state.player.health=90;state.player.invincible=0;`);
  assert.equal(run('outsideBossZone()'),out);
  run('updateCamera();drawCalls.length=0;render();updateBossZone(.05)');
  assert.ok(Math.abs(run('state.player.health')-(out?89.9:90))<1e-8);
  assert.equal(run('drawCalls.some(c=>c[0]==="fill"&&c[1]==="evenodd")'),true,'fog uses holes across torus');
  assert.equal(run('!!bossZoneGuide()'),out);
  assert.equal(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number"||Number.isFinite(v)))'),true);
}
run('state.player.x=wrapCoordinate(state.bossZone.x+580,state.worldWidth);state.player.y=state.bossZone.y;');
assert.equal(run('!!bossZoneGuide()'),true,'guide before reaching edge');
assert.equal(run('bossZoneGuide().angle'),Math.PI,'arrow points inward');
// Damage is gradual; 1 second costs 2 hp. Dash invulnerability and demo damageDisabled still protect.
run('state.player.x=wrapCoordinate(state.bossZone.x+700,state.worldWidth);state.player.health=90;');seconds(1);
assert.ok(Math.abs(run('state.player.health')-88)<1e-8);
run('state.player.invincible=1;');seconds(1);assert.ok(Math.abs(run('state.player.health')-88)<1e-8);
run('state.player.invincible=0;state.player.damageDisabled=true;');seconds(1);assert.ok(Math.abs(run('state.player.health')-88)<1e-8);
run('state.player.damageDisabled=false;state.player.health=.05;updateBossZone(.05);');assert.equal(run('state.mode'),'over');assert.equal(run('state.bossZone'),null);
// Tick uses slow only outside the circle and pauses all zone clocks.
fresh();run('state.player.x+=1300;state.keys.add("d");globalThis.beforeX=state.player.x;tick(.05)');
assert.ok(Math.abs(run('deltaX(state.player.x,beforeX)')-run('PLAYER_SPEED*.8*.05'))<1e-8);
run('state.mode="paused";globalThis.zoneBefore=JSON.stringify(state.bossZone);globalThis.hpBefore=state.player.health;tick(.05)');
assert.equal(run('JSON.stringify(state.bossZone)===zoneBefore && state.player.health===hpBefore'),true);
run('state.mode="levelup";tick(.05)');assert.equal(run('JSON.stringify(state.bossZone)===zoneBefore'),true);
// Boss summons stay outside the camera even when the safe circle crosses a seam.
fresh();run('state.bossZone.x=5;state.bossZone.y=5;state.bossZone.radius=600;state.enemies=[];for(let i=0;i<40;i++)spawnEnemy();');
assert.equal(run('state.enemies.every(e=>!targetVisible(e) && e.x>=0 && e.x<state.worldWidth && e.y>=0 && e.y<state.worldHeight)'),true);
// Resize never reduces maneuvering room; restart/next stage never retains fog.
run('state.width=1600;updateBossZone(0)');assert.ok(run('state.bossZone.radius>=1200'));
run('finishRun(true)');assert.equal(run('state.bossZone'),null);run('resetGame()');assert.equal(run('state.bossZone'),null);
// Old works migrate, current works roundtrip, invalid / unsafe settings are rejected.
assert.equal(run('(()=>{const d=SurvivorData.defaults();delete d.bossZone;return SurvivorData.validate(d).data.bossZone.enabled})()'),true);
for(const change of ['enabled=1','steps=1.5','steps=4','speed=Infinity','speed=0','damage=5','damage=-1']) {
 assert.equal(run(`(()=>{const d=SurvivorData.defaults();d.bossZone.${change};return SurvivorData.validate(d).valid})()`),false,change);
}
run('globalThis.custom=SurvivorData.defaults();custom.bossZone={enabled:true,steps:1,speed:80,damage:3};SurvivorData.save(custom)');
const maker = createRun({maker:true,saved:run.storage});
maker('resetGame();state.mode="playing";summonTeacher();state.bossIntro=0;updateBossZone(0)');
assert.equal(maker('state.bossZone.target/state.bossZone.span'),.75);
assert.equal(maker('GAME_DATA.bossZone.speed'),80);assert.equal(maker('GAME_DATA.bossZone.damage'),3);
for(const config of ['custom.bossZone.enabled=false','custom.bossZone.steps=0']) {
 run(`custom=SurvivorData.defaults();${config};SurvivorData.save(custom)`);
 const r=createRun({maker:true,saved:run.storage});r('resetGame();state.mode="playing";summonTeacher();state.bossIntro=0;updateBossZone(0)');
 assert.equal(r('!!state.bossZone && state.bossZone.warning>0'),false);
}
const preview=createRun({preview:{data:JSON.parse(run('JSON.stringify(SurvivorData.defaults())')),spec:{kind:'move',id:'words'}}});
preview('resetGame();state.mode="playing";summonTeacher();');assert.equal(preview('state.bossZone'),null);
console.log('PASS: three phase warnings/shrinks/minimum diameter; torus fog/guide/damage; gradual death/dash protection; slow/pause/levelup; summons; resize/reset/stages; Maker migration/limits/custom/off; isolated preview');
