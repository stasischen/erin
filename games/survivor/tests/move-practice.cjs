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
run("GAME_DATA.attackMode='auto'"); // 本段驗證自動示範；手動模式另由 manual-attack 測試。
// 真實引擎沙盒：每個清單項目能循環，無傷、無生成、無結算；確實發射／揮擊／分階段。
run(fs.readFileSync(`${__dirname}/../practice-engine.js`,'utf8'));
for(const id of ['water-ball','candy-hammer','candy-sword','item-wall','pudding','mushroom','fairy','donut','pop-candy']) {
  run(`practiceId='${id}';practiceReset();globalThis.seenShots=0;globalThis.seenSwings=0;globalThis.seenPhases=new Set();globalThis.seenSpin=false`);
  // 第四下旋轉獨立驗證；站定蓄力依家長修訂會優先改成前方重擊。
  if(id==='candy-hammer')run("GAME_DATA.weapons.find(w=>w.id==='candy-hammer').chargeEnabled=false");
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
// 熱更新不重建 iframe；同一引擎立即讀取新的攻擊數值。
run('globalThis.reloads=0;location.reload=()=>reloads++;window.updatePracticeData(descriptionData)');
assert.equal(run('reloads'),0);assert.equal(run('practiceConfig.damage'),23);
assert.equal(run('frameElement._practicePayload.data.enemies.find(e=>e.id==="pudding").phaseAttack.damage'),23);
// 命中只記一輪、衝刺保護、一次結算、失誤清空連勝。
run('practiceReset();practiceDashProtected=false;practiceHit();practiceHit();practiceScore();practiceScore()');
assert.deepEqual(JSON.parse(run('JSON.stringify(practiceStats)')),{dodged:0,hit:1,streak:0});
run('practiceStartRound();practiceDashProtected=true;practiceHit();practiceScore()');
assert.deepEqual(JSON.parse(run('JSON.stringify(practiceStats)')),{dodged:1,hit:1,streak:1});
run('practiceStartRound();practiceDashProtected=false;practiceHit();practiceScore()');
assert.equal(run('practiceStats.streak'),0);
assert.equal(run('state.player.health'),data.tuning.playerHealth);
assert.equal(run('SurvivorPracticeRules.windup(2,0,true)'),2);
assert.equal(run('SurvivorPracticeRules.windup(2,100,true)'),.5);
// 下一輪瞄準當下位置，不清空手指、鍵盤、衝刺／技能冷卻。
run('state.player.y+=90;state.keys.add("ArrowRight");state.skillCooldown=3;practiceStartRound()');
assert.ok(run('practiceEnemy.phaseAttack.angle>0'));
assert.equal(run('state.skillCooldown'),3);assert.equal(run('state.keys.has("ArrowRight")'),true);
// 真實 pointer 事件接到共用搖桿；第二指不得搶走，動作鍵可同時啟動。
run('practiceReset();globalThis.pointer={pointerId:42,clientX:100,clientY:300,target:{closest:()=>null},preventDefault(){}}');
run.elements.gameCanvas.listeners.pointerdown(run('pointer'));
assert.equal(run('state.pointerId'),42);
run.elements.gameCanvas.listeners.pointermove(run('({...pointer,clientX:200})'));
run('globalThis.inputStart=state.player.x;practiceStep(.05)');assert.ok(run('state.player.x>inputStart'));
run.elements.dashButton.listeners.pointerdown(run('({preventDefault(){},stopPropagation(){}})'));
assert.ok(run('state.dashTimer>0'));assert.equal(run('state.pointerId'),42);
run('practiceMenu(true);globalThis.pausedX=state.player.x;practiceStep(1)');
assert.equal(run('state.player.x'),run('pausedX'));run('practiceMenu(false)');
// 木樁走向主角；武器連續攻擊不重設主角或動作冷卻。
run('practiceId="water-ball";practiceReset();globalThis.dummyStart=state.enemies[1].x;practiceStep(.05)');
assert.ok(run('state.enemies[1].x<dummyStart'));
console.log('PASS: eight practice loops, timeline, live data, immune movement, pointer and dash together, hit/dodge/streak, dash protection, round aiming, pause, walking dummies');

// 真實碰撞輸入→免傷命中事件；非只呼叫計分函式。
run('practiceId="pudding";practiceReset();state.player.x=practiceEnemy.x-30;state.player.y=practiceEnemy.y;practiceEnemy.phaseAttack.left=0;practiceStep(.01)');
assert.equal(run('practiceWasHit'),true);assert.equal(run('state.player.health'),data.tuning.playerHealth);
run('practiceReset();state.enemyShots.push({x:state.player.x,y:state.player.y,vx:0,vy:0,r:10,damage:5,life:1});practiceStep(.01)');
assert.equal(run('practiceWasHit'),true);
run('practiceReset();state.dashTimer=.01;state.enemyShots.push({x:state.player.x,y:state.player.y,vx:0,vy:0,r:100,damage:5,life:1});practiceStep(.05)');
assert.equal(run('practiceWasHit'),false);
run('practiceId="pop-candy";practiceReset();state.player.x=practiceEnemy.x;state.player.y=practiceEnemy.y;practiceEnemy.action.warning=.001;practiceStep(.01)');
assert.equal(run('practiceWasHit'),true);
run('practiceStats={dodged:0,hit:0,streak:0};for(let i=0;i<10;i++){practiceStartRound();practiceScore();}');assert.equal(run('practiceStats.streak'),10);
console.log('PASS: real melee/projectile/blast practice hit, zero health loss, dash final-frame immunity, ten-dodge challenge');

// 標準測試僅檢查版面測試腳本語法；真實瀏覽器操作交 Grok 執行 --layout。
new (require('node:vm').Script)(fs.readFileSync(`${__dirname}/levelup-layout.cjs`,'utf8'));

// 「試這隻」也能練一般國字射擊，實際一輪飛完才結算，不在飛行中重播。
run('practiceId="jaben";practiceReset()');
for(let i=0;i<300;i++)run('practiceStep(.05)');
assert.ok(run('practiceStats.hit+practiceStats.dodged>0'));
assert.equal(run('state.player.health'),data.tuning.playerHealth);
console.log('PASS: custom enemy trial uses real basic shot cycle and scoring');
