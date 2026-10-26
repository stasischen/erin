// Frozen pre-migration functions are an independent oracle, never loaded by the game.
const assert=require('node:assert/strict'),legacy=require('./effect-blocks-legacy.json');
const create=require('./maker-support.cjs');
function scenario(old,setup,steps) {
  const run=create();
  if(old) run(legacy.updateSchoolCombat+'\n'+legacy.maxPlayerHealth+'\nSurvivorNeutral.damage='+legacy.damage.trim().replace(/^function damage/, 'function')+';');
  run(`resetGame();state.mode='playing';Math.random=()=>.5;settingsPanel.hidden=true;
    state.enemies=[];state.boss=null;state.upgrades={};
    globalThis.enemy=(dx=20,hp=1000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y,r:17,hp,maxHp:hp,alive:true,speed:0,wobble:0,damage:0,wetTimer:0});
    globalThis.events=[];globalThis.oldLightning=lightning;lightning=(...args)=>{events.push(['lightning',...args]);oldLightning(...args);};
    globalThis.oldHit=hitBuildTarget;hitBuildTarget=(target,amount)=>{events.push(['hit',target.typeId,amount]);oldHit(target,amount);};
    ${setup}
    ${steps}
  `);
  return JSON.parse(run(`JSON.stringify({health:state.player.health,max:maxPlayerHealth(),damage:neutralDamageMultiplier(),mode:state.mode,
    timers:state.schoolCombat.timers, enemies:state.enemies, boss:state.boss, kills:state.kills, neutral:state.neutral,
    gems:state.gems, effects:state.effects, vfx:state.vfx,events,upgrades:state.upgrades})`));
}
function same(setup,steps){assert.deepEqual(scenario(false,setup,steps),scenario(true,setup,steps),setup+' / '+steps);}
for(const weapon of ['water-ball','candy-hammer']) for(const power of [0,1,5]) for(const dt of [.1,1,3.2]) {
  same(`state.weaponId='${weapon}';state.upgrades={'thunder-static':${power}};state.enemies=[enemy(20),enemy(state.player.r+17+3),enemy(5000)];`, `updateSchoolCombat(${dt});updateSchoolCombat(.1);`);
}
// Pending timer, no ownership, invulnerability, shared feature power and custom tuning.
for(const timer of [undefined,0,.5,-2]) same(`state.upgrades={'thunder-static':1,'water-wet':1,'item-crown':1,'item-bank':1};state.neutral.gems=30;
  state.player.invincible=100;state.enemies=[enemy()];state.enemies[0].wetTimer=2;
  GAME_DATA.schoolRules.staticSeconds=.7;GAME_DATA.schoolRules.staticDamage=31;
  ${timer===undefined?'':`state.schoolCombat.timers['thunder-static']=${timer};`}`, 'updateSchoolCombat(.2);updateSchoolCombat(2);');
same(`state.upgrades={'water-attack':2,'thunder-static':3};UPGRADES.find(c=>c.id==='water-attack').effects=[{feature:'thunder-static',power:2}];state.enemies=[enemy()];`, 'updateSchoolCombat(1);');
same(`state.schoolCombat.timers['thunder-static']=.4;state.enemies=[enemy()];`, 'updateSchoolCombat(1);');
// Wrapped touching target, protected boss, boss win stops later events, ordinary death rewards.
for(const intro of [0,3]) same(`state.upgrades={'thunder-static':1};state.enemies=[enemy(5000)];state.boss={...enemy(20),typeId:'boss'};state.bossIntro=${intro};`, 'updateSchoolCombat(1);');
same(`state.upgrades={'thunder-static':1};state.enemies=[enemy(20,1)];state.boss={...enemy(22,1),typeId:'boss'};state.bossIntro=0;`, 'updateSchoolCombat(1);');
same(`state.upgrades={'thunder-static':1};state.enemies=[enemy()];state.enemies[0].x=state.player.x+state.worldWidth-20;`, 'updateSchoolCombat(1);');
for(const health of [1,40,90]) for(const crown of [0,1,5]) for(const bank of [0,1]) for(const cost of [1,100]) {
  same(`state.player.health=${health};state.upgrades={'item-crown':${crown},'item-bank':${bank},'bubble-shield':2,'water-wet':1};state.neutral.gems=999;
    GAME_DATA.neutralRules.crownHealth=${cost};GAME_DATA.neutralRules.crownDamage=.42;state.enemies=[enemy()];state.enemies[0].wetTimer=2;`,
    `state.player.health=Math.min(state.player.health,maxPlayerHealth());damageEnemy(state.enemies[0],100);maxPlayerHealth();maxPlayerHealth();`);
}
// Acquisition, no healing, old Maker works, preview and both weapons are also covered by existing suites.
for(const health of [20,90]) same(`state.player.health=${health};state.enemies=[enemy()];state.schoolRun.neutralPool.push('item-crown');state.mode='levelup';state.pendingChoices=[UPGRADES.find(c=>c.id==='item-crown')];`, 'applyUpgrade(0);');
const run=create(),val=code=>JSON.parse(run(`JSON.stringify(${code})`));
const input={dt:1,timers:{},levels:{'thunder-static':5},data:{schoolRules:{staticSeconds:1,staticDamage:20}},player:{r:10},targets:[{id:'monster-1',dx:20,dy:0,r:10},{id:'edge',dx:23,dy:0,r:10}]};
run(`globalThis.input=${JSON.stringify(input)}`);
assert.deepEqual(val('SurvivorEffectBlocks.step(input)'),{timers:{'thunder-static':1},events:[{type:'cue',cue:'lightning',targetId:'monster-1',source:'thunder-static'},{type:'damage',amount:20,targetId:'monster-1',source:'thunder-static'}]});
assert.deepEqual(val('input'),input,'pure function must not mutate input');
// New recipe uses only data: same blocks, new timer id, constant damage.
run(`globalThis.recipe=[{feature:'example',rules:[{id:'example-pulse',trigger:'onTimer',interval:1,conditions:[{type:'touching',padding:3}],actions:[{type:'damage',amount:7}]}]}];`);
assert.equal(val(`SurvivorEffectBlocks.step({...input,levels:{example:1}},recipe).events`)[0].amount,7);
// Same data-only recipe reaches the real timer adapter without a feature-specific branch.
run(`resetGame();state.mode='playing';state.enemies=[{x:state.player.x+20,y:state.player.y,r:17,hp:100,maxHp:100,alive:true,typeId:'jaben'}];
  UPGRADES.push({id:'example',effects:[{feature:'example',power:1}]});state.upgrades={example:1};
  SurvivorEffectBlocks.recipes.push(...recipe);updateSchoolCombat(1);`);
assert.equal(run('state.enemies[0].hp'),93);
assert.equal(run('effectBlockTargetId(state.enemies[0])===effectBlockTargetId(state.enemies[0])'),true);
for(const id of ['thunder-static','item-crown']) {
  const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
  data.schoolRules.staticSeconds=.25;data.schoolRules.staticDamage=31;
  data.neutralRules.crownHealth=4;data.neutralRules.crownDamage=.42;
  const preview=create({preview:{data,spec:{kind:'card',id,level:1}}});
  preview('for(let i=0;i<60;i++)stepPreview(.05);');
  if(id==='item-crown') {assert.equal(preview('maxPlayerHealth()'),86);assert.equal(preview('neutralDamageMultiplier()'),1.42);}
  assert.ok(preview('drawCalls.length>0'));
}
assert.throws(()=>run(`SurvivorEffectBlocks.step(input,[{feature:'thunder-static',rules:[{trigger:'eval'}]}])`),/Unsupported/);
assert.throws(()=>run(`SurvivorEffectBlocks.modify('maxHealth',90,{'item-crown':1},{},[{feature:'item-crown',modifiers:[{stat:'maxHealth',op:'subtract',value:{ref:'__proto__.x'}}]}])`),/Unsupported/);
console.log('PASS: static/crown frozen legacy input-output equivalence, strict edge, long dt, custom rules, shared powers, wet/bank, health/acquire, boss/death, wrap, pure events, data-only new recipe');
