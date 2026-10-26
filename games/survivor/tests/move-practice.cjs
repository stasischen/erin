const fs=require('node:fs'),assert=require('node:assert/strict');
const createRun=require('./maker-support.cjs');
const base=createRun(),data=JSON.parse(base('JSON.stringify(SurvivorData.defaults())'));
const run=createRun({preview:{data,spec:{kind:'card',id:'big-water'}}});
run(fs.readFileSync(`${__dirname}/../practice-rules.js`,'utf8'));
// 固定輸入→輸出；階段界線、零時長、範圍限制，不讀取真實時間。
run('globalThis.c={windup:.8,active:.15,recovery:.6,cooldown:2}');
assert.equal(run('SurvivorPracticeRules.timeline(c,"windup",.8).progress'),0);
assert.equal(run('SurvivorPracticeRules.timeline(c,"active",.15).elapsed'),.8);
assert.ok(Math.abs(run('SurvivorPracticeRules.timeline(c,"recovery",.6).elapsed')-.95)<1e-9);
assert.equal(run('SurvivorPracticeRules.timeline(c,"cooldown",0).progress'),1);
assert.equal(run('SurvivorPracticeRules.timeline(c,"active",999).elapsed'),.8);
assert.equal(run('SurvivorPracticeRules.timeline({},"active",0).progress'),0);
assert.equal(run('SurvivorPracticeRules.timeline(c,"ready",0).progress'),0);
const pudding=run('SurvivorPracticeRules.model(GAME_DATA,"pudding")');
assert.equal(pudding.windup,data.enemies.find(e=>e.id==='pudding').phaseAttack.windup);
run('globalThis.descriptionData=SurvivorData.defaults();descriptionData.enemies.find(e=>e.id==="pudding").phaseAttack.windup=1.7;descriptionData.enemies.find(e=>e.id==="pudding").phaseAttack.damage=23');
assert.match(run('SurvivorPracticeRules.describe(SurvivorPracticeRules.model(descriptionData,"pudding"))'),/1.7s.*傷害 23/);
assert.match(run('SurvivorPracticeRules.describe(SurvivorPracticeRules.model(GAME_DATA,"fairy"))'),/缺口/);
assert.match(run('SurvivorPracticeRules.describe(SurvivorPracticeRules.model(GAME_DATA,"candy-hammer"))'),/每 4 下旋轉/);
assert.match(run('SurvivorPracticeRules.describe(SurvivorPracticeRules.model(GAME_DATA,"item-wall"))'),/浪花擊退 55/);
assert.equal(run('SurvivorPracticeRules.model(GAME_DATA,"pop-candy").recovery'),0);
// 真實引擎沙盒：每個清單項目能循環，無傷、無生成、無結算；確實發射／揮擊／分階段。
run(fs.readFileSync(`${__dirname}/../practice-engine.js`,'utf8'));
for(const id of ['water-ball','candy-hammer','item-wall','pudding','mushroom','fairy','donut','pop-candy']) {
  run(`practiceId='${id}';practiceReset();globalThis.seenShots=0;globalThis.seenSwings=0;globalThis.seenPhases=new Set();globalThis.seenSpin=false`);
  for(let i=0;i<300;i++)run('practiceStep(.05);seenShots=Math.max(seenShots,state.projectiles.length+state.enemyShots.length);seenSwings=Math.max(seenSwings,state.swingCount);seenSpin=seenSpin||state.vfx.some(v=>v.kind==="hammer-swing"&&v.spin);if(practiceEnemy&&practiceEnemy.phaseAttack)seenPhases.add(practiceEnemy.phaseAttack.phase)');
  assert.equal(run('state.player.health'),data.tuning.playerHealth,id);
  assert.equal(run('state.mode'),'playing',id);
  assert.ok(run('state.enemies.length')<=2,id);
  if(['water-ball','item-wall','mushroom','fairy'].includes(id))assert.ok(run('seenShots')>0,id);
  if(id==='candy-hammer'){assert.ok(run('seenSwings')>=4);assert.equal(run('seenSpin'),true);}
  if(['pudding','mushroom','fairy'].includes(id))assert.equal(run('[...seenPhases].includes("recovery")'),true,id);
}
// 重播保留持續觸控；免傷不依賴閃爍計時；跟隨搖桿共用正式輸入函式。
run('practiceId="pudding";practiceReset();state.joy={baseX:80,baseY:80,x:1,y:0};state.pointerId=7;globalThis.startX=state.player.x;practiceStep(.05)');
assert.ok(run('state.player.x>startX'));
run('practiceReset(true)');assert.equal(run('state.pointerId'),7);assert.equal(run('state.joy.x'),1);
run('practiceReset();state.player.x=practiceEnemy.x-40;state.player.y=practiceEnemy.y');
for(let i=0;i<80;i++)run('practiceStep(.05)');
assert.equal(run('state.player.health'),data.tuning.playerHealth);
// 即時更新採整個沙盒重載，避免速度、傷害等 const 留在舊值；保留招式選擇。
run('globalThis.reloads=0;location.reload=()=>reloads++;window.updatePracticeData(descriptionData)');
assert.equal(run('reloads'),1);assert.equal(run('frameElement._practicePayload.data.enemies.find(e=>e.id==="pudding").phaseAttack.damage'),23);
console.log('PASS: practice descriptions/timeline boundaries/data changes, eight real-engine loops, fourth hammer spin, real phase recovery, immune movement, held joystick, hot reload payload');
