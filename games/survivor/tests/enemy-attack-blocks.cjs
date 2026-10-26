// 固定舊作品與積木作品，通過真實敵人／老師接合層比對時間、位置、傷害與事件。
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun(),json=(r,code)=>JSON.parse(r(`JSON.stringify(${code})`));
run(`globalThis.old=SurvivorData.defaults();old.enemies[2].phaseAttack.damage=17;
old.enemies[2].phaseAttack.windup=1.2;old.enemies[0].attack.count=3;old.boss.moves[0].count=4;
globalThis.before=JSON.stringify(old);globalThis.result=SurvivorData.validate(old);`);
assert.equal(run('result.valid'),true);assert.equal(run('before===JSON.stringify(old)'),true);
assert.equal(run('result.data.enemies.every(e=>e.blocks.version===1&&e.blocks.moves.length===2)'),true);
assert.equal(run('result.data.boss.moves.every(m=>m.blocks.moves.length===1)'),true);
run('globalThis.round=SurvivorData.validate(JSON.parse(JSON.stringify(result.data)))');
assert.equal(run('round.valid'),true);assert.deepEqual(json(run,'round.data'),json(run,'result.data'));
const old=json(run,'old'),modern=json(run,'result.data');
function setup(data){const r=createRun();r(`ENEMY_TYPES.splice(0,ENEMY_TYPES.length,...${JSON.stringify(data.enemies)});BOSS_MOVES.splice(0,BOSS_MOVES.length,...${JSON.stringify(data.boss.moves)});
globalThis.seed=42;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;`);return r;}
function snapshot(r){return json(r,`({health:state.player.health,shots:state.enemyShots.map(s=>[s.x,s.y,s.vx,s.vy,s.damage,s.life]),
phase:state.enemies.map(e=>e.phaseAttack?[e.phaseAttack.phase,e.phaseAttack.left,e.phaseAttack.hit]:null),
enemies:state.enemies.map(e=>[e.typeId,e.x,e.y,e.hp]),hazards:state.enemyHazards.map(h=>[h.x,h.y,h.warning,h.damage]),
boss:state.boss?[state.boss.x,state.boss.y]:null,moves:state.bossMoves.map(m=>[m.id,m.kind,m.x,m.y,m.warning,m.active,m.life,m.points])})`);}
for(const e of old.enemies) for(const phased of [false,true]) {
 const runs=[old,modern].map(setup);
 for(const r of runs)r(`ENEMY_TYPES.find(e=>e.id==='${e.id}').phaseAttack.enabled=${phased};globalThis.e=spawnEnemy({typeId:'${e.id}'});e.x=state.player.x+70;e.y=state.player.y;e.speed=0;e.actionCooldown=1;e.shotCooldown=0;state.level=20;`);
 for(let i=0;i<90;i++){
  for(const r of runs)r('updateEnemyBehavior(e,.05);updateBookShooting(.05);updateMakerEffects(.05)');
  assert.deepEqual(snapshot(runs[1]),snapshot(runs[0]),e.id+' phased='+phased+' tick='+i);
 }
}
for(const m of old.boss.moves) for(const phase of [1,2,3]) {
 const runs=[old,modern].map(setup);
 for(const r of runs)r(`state.boss={x:state.player.x-150,y:state.player.y,r:32,hp:${phase===1?2000:phase===2?1100:500},maxHp:2000,speed:0,wobble:0,flash:0};state.bossPhase=${phase};state.bossRest=999;beginBossMove('${m.id}')`);
 for(let i=0;i<90;i++){
  for(const r of runs)r('updateBoss(.05)');
  assert.deepEqual(snapshot(runs[1]),snapshot(runs[0]),m.id+' phase='+phase+' tick='+i);
 }
}
// 積木優先於相容欄位；儲存、真實 Maker 載入與攻擊傷害。
run(`globalThis.work=result.data;work.enemies[2].blocks.moves[0].effect.damage=23;
work.enemies[2].blocks.moves[0].timing.windup=1.5;
work.enemies[0].blocks.moves[1].shape.count=4;
work.boss.moves[0].blocks.moves[0].timing.warning=1.8;
work.boss.moves[0].blocks.moves[0].effect.damage=24;
globalThis.saved=SurvivorData.save(work)`);
assert.equal(run('saved.valid'),true);
const live=createRun({maker:true,saved:run.storage});
assert.equal(live('ENEMY_TYPES[2].phaseAttack.damage'),23);assert.equal(live('ENEMY_TYPES[0].attack.count'),4);
assert.equal(live('BOSS_MOVES[0].warning'),1.8);assert.equal(live('BOSS_MOVES[0].damage'),24);
live(`resetGame();state.mode='playing';globalThis.e=spawnEnemy({typeId:'pudding'});e.x=state.player.x+70;e.y=state.player.y;e.speed=0;updatePhasedAttack(e,0);updatePhasedAttack(e,1.49)`);
assert.equal(live('state.player.health'),90);live('updatePhasedAttack(e,.01)');assert.equal(live('state.player.health'),67);
for(const edit of ['e.blocks=null','e.blocks.version=2','e.blocks.moves.pop()',
 'e.blocks.moves[0].trigger.enabled=1','e.blocks.moves[0].shape.shape="script"','e.blocks.moves[0].shape.count=1.5',
 'e.blocks.moves[0].effect.damage=Infinity','e.blocks.moves[0].timing.windup=.1',
 'delete e.blocks.moves[0].shape.radius','e.blocks.moves[0].feedback.sound="eval"',
 'e.blocks.moves[0].shape.extra=1','e.blocks.moves[0].trigger.event="bossPhase"',
 'e.blocks.moves[0].shape.shape="ring";e.blocks.moves[0].shape.innerRadius=150',
 'm.blocks.moves[0].effect.damage=999','m.blocks.moves[0].shape.kind="eval"',
 'm.blocks.moves[0].timing.warning=0','m.blocks.moves[0].trigger.phaseCount=2','m.blocks.moves[0].extra={}'
]) assert.equal(run(`(()=>{const d=SurvivorData.copy(result.data),e=d.enemies[2],m=d.boss.moves[0];${edit};return SurvivorData.validate(d).valid})()`),false,edit);
console.log('PASS: enemy/teacher blocks purity/roundtrip; 8 monsters phased and legacy + 9 teacher moves in 3 phases, fixed 90-tick equivalence; canonical edits/save/load/live damage; whitelist/bounds rejection');
