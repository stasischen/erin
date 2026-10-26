// 執行：node games/survivor/tests/dash-skill.cjs；DOM／Canvas stub，不需套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = require('./load-game.cjs').source(process.env.SURVIVOR_SOURCE);
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : (() => {}) });
  function element() { return { style: { setProperty() {} }, dataset: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(fs.readFileSync(`${__dirname}/../icons.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/defaults.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/schema.js`, "utf8"), context);
  require('./load-game.cjs').load(context, process.env.SURVIVOR_SOURCE);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() { run(`resetGame(); state.player.x = 400; state.player.y = 300; updateCamera(); settingsPanel.hidden = true; state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999; updateActionControls();`); }
function close(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`); }
function step(seconds) { run(`for (let t = 0; t < ${seconds} - 1e-8; t += .05) tick(.05);`); }
fresh();
run('activateDash(); activateDash();');
assert.equal(run('state.dashCooldown'), 1.2);
assert.equal(run('state.dashCharges'),1);
assert.equal(run('actionControls.hidden'), false);
const x = run('state.player.x');
step(.15);
close(run('state.player.x') - x, 190 * 3 * .15);
close(run('state.dashTimer'), 0);
const end = run('state.player.x');
run('tick(.05);'); close(run('state.player.x'), end);
run('activateDash();'); close(run('state.dashCooldown'), 1);
assert.equal(run('state.dashCharges'),0);
step(1); assert.equal(run('state.dashCharges'),1);
run('activateDash();'); close(run('state.dashCooldown'), 1.2);
// 向上、斜向與最後面向；斜走不增加衝刺距離，短於一幀也按實際秒數。
fresh(); run('state.keys.add("w"); tick(.05); state.keys.clear(); activateDash();');
const y = run('state.player.y'); step(.15); close(y - run('state.player.y'), 85.5);
fresh(); run('state.keys.add("w"); state.keys.add("d"); activateDash(); tick(.05);');
close(run('Math.hypot(state.player.x - 400, state.player.y - 300)'), 28.5);
fresh(); run('gameSettings.dashSeconds = .12; activateDash();'); step(.15);
close(run('state.player.x - 400'), 68.4);
run('gameSettings.dashSeconds = .15;');
fresh(); run('state.player.x = state.worldWidth - 20; activateDash(); tick(.05);');
close(run('state.player.x'), 8.5);
// 衝刺擋住甲本碰撞與國字，最後一幀也不受傷；結束後恢復碰撞。
fresh();
run(`activateDash(); for (let i = 0; i < 3; i++) {
  state.enemyShots.push({ x: state.player.x + 28.5, y: state.player.y, vx: 0, vy: 0, r: 12, damage: 20 });
  state.enemies = [{x:state.player.x+28.5,y:state.player.y,r:17,speed:0,damage:15,hp:999,alive:true,wobble:0,flash:0}]; tick(.05);
}`);
assert.equal(run('state.player.health'), 90);
run('tick(.05); tick(.05);'); assert.equal(run('state.player.health'), 86.25);
// 技能固定留在放置位置，延遲一次爆開，範圍外不受傷，向爆心外擊退。
fresh();
run(`state.enemies = [450, 650].map(x => ({x,y:300,r:17,speed:0,damage:15,hp:300,alive:true,wobble:0,flash:0}));
  activateSkill(); state.player.x = 200; activateSkill(); tick(.05);`);
assert.equal(run('state.bomb.x'), 400);
assert.equal(run('state.enemies[0].hp'), 300);
step(.55);
assert.equal(run('state.bomb'), null);
assert.equal(run('state.enemies[0].hp'), 200);
assert.equal(run('state.enemies[0].x'),450); // 爆炸當幀只加入衝量。
step(.2);close(run('state.enemies[0].x'),505);
assert.equal(run('state.enemies[1].hp'), 300);
step(.1); assert.equal(run('state.enemies[0].hp'), 200);
run('render();');
// 致死爆炸沿用掉寶；老師可受傷、擊退並觸發勝利。
fresh();
run(`state.enemies = [{x:450,y:300,r:17,speed:0,damage:15,hp:50,alive:true,wobble:0,flash:0}]; activateSkill();`);
step(.6); assert.equal(run('state.enemies.length'), 0); assert.equal(run('state.gems.length'), 1);
fresh(); run('state.stageIndex=STAGES.length-1; summonTeacher(); state.bossIntro = 0; state.boss.x = 450; state.boss.y = 300; state.boss.hp = 50; activateSkill();');
step(.6); assert.equal(run('state.mode'), 'won');
// 暫停、選卡、設定畫面不施放也不倒數；重開清掉炸彈與冷卻。
fresh(); run('activateDash(); activateSkill(); showOverlay("paused"); globalThis.before = JSON.stringify([state.bomb,state.dashTimer,state.dashCooldown,state.skillCooldown]); tick(5); activateDash(); activateSkill();');
assert.equal(run('JSON.stringify([state.bomb,state.dashTimer,state.dashCooldown,state.skillCooldown]) === before'), true);
assert.equal(run('actionControls.hidden'), true);
run('togglePause();'); assert.equal(run('actionControls.hidden'), false);
run('openSettings(); togglePause();'); assert.equal(run('state.mode'), 'paused');
run('resetGame(); state.player.x = 400; state.player.y = 300; updateCamera();'); assert.equal(run('state.bomb'), null); assert.equal(run('state.skillCooldown + state.dashTimer + state.dashCooldown'), 0);
// 兩根手指：左手持續搖桿，右手按技能／衝刺不改左手 pointerId。
fresh();
run(`globalThis.pointer = (id,x,y) => ({pointerId:id,clientX:x,clientY:y,target:{closest:()=>null},preventDefault(){},stopPropagation(){}});
  elements.gameCanvas.listeners.pointerdown(pointer(11,100,300)); elements.gameCanvas.listeners.pointermove(pointer(11,135,300));
  elements.dashButton.listeners.pointerdown(pointer(22,700,500)); elements.skillButton.listeners.pointerdown(pointer(23,650,450));`);
assert.equal(run('state.pointerId'), 11); assert.equal(run('state.joy.x'), 1);
assert.equal(run('state.dashCooldown'), 1.2);
assert.equal(run('state.dashCharges'),1); assert.ok(run('state.bomb'));
run('elements.gameCanvas.listeners.pointerup(pointer(22,700,500));'); assert.equal(run('state.pointerId'), 11);
run('elements.gameCanvas.listeners.pointerup(pointer(11,135,300));'); assert.equal(run('state.joy'), null);
// 空白鍵改為衝刺、E 技能、Esc 暫停；長按不重播。開始按鈕仍聚焦時可用快捷鍵。
fresh();
run(`globalThis.key = (key,repeat=false) => ({key,repeat,preventDefault(){},target:{tagName:'BUTTON'}});
  windowListeners.keydown[0](key(' ')); windowListeners.keydown[0](key('e'));`);
assert.equal(run('state.mode'), 'playing'); assert.equal(run('state.dashCooldown'), 1.2);
assert.equal(run('state.dashCharges'),1); assert.ok(run('state.bomb'));
run('state.dashCooldown = 0; windowListeners.keydown[0](key(" ",true));'); assert.equal(run('state.dashCooldown'), 0);
run('windowListeners.keydown[0](key("Escape"));'); assert.equal(run('state.mode'), 'paused');
// 設定相容 v3、缺欄位補預設。
const saved = setup({'erin-survivor-settings-v3': JSON.stringify({playerHealth:110,dashCooldown:99})});
assert.equal(saved('gameSettings.playerHealth'), 110); assert.equal(saved('gameSettings.dashCooldown'), 8); assert.equal(saved('gameSettings.bombDamage'), 100);
saved('updateSettingValue("bombDamage", 150); gameSettings = loadSavedSettings();'); assert.equal(saved('gameSettings.bombDamage'), 100); // 玩家儲存不再包含傷害數值
// 座標測試包含非零原點、90 度旋轉與縮放；拖曳要沿玩家看到的遊戲方向。
fresh();
run(`elements.gameCanvas.getBoundingClientRect = () => ({left:20,top:30,right:820,width:800,height:600});`);
assert.equal(run('canvasScreenPoint({clientX:120,clientY:230}).x'), 100);
assert.equal(run('canvasScreenPoint({clientX:120,clientY:230}).y'), 200);
run(`window.innerWidth = 600; window.innerHeight = 900;
  elements.gameCanvas.getBoundingClientRect = () => ({left:20,top:30,right:620,width:600,height:800});
  elements.gameCanvas.listeners.pointerdown(pointer(31,420,130));
  elements.gameCanvas.listeners.pointermove(pointer(31,420,165));`);
assert.equal(run('state.joy.baseX'), 100); assert.equal(run('state.joy.baseY'), 200);
assert.equal(run('state.joy.x'), 1); assert.equal(run('state.joy.y'), 0);
run('elements.gameCanvas.listeners.pointermove(pointer(31,385,130));');
assert.equal(run('state.joy.x'), 0); assert.equal(run('state.joy.y'), 1);
run('elements.dashButton.listeners.pointerdown(pointer(32,60,750)); elements.skillButton.listeners.pointerdown(pointer(33,100,700));');
assert.equal(run('state.pointerId'), 31); assert.equal(run('state.dashCooldown'), 1.2);
assert.equal(run('state.dashCharges'),1); assert.ok(run('state.bomb'));
// 縮放後仍回到遊戲座標。
run('elements.gameCanvas.getBoundingClientRect = () => ({left:20,top:30,right:320,width:300,height:400});');
assert.equal(run('canvasScreenPoint({clientX:220,clientY:80}).x'), 100);
assert.equal(run('canvasScreenPoint({clientX:220,clientY:80}).y'), 200);
// Canvas 使用未旋轉的內容尺寸；改版面釋放舊輸入、保留進度與冷卻。
run(`elements.gameCanvas.clientWidth = 720; elements.gameCanvas.clientHeight = 320;
  state.elapsed = 42; state.player.x = 790; state.player.y = 590;
  state.keys.add('w'); resize();`);
assert.equal(run('state.width'),run('worldViewport(720,320).width')); assert.equal(run('state.height'),run('worldViewport(720,320).height'));
assert.equal(run('canvas.width'), 720); assert.equal(run('canvas.height'), 320);
assert.equal(run('state.player.x'), 790); assert.equal(run('state.player.y'), 590);
assert.equal(run('ctx.imageSmoothingEnabled'), false);
assert.equal(run('state.joy'), null); assert.equal(run('state.pointerId'), null);
assert.equal(run('state.keys.size'), 0); assert.equal(run('state.elapsed'), 42);
assert.equal(run('state.dashCooldown'), 1.2);
assert.equal(run('state.dashCharges'),1);
run(`showOverlay('paused'); window.innerWidth = 900; window.innerHeight = 600;
  elements.gameCanvas.clientWidth = 800; elements.gameCanvas.clientHeight = 500; resize();`);
assert.equal(run('state.mode'), 'paused'); assert.equal(run('state.width'),run('worldViewport(800,500).width'));
assert.equal(run('typeof maybeShowPortraitHint'), 'undefined');
assert.equal(run('storage["erin-survivor-portrait-hint-v1"]'), undefined);
console.log('PASS: landscape/rotated/scaled joystick, multipointer actions, canvas size, resize input reset/progress/pause, removed portrait hint');
console.log('PASS: dash duration/direction/wrap/invincibility, bomb delay/range/knockback/kills/boss, cooldown/pause/restart, multipointer/keyboard, settings');

// 順時針旋轉後，容器上／右／下／左分別接觸螢幕右／下／左／上。
const css = fs.readFileSync(`${__dirname}/../style.css`, 'utf8');
const portraitShell = css.match(/@media \(orientation: portrait\)\s*\{\s*\.game-shell\s*\{([^}]+)\}/)[1];
for (const [local, screen] of [['top', 'right'], ['right', 'bottom'], ['bottom', 'left'], ['left', 'top']]) {
  assert.ok(portraitShell.includes(`--safe-${local}: env(safe-area-inset-${screen}, 0px)`));
}
console.log('PASS: clockwise portrait safe-area mapping');
