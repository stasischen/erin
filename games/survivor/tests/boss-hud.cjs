// Presentation-only VM regression; real DOM geometry and cloud play remain separate gates.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
class Element {
  constructor() { this.children = []; this.dataset = {}; this.style = {}; this.attrs = {}; this.hidden = false; this.textContent = ''; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  addEventListener() {}
  set innerHTML(value) { this.children = []; this.markup = value; }
  get innerHTML() { return this.markup || ''; }
}
const nodes = Object.fromEntries(['bossHud', 'bossSummary', 'bossName', 'bossHealthFill', 'bossHealthRows'].map(id => [id, new Element()]));
const state = {mode: 'playing', boss: null, miniboss: null, trial: null};
const context = vm.createContext({
  state, GAME_DATA: {boss: {name: '老師'}, chocobear: {name: '糖衣熊'}},
  Survivor: {engine: {gallery: {}}, render: {}},
  document: {getElementById: id => nodes[id], createElement: () => new Element()},
  bossHud: nodes.bossHud, bossHealthFill: nodes.bossHealthFill,
  dashButton: new Element(), skillButton: new Element(),
  activateDash() {}, activateSkill() {}
});
const root = path.resolve(__dirname, '..');
for (const file of ['engine/gallery-encounters.js', 'render/hud.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
}
const update = () => vm.runInContext('updateBossHealthHud()', context);
const rows = () => nodes.bossHealthRows.children;
const widths = () => rows().map(row => row.children[1].children[0].style.width);
const actor = (actorId, role, hp, maxHp = 100) => ({actorId, role, hp, maxHp});
const frost = actor('frost', 'frost', 80), fire = actor('fire', 'fire', 25);
state.trial = {definition: {id: 'frostfire', name: '冰火雙子'}, actors: [frost, fire]};
state.boss = frost;
const before = JSON.stringify(state);
update();
assert.equal(JSON.stringify(state), before, 'HUD does not mutate combat state');
assert.equal(nodes.bossHud.hidden, false);
assert.equal(nodes.bossSummary.hidden, true);
assert.deepEqual(rows().map(row => row.dataset.actorId), ['frost', 'fire']);
assert.deepEqual(widths(), ['80%', '25%']);
assert.deepEqual(rows().map(row => row.children[0].textContent), ['冰火雙子 · 冰', '冰火雙子 · 火']);
const reused = rows()[0];
frost.hp = 60; update();
assert.equal(rows()[0], reused, 'same roster reuses DOM rows');
assert.deepEqual(widths(), ['60%', '25%']);
assert.equal(rows()[0].children[1].attrs['aria-valuenow'], '60');
frost.hp = 0; state.boss = fire; update();
assert.deepEqual(rows().map(row => row.dataset.actorId), ['fire']);
assert.deepEqual(widths(), ['25%']);
fire.hp = 0; state.boss = null; update();
assert.equal(nodes.bossHud.hidden, true);
assert.equal(rows().length, 0);
for (const id of ['assassin', 'winged', 'gatekeeper']) {
  const body = actor(id, null, 50);
  state.boss = body;
  state.trial = {definition: {id, name: id}};
  if (id !== 'gatekeeper') state.trial.actors = [body];
  state.mode = 'playing'; update();
  assert.equal(rows().length, 1); assert.deepEqual(widths(), ['50%']);
  assert.equal(rows()[0].children[0].textContent, id);
  state.mode = 'paused'; update(); assert.equal(nodes.bossHud.hidden, false);
  state.mode = 'playing'; update(); assert.deepEqual(widths(), ['50%']);
  state.mode = 'gameover'; update();
  assert.equal(nodes.bossHud.hidden, true); assert.equal(rows().length, 0);
  state.mode = 'playing'; body.hp = 100; update(); assert.deepEqual(widths(), ['100%']);
}
state.mode = 'trial-menu'; state.boss = null; state.trial = null; update();
assert.equal(nodes.bossHud.hidden, true); assert.equal(rows().length, 0);
assert.equal(nodes.bossName.textContent, '');
state.mode = 'playing'; state.boss = actor('teacher', null, 40, 100); update();
assert.equal(nodes.bossSummary.hidden, false); assert.equal(nodes.bossHealthRows.hidden, true);
assert.equal(nodes.bossName.textContent, '老師'); assert.equal(nodes.bossHealthFill.style.width, '40%');
state.miniboss = {hp: 50, maxHp: 100, armor: 50, maxArmor: 100}; update();
assert.equal(nodes.bossName.textContent, '糖衣熊 · 糖衣盔甲');
assert.equal(nodes.bossHealthFill.style.width, '50%', 'legacy HP plus armor formula is preserved');
state.miniboss.armor = 0; update();
assert.equal(nodes.bossName.textContent, '糖衣熊');
assert.equal(nodes.bossHealthFill.style.width, '25%');
state.mode = 'ready'; update();
assert.equal(nodes.bossHud.hidden, true); assert.equal(nodes.bossName.textContent, '');
console.log('PASS: actor HP identity, twin survivor, roster reuse, single bosses, pause/retry/exit cleanup, legacy armor, no state mutation');

// Load the real manifest/lifecycle. Never replace finishRun/showOverlay or call
// updateBossHealthHud after ending: the production transition must propagate it.
const createRun = require('./maker-support.cjs');
for (const kind of ['teacher', 'miniboss']) {
  for (const won of [false, true]) {
    const run = createRun();
    run("resetGame(); state.mode='playing'; settingsPanel.hidden=true; state.stageIndex=STAGES.length-1; state.elapsed=12.75;");
    run(kind === 'teacher'
      ? "state.boss={hp:40,maxHp:100}; state.miniboss=null;"
      : "state.boss=null; state.miniboss={hp:50,maxHp:100,armor:50,maxArmor:100};");
    run('updateHud()');
    const hud = run.elements.bossHud, name = run.elements.bossName, fill = run.elements.bossHealthFill;
    assert.equal(hud.hidden, false, kind + ' visible before end');
    assert.equal(fill.style.width, kind === 'teacher' ? '40%' : '50%');
    const hpBefore = run('JSON.stringify({boss:state.boss,miniboss:state.miniboss})');
    run('togglePause()');
    assert.equal(run('state.mode'), 'paused');
    assert.equal(hud.hidden, false, 'pause retains HP');
    run('togglePause()');
    assert.equal(run('state.mode'), 'playing');
    if (!won) run('state.player.health=0');
    run('finishRun(' + won + ')');
    assert.equal(run('state.mode'), won ? 'won' : 'over');
    assert.equal(run('bossHudEntries().length'), 0);
    assert.equal(hud.hidden, true, kind + ' genuine end hides stale DOM');
    assert.equal(name.textContent, '');
    assert.equal(fill.style.width, '0%');
    assert.equal(run('state.elapsed'), 12.75, 'presentation does not advance clock');
    assert.equal(run('JSON.stringify({boss:state.boss,miniboss:state.miniboss})'), hpBefore);
    run('startGame()');
    assert.equal(run('state.boss'), null);
    assert.equal(run('state.miniboss'), null);
    assert.equal(hud.hidden, true, 'normal restart has no stale Boss HUD');
    assert.equal(name.textContent, '');
  }
}
for (const won of [false, true]) {
  const run = createRun();
  run("startTrial('assassin')");
  assert.equal(run.elements.bossHud.hidden, false);
  run('finishRun(' + won + ')');
  assert.equal(run.elements.bossHud.hidden, true, 'existing trial end still clears HUD');
  assert.equal(run('bossHudEntries().length'), 0);
  assert.equal(run.elements.bossName.textContent, '');
}
console.log('PASS: production normal loss/win, pause/resume, restart and trial end HUD propagation');
