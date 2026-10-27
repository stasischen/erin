// 執行：node games/survivor/tests/boss-range.cjs；真實遊戲函式＋Canvas 指令紀錄，無外部套件。
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
function fresh(upgrades = {}) {
  run(`resetGame(); state.mode='playing'; settingsPanel.hidden=true; state.spawnTimer=999; state.shotTimer=999;
    state.upgrades=${JSON.stringify(upgrades)};
    globalThis.book=(x=state.player.x+40,y=state.player.y,hp=10000)=>({x,y,r:17,hp,maxHp:hp,alive:true,speed:0,damage:1,wobble:0,flash:0,shotCooldown:999});
    state.enemies=[book(),book(state.player.x+85)]; drawCalls.length=0;`);
}
// 每個方向與跨鏡頭位置，直接傷害／普攻／所有流派及合體都不能打畫面外。
const attacks = [
  'damageEnemy(state.enemies[0],35)',
  'hitBuildTarget(target,35)',
  'fireAtNearest(); tick(0)',
  'state.projectiles=[{x:target.x,y:target.y,vx:0,vy:0,r:12,damage:35,pierce:1,hitList:[],alive:true,rangeLeft:100}]; tick(0)',
  'state.bomb={x:target.x,y:target.y,timer:0,delay:1,radius:9999,damage:100,knockback:0,schools:["water","wind","thunder"]}; updateBomb(0)',
  'addField("water",target.x,target.y,9999); addField("wind",target.x,target.y,9999); addField("thunder",target.x,target.y,9999); updateFields(0)',
  'counterDischarge()',
  ...['water','wind','thunder'].map(s=>`state.upgrades["${s}-ultimate"]=1; state.ultimateTimer=0; updateUltimate(0)`),
  'schoolEffect("water",target,target.x,target.y,35)',
  'schoolEffect("thunder",{x:target.x-10,y:target.y},target.x-10,target.y,35)'
];
for (const boss of [false,true]) for (const side of ['left','right','top','bottom']) for (const attack of attacks) {
  fresh({'water-attack':5,'thunder-attack':5,'thunder-counter':5,'fusion-puddle':5,'fusion-storm':5,'fusion-dash':5,'splash-water':5});
  run(`state.enemies=[book()]; globalThis.target=state.enemies[0];
    Object.assign(target, {x:state.cameraX+state.width/2,y:state.cameraY+state.height/2});
    ${side==='left'?'target.x=state.cameraX-40':side==='right'?'target.x=state.cameraX+state.width+40':side==='top'?'target.y=state.cameraY-40':'target.y=state.cameraY+state.height+40'};
    ${boss?'state.boss=target; state.enemies=[]; state.bossIntro=0;':''}
    ${attack.startsWith('damageEnemy') && boss ? 'hitBuildTarget(target,35)' : attack};`);
  assert.equal(run('target.hp'),10000,`${boss?'boss':'book'} ${side}: ${attack}`);
}
// 看得見才能鎖定，進場中老師仍無敵；離開鏡頭後再命中也無效。
fresh(); run('state.enemies=[]; summonTeacher();');
assert.equal(run('closestEnemy()'),null);
assert.ok(run('bossGuide()'));
run('drawCalls.length=0; render();');
assert.ok(run('drawCalls.some(c=>c[0]==="fillText" && c[1]==="老師來了！")'));
assert.ok(run('drawCalls.some(c=>c[0]==="rotate" && c[1]===bossGuide().angle)'));
run('state.boss.x=state.player.x+70; state.boss.y=state.player.y; hitBuildTarget(state.boss,35);');
assert.equal(run('state.boss.hp'),2000);
run('state.bossIntro=0; hitBuildTarget(state.boss,35);'); assert.equal(run('state.boss.hp'),1993); // 新護甲：35×0.2；可見性保護不變。
assert.equal(run('bossGuide()'),null);
run('state.player.x+=800; updateCamera(); hitBuildTarget(state.boss,35);');
assert.equal(run('state.boss.hp'),1993);
// 可見的正常敵人仍會受傷，連鎖不超過每跳 100 距離。
fresh({'thunder-attack':1}); run('state.enemies=[book(state.player.x+20),book(state.player.x+121)]; schoolEffect("thunder",state.enemies[0],state.enemies[0].x,state.enemies[0].y,35);');
assert.equal(run('state.enemies[1].hp'),10000);
run('state.enemies[1].x-=2; schoolEffect("thunder",state.enemies[0],state.enemies[0].x,state.enemies[0].y,35);');
assert.ok(run('state.enemies[1].hp<10000'));
run('damageEnemy(state.enemies[0],35);'); assert.equal(run('state.enemies[0].hp'),9965);
// 半隻剛露出畫面仍受保護；完整進入後普攻可以鎖定。
fresh(); run('state.enemies=[book(state.cameraX+5,state.player.y)]; damageEnemy(state.enemies[0],35);');
assert.equal(run('state.enemies[0].hp'),10000); assert.equal(run('closestEnemy()'),null);
run('state.enemies[0].x=state.cameraX+18; fireAtNearest();'); assert.equal(run('state.projectiles.length'),1);
// 可見怪旁的濺水與閃電不會越過鏡頭邊界。
for (const school of ['water','thunder']) {
  fresh({'water-attack':5,'thunder-attack':5});
  run(`state.enemies=[book(state.cameraX+state.width-30),book(state.cameraX+state.width+10)]; schoolEffect("${school}",state.enemies[0],state.enemies[0].x,state.enemies[0].y,35);`);
  assert.equal(run('state.enemies[1].hp'),10000);
}
// 攻擊距離獨立於鏡頭可見性；超過距離仍不能打。
fresh(); run('state.width=2000; state.height=1000; state.cameraX=0; state.cameraY=0; state.player.x=100; state.player.y=500; state.enemies=[book(900,500)]; damageEnemy(state.enemies[0],35);');
assert.equal(run('state.enemies[0].hp'),10000);
// 邊緣箭頭四向與斜角、手機和平板尺寸、平移鏡頭均保持在畫面內。
for (const [w,h] of [[667,375],[844,390],[1024,768]]) for (const [dx,dy] of [[-2000,0],[2000,0],[0,-2000],[0,2000],[2000,2000]]) {
  fresh(); run(`applyWorldViewport(${w},${h}); state.boss={x:state.cameraX+state.width/2+${dx},y:state.cameraY+state.height/2+${dy},r:32,wobble:0,flash:0,hp:2000,maxHp:2000};`);
  assert.ok(run('bossGuide().x*state.zoom>=30-1e-7 && bossGuide().x*state.zoom<=state.screenWidth-30+1e-7 && bossGuide().y*state.zoom>=30-1e-7 && bossGuide().y*state.zoom<=state.screenHeight-30+1e-7'));
  run('render();');
  assert.ok(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number" || Number.isFinite(v)))'));
}
run('resetGame();'); assert.equal(run('bossGuide()'),null);
console.log('PASS: all damage paths block offscreen books/boss, visible hits, range/chain cap, intro protection/notice, guide four directions/diagonal/phone/iPad/reset');
