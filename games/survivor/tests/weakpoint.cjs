// 固定輸入與世界單位；不靠畫面或真實時鐘判斷弱點。
const assert=require('node:assert/strict'),run=require('./maker-support.cjs')();
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
run(`globalThis.rules=SurvivorWeakpoints;globalThis.config=SurvivorData.defaults().boss.weakpoint;
 globalThis.context={body:{x:0,y:0,r:32},source:{x:-50,y:0},facing:0,moveId:'words',flags:{recovery:true,'after-move':true}};
 globalThis.before=JSON.stringify([config,context]);globalThis.first=rules.step(null,config,context,0);`);
assert.equal(run('first.state.core.phase'),'warning');
assert.deepEqual(json('first.events'),[{type:'weakpoint-warning',partId:'core'}]);
run('globalThis.opened=rules.step(first.state,config,context,.15)');assert.equal(run('opened.state.core.phase'),'open');
assert.equal(run('JSON.stringify([config,context])'),run('before'));
run('globalThis.closing=rules.step(opened.state,config,context,1.25)');assert.equal(run('closing.state.core.phase'),'closing');
run('globalThis.closed=rules.step(closing.state,config,context,.25)');assert.equal(run('closed.state.core.phase'),'closed');
assert.equal(run("rules.step(opened.state,config,{...context,flags:{'posture-break':true}},0).state.core.phase"),'warning'); // 新的條件事件重新預告，持續同一條件不續滿。
assert.equal(run('rules.step(closed.state,config,context,.1).state.core.phase'),'closed');
run('globalThis.reset=rules.step(closed.state,config,{...context,flags:{}},0)');assert.equal(run('rules.step(reset.state,config,context,0).state.core.phase'),'warning');
assert.equal(run('rules.step(opened.state,config,context,0).state.core.left'),run('opened.state.core.left'));
for(const [source,expected] of [[{x:-50,y:0},true],[{x:50,y:0},false],[{x:0,y:0},false]])assert.equal(run(`rules.inArc(${JSON.stringify(source)},context.body,0,180,120)`),expected);
// 七種觸發都有純資料條件，AND 與 OR 不混用；指定招式不接受別招。
for(const type of ['recovery','wall-stun','posture-break','environment','bait'])assert.equal(run(`rules.matches({type:'${type}'},{...context,flags:{'${type}':true}})`),true);
assert.equal(run("rules.matches({type:'behind'},context)"),true);
assert.equal(run("rules.matches({type:'after-move',moveId:'words'},context)"),true);
assert.equal(run("rules.matches({type:'after-move',moveId:'chalk'},context)"),false);
run("globalThis.andConfig=JSON.parse(JSON.stringify(config));andConfig.parts[0].mode='all';andConfig.parts[0].conditions=[{type:'recovery'},{type:'environment'}]");
assert.equal(run('rules.step(null,andConfig,context,0).state.core.phase'),'closed');
assert.equal(run("rules.step(null,andConfig,{...context,flags:{recovery:true,environment:true}},0).state.core.phase"),'warning');
run("andConfig.parts[0].mode='any'");assert.equal(run('rules.step(null,andConfig,context,0).state.core.phase'),'warning');
// 位置與角度要同時符合；未知／關閉部位只有護甲，不憑動畫猜中。
run('globalThis.points={weakpoint:{x:0,y:0}}');
assert.equal(run('rules.resolve(config,opened.state,context.body,context.source,0,points).multiplier'),3);
assert.equal(run('rules.resolve(config,closed.state,context.body,context.source,0,points).multiplier'),.2);
assert.equal(run('rules.resolve(config,opened.state,context.body,context.source,0,points,{x:100,y:0,r:1}).kind'),'armor');
assert.equal(run('rules.resolve(null,null,context.body,context.source,0,{}).multiplier'),1);
function fresh(trial=false){
 run(`GAME_DATA.boss.weakpoint=SurvivorData.defaults().boss.weakpoint;GAME_DATA.hitJuice.enabled=false;resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;state.player.damageDisabled=true;
 ${trial?"startTrial('gatekeeper');state.trial.entry=0;":"summonTeacher();"}state.bossIntro=0;state.bossPhasePause=0;state.bossRest=999;state.boss.x=state.player.x+70;state.boss.y=state.player.y;state.boss.speed=0;state.boss.facingAngle=0;updateCamera();`);
}
fresh();run('globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,100)');close(run('hp-state.boss.hp'),20);assert.equal(run('state.effects.filter(e=>e.kind===\'number\').at(-1).text'),'20');
// 命中以前已開啟的弱點才有3倍；打滿架勢的同一擊仍是命中前護甲。
fresh();run('state.boss.recoveryLeft=.5;state.boss.posture.value=99;globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,100,{charged:true})');
close(run('hp-state.boss.hp'),20);assert.equal(run('state.boss.posture.stun>0'),true);
run('updateBossWeakpoints(0)');assert.equal(run('state.boss.weakpoints.core.phase'),'warning');
run('updateBossWeakpoints(.15);globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,100,{charged:true})');close(run('hp-state.boss.hp'),300);
assert.equal(run('state.effects.filter(e=>e.kind===\'number\').at(-1).text'),'300');
// 收招與 cooldown/rest、普通暈眩不同；後兩者不自行打開核心。
for(const setup of ['state.boss.stunTimer=2','state.bossRest=2;state.boss.recoveryLeft=2',"state.bossMoves=[{id:'words',ai:{phase:'cooldown',left:2},recovery:0,angle:0}]"]){fresh();run(setup+';updateBossWeakpoints(.2)');assert.equal(run('state.boss.weakpoints.core.phase'),'closed');}
fresh();run("noteBossRecovery(state.boss,'words',.6);updateBossWeakpoints(.15)");assert.equal(run('state.boss.weakpoints.core.phase'),'open');
run("state.bossMoves=[{id:'chalk',ai:{phase:'windup',left:1},angle:0}];updateBossWeakpoints(0)");assert.equal(run('state.boss.weakpointMoveId'),'words'); // 新選的招不能冒充已收招。
// 暫停和角色 hitstop 都不偷跑弱點；signal 與窗口一起停。
run("state.mode='paused';globalThis.saved=JSON.stringify(state.boss.weakpoints);tick(2)");assert.equal(run('JSON.stringify(state.boss.weakpoints)'),run('saved'));
run('state.mode=\'playing\';state.boss.feedbackFrozen=true;updateBossWeakpoints(1)');assert.equal(run('JSON.stringify(state.boss.weakpoints)'),run('saved'));
// 背後窗口、正面護甲與撞牆核心；方向用事件來源，即使玩家在另一邊。
fresh(true);run('state.bossMoves=[{id:"shield",angle:0,ai:{phase:"windup",left:1}}];updateBossWeakpoints(.15)');
assert.equal(run('state.boss.weakpoints.back.phase'),'open');
run('globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,100,{source:{x:state.boss.x+60,y:state.boss.y}})');close(run('hp-state.boss.hp'),20);
run('globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,100,{source:{x:state.boss.x-60,y:state.boss.y}})');close(run('hp-state.boss.hp'),300);
run('triggerBossWeakpoint(state.boss,"wall-stun",2);updateBossWeakpoints(.15);globalThis.hp=state.boss.hp;hitBuildTarget(state.boss,100,{source:{x:state.boss.x+60,y:state.boss.y}})');close(run('hp-state.boss.hp'),300);
// 環境／誘餌共用事件入口，沒有私設場景機關。
for(const type of ['environment','bait']){
 fresh();run(`GAME_DATA.boss.weakpoint.parts[0].conditions=[{type:'${type}'}];triggerBossWeakpoint(state.boss,'${type}',1);updateBossWeakpoints(.15)`);assert.equal(run('state.boss.weakpoints.core.phase'),'open');
}
// 包裹接縫與零距離：前後不因世界座標變大而翻轉。
fresh();run("GAME_DATA.boss.weakpoint.parts[0].arcDegrees=120;GAME_DATA.boss.weakpoint.parts[0].angleDegrees=180;state.boss.x=5;state.player.x=state.worldWidth-30;state.boss.weakpoints={core:{phase:'open',left:1}};state.boss.facingAngle=0");
assert.equal(run('resolveBossWeakpoint(state.boss).kind'),'critical');assert.equal(run('resolveBossWeakpoint(state.boss,{source:state.boss}).kind'),'armor');
// 名稱錨點的 query 防寫回；pivot、displaySize、scale、鏡像與真 renderer bounds 一致。
fresh();run(`globalThis.art=SurvivorArtManifest.assets['character/teacher'];art.anchors.weakpoint=[.25,.4];art.pivot=[.3,.6];art.displaySize=[80,90];art.scale=1.5;
 art.directions=4;art.directionOrder=['S','E','N'];art.mirror={W:'E'};state.boss.facingAngle=Math.PI;
 globalThis.bounds=SurvivorArt.bounds('character/teacher',state.boss.x-26,state.boss.y-34,52,68,{displayScale:1,angle:Math.PI});globalThis.point=bossWeakpointPoints(state.boss,GAME_DATA.boss.weakpoint).weakpoint;`);
close(run('point.x'),run('bounds[0]+bounds[2]*.75'));close(run('point.y'),run('bounds[1]+bounds[3]*.4'));
run("SurvivorArt.lookup('character/teacher').anchors.weakpoint[0]=999");assert.equal(run('art.anchors.weakpoint[0]'),.25);assert.equal(run('state.boss.r'),32);
for(const anchors of ['1','[]','{weakpoint:[-1,.5]}','{weakpoint:[.5,Infinity]}'])assert.equal(run(`SurvivorArt.validate({...SurvivorArtManifest,assets:{...SurvivorArtManifest.assets,'character/teacher':{...art,anchors:${anchors}}}})`),false,anchors);
// 白名單、移除、舊作品補預設、round trip；非法值不進引擎。
run('globalThis.work=SurvivorData.defaults();delete work.boss.weakpoint;delete work.gallery.bosses[0].weakpoint');assert.equal(run('SurvivorData.validate(work).valid'),true);assert.equal(run('SurvivorData.validate(work).data.boss.weakpoint.armorMultiplier'),.2);
for(const edit of ["work.boss.weakpoint.armorMultiplier=NaN","work.boss.weakpoint.parts[0].duration=.1","work.boss.weakpoint.parts[0].anchor='missing'","work.boss.weakpoint.parts[0].conditions=[{type:'script'}]","work.boss.weakpoint.parts[0].conditions=[{type:'after-move',moveId:'missing'}]","work.boss.weakpoint.parts.push(work.boss.weakpoint.parts[0])","work.boss.weakpoint.extra='bad'"]){run('work=SurvivorData.defaults();'+edit);assert.equal(run('SurvivorData.validate(work).valid'),false,edit);}
run('work=SurvivorData.defaults();work.boss.weakpoint=null;globalThis.result=SurvivorData.validate(work)');assert.equal(run('result.valid'),true);assert.equal(run('result.data.boss.weakpoint'),null);
console.log('PASS: pure weakpoint conditions / AND OR / arcs / prewarning / closing / retrigger; shared armor and 3x without posture stacking; source geometry / seams / anchors; pause / hitstop / migration and rejection');
