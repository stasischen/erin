const assert = require('node:assert/strict'), createRun = require('./maker-support.cjs');
const run = createRun();
// 舊作品只有關卡，沒有新外觀欄位；保留既有卡片數值。
run('globalThis.old=SurvivorData.defaults();delete old.visuals;old.stages.forEach(s=>delete s.decorationDensity);old.cards[0].name="保留名字"');
assert.equal(run('SurvivorData.validate(old).valid'),true);
assert.equal(run('SurvivorData.validate(old).data.cards[0].name'),'保留名字');
for (const density of [0,.25,1]) {
  run(`old.stages.forEach(s=>s.decorationDensity=${density});old.visuals={spriteOutline:false}`);
  assert.equal(run('SurvivorData.save(old).valid'),true);
  assert.equal(run('SurvivorData.load().data.stages[1].decorationDensity'),density);
  assert.equal(run('SurvivorData.load().data.visuals.spriteOutline'),false);
}
for (const value of ['-1','1.01','null','"0.2"']) {
  run(`old.stages[0].decorationDensity=${value}`);
  assert.equal(run('SurvivorData.validate(old).valid'),false);
}
run('old=SurvivorData.defaults();old.visuals.spriteOutline="false"');
assert.equal(run('SurvivorData.validate(old).valid'),false);
// 每個 tile 只用三色；無裝飾時只有底色及大地磚，負鏡頭仍用共用 renderer。
for (const kind of ['candy-forest','cookie-forest']) {
  run('drawCalls.length=0');
  run(`backgroundTile('${kind}',0)`);
  const rects=JSON.parse(run('JSON.stringify(drawCalls.filter(c=>c[0]==="fillRect"))'));
  assert.equal(rects.length,13); // 底色＋4×3 大地磚
  assert.ok(rects.slice(1).every(c=>c[3]===78 && c[4]===78));
  run(`globalThis.tile=backgroundTile('${kind}',0)`);
  assert.equal(run(`backgroundTile('${kind}',0)===tile`),true);
}
// 外框開關影響主角、13 種怪物及老師；關閉時仍畫原圖一次。
run('globalThis.pic=teacherPicture(false);globalThis.maskCount=0');
for (const enabled of [true,false]) {
  run(`GAME_DATA.visuals.spriteOutline=${enabled};drawCalls.length=0;drawOutlinedSprite(ctx,pic,10,20,52,68)`);
  assert.equal(run('drawCalls.filter(c=>c[0]==="drawImage" && c.length===6).length'),enabled?5:1);
}
const preview=createRun({preview:{data:JSON.parse(run('JSON.stringify(SurvivorData.defaults())')),spec:{kind:'card',id:'big-water'}}});
preview('render()');
assert.equal(preview('backgroundTile(currentStage().background,currentStage().decorationDensity)===BACKGROUND_TILES["candy-forest"]'),true);
console.log('PASS: legacy appearance migration, density bounds/save/load, large seamless cached tiles, outline toggle and shared preview ground');
