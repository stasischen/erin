const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')();
const json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('globalThis.rules=SurvivorTrialRules');
assert.deepEqual(json('rules.boundary({x:120,y:0,r:10},{x:0,y:0,radius:100})'),{hit:true,position:{x:90,y:0}});
assert.equal(run('rules.boundary({x:0,y:0,r:10},{x:0,y:0,radius:100}).hit'),false);
assert.equal(run('rules.phase({maxHp:100,threshold:.5},50)'),1);
assert.equal(run('rules.phase({maxHp:100,threshold:.5},49)'),2);
assert.equal(run('rules.contains({type:"sector",radius:100,angle:90},{x:0,y:0},0,{x:-50,y:0,r:5})'),false);
assert.equal(run('rules.contains({type:"sector",radius:100,angle:90},{x:0,y:0},0,{x:50,y:0,r:5})'),true);
assert.equal(run('rules.contains({type:"line",radius:10,length:200},{x:0,y:0},0,{x:100,y:20,r:5})'),false);
assert.deepEqual(json('rules.wallStun(true,2)'),[{type:'wall-stun',seconds:2,weakness:true}]);
assert.deepEqual(json('rules.wallStun(false,2)'),[]);
assert.equal(run('rules.summon({x:10,y:20},5,7,8,12).length'),1);
assert.deepEqual(json('rules.summon({x:10,y:20},1,0,8,12)[0]'),{type:'summon',x:10,y:20,r:12,emergeSeconds:.6,index:0});
for(const kind of ['poison','ice','fire']) {
 run(`globalThis.field={kind:'${kind}',x:0,y:0,radius:50,life:2,pulse:.1,interval:.5,damage:8,slow:.4}`);
 assert.equal(run('rules.hazard(field,{x:0,y:0,r:5},.1).events[0].damage'),8);
 assert.equal(run('rules.hazard(field,{x:0,y:0,r:5},.1).slow'),.4);
 assert.equal(run('rules.hazard(field,{x:100,y:0,r:5},.1).slow'),1);
 assert.equal(run('rules.hazard({...field,life:0},{x:0,y:0,r:5},.1).events.length'),0);
 assert.equal(run('field.life'),2); // 純函式不改輸入。
}
// 固定面積鏡頭到邊緣會停止外移，三種視野仍能看見貼牆的玩家。
for(const [w,h] of [[740,360],[1024,461],[1180,820]]) {
 run(`globalThis.view=worldViewport(${w},${h});globalThis.arena={x:0,y:0,radius:620}`);
 for(const [x,y] of [[602,0],[-602,0],[0,602],[0,-602],[420,420]]) {
  run(`globalThis.player={x:${x},y:${y},r:18};globalThis.camera=rules.camera(player,arena,view.width,view.height)`);
  assert.equal(run('player.x>=camera.x&&player.x<=camera.x+view.width&&player.y>=camera.y&&player.y<=camera.y+view.height'),true);
 }
}
run('globalThis.def=GAME_DATA.gallery.bosses[0]');
for(let phase=1;phase<=2;phase++)for(let sample=0;sample<1;sample+=.05) {
 const id=run(`rules.choose(def,${phase},100,[],${sample})`);
 assert.equal(run(`def.moves.find(m=>m.id==='${id}').minPhase<=${phase}`),true);
 assert.notEqual(run(`rules.choose(def,${phase},100,['${id}'],${sample})`),id);
}
run('globalThis.work=SurvivorData.defaults();globalThis.result=SurvivorData.validate(work)');
assert.equal(run('result.valid'),true);
assert.deepEqual(json('result.data.gallery'),json('work.gallery'));
run('delete work.gallery');assert.equal(run('SurvivorData.validate(work).valid'),true);
run('work=SurvivorData.defaults();work.gallery.arenaRadius=0');assert.equal(run('SurvivorData.validate(work).valid'),false);
run('work=SurvivorData.defaults();work.gallery.bosses[0].moves[0].blocks.moves[0].effect.damage=NaN');assert.equal(run('SurvivorData.validate(work).valid'),false);
// 真實接合：無普通波次／事件；入口完整預警、圓牆阻擋，半血換招。
run("startTrial('gatekeeper');Math.random=()=>.1");
assert.equal(run('state.trial.entry'),2);
run('tick(.05)');assert.equal(run('state.bossIntro>0'),true);assert.equal(run('state.enemies.length'),0);
run('for(let i=0;i<45;i++)tick(.05)');assert.equal(run('state.bossIntro'),0);
run('state.player.x=state.trial.arena.x+10000;clampToMap(state.player)');
assert.equal(run('Math.round(state.player.x-state.trial.arena.x)'),run('state.trial.arena.radius-state.player.r'));
run('state.boss.hp=state.boss.maxHp*.49;updateTrial(.05)');assert.equal(run('state.bossPhase'),2);
// 撞牆曝露弱點，衝鋒被取消，不在恢復後繼續傷害。
run(`state.boss.x=state.trial.arena.x+state.trial.arena.radius-state.boss.r-1;state.boss.y=state.trial.arena.y;
 state.bossMoves=[{id:'charge',kind:'charge',ai:{phase:'active',left:1},angle:0,origin:{x:0,y:0},target:{x:0,y:0}}];updateTrial(.05)`);
assert.equal(run('state.boss.posture.stun'),2);assert.equal(run('state.bossMoves.length'),0);
assert.equal(run('teacherBonuses().damage>1'),true);
// 所有五招跨完預警、出手、收招、冷卻，橫掃兩次；遠離玩家不造成無形傷害。
for(const id of ['shield','axe','leap','spin','charge']) {
 run(`startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0;state.bossPhase=2;
 state.player.damageDisabled=true;state.boss.x=state.trial.arena.x;state.boss.y=state.trial.arena.y;
 globalThis.move=state.trial.definition.moves.find(d=>d.id==='${id}');
 state.bossMoves=[{id:'${id}',kind:'${id}',ai:SurvivorBossAI.start(move.blocks.moves[0].timing),angle:0,origin:{x:state.boss.x,y:state.boss.y},target:{x:state.boss.x+50,y:state.boss.y},repeat:0}];`);
 for(let i=0;i<240&&run('state.bossMoves.length');i++)run('updateTrial(.05)');
 assert.equal(run('state.bossMoves.length'),0,id+' completes');
}
run("startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0;state.boss.x=state.player.x-70;state.boss.y=state.player.y;state.bossMoves=[{id:'shield',kind:'shield',ai:{phase:'windup',left:.1},angle:0}]");
assert.equal(run('teacherDodgeThreat().id'),'shield');
run('teacherPerfectDodge(teacherDodgeThreat())');assert.equal(run('state.boss.posture.value>0'),true);
run("state.boss.posture.value=GAME_DATA.boss.posture.maximum-1;teacherPerfectDodge({dodged:false})");
assert.equal(run('state.boss.posture.stun>0'),true);

assert.equal(run('rules.rayLength({x:0,y:0},0,{x:0,y:0,radius:100})'),100);
run("startTrial('gatekeeper');state.player.damageDisabled=true;state.stageElapsed=500;state.elapsed=500;tick(.05)");
assert.equal(run('state.enemies.length'),0);assert.equal(run('state.miniboss'),null);
// 玩家彈與敵彈到牆上即消失，不能環繞或在牆上繼續命中。
run(`globalThis.shot={x:state.trial.arena.x+state.trial.arena.radius+20,y:state.trial.arena.y,r:8,alive:true,rangeLeft:100,vx:20};clampToMap(shot)`);
assert.equal(run('shot.alive'),false);assert.equal(run('shot.life'),0);
// 召喚位置就是王的身體，有冒出時間及數量上限；地面危險區使用同一規則接合。
run('globalThis.minions=summonTrialMinions(30)');assert.equal(run('minions.length'),8);
assert.equal(run('minions.every(e=>e.x===state.boss.x&&e.y===state.boss.y&&e.emergeTimer===.6)'),true);
run('createTrialHazard({x:state.player.x,y:state.player.y});state.trial.entry=0;state.bossIntro=0;updateTrial(.05)');
assert.equal(run('state.trial.slow'),.6);
run('render()'); // 預警與 PNG 載入前的清單佔位都能繪製。
run('finishRun(true)');assert.equal(run('state.mode'),'trial-menu');assert.equal(run('state.trial'),null);
run('closeTrialMenu()');assert.equal(run('state.mode'),'ready');
run('resetGame()');assert.equal(run('state.trial'),null);

console.log('PASS: trial arena, hazard / phase / wall / summon rules, gatekeeper selection and combat phases, perfect dodge and posture, schema migration');
