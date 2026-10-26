const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const key = 'erin-survivor-settings-v3';
// A missing or unmarked legacy choice starts manual, preserving other settings.
for (const saved of [{}, {attackMode:'auto', sound:false}, {attackMode:'auto',attackModeChosen:false}]) {
  const run = createRun({saved:{[key]:JSON.stringify(saved)}});
  assert.equal(run('GAME_DATA.attackMode'), 'manual');
  if (saved.sound === false) assert.equal(run('gameSettings.sound'), false);
}
for (const mode of ['manual','auto']) {
  const run = createRun({saved:{[key]:JSON.stringify({attackMode:mode,attackModeChosen:true})}});
  assert.equal(run('GAME_DATA.attackMode'), mode);
}
const run = createRun();
run.elements.startAttackMode.listeners.click();
assert.equal(run('GAME_DATA.attackMode'), 'auto');
assert.equal(JSON.parse(run.storage[key]).attackModeChosen, true);
assert.equal(createRun({saved:run.storage})('GAME_DATA.attackMode'), 'auto');
run.elements.pauseAttackMode.listeners.click();
assert.equal(run('GAME_DATA.attackMode'), 'manual');
// A held input cannot become a delayed attack after switching during pause.
run(`resetGame();state.mode='playing';beginManualAttack('attack');showOverlay('paused');setAttackMode('auto');setAttackMode('manual');releaseManualAttack('attack');`);
assert.equal(run('state.swingCount'), 0);
run(`state.mode='playing';updateActionControls()`);
assert.equal(run.elements.attackButton.hidden, false);
assert.equal(run.elements.specialButton.hidden, false);
for (const id of ['water-ball','candy-sword','candy-hammer']) {
  run(`state.weaponId='${id}';updateActionControls()`);
  assert.equal(run.elements.attackButton.dataset.weaponIcon, run('activeWeapon().icon'));
}
run(`setAttackMode('auto')`);
assert.equal(run.elements.attackButton.hidden, true);
assert.equal(run.elements.specialButton.hidden, true);
// Legacy Maker auto was a default; a new explicit choice must survive reload.
const data = run('SurvivorData.defaults()');
for (const chosen of [false, true]) {
  const saved = {...data, attackMode:'auto',attackModeChosen:chosen};
  const maker = createRun({maker:true,saved:{'erin-survivor-maker-v1':JSON.stringify(saved)}});
  assert.equal(maker('GAME_DATA.attackMode'), chosen ? 'auto' : 'manual');
  maker('SurvivorData.save(GAME_DATA)');
  assert.equal(createRun({maker:true,saved:maker.storage})('GAME_DATA.attackMode'), chosen ? 'auto' : 'manual');
}
const noStorage = createRun({storageFails:true});
noStorage("setAttackMode('auto')");
assert.equal(noStorage('GAME_DATA.attackMode'),'auto');
console.log('PASS: manual default, legacy/explicit settings, both menu clicks, persistence/failure, held-input cancellation, four/manual versus two/auto buttons, weapon icons, Maker migration');
