// Torus geometry and real engine/render commands at all four seams.
const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
const json = code => JSON.parse(run(`JSON.stringify(${code})`));
for (const [to, from, size, expected] of [[2,98,100,4],[98,2,100,-4],[-202,2,100,-4],[302,98,100,4],[50,0,100,-50],[7,3,0,4]]) {
  assert.equal(run(`wrapDelta(${to},${from},${size})`), expected);
}
assert.equal(run('wrapCoordinate(-301,100)'),99);
assert.equal(run('wrapCoordinate(400,100)'),0);
assert.equal(run('Survivor.engine.loop.wrapDelta === wrapDelta'),true);
function fresh(x,y) {
  run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;state.player.damageDisabled=true;
    state.player.x=${x};state.player.y=${y};updateCamera();`);
}
const W = run('state.worldWidth'), H = run('state.worldHeight');
assert.ok(W >= 4096*2.5 && H >= 4096*2.5);
assert.equal(W%336,0);assert.equal(H%252,0);
// Actual render translations, with shadows and bodies recorded in screen coordinates.
run(`globalThis.tx=0;globalThis.ty=0;globalThis.transforms=[];globalThis.bodies=[];globalThis.shadows=[];
  ctx.save=()=>transforms.push([tx,ty]);ctx.restore=()=>{[tx,ty]=transforms.pop();};
  ctx.translate=(x,y)=>{tx+=x;ty+=y;};
  ctx.ellipse=(x,y)=>shadows.push([x+tx,y+ty]);
  globalThis.realBlob=drawBlob;
  drawBlob=function(x,y,...rest){bodies.push([x+tx,y+ty]);return realBlob(x,y,...rest);};`);
for (const [px,py,ex,ey] of [[5,H/2,W-15,H/2],[W-5,H/2,15,H/2],[W/2,5,W/2,H-15],[W/2,H-5,W/2,15],[5,5,W-15,H-15]]) {
  fresh(px,py);
  run(`state.enemies=[{x:${ex},y:${ey},r:17,hp:100,maxHp:100,speed:35,damage:0,typeId:'jaben',alive:true,wobble:0,flash:0,shotCooldown:999}];`);
  assert.equal(run('closestEnemy()===state.enemies[0]'),true);
  run('bodies=[];shadows=[];render()');
  const inside = ([x,y]) => x>=0 && x<=800 && y>=0 && y<=600;
  const bodies=json('bodies').filter(inside);
  assert.equal(bodies.length,1,'one visible body across seam');
  assert.ok(json('shadows').some(([x,y]) => Math.abs(x-bodies[0][0])<.01 && Math.abs(y-(bodies[0][1]+17*.85))<.01),'shadow follows same copy');
  const before=run('Math.hypot(deltaX(state.enemies[0].x,state.player.x),deltaY(state.enemies[0].y,state.player.y))');
  // 舊追逐方向單獨驗證；開啟分離的接縫案例在 body-separation.cjs。
  run('GAME_DATA.bodySeparation.enabled=false;tick(.05);GAME_DATA.bodySeparation.enabled=true');
  assert.ok(run('Math.hypot(deltaX(state.enemies[0].x,state.player.x),deltaY(state.enemies[0].y,state.player.y))')<before,'enemy walks shortest route');
  assert.equal(run('state.player.x-state.cameraX'),400);
}
// Cross-seam hits are allowed on visible enemies; a wrapped but offscreen enemy stays protected.
fresh(5,5);
run(`state.enemies=[20,600].map(d=>({x:wrapCoordinate(5-d,state.worldWidth),y:5,r:17,hp:100,maxHp:100,speed:0,damage:0,typeId:'jaben',alive:true,wobble:0,flash:0,shotCooldown:999}));
state.projectiles=state.enemies.map(e=>({x:e.x,y:e.y,vx:0,vy:0,r:12,damage:35,pierce:0,hitList:[],alive:true,rangeLeft:100}));tick(0);`);
assert.deepEqual(json('state.enemies.map(e=>e.hp)'),[65,100]);
run(`state.enemies[0].hp=100;state.enemies[1].hp=100;schoolEffect('thunder',state.enemies[0],state.enemies[0].x,5,35);`);
assert.equal(run('state.enemies[1].hp'),100,'chain never damages offscreen target');
// Seam crossing preserves travel distance, dash trail spacing and facing.
fresh(W-5,H/2);
run(`state.upgrades={'water-dash':1};state.keys.add('d');activateDash();tick(.05);`);
assert.ok(run('state.player.x<30 && state.moveRate<4 && state.player.facing===1'));
assert.ok(run('state.fields.every(f=>f.x>=0 && f.x<state.worldWidth)'));
assert.ok(run('state.fields.length<5'));
// Enemy shots wrap, then expire instead of accumulating forever.
fresh(5,5);
run(`state.enemyShots=[{source:'book',x:state.worldWidth-2,y:200,vx:100,vy:0,r:12,damage:8,life:8}];tick(.05);`);
assert.equal(run('state.enemyShots[0].x'),3);
run('state.enemyShots[0].life=0;tick(0)');assert.equal(run('state.enemyShots.length'),0);
// XP, push/pull, aim and teacher guide share shortest deltas.
fresh(5,H/2);
run(`state.gems=[{x:state.worldWidth-10,y:state.player.y,r:8,value:1,wobble:0,alive:true}];tick(0)`);
assert.equal(run('state.xp'),1);
run(`state.enemies=[{x:state.worldWidth-45,y:state.player.y,r:17,hp:100,maxHp:100,alive:true}];fireAtNearest();`);
assert.ok(run('state.projectiles[0].vx<0'));
run('shiftTarget(state.enemies[0],5,state.player.y,-20)');
assert.equal(run('deltaX(state.enemies[0].x,5)'),-30);
run(`state.boss={x:state.worldWidth-600,y:state.player.y,r:32};`);
assert.ok(run('Math.abs(bossGuide().angle)===Math.PI'));
// A bolt crosses just 20 units, never draws a line across the whole map.
run(`drawCalls.length=0;drawBolt(state.worldWidth-10,100,10,100);`);
assert.ok(json('drawCalls.filter(c=>c[0]==="lineTo").map(c=>c[1])').every(x=>Math.abs(x-W)<30));
// Rain landing positions are canonical and remain visible across the corner.
fresh(5,5);
run(`state.boss={x:state.worldWidth-80,y:state.worldHeight-80,r:32,hp:2000,maxHp:2000,speed:0,wobble:0};state.bossPhase=3;beginBossMove('rain');render();`);
assert.ok(run('state.bossMoves[0].points.length>0 && state.bossMoves[0].points.every(p=>p.x>=0&&p.x<state.worldWidth&&p.y>=0&&p.y<state.worldHeight&&targetVisible(p))'));
// Old stored Maker stages migrate without accepting arbitrary stage edits.
run(`globalThis.legacy=SurvivorData.defaults();legacy.stages[0].name='教室';legacy.stages[0].background='classroom';legacy.stages[1].name='操場';legacy.stages[1].background='playground';`);
assert.equal(run('SurvivorData.validate(legacy).valid'),true);
assert.equal(run('SurvivorData.validate(legacy).data.stages[0].name'),'糖果森林');
run('legacy.stages[0].enemySpeedScale=99');assert.equal(run('SurvivorData.validate(legacy).valid'),false);
// Ground tile edges are plain matching pixels; world periods contain whole tiles.
for (const kind of ['candy-forest','cookie-forest']) {
  run(`drawCalls.length=0;backgroundTile(${JSON.stringify(kind)});`);
  const rectangles=json('drawCalls.filter(c=>c[0]==="fillRect")');
  // Tiles may already be cached by render; explicitly recreate for inspection.
  if (!rectangles.length) run(`delete BACKGROUND_TILES[${JSON.stringify(kind)}];drawCalls.length=0;backgroundTile(${JSON.stringify(kind)});`);
  const rects=json('drawCalls.filter(c=>c[0]==="fillRect")');
  assert.deepEqual(rects[0],['fillRect',0,0,336,252]);
  assert.ok(rects.slice(1).every(([,x,y,w,h])=>x>0&&y>0&&x+w<336&&y+h<252),'decorations never break matching tile edges');
}
console.log('PASS: modulo/shortest delta, five seam body/shadow renders, enemy pursuit, visible-only collisions/chain, dash/trails, shot wrap/expiry, XP/pull/aim/guide, short bolt, rain landing, old Maker stages, seamless pixel ground');
