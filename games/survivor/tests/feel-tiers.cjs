// 固定輸入 → 資料、事件及世界狀態；Godot 可重建這些案例，不依賴畫面。
const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
const run=create(),json=s=>JSON.parse(run(`JSON.stringify(${s})`));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const [level,seconds] of [['small',.05],['medium',.09],['large',.15]]) {
 near(run(`SurvivorFeedback.scale({...SurvivorData.FEEDBACK_TIERS.${level},level:'${level}',hitStop:1,shake:1},1).stop`),seconds);
}
near(run('SurvivorFeedback.trauma(.8,.8,0)'),1);
near(run('SurvivorFeedback.trauma(1,0,.25)'),.55);
near(run('SurvivorFeedback.trauma(.1,0,1)'),0);
assert.deepEqual(json('SurvivorFeedback.camera(1,12,false)'),{x:0,y:0,rotation:0});
for(let i=0;i<100;i++) {
 const camera=json(`SurvivorFeedback.camera(1,${i*.013},true)`);
 assert.ok(Math.abs(camera.x)<=6 && Math.abs(camera.y)<=6 && Math.abs(camera.rotation)<=.012);
}
near(run('SurvivorFeedback.camera(.5,.7,true).x*4'),run('SurvivorFeedback.camera(1,.7,true).x'));
// 撞到怪物一次；剩餘衝量清除後不再觸發；暢通、牆壁及零時間都不觸發。
run('globalThis.motion=SurvivorSlide.impulse(null,100,0,.2);globalThis.blocked=SurvivorSlide.step(motion,.2,10,[{x:50,y:0,r:10}])');
assert.deepEqual(json('SurvivorFeedback.collision(blocked)'),[{type:'slide-blocked',level:'small'}]);
assert.equal(run('blocked.motion'),null);
for(const expr of ['SurvivorSlide.step(blocked.motion,.1,10,[{x:50,y:0,r:10}])','SurvivorSlide.step(motion,.2,10)','SurvivorSlide.step(motion,0,10)','SurvivorSlide.step(motion,.2,10,[],[{x:50,y:-30,width:5,height:60}])'])assert.deepEqual(json(`SurvivorFeedback.collision(${expr})`),[]);
// 純緩衝規則：不改輸入，邊界 .12 秒可執行，過期捨棄，只消費一次。
run("globalThis.pending=SurvivorTiming.buffer(null,{kind:'dash'},.12)");
assert.deepEqual(json('SurvivorTiming.consume(pending,.12,true)'),{buffer:null,command:{kind:'dash'}});
assert.deepEqual(json('pending'),{command:{kind:'dash'},left:.12});
assert.deepEqual(json('SurvivorTiming.consume(pending,.121,true)'),{buffer:null,command:null});
assert.deepEqual(json('SurvivorTiming.consume(null,0,true)'),{buffer:null,command:null});
function fresh(){run(`resetGame();state.mode='playing';GAME_DATA.attackMode='manual';GAME_DATA.hitJuice.enabled=true;GAME_DATA.hitJuice.intensity=1;state.weaponId='candy-sword';state.spawnTimer=Infinity;state.shotTimer=Infinity;state.player.damageDisabled=true;GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;`);}
// 真實交手：雙方停住；第三隻怪、彈幕、遊戲時間繼續。
fresh();run(`globalThis.hit=spawnEnemy({typeId:'jaben'}),other=spawnEnemy({typeId:'jaben'});
hit.x=state.player.x+50;hit.y=state.player.y;hit.hp=10000;hit.speed=100;
other.x=state.player.x-220;other.y=state.player.y;other.speed=100;
globalThis.px=state.player.x,hx=hit.x,ox=other.x;state.keys.add('d');tierImpact('small',state.player,hit);
state.enemyShots=[{x:state.player.x+250,y:state.player.y,r:4,vx:-20,vy:0,life:10,damage:1}];globalThis.sx=state.enemyShots[0].x;tick(.025);`);
near(run('state.player.x'),run('px'));near(run('hit.x'),run('hx'));
assert.ok(run('other.x>ox'));assert.ok(run('state.enemyShots[0].x<sx'));near(run('state.elapsed'),.025);
// 停頓內衝刺 → 解凍第一幀只消耗一次，過期不補發。
run("activateDash();globalThis.charges=state.dashCharges;tick(.025);tick(.01)");
assert.equal(run('state.dashCharges'),run('charges')-1);assert.equal(run('state.inputBuffer'),null);
run('tick(.01)');assert.equal(run('state.dashCharges'),run('charges')-1);
fresh();run("state.player.hitStop=.15;activateDash();tick(.05);tick(.05);tick(.05);tick(.01)");assert.equal(run('state.dashCharges'),run('maxDashCharges()'));
// 收招內按下、放開攻擊；第一個 ready 幀執行一次，不受之後放開重複。
fresh();run(`activeWeapon().timing={windup:0,active:.05,recovery:.04,cooldown:0,inputBuffer:.12};
state.manualTiming={phase:'recovery',left:.04,entered:false,config:activeWeapon().timing};
beginManualAttack('attack');releaseManualAttack('attack');tick(.04);globalThis.swings=state.swingCount;tick(.01);`);
assert.equal(run('swings'),1);assert.equal(run('state.swingCount'),1);
// 碰撞接合層：不推動擋路者，像素粒子受回饋開關控制。
fresh();run(`globalThis.a=spawnEnemy({typeId:'jaben'}),b=spawnEnemy({typeId:'jaben'});a.x=state.player.x+80;a.y=state.player.y;b.x=a.x+60;b.y=a.y;
globalThis.bx=b.x;shiftTarget(a,a.x-10,a.y,100);globalThis.before=state.effects.length;updateTargetSlide(a,.25);globalThis.after=state.effects.length;updateTargetSlide(a,.25);`);
near(run('b.x'),run('bx'));assert.ok(run('after>before'));assert.equal(run('state.effects.length'),run('after'));assert.ok(run('a.impactSquash>0'));
// 預設／自訂值與時機緩衝能儲存再載入，非法值不能進入引擎。
run(`globalThis.d=SurvivorData.validate(SurvivorData.defaults()).data;
globalThis.f=d.weapons[2].blocks.moves[0].feedback;Object.assign(f,SurvivorData.FEEDBACK_TIERS.large,{level:'large',hitStop:1,shake:1});f.particles=7;
d.weapons[2].blocks.moves[0].timing.phases.inputBuffer=.14;globalThis.saved=SurvivorData.save(d);globalThis.loaded=SurvivorData.load();`);
assert.equal(run('saved.valid'),true);assert.deepEqual(json('saved.data'),json('loaded.data'));
assert.equal(run('loaded.data.weapons[2].feedback.primary.particles'),7);
near(run('loaded.data.weapons[2].timing.inputBuffer'),.14);
for(const change of ["f.level='invalid'","f.stopSeconds=.2","f.trauma=1.1","f.particles=Infinity","f.flash=-1","d.weapons[2].blocks.moves[0].timing.phases.inputBuffer=.09"]) {
 run(`d=SurvivorData.copy(saved.data);f=d.weapons[2].blocks.moves[0].feedback;${change}`);
 assert.equal(run('SurvivorData.validate(d).valid'),false,change);
}
console.log('PASS: tiers, trauma cap/decay/quadratic camera/off/bounds, once-only blocked slide, pure buffer boundary/expiry, local actor pause with live world, real dash/attack buffer, collision pixels/no push, Maker roundtrip/rejection');
