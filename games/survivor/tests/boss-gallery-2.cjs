const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')();
const json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('globalThis.g=SurvivorGalleryRules;globalThis.t=SurvivorTrialRules');
// 階段門檻、夥伴倒下與選招：固定輸入可以搬到 Godot 測試。
assert.equal(run('g.stage(50,100,.5,false)'),1);
assert.equal(run('g.stage(49,100,.5,false)'),2);
assert.equal(run('g.stage(100,100,.5,true)'),2);
assert.deepEqual(json('g.transition(100,100,.5,true,1).events'),[{type:'phase-changed',phase:2,enraged:true}]);
assert.deepEqual(json('g.transition(100,100,.5,true,2).events'),[]);
for(const id of ['frostfire','winged']){
 run(`globalThis.def=GAME_DATA.gallery.bosses.find(b=>b.id==='${id}')`);
 for(const phase of [1,2])for(const role of id==='frostfire'?['frost','fire']:[null]){
  const found=new Set();
  for(let sample=0;sample<1;sample+=.01){
   const selected=run(`g.choose(def,${JSON.stringify(role)},${phase},[],${sample})`);found.add(selected);
   assert.equal(run(`def.moves.find(m=>m.id==='${selected}').minPhase<=${phase}`),true);
   assert.notEqual(run(`g.choose(def,${JSON.stringify(role)},${phase},['${selected}'],${sample})`),selected);
  }
  const allowed=json(`g.roster(def,${JSON.stringify(role)}).moves.filter(m=>m.minPhase<=${phase}).map(m=>m.id)`);
  assert.deepEqual([...found].sort(),allowed.sort());
 }
 run('globalThis.zero=JSON.parse(JSON.stringify(def));zero.moves.forEach(m=>m.weight=0)');
 assert.equal(run('g.choose(zero,null,2,[],.5)'),null);
}
// 空隙可穿過，旋轉十字兩軸命中，外圍不命中。
run("globalThis.ring=g.geometry('nova',{type:'ring',radius:180,angle:80},.5,0)");
assert.equal(run('g.contains(ring,{x:0,y:0},{x:90,y:0,r:8})'),false);
assert.equal(run('g.contains(ring,{x:0,y:0},{x:-90,y:0,r:8})'),true);
assert.equal(run('g.contains(ring,{x:0,y:0},{x:0,y:0,r:8})'),false);
run("globalThis.cross=g.geometry('cross',{type:'cross',radius:180},1,0)");
assert.equal(run('g.contains(cross,{x:0,y:0},{x:0,y:100,r:5})'),true);
assert.equal(run('g.contains(cross,{x:0,y:0},{x:70,y:70,r:5})'),false);
assert.equal(run('g.contains(cross,{x:0,y:0},{x:500,y:0,r:5})'),false);
run('globalThis.volley=g.volley({x:1,y:2},0,19,Math.PI*2,160,Math.PI/3)');
assert.equal(run('volley.every(s=>s.x===1&&s.y===2&&Math.abs(Math.atan2(s.vy,s.vx))>=Math.PI/6)'),true);
assert.equal(run('g.volley({x:1,y:2},0,7,Math.PI/2,200).length'),7);
// 預警未完不移動也不傷害；追蹤固定速度，壽命有限，不改輸入。
run("globalThis.field={kind:'tornado',x:0,y:0,radius:20,life:2,warning:.5,pulse:0,damage:12,speed:60,owner:'winged'}");
assert.equal(run('g.field(field,{x:0,y:0,r:5},.2).events.length'),0);
assert.equal(run('g.field(field,{x:100,y:0,r:5},.2).state.x'),0);
assert.equal(run('g.field({...field,warning:0},{x:100,y:0,r:5},.2).state.x'),12);
assert.equal(run('field.life'),2);
assert.equal(run('g.field({...field,warning:0},{x:0,y:0,r:5},.1).events[0].damage'),12);
assert.equal(run('g.field({...field,warning:0},{x:0,y:0,r:5},3).state.life'),0);
// 作品遷移／新資料保存，兩個新王 Maker 數值可編輯、驗證。
run('globalThis.work=SurvivorData.defaults()');
assert.equal(run('SurvivorData.validate(work).valid'),true);
assert.deepEqual(json('SurvivorData.validate(work).data.gallery'),json('work.gallery'));
run('work.gallery.bosses=work.gallery.bosses.slice(0,1)');
assert.equal(run('SurvivorData.validate(work).data.gallery.bosses.length'),run('SURVIVOR_DEFAULTS.gallery.bosses.length'));
assert.deepEqual(json('SurvivorData.validate(work).data.gallery.bosses.map(b=>b.id)'),json('SURVIVOR_DEFAULTS.gallery.bosses.map(b=>b.id)'));
run('work=SurvivorData.defaults();work.gallery.bosses[1].moves[0].weight=0;work.gallery.bosses[2].moves[0].blocks.moves[0].timing.windup=2');
assert.equal(run('SurvivorData.validate(work).data.gallery.bosses[1].moves[0].weight'),0);
assert.equal(run('SurvivorData.validate(work).data.gallery.bosses[2].moves[0].blocks.moves[0].timing.windup'),2);
// 真實接合：兩個可打到的身體，獨立血量／架勢，擊倒一隻後另一隻強化。
run("startTrial('frostfire');state.player.damageDisabled=true");
assert.equal(run('trialBodies().length'),2);
assert.equal(run('trialBodies().every(b=>!canAttackTarget(b))'),true);
run('state.trial.entry=0;state.bossIntro=0;globalThis.a=state.trial.actors[0];globalThis.b=state.trial.actors[1];a.x=state.player.x-40;a.y=state.player.y;b.x=state.player.x+40;b.y=state.player.y;updateCamera()');
assert.equal(run('combatTargets().filter(t=>t.trialActor).length'),2);
run('hitBuildTarget(b,100)');
assert.equal(run('a.hp===a.maxHp'),true);assert.equal(run('b.hp<b.maxHp'),true);
run("a.posture.value=0;b.posture.value=0;teacherPerfectDodge({owner:'fire',dodged:false})");
assert.equal(run('a.posture.value'),0);assert.equal(run('b.posture.value>0'),true);
run("b.posture.value=GAME_DATA.boss.posture.maximum-1;teacherPerfectDodge({owner:'fire',dodged:false})");
assert.equal(run('b.posture.stun>0'),true);assert.equal(run('b.moves.length'),0);
run('b.posture.stun=0;hitBuildTarget(b,99999)');
assert.equal(run('state.mode'),'playing');assert.equal(run('trialBodies().length'),1);
run('updateTrial(.05)');assert.equal(run('a.phase'),2);
run('hitBuildTarget(a,99999)');assert.equal(run('state.mode'),'trial-menu');
// 每招經過完整共用狀態機；落點鎖住，不出現一般波次。
for(const boss of ['frostfire','winged']){
 run(`startTrial('${boss}');state.trial.entry=0;state.bossIntro=0;state.player.damageDisabled=true`);
 const ids=json('state.trial.definition.moves.map(m=>m.id)');
 for(const id of ids){
  run(`startTrial('${boss}');state.trial.entry=0;state.bossIntro=0;state.player.damageDisabled=true;
   globalThis.actor=state.trial.actors[0];actor.hp=actor.maxHp*.4;actor.phase=2;state.bossPhase=2;
   actor.x=state.trial.arena.x;actor.y=state.trial.arena.y;state.player.x=actor.x+160;state.player.y=actor.y;updateCamera();
   globalThis.s=state.trial.definition.moves.find(m=>m.id==='${id}').blocks.moves[0];
   actor.moves=[{id:'${id}',kind:'${id}',owner:actor.actorId,ai:SurvivorBossAI.start(s.timing),angle:0,origin:{x:actor.x,y:actor.y},target:{x:actor.x+100,y:actor.y},duration:s.timing.active,elapsed:0,pulse:0}];state.bossMoves=actor.moves;`);
  for(let i=0;i<240&&run('actor.moves.length');i++)run('withTrialBody(actor,()=>updateTrialActor(.05))');
  assert.equal(run('actor.moves.length'),0,id+' completes');
  run('render()');
 }
}
// 三種視野上以真實更新／渲染跑完整場景（獨立審查仍需實際操作）。
for(const boss of ['frostfire','winged'])for(const [width,height] of [[740,360],[1024,461],[1180,820]]){
 run(`startTrial('${boss}');state.player.damageDisabled=true;globalThis.view=worldViewport(${width},${height});state.width=view.width;state.height=view.height;Math.random=()=>.5;for(let i=0;i<500;i++){tick(.05);if(i%25===0)render();}`);
 assert.equal(run('state.enemies.length'),0);assert.equal(run('state.miniboss'),null);
 assert.equal(run('trialBodies().every(b=>Math.hypot(b.x-state.trial.arena.x,b.y-state.trial.arena.y)<=state.trial.arena.radius-b.r+.01)'),true);
}
console.log('PASS: frostfire / winged rules, gaps / beams / volley / homing / migration, independent actors / posture / death / enrage, all move lifecycles and three viewports');
// 不同傷害入口都必須命中第二隻王；不能提前結算整場。
run(`startTrial('frostfire');state.trial.entry=0;state.bossIntro=0;state.player.damageDisabled=true;
 globalThis.a=state.trial.actors[0];globalThis.b=state.trial.actors[1];
 a.x=state.player.x-110;a.y=state.player.y;b.x=state.player.x+110;b.y=state.player.y;updateCamera();
 state.projectiles.push({x:b.x,y:b.y,vx:0,vy:0,r:8,rangeLeft:100,damage:20,alive:true,hitList:[],schools:[],pierce:0});tick(.01)`);
assert.equal(run('a.hp===a.maxHp'),true);assert.equal(run('b.hp<b.maxHp'),true);
run('globalThis.beforeA=a.hp;globalThis.beforeB=b.hp;state.bomb={x:state.player.x,y:state.player.y,radius:200,damage:10,knockback:0,schools:[],timer:0};updateBomb(.01)');
assert.equal(run('a.hp<beforeA&&b.hp<beforeB'),true);
// 半血換招會打斷當前攻擊，只發出一次 phase-changed 事件。
run(`startTrial('winged');state.trial.entry=0;state.bossIntro=0;state.player.damageDisabled=true;
 globalThis.actor=state.trial.actors[0];actor.hp=actor.maxHp*.49;updateTrial(.05)`);
assert.equal(run('state.trial.events.filter(e=>e.type==="phase-changed").length'),1);
run('updateTrial(.05)');assert.equal(run('state.trial.events.filter(e=>e.type==="phase-changed").length'),0);
// 落點預警中絕不傷害，落地只依鎖定落點判定，無追蹤瞬移。
for(const id of ['dive','icefall','meteor']){
 const boss=id==='dive'?'winged':'frostfire';
 run(`startTrial('${boss}');state.trial.entry=0;state.bossIntro=0;globalThis.actor=state.trial.actors[0];
  actor.hp=actor.maxHp*.4;actor.phase=2;actor.x=state.player.x-100;actor.y=state.player.y;
  globalThis.s=state.trial.definition.moves.find(m=>m.id==='${id}').blocks.moves[0];
  actor.moves=[{id:'${id}',owner:actor.actorId,kind:'${id}',ai:{phase:'windup',left:.1},angle:0,origin:{x:actor.x,y:actor.y},target:{x:state.player.x,y:state.player.y},duration:s.timing.active,elapsed:0,pulse:0}];state.bossMoves=actor.moves;globalThis.hp=state.player.health;
  withTrialBody(actor,()=>updateTrialActor(.05))`);
 assert.equal(run('state.player.health'),run('hp'));
 run('actor.moves[0].ai={phase:"active",left:.1};actor.moves[0].elapsed=actor.moves[0].duration-.1');
 assert.equal(run('teacherDodgeThreat().id'),id);
 run('for(let i=0;i<40&&state.mode==="playing"&&actor.moves.length;i++)withTrialBody(actor,()=>updateTrialActor(.05))');
 assert.equal(run('state.player.health<hp'),true,id+' impact hits');
}
// 主王暈眩不會阻止辨認副王的完美閃避；獎勵只加在正確的王身上。
run(`startTrial('frostfire');state.trial.entry=0;state.bossIntro=0;globalThis.a=state.trial.actors[0];globalThis.b=state.trial.actors[1];
 a.posture.stun=2;b.x=state.player.x-50;b.y=state.player.y;
 b.moves=[{id:'cross',owner:'fire',ai:{phase:'windup',left:.1},angle:0,duration:1.4}];
 globalThis.threat=teacherDodgeThreat();teacherPerfectDodge(threat)`);
assert.equal(run('threat.owner'),'fire');assert.equal(run('b.posture.value>0'),true);
run('state.trial.fields=[{kind:"feather",owner:"fire",x:0,y:0}];b.posture.value=GAME_DATA.boss.posture.maximum-1;teacherPerfectDodge({owner:"fire"})');
assert.equal(run('b.moves.length'),0);assert.equal(run('state.trial.fields.length'),0);
console.log('PASS: both projectile / bomb targets, phase interrupt once, warned locked impacts, secondary perfect dodge during primary stun and owned-field cleanup');
// AI 距離由作品提供：最近／最遠界線、全停用與舊作品遷移。
run("globalThis.def=SurvivorData.defaults().gallery.bosses[2];def.moves.forEach(m=>{m.ai.minDistance=80;m.ai.maxDistance=200})");
assert.equal(run('g.choose(def,null,1,[],.5,79)'),null);
assert.ok(run('g.choose(def,null,1,[],.5,80)'));
assert.ok(run('g.choose(def,null,1,[],.5,200)'));
assert.equal(run('g.choose(def,null,1,[],.5,201)'),null);
run('work=SurvivorData.defaults();work.gallery.bosses.forEach(b=>b.moves.forEach(m=>delete m.ai))');
assert.equal(run('SurvivorData.validate(work).valid'),true);
assert.deepEqual(json('SurvivorData.validate(work).data.gallery.bosses[2].moves[0].ai'),json('GAME_DATA.gallery.bosses[2].moves[0].ai'));
run('work=SurvivorData.defaults();work.gallery.bosses[2].moves[0].ai.minDistance=90;work.gallery.bosses[2].moves[0].ai.maxDistance=190');
assert.equal(run('SurvivorData.validate(work).data.gallery.bosses[2].moves[0].ai.minDistance'),90);
assert.equal(run('SurvivorData.validate(work).data.gallery.bosses[2].moves[0].ai.maxDistance'),190);
run('work.gallery.bosses[2].moves[0].ai.minDistance=191');
assert.equal(run('SurvivorData.validate(work).valid'),false);
// 模擬下一卡的小場地：直徑 400／600，不改正式場地或 Maker 半徑下限。
for(const radius of [200,300])for(const boss of ['frostfire','winged'])for(const [w,h] of [[740,360],[1024,461],[1180,820]]){
 run(`globalThis.savedRadius=GAME_DATA.gallery.arenaRadius;GAME_DATA.gallery.arenaRadius=${radius};startTrial('${boss}');GAME_DATA.gallery.arenaRadius=savedRadius;
  globalThis.view=worldViewport(${w},${h});state.width=view.width;state.height=view.height;state.player.damageDisabled=true;updateCamera()`);
 assert.equal(run('trialBodies().every(b=>Math.hypot(b.x-state.trial.arena.x,b.y-state.trial.arena.y)<=state.trial.arena.radius-b.r+.01)'),true,'entry inside small arena');
 run('for(let i=0;i<650;i++){tick(.05);if(i%25===0)render()}');
 assert.equal(run('trialBodies().every(b=>Math.hypot(b.x-state.trial.arena.x,b.y-state.trial.arena.y)<=state.trial.arena.radius-b.r+.01)'),true);
 assert.equal(run('state.enemies.length'),0);
 // 每一招在小場地也能結束，目標與預警中心留在牆內。
 for(const id of json('state.trial.definition.moves.map(m=>m.id)')){
  run(`globalThis.actor=state.trial.actors[0];actor.hp=actor.maxHp*.4;actor.phase=2;actor.posture.stun=0;
   actor.x=state.trial.arena.x-80;actor.y=state.trial.arena.y;state.player.x=state.trial.arena.x+80;state.player.y=actor.y;
   globalThis.s=state.trial.definition.moves.find(m=>m.id==='${id}').blocks.moves[0];
   actor.moves=[{id:'${id}',kind:'${id}',owner:actor.actorId,ai:SurvivorBossAI.start(s.timing),angle:0,origin:{x:actor.x,y:actor.y},target:t.boundary({...state.player,r:actor.r},state.trial.arena).position,duration:s.timing.active,elapsed:0,pulse:0}];
   state.boss=actor;state.bossMoves=actor.moves;state.bossPhase=2;updateCamera();render();
   for(let i=0;i<240&&actor.moves.length;i++){withTrialBody(actor,()=>updateTrialActor(.05));if(i%10===0)render()}`);
  assert.equal(run('actor.moves.length'),0,id+' completes in small arena');
  assert.equal(run('Math.hypot(actor.x-state.trial.arena.x,actor.y-state.trial.arena.y)<=state.trial.arena.radius-actor.r+.01'),true);
 }
}
// 休息與狀態機冷卻期間追近；超出 AI 距離帶時等待而不出招。
for(const cooldown of [false,true]){
 run(`startTrial('winged');state.trial.entry=0;state.bossIntro=0;globalThis.actor=state.trial.actors[0];actor.x=state.player.x-300;actor.y=state.player.y;
  actor.rest=2;state.bossRest=2;
  actor.moves=${cooldown?"[{id:'feathers',ai:{phase:'cooldown',left:2},angle:0,duration:.3}]":"[]"};state.bossMoves=actor.moves;
  globalThis.beforeDistance=Math.hypot(actor.x-state.player.x,actor.y-state.player.y);withTrialBody(actor,()=>updateTrialActor(.05))`);
 assert.equal(run('Math.hypot(actor.x-state.player.x,actor.y-state.player.y)<beforeDistance'),true);
}
run(`actor.moves=[];state.bossMoves=actor.moves;actor.rest=0;state.bossRest=0;
 state.trial.definition=JSON.parse(JSON.stringify(state.trial.definition));state.trial.definition.moves.forEach(m=>m.ai.maxDistance=20);
 withTrialBody(actor,()=>updateTrialActor(.05))`);
assert.equal(run('actor.moves.length'),0);
console.log('PASS: data-driven trial AI distance bounds / migration, 400–600 diameter arenas at three viewports, every move completes, idle / cooldown pursuit');
