// 執行：node games/survivor/tests/build-variety.cjs；驗證真實 tick 與選卡流程，無外部套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : (() => {}) });
  function element() { return { style: { setProperty() {} }, dataset: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(source, context);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() { run(`resetGame(); state.player.x = 400; state.player.y = 300; updateCamera(); settingsPanel.hidden = true; state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999;
  globalThis.book = (x,y=300,hp=1000,speed=0) => ({x,y,r:17,speed,damage:15,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});`); }
function step(seconds) { run(`for (let t = 0; t < ${seconds} - 1e-8; t += .05) tick(.05);`); }
function select(id) { run(`state.mode = 'levelup'; state.pendingChoices = [UPGRADES.find(card => card.id === ${JSON.stringify(id)})]; applyUpgrade(0);`); }
function close(a,b) { assert.ok(Math.abs(a-b)<1e-6, `${a} != ${b}`); }
// 前置鎖、每張 Lv5、重複升級、每場只能一個終極；合體可跨流派。
fresh();
assert.equal(run('new Set(UPGRADES.map(c=>c.icon)).size === UPGRADES.length'),true);
assert.equal(run('UPGRADES.filter(canOffer).length'),12); // 9 通用 + 3 入門
assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="water-skill"))'),false);
select('water-skill'); assert.equal(run('upgradeLevel("water-skill")'),0);
select('water-attack'); select('water-skill'); select('water-dash');
assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="water-ultimate"))'),true);
select('water-ultimate');
select('wind-attack'); select('wind-dash'); select('wind-speed');
assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="wind-ultimate"))'),false);
assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="fusion-storm"))'),true);
select('thunder-attack');
assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="fusion-puddle"))'),true);
assert.equal(run('canOffer(UPGRADES.find(c=>c.id==="fusion-dash"))'),true);
for(let i=0;i<8;i++) select('water-attack');
assert.equal(run('upgradeLevel("water-attack")'),5);
// 所有可用組合抽卡均無重複、無鎖定或滿級卡；全滿只出回血。
for(let i=0;i<150;i++) {
 run('chooseUpgradeCards();');
 assert.equal(run('new Set(state.pendingChoices.map(c=>c.id)).size === state.pendingChoices.length'),true);
 assert.equal(run('state.pendingChoices.every(canOffer)'),true);
}
run('for(const c of UPGRADES) state.upgrades[c.id]=5; chooseUpgradeCards();');
assert.equal(run('state.pendingChoices[0].id'),'heal');
// 水入門有真正的範圍傷害；A 留水窪緩速，B 依衝刺距離留痕。
fresh(); select('water-attack');
run('state.enemies=[book(450),book(470,310)]; fireAtNearest();'); step(.1);
assert.ok(run('state.enemies[1].hp')<1000);
select('water-skill'); run('state.enemies=[book(450)]; state.projectiles=[]; fireAtNearest();'); step(.15);
assert.ok(run('state.fields.length')>0); assert.ok(run('state.enemies[0].slowTimer')>0);
select('water-dash'); run('state.fields=[]; PLAYER_SPEED=320; gameSettings.dashMultiplier=5; activateDash(); tick(.05);');
assert.equal(run('state.fields.length'),4);
run('for(let i=0;i<200;i++) addField("water",100,100);'); assert.equal(run('state.fields.length'),18);
// 風入門加速水球；疾行根據實際速度加快攻速（撞牆停止就恢復）。
fresh(); select('wind-attack'); run('state.enemies=[book(700)]; fireAtNearest();');
assert.ok(run('Math.hypot(state.projectiles[0].vx,state.projectiles[0].vy)')>390);
select('wind-speed'); const normal=run('effectiveShotInterval()');
run('state.keys.add("d"); tick(.05);'); assert.ok(run('effectiveShotInterval()')<normal);
run('state.keys.clear(); tick(.05);'); close(run('effectiveShotInterval()'),normal);
select('wind-dash'); run('state.enemies=[book(420,310)]; activateDash(); tick(.05);');
assert.ok(run('state.enemies[0].y')>310);
// 雷跳一次到鄰近敵人；泡泡暈眩阻止移動與丟字；反擊由受傷觸發。
fresh(); select('thunder-attack'); run('state.enemies=[book(450),book(500,330)]; fireAtNearest();'); step(.1);
assert.equal(run('state.enemies[1].hp'),982.5);
select('thunder-skill'); run('state.enemies=[book(450)]; activateSkill();'); step(.6);
assert.ok(run('state.enemies[0].stunTimer')>0);
run('state.enemies[0].speed=100; state.enemies[0].knockback=0; globalThis.x=state.enemies[0].x; tick(.05);');
close(run('state.enemies[0].x'),run('x'));
select('thunder-counter'); run('state.projectiles=[]; state.enemies=[book(state.player.x,state.player.y)]; state.player.invincible=0; tick(.05);');
assert.ok(run('state.enemies[0].hp')<1000);
// 合體卡首級就改變場地或衝刺行為。
fresh(); select('water-attack'); select('water-skill'); select('thunder-attack'); select('fusion-puddle');
run('state.enemies=[book(450)]; addField("water",450,300); tick(.05);'); assert.equal(run('state.enemies[0].hp'),976);
select('wind-attack'); select('wind-dash'); select('fusion-storm'); select('wind-speed'); select('fusion-dash');
run('state.fields=[]; activateDash(); tick(.05);'); assert.equal(run('new Set(state.fields.map(f=>f.school)).size'),3);
// 三種終極、老師勝利、暫停／重開與有限特效。
for(const school of ['water','wind','thunder']) {
 fresh();
 for(const id of school==='water'?['water-attack','water-skill','water-dash']:school==='wind'?['wind-attack','wind-dash','wind-speed']:['thunder-attack','thunder-skill','thunder-counter']) select(id);
 select(`${school}-ultimate`);
 run(`state.enemies=[book(480,300)]; state.elapsed=0; state.ultimateTimer=0; updateUltimate(.05);`);
 assert.ok(run('state.enemies[0].hp')<1000);
 run('globalThis.frozen=JSON.stringify([state.fields,state.ultimateTimer,state.ultimateVisual]); showOverlay("paused"); tick(5);');
 assert.equal(run('JSON.stringify([state.fields,state.ultimateTimer,state.ultimateVisual])===frozen'),true);
 run('togglePause(); summonTeacher(); state.bossIntro=0; state.enemies=[]; state.boss.x=480; state.boss.y=300; state.boss.hp=1; state.elapsed=0; state.ultimateTimer=0; updateUltimate(.05);');
 assert.equal(run('state.mode'),'won');
 run('render(); resetGame(); state.player.x = 400; state.player.y = 300; updateCamera();'); assert.equal(run('state.ultimateVisual'),null); assert.equal(run('state.ultimateTimer'),0);
}
fresh(); select('auto-heal'); run('state.player.health=50;'); step(10); assert.equal(run('state.player.health'),51);
fresh(); select('bubble-shield'); assert.equal(run('state.player.health'),108);
fresh(); select('gem-magnet'); run('state.gems=[{x:540,y:300,r:8,value:1,alive:true,wobble:0}]; tick(.05);'); assert.ok(run('state.gems[0].x')<540);
console.log('PASS: unique icons, prerequisites, Lv5, one ultimate, legal offers/fallback, water/wind/thunder branches, fusions, ultimate damage/boss wins, pause/restart/pools, support cards');
