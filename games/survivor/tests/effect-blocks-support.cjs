// Fixed inputs → complete combat state and ordered cues/damage, against frozen pre-migration functions.
const assert=require('node:assert/strict'),fs=require('node:fs'),legacy=require('./effect-blocks-support-legacy.json');
const create=require('./maker-support.cjs');
const ids=["big-water", "rapid-water", "multi-water", "onion-dash", "bubble-shield", "gem-magnet", "piercing-water", "splash-water", "auto-heal"];
function scenario(old,setup,steps){
  const run=create();
  if(old) {
    for(const [name,body] of Object.entries(legacy)) if(name!=='shot')run(require('./slide-legacy.cjs')(body));
  }
  run(`resetGame();state.mode='playing';Math.random=()=>.5;state.enemies=[];state.boss=null;state.upgrades={};settingsPanel.hidden=true;
    globalThis.enemy=(dx=20,dy=0,hp=10000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y+dy,r:17,hp,maxHp:hp,alive:true,speed:0,wobble:0,damage:0,wetTimer:0});
    globalThis.events=[];const hit=hitBuildTarget,light=lightning;
    hitBuildTarget=(target,amount)=>{events.push(['hit',target.x,target.y,amount]);hit(target,amount);};
    lightning=(...args)=>{events.push(['lightning',...args]);light(...args);};
    ${setup};${steps};`);
  return JSON.parse(run(`JSON.stringify({enemies:state.enemies,boss:state.boss,mode:state.mode,kills:state.kills,
    schoolCombat:state.schoolCombat,fields:state.fields,trailDistance:state.trailDistance,ultimateTimer:state.ultimateTimer,
    ultimateVisual:state.ultimateVisual,ultimateTimers:state.ultimateTimers,ultimateVisuals:state.ultimateVisuals,
    bomb:state.bomb,bombBlast:state.bombBlast,projectiles:state.projectiles,events,effects:state.effects,vfx:state.vfx,gems:state.gems,neutral:state.neutral,upgrades:state.upgrades,player:state.player,dashCooldown:state.dashCooldown,dashCharges:state.dashCharges,enemyShots:state.enemyShots,healTimer:state.healTimer,results:globalThis.results})`));
}
let count=0;
function same(setup,steps){assert.deepEqual(scenario(false,setup,steps),scenario(true,setup,steps),setup+' / '+steps);count++;}

for(const id of ids) for(const level of [0,1,3,5]) for(const custom of [false,true]) {
 const base=`state.upgrades={'${id}':${level}};state.enemies=[enemy(20),enemy(45),enemy(90),enemy(5000)];
 if(${custom}) {UPGRADE_TUNING.waterSizePerLevel=.27;UPGRADE_TUNING.damagePerLevel=.21;UPGRADE_TUNING.fireRateReduction=.17;
 UPGRADE_TUNING.extraShotAngle=.31;UPGRADE_TUNING.moveSpeedPerLevel=.13;UPGRADE_TUNING.magnetPerLevel=.72;
 UPGRADE_TUNING.splashBaseRadius=40;UPGRADE_TUNING.splashPerLevel=17;BUILD_TUNING.supportSplashDamage=.73;
 UPGRADE_TUNING.autoHealSeconds=.25;BUILD_TUNING.healIntervalMultiplier=.6;BUILD_TUNING.shieldHealthDivisor=7;}
 state.spawnTimer=100;state.bossSpawned=true;`;
 same(base,`fireAtNearest();globalThis.results=[effectiveDamage(),effectiveShotInterval(),maxPlayerHealth()];`);
 for(const weapon of ['candy-hammer','candy-sword']) same(base,`state.weaponId='${weapon}';swingAtNearest();globalThis.results=[effectiveDamage(),effectiveShotInterval(),maxPlayerHealth()];`);
 for(const dt of [0,.05,.5,3.2]) same(base,`state.player.health=40;state.healTimer=.2;
 state.gems=[{x:state.player.x+110,y:state.player.y,r:5,value:1,alive:true,wobble:0}];state.keys.add('ArrowRight');
 fireAtNearest();for(const s of state.projectiles){s.vx=0;s.vy=0;s.x=state.enemies[0].x;s.y=state.enemies[0].y;}tick(${dt});`);
 same(base,`state.player.health=40;state.pendingChoices=[UPGRADES.find(c=>c.id==='${id}')];state.mode='levelup';applyUpgrade(0);globalThis.results=[maxPlayerHealth()];`);
}
// Merged feature powers, max-health clamping, interval floor, strict splash edge and target eligibility.
for(const level of [1,3,5]) for(const distance of [79.999,80,80.001]) for(const weapon of ['water-ball','candy-hammer','candy-sword']) {
 same(`state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,${level}]));state.weaponId='${weapon}';
 UPGRADES.find(c=>c.id==='big-water').effects[0].power=2;UPGRADES.find(c=>c.id==='bubble-shield').effects[0].power=.5;
 UPGRADE_TUNING.splashBaseRadius=80;UPGRADE_TUNING.splashPerLevel=0;state.enemies=[enemy(20),enemy(20+${distance}),enemy(5000)];
 state.enemies[0].x=state.player.x+state.worldWidth-20;state.boss={...enemy(80),typeId:'boss'};state.bossIntro=3;
 state.spawnTimer=100;state.bossSpawned=true;state.upgrades['item-crown']=1;state.player.health=maxPlayerHealth()-1;state.healTimer=100;`,
 `fireAtNearest();tick(.05);globalThis.results=[effectiveDamage(),effectiveShotInterval(),maxPlayerHealth()];`);
}
for(const distance of [79.999,80,80.001]) for(const health of [40,119,120]) same(
 `state.upgrades={'splash-water':1,'piercing-water':2,'auto-heal':3,'bubble-shield':2,'gem-magnet':3,'item-magnet':1};
 UPGRADE_TUNING.splashBaseRadius=80;UPGRADE_TUNING.splashPerLevel=0;state.player.health=${health};state.healTimer=100;
 state.spawnTimer=100;state.bossSpawned=true;state.enemies=[enemy(20),enemy(20+${distance}),enemy(5000)];`,
 `fireAtNearest();for(const s of state.projectiles){s.vx=0;s.vy=0;s.x=state.enemies[0].x;s.y=state.enemies[0].y;}tick(.05);tick(.05);drawNeutralItems();`);
const run=create();
for(const id of ids) {
 assert.equal(run(`!!SurvivorEffectBlocks.recipes.find(r=>r.feature==='${id}')`),true);
 const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
 const preview=create({preview:{data,spec:{kind:'card',id,level:1}}});
 preview('Math.random=()=>.5;for(let i=0;i<160;i++)stepPreview(.05);');assert.ok(preview('drawCalls.length>0'),id);
}
run(`globalThis.input={level:3,damage:50};globalThis.before=JSON.stringify(input);SurvivorEffectBlocks.event('splash-water','onShotHit',GAME_DATA,input);`);
assert.equal(run('JSON.stringify(input)'),run('before'));
console.log(`PASS: support ${count} frozen legacy cases, nine recipes/previews and pure input`);
