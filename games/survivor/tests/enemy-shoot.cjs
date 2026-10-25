// 執行：node games/survivor/tests/enemy-shoot.cjs；使用 DOM／Canvas stub，不需套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {};
  const context2d = new Proxy({}, { get: (target, key) => target[key] || (() => {}) });
  function element() { return { style: { setProperty() {} }, dataset: {}, classList: { add() {}, remove() {} }, addEventListener() {}, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { addEventListener() {} }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(source, context);
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() {
  run(`resetGame(); state.player.x = 400; state.player.y = 300; updateCamera(); state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999;
    spawnEnemy(); Object.assign(state.enemies[0], { x: 100, y: 100, speed: 0, typeId: 'jaben', shotCooldown: 0 });`);
}
fresh();
run('state.level = 7; tick(0.05);');
assert.equal(run('state.enemyShots.length'), 0);
run('grantExperience(experienceNeeded());');
assert.equal(run('state.level'), 8);
assert.equal(run('enemyNotice.textContent'), '甲本開始丟字了！');
assert.equal(run('enemyNotice.hidden'), false);
assert.equal(run('state.mode'), 'levelup');
run('tick(1);');
assert.equal(run('state.bookNoticeTimer'), 4);
assert.equal(run('state.enemyShots.length'), 0);
run('applyUpgrade(0); tick(0);');
assert.equal(run('state.enemyShots.length'), 1);
assert.equal(run('state.enemyShots[0].source'), 'book');
assert.ok(run('BOOK_CHARACTERS.includes(state.enemyShots[0].text)'));
assert.ok(Math.abs(run('Math.hypot(state.enemyShots[0].vx, state.enemyShots[0].vy)') - 110) < 1e-8);
assert.ok(Math.abs(run('state.enemyShots[0].vx / state.enemyShots[0].vy') - 1.5) < 1e-8);
assert.equal(run('state.enemies[0].shotCooldown'), 3);
// 兩隻同時準備好仍只射一顆，全體至少相隔 0.65 秒。
run(`spawnEnemy(); Object.assign(state.enemies[1], { x: 200, y: 100, speed: 0, typeId: 'otsubon', shotCooldown: 0 }); tick(0.05);`);
assert.equal(run('state.enemyShots.length'), 1);
run('for (let i = 0; i < 13; i++) tick(0.05);');
assert.equal(run('state.enemyShots.length'), 2);
assert.equal(run('state.enemies[1].shotCooldown'), 5);
// 暫停凍結文字位置、發射倒數與提示；提示不會每級重播。
run('showOverlay("paused"); globalThis.before = JSON.stringify([state.enemyShots, state.bookShotTimer, state.bookNoticeTimer]); tick(1);');
assert.equal(run('JSON.stringify([state.enemyShots, state.bookShotTimer, state.bookNoticeTimer]) === before'), true);
run('state.mode = "playing"; state.bookNoticeTimer = 0; grantExperience(experienceNeeded()); applyUpgrade(0); tick(0);');
assert.equal(run('enemyNotice.hidden'), true);
// 小兵國字和老師詞句各有上限，混用仍保留老師三發。
fresh();
run(`state.level = 8; for (let i = 0; i < 30; i++) { state.bookShotTimer = 0; state.enemies[0].shotCooldown = 0; updateBookShooting(0); }
  summonTeacher(); state.boss.y = 100; state.bossIntro = 0; state.bossShotTimer = 0; tick(0); render();`);
assert.equal(run('state.enemyShots.filter(s => s.source === "book").length'), 12);
assert.equal(run('state.enemyShots.filter(s => s.source === "teacher").length'), 3);
run('for (let i = 0; i < 30; i++) { state.bossShotTimer = 0; tick(0); }');
assert.equal(run('state.enemyShots.length'), 48);
// 撞到只扣一次；受傷保護最後一幀也不能再扣血。
fresh();
run(`state.level = 8; tick(0); globalThis.bookShot = state.enemyShots[0];
  Object.assign(bookShot, { x: state.player.x, y: state.player.y, vx: 0, vy: 0 }); tick(0);`);
assert.equal(run('state.player.health'), 84);
assert.equal(run('state.enemyShotPool.includes(bookShot)'), true);
run('state.bookShotTimer = 0; state.enemies[0].shotCooldown = 0; tick(0);');
assert.equal(run('state.enemyShots[0] === bookShot'), true);
run('Object.assign(bookShot, { x: state.player.x, y: state.player.y, vx: 0, vy: 0 }); state.player.invincible = 0.01; tick(0.05);');
assert.equal(run('state.player.health'), 84);
// 出界回收，再由老師重用仍更新來源、傷害、半徑、文字。
run(`state.bookShotTimer = 0; state.enemies[0].shotCooldown = 0; tick(0);
  state.enemyShots[0].x = -100; tick(0); summonTeacher(); state.boss.y = 100; state.bossIntro = 0; state.bossShotTimer = 0; tick(0);`);
assert.equal(run('bookShot.source'), 'teacher');
assert.equal(run('bookShot.damage'), 20);
assert.equal(run('bookShot.r'), 17);
// 致命國字與升級寶石同幀時正確結束，不能卡在升級畫面。
fresh();
run(`state.player.health = 1; state.enemyShots.push({ source: 'book', x: state.player.x, y: state.player.y, vx: 0, vy: 0, r: 12, damage: 8 });
  state.gems.push({ x: state.player.x, y: state.player.y, r: 8, value: 999, alive: true, wobble: 0 }); tick(0);`);
assert.equal(run('state.mode'), 'over');
// 提示四秒後收起，下一級不重播；大量敵人也維持全體發射間隔。
fresh();
run('state.level = 8; state.enemies = []; tick(0); for (let i = 0; i < 81; i++) tick(0.05);');
assert.equal(run('enemyNotice.hidden'), true);
fresh();
run(`state.level = 8; for (let i = 1; i < 26; i++) { spawnEnemy(); Object.assign(state.enemies[i], { x: 100, y: 100, speed: 0, shotCooldown: 0 }); }
  globalThis.lastCount = 0; globalThis.lastShotTime = -999; globalThis.shortestGap = Infinity;
  for (let i = 0; i < 120; i++) { tick(0.05); if (state.enemyShots.length > lastCount) { shortestGap = Math.min(shortestGap, state.elapsed - lastShotTime); lastShotTime = state.elapsed; lastCount = state.enemyShots.length; } }`);
assert.ok(run('shortestGap >= 0.65 - 1e-8'));
assert.ok(run('state.enemyShots.length <= 12'));
// 已死或畫面外敵人、合體期間都不能射。
for (const change of ['state.enemies[0].alive = false', 'state.enemies[0].x = -20', 'state.bossIntro = 2']) {
  fresh(); run(`state.level = 8; ${change}; updateBookShooting(0);`);
  assert.equal(run('state.enemyShots.length'), 0);
}
fresh();
run('state.level = 8; tick(0); resetGame(); state.player.x = 400; state.player.y = 300; updateCamera();');
assert.equal(run('state.enemyShots.length'), 0);
assert.equal(run('state.bookShotTimer'), 0);
assert.equal(run('state.bookShootingStarted'), false);
assert.equal(run('enemyNotice.hidden'), true);
// v3 自訂設定保留，缺少欄位補預設；設定頁寫入、讀回及範圍限制。
const saved = setup({ 'erin-survivor-settings-v3': JSON.stringify({ playerHealth: 110, enemyShotDamage: 999, enemyShotSpeed: 80 }) });
assert.equal(saved('gameSettings.enemyShootLevel'), 8);
assert.equal(saved('gameSettings.playerHealth'), 110);
assert.equal(saved('gameSettings.enemyShotDamage'), 30);
assert.equal(saved('gameSettings.enemyShotSpeed'), 80);
saved('updateSettingValue("enemyShootLevel", 3); updateSettingValue("enemyShotDamage", 4); gameSettings = loadSavedSettings();');
assert.equal(saved('gameSettings.enemyShootLevel'), 3);
assert.equal(saved('gameSettings.enemyShotDamage'), 4);
saved(`resetGame(); state.player.x = 400; state.player.y = 300; updateCamera(); state.level = 3; state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999;
  spawnEnemy(); Object.assign(state.enemies[0], { x: 100, y: 100, speed: 0, shotCooldown: 0 }); tick(0);`);
assert.equal(saved('state.enemyShots[0].damage'), 4);
assert.ok(Math.abs(saved('Math.hypot(state.enemyShots[0].vx, state.enemyShots[0].vy)') - 80) < 1e-8);
console.log('PASS: Lv8 gate/notice, aim, stagger, slower second enemy, pause, caps, pooled book/teacher shots, damage/invincibility/death, restart, saved settings');
