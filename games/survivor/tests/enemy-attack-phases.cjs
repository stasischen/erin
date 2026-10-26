const assert=require('node:assert/strict');
const createRun=require('./maker-support.cjs');
const run=createRun();
function fresh(id='pudding',distance=70) {
 run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;
 GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;GAME_DATA.bodyContact.pushOnly=false;
 globalThis.e=spawnEnemy({typeId:'${id}'});e.x=state.player.x+${distance};e.y=state.player.y;e.speed=0;e.actionCooldown=1;
 globalThis.c=ENEMY_TYPES.find(t=>t.id===e.typeId).phaseAttack;`);
}
// 鎖定原點與方向：起手無傷，扇形內生效只打一次，收招／冷卻無傷。
fresh();run('updateEnemyBehavior(e,0);globalThis.origin=JSON.stringify([e.phaseAttack.x,e.phaseAttack.y,e.phaseAttack.angle]);updateEnemyBehavior(e,.89)');
assert.equal(run('state.player.health'),90);assert.equal(run('enemyDirection(e,70)'),0);
run('updateEnemyBehavior(e,.01)');assert.equal(run('state.player.health'),78);
run('state.player.invincible=0;updateEnemyBehavior(e,.1)');assert.equal(run('state.player.health'),78);
run('updateEnemyBehavior(e,.15)');assert.equal(run('e.phaseAttack.phase'),'recovery');
run('state.player.invincible=0;updateEnemyBehavior(e,.6)');assert.equal(run('state.player.health'),78);
assert.equal(run('JSON.stringify([e.phaseAttack.x,e.phaseAttack.y,e.phaseAttack.angle])'),run('origin'));
run('updateEnemyBehavior(e,.05)');assert.equal(run('e.phaseAttack.phase'),'cooldown');assert.equal(run('enemyDirection(e,70)'),1);
// 不在預警形狀內，貼近邊緣也無傷；判定主角中心，沒有隱藏擴大範圍。
for(const [x,y] of [[96,0],[-1,0],[50,90]]) {
 fresh();run(`updateEnemyBehavior(e,0);state.player.x=e.phaseAttack.x-(${x});state.player.y=e.phaseAttack.y-(${y});updateEnemyBehavior(e,.9)`);
 assert.equal(run('state.player.health'),90,`${x},${y}`);
}
// 共用五種形狀／型態與固定資料純規則的邊界。
for(const [shape,inside,outside] of [['line',[100,10],[-1,0]],['sector',[50,0],[0,50]],['circle',[0,95],[0,96]],['ring',[50,0],[10,0]]]) {
 assert.equal(run(`SurvivorPacing.inShape({...c,shape:'${shape}'},${inside})`),true,shape);
 assert.equal(run(`SurvivorPacing.inShape({...c,shape:'${shape}'},${outside})`),false,shape);
}
// 同樣的輸入走實際傷害接合層，四種地面形狀的內外判定一致。
for(const [shape,x,y,damage] of [['line',80,0,12],['line',80,96,0],['circle',0,70,12],['circle',0,96,0],['ring',50,0,12],['ring',10,0,0]]) {
 fresh();run(`e.phaseAttack={phase:'active',left:.2,x:e.x,y:e.y,angle:0,config:{...c,shape:'${shape}'},hit:false};state.player.x=e.x+${x};state.player.y=e.y+${y};updatePhasedAttack(e,0)`);
 assert.equal(run('state.player.health'),90-damage,shape);
}
// 蘑菇預警後固定直線：走到側面躲開，不重新瞄準；不重複走舊射擊入口。
fresh('mushroom',180);run('updateEnemyBehavior(e,0);state.level=20;e.shotCooldown=0;updateBookShooting(0)');
assert.equal(run('state.enemyShots.length'),0);
run('state.player.y+=100;updateEnemyBehavior(e,.9)');assert.equal(run('state.enemyShots.length'),1);
assert.ok(Math.abs(run('state.enemyShots[0].vy'))<1e-8);assert.ok(run('state.enemyShots[0].vx')<0);
run('state.player.x=e.phaseAttack.x-100;state.player.y=e.phaseAttack.y;tick(.05)');
for(let i=0;i<15;i++)run('tick(.05)');
assert.equal(run('state.player.health'),84);
// 子彈生效結束前回收，不在收招造成傷害；同一個真實 tick 更新生命。
fresh('mushroom',180);run('updateEnemyBehavior(e,0);updateEnemyBehavior(e,.9);state.player.y+=200');
for(let i=0;i<41;i++)run('tick(.05)');
assert.equal(run('e.phaseAttack.phase'),'recovery');assert.equal(run('state.enemyShots.length'),0);
// 仙子先保留護盾，冷卻期間放有缺口的慢速糖果圈。
fresh('fairy',180);run(`globalThis.other=spawnEnemy({typeId:'jaben'});other.x=e.x+10;other.y=e.y;e.actionCooldown=0;updateEnemyBehavior(e,0);updateEnemyBehavior(e,.9)`);
assert.equal(run('other.fairyShield'),1);
run('updateEnemyBehavior(e,0);updateEnemyBehavior(e,.9)');assert.equal(run('state.enemyShots.length'),8);
assert.equal(run('state.enemyShots.every(s=>Math.abs(Math.hypot(s.vx,s.vy)-c.speed)<1e-6)'),true);
assert.equal(run('SurvivorPacing.attackAngles(c,0).every(a=>a>=c.gapDegrees*Math.PI/360 && a<=Math.PI*2-c.gapDegrees*Math.PI/360)'),true);
// 站在鎖定的缺口中，整段真實子彈更新都能躲過糖果圈。
fresh('fairy',180);run('updatePhasedAttack(e,0);updatePhasedAttack(e,.9)');
for(let i=0;i<40;i++)run('tick(.05)');assert.equal(run('state.player.health'),90);
// 暈眩／暫停凍結，出畫面取消，回來重新預警；死亡／重開移除攻擊。
fresh();run('updateEnemyBehavior(e,0);e.stunTimer=1;updateEnemyBehavior(e,.5)');assert.equal(run('e.phaseAttack.left'),.9);
run('e.stunTimer=0;state.mode="paused";tick(.5)');assert.equal(run('e.phaseAttack.left'),.9);
run('state.mode="playing";e.x=state.player.x+state.width;updateEnemyBehavior(e,0)');assert.equal(run('e.phaseAttack'),null);
run('e.x=state.player.x+70;updateEnemyBehavior(e,0)');assert.equal(run('e.phaseAttack.phase'),'windup');
run('damageEnemy(e,9999);tick(.05)');assert.equal(run('state.enemies.length'),0);
run('resetGame()');assert.equal(run('state.enemies.length+state.enemyShots.length'),0);
// 環形世界接縫仍以同一相對座標命中。
fresh();run('state.player.x=10;e.x=state.worldWidth-60;e.y=state.player.y;updateCamera();updateEnemyBehavior(e,0);updateEnemyBehavior(e,.9)');
assert.equal(run('state.player.health'),78);
// 沙包仍有輕微碰撞；開關開啟後有推開但不受傷，關閉後恢復。
for(const [id,hurt] of [['jaben',3.75],['otsubon',3]]) {
 fresh(id,0);run('tick(0)');assert.equal(run('state.player.health'),90-hurt);
 fresh(id,0);run('GAME_DATA.bodyContact.pushOnly=true;tick(0)');assert.equal(run('state.player.health'),90);
 assert.ok(run('encounterDistance(e,state.player)>=e.r+state.player.r-.001'));
 run('GAME_DATA.bodyContact.pushOnly=false;e.x=state.player.x;e.y=state.player.y;tick(0)');assert.equal(run('state.player.health'),90-hurt);
}
// 舊作品補欄位、驗證界線、儲存與真實 Maker 模式載入。
run('globalThis.d=SurvivorData.defaults();delete d.bodyContact;d.enemies.forEach(e=>delete e.phaseAttack);globalThis.result=SurvivorData.validate(d)');
assert.equal(run('result.valid'),true);assert.equal(run('result.data.enemies[2].phaseAttack.enabled'),true);
for(const change of ['d.bodyContact.pushOnly=1','d.bodyContact.damageScale=Infinity','d.enemies[2].phaseAttack.windup=.1','d.enemies[2].phaseAttack.count=1.5','d.enemies[2].phaseAttack.shape="script"','d.enemies[2].phaseAttack.radial="yes"','d.enemies[2].phaseAttack.shape="ring";d.enemies[2].phaseAttack.innerRadius=150']) {
 assert.equal(run(`(()=>{const d=SurvivorData.defaults();${change};return SurvivorData.validate(d).valid})()`),false,change);
}
run('d=SurvivorData.defaults();d.bodyContact.pushOnly=true;d.bodyContact.damageScale=.5;d.enemies[2].phaseAttack.windup=1.5;SurvivorData.save(d)');
const custom=createRun({maker:true,saved:run.storage});
assert.equal(custom('GAME_DATA.bodyContact.pushOnly'),true);assert.equal(custom('ENEMY_TYPES[2].phaseAttack.windup'),1.5);
// 真正繪圖命令含鎖定扇形，收招提示；手機／平板共享世界形狀、不依畫面縮放改傷害。
fresh();run('updateEnemyBehavior(e,0);drawCalls.length=0;render()');
assert.equal(run('drawCalls.some(c=>c[0]==="arc" && c[3]===95 && Math.abs(c[4]+110*Math.PI/360)<1e-6)'),true);
assert.equal(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number"||Number.isFinite(v)))'),true);
console.log('PASS: four phases, fixed origin/aim, pure shape boundaries, single active hit, windup/recovery safety, mushroom projectile/lifetime, fairy gap/shield, stun/pause/offscreen/death/reset/seams, reduced sandbag contact/push switch, schema migration/bounds/storage, shared warning geometry');
