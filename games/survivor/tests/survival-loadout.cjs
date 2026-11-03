// Focused real-engine diagnostics. Browser E2E validates the same routes through player UI first.
const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
function fresh(){const run=create();run(`startGame();GAME_DATA.hitJuice.enabled=false;state.player.damageDisabled=true;state.spawnTimer=999;
 globalThis.book=(dx,dy=0)=>({typeId:'jaben',behavior:'still',x:state.player.x+dx,y:state.player.y+dy,r:8,hp:100000,maxHp:100000,alive:true,speed:0,damage:0,wobble:0,shotCooldown:999});
 state.enemies=[book(35),book(60),book(100),book(140),book(-50),book(0,60)];`);return run;}
const seed=fresh(),ids=JSON.parse(seed('JSON.stringify(SurvivorWeaponCatalog.all.map(w=>w.id))'));
assert.equal(ids.length,12);assert.equal(seed('state.pickingWeapon'),false);assert.equal(seed('state.loadout.length'),1);assert.equal(seed('state.loadout[0].weaponId'),'water-ball');
for(const id of ids)for(const level of [1,3,5]){
 const run=fresh();run(`state.loadout=[];SurvivorLoadout.acquire('${id}');state.loadout[0].level=${level};globalThis.received=[];const original=hitBuildTarget;hitBuildTarget=(target,n,...rest)=>{received.push(n);return original(target,n,...rest)};
 for(let i=0;i<70;i++)tick(.05);render();`);
 assert.ok(run('state.enemies.some(e=>e.hp<100000)'),`${id} Lv${level} real damage`);
 assert.ok(run('received.every(n=>Number.isFinite(n)&&n>0)'),`${id} finite damage`);
 assert.equal(run('state.mode'),'playing');assert.equal(run('state.weaponId'),'water-ball','context restores primary appearance');
 assert.ok(run('state.weaponEffects.length<=48'));assert.ok(run('drawCalls.length>0'));
}
// Guarantee one legal weapon on offers/rerolls, prevent a fourth slot and remove max-level upgrades.
const offer=fresh();offer('SurvivorLoadout.acquire("candy-hammer");SurvivorLoadout.acquire("ice-spikes");SurvivorLoadout.acquire("honey-bees")');assert.equal(offer('state.loadout.length'),3);
for(let i=0;i<6;i++){offer('chooseUpgradeCards()');assert.equal(offer('state.pendingChoices.some(c=>c.weaponId)'),true);assert.equal(offer('state.pendingChoices.filter(c=>c.weaponId).every(c=>!!SurvivorLoadout.owned(c.id))'),true);assert.equal(offer('new Set(state.pendingChoices.map(c=>c.id)).size'),offer('state.pendingChoices.length'));}
offer('state.loadout.forEach(w=>w.level=5);chooseUpgradeCards()');assert.equal(offer('state.pendingChoices.some(c=>c.weaponId)'),false);
// Real confirmation changes only the chosen slot and never persists loadout.
const confirm=fresh();confirm("state.pendingChoices=[SurvivorLoadout.choices().find(c=>c.id==='candy-hammer')];showUpgradeChoices();applyUpgrade(0)");assert.equal(confirm('SurvivorLoadout.owned("candy-hammer").level'),1);
confirm("state.pendingChoices=[SurvivorLoadout.choices().find(c=>c.id==='candy-hammer')];showUpgradeChoices();applyUpgrade(0)");assert.equal(confirm('SurvivorLoadout.owned("candy-hammer").level'),2);assert.equal(confirm('SurvivorLoadout.owned("water-ball").level'),1);
// Crossing a stage inside an active weapon context cannot lose slots or overwrite their state.
confirm("SurvivorLoadout.owned('water-ball').shotTimer=.31;SurvivorLoadout.withWeapon(SurvivorLoadout.owned('candy-hammer'),()=>finishRun(true))");assert.equal(confirm('state.mode'),'transition');assert.equal(confirm('state.loadout.length'),2);assert.equal(confirm('SurvivorLoadout.owned("candy-hammer").level'),2);assert.equal(confirm('SurvivorLoadout.owned("water-ball").shotTimer'),.31);assert.equal(confirm('state.weaponEffects.length'),0);
confirm('startGame()');assert.equal(confirm('state.loadout.length'),1);assert.equal(confirm('state.loadout[0].level'),1);
// Trial picker offers only the three authored manual weapons, with no survival inventory.
const trial=fresh();trial('startTrial(trialSettings().bosses[0].id)');assert.equal(trial('state.pickingWeapon'),true);assert.equal(trial('state.pendingChoices.length'),3);assert.equal(trial('state.boss'),null);
trial('applyUpgrade(1)');assert.equal(trial('state.weaponId'),'candy-hammer');assert.equal(trial('GAME_DATA.attackMode'),'manual');assert.equal(trial('state.loadout'),null);assert.equal(trial('state.mode'),'playing');
// New weapons read Maker's shared controls; catalog data remains the only independent level table.
const tuning=fresh();tuning("state.loadout=[];SurvivorLoadout.acquire('ice-spikes');globalThis.before=SurvivorLoadout.withWeapon(state.loadout[0],()=>SurvivorWeaponAttacks.settings(state.loadout[0]));BUILD_TUNING.fieldRadius*=2;BUILD_TUNING.shotRange*=1.5;globalThis.after=SurvivorLoadout.withWeapon(state.loadout[0],()=>SurvivorWeaponAttacks.settings(state.loadout[0]));");assert.equal(tuning('after.radius/before.radius'),2);assert.equal(tuning('after.range/before.range'),1.5);
console.log('PASS: twelve weapons at Lv1/3/5 deal damage, bounded effects, three slots/weapon guarantee/levels, context and stage preservation, trial picker and shared Maker rules');
// Three co-linear bees must reach their own targets instead of all colliding with the nearest.
for(const killFirst of [false,true]){
 const run=fresh();run(`state.loadout=[];SurvivorLoadout.acquire('honey-bees');state.loadout[0].level=5;state.enemies=[book(50),book(100),book(150),book(200)];globalThis.hits=[];const original=hitBuildTarget;hitBuildTarget=(target,n,...args)=>{hits.push(state.enemies.indexOf(target));return original(target,n,...args)};
 SurvivorLoadout.withWeapon(state.loadout[0],()=>SurvivorWeaponAttacks.fire(state.loadout[0]));if(${killFirst})state.enemies[0].alive=false;for(let i=0;i<45;i++)SurvivorWeaponAttacks.tick(.05);`);
 const hits=JSON.parse(run('JSON.stringify(hits)'));assert.equal(hits.length,3);assert.equal(new Set(hits).size,3);assert.deepEqual([...hits].sort(),killFirst?[1,2,3]:[0,1,2]);
}
// Overlapping zones and beam arms cannot multiply one pulse or its hit-card proc.
for(const id of ['soda-fountain','rainbow-straw']){
 const run=fresh();run(`state.loadout=[];SurvivorLoadout.acquire('${id}');state.loadout[0].level=5;state.enemies=[book(${id==='soda-fountain'?50:0})];globalThis.hits=0;globalThis.procs=0;const original=hitBuildTarget;hitBuildTarget=(target,n,...args)=>{hits++;return original(target,n,...args)};triggerMakerEffects=type=>{if(type==='hit')procs++};SurvivorLoadout.withWeapon(state.loadout[0],()=>SurvivorWeaponAttacks.fire(state.loadout[0]));for(let i=0;i<44;i++)SurvivorWeaponAttacks.tick(.05);`);
 assert.equal(run('hits'),id==='soda-fountain'?4:1);assert.equal(run('procs'),run('hits'));
}
console.log('PASS: co-linear bees and dead-target reassignment stay unique; overlapping zones/beams proc once per pulse');
const beam=fresh();beam("state.loadout=[];SurvivorLoadout.acquire('rainbow-straw');globalThis.before=SurvivorLoadout.withWeapon(state.loadout[0],()=>SurvivorWeaponAttacks.settings(state.loadout[0]));state.upgrades['big-water']=1;globalThis.after=SurvivorLoadout.withWeapon(state.loadout[0],()=>SurvivorWeaponAttacks.settings(state.loadout[0]));");assert.equal(beam('after.beamWidth/before.beamWidth'),1.2);assert.equal(beam('after.radius/before.radius'),1.2);

const pause=fresh();pause("SurvivorLoadout.acquire('cotton-cloud');SurvivorLoadout.acquire('popcorn-bomb');SurvivorLoadout.acquire('cotton-cloud');showOverlay('paused');updateHud()");for(const text of ['水球 Lv1','雷雲棉花糖 Lv2','爆米花炸彈 Lv1'])assert.ok(pause.elements.buildSlots.innerHTML.includes(text),text);
