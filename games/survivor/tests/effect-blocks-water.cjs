// Fixed inputs → complete combat state and ordered cues/damage, against frozen pre-migration functions.
const assert=require('node:assert/strict'),fs=require('node:fs'),legacy=require('./effect-blocks-water-legacy.json');
const create=require('./maker-support.cjs');
const ids=['water-attack','water-skill','water-dash','water-ultimate','fusion-puddle','water-drop','water-fountain','water-bubble','water-wet','water-rain'];
function scenario(old,setup,steps){
  const run=create();
  if(old) {
    for(const [name,body] of Object.entries(legacy)) if(name!=='shot')run(require('./slide-legacy.cjs')(body));
    run('SurvivorSchools.shot='+legacy.shot.replace('function shot','function')+';');
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
    bomb:state.bomb,bombBlast:state.bombBlast,projectiles:state.projectiles,events,effects:state.effects,vfx:state.vfx,gems:state.gems,neutral:state.neutral,upgrades:state.upgrades,player:state.player,results:globalThis.results})`));
}
let count=0;
function same(setup,steps){assert.deepEqual(scenario(false,setup,steps),scenario(true,setup,steps),setup+' / '+steps);count++;}
for(const id of ids) for(const level of [0,1,3,5]) for(const dt of [.05,.5,3.2]) {
  const base=`state.upgrades={'${id}':${level}};
    state.enemies=[enemy(0),enemy(32),enemy(52),enemy(75),enemy(150),enemy(5000)];`;
  same(base,`schoolEffect('water',state.enemies[0],state.player.x,state.player.y,80);updateFields(${dt});updateFields(.1);`);
  same(base,`leaveDashTrail(state.player.x+110,state.player.y,110,state.player.x,state.player.y);updateFields(${dt});`);
  same(base,`state.bomb={x:state.player.x,y:state.player.y,radius:80,damage:40,timer:0,knockback:20,schools:['water']};updateBomb(${dt});updateFields(.1);`);
  same(base,`updateSchoolCombat(${dt});updateSchoolCombat(10);updateSchoolCombat(.1);`);
  same(base,`updateUltimate(${dt});if(state.mode==='playing')updateUltimate(.1);`);
  same(base,`schoolDashEnded();globalThis.results=[absorbSchoolHit(0),absorbSchoolHit(-1),absorbSchoolHit(40),absorbSchoolHit(20)];
    schoolShotHit({schools:[],melee:true,push:0,charged:false},state.enemies[0]);`);
}
// Combined powers, wet/crown multiplication, killed enemies, wrap and intro-protected boss.
for(const hp of [1,10000]) for(const dt of [.05,.5,3.2]) {
  const base=`state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,3]));state.upgrades['item-crown']=1;
    UPGRADES.find(c=>c.id==='water-skill').effects[0].power=2;
    state.enemies=[enemy(0,0,${hp}),enemy(75,0,${hp}),enemy(150),enemy(5000)];state.enemies[1].wetTimer=2;
    state.enemies[0].x=state.player.x+state.worldWidth-20;state.boss={...enemy(80),typeId:'boss'};state.bossIntro=3;
    GAME_DATA.schoolRules.fountainSeconds=.3;GAME_DATA.schoolRules.fountainRadius=75;GAME_DATA.schoolRules.fountainPush=33;
    GAME_DATA.schoolRules.rainSeconds=.4;GAME_DATA.schoolRules.rainDuration=.7;GAME_DATA.schoolRules.wetSeconds=1.7;
    GAME_DATA.schoolRules.wetDamage=.65;BUILD_TUNING.fieldDamage=37;BUILD_TUNING.fieldRadius=75;
    BUILD_TUNING.fieldSeconds=.7;BUILD_TUNING.fieldInterval=.13;BUILD_TUNING.fieldRadiusGrowth=.4;
    BUILD_TUNING.fieldLimit=2;BUILD_TUNING.trailSpacing=20;BUILD_TUNING.slowSeconds=.7;
    UPGRADE_TUNING.splashBaseRadius=30;UPGRADE_TUNING.splashPerLevel=15;
    BUILD_TUNING.splashDamageBase=.7;BUILD_TUNING.splashDamageGrowth=.3;
    BUILD_TUNING.ultimateSeconds=.7;BUILD_TUNING.ultimateDamage=91;BUILD_TUNING.ultimateGrowth=.3;`;
  same(base,`schoolEffect('water',state.enemies[0],state.enemies[0].x,state.enemies[0].y,100);
    updateSchoolCombat(${dt});leaveDashTrail(state.player.x+110,state.player.y,110,state.player.x,state.player.y);
    updateFields(${dt});schoolDashEnded();globalThis.results=[absorbSchoolHit(30),absorbSchoolHit(30)];updateUltimate(${dt});`);
}
// Exact splash edge excludes; fountain includes; field edge includes target radius; expiry and long dt only tick once.
for(const distance of [31.999,32,32.001,92,92.001]) same(
  `state.upgrades={'water-attack':1,'water-skill':1,'fusion-puddle':1,'water-fountain':1};state.enemies=[enemy(${distance})];
   GAME_DATA.schoolRules.fountainRadius=32;`,
  `schoolEffect('water',null,state.player.x,state.player.y,80);updateFields(.1);updateSchoolCombat(10);`);
for(const life of [.05,.5,3]) same(`state.upgrades={'water-skill':3,'water-dash':5,'fusion-puddle':2};state.enemies=[enemy(20)];
  addField('water',state.player.x,state.player.y);state.fields[0].life=${life};`, 'updateFields(.5);updateFields(.5);');
const run=create(),oracle=create();oracle('SurvivorSchools.shot='+legacy.shot.replace('function shot','function')+';');
for(const number of [0,1,3,4,8,20]) for(const owned of [0,1,5]) for(const every of [2,4,7]) for(const charge of [0,1]) {
  const expression=`JSON.stringify(SurvivorSchools.shot(${number},16,0,{drop:${owned},charge:${charge}},
    {...GAME_DATA.schoolRules,bigDropEvery:${every},bigDropDamage:2.3,bigDropSize:1.7,bigDropPush:37}))`;
  assert.equal(run(expression),oracle(expression));
}
for(const id of ids) {
  assert.equal(run(`!!SurvivorEffectBlocks.recipes.find(r=>r.feature==='${id}')`),true);
  const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
  const preview=create({preview:{data,spec:{kind:'card',id,level:1}}});
  preview('Math.random=()=>.5;for(let i=0;i<160;i++)stepPreview(.05);');
  assert.ok(preview('drawCalls.length>0'),id);
}
run(`globalThis.input={level:3,damage:80,dt:.05};globalThis.before=JSON.stringify(input);
  SurvivorEffectBlocks.event('water-attack','onWaterHit',GAME_DATA,input);`);
assert.equal(run('JSON.stringify(input)'),run('before'));
console.log(`PASS: water ${count} frozen legacy combat cases, shot thresholds, 10 recipes/previews and pure input`);
