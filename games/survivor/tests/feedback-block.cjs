// 固定作品／設定／dt → 回饋與沙盒狀態；不依賴瀏覽器上手審查。
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),createRun=require('./maker-support.cjs');
const run=createRun(),json=expr=>JSON.parse(run(`JSON.stringify(${expr})`));
run(`globalThis.legacyFeedback=SurvivorData.defaults();globalThis.oldJson=JSON.stringify(legacyFeedback);
globalThis.fbResult=SurvivorData.validate(legacyFeedback);`);
assert.equal(run('fbResult.valid'),true);assert.equal(run('JSON.stringify(legacyFeedback)===oldJson'),true);
assert.equal(run('fbResult.data.weapons[0].blocks.moves[0].feedback.hitStop'),0);
assert.equal(run('fbResult.data.enemies[0].blocks.moves[0].feedback.hitStop'),0);
// 舊的兩欄積木補預設，不丟掉作品。
run(`for(const w of fbResult.data.weapons)for(const m of w.blocks.moves)m.feedback={cue:m.feedback.cue,sound:m.feedback.sound};
globalThis.customFeedback=SurvivorData.validate(fbResult.data).data;
customFeedback.weapons[2].blocks.moves[0].feedback={...customFeedback.weapons[2].blocks.moves[0].feedback,hitStop:2,shake:0,slash:false,sound:'none',hint:false};
customFeedback.enemies[2].blocks.moves[0].feedback={...customFeedback.enemies[2].blocks.moves[0].feedback,hitStop:1,shake:2,warningStyle:'outline',hint:false};
customFeedback.boss.moves[0].blocks.moves[0].feedback.warningStyle='pulse';
globalThis.savedFeedback=SurvivorData.save(customFeedback);globalThis.loadedFeedback=SurvivorData.load();`);
assert.equal(run('savedFeedback.valid'),true);assert.deepEqual(json('loadedFeedback.data'),json('savedFeedback.data'));
for(const edit of ['hitStop=Infinity','shake=-1','slash="yes"','hint=1','sound="eval"','warningStyle="script"','extra=1']) {
 run('globalThis.invalidFeedback=SurvivorData.copy(savedFeedback.data);invalidFeedback.weapons[2].blocks.moves[0].feedback.'+edit);
 assert.equal(run('SurvivorData.validate(invalidFeedback).valid'),false,edit);
}
run(`resetGame();state.mode='playing';state.weaponId='candy-sword';state.spawnTimer=Infinity;state.shotTimer=Infinity;
Object.assign(activeWeapon(),savedFeedback.data.weapons[2]);globalThis.fbEnemy=spawnEnemy({typeId:'jaben'});
fbEnemy.x=state.player.x+45;fbEnemy.y=state.player.y;fbEnemy.hp=fbEnemy.maxHp=10000;fbEnemy.speed=0;
globalThis.soundEvents=[];playSound=id=>soundEvents.push(id);fireAtNearest();`);
assert.ok(run('fbEnemy.hp<10000'));assert.equal(run('state.hitStop'),.1);assert.equal(run('state.hitShake'),0);
assert.equal(run('state.vfx.find(v=>v.kind==="hammer-swing").slash'),false);
assert.equal(run('soundEvents.includes("shoot")'),false);
run('GAME_DATA.hitJuice.enabled=false;state.hitStop=0;feedbackImpact({hitStop:2,shake:2})');assert.equal(run('state.hitStop'),0);
run('GAME_DATA.hitJuice.enabled=true;GAME_DATA.hitJuice.intensity=.5;feedbackImpact({hitStop:2,shake:2})');assert.equal(run('state.hitStop'),.05);assert.equal(run('state.hitShakePixels'),2);
// 工具不儲存作品，凍結和慢動作精確縮放 dt，生成遵守上限。
run(`SurvivorDebugTools.options.speed=.25;`);assert.equal(run('SurvivorDebugTools.step(.04)'),.01);
run('SurvivorDebugTools.options.frozen=true');assert.equal(run('SurvivorDebugTools.step(.04)'),0);
run(`SurvivorDebugTools.options.compare=true;SurvivorDebugTools.sample();globalThis.ghosts=SurvivorDebugTools.capture();`);assert.ok(run('ghosts.length>0'));
run('SurvivorDebugTools.spawn(20)');assert.equal(run('state.enemies.length'),21);assert.ok(run('state.enemies.every(e=>targetVisible(e))'));
// 每張卡都有自己的文字，包括 10 中立道具、5 風流派卡；數值來自目前作品。
const descriptions=vm.createContext({URL,document:{currentScript:{src:'http://localhost/games/survivor/preview.js'}}});
vm.runInContext(fs.readFileSync(`${__dirname}/../preview.js`,'utf8'),descriptions);
const data=json('savedFeedback.data');
for(const c of data.cards) {
 const text=descriptions.SurvivorPreview.describe(data,{kind:'card',id:c.id});
 assert.ok(text.length>5,c.id);assert.ok(!text.includes('使用原本的卡片組合'),c.id);
}
const itemTexts=data.cards.filter(c=>c.neutral).map(c=>descriptions.SurvivorPreview.describe(data,{kind:'card',id:c.id}));assert.equal(new Set(itemTexts).size,10);
data.neutralRules.cookieKills=17;assert.match(descriptions.SurvivorPreview.describe(data,{kind:'card',id:'item-cookie'}),/17/);
data.schoolRules.refundCharge=.7;assert.match(descriptions.SurvivorPreview.describe(data,{kind:'card',id:'wind-refund'}),/0.7/);
// 兩個沙盒確實凍結所有遊戲計時；工具 UI 的畫面驗收交 Grok。
const preview=createRun({preview:{data,spec:{kind:'card',id:'big-water'}}});
preview('SurvivorDebugTools.options.frozen=true;globalThis.frozenTime=previewTime;stepPreview(.05)');assert.equal(preview('previewTime'),preview('frozenTime'));
preview(fs.readFileSync(`${__dirname}/../practice-rules.js`,'utf8'));preview(fs.readFileSync(`${__dirname}/../practice-engine.js`,'utf8'));
preview('globalThis.frozenPractice=practiceClock;practiceStep(.05)');assert.equal(preview('practiceClock'),preview('frozenPractice'));
console.log('PASS: feedback migration/purity/save/reload/rejection, real melee damage with independent stop/shake/slash/sound, player intensity, sandbox slow/freeze/spawn/ghosts, all card descriptions and live numbers');
