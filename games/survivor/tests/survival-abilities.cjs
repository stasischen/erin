// Browser natural acquisition/touch cast passed before these rule regressions.
const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
function fresh(){const r=create();r(`startGame();GAME_DATA.hitJuice.enabled=false;state.spawnTimer=999;state.player.damageDisabled=true;
 globalThis.book=(x,y=0)=>({typeId:'jaben',behavior:'still',x:state.player.x+x,y:state.player.y+y,r:8,hp:100000,maxHp:100000,alive:true,speed:0,damage:0,wobble:0,shotCooldown:999});
 state.enemies=[book(40),book(90),book(140),book(-70),book(0,60)];
 for(const school of ['water','wind','thunder'])UPGRADES.filter(c=>c.school===school&&c.tier!=='ultimate').slice(0,3).forEach(c=>state.upgrades[c.id]=1);`);return r;}
const seed=fresh(),all=JSON.parse(seed('JSON.stringify(SurvivorAbilityCatalog.all.map(c=>({id:c.id,kind:c.kind,ability:c.ability})))'));
assert.equal(all.length,15);assert.equal(all.filter(c=>c.ability==='secret').length,9);
for(const c of all)for(const lv of [1,3,5]){
 const r=fresh();r(`SurvivorAbilities.acquire('${c.id}');for(let i=1;i<${lv};i++)SurvivorAbilities.acquire('${c.id}');
 globalThis.hits=[];const original=hitBuildTarget;hitBuildTarget=(t,n,...args)=>{hits.push({i:state.enemies.indexOf(t),n});return original(t,n,...args)};
 state.player.health-=20;SurvivorAbilityActions.start('${c.id}',${lv});for(let i=0;i<110;i++)SurvivorAbilityActions.tick(.05);render();`);
 assert.equal(r(`SurvivorAbilities.level('${c.id}')`),lv);
 assert.ok(r('hits.every(h=>Number.isFinite(h.n)&&h.n>0)'),c.id+' finite damage');
 if(!['shield','garden','fortress','frenzy','clone'].includes(c.kind)||c.kind==='clone'&&lv>=3||c.kind==='fortress'&&lv>=5)assert.ok(r('hits.length>0'),c.id+' Lv'+lv+' actual damage');
 assert.ok(r('state.abilities.effects.length<=48'));assert.equal(r('state.mode'),'playing');
}
// Unlock counts distinct basics, never secret levels; exactly two secrets and one locked active.
const slots=fresh();slots(`state.upgrades={};const cards=UPGRADES.filter(c=>c.school==='water'&&c.tier!=='ultimate');state.upgrades[cards[0].id]=5;state.upgrades[cards[1].id]=5;state.upgrades['water-ultimate']=5`);
assert.equal(slots("SurvivorAbilities.eligible('water-ultimate')"),false);
slots(`state.upgrades[UPGRADES.filter(c=>c.school==='water'&&c.tier!=='ultimate')[2].id]=1`);
assert.equal(slots("SurvivorAbilities.acquire('water-ultimate')"),true);assert.equal(slots("SurvivorAbilities.acquire('secret-ice')"),true);assert.equal(slots("SurvivorAbilities.acquire('secret-jelly')"),false);
assert.equal(slots("SurvivorAbilities.acquire('active-tide')"),true);assert.equal(slots("SurvivorAbilities.acquire('active-ice')"),false);
slots("for(let i=0;i<5;i++)SurvivorAbilities.acquire('active-tide')");assert.equal(slots("SurvivorAbilities.level('active-tide')"),5);assert.equal(slots("SurvivorAbilities.choices().some(c=>c.ability==='active')"),false);
// Two missed screens guarantee next ability beside the weapon, even an all-weapon row. Reroll cannot farm it.
const offers=fresh();offers(`globalThis.cards=SurvivorLoadout.choices().slice(0,3);state.abilities.misses=0;SurvivorAbilities.guarantee(cards.slice(),[]);SurvivorAbilities.guarantee(cards.slice(),[]);globalThis.picked=SurvivorAbilities.guarantee(cards.slice(),[])`);
assert.equal(offers('picked.filter(c=>c.ability).length'),1);assert.ok(offers('picked.some(c=>c.weaponId)'));assert.equal(offers('new Set(picked.map(c=>c.id)).size'),3);
offers(`globalThis.rerolled=SurvivorAbilities.guarantee(cards.slice(),picked.map(c=>c.id))`);assert.equal(offers('state.abilities.misses'),0);assert.ok(offers('rerolled.some(c=>c.ability)'));assert.ok(offers('rerolled.some(c=>c.weaponId)'));
// Shield absorbs real received damage and breaks once; garden heals; Boss freeze is only slow.
const utility=fresh();utility(`SurvivorAbilityActions.start('secret-jelly',5);globalThis.before=state.abilities.shield.remaining;globalThis.left=absorbSchoolHit(before+5)`);assert.equal(utility('left'),5);assert.equal(utility('state.abilities.shield'),null);assert.equal(utility("state.abilities.effects.filter(e=>e.kind==='slow').length"),1);
utility(`SurvivorAbilityActions.start('secret-garden',5);state.player.health=50;SurvivorAbilityActions.tick(1);state.player.x+=200;SurvivorAbilityActions.tick(1)`);assert.equal(utility('state.player.health'),55);
const freeze=fresh();freeze(`state.boss={x:state.player.x+40,y:state.player.y,r:20,hp:100000,maxHp:100000,speed:0};SurvivorAbilityActions.start('active-ice',5)`);assert.ok(freeze('state.enemies[0].stunTimer>0'));assert.equal(freeze('state.boss.stunTimer||0'),0);assert.ok(freeze('state.boss.slowTimer>0'));
// No teleport, haste uses real cadence, clone attracts ordinary targets, magnet creates inward impulse.
const motion=fresh();motion(`globalThis.x=state.player.x;SurvivorAbilityActions.start('active-wind',5)`);assert.equal(motion('state.player.x'),motion('x'));assert.equal(motion('SurvivorAbilities.speed()'),1.35);
motion(`globalThis.interval=effectiveShotInterval();SurvivorAbilityActions.start('active-candy',1)`);assert.ok(motion('effectiveShotInterval()<interval'));
motion(`SurvivorAbilityActions.start('secret-clone',1)`);assert.equal(motion('SurvivorAbilities.lure(state.enemies[0])===state.player'),false);
const magnet=fresh();magnet(`SurvivorAbilityActions.start('secret-magnet',1);SurvivorAbilityActions.tick(.05)`);assert.ok(magnet('state.enemies.some(e=>e.slide)'), 'magnet creates actual movement');
// Waves can hit once outbound and once returning; overlap never multiplies an orbit pulse.
const wave=fresh();wave(`state.enemies=[book(140)];globalThis.n=0;hitBuildTarget=()=>n++;SurvivorAbilityActions.start('water-ultimate',5);for(let i=0;i<27;i++)SurvivorAbilityActions.tick(.05)`);assert.equal(wave('n'),2);
const orbit=fresh();orbit(`state.enemies=[book(0)];state.enemies[0].r=200;globalThis.n=0;hitBuildTarget=()=>n++;SurvivorAbilityActions.start('wind-ultimate',5);SurvivorAbilityActions.tick(.05)`);assert.equal(orbit('n'),1);
// Preserve selections and cooldown across stages, clear transient objects; restart returns to the base bomb.
const carry=fresh();carry(`SurvivorAbilities.acquire('active-tide');SurvivorAbilities.acquire('secret-ice');state.skillCooldown=4;SurvivorAbilityActions.start('secret-ice',1);finishRun(true)`);assert.equal(carry("SurvivorAbilities.level('active-tide')"),1);assert.equal(carry('state.skillCooldown'),4);assert.equal(carry('state.abilities.effects.length'),0);carry('startGame()');assert.equal(carry('state.abilities.active'),null);
// Legacy manual/author preview stays on the original path and Maker common settings actually scale new effects.
const legacy=create({maker:true});legacy('startGame();applyUpgrade(0)');assert.equal(legacy('SurvivorAbilities.enabled()'),false);
const tuning=fresh();tuning(`globalThis.before=SurvivorAbilities.settings('active-tide',1);gameSettings.bombDamage*=2;gameSettings.bombRadius*=2;gameSettings.bombCooldown*=2;globalThis.after=SurvivorAbilities.settings('active-tide',1)`);for(const key of ['damage','radius','cooldown'])assert.equal(tuning(`after.${key}/before.${key}`),2);
const pause=fresh();pause("SurvivorAbilities.acquire('active-tide');showOverlay('paused')");assert.ok(pause.elements.buildSlots.innerHTML.includes('潮汐爆破 Lv1'));assert.ok(!pause.elements.buildSlots.innerHTML.includes('技能</b> <span>尚未取得'));
console.log('PASS: 15 abilities Lv1/3/5, unlock/slots/locked branch/pity, real shield/heal/freeze/haste/lure/pull, unique waves/orbits, stage/reset and legacy/Maker settings');
