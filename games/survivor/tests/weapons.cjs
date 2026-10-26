// 固定位置、操作與 dt → 預期命中／傷害／事件；可移植到另一個引擎。
const assert=require('node:assert/strict'), createRun=require('./maker-support.cjs');
const run=createRun(), json=code=>JSON.parse(run(`JSON.stringify(${code})`));
function fresh(ids=[]) {run(`resetGame();state.mode='playing';settingsPanel.hidden=true;state.weaponId='candy-hammer';state.spawnTimer=999;state.shotTimer=999;state.player.x=400;state.player.y=300;updateCamera();state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,1]));globalThis.book=(dx=50,dy=0,hp=10000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y+dy,r:8,speed:0,damage:0,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});state.enemies=[book()];`);}
// Sector boundary, rear, outside reach, full spin, and branch-cut angles.
fresh();run(`globalThis.e=SurvivorWeapons.swing(activeWeapon(),1,0,{extraArc:0,size:1,damage:20,push:0});`);
assert.equal(run('e.arc'),Math.PI*2/3);assert.equal(run('e.radius'),70);assert.equal(run('e.damage'),32);
for(const [x,y,r,expected] of [[50,0,8,true],[-50,0,8,false],[80,0,8,false],[78,0,8,true],[0,0,8,true],[35,60.62,1,true],[35,65,1,false]]) assert.equal(run(`SurvivorWeapons.intersects(${x},${y},${r},e)`),expected);
run('e.angle=Math.PI-.01');assert.equal(run('SurvivorWeapons.intersects(-50,-1,2,e)'),true);
run('e.arc=Math.PI*2');assert.equal(run('SurvivorWeapons.intersects(50,0,8,e)'),true);
// A normal cleave hits all targets in front once; fourth swing hits behind too.
fresh();run('state.enemies=[book(),book(40,20),book(-50),book(100)];fireAtNearest();');
const damage=run('PROJECTILE_DAMAGE*1.6');
assert.deepEqual(json('state.enemies.map(e=>e.hp)'),[10000-damage,10000-damage,10000,10000]);assert.equal(run('state.projectiles.length'),0);assert.equal(run('state.swingCount'),1);
run('state.enemies=[book(50),book(-50)];state.swingCount=3;state.weaponAttack=null;fireAtNearest();');assert.ok(run('state.enemies.every(e=>e.hp<10000)'));assert.equal(run('state.vfx.filter(v=>v.kind==="hammer-swing").pop().spin'),true);
// No target in reach preserves fourth swing, dash boost, charge and shot counter.
fresh(['thunder-charge']);run('state.enemies=[book(200)];state.swingCount=3;state.weaponAttack=null;state.dashAttack=1;state.schoolCombat.kills=10;fireAtNearest();');assert.equal(run('state.swingCount'),3);assert.equal(run('state.dashAttack'),1);assert.equal(run('state.schoolCombat.shots+state.schoolCombat.chargedUsed'),0);
run('state.enemies=[book(50)];fireAtNearest();');assert.equal(run('state.dashAttack'),0);assert.equal(run('state.schoolCombat.chargedUsed'),1);assert.ok(run('state.vfx.some(v=>v.kind==="hammer-swing"&&v.boosted)'));
// 0.7s cadence, rapid cards and movement attack-rate apply to the hammer.
fresh();assert.equal(run('effectiveShotInterval()'),.7);run('state.shotTimer=0;tick(0);for(let i=0;i<13;i++)tick(.05);tick(.04);');assert.equal(run('state.swingCount'),1);run('state.enemies=[book()];tick(.011)');assert.equal(run('state.swingCount'),2);
fresh(['rapid-water']);assert.ok(run('effectiveShotInterval()')<.7);
// Size, water form, multishot and piercing map to cleave dimensions.
fresh(['big-water','multi-water','piercing-water','water-drop']);run('state.schoolCombat.shots=GAME_DATA.schoolRules.bigDropEvery-1;fireAtNearest();');assert.ok(run('state.vfx.find(v=>v.kind==="hammer-swing").radius')>70);assert.ok(run('state.vfx.find(v=>v.kind==="hammer-swing").arc')>Math.PI*2/3);
// Main school / fusion colors, wet hit and lightning; no blade projectiles.
fresh(['water-attack','wind-attack','fusion-storm']);run('fireAtNearest();render();');assert.deepEqual(json('state.vfx.find(v=>v.kind==="hammer-swing").colors'),['water','wind']);assert.ok(run('state.enemies[0].wetTimer')>0);
fresh(['thunder-attack']);run('state.enemies=[book(50),book(130)];fireAtNearest();render();');assert.ok(run('state.enemies[1].hp')<10000);assert.ok(run('state.vfx.some(v=>v.kind==="lightning")'));
fresh(['wind-blade']);run('state.enemies=[book(40),book(-50)];fireAtNearest();');assert.equal(run('state.projectiles.length'),0);assert.ok(run('state.enemies[1].hp')<10000);
fresh(['item-rear']);run('state.enemies=[book(),book(-50)];fireAtNearest();');assert.ok(run('state.enemies.every(e=>e.hp<10000)'));
// 15% mitigation is shared by contact/words/hazards/boss; one-hit bubble still absorbs.
fresh();assert.equal(run('absorbSchoolHit(20)'),17);run('state.schoolCombat.bubble=true');assert.equal(run('absorbSchoolHit(20)'),0);assert.equal(run('absorbSchoolHit(20)'),17);run("state.weaponId='water-ball'");assert.equal(run('absorbSchoolHit(20)'),20);
// Offscreen and intro bosses stay protected; visible boss can be defeated with a swing.
fresh();run('state.enemies=[book(500)];fireAtNearest();');assert.equal(run('state.swingCount'),0);
fresh();run('state.enemies=[];summonTeacher();state.boss.x=state.player.x+50;state.boss.y=state.player.y;state.boss.hp=1;fireAtNearest();');assert.equal(run('state.boss.hp'),1);run('state.bossIntro=0;fireAtNearest();');assert.equal(run('state.mode'),'transition');assert.equal(run('state.weaponId'),'candy-hammer');assert.equal(run('state.swingCount'),1);
// Restart clears weapon and counters; picker clock stays frozen and stale callbacks ignored.
run('startGame();tick(2);');assert.equal(run('state.elapsed'),0);assert.equal(run('state.swingCount'),0);assert.equal(run('state.pendingChoices.length'),3);assert.equal(run('state.pickingWeapon'),true);
run('globalThis.old=state.pendingChoices;applyUpgrade(1);applyUpgrade(0,old);');assert.equal(run('state.weaponId'),'candy-hammer');assert.equal(run('Object.keys(state.upgrades).length'),0);assert.equal(run('state.schoolRun.starter'),null);assert.equal(run('buildAppearance().main'),'water');
// Bounded visuals after many swings, and legacy/custom Maker data round-trips.
fresh();run('for(let i=0;i<200;i++)fireAtNearest();');assert.ok(run('state.vfx.length<=VFX_TUNING.limit'));assert.equal(run('state.projectiles.length'),0);
run('globalThis.d=SurvivorData.defaults();delete d.weapons;globalThis.m=SurvivorData.validate(d);');assert.equal(run('m.valid'),true);assert.equal(run('m.data.weapons[1].interval'),.7);
for(const [field,v] of [['radius',151],['interval',0],['damageReduction',.51],['spinEvery',2.5]]) assert.equal(run(`(()=>{const d=SurvivorData.defaults();d.weapons[1].${field}=${v};return SurvivorData.validate(d).valid})()`),false);
run("d=SurvivorData.defaults();d.weapons[1].radius=100;d.weapons[1].interval=1;SurvivorData.save(d)");const custom=createRun({maker:true,saved:run.storage});custom("resetGame();state.weaponId='candy-hammer'");assert.equal(custom('activeWeapon().radius'),100);assert.equal(custom('effectiveShotInterval()'),1);
console.log('PASS: weapon picker, sector boundaries/spin/cadence, cards/dash/colors/mitigation, boss visibility/stage/restart, bounded visuals and Maker migration/ranges');

// 真實獨立展示沿用所選武器，近距離假怪會被錘子命中。
const preview=createRun({preview:{data:json('SurvivorData.defaults()'),spec:{kind:'card',id:'big-water',level:1,weaponId:'candy-hammer'}}});
preview('stepPreview(.26);paintPreview()');assert.equal(preview('state.weaponId'),'candy-hammer');assert.ok(preview('state.enemies.some(e=>e.hp<100000)'));assert.equal(preview('state.projectiles.length'),0);
console.log('PASS: equipped hammer preview uses real melee targets, hits and rendering');

// 真實接觸傷害與 tick 中的最後一擊，不能繼續更新已換場的狀態。
fresh();run('state.enemies=[book(0)];state.enemies[0].damage=20;globalThis.health=state.player.health;tick(0)');assert.equal(run('health-state.player.health'),4.25);
fresh();run('state.stageIndex=STAGES.length-1;state.enemies=[];summonTeacher();state.bossIntro=0;state.boss.x=state.player.x+40;state.boss.y=state.player.y;state.boss.hp=1;state.shotTimer=0;tick(0)');assert.equal(run('state.mode'),'won');
console.log('PASS: live contact mitigation and final boss melee kill through tick');
