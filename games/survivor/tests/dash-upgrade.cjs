const assert = require('node:assert/strict');
const create = require('./maker-support.cjs');
const run = create();
const fresh = () => run(`resetGame();state.mode='playing';settingsPanel.hidden=true;state.spawnTimer=999;state.shotTimer=999;`);
const step = seconds => run(`for(let t=0;t<${seconds}-1e-8;t+=.05)tick(.05);`);
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
fresh();
assert.equal(run('state.dashCharges'),2);
run('activateDash();activateDash();'); assert.equal(run('state.dashCharges'),1,'holding cannot consume both at once');
step(.2);run('activateDash()'); assert.equal(run('state.dashCharges'),0);
step(.2);run('activateDash()'); assert.equal(run('state.dashCharges'),0);
step(.8);assert.equal(run('state.dashCharges'),1,'one charge returns after 1.2 seconds');
step(1.2);assert.equal(run('state.dashCharges'),2);
run('activateDash();showOverlay("paused");');const timer=run('state.dashCooldown');run('tick(10)');near(run('state.dashCooldown'),timer);
fresh();run('activateDash();');
assert.ok(run('state.player.invincible')>=.18);step(.1);assert.ok(run('state.dashGhosts.length')>0);
run('render()');step(.3);assert.equal(run('state.dashGhosts.length'),0);
// The first actual attack after dash is empowered, a missed target does not consume it.
fresh();run('activateDash()');step(.2);run('fireAtNearest()');assert.ok(run('state.dashAttack')>0);
run(`state.enemies=[{x:state.player.x+80,y:state.player.y,r:17,hp:999,maxHp:999,speed:0,damage:0,alive:true}];fireAtNearest();`);
assert.equal(run('state.projectiles.length'),1);
near(run('state.projectiles[0].damage'),run('effectiveDamage()*UPGRADE_TUNING.dashAttackDamage'));
near(run('state.projectiles[0].r'),18);
assert.equal(run('state.projectiles[0].boosted'),true);run('fireAtNearest()');assert.equal(run('state.projectiles[1].boosted'),false);
fresh();run('activateDash()');step(1.3);assert.equal(run('state.dashAttack'),0);
// Aim a real approaching shot to arrive inside the perfect window.
fresh();run(`state.player.health=50;state.enemyShots=[{x:state.player.x+45,y:state.player.y,vx:-100,vy:0,r:12,damage:12}];activateDash();`);
assert.equal(run('state.player.health'),52);assert.equal(run('state.slowMotion'),.3);
assert.ok(run('state.player.invincible')>=.35);assert.ok(run('state.vfx.some(v=>v.kind==="discharge")'));
step(.1);near(run('state.slowMotion'),.2);step(.2);assert.equal(run('state.slowMotion'),0);
run('state.player.invincible=0;state.dashTimer=0;activateDash()');assert.equal(run('state.player.health'),52,'same shot cannot reward twice');
fresh();run(`state.player.health=50;state.enemyShots=[{x:state.player.x+100,y:state.player.y,vx:-100,vy:0,r:12}];activateDash()`);assert.equal(run('state.player.health'),50,'too early');
fresh();run(`state.player.health=50;state.enemyHazards=[{x:state.player.x,y:state.player.y,r:50,warning:.1,damage:10}];activateDash()`);assert.equal(run('state.player.health'),52,'timed AoE reward');
// Both teacher attacks warn completely, damage walking, and respect dash immunity.
for(const id of ['chalk-wall','shrinking-ring']) {
 fresh();run(`state.boss={x:state.player.x-100,y:state.player.y,r:32,hp:1000,maxHp:1000,speed:0,wobble:0,flash:0};state.bossIntro=0;state.bossPhase=2;state.bossRest=999;beginBossMove('${id}');`);
 assert.equal(run('state.bossMoves.length'),1);run('updateBoss(.5)');assert.equal(run('state.bossMoves[0].active'),false);
 run('updateBoss(.7)');assert.equal(run('state.bossMoves[0].active'),true);
 if(id==='chalk-wall') run('state.player.x=wallX(state.bossMoves[0]);');
 else run('state.player.x=state.bossMoves[0].x+state.bossMoves[0].radius;state.player.y=state.bossMoves[0].y;');
 const health=run('state.player.health');run('updateBoss(.01)');assert.ok(run('state.player.health')<health,id+' hurts without dash');
 run('state.player.invincible=.1;activateDash();tick(.05);tick(.01)');const safe=run('state.player.health');run('updateBoss(.01)');assert.equal(run('state.player.health'),safe,id+' dash crosses safely');
 run('render()');
}
fresh();run(`globalThis.d=SurvivorData.defaults();delete d.tuning.dashCharges;delete d.tuning.perfectWindow;d.boss.moves=d.boss.moves.filter(m=>!['chalk-wall','shrinking-ring'].includes(m.id));`);
assert.equal(run('SurvivorData.validate(d).valid'),true,'old Maker works migrate');
assert.equal(run('SurvivorData.validate(d).data.tuning.dashCharges'),2);
for(const change of ['d.tuning.dashCharges=1.5','d.tuning.dashCharges=99','d.tuning.perfectWindow=9','d.tuning.perfectHeal=-1','d.tuning.perfectSlowScale=0']) {
 run(`d=SurvivorData.defaults();${change}`);assert.equal(run('SurvivorData.validate(d).valid'),false,change);
}
for(const id of ['water-dash','wind-dash','fusion-dash','wind-attack']) for(const level of [1,5]) {
 fresh();run(`state.upgrades['${id}']=${level};activateDash();tick(.05);`);
 if(id!=='wind-attack')assert.ok(run('state.fields.length')>0,id+' trails at Lv'+level);
 run('render()');
}
run('resetGame()');assert.equal(run('state.dashCharges'),2);assert.equal(run('state.dashAttack+state.slowMotion+state.dashGhosts.length'),0);
console.log('PASS: sequential charges, pause/reset, immunity/ghosts, one boosted attack/expiry, perfect projectile/AoE timing/reward/slow/repeat guard, teacher wall/cage warning and dash crossing, Maker migration/bounds, Lv1/Lv5 dash cards');
fresh();run(`state.player.health=50;state.enemies=[{x:state.player.x+35,y:state.player.y,r:17,speed:50,damage:10,alive:true}];activateDash();`);assert.equal(run('state.player.health'),52,'imminent contact reward');
// A wall at a wrapped camera seam must travel right across the entire viewport.
fresh();run(`state.player.x=10;updateCamera();state.boss={x:40,y:state.player.y,r:32,hp:1000,maxHp:1000,speed:0,wobble:0,flash:0};state.bossPhase=2;state.bossRest=999;beginBossMove('chalk-wall');globalThis.wallStart=wallX(state.bossMoves[0]);updateBoss(1.2);updateBoss(.1);`);
near(run('wallX(state.bossMoves[0])-wallStart'),24);
console.log('PASS: imminent melee reward and wrapped wall geometry');
