const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
run(`globalThis.cfg={enabled:true,strength:1,bossMass:40,minibossMass:8};`);
for(const mass of [1,8,40,100]) for(const distance of [-80,0,80]) near(run(`SurvivorBodies.displacement(${distance},${mass},cfg)`),distance/mass);
assert.equal(run('SurvivorBodies.displacement(80,8,{...cfg,enabled:false})'),80);
assert.equal(run('SurvivorBodies.displacement(80,8,{...cfg,strength:0})'),80);
near(run('SurvivorBodies.displacement(-80,8,cfg,0)'),0);
assert.equal(run('SurvivorBodies.mass({miniboss:true,mass:1},cfg)'),8);
function fresh(kind='normal') {
 run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;GAME_DATA.bodySeparation.enabled=false;
 globalThis.e=spawnEnemy({typeId:'jaben'});e.x=state.player.x+100;e.y=state.player.y;e.speed=0;e.hp=10000;e.knockback=0;
 ${kind==='tank'?'e.mass=8;':kind==='boss'?'state.boss=e;state.enemies=[];state.bossIntro=0;':kind==='bear'?'e.miniboss=true;':''}
 globalThis.x=e.x;`);
}
for(const kind of ['normal','tank','bear','boss']) {
 const factor=kind==='boss'?0:kind==='normal'?1:1/8;
 for(const distance of [-40,80]) {
  fresh(kind);run(`shiftTarget(e,state.player.x,state.player.y,${distance});updateTargetSlide(e,.25)`);near(run('e.x-x'),distance*factor);
  if(factor) near(run('state.vfx.at(-1).x2-state.vfx.at(-1).x'),distance*factor);
 }
 fresh(kind);run(`executeMakerEffect({...SurvivorData.PARAMS,type:'knockback',distance:80,radius:200},state.player.x,state.player.y,1);updateTargetSlide(e,.25)`);near(run('e.x-x'),80*factor);
 fresh(kind);run(`state.bomb={x:state.player.x,y:state.player.y,timer:0,radius:150,damage:0,knockback:80,schools:[]};updateBomb(0);updateTargetSlide(e,.25)`);near(run('e.x-x'),80*factor);
 fresh(kind);run(`state.bomb={x:state.player.x,y:state.player.y,timer:0,radius:150,damage:0,knockback:0,schools:['wind']};updateBomb(0);updateTargetSlide(e,.25)`);near(run('e.x-x'),-run('BUILD_TUNING.pullDistance')*factor);
 fresh(kind);run(`state.upgrades['item-wall']=1;waveNeutralHit(e,100,0);updateTargetSlide(e,.25)`);near(run('e.x-x'),run('GAME_DATA.neutralRules.wavePush')*factor);
 if(kind!=='boss') {fresh(kind);run('damageEnemy(e,1);updateTargetSlide(e,.25)');near(run('e.x-x'),run('KNOCKBACK_SPEED')/2*factor);}
}
// Projectile push and timed school gusts also route through the same scaler.
for(const kind of ['normal','tank','boss']) {
 const factor=kind==='boss'?0:kind==='normal'?1:1/8;
 fresh(kind);run(`schoolShotHit({x:e.x,y:e.y,vx:100,vy:0,push:80,schools:[],melee:true},e);updateTargetSlide(e,.25)`);near(run('e.x-x'),80*factor);
 fresh(kind);run(`state.upgrades['wind-gust']=1;state.schoolCombat.timers['wind-gust']=0;updateSchoolCombat(0);updateTargetSlide(e,.25)`);near(run('e.x-x'),run('GAME_DATA.schoolRules.gustPush')*factor);
}
// Scaled swept collision still damages both enemies, without recursive collisions.
fresh();run(`state.upgrades['item-wall']=1;globalThis.other=spawnEnemy({typeId:'jaben'});other.x=e.x+35;other.y=e.y;other.hp=10000;waveNeutralHit(e,100,0);updateTargetSlide(e,.25)`);
assert.ok(run('e.hp<10000 && other.hp<10000'));
// Offscreen and wrapped-world protections; armor hook and global switch.
fresh();run('e.x=state.cameraX-100;x=e.x;shiftTarget(e,state.player.x,state.player.y,-300)');near(run('e.x-x'),0);
fresh('tank');run('e.displacementMultiplier=0;shiftTarget(e,state.player.x,state.player.y,80);updateTargetSlide(e,.25)');near(run('e.x-x'),0);
fresh('boss');run('GAME_DATA.knockback.enabled=false;shiftTarget(e,state.player.x,state.player.y,80);updateTargetSlide(e,.25)');near(run('e.x-x'),80);
fresh();run('GAME_DATA.knockback.enabled=true;state.player.x=state.worldWidth-30;updateCamera();e.x=20;e.y=state.player.y;shiftTarget(e,state.player.x,state.player.y,80);updateTargetSlide(e,.25)');near(run('e.x'),100);
// Legacy migration, rejection, saved custom mass used by runtime & body separation.
assert.equal(run('(()=>{const d=SurvivorData.defaults();delete d.knockback;d.enemies.forEach(e=>delete e.mass);return SurvivorData.validate(d).data.enemies.find(e=>e.behavior==="tank").mass})()'),8);
for(const change of ['d.knockback.enabled=1','d.knockback.strength=Infinity','d.knockback.strength=-1','d.knockback.bossMultiplier=2','d.knockback.bossMass=0','d.enemies[0].mass=NaN','d.enemies[0].mass=101']) assert.equal(run(`(()=>{const d=SurvivorData.defaults();${change};return SurvivorData.validate(d).valid})()`),false);
run('globalThis.d=SurvivorData.defaults();d.enemies[0].mass=5;d.knockback.strength=2;SurvivorData.save(d)');
const custom=createRun({maker:true,saved:run.storage});custom(`resetGame();globalThis.e=spawnEnemy({typeId:'jaben'})`);assert.equal(custom('targetMass(e)'),5);near(custom('targetDisplacement(e,90)'),10);
console.log('PASS: pure signed mass scaling, hit/bomb/pull/Maker/wave paths, actual gust distance, boss pin, armor hook, wave collision, offscreen/seams, legacy migration/validation/custom runtime');
