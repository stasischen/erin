// 圖示契約、舊作品轉換與介面字元檢查；不需要瀏覽器字型。
const fs = require('node:fs'), assert = require('node:assert/strict');
const run = require('./maker-support.cjs')();
const emoji = /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/u;
for (const file of ['index.html','maker/index.html','game.js','maker/maker.js','data/defaults.js','icons.js']) {
  const source = fs.readFileSync(`${__dirname}/../${file}`, 'utf8').split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
  assert.ok(!emoji.test(source), `${file} has emoji in UI/data`);
}
const defaults = JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
assert.ok(!emoji.test(JSON.stringify(defaults)));
assert.equal(new Set(defaults.cards.map(c => c.icon)).size, defaults.cards.length);
assert.equal(new Set(run('SURVIVOR_DEFAULTS.cards.map(c => SurvivorIcons.pixels(c.icon).join("/"))')).size, defaults.cards.length);
for (const id of run('SurvivorIcons.ids')) {
  const rows = run(`SurvivorIcons.pixels(${JSON.stringify(id)})`);
  assert.equal(rows.length, 8, id); rows.forEach(row => assert.match(row, /^[.#+]{8}$/, id));
  const html = run(`SurvivorIcons.html(${JSON.stringify(id)})`);
  assert.ok(html.includes('aria-hidden="true"') && html.includes('alt=""'));
  assert.ok(decodeURIComponent(html).includes('shape-rendering="crispEdges"'));
}
for (const bad of ['__proto__','constructor','<script>','unknown',null,{}]) assert.equal(run(`SurvivorIcons.normalize(${JSON.stringify(bad)})`),'common');
// 已存作品：舊卡片 emoji、變體選擇符、流派及自訂文字會轉換，數值不流失。
run(`globalThis.old = SurvivorData.defaults(); old.tuning.playerSpeed = 205;
old.build.water.name = '\\uD83C\\uDF0A 我的水'; old.cards[0].icon = '\\uD83D\\uDCA7';
old.cards[1].icon = '\\uD83C\\uDF08'; old.cards[2].icon = 'unknown';
old.cards[3].name = '\\uD83E\\uDDC5 洋蔥'; old.cards[4].icon = '\\u2764';
localStorage.setItem(SurvivorData.KEY, JSON.stringify(old)); globalThis.migrated = SurvivorData.load();`);
assert.equal(run('migrated.valid'),true);
assert.equal(run('migrated.data.cards[0].icon'),'big-water');
assert.equal(run('migrated.data.cards[1].icon'),'fusion-storm');
assert.equal(run('migrated.data.cards[2].icon'),'multi-water');
assert.equal(run('migrated.data.cards[4].icon'),'bubble-shield');
assert.equal(run('migrated.data.tuning.playerSpeed'),205);
assert.equal(run('migrated.data.build.water.name'),'我的水');
assert.ok(!emoji.test(run('JSON.stringify(migrated.data)')));
assert.equal(run('SurvivorData.save(migrated.data).valid'),true);
assert.ok(!emoji.test(run('localStorage.getItem(SurvivorData.KEY)')));
// 三選一、技能樹、HUD 與卡片浮動動畫都使用圖集。
run('startGame(); chooseUpgradeCards(); renderSkillTree(document.getElementById("skillTree"));');
assert.ok(run('document.getElementById("skillTree").innerHTML').includes('pixel-icon'));
assert.ok(run('document.getElementById("buildSlots").innerHTML').includes('pixel-icon'));
run('state.mode="levelup"; applyUpgrade(0); drawSkillVisuals();');
assert.ok(!run('drawCalls.some(row => row[0] === "fillText" && SurvivorIcons.ids.includes(row[1]))'));
const page = fs.readFileSync(`${__dirname}/../index.html`,'utf8');
for (const id of ['pauseButton','skillButton','dashButton','save','makerClose']) assert.match(page,new RegExp(`id="${id}"[^>]*aria-label=`));
assert.ok(page.indexOf('src="icons.js') < page.indexOf('src="data/schema.js'));
assert.ok(fs.readFileSync(`${__dirname}/../../../sw.js`,'utf8').includes("'games/survivor/icons.js'"));
console.log('PASS: emoji-free UI/data, distinct 24 card patterns, bounded grid/accessible images, hostile IDs, legacy migration/save, HUD/tree/VFX and cache dependency');
