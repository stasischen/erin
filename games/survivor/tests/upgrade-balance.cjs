// New/owned offers, intended balance deltas, real event adapters and custom-work preservation.
const assert=require('node:assert/strict'), create=require('./maker-support.cjs');
const run=create(), json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run(`resetGame();globalThis.cards=[{id:'new-a',rarity:'common'},{id:'old-a',rarity:'common'},{id:'new-b',rarity:'rare'},{id:'old-b',rarity:'rare'}];`);
for(const draw of [0,.2,.6,.999]) {
 const chosen=json(`SurvivorSchools.pick(cards,{'old-a':1,'old-b':4},null,GAME_DATA.schoolRules,[${draw},${draw},${draw}])`);
 assert.ok(chosen[0].id.startsWith('new-'));assert.ok(chosen[1].id.startsWith('old-'));
 assert.equal(new Set(chosen.map(c=>c.id)).size,3);
}
for(const ids of [[],['new-a'],['old-a'],['new-a','new-b'],['old-a','old-b']]) {
 const chosen=json(`SurvivorSchools.pick(cards.filter(c=>${JSON.stringify(ids)}.includes(c.id)),{'old-a':1,'old-b':2},null,GAME_DATA.schoolRules,[.9,.9,.9])`);
 assert.equal(chosen.length,ids.length);assert.equal(new Set(chosen.map(c=>c.id)).size,ids.length);
}
// Eligibility precedes grouping: maxed and missing prerequisites stay excluded, including rerolls.
run(`Math.random=()=>.999;UPGRADES.forEach(c=>state.upgrades[c.id]=5);state.upgrades['big-water']=1;
 state.upgrades['rapid-water']=0;state.upgrades['onion-dash']=0;state.upgrades['gem-magnet']=0;
 UPGRADES.find(c=>c.id==='gem-magnet').requires=['water-rain'];state.upgrades['water-rain']=0;chooseUpgradeCards();`);
assert.deepEqual(new Set(json('state.pendingChoices.map(c=>c.id)')),new Set(['big-water','rapid-water','onion-dash']));
run(`rerollUpgradeCards()`);assert.equal(run('state.pendingChoices.every(canOffer)'),true);
// Ultimate was already exempt: exact prerequisite count still gates it when legend chance is zero.
const ultimate=create();ultimate(`resetGame();Math.random=()=>.999;GAME_DATA.schoolRules.legendaryChance=0;
 UPGRADES.forEach(c=>state.upgrades[c.id]=5);state.upgrades['water-ultimate']=0;chooseUpgradeCards();`);
assert.equal(ultimate('state.pendingChoices[0].id'),'water-ultimate');
const old=create();old(`globalThis.d=SurvivorData.defaults();d.tuning.playerHealth=61;d.tuning.fireRateReduction=.17;
 d.schoolRules.cardsPerSchool=3;d.neutralRules.itemsPerRun=2;d.neutralRules.crownHealth=7;d.cards[0].name='我的水球';globalThis.saved=SurvivorData.validate(d);`);
assert.equal(old('saved.valid'),true);
for(const field of ['tuning.playerHealth','tuning.fireRateReduction','schoolRules.cardsPerSchool','neutralRules.itemsPerRun','neutralRules.crownHealth','cards[0].name'])assert.equal(old('saved.data.'+field),old('d.'+field));
// Real auto-heal tick and neutral death event, at default/custom HP; heals remain clamped.
for(const hp of [40,61,90,200]) {
 const r=create();r(`resetGame();state.mode='playing';GAME_DATA.tuning.playerHealth=${hp};state.enemies=[];
 state.spawnTimer=999;state.shotTimer=999;state.bossSpawned=true;state.upgrades={'auto-heal':1};state.player.health=1;state.healTimer=10;tick(.01);`);
 assert.equal(r('state.player.health'),1+Math.ceil(hp/20));
 r(`state.upgrades={'item-cookie':1};state.player.health=1;state.neutral.kills=GAME_DATA.neutralRules.cookieKills-1;neutralEvent('death',0,0);`);
 assert.equal(r('state.player.health'),1+Math.ceil(hp/20));
 r(`state.player.health=maxPlayerHealth()-1;state.neutral.kills=GAME_DATA.neutralRules.cookieKills-1;neutralEvent('death',0,0);`);
 assert.equal(r('state.player.health'),r('maxPlayerHealth()'));
}
run(`state.upgrades={};globalThis.hp=maxPlayerHealth();state.upgrades['item-crown']=1;`);
assert.equal(run('hp-maxPlayerHealth()'),18);assert.equal(run('neutralDamageMultiplier()'),1.3);
for(const weapon of ['water-ball','candy-hammer','candy-sword']) {
 run(`state.weaponId='${weapon}';state.upgrades={};globalThis.base=effectiveShotInterval();state.upgrades['rapid-water']=5;`);
 assert.equal(run('effectiveShotInterval()'),run('base/2'));
}
console.log('PASS: mixed offers/fallbacks/eligibility, ultimate gate, saved custom values, actual auto-heal tick/cookie event/clamp, crown cost and three-weapon rapid-fire');
