const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')(),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run(`globalThis.captured=[];globalThis.originalPaint=SurvivorArt.paint;
SurvivorArt.paint=function(id,options,fallback){if(id.startsWith('move/'))captured.push({id,...options});return originalPaint(id,options,fallback);};`);
// Real render state: the locked impact differs from the caster in BOTH axes.
for(const phase of ['windup','active'])for(const [boss,id,role] of [['frostfire','icefall','frost'],['frostfire','meteor','fire'],['winged','dive',null]]) {
 run(`startTrial('${boss}');state.trial.entry=0;state.trial.actors.forEach(b=>b.moves=[]);
 globalThis.actor=state.trial.actors.find(b=>b.role===${JSON.stringify(role)});
 actor.x=315;actor.y=305;
 globalThis.definition=state.trial.definition.moves.find(m=>m.id==='${id}').blocks.moves[0];
 actor.moves=[{id:'${id}',angle:.3,ai:{phase:'${phase}',left:definition.timing['${phase}']/2},duration:definition.timing.active,elapsed:definition.timing.active/2,target:{x:500,y:480}}];
 captured.length=0;drawCalls.length=0;drawTrialEncounter();`);
 const actual=json(`captured.find(c=>c.id==='move/${id}')`);
 assert.deepEqual(actual.origin,{x:500,y:480},`${id} ${phase}`);
 assert.equal(actual.x+actual.width/2,500);assert.equal(actual.y+actual.height/2,480);
 assert.equal(actual.radius,run('definition.shape.radius'));
 assert.equal(run('drawCalls.some(c=>c[0]==="translate"&&c[1]===500&&c[2]===480)'),true,'original warning uses the same impact');
}
for(const phase of ['windup','active']) {
 run(`startTrial('gatekeeper');state.trial.entry=0;state.boss.x=315;state.boss.y=305;
 globalThis.skinDefinition=state.trial.definition.moves.find(m=>m.id==='leap').blocks.moves[0];
 state.bossMoves=[{id:'leap',ai:{phase:'${phase}',left:skinDefinition.timing['${phase}']/2},angle:0,target:{x:500,y:480}}];
 captured.length=0;drawCalls.length=0;drawTrialMoves();`);
 const actual=json("captured.find(c=>c.id==='move/gatekeeper-leap')");
 assert.deepEqual(actual.origin,{x:500,y:480});assert.equal(actual.x+actual.width/2,500);assert.equal(actual.y+actual.height/2,480);
 assert.equal(run('drawCalls.some(c=>c[0]==="translate"&&c[1]===500&&c[2]===480)'),true);
}
// Caster-centred nova keeps its own origin and the gap geometry instead of following target.
run(`startTrial('frostfire');state.trial.entry=0;state.trial.actors.forEach(b=>b.moves=[]);globalThis.fire=state.trial.actors.find(b=>b.role==='fire');fire.x=315;fire.y=305;
globalThis.skinDefinition=state.trial.definition.moves.find(m=>m.id==='nova').blocks.moves[0];fire.moves=[{id:'nova',ai:{phase:'windup',left:.5},angle:.3,target:{x:500,y:480},duration:skinDefinition.timing.active}];captured.length=0;drawTrialEncounter();`);
assert.deepEqual(json("captured.find(c=>c.id==='move/nova').origin"),{x:315,y:305});
assert.ok(run("captured.find(c=>c.id==='move/nova').shape.gap>0"));
// Spiral skin regions are the exact warning rays, leaving its fan gap unpainted.
run(`startTrial('winged');state.trial.entry=0;globalThis.wing=state.trial.actors[0];const spiral=state.trial.definition.moves.find(m=>m.id==='spiral').blocks.moves[0];wing.moves=[{id:'spiral',ai:{phase:'windup',left:.5},angle:0,target:{x:500,y:480},duration:spiral.timing.active,elapsed:0}];captured.length=0;drawTrialEncounter();`);
const regions=json("captured.find(c=>c.id==='move/spiral').regions");
assert.ok(regions.length>1);assert.ok(regions.every(r=>r.shape.type==='line'&&Math.abs(r.angle)>.1));
// The same class of impact origin is covered in ordinary teacher moves too.
run(`resetGame();state.boss={x:315,y:305,r:32};globalThis.leap=BOSS_MOVES.find(d=>d.kind==='leap');beginBossMove(leap.id);
state.bossMoves[0].x=315;state.bossMoves[0].y=305;state.bossMoves[0].points=[{x:500,y:480,r:90}];
globalThis.skinDraw=SurvivorArt.draw;SurvivorArt.draw=(id,options)=>{captured.push({id,...options});return skinDraw(id,options);};captured.length=0;drawBossMoves();`);
assert.deepEqual(json('captured[0].origin'),{x:500,y:480});
const line=json('SurvivorArt.shapeOptions({type:"line",radius:5,length:50},{x:10,y:20},Math.PI/2)');
assert.deepEqual(line.origin,{x:10,y:20});assert.ok(Math.abs(line.target.x-10)<1e-10);assert.equal(line.target.y,70);assert.equal(line.radius,5);
console.log('PASS: impact skins share real icefall / meteor / dive / leap warning origins in both phases; caster nova gap and ordinary teacher impacts; shared line geometry');
