// 執行：node games/survivor/tests/dash-skill.cjs；DOM／Canvas stub，不需套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : (() => {}) });
  function element() { return { style: { setProperty(key, value) { this[key] = value; } }, dataset: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/defaults.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/schema.js`, "utf8"), context);
  vm.runInContext(source, context);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
run("resetGame(); state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999;");
assert.equal(run('state.worldWidth'), 2400); assert.equal(run('state.worldHeight'), 1800);
assert.equal(run('state.player.x - state.cameraX'),400); assert.equal(run('state.player.y - state.cameraY'),300);
run("state.keys.add('d'); tick(.05);");
assert.equal(run('state.player.x - state.cameraX'),400);
for (const [x,y,cx,cy] of [[18,18,0,0],[2382,1782,1600,1200],[18,1782,0,1200],[2382,18,1600,0]]) {
  run(`state.player.x=${x}; state.player.y=${y}; updateCamera();`);
  assert.equal(run('state.cameraX'),cx); assert.equal(run('state.cameraY'),cy);
  run('state.enemies=[]; Math.random=()=>0; for(let i=0;i<26;i++) spawnEnemy();');
  assert.equal(run('state.enemies.every(e=>e.x>=e.r && e.x<=state.worldWidth-e.r && e.y>=e.r && e.y<=state.worldHeight-e.r && Math.hypot(e.x-state.player.x,e.y-state.player.y)>200)'),true);
}
run("state.player.x=2382; state.player.y=1782; state.keys.clear(); state.keys.add('d'); state.keys.add('s'); activateDash(); tick(.05);");
assert.equal(run('state.player.x'),2382); assert.equal(run('state.player.y'),1782);
run('summonTeacher();'); assert.equal(run('state.boss.x <= state.worldWidth-state.boss.r && state.boss.y>=state.boss.r'),true);
run('shiftTarget(state.boss, 2000, 1500, 9999);'); assert.equal(run('state.boss.x <= state.worldWidth-state.boss.r && state.boss.y <= state.worldHeight-state.boss.r'),true);
// 離開舊畫面後仍可打中世界座標的敵人，國字只在目前鏡頭內發射。
run(`resetGame(); state.mode='playing'; state.spawnTimer=999; state.shotTimer=999; state.level=8;
  state.enemies=[{x:1300,y:900,r:17,speed:0,damage:15,hp:100,maxHp:100,alive:true,wobble:0,flash:0,shotCooldown:0,typeId:'jaben'}];
  state.projectiles=[{x:1300,y:900,vx:0,vy:0,r:12,damage:35,pierce:0,hitList:[],alive:true,rangeLeft:100}]; tick(0);`);
assert.equal(run('state.enemies[0].hp'),65); assert.equal(run('state.enemyShots.length'),1);
run('state.enemies[0].x=100; state.bookShotTimer=0; state.enemies[0].shotCooldown=0; state.enemyShots=[]; updateBookShooting(0);');
assert.equal(run('state.enemyShots.length'),0);
// visualViewport 工具列／平移／直拿，尺寸和原點不再取 100vh。
for (const [iw,ih,vw,vh,left,top,expectedW,expectedH] of [[390,844,390,664,0,45,664,390],[844,390,744,340,20,12,744,340],[1024,768,1024,700,0,0,1024,700]]) {
 run(`window.innerWidth=${iw};window.innerHeight=${ih}; window.visualViewport={width:${vw},height:${vh},offsetLeft:${left},offsetTop:${top}}; fitVisibleViewport();`);
 assert.equal(run('gameShell.style.width'),`${expectedW}px`); assert.equal(run('gameShell.style.height'),`${expectedH}px`);
 assert.equal(run('gameShell.style.left'),`${left}px`); assert.equal(run('gameShell.style.top'),`${top}px`);
}
run('elements.gameCanvas.clientWidth=900;elements.gameCanvas.clientHeight=400;resize();');
assert.equal(run('state.worldWidth'),2400); assert.equal(run('state.worldHeight'),1800);
assert.equal(run('state.player.x'),1200); assert.equal(run('state.player.y'),900);
assert.equal(run('state.player.x-state.cameraX'),450);
run('resetGame();'); assert.equal(run('state.worldWidth'),2700); assert.equal(run('state.worldHeight'),1200);
console.log('PASS: fixed map, centered camera, four edge clamps, dash wall, in-map spawn/knockback/boss, world shots, visible book shots, viewport offsets/rotation, resize/restart');
