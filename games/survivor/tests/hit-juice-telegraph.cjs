// 固定設定／操作／dt → 命中事件、凍結與追擊；可於其他引擎重建。
const assert=require('node:assert/strict'),fs=require('node:fs'),createRun=require('./maker-support.cjs');
const run=createRun();
run(`resetGame();state.mode='playing';state.weaponId='candy-sword';state.spawnTimer=999;state.shotTimer=999;
globalThis.e=spawnEnemy({typeId:'jaben'});e.x=state.player.x+45;e.y=state.player.y;e.hp=e.maxHp=10000;e.speed=0;
fireAtNearest();globalThis.damage=e.maxHp-e.hp;`);
assert.ok(run('damage>0'));assert.equal(run('state.hitStop'),.05);assert.equal(run('e.impactFlash'),1);
run('globalThis.time=state.elapsed;globalThis.hp=e.hp;tick(.025)');
assert.equal(run('state.elapsed'),run('time'));assert.equal(run('e.hp'),run('hp'));
assert.equal(run('state.hitStop'),.025);
run('state.mode="paused";tick(.02)');assert.equal(run('state.hitStop'),.025);
run('state.mode="playing";render()');assert.equal(run('e.impactFlash'),0);
run('tick(.025);tick(.01)');assert.ok(run('state.elapsed>time'));
run('meleeImpact(e,{heavy:true})');assert.ok(Math.abs(run('state.hitStop')-.075)<1e-9);assert.equal(run('state.hitShakePixels'),3);
run('GAME_DATA.hitJuice.enabled=false;state.hitStop=0;state.hitShake=0;meleeImpact(e,{heavy:true})');assert.equal(run('state.hitStop'),0);
run('GAME_DATA.hitJuice.enabled=true;GAME_DATA.hitJuice.intensity=0;meleeImpact(e,{heavy:true})');assert.equal(run('state.hitStop'),0);
run('GAME_DATA.hitJuice.intensity=2;for(let i=0;i<300;i++)meleeImpact(e,{heavy:true})');assert.ok(run('state.effects.length')<=90);
run('resetGame()');assert.equal(run('state.hitStop+state.hitShake'),0);
// 舊作品補預設；開關／強度能儲存，無效資料不能進引擎。
run('globalThis.d=SurvivorData.defaults();delete d.hitJuice;globalThis.r=SurvivorData.validate(d)');assert.equal(run('r.valid'),true);assert.equal(run('r.data.hitJuice.intensity'),1);
run('d.hitJuice={enabled:false,intensity:1.7};r=SurvivorData.validate(d)');assert.equal(run('r.data.hitJuice.enabled'),false);assert.equal(run('r.data.hitJuice.intensity'),1.7);
run('d.hitJuice.intensity=3');assert.equal(run('SurvivorData.validate(d).valid'),false);
run('d.hitJuice={enabled:"yes",intensity:1}');assert.equal(run('SurvivorData.validate(d).valid'),false);
// 「試這隻」與選單共用實際練習引擎：每個敵人待機時都追近，不再原地重置。
const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
const practice=createRun({preview:{data,spec:{kind:'card',id:'big-water'}}});
practice(fs.readFileSync(`${__dirname}/../practice-rules.js`,'utf8'));
practice(fs.readFileSync(`${__dirname}/../practice-engine.js`,'utf8'));
for(const id of data.enemies.map(e=>e.id)) {
 practice(`practiceId=${JSON.stringify(id)};practiceReset();practiceEnemy.speed=60;practiceEnemy.x=practiceHome.x+250;practiceEnemy.y=practiceHome.y;practiceEnemy.action=null;practiceEnemy.phaseAttack={phase:'ready'};globalThis.before=practiceEnemy.x;practiceStep(.05)`);
 assert.ok(practice('practiceEnemy.x<before'),id+' pursues');
 if(practice('practiceConfig.enabled')) {
  practice('globalThis.before=practiceEnemy.x;practiceStartRound()');assert.equal(practice('practiceEnemy.x'),practice('before'),id+' no teleport');
 }
}
console.log('PASS: melee damage/one-render white flash, real-time hit stop/pause/reset, heavy/off/zero/caps, schema migration/bounds, every trial enemy pursues without teleport');

// 同一預警剩餘 1s：windup 2s → 半徑 50；改成 4s → 半徑 75；出招 → 100。
run(`resetGame();state.mode='playing';globalThis.warningEnemy=spawnEnemy({typeId:'pudding'});
warningEnemy.phaseAttack={phase:'windup',left:1,x:warningEnemy.x,y:warningEnemy.y,angle:0,config:{shape:'circle',radius:100,windup:2}};
drawCalls.length=0;drawPhasedAttacks()`);
assert.deepEqual(Array.from(run('drawCalls.filter(c=>c[0]==="arc").map(c=>c[3])')),[100,50]);
run('warningEnemy.phaseAttack.config.windup=4;drawCalls.length=0;drawPhasedAttacks()');
assert.deepEqual(Array.from(run('drawCalls.filter(c=>c[0]==="arc").map(c=>c[3])')),[100,75]);
run('warningEnemy.phaseAttack.phase="active";drawCalls.length=0;drawPhasedAttacks()');
assert.deepEqual(Array.from(run('drawCalls.filter(c=>c[0]==="arc").map(c=>c[3])')),[100,100]);
console.log('PASS: ground fill uses live windup seconds and reaches full radius on active phase');
