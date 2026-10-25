// 執行：node games/survivor/tests/balance.cjs；不需要安裝套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {};
  const context2d = new Proxy({}, { get: (target, key) => target[key] || (() => {}) });
  function element() { return { style: { setProperty() {} }, dataset: {}, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { addEventListener() {} }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/defaults.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/schema.js`, "utf8"), context);
  vm.runInContext(source, context);
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() { run(`resetGame(); state.player.x = 400; state.player.y = 300; updateCamera(); state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999;`); }
function targets(pierce, boss = false) {
  fresh();
  run(`state.enemies = [0, 1, 2, 3, 4, 5, 6].map(() => ({ x: 300, y: 300, r: 17, speed: 0, damage: 18, hp: 100, maxHp: 100, wobble: 0, alive: true, flash: 0 }));
  state.projectiles = [{ x: 300, y: 300, vx: 0, vy: 0, r: 12, damage: 35, pierce: ${pierce}, piercing: ${pierce > 0}, hitList: [], alive: true }];
  ${boss ? 'state.boss = { x: 300, y: 300, r: 32, speed: 0, hp: 2400, maxHp: 2400, flash: 0, wobble: 0 }; state.bossRest = 99;' : ''}
  tick(0);`);
}
// 同一顆普通水球只傷一隻；即使老師與小兵重疊，也不能再傷到老師。
targets(0, true);
assert.equal(run('state.enemies.filter(e => e.hp < 100).length'), 1);
assert.equal(run('state.boss.hp'), 2400);
assert.equal(run('state.projectiles.length'), 0);
assert.equal(run('state.effects.some(e => e.text === "啪")'), true);
for (let level = 1; level <= 5; level++) {
  targets(level);
  assert.equal(run('state.enemies.filter(e => e.hp < 100).length'), level + 1);
  assert.equal(run('state.effects.filter(e => e.text === "穿！").length'), level);
}
// 穿透不會重複傷同一隻；最後一次穿透用完仍保留白圈外觀。
fresh();
run('spawnEnemy(); state.enemies[0].x = 300; state.enemies[0].y = 300; state.enemies[0].speed = 0; state.upgrades["piercing-water"] = 1; fireAtNearest(); Object.assign(state.projectiles[0], { x: 300, y: 300, vx: 0, vy: 0 }); tick(0); tick(0);');
assert.equal(run('state.enemies[0].hp'), 85);
assert.equal(run('state.projectiles[0].pierce'), 0);
assert.equal(run('state.projectiles[0].piercing'), true);
// 物件池回收後必須清掉命中名單與穿透。
run('state.projectiles[0].alive = false; tick(0); state.upgrades = {}; fireAtNearest();');
assert.equal(run('state.projectiles[0].pierce'), 0);
assert.equal(run('state.projectiles[0].piercing'), false);
assert.equal(run('state.projectiles[0].hitList.length'), 0);
// 升級所需 5、6、7 顆；經驗條跟新門檻一致。
fresh();
for (const needed of [5, 6, 7]) {
  assert.equal(run('experienceNeeded()'), needed);
  run(`grantExperience(${needed - 1});`);
  assert.equal(run('state.mode'), 'playing');
  run('grantExperience(1);');
  assert.equal(run('state.mode'), 'levelup');
  assert.equal(run('state.xp'), 0);
  run('applyUpgrade(0);');
}
// 老師出場保留小兵；叫小怪改為預警後生成，仍有上限 26。
fresh();
run('spawnEnemy(); state.enemies[0].speed = 0; summonTeacher(); state.bossIntro = 0.01; tick(0.02);');
assert.equal(run('state.enemies.length'), 1);
run('state.boss.x=100; state.boss.y=100; beginBossMove("summon"); updateBoss(0.45);');
assert.equal(run('state.enemies.length'), 1);
run('updateBoss(0.45);');
assert.equal(run('state.enemies.length'), 3);
run('for (let i = 0; i < 50; i++) spawnEnemy();');
assert.equal(run('state.enemies.length'), 26);
// 國字仍為三發扇形，預警後出手；老師傷害調為 12。
fresh();
run('summonTeacher(); state.boss.x=100; state.boss.y=100; state.bossIntro=0; beginBossMove("words"); updateBoss(0.9);');
assert.equal(run('state.enemyShots.length'), 3);
assert.equal(run('state.boss.maxHp'), 2000);
assert.equal(run('new Set(state.enemyShots.map(s => Math.atan2(s.vy, s.vx))).size'), 3);
run('state.enemyShots = [{source:"teacher",life:4,damage:12,x:state.player.x,y:state.player.y,vx:0,vy:0,r:17}]; tick(0);');
assert.equal(run('state.player.health'), 78);
for (const [type, damage] of [['jaben', 15], ['otsubon', 12]]) {
  fresh();
  run(`state.elapsed = ${type === 'jaben' ? 0 : 60}; Math.random = () => ${type === 'jaben' ? 0.99 : 0}; spawnEnemy(); Math.random = Object.getPrototypeOf(Math).random; Object.assign(state.enemies[0], { x: state.player.x, y: state.player.y, speed: 0 }); tick(0);`);
  assert.equal(run('state.player.health'), 90 - damage);
  assert.equal(run('state.player.invincible'), 1);
}
// 現存敵人也隨時間加速（60 秒時 1.10 倍）。
fresh();
run('state.elapsed = 60; spawnEnemy(); Object.assign(state.enemies[0], { x: 100, y: 300, speed: 100 }); tick(0.05);');
assert.ok(Math.abs(run('state.enemies[0].x') - 105.5) < 0.001);
// 波次間隔使用 1.84/1.495/1.15/.8625/.6325/.5175 秒，並保留速度滑桿倍率。
for (const [seconds, interval] of [[0, 1.84], [20, 1.495], [35, 1.15], [60, .8625], [90, .6325], [105, .5175]]) {
  fresh();
  run(`state.elapsed = ${seconds}; state.spawnTimer = 0; tick(0);`);
  assert.equal(run('state.enemies.length'), 1);
  assert.equal(run('state.spawnTimer'), interval);
}
fresh();
run('state.upgrades["auto-heal"] = 1; state.player.health = 50; state.healTimer = 9.9; tick(0.05);');
assert.equal(run('state.player.health'), 50);
run('tick(0.05); tick(0.01);');
assert.equal(run('state.player.health'), 51);
// 粒子滿載仍保留水球命中提示，上限不增加；渲染程式可處理新特效。
run('for (let i = state.effects.length; i < 90; i++) burst(0, 0, "#fff", 1); resolveWaterHit({ x: 200, y: 200, pierce: 1, alive: true }); render();');
assert.equal(run('state.effects.length'), 90);
assert.equal(run('state.effects.some(e => e.text === "穿！")'), true);
// 舊版設定不覆蓋新版預設；v3 自訂仍可保留；損毀存檔可開遊戲。
const old = setup({ 'erin-survivor-settings-v1': JSON.stringify({ playerHealth: 200, enemySpeed: 30 }) });
assert.equal(old('gameSettings.playerHealth'), 90);
assert.equal(old('gameSettings.enemySpeed'), 75);
const previous = setup({ 'erin-survivor-settings-v2': JSON.stringify({ playerHealth: 80, teacherHealth: 2400, enemyShotDamage: 8 }), 'erin-survivor-best-seconds-v1': '123.5' });
assert.equal(previous('gameSettings.playerHealth'), 90);
assert.equal(previous('gameSettings.teacherHealth'), 2000);
assert.equal(previous('gameSettings.enemyShotDamage'), 6);
assert.equal(previous('bestRecord'), 123.5);
previous('updateSettingValue("playerHealth", 110); gameSettings = loadSavedSettings();');
assert.equal(previous('gameSettings.playerHealth'), 110);
previous('resetSettingsButton.listeners.click(); resetGame(); state.player.x = 400; state.player.y = 300; updateCamera();');
assert.equal(previous('state.player.health'), 90);
assert.equal(previous('bestRecord'), 123.5);
const current = setup({ 'erin-survivor-settings-v3': JSON.stringify({ playerHealth: 110 }) });
assert.equal(current('gameSettings.playerHealth'), 110);
assert.equal(setup({ 'erin-survivor-settings-v3': '{bad' })('gameSettings.teacherHealth'), 2000);
fresh();
assert.equal(run('state.bossRest'), 0);
assert.equal(run('experienceNeeded()'), 5);
console.log('PASS: default/piercing collisions, pooled shots, XP growth, boss adds/fan/damage, enemy cap/growth/damage, settings migration, restart');
