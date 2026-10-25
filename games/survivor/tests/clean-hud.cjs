// 執行：node games/survivor/tests/dash-skill.cjs；DOM／Canvas stub，不需套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : (() => {}) });
  function element() { return { style: { setProperty(key, value) { this[key] = value; } }, dataset: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute(key,value) { this[key]=value; }, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/defaults.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/schema.js`, "utf8"), context);
  vm.runInContext(source, context);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
// 任意鏡頭位置、極端長寬比、連續相同亂數，身體都必須完全在畫面外且在地圖內。
for (const [width,height] of [[320,568],[568,280],[800,600],[1366,768],[2400,300],[300,2400]]) {
  run(`state.width=${width};state.height=${height};resetMap();`);
  for (const fx of [0,.1,.5,.9,1]) for (const fy of [0,.1,.5,.9,1]) {
    run(`state.player.x=state.worldWidth*${fx};state.player.y=state.worldHeight*${fy};updateCamera();`);
    for (const random of [0,.24,.49,.74,.999999]) {
      run(`Math.random=()=>${random};state.enemies=[];state.elapsed=100;spawnEnemy();summonTeacher();`);
      assert.equal(run(`state.enemies.length===1 && [state.enemies[0],state.boss].every(e =>
        e.x>=e.r && e.y>=e.r && e.x<=state.worldWidth-e.r && e.y<=state.worldHeight-e.r &&
        (e.x+(e===state.boss?60:e.r)<state.cameraX || e.x-(e===state.boss?60:e.r)>state.cameraX+state.width || e.y+(e===state.boss?60:e.r)<state.cameraY || e.y-(e===state.boss?60:e.r)>state.cameraY+state.height))`),true);
    }
  }
}
// 同局放大到整張地圖：沒有合法位置時延後出場，不退回畫面內。
run('state.width=state.worldWidth;state.height=state.worldHeight;updateCamera();state.enemies=[];state.boss=null;spawnEnemy();summonTeacher();');
assert.equal(run('state.enemies.length'),0);assert.equal(run('state.boss'),null);
run(`state.width=800;state.height=600;resetGame();state.mode='playing';settingsPanel.hidden=true;
 state.upgrades={'water-attack':2,'thunder-attack':1,'fusion-puddle':1};openSettings();`);
assert.equal(run('state.mode'),'paused');assert.equal(run('settingsPanel.hidden'),false);
assert.match(run('elements.buildSlots.innerHTML'),/Lv2/);
assert.match(run('elements.buildSlots.innerHTML'),/導電水窪/);
assert.match(run('elements.settingsSkillTree.innerHTML'),/導電水窪.*水窪 A Lv1/);
assert.match(run('elements.settingsSkillTree.innerHTML'),/雷雲/);
run('closeSettings();togglePause();state.skillCooldown=gameSettings.bombCooldown/2;updateActionControls();');
assert.match(run('skillButton.style.background'),/180deg/);
assert.equal(run('skillButton["aria-disabled"]'),'true');
assert.equal(run('state.mode'),'playing');
// 擷取實際 Canvas 命令：雷雲與落雷固定在目標的世界座標，不依鏡頭頂端重算。
run(`state.cameraX=700;state.cameraY=600;state.ultimateVisual={school:'thunder',x:1100,y:900,life:.4};
 globalThis.points=[];ctx.moveTo=(x,y)=>points.push([x,y]);ctx.lineTo=(x,y)=>points.push([x,y]);render();`);
assert.equal(run('points.some(([x,y])=>x===1100 && y===820)'),true);
assert.equal(run('points.some(([x,y])=>x===1100 && y===900)'),true);
console.log('PASS: offscreen/in-map spawns across sizes, corners, edges, random extremes; no-space deferral; paused build/tree; cooldown ring; scrolled lightning');
