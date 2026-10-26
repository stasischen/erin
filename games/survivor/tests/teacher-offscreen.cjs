// 固定視窗、世界位置與亂數 → 老師在鏡頭外進場，邊緣中央 7.5 秒／角落 15 秒內完整可見且可受傷。
const assert = require('node:assert/strict');
const run = require('./maker-support.cjs')();
let cases = 0;
for (const [width, height] of [[732,310],[800,360],[915,412],[667,375],[1024,768],[120,100]]) {
  for (const position of ['state.worldWidth/2,state.worldHeight/2', '5.123,5.456', 'state.worldWidth-5.123,state.worldHeight-5.456']) {
    for (let side = 0; side < 4; side++) for (const sample of [0, .5, .999999]) {
      run(`resetGame();state.mode='playing';state.width=${width};state.height=${height};
        [state.player.x,state.player.y]=[${position}];updateCamera();
        state.player.damageDisabled=true;state.spawnTimer=999;state.shotTimer=999;
        state.stageElapsed=gameSettings.waveSeconds;
        globalThis.randomCalls=0;Math.random=()=>randomCalls++===0?${(side+.1)/4}:${sample};
        tick(0);globalThis.teacher=state.boss;`);
      assert.ok(run('!!teacher'), 'teacher spawned');
      assert.equal(run('targetVisible(teacher)'), false, 'starts offscreen');
      assert.ok(run('Math.abs(deltaX(teacher.x,state.player.x)) <= state.width/2+78 && Math.abs(deltaY(teacher.y,state.player.y)) <= state.height/2+78'), 'near viewport, never half a world away');
      const deadline = sample === .5 ? 7.5 : 15;
      run(`for(let i=0;i<${deadline/.05};i++)tick(.05);`);
      assert.equal(run('state.boss===teacher'), true, 'same teacher, not respawned');
      assert.equal(run('targetVisible(teacher)'), true, `${width}x${height}, ${position}, side ${side}, sample ${sample}: entered within ${deadline} seconds`);
      assert.equal(run('canAttackTarget(teacher)'), true, 'in attack range after entry');
      run('hitBuildTarget(teacher,1);');
      assert.equal(run('teacher.hp'),1999,'can damage teacher');
      // 站定再戰鬥 20 秒，不會每幀被生成規則送回畫面外。
      if (width >= 667) {
        run('globalThis.stayedVisible=true;for(let i=0;i<400;i++){tick(.05);if(!targetVisible(teacher))stayedVisible=false;}');
        assert.equal(run('stayedVisible && state.boss===teacher'),true,'remains visible in combat');
      }
      cases++;
    }
  }
}
console.log(`PASS: ${cases} teacher entry cases: four sides / narrow phone / iPad / fractional world seams; edge midpoint visible/damageable within 7.5 seconds, corners within 15 seconds; same boss stays visible in stationary combat`);
