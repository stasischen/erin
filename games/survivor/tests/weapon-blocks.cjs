// 固定舊作品 → 積木 → 載入後的狀態與事件。保留舊欄位作為等效基準。
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun(),json=code=>JSON.parse(run(`JSON.stringify(${code})`));
run(`globalThis.old=SurvivorData.defaults();
old.weapons[0].comboEvery=5;old.weapons[0].splashDamage=.65;
old.weapons[1].radius=95;old.weapons[1].chargeStun=1.2;
old.weapons[2].comboMultiplier=3.1;old.weapons[2].chargeSeconds=1.4;
globalThis.before=JSON.stringify(old);globalThis.result=SurvivorData.validate(old);`);
assert.equal(run('result.valid'),true);assert.equal(run('JSON.stringify(old)===before'),true);
assert.equal(run('result.data.weapons.every(w=>w.blocks.version===1&&w.blocks.moves.length===5)'),true);
run('globalThis.round=SurvivorData.validate(JSON.parse(JSON.stringify(result.data)))');
assert.deepEqual(json('round.data'),json('result.data'));
// 舊／新固定規則輸入，涵蓋三把武器、連段末段、精確蓄力門檻、移動及衝刺。
for(let i=0;i<3;i++) {
 run(`globalThis.legacy=old.weapons[${i}];globalThis.modern=result.data.weapons[${i}];`);
 for(const n of [0,1,2,3,4,9]) for(const idle of [0,1.1,2]) for(const charge of [0,1,1.4]) {
  run(`globalThis.p={number:${n},idle:${idle},charge:${charge},moving:false}`);
  for(const moving of [false,true]) assert.deepEqual(json(`SurvivorEffectBlocks.attackTick(p,modern,.05,${moving})`),json(`SurvivorEffectBlocks.attackTick(p,legacy,.05,${moving})`));
  assert.deepEqual(json('SurvivorEffectBlocks.attack(p,modern)'),json('SurvivorEffectBlocks.attack(p,legacy)'));
  if(i) for(const charged of [false,true]) for(const dash of [false,true]) {
   const args=`${n+1},.7,{size:1.3,damage:40,push:5,extraArc:20},{charged:${charged},dash:${dash}}`;
   assert.deepEqual(json(`SurvivorWeapons.swing(modern,${args})`),json(`SurvivorWeapons.swing(legacy,${args})`));
  }
 }
}
// 三種舊特殊招的固定事件輸出；預設數值保持原樣。
for(const [id,kind,count,range] of [['water-ball','water-fan',5,420],['candy-sword','sword-wave',1,420],['candy-hammer','leap',1,110]]) {
 assert.deepEqual(json(`SurvivorAttackInput.special('${id}',.4)`),{type:'weapon-special',weaponId:id,angle:.4,cooldown:6,kind,count,spread:count===5?.18:0,range,damageMultiplier:2,leapDistance:80,leapSeconds:.25});
}
// 積木是儲存來源：同名相容欄位不蓋掉編輯結果，載入仍走真實戰鬥入口。
run(`globalThis.work=result.data;work.weapons[2].blocks.moves[1].effect.comboMultiplier=4;
work.weapons[2].blocks.moves[2].trigger.chargeSeconds=.8;
work.weapons[2].blocks.moves[0].timing.phases.windup=.35;
work.weapons[2].blocks.moves[3].effect.specialDamage=3;work.weapons[2].blocks.moves[3].timing.specialCooldown=4;
SurvivorData.save(work);`);
const live=createRun({maker:true,saved:run.storage});
live(`resetGame();state.mode='playing';state.weaponId='candy-sword';state.weaponAttack={number:2,idle:0,charge:0,moving:false};swingAtNearest(false,{angle:0});`);
assert.equal(live('SurvivorAttackInput.special(state.weaponId,0,activeWeapon()).damageMultiplier'),3);
assert.equal(live('SurvivorAttackInput.special(state.weaponId,0,activeWeapon()).cooldown'),4);
assert.equal(live('activeWeapon().comboMultiplier'),4);assert.equal(live('activeWeapon().chargeSeconds'),.8);assert.equal(live('activeWeapon().timing.windup'),.35);
assert.equal(live('state.lastWeaponAttack.finisher'),true);
assert.equal(live('state.vfx.find(v=>v.kind==="hammer-swing").damage'),140);
live(`GAME_DATA.attackMode='manual';beginManualAttack('special');releaseManualAttack('special');`);
assert.equal(live('state.lastSpecialEvent.damageMultiplier'),3);assert.equal(live('state.specialCooldown'),4);
assert.equal(live('state.projectiles[0].damage'),105);
// 拒絕不支援的版本／積木、非有限值、缺欄位、未知回饋和 360 度蓄力。
for(const edit of [
 'w.blocks=null','w.blocks.version=2','w.blocks.moves.pop()',
 'w.blocks.moves[1].id="primary"','w.blocks.moves[1].trigger.comboEvery=2.5',
 'w.blocks.moves[2].shape.chargeShape="spin"','w.blocks.moves[2].shape.chargeSize=Infinity',
 'delete w.blocks.moves[2].trigger.chargeSeconds','w.blocks.moves[2].trigger.chargeEnabled="yes"',
 'w.blocks.moves[0].shape.code="x"','w.blocks.moves[0].timing.phases.windup=-1',
 'w.blocks.moves[0].feedback.sound="other"','w.blocks.moves[0].extra={}','w.blocks.moves[3].effect.specialDamage=99','w.blocks.moves[3].trigger.event="onTimer"'
]) assert.equal(run(`(()=>{const d=SurvivorData.copy(result.data),w=d.weapons[2];${edit};return SurvivorData.validate(d).valid})()`),false,edit);
console.log('PASS: legacy weapon stacks migration/purity/roundtrip, fixed combo/charge/dash/swing equivalence, canonical block edits through save/load/live combat, bounds/forward charge/unknown block rejection');
