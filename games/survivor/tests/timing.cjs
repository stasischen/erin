const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun();
const plain=expression=>JSON.parse(run(`JSON.stringify(${expression})`));
run('globalThis.cfg={windup:.1,active:.05,recovery:.3,cooldown:.2};globalThis.a=SurvivorTiming.start(cfg)');
assert.deepEqual(plain('a'),{phase:'windup',left:.1,entered:true});
const before=plain('a');
assert.equal(run('SurvivorTiming.advance(a,cfg,.09).phase'),'windup');
assert.deepEqual(plain('a'),before); // pure, input untouched
run('a=SurvivorTiming.advance(a,cfg,.1)');assert.equal(run('a.phase'),'active');assert.equal(run('a.entered'),true);
assert.equal(run('SurvivorTiming.advance(a,cfg,.01).entered'),false);
run('a=SurvivorTiming.advance(a,cfg,99)');assert.equal(run('a.phase'),'recovery'); // no skipped stages
run('a=SurvivorTiming.cancelRecovery(a,cfg)');assert.equal(run('a.phase'),'cooldown');assert.equal(run('a.left'),.2);
assert.deepEqual(plain('SurvivorTiming.cancelRecovery(a,cfg)'),plain('a'));
assert.deepEqual(plain('SurvivorTiming.segments(cfg).map(s=>s.seconds)'),[.1,.05,.3,.2]);
// Migration preserves every old enemy duration, custom values and unrelated content.
run(`globalThis.old=SurvivorData.defaults();old.enemies[2].phaseAttack.windup=1.45;
old.weapons.forEach(w=>delete w.timing);globalThis.migrated=SurvivorData.validate(old)`);
assert.equal(run('migrated.valid'),true);assert.equal(run('migrated.data.enemies[2].phaseAttack.timing.windup'),1.45);
assert.equal(run('migrated.data.weapons[0].timing.windup'),.1);
for(const edit of ['d.weapons[0].timing.windup=-1','d.weapons[0].timing.active=Infinity','d.weapons[0].timing=null','d.enemies[2].phaseAttack.timing={windup:.1,active:1,recovery:1,cooldown:1}']) {
 assert.equal(run(`(()=>{const d=SurvivorData.defaults();${edit};return SurvivorData.validate(d).valid})()`),false,edit);
}
run('migrated.data.enemies[2].phaseAttack.timing.windup=1.7;SurvivorData.save(migrated.data)');
const saved=createRun({maker:true,saved:run.storage});assert.equal(saved('ENEMY_TYPES[2].phaseAttack.windup'),1.7);
assert.equal(saved('ENEMY_TYPES[2].phaseAttack.timing.windup'),1.7);
function fresh(id='candy-sword') {run(`resetGame();GAME_DATA.attackMode='manual';state.mode='playing';state.weaponId='${id}';state.enemies=[];state.spawnTimer=999;state.player.damageDisabled=true;activeWeapon().timing={...cfg};`);}
function release(){run('beginManualAttack("attack");releaseManualAttack("attack")');}
for(const id of ['water-ball','candy-sword','candy-hammer']) {
 fresh(id); release();
 assert.equal(run('state.swingCount+state.projectiles.length'),0);
 run('tickManualAttack(.09)');assert.equal(run('state.swingCount+state.projectiles.length'),0);
 run('tickManualAttack(.01)');
 const count=run('state.swingCount+state.projectiles.length');assert.ok(count>0);
 release();run('tickManualAttack(.01)');assert.equal(run('state.swingCount+state.projectiles.length'),count);
 run('tickManualAttack(.04)');assert.equal(run('state.manualTiming.phase'),'recovery');
 run('activateDash()');assert.equal(run('state.manualTiming.phase'),'cooldown');assert.equal(run('state.manualTiming.left'),.2);
 release();assert.equal(run('state.swingCount+state.projectiles.length'),count);
 run('tickManualAttack(.2)');assert.equal(run('state.manualTiming.phase'),'ready');
 run('resetGame()');assert.equal(run('state.manualTiming'),null);
}
// Zero cooldown permits the next dash attack; dash during windup does not cancel it.
fresh();run('activeWeapon().timing.cooldown=0');release();run('activateDash()');assert.equal(run('state.manualTiming.phase'),'windup');
run('tickManualAttack(.1);tickManualAttack(.05);state.dashTimer=0;state.dashCharges=1;activateDash()');assert.equal(run('state.manualTiming.phase'),'ready');
release();assert.equal(run('state.manualTiming.phase'),'windup');
// Real pause freezes a pending attack; resume fires once, reset discards pending work.
fresh();release();run('state.mode="paused";tick(.5)');assert.equal(run('state.manualTiming.left'),.1);
run('state.mode="playing";tickManualAttack(.1)');assert.equal(run('state.swingCount'),1);
fresh();release();run('resetGame();state.mode="playing";tickManualAttack(.5)');assert.equal(run('state.swingCount'),0);
// Automatic attacks ignore the manual timing block entirely.
fresh();run('GAME_DATA.attackMode="auto";fireAtNearest({angle:0});tickManualAttack(.5)');assert.equal(run('state.swingCount'),1);assert.equal(run('state.manualTiming'),null);
console.log('PASS: pure four-stage timing, once-only entry, long dt, recovery cancel/cooldown, timeline data, legacy migration/bounds/save-load, all three manual weapons, dash/pause/reset and automatic isolation');
