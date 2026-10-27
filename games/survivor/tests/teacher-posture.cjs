// 固定輸入 → 秒數、事件、世界座標；可移植到其他引擎重建相同案例。
const assert=require('node:assert/strict'),run=require('./maker-support.cjs')();
const json=code=>JSON.parse(run(`JSON.stringify(${code})`));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
run('globalThis.cfg=GAME_DATA.boss.posture;globalThis.rules=SurvivorPosture;');
for(const [t,want] of [[-.01,false],[0,true],[.1999,true],[.2,true],[.2001,false],[Infinity,false]])assert.equal(run(`rules.perfect(${t},.2)`),want);
close(run('rules.contact(100,0,-100,0,20)'),.8);
assert.equal(run('rules.contact(100,0,100,0,20)'),Infinity);
assert.equal(run('rules.contact(100,100,-100,0,20)'),Infinity);
run("globalThis.rule=SurvivorEffectBlocks.event('posture','onPerfectDodge',GAME_DATA);globalThis.p={value:50,stun:0};globalThis.snapshot=JSON.stringify(p);globalThis.r=rules.step(p,rule,cfg,.1)");
assert.equal(run('JSON.stringify(p)'),run('snapshot'));assert.equal(run('r.state.value'),80);
close(run('rules.step({value:50,stun:0},null,cfg,2).state.value'),38);
assert.equal(run('rules.step({value:1,stun:0},null,cfg,2).state.value'),0);
run('r=rules.step({value:80,stun:0},rule,cfg)');
assert.equal(run('r.state.stun'),2.5);assert.equal(run('r.state.value'),0);assert.equal(run('r.events.length'),1);
assert.equal(run('rules.step(r.state,rule,cfg,.1).events.length'),0);
close(run('rules.step(r.state,null,cfg,2.5).state.stun'),0);
assert.deepEqual(json('rules.bonuses(r.state,cfg)'),{charge:1.5,damage:3});
assert.deepEqual(json('rules.bonuses(rules.initial(),cfg)'),{charge:1,damage:1});
// 同一資料配方可套任意角色狀態；事件本身不帶主角／老師或繪圖物件。
assert.deepEqual(json("rules.step({value:80,stun:0},SurvivorEffectBlocks.event('posture','onInterrupt',GAME_DATA),cfg).events[0].actions"),[{type:'stun',duration:2.5},{type:'heal',amount:4}]);
function fresh(weapon='candy-sword') {
 // 這組保留未掛新弱點積木時的既有架勢契約；新部位/護甲/3倍不疊乘在 weakpoint.cjs 驗證。
 run(`GAME_DATA.boss.weakpoint=null;GAME_DATA.attackMode='manual';resetGame();state.mode='playing';state.weaponId='${weapon}';state.player.damageDisabled=false;state.player.invincible=0;state.spawnTimer=999;state.shotTimer=999;summonTeacher();state.bossIntro=0;state.bossRest=999;state.boss.x=state.player.x+70;state.boss.y=state.player.y;state.boss.speed=0;updateCamera();`);
}
// 老師落地：預警最後 .2 秒以外不算；真正落地前 .2 秒才算，不能把起跳誤當命中。
fresh();run("beginBossMove('podium-leap');globalThis.m=state.bossMoves[0];m.warning=.1");
assert.equal(run('teacherDodgeThreat()===null'),true);
run('m.active=true;m.life=.201');assert.equal(run('teacherDodgeThreat()===null'),true);
run('m.life=.2');assert.equal(run('teacherDodgeThreat()===m'),true);
run('activateDash()');assert.equal(run('state.boss.posture.value'),30);assert.equal(run('state.player.perfectFlash'),.35);
run('state.dashTimer=0;state.dashCharges=1;state.player.invincible=0;activateDash()');assert.equal(run('state.boss.posture.value'),30);
// 離開範圍不發獎勵；傷害關閉、太早、正在收招、0 傷害也不算。
for(const change of ['m.life=.201','state.player.y+=500','m.recovery=.5','state.player.damageDisabled=true']) {
 fresh();run("beginBossMove('podium-leap');globalThis.m=state.bossMoves[0];m.active=true;m.life=.1;"+change);assert.equal(run('teacherDodgeThreat()===null'),true);
}
// 老師衝撞和高速粉筆採第一次圓形接觸時間，背後或遠離的彈不算。
fresh();
run("clearBossMoves();beginBossMove(BOSS_MOVES.find(m=>m.kind==='dash').id);globalThis.m=state.bossMoves[0];m.active=true;m.warning=0;state.boss.x=state.player.x-70;m.endX=state.player.x+100;m.endY=state.player.y");
assert.equal(run('teacherDodgeThreat()===m'),true);
fresh();run("state.enemyShots=[{source:'teacher',x:state.player.x+state.player.r+10+20,y:state.player.y,vx:-100,vy:0,r:10,damage:5,life:1,dodged:false}]");
assert.equal(run('teacherDodgeThreat()===state.enemyShots[0]'),true);
run('state.enemyShots[0].vx=100');assert.equal(run('teacherDodgeThreat()===null'),true);
// 收招命中累積；普通命中不累積；暈眩打斷立刻清空招式且只獎勵一次。
fresh();run('hitBuildTarget(state.boss,1)');assert.equal(run('state.boss.posture.value'),0);
run('state.boss.recoveryLeft=.6;hitBuildTarget(state.boss,1)');assert.equal(run('state.boss.posture.value'),12);
run("state.boss.recoveryLeft=0;beginBossMove('podium-leap');stunTarget(state.boss,.8)");assert.equal(run('state.bossMoves.length'),0);assert.equal(run('state.boss.posture.value'),34);
run('stunTarget(state.boss,.8)');assert.equal(run('state.boss.posture.value'),34);
// 破架勢：清招、回血封頂、2.5 秒內不移動／出招／接觸傷害；重設不殘留。
fresh();run("state.boss.posture.value=90;state.player.health=maxPlayerHealth()-2;beginBossMove('podium-leap');teacherPostureEvent('onPerfectDodge')");
assert.equal(run('state.bossMoves.length'),0);assert.equal(run('state.player.health'),run('maxPlayerHealth()'));
assert.equal(run('state.boss.posture.stun'),2.5);
run('globalThis.oldX=state.boss.x;updateBoss(.5)');assert.equal(run('state.boss.x'),run('oldX'));assert.equal(run('state.bossMoves.length'),0);close(run('state.boss.posture.stun'),2);
run('updateBoss(2)');assert.equal(run('teacherBonuses().charge'),1);
// 手動與自動聚氣都加快 50%，連段／收招時間仍用真實秒數。
fresh();run("state.boss.posture={value:0,stun:2.5};beginManualAttack('attack');tickManualAttack(.4)");
close(run('state.weaponAttack.charge'),.6);close(run('state.weaponAttack.idle'),.4);
close(run('SurvivorEffectBlocks.attackTick(null,activeWeapon(),.4,false,teacherBonuses().charge).charge'),.6);
run('cancelManualAttack()');
// 同樣的重擊在暈眩時三倍；普攻、普通暈眩或弱點結束後沒有倍率。
for(const [posture,charged,want] of [[2.5,true,30],[2.5,false,10],[0,true,10]]) {
 fresh();run(`state.boss.posture={value:0,stun:${posture}};state.boss.stunTimer=1;globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,10,{charged:${charged}})`);close(run('hp-state.boss.hp'),want);
}
// 真正的手動揮擊命中弱點，後射卡也不得讓蓄力打到後方。
fresh();run("state.boss.posture={value:0,stun:2.5};state.upgrades={'item-rear':1};state.enemies=[{x:state.player.x-80,y:state.player.y,r:5,hp:1000,maxHp:1000,alive:true,flash:0}];state.weaponAttack={number:0,idle:0,charge:activeWeapon().chargeSeconds};globalThis.hp=state.boss.hp;swingAtNearest(false,{angle:0});");
close(run('hp-state.boss.hp'),run('effectiveDamage()*activeWeapon().damageMultiplier*activeWeapon().chargeMultiplier*3'));
assert.equal(run('state.enemies[0].hp'),1000);
// 真正的蓄力水球也只對暈眩老師三倍；狀態在命中時判定。
fresh('water-ball');run("state.boss.posture={value:0,stun:2.5};state.weaponAttack={number:0,idle:0,charge:activeWeapon().chargeSeconds};fireAtNearest({angle:0});globalThis.s=state.projectiles[0];globalThis.damage=s.damage;globalThis.hp=state.boss.hp;s.x=state.boss.x;s.y=state.boss.y;s.vx=0;s.vy=0;tick(0)");
close(run('hp-state.boss.hp'),run('damage*3'));
// 自動蓄力也只有前方水球，後射卡不會偷偷補發背後蓄力彈。
fresh('water-ball');run("GAME_DATA.attackMode='auto';state.upgrades={'item-rear':1,'multi-water':5};state.weaponAttack={number:0,idle:0,charge:activeWeapon().chargeSeconds};fireAtNearest()");
assert.equal(run('state.projectiles.every(s=>s.autoCharged&&s.vx>=-1e-7)'),true);
// 跨接縫與暫停／重開：規則使用 wrapped 世界距離，沒有背景計時器。
fresh();run("state.player.x=state.worldWidth-20;state.boss.x=50;state.enemyShots=[{source:'teacher',x:state.player.x+48,y:state.player.y,vx:-100,vy:0,r:10,damage:5,life:1,dodged:false}];state.enemyShots[0].x=wrapCoordinate(state.enemyShots[0].x,state.worldWidth)");
assert.equal(run('teacherDodgeThreat()===state.enemyShots[0]'),true);
run("state.boss.posture={value:70,stun:0};state.mode='paused';tick(1)");assert.equal(run('state.boss.posture.value'),70);
// 新舊 Maker 作品、範圍／非有限值；沒有新欄位的作品得到預設值。
run('globalThis.d=SurvivorData.defaults();delete d.boss.posture;globalThis.validated=SurvivorData.validate(d)');assert.equal(run('validated.valid'),true);assert.equal(run('validated.data.boss.posture.window'),.2);
for(const key of Object.keys(json('cfg')))for(const value of ['Infinity','NaN','-1','9999'])assert.equal(run(`(()=>{const d=SurvivorData.defaults();d.boss.posture.${key}=${value};return SurvivorData.validate(d).valid})()`),false,key+value);
run('d=SurvivorData.defaults();d.boss.posture.dodgeGain=40;d.boss.posture.stunSeconds=3;globalThis.out=SurvivorData.validate(JSON.parse(JSON.stringify(d)))');assert.equal(run('out.valid'),true);assert.equal(run('out.data.boss.posture.dodgeGain'),40);assert.equal(run('out.data.boss.posture.stunSeconds'),3);
fresh();assert.equal(run('state.boss.posture.stun'),0);assert.equal(run('state.boss.posture.value'),0);run('render();updateHud()');
console.log('PASS: pure perfect contact/window, shared posture effects/decay/break, dodge deduplication, interruption/recovery, capped healing, manual/auto 50% charge, 3x charged-only damage, forward attack and Maker migration/bounds');
