// Run on Mac after real Chrome E2E; this VM check is not browser/layout acceptance.
const assert = require('node:assert/strict'), create = require('./maker-support.cjs');
const key = 'erin-survivor-best-seconds-v1';
const read = run => JSON.parse(run('JSON.stringify(state.runSummary)'));
function fresh(options) {
  const run = create(options);
  run('startGame(); GAME_DATA.hitJuice.enabled=false; state.enemies=[]; state.spawnTimer=999;');
  return run;
}
function watchWrites(run) {
  run('globalThis.writes=[]; const save=localStorage.setItem; localStorage.setItem=(k,v)=>{writes.push([k,v]);save(k,v);};');
}
// Real damage entry, zero kills and the existing end panel/replay labels.
const zero = fresh(); watchWrites(zero);
zero('state.elapsed=.9; pacingHurtPlayer(999999);');
assert.equal(zero('state.mode'), 'over');
assert.equal(zero('titleEl.textContent'), '再試一次！');
assert.equal(zero('startButton.textContent'), '重新開始');
assert.equal(read(zero).seconds, 0); assert.equal(read(zero).kills, 0);
assert.equal(read(zero).newRecord, false);
assert.equal(zero.elements.runSummary.hidden, false);
for (const text of ['水球 Lv1', '尚未取得秘技', '泡泡炸彈', '尚未取得升級卡']) {
  assert.ok(zero.elements.runSummary.innerHTML.includes(text), text);
}
// Strict integer record comparison, first record, and existing-key-only persistence.
for (const [old, elapsed, expected] of [[0,1.2,true],[10,11.2,true],[10,10.99,false],[10,9.9,false]]) {
  const run = fresh({saved:{[key]:String(old)}}); watchWrites(run);
  run(`state.elapsed=${elapsed}; finishRun(false);`);
  assert.equal(read(run).newRecord, expected);
  assert.equal(run.storage[key], String(Math.max(old, Math.floor(elapsed))));
  assert.equal(run('writes.length'), 1); assert.equal(run('writes[0][0]'), key);
  assert.equal(run.elements.runSummary.innerHTML.includes('新最長紀錄！'), expected);
}
// Route-aware stage labels, cumulative time/kills/build, and no stage-one settlement.
const stages = fresh(); watchWrites(stages);
stages(`state.survivalRoute='coast'; state.elapsed=150.8; state.level=7;
  state.schoolCombat.kills=12; state.neutral.kills=999; state.upgrades={'big-water':2};
  SurvivorLoadout.acquire('cotton-cloud'); SurvivorLoadout.acquire('cotton-cloud');
  SurvivorAbilities.acquire('active-tide'); finishRun(true);`);
assert.equal(stages('state.mode'), 'transition'); assert.equal(read(stages), null);
assert.equal(stages('writes.length'), 0); assert.equal(stages.elements.runSummary.hidden, true);
stages('finishRun(true)'); assert.equal(stages('state.stageIndex'), 1);
assert.equal(read(stages), null, 'duplicate transition cannot settle the next stage');
stages('tick(2); state.elapsed+=20; state.schoolCombat.kills+=3; finishRun(false);');
const second = read(stages);
assert.equal(second.seconds, 170); assert.equal(second.stage, 2);
assert.equal(second.stageName, '冰淇淋雪原'); assert.equal(second.level, 7);
assert.equal(second.kills, 15); assert.ok(second.weapons.includes('雷雲棉花糖 Lv2'));
assert.deepEqual(second.active, ['潮汐爆破 Lv1']); assert.equal(second.cards.length, 1);
// Repeated end events neither change the frozen result nor re-save/re-sound.
stages('globalThis.oldSummary=state.runSummary; globalThis.sounds=0; playSound=()=>sounds++; state.elapsed=999; finishRun(true); finishRun(false);');
assert.equal(stages('state.runSummary===oldSummary'), true);
assert.deepEqual(read(stages), second); assert.equal(stages('writes.length'), 1);
assert.equal(stages('sounds'), 0); assert.equal(stages('state.mode'), 'over');
// Two consecutive restarts erase every previous summary and keep the best record.
for (let i=0; i<2; i++) {
  stages('startGame()'); assert.equal(read(stages), null);
  assert.equal(stages.elements.runSummary.hidden, true);
  assert.equal(stages.elements.runSummary.innerHTML, '');
  assert.equal(stages('state.elapsed'), 0); assert.equal(stages('state.schoolCombat.kills'), 0);
  assert.equal(stages('bestRecord'), 170);
  stages('state.elapsed=2; finishRun(false)');
  assert.equal(read(stages).stage, 1); assert.equal(read(stages).weapons.length, 1);
  assert.deepEqual(read(stages).cards, []); assert.deepEqual(read(stages).active, []);
}
// Final win through real Boss damage; the Boss is not counted as a small enemy.
const win = fresh();
win(`SurvivorLoadout.acquire('candy-sword'); state.upgrades={'big-water':2};
  state.stageIndex=STAGES.length-1; state.elapsed=200.9; summonTeacher(); state.bossIntro=0;
  state.boss.x=state.player.x+50; state.boss.y=state.player.y; state.boss.hp=1;
  SurvivorLoadout.withWeapon(state.loadout[1],()=>hitBuildTarget(state.boss,999999));`);
assert.equal(win('state.mode'), 'won'); assert.equal(read(win).kills, 0);
assert.equal(read(win).cards[0], win('UPGRADES.find(c=>c.id==="big-water").name+" Lv2"'));
assert.equal(win('titleEl.textContent'), win('"打敗"+GAME_DATA.boss.name+"了！"'));
assert.equal(win('startButton.textContent'), '再玩一次');
// Existing damageEnemy accounting includes ordinary, elite and miniboss bodies.
const kills = fresh();
kills(`for(const extra of [{},{elite:'syrup'},{miniboss:true}]) {
  const enemy={typeId:'jaben',x:state.player.x+40,y:state.player.y,r:8,hp:1,alive:true,...extra};
  state.enemies.push(enemy); damageEnemy(enemy,999999);
} state.neutral.kills=999; finishRun(false);`);
assert.equal(read(kills).kills, 3);
// Pause and card choice do not add wall-clock time; retain only final owned cards.
const build = fresh();
build('state.elapsed=12.8; showOverlay("paused"); tick(50); chooseUpgradeCards(); tick(50); applyUpgrade(0);');
assert.equal(build('state.elapsed'), 12.8);
build(`state.upgrades=Object.fromEntries(UPGRADES.map(c=>[c.id,2]));
  state.abilities.secrets=[{id:'secret-ice',level:3}];
  UPGRADES[0].name='<unsafe & card>'; finishRun(false);`);
const built = read(build);
assert.equal(built.seconds, 12); assert.equal(built.cards.length, build('UPGRADES.length'));
assert.deepEqual(built.secrets, ['冰晶花園 Lv3']);
assert.ok(build.elements.runSummary.innerHTML.includes('&lt;unsafe &amp; card&gt;'));
assert.ok(!/NaN|undefined|<unsafe/.test(build.elements.runSummary.innerHTML));
build('state.loadout[0].level=5; state.abilities.secrets[0].level=5; state.upgrades={}; renderRunSummary(state.runSummary);');
assert.deepEqual(read(build), built, 'snapshot has no live object references');
// Storage errors cannot prevent the overlay or a clean replay.
const failure = fresh({storageFails:true});
failure('state.elapsed=3; finishRun(false)'); assert.equal(read(failure).newRecord, true);
assert.equal(failure('state.mode'), 'over'); failure('startGame()'); assert.equal(read(failure), null);
assert.equal(failure('bestRecord'), 3);
// Non-survival modes keep their original result/storage paths, never the summary.
const trial = fresh({saved:{[key]:'45'}});
trial('finishRun(false); startTrial(trialSettings().bosses[0].id); applyUpgrade(0); finishRun(false);');
assert.equal(read(trial), null); assert.equal(trial.elements.runSummary.hidden, true);
assert.equal(trial.storage[key], '45');
const maker = create({maker:true,saved:{[key]:'45'}});
maker('startGame(); applyUpgrade(0); state.elapsed=4; finishRun(false);');
assert.equal(read(maker), null); assert.equal(maker.elements.runSummary.hidden, true);
assert.equal(maker.storage[key], '45'); assert.equal(maker.storage['erin-survivor-maker-best-seconds-v1'], '4');
const data = JSON.parse(zero('JSON.stringify(GAME_DATA)'));
const preview = create({preview:{data,spec:{kind:'weapon',id:'water-ball'}},saved:{[key]:'45'}});
preview('finishRun(false)'); assert.equal(read(preview), null);
assert.equal(preview.elements.runSummary.hidden, true); assert.equal(preview.storage[key], '45');
console.log('PASS: run summary lifecycle, records, snapshots, replay, loadout and mode isolation (VM only)');
