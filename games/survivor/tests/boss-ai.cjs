const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')();
const json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run(`globalThis.ai=SurvivorBossAI; globalThis.moves=[{id:'a',minPhase:1},{id:'b',minPhase:2}];
 globalThis.rules=['a','b'].map(moveId=>({moveId,weight:1,minDistance:10,maxDistance:100,angleWeight:0,phaseWeight:0,offscreen:false}));
 globalThis.input={phase:2,distance:50,visible:true,angle:0,previous:[]};`);
assert.deepEqual(json('ai.scores(moves,rules,input)'),[{id:'a',score:1},{id:'b',score:1}]);
assert.equal(run('ai.choose(ai.scores(moves,rules,input),0)'), 'a');
assert.equal(run('ai.choose(ai.scores(moves,rules,input),.999)'), 'b');
for(const change of ['previous:["a","b"]','distance:9','distance:101','visible:false'])
 assert.equal(run(`ai.scores(moves,rules,{...input,${change}}).length`),0);
assert.equal(run('ai.scores(moves,rules,{...input,phase:1}).length'),1);
run('rules[1].angleWeight=2;rules[1].phaseWeight=3');
assert.equal(run('ai.scores(moves,rules,input)[1].score'),12);
assert.equal(run('ai.scores(moves,rules,{...input,angle:Math.PI})[1].score'),4);
assert.equal(run('ai.choose([],0)'),null);
run(`globalThis.timing={windup:.9,active:.3,recovery:.7,cooldown:1.2};globalThis.s=ai.start(timing)`);
for(const phase of ['active','recovery','cooldown','select']) {
 assert.equal(run(`globalThis.result=ai.advance(s,timing,99);s=result.state;s.phase`),phase);
 assert.equal(run('result.events.length'),1);
}
assert.equal(run('ai.phase([{threshold:1},{threshold:.66},{threshold:.33}],.33)'),3);
// 舊積木缺新增秒數及 AI 資料，仍能遷移；自訂可 roundtrip，拒絕壞資料。
run(`globalThis.legacy=SurvivorData.defaults();delete legacy.boss.ai;
 for(const m of legacy.boss.moves) {delete m.recovery;delete m.cooldown;if(m.blocks){delete m.blocks.moves[0].timing.recovery;delete m.blocks.moves[0].timing.cooldown;}}
 globalThis.checked=SurvivorData.validate(legacy);`);
assert.equal(run('checked.valid'),true);
run('globalThis.work=checked.data;work.boss.ai.rules[0].weight=7');
assert.equal(run('SurvivorData.validate(work).data.boss.ai.rules[0].weight'),7);
assert.equal(run('SurvivorData.validate(work).valid'),true);
run('work.boss.ai.rules[0].minDistance=10001');
assert.equal(run('SurvivorData.validate(work).valid'),false);
// 真實老師：自訂收招、冷卻，完整預警後才出招；收招不重複發射。
run(`resetGame();state.mode='playing';state.bossIntro=0;state.bossRest=0;
 state.boss={x:state.player.x-150,y:state.player.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};
 globalThis.def=BOSS_MOVES.find(m=>m.id==='words');def.recovery=.7;def.cooldown=3;
 beginBossMove('words');globalThis.m=state.bossMoves[0];`);
assert.equal(run('m.ai.phase'),'windup');
run('for(let i=0;i<18;i++)updateBoss(.05)');assert.equal(run('m.ai.phase'),'active');
run('for(let i=0;i<6;i++)updateBoss(.05)');assert.equal(run('m.recovery'),.7);
run('globalThis.shots=state.enemyShots.length;for(let i=0;i<14;i++)updateBoss(.05)');
assert.equal(run('state.enemyShots.length'),run('shots'));
assert.equal(run('state.bossMoves.length'),0);
assert.equal(run('state.bossRest'),3);
run('updateBoss(.05)');assert.equal(run('state.boss.ai.phase'),'cooldown');
assert.ok(Math.abs(run('state.bossRest')-2.95)<1e-8);
console.log('PASS: weighted distance/angle/phase selection, strict nonrepeat, serializable timed transitions, legacy migration, validation, teacher warning/recovery/cooldown integration');
