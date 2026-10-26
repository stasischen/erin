// 固定選卡 → 身體配色；像素色盤與實際 renderer 接合，不啟動 Chrome。
const assert = require('node:assert/strict');
const run = require('./maker-support.cjs')();
const value = code => JSON.parse(run(`JSON.stringify(${code})`));
function owns(ids) { run(`state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,1]));`); }
run('resetGame();');
assert.deepEqual(value('buildAppearance().bodyColors'), []);
assert.equal(run('heroSchoolPicture(false,[])===HERO_PICTURES.happy'), true);
assert.equal(run('heroSchoolPicture(true,[])===HERO_PICTURES.hurt'), true);
owns(['item-crown']);assert.deepEqual(value('buildAppearance().bodyColors'), []);
for (const school of ['water','wind','thunder']) {
  owns([school+'-attack']);
  assert.deepEqual(value('buildAppearance().bodyColors'), [school]);
  assert.equal(run(`heroPixelColor('b',5,[BUILD_TUNING.${school}.color])===BUILD_TUNING.${school}.color`),true);
}
owns(['water-attack','wind-attack']);run("state.schoolRun.starter='wind'");
assert.deepEqual(value('buildAppearance().bodyColors'),['wind']);
owns(['water-attack','wind-attack','water-skill']);
assert.deepEqual(value('buildAppearance().bodyColors'),['water']);
for (const colors of [['water','wind'],['water','thunder'],['wind','thunder']]) {
  // 由卡片資料取得實際雙流派；若名稱變更，測試仍要求三種組合都有覆蓋。
  const card = run(`UPGRADES.find(c=>c.schools && c.schools.join(',')===${JSON.stringify(colors.join(','))}).id`);
  owns([card]);assert.deepEqual(value('buildAppearance().bodyColors'),colors);
}
// 記錄真正生成的 20×24 像素：雙色、亮暗、輪廓、眼白和痛痛表情。
run(`globalThis.originalCreate=document.createElement;document.createElement=()=>{const picture={pixels:{}};const pen={fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)picture.pixels[xx+','+yy]=this.fillStyle;}};picture.getContext=()=>pen;return picture;};
 globalThis.colors=[BUILD_TUNING.wind.color,BUILD_TUNING.thunder.color];globalThis.pic=makeHeroPicture(false,colors);globalThis.ouch=makeHeroPicture(true,colors);document.createElement=originalCreate;`);
assert.equal(run("pic.pixels['9,21']"),run('colors[0]'));
assert.equal(run("pic.pixels['11,21']"),run('colors[1]'));
assert.equal(run("pic.pixels['4,12']"),'#ffffff');
assert.equal(run("pic.pixels['10,0']"),run('HERO_COLORS.o'));
assert.equal(run("ouch.pixels['9,17']"),run('HERO_COLORS.p'));
assert.notEqual(run("heroPixelColor('l',5,colors)"),run("heroPixelColor('d',5,colors)"));
// 一般／受傷圖都快取；雙關卡、雙武器、兩個朝向使用同一配色圖。
for (const stage of [0,1]) for (const weapon of ['water-ball','candy-hammer']) for (const facing of [-1,1]) {
  run(`state.stageIndex=${stage};state.weaponId=${JSON.stringify(weapon)};state.player.facing=${facing};`);
  assert.equal(run('activeWeapon().id'),weapon);
  owns(['water-attack','water-skill','water-dash','thunder-attack','fusion-puddle']);
  assert.ok(value('buildAppearance().forms').includes('water'));
  for (const hurt of [false,true]) {
    run(`state.player.invincible=${hurt?1:0};globalThis.expected=heroSchoolPicture(${hurt},buildAppearance().bodyColors);drawCalls.length=0;drawHero();`);
    assert.equal(run('drawCalls.some(c=>c[0]==="drawImage"&&c[1]===expected)'),true);
    assert.equal(run(`heroSchoolPicture(${hurt},buildAppearance().bodyColors)===expected`),true);
  }
}
run('resetGame();');assert.deepEqual(value('buildAppearance().bodyColors'),[]);
console.log('PASS: unselected/neutral/default, main school ties/growth, all fusion pairs, shaded body pixels and preserved face, cached happy/hurt renderer across stages/weapons/facing, transformations and reset');
