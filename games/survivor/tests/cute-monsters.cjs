const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
assert.equal(run('SurvivorMonsters.ids.length'),16);
const patterns = new Set();
for (const id of JSON.parse(run('JSON.stringify(SurvivorMonsters.ids)'))) {
  run('drawCalls.length=0');
  assert.equal(run(`SurvivorMonsters.picture('${id}').width`),24);
  patterns.add(run('JSON.stringify(drawCalls)'));
  assert.equal(run(`SurvivorMonsters.picture('${id}')===SurvivorMonsters.picture('${id}')`),true);
  run(`globalThis.d=SurvivorData.defaults();d.enemies[0].spriteId='${id}';SurvivorData.save(d)`);
  assert.equal(run('SurvivorData.load().data.enemies[0].spriteId'),id);
  const data=JSON.parse(run('JSON.stringify(d)'));
  const preview=createRun({preview:{data,spec:{kind:'card',id:'big-water'}}});
  preview('drawCalls.length=0;render()');
  assert.equal(preview(`drawCalls.some(c=>c[0]==='drawImage' && c[1]===SurvivorMonsters.picture('${id}'))`),true);
}
assert.equal(patterns.size,16,'each bitmap must be distinct');
for (const value of ['"unknown"','"__proto__"','null','123','{}']) {
  run(`d.enemies[0].spriteId=${value}`);
  assert.equal(run('SurvivorData.validate(d).valid'),false);
}
run('d=SurvivorData.defaults();d.enemies.forEach(e=>delete e.spriteId);d.enemies[0].name="舊怪物";d.enemies[0].hp=222');
assert.equal(run('SurvivorData.save(d).valid'),true);
assert.equal(run('SurvivorData.load().data.enemies[0].spriteId'),'gummy-bear');
assert.equal(run('SurvivorData.load().data.enemies[1].spriteId'),'dandelion');
assert.equal(run('SurvivorData.load().data.enemies[0].name'),'舊怪物');
assert.equal(run('SurvivorData.load().data.enemies[0].hp'),222);
assert.equal(run('SurvivorMonsters.picture("__proto__")'),null);
console.log('PASS: 16 distinct cached pixel skins; schema ID whitelist, save/load, legacy names/stats migration and real preview renderer');
