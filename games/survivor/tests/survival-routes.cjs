// Real Chrome route selection, natural upgrades and actual boss stage transitions passed first.
const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
for(const [route,themes] of [['forest',['candy-forest','cookie-forest']],['coast',['soda-coast','icecream-snow']],['garden',['jam-garden','caramel-lava']]]){
 const r=create(),saved=JSON.stringify(r.storage);
 r(`document.getElementById('survivalRoute').value='${route}';startGame()`);
 assert.equal(r('state.survivalRoute'),route);assert.equal(r('SurvivorRoutes.theme().id'),themes[0]);
 r('finishRun(true)');assert.equal(r('state.survivalRoute'),route);assert.equal(r('SurvivorRoutes.theme().id'),themes[1]);assert.equal(JSON.stringify(r.storage),saved,'route does not create persistent settings');
 r(`showOverlay('over');document.getElementById('survivalRoute').value='forest';startGame()`);assert.equal(r('state.stageIndex'),0);assert.equal(r('state.survivalRoute'),'forest');
}
const legacy=create({maker:true});legacy(`document.getElementById('survivalRoute').value='garden';showOverlay('ready');startGame();applyUpgrade(0)`);assert.equal(legacy('state.survivalRoute'),'forest');assert.equal(legacy('document.getElementById("survivalRoutePicker").hidden'),true);
const trial=create();trial(`startTrial(trialSettings().bosses[0].id,'water-ball');showOverlay('paused')`);assert.equal(trial('document.getElementById("survivalRoutePicker").hidden'),true);
const r=create();r('startGame();GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false');
// Every theme has its own deterministic cache identity, including after eviction/wrap.
const signatures=[];
for(const route of ['forest','coast','garden'])for(const stage of [0,1]){
 r(`state.survivalRoute='${route}';state.stageIndex=${stage};globalThis.tile=SurvivorEnvironment.chunk(currentStage().id,0,0)`);
 signatures.push(r('tile.themeId+":"+tile.seed'));
 assert.equal(r('SurvivorEnvironment.chunk(currentStage().id,Math.ceil(state.worldWidth/336),0)===tile'),true);
}
assert.equal(new Set(signatures).size,6);
// Formation changes redistribute exactly the current batch, never exceed two sides or bypass type eligibility.
const seen=new Set();
for(const time of [0,10,30,70,90]){
 r(`state.stageElapsed=${time};state.enemies=[];state.survivalWave=null;globalThis.calls=[];globalThis.spawnOriginal=spawnEnemy;spawnEnemy=(options)=>{calls.push(options);return spawnOriginal(options)};SurvivorWaves.spawnBatch();spawnEnemy=spawnOriginal`);
 seen.add(r('SurvivorWaves.formation().id'));
 assert.equal(r('calls.length'),r('SurvivorWaves.current().batch'));assert.ok(r('new Set(calls.map(c=>c.side)).size<=2'));
 assert.ok(r('calls.every(c=>c.along>=0&&c.along<=1&&SurvivorWaves.current().types.includes(c.typeId))'));
 assert.equal(r('state.enemies.some(targetVisible)'),false);assert.ok(r('state.enemies.every(e=>Math.hypot(deltaX(e.x,state.player.x),deltaY(e.y,state.player.y))>=state.player.r+e.r+160)'));
 if(time===90)assert.equal(r('calls[0].typeId'),'pudding');
}
assert.equal(seen.size,5);
r(`state.stageElapsed=10;state.survivalWave=null;state.enemies=[];globalThis.sides=[];const spawn=spawnEnemy;spawnEnemy=o=>{sides.push(o.side);return spawn(o)};SurvivorWaves.spawnBatch();SurvivorWaves.spawnBatch();spawnEnemy=spawn`);
assert.equal(r('sides.length'),2);assert.notEqual(r('sides[0]'),r('sides[1]'));
// Along-edge clamping is safe even near both world seams, for a full-sized heavy body.
for(const side of [0,1,2,3])for(const along of [-2,0,.5,1,3]){
 r(`state.player.x=2;state.player.y=2;updateCamera();globalThis.p=offscreenSpawn(38,${side},undefined,${along})`);
 assert.ok(r('p'));assert.equal(r('targetVisible({...p,r:38})'),false);assert.ok(r('Math.hypot(deltaX(p.x,state.player.x),deltaY(p.y,state.player.y))>=state.player.r+38+160'));
}
console.log('PASS: three routes/two stages/reselection/no persistence, legacy/trial isolation, six cache identities, five formations without extra spawns, single wings alternate, safe along/wrap');
