// Fixed inputs → complete combat state and ordered cues/damage, against frozen pre-migration functions.
const assert=require('node:assert/strict'),fs=require('node:fs'),legacy=require('./effect-blocks-thunder-legacy.json');
const create=require('./maker-support.cjs');
const ids=['thunder-attack','thunder-skill','thunder-counter','thunder-ultimate','fusion-dash','thunder-charge','thunder-rod','thunder-step','thunder-static','thunder-super'];
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
    bomb:state.bomb,bombBlast:state.bombBlast,projectiles:state.projectiles,events,effects:state.effects,vfx:state.vfx,gems:state.gems,neutral:state.neutral,upgrades:state.upgrades})`));
}
let count=0;
function same(setup,steps){assert.deepEqual(scenario(false,setup,steps),scenario(true,setup,steps),setup+' / '+steps);count++;}
for(const level of [0,1,3,5]) for(const superLevel of [0,1,5]) for(const form of [false,true]) {
  same(`state.upgrades={'thunder-attack':${level},'thunder-super':${superLevel}};
    ${form?"transformed=()=>true;":''}
    state.enemies=[enemy(0),enemy(60),enemy(100),enemy(180),enemy(310)];`,
    `schoolEffect('thunder',state.enemies[0],state.enemies[0].x,state.enemies[0].y,80,[state.enemies[1]]);`);
}
for(const level of [0,1,5]) for(const dt of [.05,.5,3.2]) for(const hp of [1,10000]) {
  const base=`state.upgrades={'thunder-skill':${level},'thunder-counter':${level},'thunder-rod':${level},'thunder-static':${level},'thunder-step':${level},'fusion-dash':${level},'thunder-ultimate':${level}};
    state.enemies=[enemy(20,0,${hp}),enemy(BUILD_TUNING.counterRadius),enemy(240),enemy(5000)];`;
  same(base,'counterDischarge();');
  same(base,`state.bomb={x:state.player.x,y:state.player.y,radius:80,damage:40,timer:0,knockback:20,schools:['thunder']};updateBomb(${dt});`);
  same(base,`updateSchoolCombat(${dt});if(state.mode==='playing')updateSchoolCombat(.1);`);
  same(base,`schoolDashCrossed(state.player.x,state.player.y,state.player.x+120,state.player.y);`);
  same(base,`leaveDashTrail(state.player.x+110,state.player.y,110,state.player.x,state.player.y);updateFields(${dt});`);
  same(base,`updateUltimate(${dt});if(state.mode==='playing')updateUltimate(.1);`);
}
// All cards share feature powers across old Maker compositions; tuning, wrapping and protected boss remain identical.
for(const id of ids) {
  const setup=`state.upgrades={'${id}':3,'item-crown':1,'water-wet':1};
    UPGRADES.find(c=>c.id==='${id}').effects[0].power=2;
    state.enemies=[enemy(0),enemy(75),enemy(150)];state.enemies[1].wetTimer=2;
    state.enemies[0].x=state.player.x+state.worldWidth-20;
    state.boss={...enemy(80),typeId:'boss'};state.bossIntro=3;
    GAME_DATA.schoolRules.rodSeconds=3;GAME_DATA.schoolRules.rodTick=.7;GAME_DATA.schoolRules.rodDamage=47;
    GAME_DATA.schoolRules.staticSeconds=.7;GAME_DATA.schoolRules.staticDamage=31;
    GAME_DATA.schoolRules.superconductorJumps=3;BUILD_TUNING.chainDamage=.7;BUILD_TUNING.chainGrowth=.4;
    BUILD_TUNING.counterRadius=75;BUILD_TUNING.counterDamage=33;BUILD_TUNING.cloudSeconds=.7;
    BUILD_TUNING.ultimateDamage=91;BUILD_TUNING.stunSeconds=.7;BUILD_TUNING.skillDamageMultiplier=.7;`;
  same(setup,`counterDischarge();schoolEffect('thunder',state.enemies[0],state.enemies[0].x,state.enemies[0].y,100);
    updateUltimate(.1);schoolDashCrossed(state.player.x,state.player.y,state.player.x+120,state.player.y);
    updateSchoolCombat(4);leaveDashTrail(state.player.x+110,state.player.y,110,state.player.x,state.player.y);updateFields(.1);`);
}
// Charge threshold / already-consumed / multi-threshold overflow, for both melee and ranged callers.
const run=create(),oracle=create();oracle('SurvivorSchools.shot='+legacy.shot.replace('function shot','function')+';');
for(const kills of [0,7,8,9,16,100]) for(const used of [0,1,2,20]) for(const owned of [0,1,5]) for(const number of [1,4,8]) {
  const expression=`JSON.stringify(SurvivorSchools.shot(${number},${kills},${used},{drop:1,charge:${owned}},{...GAME_DATA.schoolRules,chargeKills:8,chargeDamage:2.3}))`;
  assert.equal(run(expression),oracle(expression));
}
// Every target card resolves a serializable rule, round trips through old storage, and previews successfully.
for(const id of ids){
  assert.equal(run(`!!SurvivorEffectBlocks.recipes.find(r=>r.feature==='${id}')`),true);
  const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
  const preview=create({preview:{data,spec:{kind:'card',id,level:1}}});
  preview('Math.random=()=>.5;for(let i=0;i<100;i++)stepPreview(.05);');
  assert.ok(preview('drawCalls.length>0'),id);
}
const input={level:3,transformed:1};run(`globalThis.blockInput=${JSON.stringify(input)};`);
run(`SurvivorEffectBlocks.event('thunder-attack','onChain',GAME_DATA,blockInput)`);
assert.equal(run('JSON.stringify(blockInput)'),JSON.stringify(input));
console.log(`PASS: thunder ${count} frozen legacy combat cases, charge thresholds, 10 recipes and previews, pure input`);
