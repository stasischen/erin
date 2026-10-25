// 地面錨點、離地縮淡、圖片分支與真實展示引擎的回歸測試。
const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
run(`globalThis.shadowCalls=[]; globalThis.shadowStyles=[];
  globalThis.shadowContext=new Proxy({}, {get:(t,k)=>k in t?t[k]:(...args)=>shadowCalls.push([k,...args]),set:(t,k,v)=>{t[k]=v;if(k==='fillStyle')shadowStyles.push(v);return true;}});`);
function shadow(height, size=.9) {
  return JSON.parse(run(`shadowCalls=[];shadowStyles=[];drawGroundShadow(100,200,20,${height},${size},shadowContext);JSON.stringify({ellipse:shadowCalls.find(c=>c[0]==='ellipse').slice(1),style:shadowStyles[0]})`));
}
const ground=shadow(0), air=shadow(70), wide=shadow(0,1.8);
assert.equal(ground.ellipse[1],217);
assert.equal(air.ellipse[1],ground.ellipse[1], 'ground anchor must not rise with body');
assert.ok(air.ellipse[2]<ground.ellipse[2] && air.ellipse[3]<ground.ellipse[3]);
assert.ok(parseFloat(air.style.split(',')[3])<parseFloat(ground.style.split(',')[3]));
assert.equal(wide.ellipse[2],ground.ellipse[2]*2);
let lastWidth=0;
for(const progress of [0,.25,.5,.75,1]) {
  const ellipse=JSON.parse(run(`shadowCalls=[];drawLandingShadow(100,200,20,${progress},shadowContext);JSON.stringify(shadowCalls.find(c=>c[0]==='ellipse'))`));
  assert.equal(ellipse[2],200); assert.ok(ellipse[3]>lastWidth); lastWidth=ellipse[3];
}
for(const sprite of [false,true]) {
  run(`SPRITES.jaben=${sprite?'{}':'null'};shadowCalls=[];drawBlob(100,200,20,'#abcdef',0,false,'jaben',shadowContext,1.2,70)`);
  assert.equal(run(`shadowCalls.findIndex(c=>c[0]==='ellipse') < shadowCalls.findIndex(c=>c[0]===${JSON.stringify(sprite?'drawImage':'rect')})`),true);
  assert.equal(run("shadowCalls.some(c=>c[0]==='translate' && c[1]===100 && c[2]===130)"),true);
}
run('resetGame();state.player.airHeight=40;drawCalls.length=0;drawHero()');
assert.ok(run("drawCalls.findIndex(c=>c[0]==='ellipse')<drawCalls.findIndex(c=>c[0]==='drawImage')"));
assert.ok(run("drawCalls.some(c=>c[0]==='translate' && c[2]===-40)"));
// 舊作品省略欄位仍有效；錯誤、無限值、負值不能進入引擎。
run('globalThis.draft=SurvivorData.defaults();draft.enemies.forEach(e=>delete e.shadowSize)');
assert.equal(run('SurvivorData.validate(draft).valid'),true);
assert.equal(run('SurvivorData.validate(draft).data.enemies[1].shadowSize'),.9);
for(const value of ['-1','0','1.81','NaN','Infinity','"1"','null']) {
  run(`draft.enemies[0].shadowSize=${value}`);
  assert.equal(run('SurvivorData.validate(draft).valid'),false,value);
}
run('draft.enemies[0].shadowSize=1.4');
assert.equal(run('SurvivorData.save(draft).data.enemies[0].shadowSize'),1.4);
assert.equal(run('SurvivorData.load().data.enemies[0].shadowSize'),1.4);
// 所有正式生成的怪物攜帶影子資料。
run('resetGame();spawnEnemy()');
assert.equal(run('state.enemies[0].shadowSize'),.9);
run(`resetGame();state.mode='playing';state.boss={x:state.player.x-100,y:state.player.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};beginBossMove('dash');globalThis.move=state.bossMoves[0];move.active=true;globalThis.duration=Math.hypot(move.endX-move.x,move.endY-move.y)/bossDefinition(move).speed;move.life=duration/2`);
assert.ok(run('bossAirHeight()>27'));
run('move.life=0');assert.ok(Math.abs(run('bossAirHeight()'))<1e-10);
run('clearBossMoves()');assert.equal(run('bossAirHeight()'),0);
// 正式角色與 iframe/Maker 共用 render，不另畫一份影子。
for(const spec of [{kind:'card',id:'big-water'},{kind:'move',id:'rain'},{kind:'move',id:'dash'}]) {
  const preview=createRun({preview:{data:JSON.parse(run('JSON.stringify(SurvivorData.defaults())')),spec}});
  assert.ok(preview("drawCalls.some(c=>c[0]==='ellipse')"));
  for(let i=0;i<100;i++)preview('stepPreview(.05)');
  assert.ok(preview('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number"||Number.isFinite(v)))'));
}
console.log('PASS: fixed ground shadows, altitude size/alpha, landing growth, sprite/fallback order, custom context, optional schema/defaults/bounds/storage, spawn, boss flight/reset and real iframe/Maker previews');
