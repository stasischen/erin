// 固定資料、操作、dt -> 可序列化事件；正式 UI / Dot cloud 驗收另做。
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun(),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
run("globalThis.def=GAME_DATA.gallery.bosses.find(b=>b.id==='assassin');globalThis.blocks=SurvivorTrialBlocks;globalThis.combo=def.moves[0].blocks.moves[0]");
assert.equal(run('SurvivorData.validate(SurvivorData.defaults()).valid'),true);
for(const phase of [1,2]){
 const count=phase===1?4:5;
 run(`globalThis.initial=blocks.start(combo.timing,combo.effect,${phase});globalThis.snapshot=JSON.stringify(initial);globalThis.large=blocks.advance(initial,combo.timing,20)`);
 assert.equal(run('JSON.stringify(initial)'),run('snapshot'));
 assert.deepEqual(json("large.events.filter(e=>e.type==='strike').map(e=>e.index)"),Array.from({length:count},(_,i)=>i));
 assert.equal(run('large.state.phase'),'select');
 run('globalThis.small=initial;globalThis.events=[];for(let i=0;i<2000;i++){const r=blocks.advance(small,combo.timing,.01);small=r.state;events.push(...r.events)}');
 assert.deepEqual(json('events'),json('large.events'));assert.deepEqual(json('small'),json('large.state'));
}
assert.equal(run('SurvivorGalleryRules.stage(50,100,.5)'),1);assert.equal(run('SurvivorGalleryRules.stage(49.99,100,.5)'),2);
// 半血影步加權提高，仍遵守距離與不連續重複同招。
run("globalThis.frequency=[];for(const phase of [1,2]){let n=0;for(let i=0;i<1000;i++)if(SurvivorGalleryRules.choose(def,null,phase,[],i/1000,100)==='shadowstep')n++;frequency.push(n)}");
assert.ok(run('frequency[1]>frequency[0]'));assert.notEqual(run("SurvivorGalleryRules.choose(def,null,2,['shadowstep'],.5,100)"),'shadowstep');
for(const [x,y,want]of [[1,0,{x:-72,y:0}],[-1,0,{x:72,y:0}],[0,1,{x:0,y:-72}],[0,-1,{x:0,y:72}]])assert.deepEqual(json(`blocks.behind({x:0,y:0},{x:${x},y:${y}},72,28,{x:0,y:0,radius:200})`),want);
assert.equal(run('Math.hypot(...Object.values(blocks.behind({x:182,y:0},{x:-1,y:0},72,28,{x:0,y:0,radius:200})))<=172+.001'),true);
assert.deepEqual(json('blocks.slide({x:0,y:0,r:28},Math.PI/2,130,.5,{x:0,y:0,radius:200})'),{x:Math.cos(Math.PI/2)*65,y:65});
function fresh(id='blade-combo',phase=1){
 run(`startTrial('assassin');state.trial.entry=0;state.bossIntro=0;state.player.damageDisabled=false;state.player.invincible=0;
  globalThis.b=state.boss;b.x=state.trial.arena.x-70;b.y=state.trial.arena.y;state.player.x=b.x+70;state.player.y=b.y;
  state.bossPhase=${phase};b.phase=${phase};b.hp=b.maxHp*${phase===2?.49:1};b.rest=999;state.bossRest=999;
  globalThis.s=state.trial.definition.moves.find(m=>m.id==='${id}').blocks.moves[0];
  globalThis.m={id:'${id}',kind:'${id}',owner:b.actorId,ai:blocks.start(s.timing,s.effect,${phase}),angle:0,dodged:false,teleported:false,slideSide:1};
  b.moves=[m];state.bossMoves=b.moves;b.vanished=!!s.effect.relocate;state.faceX=1;state.faceY=0;updateCamera();`);
}
// 每刀有自己的預警及信用；半血中途不增減本組四刀，完成後才切下一階段。
fresh();run('state.player.damageDisabled=true;b.hp=b.maxHp*.49;globalThis.hits=[];for(let i=0;i<450&&b.moves.length;i++){updateTrial(.01);hits.push(...state.trial.events.filter(e=>e.type===\'strike\').map(e=>e.index))}');
assert.deepEqual(json('hits'),[0,1,2,3]);assert.equal(run('state.bossPhase'),2);
fresh();run('m.ai.left=.15;globalThis.threat=teacherDodgeThreat();teacherPerfectDodge(threat);globalThis.gain=b.posture.value;teacherPerfectDodge(threat)');
assert.equal(run('b.posture.value'),run('gain'));assert.equal(run('m.dodged'),true);
run('state.player.invincible=1;updateTrial(.15);updateTrial(.1)');assert.equal(run('m.ai.index'),1);assert.equal(run('m.dodged'),false);
run('m.ai.left=.15;state.player.invincible=0;globalThis.next=teacherDodgeThreat();teacherPerfectDodge(next)');assert.ok(run('b.posture.value>gain'));
// 真的破架勢打斷連段，紅弱點先預告才打開；額外蓄力只套一次 3×1.5，不疊老師3倍。
fresh();run("b.posture.value=99;teacherPerfectDodge(m);for(let i=0;i<40;i++)tick(.01)");
assert.equal(run('b.moves.length'),0);assert.ok(run('b.posture.stun>0'));assert.equal(run('b.weakpoints.core.phase'),'open');
assert.equal(run("SurvivorArt.lookup(bossWeakpointConfig(b).artId).palette[0]"),'#ff4568');
for(const [charged,want]of [[false,30],[true,45]]){
 run(`globalThis.hp=b.hp;hitBuildTarget(b,10,{charged:${charged}})`);close(run('hp-b.hp'),want);
}
run("delete b.weakpointSignals['posture-break'];globalThis.hp=b.hp;hitBuildTarget(b,10,{charged:true})");close(run('hp-b.hp'),30);
fresh();run('b.stunTimer=2;updateBossWeakpoints(.2)');assert.equal(run('b.weakpoints.core.phase'),'closed');
run('globalThis.hp=b.hp;hitBuildTarget(b,10,{charged:true})');close(run('hp-b.hp'),2);
// 紅弱點錨點和 trial actor 的實際 sprite bounds 相同，不借用老師的52x68外框。
run("globalThis.point=bossWeakpointPoints(b,bossWeakpointConfig(b)).weakpoint");close(run('point.x'),run('b.x'));close(run('point.y'),run('b.y-4*b.r/32'));
// 影步在主角背後鎖定，消失時不可命中；整段白閃預警後才扣血，牆邊不出界。
fresh('shadowstep');run('globalThis.hp=state.player.health;updateTrial(.3)');assert.equal(run('canAttackTarget(b)'),false);assert.equal(run('m.teleported'),false);assert.equal(run('state.player.health'),run('hp'));
run('updateTrial(.05)');assert.equal(run('m.teleported'),true);close(run('b.x'),run('state.player.x-72'));assert.equal(run('b.vanished'),false);
run('updateTrial(.5)');close(run('m.ai.left'),.25);assert.equal(run('state.player.health'),run('hp'));run('render()');
run('updateTrial(.24)');assert.equal(run('state.player.health'),run('hp'));run('updateTrial(.01)');assert.ok(run('state.player.health<hp'));
fresh('shadowstep');run('state.player.x=state.trial.arena.x+182;state.faceX=-1;updateTrial(.35)');assert.ok(run('Math.hypot(b.x-state.trial.arena.x,b.y-state.trial.arena.y)<=state.trial.arena.radius-b.r+.001'));
run('stunTarget(b,1)');assert.equal(run('b.vanished'),undefined);assert.equal(run('b.moves.length'),0);
// 苦無只在風扇預警後生成、由 Boss 冒出，側滑橫向且牆內；危險區可完美閃避。
fresh('kunai-slide');run('updateTrial(.89)');assert.equal(run('state.trial.fields.length'),0);
run('updateTrial(.01)');assert.equal(run('state.trial.fields.length'),5);assert.equal(run('state.trial.fields.every(f=>f.x===b.x&&f.y===b.y&&f.kind===\'kunai\')'),true);
run('globalThis.old={x:b.x,y:b.y};updateTrial(.2)');close(run('b.x'),run('old.x'));assert.ok(run('b.y>old.y'));
run("state.player.x=b.x+50;state.player.y=b.y;state.player.invincible=0;state.trial.fields=[{kind:'kunai',projectile:true,owner:b.actorId,x:state.player.x+40,y:state.player.y,vx:-200,vy:0,radius:6,life:1,pulse:0,damage:10}]");assert.equal(run('teacherDodgeThreat().kind'),'kunai');
// 資料遷移保留舊三王自訂，補新王；所有新積木 roundtrip，非法／不安全時機拒絕。
run('globalThis.work=SurvivorData.defaults();work.gallery.bosses=work.gallery.bosses.filter(b=>["gatekeeper","frostfire","winged"].includes(b.id));work.gallery.bosses[0].hp=1900;globalThis.checked=SurvivorData.validate(work)');assert.equal(run('checked.valid'),true);assert.equal(run('checked.data.gallery.bosses.length'),run('SURVIVOR_DEFAULTS.gallery.bosses.length'));assert.equal(run('checked.data.gallery.bosses[0].hp'),1900);
run("work=SurvivorData.defaults();globalThis.custom=work.gallery.bosses.find(b=>b.id==='assassin');custom.moves[0].blocks.moves[0].effect.sequence.phaseCount=7;custom.moves[1].blocks.moves[0].effect.relocate.distance=90;custom.moves[2].blocks.moves[0].effect.slide.speed=140;custom.weakpoint.postureChargeMultiplier=1.8;checked=SurvivorData.validate(work)");
assert.equal(run('checked.valid'),true);assert.deepEqual(json('checked.data.gallery'),json('work.gallery'));
for(const edit of ["custom.moves[0].blocks.moves[0].effect.sequence.count=9","custom.moves[0].blocks.moves[0].effect.sequence.phaseCount=1","custom.moves[1].blocks.moves[0].effect.relocate.flash=.19","custom.moves[1].blocks.moves[0].effect.relocate.vanish=1","custom.moves[2].blocks.moves[0].effect.projectiles.count=1.5","custom.weakpoint.postureChargeMultiplier=3"]){run("work=SurvivorData.defaults();custom=work.gallery.bosses.find(b=>b.id==='assassin');"+edit);assert.equal(run('SurvivorData.validate(work).valid'),false,edit);}
// 每隻成功且更快才改紀錄；無效、失敗、不更快都保留，讀寫中斷不阻止遊玩。
assert.deepEqual(json("blocks.record({assassin:20},'assassin',10,true)"),{assassin:10});
for(const time of [0,-1,NaN,Infinity,20,30])assert.deepEqual(json(`blocks.record({assassin:20},'assassin',${time},true)`),{assassin:20});
assert.deepEqual(json("blocks.record({assassin:20},'assassin',10,false)"),{assassin:20});
for(const id of ['gatekeeper','frostfire','winged','assassin']){run(`startTrial('${id}');state.trial.elapsed=21.25;finishRun(true)`);assert.equal(run(`loadTrialRecords().${id}`),21.25);}
run("startTrial('assassin');state.trial.elapsed=25;finishRun(true);startTrial('assassin');state.trial.elapsed=10;finishRun(false)");assert.equal(run('loadTrialRecords().assassin'),21.25);
run("startTrial('assassin');state.trial.elapsed=19.5;finishRun(true)");assert.equal(run('loadTrialRecords().assassin'),19.5);
const reloaded=createRun({saved:run.storage});assert.equal(reloaded('loadTrialRecords().assassin'),19.5);assert.equal(reloaded('loadTrialRecords().winged'),21.25);
run("trialMenu('自訂',SurvivorData.defaults());startTrial('assassin');state.trial.elapsed=3;finishRun(true)");assert.equal(run('loadTrialRecords(true).assassin'),3);assert.equal(run('loadTrialRecords().assassin'),19.5);
const maker=createRun({saved:run.storage,maker:true});maker("startTrial('assassin');state.trial.elapsed=2;finishRun(true)");assert.equal(maker('loadTrialRecords(true).assassin'),2);assert.equal(maker('loadTrialRecords().assassin'),19.5);
const bad=createRun({saved:{'erin-survivor-trial-best-seconds-v1':'{"assassin":-4,"winged":"1"}'},storageFails:true});assert.equal(bad('Object.keys(loadTrialRecords()).length'),0);bad("startTrial('assassin');state.trial.elapsed=4;finishRun(true)");assert.equal(bad('loadTrialRecords().assassin'),4);
// 計時只取playing的活動dt，入口／暫停不計；慢動作不能讓最佳時間變短。
fresh();run('state.trial.entry=1;state.bossIntro=1;tick(.2)');assert.equal(run('state.trial.elapsed'),0);
run("state.trial.entry=0;state.bossIntro=0;state.mode='paused';tick(.5)");assert.equal(run('state.trial.elapsed'),0);
run("state.mode='playing';state.slowMotion=1;tick(.1)");close(run('state.trial.elapsed'),.1);
// 三尺寸場景持續運作，沒有一般波次；獨立 Dot 實際試玩不能由此取代。
for(const [w,h]of [[740,360],[1024,461],[1180,820]]){
 fresh('kunai-slide');run(`Object.assign(state,worldViewport(${w},${h}));state.player.damageDisabled=true;for(let i=0;i<160;i++){tick(.02);if(i%10===0)render()}`);
 assert.equal(run('state.enemies.length'),0);assert.equal(run('trialBodies().every(b=>Math.hypot(b.x-state.trial.arena.x,b.y-state.trial.arena.y)<=state.trial.arena.radius-b.r+.001)'),true);
}
console.log('PASS: common sequence large/small dt / 4-5 beats / phase snapshot / dodge credit; warned shadow / wall clamp / kunai slide; red weakpoint / explicit 4.5x charged; schema migration / roundtrip / rejection; per-Boss wins / faster-only / reload / Maker isolation / pause clock / three views');
// 真 tick / activateDash：沿用預設兩格、1.2秒回格、慢動作與hitstop，不調玩家數值。
// 預設滿條100在第四次完美閃避就破架勢、取消第五刀（獎勵，不是漏刀）。
// 另只把測試的Boss滿條提高到200，讓五刀完整走完，獨立證明全部五次資源足夠。
for(const maximum of [100,200]){
 const r=createRun();
 r(`startTrial('assassin');state.trial.entry=0;state.bossIntro=0;state.player.invincible=0;
  state.boss.hp=state.boss.maxHp*.49;state.boss.phase=2;state.bossPhase=2;state.boss.rest=0;state.bossRest=0;
  GAME_DATA.boss.posture.maximum=${maximum};Math.random=()=>0;
  globalThis.first=null;globalThis.credits=[];globalThis.resource=[];
  for(let i=0;i<2000;i++){
   const m=state.bossMoves[0];if(!first&&m)first=m;if(first&&!state.bossMoves.includes(first))break;
   if(m&&teacherDodgeThreat()===m){
    const d=Math.hypot(state.boss.x-state.player.x,state.boss.y-state.player.y);
    state.faceX=(state.boss.x-state.player.x)/d;state.faceY=(state.boss.y-state.player.y)/d;
    const before=state.dashCharges;activateDash();if(state.dashCharges<before)credits.push(m.ai.index);
   }
   resource.push(state.dashCharges);tick(.01);
  }`);
 assert.deepEqual(JSON.parse(r('JSON.stringify(credits)')),maximum===100?[0,1,2,3]:[0,1,2,3,4]);
 assert.equal(r('state.player.health'),r('maxPlayerHealth()'));assert.equal(r('maxDashCharges()'),2);assert.equal(r('gameSettings.dashCooldown'),1.2);
 assert.ok(r('Math.min(...resource)>=0'));assert.equal(r('state.boss.posture.stun>0'),maximum===100);
}
// 暫停不改連段；hitstop只凍結受擊者，不吞刀。已出手的瞬間斬不能再當新閃避威脅。
fresh();run("globalThis.before=JSON.stringify(m.ai);state.mode='paused';tick(.5)");assert.equal(run('JSON.stringify(m.ai)'),run('before'));
run("state.mode='playing';b.feedbackFrozen=true;updateTrial(.5)");assert.equal(run('JSON.stringify(m.ai)'),run('before'));
run("delete b.feedbackFrozen;m.ai.phase='active';m.ai.left=.05");assert.equal(run('teacherDodgeThreat()'),null);
console.log('PASS: default 2-charge / 1.2s real dash budget for all five beats, default fourth-dodge posture break, pause / hitstop / spent-strike threat boundary');
// 扇形寬度（度）與鎖定朝向（弧度）分離：側邊命中與預警一致，非零朝向不縮成細線。
for(const heading of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const offset of [Math.PI/6,Math.PI*2/3]){
 fresh();run(`m.angle=${heading};state.player.x=b.x+Math.cos(${heading+offset})*80;state.player.y=b.y+Math.sin(${heading+offset})*80;m.ai.left=.15;globalThis.hp=state.player.health`);
 assert.equal(run('teacherDodgeThreat()===m'),offset===Math.PI/6);
 run('updateTrial(.15)');assert.equal(run('state.player.health<hp'),offset===Math.PI/6);
}
fresh();run('drawCalls.length=0;drawTrialEncounter()');assert.equal(run('drawCalls.some(c=>c[0]===\'arc\'&&c[3]===130&&Math.abs((c[5]-c[4])-100*Math.PI/180)<1e-6)'),true);
// 未出生的苦無依飛行接觸時間，不能把射出時間誤當遠處命中時間。
fresh('kunai-slide');run('state.player.x=b.x+140;state.player.y=b.y;m.ai.left=.1');assert.equal(run('teacherDodgeThreat()'),null);
run('state.player.x=b.x+30');assert.equal(run('teacherDodgeThreat()===m'),true);
// 慢幀跨過出手後才側滑；彈體由出手當下位置產生，不先滑完才射。
fresh('kunai-slide');run('globalThis.origin={x:b.x,y:b.y};updateTrial(1)');assert.equal(run('state.trial.fields.every(f=>f.x===origin.x&&f.y===origin.y)'),true);assert.ok(run('b.y>origin.y'));
console.log('PASS: sector headings / off-axis hits / matching fan telegraph, projectile contact timing, ordered fire-then-slide timeline');

// 平台真實活動時間獨立於模擬MAX_DT；慢裝置不會得到較短的最佳時間。
fresh();run('tick(.01,.8)');close(run('state.trial.elapsed'),.8);
run("state.mode='paused';tick(.01,5)");close(run('state.trial.elapsed'),.8);
console.log('PASS: explicit active wall-clock input survives simulation dt clamp; pause excluded');
