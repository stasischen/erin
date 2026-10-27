// 真引擎來源分離：撞牆不能冒充架勢崩潰；組合事件各有自己的有效窗口。
const assert=require('node:assert/strict'),run=require('./maker-support.cjs')();
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
function fresh(mode='all',conditions=['wall-stun','posture-break']){
 run(`GAME_DATA.hitJuice.enabled=false;GAME_DATA.gallery.bosses[0].weakpoint=SurvivorData.defaults().gallery.bosses[0].weakpoint;resetGame();startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0;state.bossPhasePause=0;
 state.player.damageDisabled=true;state.bossRest=999;globalThis.b=state.boss;
 globalThis.cfg=state.trial.definition.weakpoint;cfg.parts=[{...cfg.parts[1],mode:'${mode}',conditions:${JSON.stringify(conditions.map(type=>({type})))}}];`);
}
// 使用實際 charge/圓牆更新，不 stub wallStun、Posture.step 或弱點輸入。
function wall(){run(`b.posture={value:0,stun:0};b.x=state.trial.arena.x+state.trial.arena.radius-b.r-1;b.y=state.trial.arena.y;
 state.bossMoves=[{id:'charge',kind:'charge',ai:{phase:'active',left:1},angle:0,origin:{x:b.x,y:b.y},target:{x:b.x+70,y:b.y}}];updateTrial(.05);`);}
// 用近滿架勢的真實身體輸入，讓引擎真正產生 posture-broken 事件。
function postureBreak(){run("b.posture={value:GAME_DATA.boss.posture.maximum-1,stun:0};teacherPostureEvent('onPerfectDodge')");}
function check(values,phase){run('updateBossWeakpoints(.15)');assert.deepEqual(json('b.weakpoints.core.matches'),values);assert.equal(run('b.weakpoints.core.phase'),phase);}
// 審查員原始重現：只撞牆，架勢0、shared stun2；AND 不開、只選破架勢也不開。
fresh();wall();check([true,false],'closed');assert.equal(run('b.posture.value'),0);assert.equal(run('b.posture.stun'),2);
fresh('all',['posture-break']);wall();check([false],'closed');assert.equal(run("b.weakpointSignals['posture-break']"),undefined);
fresh();postureBreak();check([false,true],'closed');assert.equal(run("b.weakpointSignals['wall-stun']"),undefined);
// OR：各自獨立可以開；普通stun或單純填shared stun都不是破架勢來源。
for(const event of [wall,postureBreak]){fresh('any');event();run('updateBossWeakpoints(.15)');assert.equal(run('b.weakpoints.core.phase'),'open');}
for(const ordinary of ['stunTarget(b,2)', 'b.posture={value:0,stun:2}']){
 fresh('any');run('state.bossMoves=[];'+ordinary);check([false,false],'closed');
}
fresh('any',['posture-break']);run("b.posture={value:99,stun:0};state.bossMoves=[{id:'shield',angle:0,ai:{phase:'windup',left:1}}];stunTarget(b,2)");check([true],'open'); // 打斷真的填滿架勢時，仍有真正broken來源。
// 不同事件的同幀／先後有效窗口：用真事件產生器，不直接塞 signals。
// 每次建立該事件當下可移動／近滿架勢的合法輸入，保留前一事件的獨立來源記錄。
for(const events of [[wall,postureBreak],[postureBreak,wall]])for(const delay of [0,.3]){
 fresh();events[0]();run(`updateBossWeakpoints(${delay})`);events[1]();check([true,true],'open');
 assert.ok(run("b.weakpointSignals['wall-stun']>0&&b.weakpointSignals['posture-break']>0"));
 // 原事件先到期後才產生另一事件，AND 不能因 shared stun 或舊信號誤開。
 fresh();events[0]();run('updateBossWeakpoints(3);updateBossWeakpoints(0)');events[1]();
 run('updateBossWeakpoints(.15)');assert.equal(run('b.weakpoints.core.phase'),'closed');
}
// 真正同時滿足後，來源各自到期；來源過期不再觸發，但既有窗口照自己的closing關閉。
fresh();wall();postureBreak();check([true,true],'open');
run('updateBossWeakpoints(1.5);updateBossWeakpoints(.25)');assert.equal(run('b.weakpoints.core.phase'),'closing');
run('updateBossWeakpoints(.25);updateBossWeakpoints(.6);updateBossWeakpoints(0)');
assert.equal(run('b.weakpoints.core.phase'),'closed');assert.deepEqual(json('b.weakpoints.core.matches'),[false,false]);
// 重複送同種架勢輸入不會在暈眩期間產生第二次broken或續滿來源。
fresh('any',['posture-break']);postureBreak();run("updateBossWeakpoints(.3);globalThis.left=b.weakpointSignals['posture-break'];teacherPostureEvent('onPerfectDodge')");
assert.equal(run("b.weakpointSignals['posture-break']"),run('left'));
// hitstop與暫停凍結窗口及來源；明確清除／轉階段／入口不留下原因。
run("globalThis.snapshot=JSON.stringify([b.weakpoints,b.weakpointSignals]);b.feedbackFrozen=true;updateBossWeakpoints(1)");assert.equal(run('JSON.stringify([b.weakpoints,b.weakpointSignals])'),run('snapshot'));
run("delete b.feedbackFrozen;state.mode='paused';tick(1)");assert.equal(run('JSON.stringify([b.weakpoints,b.weakpointSignals])'),run('snapshot'));
for(const reset of ['clearBossWeakpoints(b)','state.bossPhasePause=1;updateBossWeakpoints(0);state.bossPhasePause=0','state.bossIntro=1;updateBossWeakpoints(0);state.bossIntro=0']){
 fresh('any');postureBreak();wall();run('updateBossWeakpoints(.15);'+reset+';updateBossWeakpoints(0)');
 assert.equal(run('b.weakpointSignals'),undefined);assert.equal(run('b.weakpoints.core.phase'),'closed');
}
fresh('any');postureBreak();wall();run('updateBossWeakpoints(.15);globalThis.savedConfig=state.trial.definition.weakpoint;state.trial.definition.weakpoint=null;updateBossWeakpoints(.1)');assert.equal(run('b.weakpointSignals'),undefined);
run('state.trial.definition.weakpoint=savedConfig;updateBossWeakpoints(0)');assert.equal(run('b.weakpoints.core.phase'),'closed');
// 新場景、重開同一隻、換成主遊戲老師，皆不採用舊身體的原因。
for(const reset of ["startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0",'resetGame();state.mode="playing";summonTeacher();state.bossIntro=0']){
 fresh('any');postureBreak();wall();run('globalThis.old=b;'+reset+';globalThis.b=state.boss;updateBossWeakpoints(0)');
 assert.equal(run('b===old'),false);assert.equal(run('b.weakpointSignals'),undefined);
 assert.ok(Object.values(json('b.weakpoints')).every(p=>p.phase==='closed'));
}
console.log('PASS: actual charge wall vs actual posture-broken source, AND/OR in both orders/same frame, expiry/closing/dedup, ordinary stun exclusion, freeze/clear/phase/intro/new-scene isolation');
