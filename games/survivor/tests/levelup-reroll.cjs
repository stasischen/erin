// 每場重抽配額、合法卡池、重抽後確認及舊作品相容性。
const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
run(`globalThis.mounts=[]; globalThis.SurvivorPreview={stop(){},mount:(host,data,spec)=>mounts.push(spec)};
resetGame(); chooseUpgradeCards(); globalThis.previous=state.pendingChoices.map(c=>c.id);
globalThis.progress=JSON.stringify([state.upgrades,state.xp,state.level,state.player.health,state.elapsed]);`);
assert.equal(run('state.rerollsRemaining'), 2);
run('rerollUpgradeCards();');
assert.equal(run('state.rerollsRemaining'), 1);
assert.equal(run('state.mode'), 'levelup');
assert.equal(run('new Set(state.pendingChoices.map(c=>c.id)).size'), 3);
assert.equal(run('state.pendingChoices.every(c=>canOffer(c) && !previous.includes(c.id))'), true);
assert.equal(run('JSON.stringify([state.upgrades,state.xp,state.level,state.player.health,state.elapsed])===progress'), true);
assert.equal(run('mounts[mounts.length-1].id===state.pendingChoices[0].id'), true);
assert.equal(run.elements.upgradeName.textContent, run('state.pendingChoices[0].name'));
assert.equal(run.elements.rerollCount.textContent, '1');
run('rerollUpgradeCards(); globalThis.exhausted=JSON.stringify(state.pendingChoices); rerollUpgradeCards();');
assert.equal(run('state.rerollsRemaining'), 0);
assert.equal(run('JSON.stringify(state.pendingChoices)===exhausted'), true);
assert.equal(run.elements.rerollUpgrade.disabled, true);
const chosen = run('state.pendingChoices[0].id');
run.elements.confirmUpgrade.onclick();
assert.equal(run(`upgradeLevel(${JSON.stringify(chosen)})`), 1);
assert.equal(run('state.mode'), 'playing');
run('chooseUpgradeCards();');
// 幸運草取得時本來就送一次重抽；與升級本身是否補次數分開驗證。
assert.equal(run('state.rerollsRemaining'), chosen === 'item-clover' ? 1 : 0, '下次升級不額外補次數（保留幸運草獎勵）');
run(`resetGame(); state.mode='paused'; globalThis.before=JSON.stringify(state.pendingChoices);rerollUpgradeCards();`);
assert.equal(run('state.rerollsRemaining'), 2);
assert.equal(run('JSON.stringify(state.pendingChoices)===before'), true, '非升級中不重抽');
// 所有卡都滿級時停用重抽；直接呼叫也不扣次數，仍能確認回血。
run(`UPGRADES.forEach(c=>state.upgrades[c.id]=5); chooseUpgradeCards(); rerollUpgradeCards();`);
assert.equal(run('state.pendingChoices.length'), 1);
assert.equal(run('state.pendingChoices[0].id'), 'heal');
assert.equal(run('state.rerollsRemaining'), 2);
assert.equal(run.elements.rerollUpgrade.disabled, true);
run('state.player.health=1; applyUpgrade(0);');
assert.ok(run('state.player.health>1'));
// 小卡池仍維持唯一、合法，允許少於三張。
run(`resetGame();UPGRADES.forEach(c=>state.upgrades[c.id]=5);state.upgrades['big-water']=0;state.upgrades['rapid-water']=0;chooseUpgradeCards();rerollUpgradeCards();`);
assert.equal(run('state.pendingChoices.length'), 2);
assert.equal(run('new Set(state.pendingChoices.map(c=>c.id)).size'), 2);
assert.equal(run('state.pendingChoices.every(canOffer)'), true);
// 新欄位缺省時補 2；自訂作品可用 0～9 的整數，拒絕小數與越界。
run(`globalThis.legacy=SurvivorData.defaults();delete legacy.tuning.levelupRerolls;legacy.cards[0].name='舊作品';legacy.tuning.playerSpeed=205;globalThis.migrated=SurvivorData.validate(legacy);`);
assert.equal(run('migrated.valid'), true);
assert.equal(run('migrated.data.tuning.levelupRerolls'), 2);
assert.equal(run('migrated.data.cards[0].name'), '舊作品');
assert.equal(run('migrated.data.tuning.playerSpeed'), 205);
for (const value of [0,1,9,-1,10,1.5,null,'2']) {
  run(`globalThis.custom=SurvivorData.defaults();custom.tuning.levelupRerolls=${JSON.stringify(value)};`);
  assert.equal(run('SurvivorData.validate(custom).valid'), [0,1,9].includes(value));
}
const data = JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
for (const count of [0,4]) {
  data.tuning.levelupRerolls = count;
  const maker = createRun({maker:true,saved:{'erin-survivor-maker-v1':JSON.stringify(data)}});
  maker('resetGame();chooseUpgradeCards();rerollUpgradeCards();');
  assert.equal(maker('state.rerollsRemaining'), Math.max(0,count-1));
  maker('resetGame();');
  assert.equal(maker('state.rerollsRemaining'), count);
}
console.log('PASS: whole-row fresh legal offers, unique/small/heal pools, shared per-run quota, exhaustion/mode guards, first-card preview/confirmation, progress unchanged, reset, integer bounds, legacy preservation and custom Maker quota');
