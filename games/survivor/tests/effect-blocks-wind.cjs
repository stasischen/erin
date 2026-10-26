// 打擊回饋由 feel-tiers.cjs 驗證；本檔關閉回饋，比較既有卡片戰鬥。
// Fixed inputs → complete combat state and ordered cues/damage, against frozen pre-migration functions.
const assert=require('node:assert/strict'),fs=require('node:fs'),legacy=require('./effect-blocks-wind-legacy.json');
const create=require('./maker-support.cjs');
const ids=['wind-attack','wind-dash','wind-speed','wind-ultimate','fusion-storm','wind-blade','wind-gust','wind-refund','wind-light','wind-eye'];
function scenario(old,setup,steps){
  const run=create();
  if(old) {
    for(const [name,body] of Object.entries(legacy)) if(name!=='shot')run(require('./slide-legacy.cjs')(body));
  }
  run(`resetGame();state.mode='playing';GAME_DATA.hitJuice.enabled=false;Math.random=()=>.5;state.enemies=[];state.boss=null;state.upgrades={};settingsPanel.hidden=true;
    globalThis.enemy=(dx=20,dy=0,hp=10000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y+dy,r:17,hp,maxHp:hp,alive:true,speed:0,wobble:0,damage:0,wetTimer:0});
    globalThis.events=[];const hit=hitBuildTarget,light=lightning;
    hitBuildTarget=(target,amount)=>{events.push(['hit',target.x,target.y,amount]);hit(target,amount);};
    lightning=(...args)=>{events.push(['lightning',...args]);light(...args);};
    ${setup};${steps};`);
  return JSON.parse(run(`JSON.stringify({enemies:state.enemies,boss:state.boss,mode:state.mode,kills:state.kills,
    schoolCombat:state.schoolCombat,fields:state.fields,trailDistance:state.trailDistance,ultimateTimer:state.ultimateTimer,
    ultimateVisual:state.ultimateVisual,ultimateTimers:state.ultimateTimers,ultimateVisuals:state.ultimateVisuals,
    bomb:state.bomb,bombBlast:state.bombBlast,projectiles:state.projectiles,events,effects:state.effects,vfx:state.vfx,gems:state.gems,neutral:state.neutral,upgrades:state.upgrades,player:state.player,dashCooldown:state.dashCooldown,dashCharges:state.dashCharges,enemyShots:state.enemyShots,results:globalThis.results})`));
}
let count=0;
function same(setup,steps){assert.deepEqual(scenario(false,setup,steps),scenario(true,setup,steps),setup+' / '+steps);count++;}
for(const id of ids) for(const level of [0,1,3,5]) for(const dt of [.05,.5,3.2]) {
 const base=`BUILD_TUNING.windSpeed=${dt===.5?.27:.18};BUILD_TUNING.movingRate=${dt===.5?.31:.12};
 GAME_DATA.schoolRules.windBladeRange=${dt===.5?93:140};GAME_DATA.schoolRules.windBladeDamage=${dt===.5?.65:.4};
 state.upgrades={'${id}':${level}};state.enemies=[enemy(0),enemy(32),enemy(75),enemy(150),enemy(5000)];`;
 same(base,`leaveDashTrail(state.player.x+110,state.player.y,110,state.player.x,state.player.y);updateFields(${dt});updateFields(.1);`);
 same(base,`state.bomb={x:state.player.x,y:state.player.y,radius:80,damage:40,timer:0,knockback:20,schools:['wind']};updateBomb(${dt});`);
 same(base,`updateSchoolCombat(${dt});updateSchoolCombat(10);updateSchoolCombat(.1);globalThis.results=[schoolWindWall()];`);
 same(base,`updateUltimate(${dt});state.elapsed+=.3;updateUltimate(.1);updateUltimate(.5);`);
 same(base,`state.dashCharges=0;state.dashCooldown=2;schoolDashEnded();schoolDashEnded();`);
 same(base,`fireAtNearest();globalThis.results=[effectiveShotInterval()];schoolShotHit({schools:[],melee:false,vx:30,vy:0,x:state.player.x,y:state.player.y,damage:80,hitList:[state.enemies[0]],pierce:1,blade:false},state.enemies[0]);`);
 for(const weapon of ['candy-hammer','candy-sword']) same(base,`state.weaponId='${weapon}';state.moveRate=.8;swingAtNearest();globalThis.results=[effectiveShotInterval()];`);
}
for(const dt of [.05,.5,3.2]) for(const hp of [1,10000]) {
 const base=`state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,3]));
 state.enemies=[enemy(0,0,${hp}),enemy(75,0,${hp}),enemy(150),enemy(5000)];state.enemies[0].x=state.player.x+state.worldWidth-20;
 state.boss={...enemy(80),typeId:'boss'};state.bossIntro=3;UPGRADES.find(c=>c.id==='wind-dash').effects[0].power=2;
 BUILD_TUNING.fieldRadius=75;BUILD_TUNING.fieldSeconds=.7;BUILD_TUNING.fieldInterval=.13;BUILD_TUNING.fieldLimit=2;
 BUILD_TUNING.fieldDamage=37;BUILD_TUNING.fieldRadiusGrowth=.4;BUILD_TUNING.pushDistance=33;BUILD_TUNING.trailSpacing=20;
 BUILD_TUNING.ultimateDamage=91;BUILD_TUNING.ultimateGrowth=.3;BUILD_TUNING.tornadoTick=.7;
 BUILD_TUNING.tornadoRadius=60;BUILD_TUNING.tornadoSpeed=3;
 GAME_DATA.schoolRules.gustSeconds=.3;GAME_DATA.schoolRules.gustRadius=75;GAME_DATA.schoolRules.gustPush=33;
 GAME_DATA.schoolRules.eyeWait=.2;GAME_DATA.schoolRules.eyeRadius=70;GAME_DATA.schoolRules.eyePush=17;`;
 same(base,`leaveDashTrail(state.player.x+110,state.player.y,110,state.player.x,state.player.y);updateFields(${dt});updateSchoolCombat(${dt});updateUltimate(${dt});`);
}
// Strict wall/tornado edge and inclusive gust/blade edge; piercing blades cannot recursively create blades.
for(const distance of [64.999,65,65.001,82,82.001,140,140.001]) for(const blade of [false,true]) same(
 `state.upgrades={'wind-eye':1,'wind-gust':1,'wind-blade':1,'wind-ultimate':1};state.enemies=[enemy(${distance})];state.schoolCombat.still=2;`,
 `updateSchoolCombat(.05);updateUltimate(.05);schoolShotHit({schools:[],melee:false,vx:30,vy:0,damage:80,hitList:[],pierce:1,blade:${blade}},state.enemies[0]);`);
for(const cooldown of [0,.1,2,10]) for(const charges of [0,1,2]) same(
 `state.upgrades={'wind-refund':3};state.dashCooldown=${cooldown};state.dashCharges=${charges};GAME_DATA.schoolRules.refundCharge=.65;`,
 `schoolDashEnded();schoolDashEnded();`);
// Full tick covers movement speed, pickup radius, wall interception and weapon cadence.
for(const weapon of ['water-ball','candy-hammer','candy-sword']) for(const moving of [false,true]) same(
 `state.upgrades={'wind-light':3,'wind-eye':1,'wind-speed':3,'wind-attack':2};state.weaponId='${weapon}';
 state.enemies=[enemy(180)];state.gems=[{x:state.player.x+110,y:state.player.y,r:5,value:1,alive:true}];state.schoolCombat.still=2;state.spawnTimer=100;state.bossSpawned=true;
 GAME_DATA.schoolRules.lightSpeed=.23;GAME_DATA.schoolRules.lightMagnet=.7;
 if(${moving})state.keys.add('ArrowRight');state.enemyShots=[{x:state.player.x+60,y:state.player.y,r:5,vx:0,vy:0,damage:1,life:4}];`,
 `tick(.05);tick(.05);`);
const run=create();
for(const id of ids) {
 assert.equal(run(`!!SurvivorEffectBlocks.recipes.find(r=>r.feature==='${id}')`),true);
 const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
 const preview=create({preview:{data,spec:{kind:'card',id,level:1}}});
 preview('Math.random=()=>.5;for(let i=0;i<160;i++)stepPreview(.05);');assert.ok(preview('drawCalls.length>0'),id);
}
run(`globalThis.input={level:3,moving:.8,dt:.05};globalThis.before=JSON.stringify(input);SurvivorEffectBlocks.event('wind-speed','onShot',GAME_DATA,input);`);
assert.equal(run('JSON.stringify(input)'),run('before'));
console.log(`PASS: wind ${count} frozen legacy combat cases, 10 recipes/previews and pure input`);
