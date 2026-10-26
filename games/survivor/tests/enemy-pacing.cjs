const assert=require('node:assert/strict');
const createRun=require('./maker-support.cjs');
const run=createRun();
function fresh() {run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;`);}
function enemy(id,x=100) {fresh();run(`globalThis.e=spawnEnemy({typeId:'${id}'});e.x=state.player.x+${x};e.y=state.player.y;e.actionCooldown=0;`);}
// 固定輸入→固定兩種額外怪與兩個不同事件，排除主題重複；前20秒保留單純追趕。
for(const stage of ['classroom','playground']) for(const sample of [0,.25,.5,.999]) {
  run(`globalThis.plan=SurvivorPacing.plan(GAME_DATA,'${stage}',[${sample},${sample},${sample},${sample}]);`);
  assert.equal(run('new Set(plan.types).size'),6);
  assert.equal(run('new Set(plan.events).size'),2);
  assert.equal(run(`GAME_DATA.pacing.themes['${stage}'].every(id=>plan.types.includes(id))`),true);
  assert.equal(run('JSON.stringify(SurvivorPacing.candidates(plan,0))'),'["jaben"]');
  assert.equal(run('SurvivorPacing.candidates(plan,110).length'),6);
}
assert.ok(run('SurvivorPacing.density(GAME_DATA.pacing,10)>SurvivorPacing.density(GAME_DATA.pacing,0)'));
fresh();run('state.stageElapsed=110;globalThis.ids=Array.from({length:30},()=>pacingType());');
assert.equal(run('ids.filter(id=>id==="jaben").length>=10'),true);
// 所有八種怪生成都在畫面外、環形世界接縫安全，受上限限制。
for(const id of ['jaben','otsubon','pudding','mushroom','donut','pop-candy','jelly','fairy']) {
  fresh();run(`state.player.x=2;state.player.y=state.worldHeight-2;updateCamera();globalThis.e=spawnEnemy({typeId:'${id}'});`);
  assert.equal(run('targetVisible(e)'),false,id);
  assert.equal(run('e.hp'),run(`ENEMY_TYPES.find(t=>t.id==='${id}').hp`));
}
fresh();run(`for(let i=0;i<60;i++)spawnEnemy({typeId:'jelly'})`);assert.equal(run('state.enemies.length'),run('ENEMY_LIMIT'));
// 射擊初次只有預警，0.9秒後才發射；畫面外取消，回來重新預告。
enemy('mushroom',200);run('state.level=2;e.shotCooldown=0;updateBookShooting(0)');
assert.equal(run('state.enemyShots.length'),0);assert.equal(run('e.shotWarning'),.9);
run('updateBookShooting(.89)');assert.equal(run('state.enemyShots.length'),0);
run('updateBookShooting(.011)');assert.equal(run('state.enemyShots.length'),1);
assert.equal(run('enemyDirection(e,200)'),-1);
run('state.bookShotTimer=0;e.shotCooldown=0;updateBookShooting(0);e.x=state.player.x+state.width;updateBookShooting(.9)');
assert.equal(run('e.shotPrepared'),false);assert.equal(run('state.enemyShots.length'),1);
run('e.x=state.player.x+200;updateBookShooting(0)');assert.equal(run('e.shotWarning'),.9);
// 衝撞固定方向、預警不移動；暈眩凍結，結束恢復一般追趕。
enemy('donut',160);run('updateEnemyBehavior(e,0);globalThis.old=e.x');
assert.equal(run('e.action.kind'),'charge');assert.equal(run('enemyDirection(e,160)'),0);
run('updateEnemyBehavior(e,.89)');assert.equal(run('e.x'),run('old'));
run('e.stunTimer=1;updateEnemyBehavior(e,1)');assert.ok(run('e.action.warning')>0);
run('e.stunTimer=0;updateEnemyBehavior(e,.02)');assert.ok(run('e.x')<run('old'));
run('updateEnemyBehavior(e,1)');assert.equal(run('e.action'),null);
// 自爆確實等兩秒，傷到怪物和主角；自爆本身不發擊敗獎勵；衝刺免傷。
enemy('pop-candy',45);run(`globalThis.other=spawnEnemy({typeId:'pudding'});other.x=e.x+5;other.y=e.y;globalThis.hp=other.hp;updateEnemyBehavior(e,0);updateEnemyBehavior(e,1.99)`);
assert.equal(run('e.alive'),true);assert.equal(run('state.player.health'),90);
run('updateEnemyBehavior(e,.011)');assert.equal(run('e.alive'),false);assert.equal(run('state.player.health'),72);assert.equal(run('other.hp'),run('hp-90'));
assert.equal(run('state.schoolCombat.kills'),0);
enemy('pop-candy',45);run('updateEnemyBehavior(e,0);state.dashTimer=.2;updateEnemyBehavior(e,2)');assert.equal(run('state.player.health'),90);
// 仙子預告後才加護盾；不疊加、有效期到就消失，走共用傷害入口。
enemy('fairy',160);run(`globalThis.other=spawnEnemy({typeId:'jaben'});other.x=e.x+10;other.y=e.y;updateEnemyBehavior(e,0)`);
assert.equal(run('other.fairyShield||0'),0);run('updateEnemyBehavior(e,.9)');assert.equal(run('other.fairyShield'),1);
run('globalThis.hp=other.hp;damageEnemy(other,30)');assert.equal(run('other.hp'),run('hp'));
run('damageEnemy(other,30)');assert.equal(run('other.hp'),run('hp-30'));
run('other.fairyShield=1;other.fairyShieldLife=1;updateEnemyBehavior(other,1)');assert.equal(run('other.fairyShield'),0);
// 果凍只分裂一次，恰好兩隻留在死亡位置，沒有無限遞迴。
enemy('jelly',110);run('globalThis.point={x:e.x,y:e.y};damageEnemy(e,9999);damageEnemy(e,9999);updateEncounters(0)');
assert.equal(run('state.enemies.filter(e=>e.alive).length'),2);
assert.equal(run('state.enemies.filter(e=>e.alive).every(e=>e.small && encounterDistance(e,point)<=10)'),true);
run('for(const child of state.enemies.slice())if(child.alive)damageEnemy(child,9999);updateEncounters(0)');assert.equal(run('state.jellyQueue.length'),0);assert.equal(run('state.enemies.filter(e=>e.alive).length'),0);
// 坦克擋住重疊怪物；弧線快跑有橫向分量。
enemy('pudding');run(`globalThis.other=spawnEnemy({typeId:'jaben'});other.x=e.x;other.y=e.y;separateTanks()`);
assert.ok(run('encounterDistance(e,other)>=e.r+other.r-.001'));
enemy('otsubon',180);run('e.wobble=1;globalThis.y=e.y;tick(.05)');assert.notEqual(run('e.y'),run('y'));
// 45/90各一次事件，先預告，進場遵守畫面外；暫停凍結，重開與換關重抽。
fresh();run('state.stageElapsed=44.99;updatePacing(0)');assert.equal(run('state.pacing.eventIndex'),0);
run('state.stageElapsed=45;updatePacing(0)');assert.equal(run('state.pacing.eventIndex'),1);assert.equal(run('state.enemies.length'),0);
run('updatePacing(.9);updatePacing(0)');assert.equal(run('state.enemies.length'),1);assert.equal(run('targetVisible(state.enemies[0])'),false);
run('state.mode="paused";globalThis.before=JSON.stringify(state.pacing);tick(5)');assert.equal(run('JSON.stringify(state.pacing)'),run('before'));
run('state.mode="playing";state.stageElapsed=90;updatePacing(0);updatePacing(0)');assert.equal(run('state.pacing.eventIndex'),2);
run('state.stageIndex=1;updatePacing(0)');assert.equal(run('state.pacing.stageId'),'playground');
run('resetGame()');assert.equal(run('state.pacing'),null);
// 舊雙怪物作品補齊，既有名稱數值保留；節奏參數與每關間隔存回再載入實際引擎。
run(`globalThis.d=SurvivorData.defaults();d.enemies=d.enemies.slice(0,2);d.enemies[0].hp=222;delete d.pacing;globalThis.r=SurvivorData.validate(d)`);
assert.equal(run('r.valid'),true);assert.equal(run('r.data.enemies.length'),8);assert.equal(run('r.data.enemies[0].hp'),222);
for(const change of ['d.pacing.density=Infinity','d.pacing.fuseSeconds=1','d.pacing.eventCount=2.5','d.pacing.warning=.1','d.pacing.shieldHits=30','d.stages[0].waves[0].every=0','d.enemies[2].behavior="script"']) {
 assert.equal(run(`(()=>{const d=SurvivorData.defaults();${change};return SurvivorData.validate(d).valid})()`),false,change);
}
run('d=SurvivorData.defaults();d.pacing.density=.5;d.stages[0].waves[0].every=3;d.enemies[2].speed=21;SurvivorData.save(d)');
const custom=createRun({maker:true,saved:run.storage});assert.equal(custom('GAME_DATA.pacing.density'),.5);assert.equal(custom('currentWaves()[0].every'),3);assert.equal(custom('spawnEnemy({typeId:"pudding"}).speed'),21);
fresh();run('state.stageElapsed=45;updatePacing(0);render()');assert.equal(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number"||Number.isFinite(v)))'),true);
console.log('PASS: eight behaviors, deterministic theme/extras/events/alternation, wrapped offscreen/caps, shooting warnings, charge/stun, 2s explosion/friendly fire/dash, timed shield, bounded nonrecursive split, tank separation/curved fast movement, 45/90 events/pause/reset/stage, schema migration/bounds/storage/custom runtime');
// 完整120秒真實更新，兩個事件、大熊、Boss時間軸與所有容器維持上限。
fresh();run(`GAME_DATA.elites.enabled=true;GAME_DATA.chocobear.enabled=true;state.player.damageDisabled=true;
 globalThis.seed=47;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<2420;i++) {
   if(state.mode==='levelup')applyUpgrade(0);
   if(state.mode==='playing')tick(.05);
   if(state.enemies.filter(e=>e.alive).length>ENEMY_LIMIT)throw Error('enemy cap');
 }
 render();`);
assert.equal(run('state.pacing.eventIndex'),2);assert.equal(run('state.bearSpawned'),true);assert.ok(run('state.boss'));
assert.ok(run('state.jellyQueue.length')<=18);assert.ok(run('state.pacing.queue.length')<=10);
console.log('PASS: seeded full 120s live run reaches both events, chocobear and boss within enemy/queue caps');
