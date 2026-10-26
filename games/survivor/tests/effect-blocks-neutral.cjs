// Fixed initial states/actions/dt/draw → complete state and ordered effects.
// Frozen source is from 4e4e055687ca54b2efc8cc33b17192348a4f5a39, before this migration.
const assert=require('node:assert/strict'),legacy=require('./effect-blocks-neutral-legacy.json');
const create=require('./maker-support.cjs');
const ids=['wall','candy','bird','bank','split','magnet','crown','clover','rear','cookie'];
function scenario(old,setup,steps,draw=.05) {
 const run=create();
 run("globalThis.currentWave=waveNeutralHit");
 if(old) for(const [name,body] of Object.entries(legacy)) if(name!=='waveNeutralHit')run(require('./slide-legacy.cjs')(body));
 run("waveNeutralHit=currentWave");
 run(`Math.random=()=>${draw};resetGame();state.mode='playing';settingsPanel.hidden=true;
 state.spawnTimer=999;state.shotTimer=999;state.bossSpawned=true;state.enemies=[];state.boss=null;state.upgrades={};
 globalThis.enemy=(dx=50,dy=0,hp=10000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y+dy,r:17,hp,maxHp:hp,alive:true,speed:0,wobble:0,damage:0,wetTimer:0,shotCooldown:999});
 globalThis.events=[];const hit=hitBuildTarget;hitBuildTarget=(target,amount)=>{events.push(['hit',target.x,target.y,amount]);hit(target,amount);};
 ${setup};${steps};`);
 return JSON.parse(run(`JSON.stringify({enemies:state.enemies,boss:state.boss,mode:state.mode,kills:state.kills,
 player:state.player,neutral:state.neutral,projectiles:state.projectiles,gems:state.gems,effects:state.effects,vfx:state.vfx,
 pending:state.pendingChoices,rerolls:state.rerollsRemaining,upgrades:state.upgrades,events,results:globalThis.results})`));
}
let count=0;
function same(setup,steps,draw){assert.deepEqual(scenario(false,setup,steps,draw),scenario(true,setup,steps,draw),setup+' / '+steps);count++;}
const custom=`Object.assign(GAME_DATA.neutralRules,{wavePush:55,waveDamage:31,waveCooldown:.7,bombChance:.3,bombDelay:.4,bombRadius:80,bombDamage:63,birdRadius:60,birdReach:80,birdSeconds:.3,birdDamage:31,bankEvery:3,bankStep:.017,bankCap:.12,splitDamage:.7,splitAngle:.3,magnetMultiplier:3.2,crownDamage:.45,crownHealth:9,luckyRareMultiplier:2.3,cookieKills:5});`;
for(const id of ids) for(const level of [0,1,3]) for(const tuned of [false,true]) {
 const base=`state.upgrades={'item-${id}':${level}};${tuned?custom:''}
 state.enemies=[enemy(35),enemy(70),enemy(130),enemy(5000)];state.neutral.kills=19;state.neutral.gems=29;state.player.health=20;`;
 for(const weapon of ['water-ball','candy-hammer','candy-sword']) same(base+`state.weaponId='${weapon}';`,
 `fireAtNearest();if(activeWeapon().kind==='melee')swingAtNearest();for(let i=0;i<12;i++)tick(.05);drawNeutralItems();globalThis.results=[neutralDamageMultiplier(),maxPlayerHealth()];`);
 same(base,`for(let i=0;i<22;i++){neutralEvent('death',state.player.x,state.player.y);neutralEvent('pickup',0,0);}updateNeutralItems(.5);updateNeutralItems(1.1);globalThis.results=[neutralDamageMultiplier()];`);
 same(base,`state.mode='levelup';state.pendingChoices=[UPGRADES.find(c=>c.id==='item-${id}')];applyUpgrade(0);chooseUpgradeCards();`);
}
// Exact chance boundaries, bank/cookie thresholds, zero/short/long dt and due-bomb ordering.
for(const draw of [0,.099999,.1,.100001,.999]) for(const dt of [0,.05,.6,3]) same(
 `state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>['item-'+id,1]));state.enemies=[enemy(50,0,1),enemy(75,0,1),enemy(100),enemy(5000)];state.neutral.kills=19;state.neutral.gems=9;state.player.health=maxPlayerHealth()-1;`,
 `damageEnemy(state.enemies[0],100);damageEnemy(state.enemies[0],100);neutralEvent('pickup',0,0);updateNeutralItems(${dt});updateNeutralItems(.05);drawNeutralItems();`,draw);
for(const distance of [96.999,97,97.001]) for(const kind of ['bird','candy']) same(
 `state.upgrades={'item-${kind}':1};GAME_DATA.neutralRules.birdReach=80;GAME_DATA.neutralRules.bombRadius=80;
 state.neutral.birdAngle=0;state.enemies=[enemy(${distance}+( ${kind==='bird'?1:0} *GAME_DATA.neutralRules.birdRadius))];state.neutral.bombs=[{x:state.player.x,y:state.player.y,timer:0}];`,
 `updateNeutralItems(0);updateNeutralItems(.01);`);
// Wall collision, cooldown, zero movement, dead/ineligible targets, wrapping and boss-only push.
for(const dx of [0,1,50]) for(const ready of [0,999]) same(
 `state.upgrades={'item-wall':1};${custom}state.enemies=[enemy(30),enemy(60)];state.enemies[0].waveReady=${ready};`,
 `waveNeutralHit(state.enemies[0],${dx},0);waveNeutralHit(state.enemies[0],${dx},0);`);
for(const type of ['dead','outside','boss','wrap']) same(
 `state.upgrades={'item-wall':1};state.enemies=[enemy(30),enemy(60)];
 if('${type}'==='dead')state.enemies[0].alive=false;if('${type}'==='outside')state.enemies[0].x+=5000;
 if('${type}'==='boss'){state.boss=state.enemies.shift();state.bossIntro=0;}if('${type}'==='wrap'){state.player.x=5;state.enemies=[enemy(-30),enemy(0)];state.enemies[0].x+=state.worldWidth;}`,
 `waveNeutralHit(state.boss||state.enemies[0],30,0);`);
// Copy hitList/big bubble once, ignore custom projectiles, and enforce projectile/bomb caps.
for(const maker of [false,true]) for(const full of [false,true]) same(
 `state.upgrades={'item-split':1,'item-rear':1,'item-candy':1};state.enemies=[enemy(35)];fireAtNearest();
 state.projectiles[0].maker=${maker};state.projectiles[0].bigBubble=true;
 if(${full})while(state.projectiles.length<PROJECTILE_LIMIT)state.projectiles.push({...state.projectiles[0]});`,
 `splitNeutralShot(state.projectiles[0]);splitNeutralShot(state.projectiles[0]);prepareNeutralShots(.3);for(let i=0;i<50;i++)neutralEvent('death',0,0);updateNeutralItems(.6);`,0);
// Old aliases/power merge and repeated acquisitions; full health/clamping and rare weighting.
for(const power of [.5,2,5]) for(const draw of [.1,.5,.9]) same(
 `state.upgrades={'item-clover':1,'item-crown':1,'item-bank':1};UPGRADES.find(c=>c.id==='item-rear').effects=[{feature:'item-clover',power:${power}}];state.upgrades['item-rear']=1;state.neutral.gems=9999;state.player.health=999;`,
 `neutralEvent('acquire',0,0,'item-rear');neutralEvent('acquire',0,0,'item-bank');state.upgrades['item-rear']=2;neutralEvent('acquire',0,0,'item-rear');chooseUpgradeCards();globalThis.results=[neutralDamageMultiplier(),maxPlayerHealth()];`,draw);
// Pure inputs remain untouched; thresholds and rewards compare independently of rendering.
const run=create();run('globalThis.oldNeutral=SurvivorNeutral');run(legacy.neutral);
for(const gems of [0,9,10,299,300,9999]) for(const kills of [0,19,20,39]) for(const draw of [0,.1,1]) {
 run(`globalThis.current={kills:${kills},gems:${gems}};globalThis.powers={cookie:true,candy:true,bank:true,crown:true,cloverAcquired:true};globalThis.before=JSON.stringify([current,powers,GAME_DATA.neutralRules]);`);
 for(const type of ['death','pickup','acquire']) assert.equal(run(`JSON.stringify(oldNeutral.reward(current,'${type}',powers,GAME_DATA.neutralRules,${draw},'item-clover'))`),run(`JSON.stringify(SurvivorNeutral.reward(current,'${type}',powers,GAME_DATA.neutralRules,${draw},'item-clover'))`));
 assert.equal(run('oldNeutral.damage(current.gems,powers,GAME_DATA.neutralRules)'),run('SurvivorNeutral.damage(current.gems,powers,GAME_DATA.neutralRules)'));
 assert.equal(run('JSON.stringify([current,powers,GAME_DATA.neutralRules])'),run('before'));
}
for(const id of ids) {
 assert.equal(run(`!!SurvivorEffectBlocks.recipes.find(r=>r.feature==='item-${id}'&&r.rules.length)`),true);
 const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
 const preview=create({preview:{data,spec:{kind:'card',id:'item-'+id,level:1}}});
 preview('Math.random=()=>.05;for(let i=0;i<160;i++)stepPreview(.05);');assert.ok(preview('drawCalls.length>0'),id);
}
console.log(`PASS: neutral ${count} complete frozen legacy cases, 72 pure reward/damage cases, ten recipes and real previews`);
