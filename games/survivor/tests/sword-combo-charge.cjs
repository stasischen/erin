// 固定世界座標、dt、操作 → 連段／蓄力／命中事件；不依賴實際畫面或時鐘。
const assert=require('node:assert/strict'),fs=require('node:fs'),createRun=require('./maker-support.cjs');
const run=createRun(),json=code=>JSON.parse(run(`JSON.stringify(${code})`));
function fresh(weapon='candy-sword') {
 run(`resetGame();state.mode='playing';settingsPanel.hidden=true;state.weaponId='${weapon}';state.spawnTimer=999;state.shotTimer=999;state.player.x=400;state.player.y=300;state.player.damageDisabled=true;updateCamera();globalThis.book=(dx=45,dy=0,hp=10000)=>({typeId:'jaben',behavior:'still',x:state.player.x+dx,y:state.player.y+dy,r:5,speed:0,damage:0,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});state.enemies=[book()];`);
}
fresh();
// Pure rules: wrap 1,2,3,1; exact reset boundary; inputs remain unmodified.
run('globalThis.w=activeWeapon();globalThis.p={number:2,idle:.5,charge:.5,moving:false};globalThis.snapshot=JSON.stringify(p);globalThis.q=SurvivorEffectBlocks.attackTick(p,w,.6,false)');
assert.equal(run('JSON.stringify(p)===snapshot'),true);assert.equal(run('q.number'),0);assert.equal(run('q.charge'),1);
run('q=SurvivorEffectBlocks.attackTick(p,w,.1,true)');assert.equal(run('q.charge'),.175);
run('q=SurvivorEffectBlocks.attackTick(q,w,.2,true)');assert.equal(run('q.charge'),.175); // retention only on movement start
run('q=SurvivorEffectBlocks.attackTick(q,{...w,moveRetention:0},.1,false);q=SurvivorEffectBlocks.attackTick(q,{...w,moveRetention:0},.1,true)');assert.equal(run('q.charge'),0);
run('q=SurvivorEffectBlocks.attackTick(p,{...w,chargeEnabled:false},1,false)');assert.equal(run('q.charge'),0);
run('globalThis.numbers=[];q=null;for(let i=0;i<4;i++){let a=SurvivorEffectBlocks.attack(q,w);numbers.push(a.event.number);q=a.state}');assert.deepEqual(json('numbers'),[1,2,3,1]);
run('q=SurvivorEffectBlocks.attack({number:2,idle:0,charge:1,moving:false},w)');assert.equal(run('q.event.charged'),true);assert.equal(run('q.state.charge'),0);
// Direction and shapes are data-driven; charged shape cannot be a circle even with multishot arc.
assert.equal(run('SurvivorWeapons.aim({...w,direction:"facing"},0,1,1,0)'),0);
assert.equal(run('SurvivorWeapons.aim({...w,direction:"nearest"},0,1,1,0)'),Math.PI/2);
run('globalThis.custom=SurvivorWeapons.swing({...w,chargeShape:"sector"},3,0,{extraArc:20,size:1,damage:20,push:0},{charged:true})');
assert.equal(run('custom.arc'),Math.PI);assert.equal(run('custom.spin||custom.thrust'),false);
// Normal sword cleaves front, reverse slash has independent visual, third is long narrow thrust.
fresh();run('state.enemies=[book(),book(40,20),book(-45)];fireAtNearest()');
assert.deepEqual(json('state.enemies.map(e=>e.hp)'),[9965,9965,10000]);assert.equal(run('state.vfx[0].arc'),100*Math.PI/180);
run('state.enemies=[book()];fireAtNearest()');assert.equal(run('state.vfx.filter(v=>v.kind==="hammer-swing").pop().reverse'),true);
run('state.enemies=[book(100),book(95,40),book(-150)];globalThis.oldX=state.player.x;fireAtNearest()');
assert.equal(run('state.lastWeaponAttack.number'),3);assert.equal(run('state.lastWeaponAttack.finisher'),true);
assert.deepEqual(json('state.enemies.map(e=>e.hp)'),[9912.5,10000,10000]);assert.equal(run('state.player.x-oldX'),12);assert.equal(run('state.attackRecovery'),.35);
run('globalThis.e=state.vfx.filter(v=>v.kind==="hammer-swing").pop()');assert.equal(run('SurvivorWeapons.intersects(125,18,5,e)'),true);assert.equal(run('SurvivorWeapons.intersects(-6,0,5,e)'),false);assert.equal(run('SurvivorWeapons.intersects(80,24,5,e)'),false);
// No reachable target preserves full charge, combo step and dash bonus.
fresh();run('state.weaponAttack={number:2,idle:0,charge:1,moving:false};state.dashAttack=1;state.enemies=[book(250)];fireAtNearest()');
assert.equal(run('state.weaponAttack.charge'),1);assert.equal(run('state.weaponAttack.number'),2);assert.equal(run('state.swingCount'),0);assert.equal(run('state.dashAttack'),1);
// Charged sword is a long piercing line; hammer is a forward sector with stun, never a full circle.
for(const weapon of ['candy-sword','candy-hammer']) {
 fresh(weapon);run('state.weaponAttack={number:0,idle:0,charge:1,moving:false};state.enemies=[book(80),book(-100)];fireAtNearest();render()');
 assert.equal(run('state.lastWeaponAttack.charged'),true);assert.equal(run('state.weaponAttack.charge'),0);assert.ok(run('state.enemies[0].hp')<10000);
 assert.equal(run('state.enemies[1].hp<10000'),false);
 assert.equal(run('state.vfx.filter(v=>v.kind==="hammer-swing").pop().thrust'),weapon==='candy-sword');
 if(weapon==='candy-hammer') assert.equal(run('state.enemies[0].stunTimer'),.8);
}
// Dash ending bypasses regular cooldown, yields one thrust, and keeps skill behavior.
fresh();run('state.dashTimer=.05;state.dashX=1;state.dashY=0;state.enemies=[book(100)];tick(.05)');assert.equal(run('state.swingCount'),1);assert.equal(run('state.vfx.some(v=>v.thrust)'),true);
run('tick(.05)');assert.equal(run('state.swingCount'),1);
fresh();run('activateSkill()');assert.equal(run('state.bomb.damage'),run('gameSettings.bombDamage'));
// Third projectile is larger; it splashes nearby enemies once, not its direct victim twice.
fresh('water-ball');run('fireAtNearest();fireAtNearest();fireAtNearest();globalThis.s=state.projectiles[2]');assert.equal(run('s.bigBubble'),true);assert.equal(run('s.r/state.projectiles[0].r'),1.5);
run('s.x=state.enemies[0].x;s.y=state.enemies[0].y;s.hitList=[state.enemies[0]];state.enemies.push(book(65,10));resolveWaterHit(s)');assert.equal(run('state.enemies[0].hp'),10000);assert.ok(run('state.enemies[1].hp')<10000);run('globalThis.h=state.enemies[1].hp;resolveWaterHit(s)');assert.equal(run('state.enemies[1].hp'),run('h'));
// Charged projectile pierces multiple targets; pool reuse clears special status.
fresh('water-ball');run('state.weaponAttack={number:0,idle:0,charge:1,moving:false};fireAtNearest();globalThis.s=state.projectiles[0];');assert.equal(run('s.autoCharged&&s.piercing'),true);run('resolveWaterHit(s)');assert.equal(run('s.alive'),true);
run('state.projectiles=[];state.projectilePool=[s];fireAtNearest()');assert.equal(run('state.projectiles[0].autoCharged'),false);assert.equal(run('state.projectiles[0].bigBubble'),false);
// A bubble splash may defeat the final boss while hitting a minion: stop the current tick.
fresh('water-ball');run('state.stageIndex=STAGES.length-1;summonTeacher();state.bossIntro=0;state.boss.x=state.player.x+60;state.boss.y=state.player.y;state.boss.hp=1;state.weaponAttack={number:2,idle:0,charge:0,moving:false};fireAtNearest();tick(.05);tick(.05)');assert.equal(run('state.mode'),'won');
// Live idle charging and moving retention; pause freezes progress; new stage/restart clears sequence.
fresh();run('for(let i=0;i<20;i++)tick(.05)');assert.equal(run('state.weaponAttack.charge'),1);
run("state.keys.add('ArrowRight');tick(.05)");assert.ok(run('state.weaponAttack.charge')<1);run("state.mode='paused';globalThis.c=state.weaponAttack.charge;tick(.5)");assert.equal(run('state.weaponAttack.charge'),run('c'));
run('resetGame()');assert.equal(run('state.weaponAttack'),null);
// Data-driven combo-step card triggers once on configured step, never on attempts with no hit.
fresh();run(`UPGRADES[0].effects=[{type:'aoe',trigger:'combo',comboStep:2,damage:10,radius:150,interval:.4}];state.upgrades[UPGRADES[0].id]=1;state.enemies=[book(200)];fireAtNearest();state.enemies=[book()];fireAtNearest();`);
assert.equal(run('Object.keys(state.makerTimers).length'),0);run('fireAtNearest()');assert.ok(run('Object.keys(state.makerTimers).length')>0);
// Every card has sword wording; fallback works and projectile-only split cannot be offered to melee.
fresh();assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="item-split"))'),false);assert.equal(run('UPGRADES.every(c=>typeof c.descriptionSword==="string")'),true);
assert.equal(run("SurvivorWeapons.cardNote({description:'遠程',descriptionMelee:'近戰'},activeWeapon())"),'近戰');
// Migration from older two-weapon saves, optional fields, invalid values and combo trigger survive round trip.
run('globalThis.d=SurvivorData.defaults();d.weapons.pop();d.weapons.forEach(w=>{for(const k of Object.keys(SurvivorData.ATTACK_BOUNDS))delete w[k];delete w.chargeEnabled;delete w.comboEnabled;delete w.dashThrust});d.cards.forEach(c=>delete c.descriptionSword);globalThis.m=SurvivorData.validate(d)');assert.equal(run('m.valid'),true);assert.equal(run('m.data.weapons.length'),3);
for(const expr of ['d.weapons[2].chargeShape="spin"','d.weapons[2].direction="random"','d.weapons[2].comboEvery=2.5','d.weapons[0].chargeSeconds=0','d.weapons[1].moveRetention=1.1','d.weapons[2].chargeEnabled="yes"','d.cards[0].descriptionSword="<x>"','d.weapons.push(d.weapons[0])']) assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expr};return SurvivorData.validate(d).valid})()`),false);
run('d=SurvivorData.defaults();d.cards[0].effects=[{type:"aoe",trigger:"combo",comboStep:2,...SurvivorData.PARAMS}];m=SurvivorData.validate(d)');assert.equal(run('m.valid'),true);assert.equal(run('m.data.cards[0].effects[0].comboStep'),2);
run('d.cards[0].effects[0].comboStep=0');assert.equal(run('SurvivorData.validate(d).valid'),false);
// Real sword practice and card preview use actual attack state and renderer.
const practice=createRun();practice('globalThis.frameElement={}');practice(fs.readFileSync(`${__dirname}/../practice-rules.js`,'utf8'));practice(fs.readFileSync(`${__dirname}/../practice-engine.js`,'utf8'));
practice("practiceId='candy-sword';practiceReset();for(let i=0;i<80;i++)practiceStep(.05)");assert.equal(practice('state.weaponId'),'candy-sword');assert.ok(practice('state.swingCount')>0);assert.match(practice.elements.practiceStats.textContent,/連段.*聚氣/);
const preview=createRun({preview:{data:json('SurvivorData.defaults()'),spec:{kind:'card',id:'big-water',level:1,weaponId:'candy-sword'}}});preview('stepPreview(.26);paintPreview()');assert.ok(preview('state.enemies.some(e=>e.hp<100000)'));assert.equal(preview('state.projectiles.length'),0);
console.log('PASS: pure combo/charge boundaries, three sword shapes and step, no-target conservation, charge waves, dash end, bubble splash/pierce/pools, pause/reset, Nth-card trigger, sword notes, Maker migration and practice/preview');
