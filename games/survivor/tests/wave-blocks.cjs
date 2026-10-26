const assert=require('node:assert/strict');
const createRun=require('./maker-support.cjs');
const legacy=require('./wave-blocks-legacy.json');
const run=createRun();
run('globalThis.raw=SurvivorData.defaults();globalThis.converted=SurvivorData.validate(raw)');
assert.equal(run('converted.valid'),true);
assert.equal(run('JSON.stringify(converted.data.waveBlocks)===JSON.stringify(SurvivorData.validate(converted.data).data.waveBlocks)'),true);
assert.equal(run('JSON.stringify(raw)===JSON.stringify(SurvivorData.defaults())'),true,'migration does not mutate input');
run('SurvivorData.save(raw)');
assert.equal(run('JSON.stringify(SurvivorData.load().data)===JSON.stringify(converted.data)'),true,'canonical save/load roundtrip');
// Fixed dt + seed → identical successful spawn types, positions, health, elites,
// both event queues, bear and boss, against frozen actual pre-migration runtime.
for(const stage of [0,1]) for(const seed of [47,904]) {
 const old=createRun(), modern=createRun();old(legacy.source);
 function trace(r,migrate) {
  return r(`(()=>{
    const raw=SurvivorData.defaults();raw.pacing.density=.8;raw.stages[${stage}].waves[1].every=2.1;
    raw.elites.interval=12;raw.elites.chance=.8;raw.chocobear.stageFraction=.4;
    Object.assign(GAME_DATA,${migrate?'SurvivorData.validate(raw).data':'raw'});
    globalThis.seed=${seed};Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    resetGame();state.stageIndex=${stage};state.mode='playing';state.player.damageDisabled=true;
    const spawns=[],original=spawnEnemy;
    spawnEnemy=function(options){const e=original(options);if(e)spawns.push([state.stageElapsed,e.typeId,e.x,e.y,e.hp,e.elite||null]);return e;};
    for(let i=0;i<2420;i++) {if(state.mode==='levelup')applyUpgrade(0);if(state.mode==='playing')tick(.05);}
    return JSON.stringify({spawns,events:state.pacing.eventIndex,queue:state.pacing.queue,bear:state.bearSpawned,boss:!!state.boss,seed});
  })()`);
 }
 assert.equal(trace(modern,true),trace(old,false),'stage '+stage+' seed '+seed);
}
// Reject unsafe/unknown/incomplete blocks and unsorted starts; accept old records without blocks.
for(const edit of [
 'd.waveBlocks.version=2','d.waveBlocks.moves.pop()', 'd.waveBlocks.moves[0].id="unknown"',
 'd.waveBlocks.moves[0].trigger.event="eval"','d.waveBlocks.moves[0].trigger.script="evil"',
 'd.waveBlocks.moves[0].timing.every=0','d.waveBlocks.moves[0].effect.count=1.5',
 'd.waveBlocks.moves[0].effect.count=11','d.waveBlocks.moves[0].effect.typeId="unknown"',
 'd.waveBlocks.moves[0].shape.position="player"','d.waveBlocks.moves[0].feedback.hint="yes"',
 'd.waveBlocks.moves[0].feedback.sound="unknown"','d.waveBlocks.moves[1].trigger.start=0',
 'd.waveBlocks.moves.find(m=>m.id==="events").trigger.second=20',
 'd.waveBlocks.moves.find(m=>m.id==="events").timing.eventSeconds=Infinity',
 'd.waveBlocks.moves.find(m=>m.id==="chocobear").effect.count=2',
 'd.waveBlocks.moves.find(m=>m.id==="elites").trigger.chance=2'
]) assert.equal(run(`(()=>{const d=SurvivorData.validate(SurvivorData.defaults()).data;${edit};return SurvivorData.validate(d).valid})()`),false,edit);
// Modified block → storage → actual Maker runtime. Spawn number, kind, side and cadence.
run(`globalThis.d=SurvivorData.validate(SurvivorData.defaults()).data;
 const m=d.waveBlocks.moves[0];m.effect.typeId='pudding';m.effect.count=3;m.shape.position='left';m.timing.every=3;
 d.waveBlocks.moves.find(m=>m.id==='elites').trigger.enabled=false;
 d.waveBlocks.moves.find(m=>m.id==='chocobear').trigger.enabled=false;
 d.waveBlocks.moves.find(m=>m.id==='events').trigger.first=10;
 SurvivorData.save(d);`);
const custom=createRun({maker:true,saved:run.storage});
custom(`resetGame();state.mode='playing';state.shotTimer=999;state.spawnTimer=0;tick(.05)`);
assert.equal(custom('state.enemies.length'),3);
assert.equal(custom('state.enemies.every(e=>e.typeId==="pudding" && !targetVisible(e))'),true);
assert.ok(custom('state.spawnTimer')>3);
assert.equal(custom('GAME_DATA.pacing.eventTimes[0]'),10);
custom('state.stageElapsed=10;updatePacing(0)');assert.equal(custom('state.pacing.eventIndex'),1);
custom('state.mode="paused";globalThis.before=JSON.stringify(state.pacing);tick(1)');assert.equal(custom('JSON.stringify(state.pacing)'),custom('before'));
custom('resetGame()');assert.equal(custom('state.pacing'),null);assert.equal(custom('state.bearSpawned'),false);
for(const [position,side] of [['left',0],['right',1],['top',2],['bottom',3]])assert.equal(custom(`SurvivorPacing.side('${position}')`),side);
console.log('PASS: wave stacks migration, canonical storage, four frozen 120s seeded legacy traces across both stages, strict bounds, custom runtime kinds/count/position/interval/events, pause/reset');
