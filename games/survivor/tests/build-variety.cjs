// 執行：node games/survivor/tests/build-variety.cjs；驗證真實 tick 與選卡流程，無外部套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : (() => {}) });
  function element() { return { style: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(source, context);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh() { run(`resetGame(); settingsPanel.hidden = true; state.mode = 'playing'; state.spawnTimer = 999; state.shotTimer = 999;
  globalThis.book = (x,y=300,hp=1000,speed=0) => ({x,y,r:17,speed,damage:15,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});`); }
function step(seconds) { run(`for (let t = 0; t < ${seconds} - 1e-8; t += .05) tick(.05);`); }
function select(id) { run(`state.mode = 'levelup'; state.pendingChoices = [UPGRADES.find(card => card.id === ${JSON.stringify(id)})]; applyUpgrade(0);`); }
function close(a,b) { assert.ok(Math.abs(a-b)<1e-6, `${a} != ${b}`); }
fresh();
for (const school of ['water','wind','thunder']) {
  assert.equal(run(`UPGRADES.filter(card => card.school === '${school}').length`),4);
  assert.equal(run(`new Set(UPGRADES.filter(card => card.school === '${school}').map(card => card.slot)).size`),4);
}
// 抽卡不重複；大部分跨三流派，少部分留舊支援卡；滿卡後補齊並回退回血。
run("globalThis.seed=12345; Math.random=()=>{seed=seed*16807%2147483647; return (seed-1)/2147483646;};");
let diverse=0,support=0;
for (let i=0;i<120;i++) {
  run('chooseUpgradeCards();');
  assert.equal(run('new Set(state.pendingChoices.map(card=>card.id)).size'),3);
  if (run('state.pendingChoices.every(card=>card.school)')) { diverse++; assert.equal(run('new Set(state.pendingChoices.map(card=>card.school)).size'),3); }
  else support++;
}
assert.ok(diverse>40 && support>0);
run(`for (const card of UPGRADES) if (card.school === 'water') state.upgrades[card.id] = card.maxLevel || UPGRADE_TUNING.maxUpgradeLevel; chooseUpgradeCards();`);
assert.equal(run('state.pendingChoices.length'),3);
assert.equal(run(`state.pendingChoices.some(card=>card.school==='water')`),false);
run(`for (const card of UPGRADES) state.upgrades[card.id] = card.maxLevel || UPGRADE_TUNING.maxUpgradeLevel; chooseUpgradeCards();`);
assert.equal(run('state.pendingChoices[0].id'),'heal');
// 每張新卡拿一次就啟動；普攻水減速、風推遠、雷只跳另一隻，並可混搭。
fresh(); select('water-attack');
run('state.enemies = [book(460,300,1000,100)]; fireAtNearest(); tick(.05); tick(.05);');
assert.ok(run('state.enemies[0].slowTimer')>0);
const x=run('state.enemies[0].x'); run('state.projectiles=[]; state.enemies[0].knockback=0; tick(.05);');
close(x-run('state.enemies[0].x'),100*.05*.55);
fresh(); select('wind-attack'); run('state.enemies=[book(450)]; fireAtNearest(); tick(.05); tick(.05);');
assert.ok(run('state.enemies[0].x')>470);
fresh(); select('thunder-attack'); run('state.enemies=[book(450),book(500,330)]; fireAtNearest(); tick(.05); tick(.05);');
assert.equal(run('state.enemies[0].hp'),965); assert.equal(run('state.enemies[1].hp'),982.5);
select('water-attack'); select('wind-attack');
assert.equal(run(`document.getElementById('buildSlots').innerHTML.includes('緩流水球')`),true);
assert.equal(run(`upgradeLevel('thunder-attack')`),1);
run('chooseUpgradeCards();'); assert.equal(run(`state.pendingChoices.some(card=>card.id==='thunder-attack')`),false);
// 各流派技能首張即有作用：水窪、遠處聚風、額外大範圍落雷。
fresh(); select('water-skill'); run('activateSkill();'); step(.6);
assert.equal(run('state.fields[0].school'),'water'); assert.equal(run('state.fields[0].radius'),110);
fresh(); select('wind-skill'); run('state.enemies=[book(545)]; activateSkill();'); step(.6);
assert.equal(run('state.enemies[0].hp'),900); // 原本在泡泡外，聚風拉入後被炸到。
fresh(); select('thunder-skill'); run('state.enemies=[book(545)]; activateSkill();'); step(.6);
assert.equal(run('state.enemies[0].hp'),950); // 大範圍只受額外雷擊。
// 各流派衝刺留下真正傷害／緩速／擊退／跳電；暫停凍結，重開清乾淨。
for (const school of ['water','wind','thunder']) {
  fresh(); select(`${school}-dash`);
  run('state.enemies=[book(420,310),book(490,330)]; activateDash(); tick(.05);');
  assert.ok(run('state.fields.length')>0);
  assert.equal(run('state.fields[0].school'),school);
  assert.ok(run('state.enemies[0].hp')<1000);
  if (school==='water') assert.ok(run('state.enemies[0].slowTimer')>0);
  if (school==='wind') assert.ok(run('state.enemies[0].y')>310);
  if (school==='thunder') assert.ok(run('state.enemies[1].hp')<1000);
}
fresh(); select('water-dash'); select('wind-dash'); select('thunder-dash');
run('activateDash(); tick(.05); globalThis.before=JSON.stringify(state.fields); showOverlay("paused"); tick(10);');
assert.equal(run('JSON.stringify(state.fields)===before'),true);
run('togglePause();'); step(.1); assert.equal(run('new Set(state.fields.map(field=>field.school)).size'),3);
run(`for(let i=0;i<200;i++) addField('water',100,100);`);
assert.equal(run('state.fields.length'),18); step(2.1); assert.equal(run('state.fields.length'),0);
assert.ok(run('state.fieldPool.length')<=18);
run('render(); resetGame();'); assert.equal(run('state.fields.length'),0); assert.equal(run('Object.keys(state.upgrades).length'),0);
// 新效果能打老師並觸發勝利；雷跳電致死也只發一次獎勵／勝利。
fresh(); select('thunder-attack');
run('state.enemies=[book(450)]; summonTeacher(); state.bossIntro=0; state.boss.x=500; state.boss.y=330; state.boss.hp=10; fireAtNearest(); tick(.05); tick(.05);');
assert.equal(run('state.mode'),'won');
fresh(); select('thunder-skill'); run('summonTeacher(); state.bossIntro=0; state.boss.x=450; state.boss.y=300; state.boss.hp=20; activateSkill();'); step(.6);
assert.equal(run('state.mode'),'won');
fresh(); select('water-dash'); run(`summonTeacher(); state.bossIntro=0; state.boss.x=420; state.boss.y=300; state.boss.hp=5; activateDash(); tick(.05);`);
assert.equal(run('state.mode'),'won');
// 三張既有被動保留 Erin 的回血設計、吸取與血條效果。
fresh(); select('auto-heal'); run('state.player.health=50;'); step(10); assert.equal(run('state.player.health'),51);
fresh(); select('bubble-shield'); assert.equal(run('state.player.health'),108);
fresh(); select('gem-magnet'); run('state.gems=[{x:540,y:300,r:8,value:1,alive:true,wobble:0}]; tick(.05);'); assert.ok(run('state.gems[0].x')<540);
console.log('PASS: 12 school/slot cards, diverse/unique/capped/fallback offers, first-pick attack/skill/dash/passive effects, mixing, pause/restart, pooled field limits, boss victory');
// 高速衝刺仍按距離留痕跡；選卡會凍結痕跡和延遲技能。
fresh(); select('water-dash'); run('PLAYER_SPEED=320; gameSettings.dashMultiplier=5; activateDash(); tick(.05);');
assert.equal(run('state.fields.length'),4);
close(run('state.fields[1].x-state.fields[0].x'),24);
close(run('state.fields[3].x-state.fields[2].x'),24);
run('activateSkill(); chooseUpgradeCards(); globalThis.frozen=JSON.stringify([state.fields,state.bomb]); tick(5);');
assert.equal(run('JSON.stringify([state.fields,state.bomb])===frozen'),true);
// 緩速會消失，三張技能混搭也能正常爆炸、保留所有效果。
fresh(); run('PLAYER_SPEED=190; gameSettings.dashMultiplier=3; state.enemies=[book(700)]; state.enemies[0].slowTimer=.1;'); step(.2);
assert.equal(run('state.enemies[0].slowTimer'),0);
select('water-skill'); select('wind-skill'); select('thunder-skill');
run('state.enemies=[book(450)]; activateSkill();'); step(.6);
assert.equal(run('state.bomb'),null); assert.equal(run('state.fields[0].school'),'water');
assert.equal(run('state.enemies[0].hp'),850);
run('render();');
console.log('PASS: high-speed distance-spaced trails, levelup freezes new state, slow expiry, mixed skills');
