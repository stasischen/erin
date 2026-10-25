// 固定輸入 → 預期輸出；新流派規則與實際遊戲接合測試。
const assert=require('node:assert/strict'),fs=require('node:fs');
const run=require('./maker-support.cjs')();
const value=code=>JSON.parse(run(`JSON.stringify(${code})`));
function fresh(){run(`resetGame();state.mode='playing';settingsPanel.hidden=true;state.spawnTimer=999;state.shotTimer=999;state.elapsed=0;
 globalThis.book=(dx=65,dy=0,hp=10000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y+dy,r:17,speed:0,damage:10,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});state.enemies=[book()];`);}
function owns(ids){run(`state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,1]));`);}
function offer(id){return run(`canOffer(UPGRADES.find(c=>c.id===${JSON.stringify(id)}))`);}
function step(seconds){run(`for(let t=0;t<${seconds}-1e-8;t+=.05)tick(.05);`);}
// A run contains exactly 3 schools and 5 unique nonlegendary cards per school.
fresh();
for(let i=0;i<100;i++) {
 run('state.schoolRun=SurvivorSchools.createRun(GAME_DATA,Array.from({length:64},()=>Math.random()));');
 assert.equal(run('state.schoolRun.schools.length'),3);
 for(const school of ['water','wind','thunder']) assert.equal(run(`state.schoolRun.pool.filter(id=>UPGRADES.find(c=>c.id===id).school==='${school}').length`),5);
 assert.equal(run('new Set(state.schoolRun.pool).size'),15);
 assert.equal(run('state.schoolRun.pool.every(id=>{const c=UPGRADES.find(c=>c.id===id);return c.rarity!=="legendary"&&c.tier!=="ultimate"&&!c.schools})'),true);
}
run(`globalThis.d=SurvivorData.defaults();d.schools.push({id:'ice',spirit:'冰',form:'冰',attackCard:'ice-attack'});d.cards.push(...d.cards.filter(c=>c.school==='water'&&!c.schools).map(c=>({...c,id:c.id.replace('water','ice'),school:'ice'})));`);
const selected=new Set();for(let i=0;i<100;i++){const ids=value('SurvivorSchools.createRun(d,Array.from({length:64},()=>Math.random())).schools');assert.equal(ids.length,3);ids.forEach(id=>selected.add(id));}assert.equal(selected.size,4);
// Card order is unrestricted within the sampled pool; repeat levels do not count as different cards.
fresh();run('state.schoolRun.pool=UPGRADES.filter(c=>c.school&&c.rarity!=="legendary"&&c.tier!=="ultimate").map(c=>c.id);');
assert.equal(offer('water-skill'),true);assert.equal(offer('water-ultimate'),false);assert.equal(offer('fusion-puddle'),false);
owns(['water-attack']);run("state.upgrades['water-attack']=5;");assert.equal(run('transformed("water")'),false);
owns(['water-attack','water-skill','water-dash']);assert.equal(run('transformed("water")'),true);assert.equal(offer('water-ultimate'),false);
owns(['water-attack','water-skill','water-dash','water-drop','water-fountain']);assert.equal(offer('water-ultimate'),true);
owns(['water-attack','water-skill','thunder-skill']);assert.equal(offer('fusion-puddle'),false);
owns(['water-attack','water-skill','thunder-skill','thunder-step']);assert.equal(offer('fusion-puddle'),true);
// Growth events only occur at threshold crossings; equal counts favor the starter.
run(`globalThis.before={'water-attack':5,'water-skill':1};globalThis.after={...before,'water-dash':1};`);
assert.deepEqual(value('SurvivorSchools.growth(UPGRADES,before,after,GAME_DATA.schoolRules)'),[{type:'transformed',schoolId:'water'}]);
assert.deepEqual(value('SurvivorSchools.growth(UPGRADES,after,after,GAME_DATA.schoolRules)'),[]);
owns(['water-attack','wind-attack']);run("state.schoolRun.starter='wind'");assert.equal(run('buildAppearance().main'),'wind');
run("state.upgrades['fusion-storm']=1");assert.deepEqual(value('buildAppearance().colors'),['water','wind']);
// Exact weighted sampling, supplied draws, and no duplicates.
run(`globalThis.sample=[{id:'a',school:'water',rarity:'common'},{id:'b',school:'wind',rarity:'common'},{id:'c',school:'thunder',rarity:'rare'}];`);
assert.equal(run(`SurvivorSchools.pick(sample,{},null,GAME_DATA.schoolRules,[.5])[0].id`),'b');
assert.equal(run(`SurvivorSchools.pick(sample,{'water-attack':1},{starter:'water'},GAME_DATA.schoolRules,[.5])[0].id`),'a'); // starter preference changes the same supplied draw
assert.equal(run(`SurvivorSchools.pick(sample,{}, {starter:'water'},GAME_DATA.schoolRules,[.4])[0].id`),'a');
assert.equal(run(`new Set(SurvivorSchools.pick(sample,{},null,GAME_DATA.schoolRules,[0,0,0]).map(c=>c.id)).size`),3);
// Actual startup choice is paused; selection awards the matching attack and starts the run once.
run('startGame();');assert.equal(run('state.mode'),'levelup');assert.equal(run('state.pickingSpirit'),true);assert.equal(run('Object.keys(state.upgrades).length'),0);
run('globalThis.timeBefore=state.elapsed;tick(2);globalThis.choice=state.pendingChoices[0];globalThis.oldChoices=state.pendingChoices;applyUpgrade(0);');
assert.equal(run('state.elapsed===timeBefore'),true);assert.equal(run('state.mode'),'playing');assert.equal(run('state.upgrades[choice.id]'),1);assert.equal(run('state.schoolRun.starter===choice.school'),true);
run('applyUpgrade(1,oldChoices)');assert.equal(run('Object.keys(state.upgrades).length'),1);
// Legend appears only with a successful extra roll; ordinary/rare pool is fixed across rerolls.
fresh();run('Math.random=()=>.9;chooseUpgradeCards();');assert.equal(run('state.pendingChoices.some(c=>c.rarity==="legendary")'),false);
run('state.upgrades=Object.fromEntries(UPGRADES.filter(c=>c.rarity!=="legendary").map(c=>[c.id,5]));Math.random=()=>0;chooseUpgradeCards();');assert.equal(run('state.pendingChoices.some(c=>c.rarity==="legendary")'),true);
// Fifth volley, charge after ten kills, finite pool reuse.
fresh();owns(['water-drop']);run('for(let i=0;i<5;i++)fireAtNearest();');assert.equal(run('state.projectiles.filter(s=>s.push>0).length'),1);assert.equal(run('state.projectiles[4].r>state.projectiles[0].r'),true);
fresh();owns(['thunder-charge']);run('state.schoolCombat.kills=9;fireAtNearest();state.schoolCombat.kills=10;fireAtNearest();fireAtNearest();');assert.deepEqual(value('state.projectiles.map(s=>s.charged)'),[false,true,false]);
// Wet damage only while wet; one-hit shield covers enemy, custom and boss attack paths.
fresh();owns(['water-wet']);run('state.enemies[0].wetTimer=2;damageEnemy(state.enemies[0],100);');assert.equal(run('state.enemies[0].hp'),9885);
run('state.enemies[0].wetTimer=0;damageEnemy(state.enemies[0],100);');assert.equal(run('state.enemies[0].hp'),9785);
fresh();owns(['water-bubble']);run('activateDash();');step(.2);assert.equal(run('state.schoolCombat.bubble'),true);assert.equal(run('absorbSchoolHit(12)'),0);assert.equal(run('absorbSchoolHit(12)'),12);
fresh();owns(['wind-refund']);run('activateDash();');step(.15);assert.ok(run('state.dashCooldown')<.7);assert.equal(run('Number.isInteger(state.dashCharges)'),true);
// Independent timed fountains, wind push, rain, rod and stationary wall.
fresh();owns(['water-fountain','wind-gust']);run("state.schoolCombat.timers={'water-fountain':.01,'wind-gust':.01};globalThis.x=state.enemies[0].x;updateSchoolCombat(.05);");assert.ok(run('state.enemies[0].x>x'));assert.ok(run('state.enemies[0].wetTimer>0'));
fresh();owns(['water-rain']);run("state.enemies.push(book(1400));state.schoolCombat.timers['water-rain']=0;updateSchoolCombat(.05)");assert.ok(run('state.enemies.every(e=>e.slowTimer>0)'));assert.equal(run('state.enemies[1].hp'),10000);
fresh();owns(['thunder-rod']);run("state.schoolCombat.timers['thunder-rod']=0;updateSchoolCombat(.05)");assert.equal(run('state.schoolCombat.rods.length'),1);assert.equal(run('state.enemies[0].hp'),9975);
fresh();owns(['wind-eye']);step(1.1);assert.ok(run('schoolWindWall()'));run('state.keys.add("d");tick(.05);');assert.equal(run('!!schoolWindWall()'),false);
// Wind blade hits a second target; dash crossing stun; static retaliation.
fresh();owns(['wind-blade']);run('state.enemies=[book(45),book(90)];fireAtNearest();');step(.15);assert.ok(run('state.vfx.some(v=>v.kind==="gust")'));assert.ok(run('state.enemies[1].hp<10000'));
fresh();owns(['thunder-step']);run('state.enemies=[book(25)];activateDash();tick(.05);');assert.ok(run('state.enemies[0].stunTimer>0'));
fresh();owns(['thunder-static']);run("state.enemies=[book(20)];state.schoolCombat.timers['thunder-static']=0;updateSchoolCombat(.05)");assert.equal(run('state.enemies[0].hp'),9980);
// Superconductor chains twice with full damage; transformation extends thunder radius.
fresh();owns(['thunder-attack','thunder-super']);run('state.enemies=[book(40),book(90),book(140)];schoolEffect("thunder",state.enemies[0],state.enemies[0].x,state.enemies[0].y,100)');assert.deepEqual(value('state.enemies.map(e=>e.hp)'),[10000,9900,9900]);
fresh();owns(['wind-attack','wind-dash','wind-speed']);assert.equal(run('maxDashCharges()'),3);
// Independent ultimates can coexist; stage transition retains sampled pool and growth.
fresh();owns(['water-ultimate','thunder-ultimate']);run('state.ultimateTimers={water:0,thunder:0};updateUltimate(.05)');assert.equal(run('Object.keys(state.ultimateTimers).length'),2);
run('globalThis.pool=JSON.stringify(state.schoolRun);finishRun(true);');assert.equal(run('JSON.stringify(state.schoolRun)===pool'),true);
// Legacy Maker data is upgraded by id; names/stats survive; invalid ranges are rejected.
run(`d=SurvivorData.defaults();delete d.schoolRules;delete d.schools;d.cards=d.cards.slice(0,24);d.cards.forEach(c=>delete c.rarity);d.cards[10].requires=['water-attack'];d.cards[0].name='我的水球';d.tuning.playerSpeed=205;globalThis.m=SurvivorData.validate(d);`);
assert.equal(run('m.valid'),true);assert.equal(run('m.data.cards.length'),39);assert.equal(run('m.data.cards[0].name'),'我的水球');assert.equal(run('m.data.tuning.playerSpeed'),205);assert.equal(run('m.data.cards[10].requires.length'),0);
for(const expression of ['d.schoolRules.legendaryChance=NaN','d.schoolRules.bigDropEvery=1.5','d.schoolRules.rodDamage=999','d.cards[0].rarity="mythic"'])assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expression};return SurvivorData.validate(d).valid})()`),false,expression);
assert.equal(run('SurvivorData.validate(SurvivorData.defaults()).valid'),true);
// Fast dash cannot tunnel past a target; wrapped endpoints use the same shortest deltas.
fresh();owns(['thunder-step']);run('state.player.x=400;state.player.y=300;updateCamera();state.enemies=[book(30)];schoolDashCrossed(400,300,520,300);');assert.ok(run('state.enemies[0].stunTimer>0'));
assert.equal(run('SurvivorSchools.segmentDistance(30,0,120,0)'),0);assert.equal(run('SurvivorSchools.segmentDistance(30,50,120,0)'),50);
// A reused Maker projectile does not inherit big-drop/charged/gradient state.
fresh();run(`state.projectilePool.push({push:45,charged:true,blade:true,colors:['water','wind']});executeMakerEffect({type:'projectile',...SurvivorData.PARAMS},state.player.x,state.player.y,1);`);
assert.equal(run('state.projectiles[0].push'),0);assert.equal(run('state.projectiles[0].charged'),false);assert.equal(run('state.projectiles[0].blade'),false);
// Simultaneous ultimates keep separate visuals and both render.
fresh();owns(['water-ultimate','wind-ultimate','thunder-ultimate']);run('updateUltimate(.05);render();');assert.equal(run('Object.keys(state.ultimateVisuals).length'),3);

console.log('PASS: N-school sampling, fixed per-run pools, unordered cards, distinct thresholds/events, starter/weights/legend gate, 15 new mechanics, transformations/colors/fusion, multiple ultimates/stage retention, legacy Maker migration/bounds');
