// 執行：node games/survivor/tests/dash-skill.cjs；DOM／Canvas stub，不需套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const context2d = new Proxy({}, { get: (target, key) => target[key] || (() => {}) });
  function element() { return { style: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 400, innerHeight: 800, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(source, context);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() { run(`resetGame(); settingsPanel.hidden = true; state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999; updateActionControls();`); }
function close(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`); }
function step(seconds) { run(`for (let t = 0; t < ${seconds} - 1e-8; t += .05) tick(.05);`); }
fresh();
run('activateDash(); activateDash();');
assert.equal(run('state.dashCooldown'), 2.5);
assert.equal(run('actionControls.hidden'), false);
const x = run('state.player.x');
step(.15);
close(run('state.player.x') - x, 190 * 3 * .15);
close(run('state.dashTimer'), 0);
const end = run('state.player.x');
run('tick(.05);'); close(run('state.player.x'), end);
run('activateDash();'); close(run('state.dashCooldown'), 2.3);
step(2.3); run('activateDash();'); close(run('state.dashCooldown'), 2.5);
// 向上、斜向與最後面向；斜走不增加衝刺距離，短於一幀也按實際秒數。
fresh(); run('state.keys.add("w"); tick(.05); state.keys.clear(); activateDash();');
const y = run('state.player.y'); step(.15); close(y - run('state.player.y'), 85.5);
fresh(); run('state.keys.add("w"); state.keys.add("d"); activateDash(); tick(.05);');
close(run('Math.hypot(state.player.x - 400, state.player.y - 300)'), 28.5);
fresh(); run('gameSettings.dashSeconds = .12; activateDash();'); step(.15);
close(run('state.player.x - 400'), 68.4);
run('gameSettings.dashSeconds = .15;');
fresh(); run('state.player.x = state.width - 20; activateDash(); tick(.05);');
close(run('state.player.x'), 782);
// 衝刺擋住甲本碰撞與國字，最後一幀也不受傷；結束後恢復碰撞。
fresh();
run(`activateDash(); for (let i = 0; i < 3; i++) {
  state.enemyShots.push({ x: state.player.x + 28.5, y: state.player.y, vx: 0, vy: 0, r: 12, damage: 20 });
  state.enemies = [{x:state.player.x+28.5,y:state.player.y,r:17,speed:0,damage:15,hp:999,alive:true,wobble:0,flash:0}]; tick(.05);
}`);
assert.equal(run('state.player.health'), 90);
run('tick(.05);'); assert.equal(run('state.player.health'), 75);
// 技能固定留在放置位置，延遲一次爆開，範圍外不受傷，向爆心外擊退。
fresh();
run(`state.enemies = [450, 650].map(x => ({x,y:300,r:17,speed:0,damage:15,hp:300,alive:true,wobble:0,flash:0}));
  activateSkill(); state.player.x = 200; activateSkill(); tick(.05);`);
assert.equal(run('state.bomb.x'), 400);
assert.equal(run('state.enemies[0].hp'), 300);
step(.55);
assert.equal(run('state.bomb'), null);
assert.equal(run('state.enemies[0].hp'), 200);
assert.equal(run('state.enemies[0].x'), 505);
assert.equal(run('state.enemies[1].hp'), 300);
step(.1); assert.equal(run('state.enemies[0].hp'), 200);
run('render();');
// 致死爆炸沿用掉寶；老師可受傷、擊退並觸發勝利。
fresh();
run(`state.enemies = [{x:450,y:300,r:17,speed:0,damage:15,hp:50,alive:true,wobble:0,flash:0}]; activateSkill();`);
step(.6); assert.equal(run('state.enemies.length'), 0); assert.equal(run('state.gems.length'), 1);
fresh(); run('summonTeacher(); state.bossIntro = 0; state.boss.x = 450; state.boss.y = 300; state.boss.hp = 50; activateSkill();');
step(.6); assert.equal(run('state.mode'), 'won');
// 暫停、選卡、設定畫面不施放也不倒數；重開清掉炸彈與冷卻。
fresh(); run('activateDash(); activateSkill(); showOverlay("paused"); globalThis.before = JSON.stringify([state.bomb,state.dashTimer,state.dashCooldown,state.skillCooldown]); tick(5); activateDash(); activateSkill();');
assert.equal(run('JSON.stringify([state.bomb,state.dashTimer,state.dashCooldown,state.skillCooldown]) === before'), true);
assert.equal(run('actionControls.hidden'), true);
run('togglePause();'); assert.equal(run('actionControls.hidden'), false);
run('openSettings(); togglePause();'); assert.equal(run('state.mode'), 'paused');
run('resetGame();'); assert.equal(run('state.bomb'), null); assert.equal(run('state.skillCooldown + state.dashTimer + state.dashCooldown'), 0);
// 兩根手指：左手持續搖桿，右手按技能／衝刺不改左手 pointerId。
fresh();
run(`globalThis.pointer = (id,x,y) => ({pointerId:id,clientX:x,clientY:y,target:{closest:()=>null},preventDefault(){},stopPropagation(){}});
  elements.gameCanvas.listeners.pointerdown(pointer(11,100,300)); elements.gameCanvas.listeners.pointermove(pointer(11,135,300));
  elements.dashButton.listeners.pointerdown(pointer(22,700,500)); elements.skillButton.listeners.pointerdown(pointer(23,650,450));`);
assert.equal(run('state.pointerId'), 11); assert.equal(run('state.joy.x'), 1);
assert.equal(run('state.dashCooldown'), 2.5); assert.ok(run('state.bomb'));
run('elements.gameCanvas.listeners.pointerup(pointer(22,700,500));'); assert.equal(run('state.pointerId'), 11);
run('elements.gameCanvas.listeners.pointerup(pointer(11,135,300));'); assert.equal(run('state.joy'), null);
// 空白鍵改為衝刺、E 技能、Esc 暫停；長按不重播。開始按鈕仍聚焦時可用快捷鍵。
fresh();
run(`globalThis.key = (key,repeat=false) => ({key,repeat,preventDefault(){},target:{tagName:'BUTTON'}});
  windowListeners.keydown[0](key(' ')); windowListeners.keydown[0](key('e'));`);
assert.equal(run('state.mode'), 'playing'); assert.equal(run('state.dashCooldown'), 2.5); assert.ok(run('state.bomb'));
run('state.dashCooldown = 0; windowListeners.keydown[0](key(" ",true));'); assert.equal(run('state.dashCooldown'), 0);
run('windowListeners.keydown[0](key("Escape"));'); assert.equal(run('state.mode'), 'paused');
// 設定相容 v3、缺欄位補預設；直向提示可關閉且重開不重播。
const saved = setup({'erin-survivor-settings-v3': JSON.stringify({playerHealth:110,dashCooldown:99})});
assert.equal(saved('gameSettings.playerHealth'), 110); assert.equal(saved('gameSettings.dashCooldown'), 8); assert.equal(saved('gameSettings.bombDamage'), 100);
saved('updateSettingValue("bombDamage", 150); gameSettings = loadSavedSettings();'); assert.equal(saved('gameSettings.bombDamage'), 150);
fresh(); run('maybeShowPortraitHint();'); assert.equal(run('portraitHint.hidden'), false);
run('closePortraitHint.listeners.click(); maybeShowPortraitHint();'); assert.equal(run('portraitHint.hidden'), true);
assert.equal(run('storage["erin-survivor-portrait-hint-v1"]'), 'seen');
console.log('PASS: dash duration/direction/clamp/invincibility, bomb delay/range/knockback/kills/boss, cooldown/pause/restart, multipointer/keyboard, settings/portrait hint');
