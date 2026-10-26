// 執行：node games/survivor/tests/boss-moves.cjs；真實遊戲函式＋Canvas 指令紀錄，無外部套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = require('./load-game.cjs').source(process.env.SURVIVOR_SOURCE);
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const drawCalls = [];
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : ((...args) => drawCalls.push([key, ...args])) });
  function element() { return { style: { setProperty() {} }, dataset: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(fs.readFileSync(`${__dirname}/../icons.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/defaults.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/schema.js`, "utf8"), context);
  require('./load-game.cjs').load(context, process.env.SURVIVOR_SOURCE);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage; context.drawCalls = drawCalls;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() {
  run(`resetGame(); state.mode='playing'; settingsPanel.hidden=true; state.spawnTimer=999; state.shotTimer=999;
    state.boss={x:state.player.x-150,y:state.player.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};
    state.bossRest=999; drawCalls.length=0;`);
}
function advance(seconds) { for(let t=0;t<seconds-0.00001;t+=0.05) run('updateBoss(0.05)'); }
// 每一招完整預警、固定落點／方向、渲染文字；預警前不得扣血、發射或召喚。
for (const id of ['words','chalk','dash','rain','call','summon','ring']) {
  fresh(); run(`beginBossMove("${id}"); globalThis.move=state.bossMoves[0]; globalThis.before=JSON.stringify([move.x,move.y,move.angle,move.points,move.endX,move.endY]); render();`);
  assert.ok(run('drawCalls.some(c=>c[0]==="fillText" && c[1]===BOSS_MOVES.find(row=>row.id===move.id).name+"…")'),id);
  advance(0.85);
  assert.equal(run('move.active'),false,id);
  assert.equal(run('state.player.health'),90,id);
  assert.equal(run('state.enemyShots.length+state.enemies.length'),0,id);
  assert.equal(run('JSON.stringify([move.x,move.y,move.angle,move.points,move.endX,move.endY])===before'),true,id);
  advance(0.05); assert.equal(run('move.active'),true,id);
  run('render();');
  assert.ok(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number" || Number.isFinite(v)))'),id);
}
// 粉筆真的連發且與普通國字不同；每組都有總量上限。
fresh(); run('beginBossMove("chalk");'); advance(0.9);
assert.equal(run('state.enemyShots.length'),5);
advance(0.5); assert.equal(run('state.enemyShots.length'),15);
run('for(let i=0;i<100;i++) fireBossFan({id:"chalk",x:state.player.x-100,y:state.player.y,angle:0,count:7});');
assert.equal(run('state.enemyShots.length'),36);
// 點名／考卷命中可躲、受傷保護不連扣；衝刺全程免傷，落點不跟人。
for (const id of ['call','rain']) {
  fresh(); run(`beginBossMove("${id}");`); advance(0.9); advance(0.05);
  assert.equal(run('state.player.health'),78,id);
  advance(0.15); assert.equal(run('state.player.health'),78,id);
  fresh(); run(`beginBossMove("${id}"); state.player.y-=220;`); advance(1.25);
  assert.equal(run('state.player.health'),90,id+' dodge');
  fresh(); run(`beginBossMove("${id}"); state.dashTimer=.15;`); advance(0.9);
  run('state.player.invincible=.05; updateBoss(.05);'); assert.equal(run('state.player.health'),90,id+' dash');
}
// 衝撞固定紅線端點；玩家離開路線不被追蹤，最後位置在圖內。
fresh(); run('beginBossMove("dash"); globalThis.endX=state.bossMoves[0].endX; state.player.y+=130;'); advance(2);
assert.equal(run('state.boss.x'),run('endX'));
assert.equal(run('state.player.health'),90);
// 罰站圈完整顯示、收縮，綠色缺口沒有碰撞國字；沿缺口逃出不扣血。
for(const [w,h] of [[568,200],[667,275],[844,290],[1024,668]]) for(const edge of ['center','left','right','top','bottom']) {
  fresh(); run(`state.width=${w}; state.height=${h};
    ${edge==='left'?'state.player.x=18':edge==='right'?'state.player.x=state.worldWidth-18':edge==='top'?'state.player.y=18':edge==='bottom'?'state.player.y=state.worldHeight-18':''};
    updateCamera(); state.boss.x=state.cameraX+100; state.boss.y=state.cameraY+100; beginBossMove("ring"); globalThis.ring=state.bossMoves[0];`);
  assert.ok(run('ringPoints({...ring,life:BOSS_TUNING.ringSeconds}).every(targetVisible)'));
  run('state.player.x=ring.x; state.player.y=ring.y;'); advance(.9);
  for(let i=0;i<40;i++) {
    run('state.player.x+=Math.cos(ring.angle)*190*.05; state.player.y+=Math.sin(ring.angle)*190*.05; updateBoss(.05); render();');
  }
  assert.equal(run('state.player.health'),90,`${w} ${edge} gap`);
}
// 血量恰好 66/33% 正確轉場、喊話、清空舊招式；大傷害逐一轉場。
fresh(); run('beginBossMove("rain"); state.boss.hp=1320; updateBoss(0);');
assert.equal(run('state.bossPhase'),2); assert.equal(run('state.bossMoves.length'),0);
assert.equal(run('state.bossShout'),1);
advance(1); run('state.boss.hp=660; updateBoss(0);'); assert.equal(run('state.bossPhase'),3);
fresh(); run('state.boss.hp=600; updateBoss(0);'); assert.equal(run('state.bossPhase'),2);
advance(1); run('updateBoss(0);'); assert.equal(run('state.bossPhase'),3);
advance(1); run('updateBoss(0);'); assert.equal(run('state.bossPhase'),3);
// 三階段休息變短、有雙招，連續組合不重複；每場隨機路線由 Math.random 決定。
for(const phase of [1,2,3]) {
  fresh(); run(`state.bossPhase=${phase}; state.boss.hp=${phase===1?2000:phase===2?1100:500}; globalThis.previous=[]; globalThis.comboSeen=false;`);
  for(let i=0;i<80;i++) {
    run('clearBossMoves(); state.bossRest=0; updateBoss(0);');
    assert.ok(run('state.bossMoves.length>=1 && state.bossMoves.length<=2'));
    assert.ok(run('state.bossMoves.every(m=>!previous.includes(m.id))'));
    run('comboSeen=comboSeen || state.bossMoves.length===2; previous=state.bossMoves.map(m=>m.id);');
    run('clearBossMoves(); state.bossRest=BOSS_TUNING.rests[state.bossPhase-1]; updateBoss(.05);');
    assert.ok(run('state.bossRest<BOSS_TUNING.rests[state.bossPhase-1]'));
  }
  if(phase>1) assert.ok(run('comboSeen'));
}
const orders=[];
for (const random of [0,0.99]) {
  fresh(); run(`Math.random=()=>${random}; globalThis.order=[];`);
  for(let i=0;i<8;i++) run('clearBossMoves(); state.bossRest=0; updateBoss(0); order.push(state.bossMoves[0].id);');
  orders.push(run('JSON.stringify(order)'));
}
assert.notEqual(...orders); run('Math.random=Object.getPrototypeOf(Math).random');
// 畫面外取消招式與國字；回來必須重新預警，場上其他小兵國字仍保留。
fresh(); run('beginBossMove("call"); state.bossRest=0; state.boss.x=state.cameraX-40; updateBoss(1);');
assert.equal(run('state.player.health'),90); assert.equal(run('state.bossMoves.length'),0);
run('state.boss.x=state.player.x-150; updateBoss(.5);');
assert.ok(run('state.bossMoves.length>0 && state.bossMoves.every(m=>!m.active)'));
fresh(); run('beginBossMove("words");'); advance(.9);
run('state.boss.x=state.cameraX-40; tick(0);'); assert.equal(run('state.enemyShots.length'),0);
// 國字飛到鏡頭外後回收；無敵最後一幀、暫停／升級不流逝。
fresh(); run('state.enemyShots.push({source:"teacher",life:4,x:state.cameraX-20,y:state.player.y,r:17,vx:0,vy:0,damage:12}); tick(0);');
assert.equal(run('state.enemyShots.length'),0);
fresh(); run('beginBossMove("rain"); globalThis.before=JSON.stringify(state.bossMoves); state.mode="paused"; tick(1);');
assert.equal(run('JSON.stringify(state.bossMoves)===before'),true);
run('state.mode="levelup"; tick(1);'); assert.equal(run('JSON.stringify(state.bossMoves)===before'),true);
// 小畫面不出無法安全通過的罰站圈；完整遊戲迴圈也能連續出招與轉場。
fresh(); run('state.height=180; beginBossMove("ring");'); assert.equal(run('state.bossMoves.length'),0);
fresh(); run(`state.player.invincible=999; state.bossRest=0;
  globalThis.bossTestExperienceNeeded=experienceNeeded;experienceNeeded=()=>Infinity; // 此段只測 Boss 長時間排程，排除隨機掉落觸發升級。
  for(let i=0;i<2400;i++) {
    if(i===800) state.boss.hp=1300;
    if(i===1600) state.boss.hp=600;
    tick(.05); if(i%30===0) render();
    if(state.mode!=="playing") throw new Error("unexpected mode "+state.mode);
    if(state.bossMoves.length>8 || state.enemyShots.length>48) throw new Error("cap exceeded");
  }
  experienceNeeded=bossTestExperienceNeeded;`);
assert.equal(run('state.bossPhase'),3);
// 上限、池重用、重開、勝敗清理及可關閉震動。
fresh(); run('for(let i=0;i<100;i++) beginBossMove("call");'); assert.equal(run('state.bossMoves.length'),8);
run('globalThis.oldMove=state.bossMoves[0]; clearBossMoves(); beginBossMove("ring");');
assert.ok(run('state.bossMovePool.includes(oldMove) || state.bossMoves.includes(oldMove)'));
run('state.bossShake=.18; gameSettings.vibration=false; render();');
assert.ok(run('drawCalls.some(c=>c[0]==="translate" && c[1]===-state.cameraX && c[2]===-state.cameraY)'));
run('resetGame();'); assert.equal(run('state.bossMoves.length'),0); assert.equal(run('state.bossPhase'),1);
for(const won of [true,false]) { fresh(); run(`beginBossMove("call"); finishRun(${won});`); assert.equal(run('state.bossMoves.length'),0); }
console.log('PASS: seven complete warnings, chalk bursts/caps, fixed/dodgeable impacts, charge, ring exits at edges/sizes, 66/33 phases/skip, random nonrepeat/combos/rest, offscreen safety, pause/reset/pools/shake');
