// 執行：node games/survivor/tests/maker-data.cjs
const assert=require('node:assert/strict'), fs=require('node:fs');
const createRun=require('./maker-support.cjs'), traces=require('./maker-traces.cjs');
const baseline=require('./maker-baseline.json');
assert.deepEqual(traces(createRun()),baseline,'預設玩法必須符合重構前 153 組固定亂數快照');
// Maker 的預設作品也必須重現普通模式，不能被舊設定污染。
assert.deepEqual(traces(createRun({maker:true,saved:{'erin-survivor-settings-v3':JSON.stringify({playerHealth:200,enemySpeed:130})}})),baseline);
const run=createRun();
assert.equal(run('SurvivorData.validate(SurvivorData.defaults()).valid'),true);
const invalid = [
  'd.cards[0].name="<img src=x onerror=alert(1)>"', 'd.cards[0].requires=["missing"]',
  'd.cards[0].requires=[d.cards[1].id];d.cards[1].requires=[d.cards[0].id]',
  'd.cards[0].effects[0].power=999','d.cards[0].effects[0].type="eval"','d.cards[0].maxLevel=1.5',
  'd.enemies[0].attack.count=999','d.enemies[0].speed=Infinity','d.enemies[0].attack.type="script"',
  'd.boss.moves[0].warning=0','d.boss.phases[2].threshold=.9', 'd.boss.moves[0].kind="bad"',
  'd.waves[0].every=0','d.tuning.projectileLimit=100000','d.build.fieldLimit=99','d.bossTuning.hazardLimit=99',
  'd.cards[0].effects=[{type:"aoe",trigger:"hit",...SurvivorData.PARAMS,damage:-1}]',
  'd.schemaVersion=2','d.cards=null','d.boss=null'
];
for(const change of invalid) assert.equal(run(`(()=>{const d=SurvivorData.defaults();${change};return SurvivorData.validate(d).valid})()`),false,change);
run('globalThis.d=SurvivorData.defaults();d.cards[0].name="我的水球";d.build.water.name="我的水流";d.enemies[0].hp=222;d.boss.name="教室魔王";');
assert.equal(run('SurvivorData.save(d).valid'),true);
assert.equal(run('JSON.stringify(SurvivorData.load().data)===JSON.stringify(SurvivorData.validate(d).data)'),true);
assert.equal(createRun({saved:{'erin-survivor-maker-v1':'broken'}})('SurvivorData.load().valid'),false);
assert.equal(createRun({saved:{'erin-survivor-maker-v1':'x'.repeat(150001)}})('SurvivorData.load().valid'),false);
assert.equal(createRun({storageFails:true})('SurvivorData.save(SurvivorData.defaults()).valid'),false);
// Save custom recipes, load through the actual ?maker=1 route, and exercise every primitive.
function custom(mutate){
  run(`d=SurvivorData.defaults();${mutate};if(!SurvivorData.save(d).valid)throw Error(SurvivorData.save(d).errors);`);
  return createRun({maker:true,saved:{...run.storage,'erin-survivor-best-seconds-v1':'99'}});
}
function fresh(r){r(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;
  state.enemies=[50,90,130].map(offset=>({typeId:'jaben',x:state.player.x+offset,y:state.player.y,r:17,speed:0,damage:0,hp:10000,maxHp:10000,wobble:0,alive:true,flash:0,shotCooldown:0}));
  state.upgrades['big-water']=2;`);}
for(const type of ['projectile','aoe','chain','dash-trail','slow','stun','knockback','summon','ring-with-gap']){
  const r=custom(`d.cards[0].effects=[{type:'${type}',trigger:'skill',...SurvivorData.PARAMS,radius:160,damage:23,count:2}];`);fresh(r);
  r('triggerMakerEffects("skill",state.player.x,state.player.y);render();');
  assert.equal(r('Object.values(state.makerTimers).filter(t=>t>0).length'),1,type);
  if(type==='projectile') {assert.equal(r('state.projectiles.length'),2);assert.equal(r('state.projectiles[0].damage'),46);}
  if(type==='aoe') assert.equal(r('state.enemies[0].hp'),9954);
  if(type==='chain') assert.equal(r('state.enemies.filter(e=>e.hp<10000).length'),2);
  if(type==='slow') {assert.equal(r('state.enemies[0].slowTimer'),1);assert.equal(r('state.enemies[0].makerSlow'),.55);}
  if(type==='stun') assert.equal(r('state.enemies[0].stunTimer'),1);
  if(type==='knockback') assert.equal(r('state.enemies[0].x-state.player.x'),90);
  if(type==='ring-with-gap') {assert.equal(r('state.enemies.filter(e=>e.hp<10000).length'),0);r('state.enemies[0].x=state.player.x-140;state.makerTimers={};triggerMakerEffects("skill",state.player.x,state.player.y);');assert.equal(r('state.enemies[0].hp'),9954);}
  if(type==='dash-trail'||type==='summon') {assert.equal(r('state.makerFields.length'),1);r('updateMakerEffects(.05);');assert.ok(r(type==='summon'?'state.projectiles.length===2':'state.enemies[0].hp<10000'));}
  r('globalThis.before=JSON.stringify(state);state.mode="paused";tick(1);'); assert.equal(r('state.makerFields.every(f=>f.life>0)'),true);
  r('resetGame();');assert.equal(r('state.makerFields.length+state.enemyHazards.length'),0);
  assert.equal(r('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number"||Number.isFinite(v)))'),true);
}
let r=custom('d.cards[0].effects=[{type:"projectile",feature:"multi-water",power:2},{type:"chain",feature:"thunder-attack",power:1}];d.cards[0].maxLevel=2;d.cards[0].name="新組合";');fresh(r);
r('fireAtNearest();');assert.equal(r('state.projectiles.length'),5);assert.equal(r('state.projectiles[0].schools.includes("thunder")'),true);assert.equal(r('canOffer(UPGRADES[0])'),false);
r('finishRun(false);');assert.equal(r.storage['erin-survivor-best-seconds-v1'],'99');
r=custom('d.enemies[0].name="新怪物";d.enemies[0].hp=222;d.enemies[0].radius=25;d.enemies[0].behavior="still";d.enemies[0].attack.type="aoe";d.enemies[0].attack.level=2;');fresh(r);r('state.enemies=[];spawnEnemy();state.level=2;state.enemies[0].x=state.player.x+100;state.enemies[0].y=state.player.y;state.enemies[0].shotCooldown=0;');
assert.equal(r('state.enemies[0].hp'),222);assert.equal(r('state.enemies[0].r'),25);
r('updateBookShooting(0);');assert.equal(r('state.enemyHazards.length'),1);assert.equal(r('state.player.health'),90);r('updateMakerEffects(.85);');assert.equal(r('state.player.health'),90);r('updateMakerEffects(.05);');assert.equal(r('state.player.health'),84);
for(const attack of ['none','projectile','summon']){
  r=custom(`d.enemies[0].attack.type='${attack}';d.enemies[0].attack.level=2;d.enemies[0].attack.count=3;`);fresh(r);r('state.level=2;state.enemies=state.enemies.slice(0,1);updateBookShooting(0);');
  assert.equal(r('state.enemyShots.length'),attack==='projectile'?3:0,attack);if(attack==='summon')assert.equal(r('state.enemies.length'),4);
}
r=custom('d.boss.moves[0].kind="call";d.boss.moves[0].warning=1.5;d.boss.moves[0].damage=25;d.boss.moves[0].radius=80;d.boss.moves[0].minPhase=2;d.boss.phases[1].threshold=.8;');fresh(r);
r('state.boss={x:state.player.x-120,y:state.player.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};state.bossRest=999;beginBossMove("words");');assert.equal(r('state.bossMoves.length'),0);
r('state.boss.hp=1500;updateBoss(0);');assert.equal(r('state.bossPhase'),2);r('state.bossPhasePause=0;beginBossMove("words");');assert.equal(r('state.bossMoves[0].kind'), 'call');assert.equal(r('state.bossMoves[0].warning'),1.5);assert.equal(r('state.bossMoves[0].radius'),80);
for(let i=0;i<31;i++)r('updateBoss(.05);');assert.equal(r('state.player.health'),65);assert.equal(r('state.enemyShots.length'),0);
// PWA all precached paths exist, including the complete Maker and both data scripts.
const sw=fs.readFileSync(`${__dirname}/../../../sw.js`,'utf8');
for(const path of ['data/defaults.js','data/schema.js','maker/','maker/index.html','maker/style.css','maker/maker.js']) assert.ok(sw.includes(`games/survivor/${path}`));
console.log('PASS: 153 original traces in normal and Maker modes; schema/limits/cycles/injection; storage roundtrip/failure; all nine primitives; remapped recipes; custom enemy attacks; boss kind/warning/phase/damage; records isolation; PWA entries');
