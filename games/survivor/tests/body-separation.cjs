const assert=require('node:assert/strict');
const createRun=require('./maker-support.cjs');
const run=createRun();
run(`globalThis.cfg={enabled:true,radiusScale:1,playerForce:1,enemyForce:.25};
 globalThis.base={config:cfg,dt:1/60,world:{width:1000,height:1000},player:{x:500,y:500,r:18},bodies:[{x:510,y:500,r:20,mass:1}]};`);
// 固定輸入可重現、不改輸入、方向正確、整群推人有共同預算。
run('globalThis.before=JSON.stringify(base);globalThis.result=SurvivorBodies.solve(base)');
assert.equal(run('JSON.stringify(base)'),run('before'));
assert.equal(run('JSON.stringify(result)'),run('JSON.stringify(SurvivorBodies.solve(base))'));
assert.ok(run('result.player.x<500 && result.bodies[0].x>510'));
assert.ok(run('Math.hypot(result.player.x-500,result.player.y-500)<=.200001'));
assert.ok(run('result.bodies[0].x-510<=9.000001'));
run('globalThis.many={...base,bodies:Array.from({length:240},()=>({...base.bodies[0]}))};result=SurvivorBodies.solve(many)');
assert.ok(run('Math.hypot(result.player.x-500,result.player.y-500)<=.200001'));
assert.ok(run('result.checks<=240*32'));
assert.ok(run('result.bodies.every(b=>Math.hypot(b.x-510,b.y-500)<=9.000001)'));
// 孤立深重疊分數幀到剛好碰到；零距離不產生 NaN，穿越與關閉不推主角。
run('result=base;for(let i=0;i<60;i++)result=SurvivorBodies.solve({...base,player:result.player,bodies:result.bodies})');
assert.ok(run('Math.abs(Math.hypot(result.bodies[0].x-result.player.x,result.bodies[0].y-result.player.y)-38)<1e-6'));
assert.equal(run('SurvivorBodies.solve({...base,passThrough:true}).player.x'),500);
assert.equal(run('SurvivorBodies.solve({...base,config:{...cfg,enabled:false}}).bodies[0].x'),510);
assert.equal(run('SurvivorBodies.solve({...base,dt:0}).bodies[0].x'),510);
assert.equal(run('Number.isFinite(SurvivorBodies.solve({...base,bodies:[{x:500,y:500,r:20,mass:1}]}).bodies[0].x)'),true);
// 重型比普通怪承受更少位移，確實阻擋主角自己的移動；衝刺可穿過。
run('globalThis.block={...base,previous:{x:400,y:500},bodies:[{x:500,y:500,r:30,mass:8}],player:{x:520,y:500,r:18}}');
assert.ok(run('SurvivorBodies.solve(block).player.x<=452.000001'));
assert.equal(run('SurvivorBodies.solve({...block,passThrough:true}).player.x'),520);
assert.ok(run('SurvivorBodies.solve({...base,bodies:[{x:537.5,y:500,r:20,mass:8}]}).player.x<SurvivorBodies.solve({...base,bodies:[{x:537.5,y:500,r:20,mass:1}]}).player.x'));
// 環形接縫也會互推；畫面外怪不能靠分離直接進入畫面。
run('result=SurvivorBodies.solve({...base,player:{x:5,y:500,r:18},bodies:[{x:995,y:500,r:20,mass:1}]})');
assert.ok(run('result.bodies[0].x<995'));
run(`result=SurvivorBodies.solve({...base,view:{x:500,y:500,width:100,height:100},
 player:{x:500,y:800,r:18},bodies:[{x:571,y:500,r:20,mass:1},{x:580,y:500,r:30,mass:8}]})`);
assert.ok(run('result.bodies[0].x>=570'));
// 真實遊戲接合：衝刺最後一幀、額外保護、受傷無敵區分；重開清理。
run(`resetGame();state.mode='playing';GAME_DATA.hitJuice.enabled=false;state.spawnTimer=999;state.shotTimer=999;
 GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;
 globalThis.e=spawnEnemy({typeId:'jaben'});e.speed=0;
 globalThis.touch=()=>{e.x=state.player.x+10;e.y=state.player.y;};touch();
 globalThis.enemyX=e.x;state.dashTimer=.001;state.dashBodyPass=.04;tick(.02)`);
assert.equal(run('e.x'),run('enemyX'));
run('touch();tick(.01)');assert.ok(run('Math.abs(encounterDistance(e,state.player)-10)<1e-6'));
run('state.dashBodyPass=0;state.player.invincible=1;touch();tick(.02)');
assert.ok(run('encounterDistance(e,state.player)>10'));
run('resetGame()');assert.equal(run('state.dashBodyPass'),0);
// 分離只更新身體，預警資料不動；包圍／分裂仍沿用原生成規則。
run(`state.mode='playing';GAME_DATA.hitJuice.enabled=false;e=spawnEnemy({typeId:'pudding'});e.x=state.player.x+10;e.y=state.player.y;
 updatePhasedAttack(e,0);globalThis.warning=JSON.stringify(e.phaseAttack);separateEnemyBodies(.02,null,false)`);
assert.equal(run('JSON.stringify(e.phaseAttack)'),run('warning'));
// 舊 Maker 作品補預設，邊界驗證與存讀套用。
assert.equal(run('(()=>{const d=SurvivorData.defaults();delete d.bodySeparation;return SurvivorData.validate(d).data.bodySeparation.enabled})()'),true);
for(const change of ['enabled=1','radiusScale=Infinity','radiusScale=.1','playerForce=-1','enemyForce=2']) {
 assert.equal(run(`(()=>{const d=SurvivorData.defaults();d.bodySeparation.${change};return SurvivorData.validate(d).valid})()`),false,change);
}
run('globalThis.d=SurvivorData.defaults();d.bodySeparation={enabled:false,radiusScale:1.2,playerForce:.8,enemyForce:.4};SurvivorData.save(d)');
const custom=createRun({maker:true,saved:run.storage});
assert.equal(custom('GAME_DATA.bodySeparation.radiusScale'),1.2);
assert.equal(custom('GAME_DATA.bodySeparation.enabled'),false);
console.log('PASS: deterministic pure separation, gradual contact, per-frame displacement/neighbor bounds, heavy blocking, dash passage/protection, seams, offscreen guard, fixed warning, Maker migration/validation/storage');
