const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')();
const json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('globalThis.t=SurvivorTrialRules;globalThis.def=GAME_DATA.gallery.bosses[0]');
// 固定輸入 → 距離帶內選招；遠處不得選盾擊／斧擊／旋風。
for(const phase of [1,2])for(let i=0;i<100;i++){
 const id=run(`t.choose(def,${phase},300,[],${i/100})`);
 assert.ok(['charge','leap'].includes(id));
}
assert.equal(run('def.moves.find(m=>m.id==="charge").minPhase'),1);
assert.equal(run('t.choose(def,1,700,[],.5)'),null);
run('globalThis.custom=JSON.parse(JSON.stringify(def));custom.moves.forEach(m=>m.ai.maxDistance=20)');
assert.equal(run('t.choose(custom,1,100,[],.5)'),null);
// 追近規則不修改輸入，短步不越過停靠距離。
assert.deepEqual(json('t.pursue({x:0,y:0,r:34},{x:200,y:0,r:18},85,.5)'),{x:42.5,y:0});
assert.deepEqual(json('t.pursue({x:0,y:0,r:34},{x:65,y:0,r:18},85,1)'),{x:1,y:0});
assert.deepEqual(json('t.pursue({x:0,y:0,r:34},{x:0,y:0,r:18},85,1)'),{x:0,y:0});
// 舊作品縮場地並更新舊首階段設定；新作品不重設自訂值。
run('globalThis.work=SurvivorData.defaults();work.gallery.schemaVersion=1;work.gallery.arenaRadius=620;work.gallery.bosses[0].moves.forEach(m=>{delete m.ai;if(m.id==="charge")m.minPhase=2});globalThis.checked=SurvivorData.validate(work)');
assert.equal(run('checked.valid'),true);
assert.equal(run('checked.data.gallery.arenaRadius'),200);
assert.equal(run('checked.data.gallery.schemaVersion'),2);
assert.equal(run('checked.data.gallery.bosses[0].moves.find(m=>m.id==="charge").minPhase'),1);
run('work=SurvivorData.defaults();work.gallery.arenaRadius=301');assert.equal(run('SurvivorData.validate(work).valid'),false);
run('work.gallery.arenaRadius=199');assert.equal(run('SurvivorData.validate(work).valid'),false);
run('work.gallery.arenaRadius=300;work.gallery.bosses[0].moves.find(m=>m.id==="charge").minPhase=2');
assert.equal(run('SurvivorData.validate(work).data.gallery.bosses[0].moves.find(m=>m.id==="charge").minPhase'),2);
// 入口的整個預警圓在三尺寸可見，含 Maker 半徑上下限與雙子。
for(const radius of [200,300])for(const id of ['gatekeeper','frostfire','winged'])for(const [w,h] of [[740,360],[1024,461],[1180,820]]){
 run(`globalThis.saved=GAME_DATA.gallery.arenaRadius;GAME_DATA.gallery.arenaRadius=${radius};startTrial('${id}');GAME_DATA.gallery.arenaRadius=saved;
 Object.assign(state,worldViewport(${w},${h}));updateCamera()`);
 assert.equal(run('trialBodies().every(b=>b.x-b.r-30>=state.cameraX&&b.x+b.r+30<=state.cameraX+state.width&&b.y-b.r-30>=state.cameraY&&b.y+b.r+30<=state.cameraY+state.height)'),true,id+' visible warning');
}
// 真實接合：休息／冷卻追近，暈眩與預警期間不偷走位。
for(const mode of ['rest','cooldown','windup','stun']){
 run(`startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0;state.player.damageDisabled=true;
 state.boss.x=state.player.x-150;state.boss.y=state.player.y;state.bossRest=2;
 state.bossMoves=${['cooldown','windup'].includes(mode)?`[{id:'shield',ai:{phase:'${mode}',left:2},angle:0}]`:'[]'};
 state.boss.posture.stun=${mode==='stun'?2:0};globalThis.beforeX=state.boss.x;updateTrial(.05)`);
 assert.equal(run('state.boss.x>beforeX'),['rest','cooldown'].includes(mode),mode);
}
// 固定亂數、玩家不主動靠近、滿血第一階段，20 秒內有位移與完整衝鋒預警。
run(`startTrial('gatekeeper');state.player.damageDisabled=true;Math.random=()=>.99;
 globalThis.startX=state.boss.x;globalThis.moved=false;globalThis.warned=false;globalThis.charged=false;
 for(let i=0;i<400;i++){
  updateTrial(.05);moved=moved||state.boss.x!==startX;
  const m=state.bossMoves[0];if(m&&m.id==='charge'){warned=warned||m.ai.phase==='windup';if(m.ai.phase==='active'){if(!warned)throw Error('missing charge warning');charged=true;}}
 }`);
assert.equal(run('moved'),true);assert.equal(run('charged'),true);assert.equal(run('state.bossPhase'),1);
assert.equal(run('levelLabel.hidden&&statusEl.hidden'),true);
// 取消不清除戰鬥資料；確認後才離開。開始畫面入口可直接進入。
run(`resetGame();state.mode='paused';state.elapsed=42;state.player.health=77;globalThis.oldPlayer=state.player;requestTrialMenu()`);
assert.equal(run('state.mode'),'trial-confirm');assert.equal(run('state.player===oldPlayer'),true);
run('confirmTrialMenu(false)');assert.equal(run('state.mode'),'paused');assert.equal(run('state.elapsed'),42);assert.equal(run('state.player.health'),77);
run('requestTrialMenu();confirmTrialMenu(true)');assert.equal(run('state.mode'),'trial-menu');
run('closeTrialMenu();updateHud()');assert.equal(run('levelLabel.hidden||statusEl.hidden'),false);
run('requestTrialMenu()');assert.equal(run('state.mode'),'trial-menu');
console.log('PASS: trial distance bands / pursuit / migration / visible entry, full-health 20s charge, HUD and leave confirmation');
