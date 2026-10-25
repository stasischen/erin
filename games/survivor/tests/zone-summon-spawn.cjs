// 真實引擎：縮圈不能讓任何敵人從鏡頭裡冒出來。
const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
function fresh() {
  run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;
    summonTeacher();state.bossIntro=0;state.bossRest=999;state.enemies=[];`);
}
function check() {
  // 不用 targetVisible（只判斷整隻在內）；連身體邊緣都必須離開視野 16 格。
  assert.equal(run(`state.enemies.every(e => {
    const dx=Math.abs(deltaX(e.x,state.cameraX+state.width/2));
    const dy=Math.abs(deltaY(e.y,state.cameraY+state.height/2));
    return (dx>=state.width/2+e.r+16 || dy>=state.height/2+e.r+16) &&
      Math.hypot(deltaX(e.x,state.player.x),deltaY(e.y,state.player.y))>=state.player.r+e.r+160 &&
      e.x>=0 && e.x<state.worldWidth && e.y>=0 && e.y<state.worldHeight;
  })`),true);
}
// 中央、四邊、角落，初始圈／收圈中／最小圈；直式、橫式和窄視窗。
let cases=0;
for (const [width,height] of [[800,600],[360,800],[915,412],[120,100]]) {
  for (const radius of [1200,1000,800,700,600]) {
    for (const position of ['state.worldWidth/2,state.worldHeight/2','5,5','state.worldWidth-5,5','5,state.worldHeight-5','state.worldWidth-5,state.worldHeight-5','5,state.worldHeight/2','state.worldWidth/2,5']) {
      fresh();
      run(`state.width=${width};state.height=${height};[state.player.x,state.player.y]=[${position}];updateCamera();
        state.bossZone.x=state.player.x;state.bossZone.y=state.player.y;state.bossZone.radius=${radius};
        for(let i=0;i<60;i++)spawnEnemy();`);
      assert.ok(run('state.enemies.length')>0);check();
      // 真的走老師 summon 招式的預警、啟動路徑。
      run(`state.enemies=[];state.boss.x=state.player.x;state.boss.y=state.player.y;
        beginBossMove('summon');state.bossMoves[0].warning=0;updateBoss(0);`);
      assert.ok(run('state.enemies.length')>0);check();cases++;
    }
  }
}
// 視野大到原本的候選點會 wrap 回畫面內：找得到空間就改點，否則不生成。
fresh();
run('state.width=state.worldWidth;state.height=600;updateCamera();for(let i=0;i<60;i++)spawnEnemy();');
assert.ok(run('state.enemies.length')>0);check();
run('state.enemies=[];state.height=state.worldHeight;updateCamera();for(let i=0;i<60;i++)spawnEnemy();');
assert.equal(run('state.enemies.length'),0);
// 沒有安全圈時也遵守同一規則；敵人數量上限仍有效。
fresh();run('state.bossZone=null;for(let i=0;i<ENEMY_LIMIT+10;i++)spawnEnemy();');
assert.equal(run('state.enemies.length'),run('ENEMY_LIMIT'));check();
// 霧外敵人照常往主角走，速度和血量不受紫霧影響。
fresh();run(`state.bossZone.radius=600;
 state.enemies=[{x:state.player.x+700,y:state.player.y,r:17,speed:40,damage:0,hp:100,maxHp:100,alive:true,flash:0,wobble:0,typeId:'jaben',shotCooldown:999}];
 globalThis.beforeX=state.enemies[0].x;tick(.05);`);
assert.equal(run('state.enemies[0].hp'),100);
assert.ok(Math.abs(run('deltaX(beforeX,state.enemies[0].x)')-2)<1e-8);
console.log(`PASS: ${cases} zone/viewport/seam wave + teacher summon cases; wrapped visibility margin/minimum distance; oversized viewport fallback/skip; limit/no-zone; fog pursuit/speed/hp`);
