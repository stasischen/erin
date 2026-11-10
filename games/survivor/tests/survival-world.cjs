// First milestone: real Chrome natural upgrades and a 30-second transition passed first.
const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
function fresh(){const r=create();r(`startGame();state.enemies=[];state.spawnTimer=999;GAME_DATA.hitJuice.enabled=false;GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;state.player.damageDisabled=true`);return r;}
for(const [i,cap] of [18,28,40,52,64].entries()){
 const r=fresh();r(`state.stageElapsed=${i*30};SurvivorWaves.update();for(let i=0;i<100;i++)spawnEnemy({typeId:'jaben'})`);
 assert.equal(r('SurvivorWaves.limit()'),cap);assert.equal(r('state.enemies.length'),cap);
 assert.equal(r('state.enemies.some(targetVisible)'),false,'full-size enemies remain offscreen');
 r(`state.enemies=[];globalThis.heavy=spawnEnemy({typeId:'pudding'});globalThis.before=JSON.stringify([heavy.r,heavy.hp,heavy.speed,heavy.mass]);SurvivorWaves.decorate(heavy)`);
 assert.equal(r('JSON.stringify([heavy.r,heavy.hp,heavy.speed,heavy.mass])'),r('before'),'once-only scaling');
 assert.equal(r('targetVisible(heavy)'),false);assert.ok(r('heavy.mass>ENEMY_TYPES.find(e=>e.id==="pudding").mass'));
 assert.ok(r('heavy.weightStep<1'));assert.ok(r('heavy.r>=ENEMY_TYPES.find(e=>e.id==="pudding").radius'));
}
const caps=fresh();caps(`state.stageElapsed=90;for(let i=0;i<10;i++){spawnEnemy({typeId:'mushroom'});spawnEnemy({typeId:'donut'});spawnEnemy({typeId:'fairy'});spawnEnemy({typeId:'pop-candy'});}`);
assert.equal(caps("state.enemies.filter(e=>['shooter','charger'].includes(e.behavior)).length"),2);
assert.equal(caps("state.enemies.filter(e=>e.behavior==='support').length"),1);assert.equal(caps("state.enemies.filter(e=>e.behavior==='bomber').length"),2);
const cadence=fresh();cadence(`state.stageElapsed=120;SurvivorWaves.spawnBatch()`);assert.ok(cadence('state.enemies.length>1'));
assert.equal(cadence('SurvivorWaves.bossTime()'),150);cadence('state.stageElapsed=149;tick(.05)');assert.equal(cadence('!!state.boss'),false);cadence('state.stageElapsed=150;tick(.05)');assert.equal(cadence('!!state.boss'),true);
const legacy=create({maker:true});legacy('startGame();applyUpgrade(0)');assert.equal(legacy('SurvivorWaves.enabled()'),false);assert.equal(legacy('SurvivorWaves.limit()'),legacy('ENEMY_LIMIT'));assert.equal(legacy('SurvivorWaves.bossTime()'),legacy('gameSettings.waveSeconds'));
// Equal seed after eviction and world-wrap; waves never invalidate/repaint the base chunks.
const world=fresh();world(`globalThis.id=currentStage().id;globalThis.a=SurvivorEnvironment.chunk(id,0,0);globalThis.seed=a.seed;globalThis.columns=Math.ceil(state.worldWidth/336);globalThis.wrapped=SurvivorEnvironment.chunk(id,columns,0)`);
assert.equal(world('a===wrapped'),true);world(`for(let y=0;y<10;y++)for(let x=0;x<10;x++)SurvivorEnvironment.chunk(id,x,y)`);assert.ok(world('SurvivorEnvironment.cache.size<=32'));assert.equal(world('SurvivorEnvironment.chunk(id,0,0).seed'),world('seed'));
world(`globalThis.first=SurvivorEnvironment.chunk(id,0,0);state.stageElapsed=120;render()`);assert.equal(world('SurvivorEnvironment.chunk(id,0,0)===first'),true);
world(`globalThis.second=SurvivorEnvironment.chunk(STAGES[1].id,0,0)`);assert.notEqual(world('first.seed'),world('second.seed'));
const reset=fresh();reset('state.stageElapsed=90;SurvivorWaves.update();finishRun(true)');assert.equal(reset('state.survivalWave'),null);assert.equal(reset('SurvivorWaves.current().number'),1);
console.log('PASS: five wave caps, once-only health/mass, heavy offscreen spawn, bounded specials, batch/150s boss/legacy, deterministic bounded world chunks and stage reset');
