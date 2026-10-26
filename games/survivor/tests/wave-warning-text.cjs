const assert=require('node:assert/strict');
const createRun=require('./maker-support.cjs');
const run=createRun();
// 四種事件 × 審查尺寸：真實事件入口只播一次警告音，先等待再出怪。
for(const kind of ['ring','tide','elite-squad','candy-rain']) {
  for(const [width,height] of [[740,360],[1024,461],[1180,820]]) {
    run(`resetGame();state.mode='playing';state.width=${width};state.height=${height};
      enemyNotice.hidden=true;enemyNotice.textContent='';state.bookNoticeTimer=0;
      globalThis.sounds=[];playSound=id=>sounds.push(id);
      ensurePacing();state.pacing.events=['${kind}','ring'];state.stageElapsed=45;
      updatePacing(0);`);
    assert.equal(run('enemyNotice.hidden'),true);
    assert.equal(run('enemyNotice.textContent'),'');
    assert.equal(run('state.bookNoticeTimer'),0);
    assert.equal(run('sounds.join()'),'warning');
    assert.equal(run('state.enemies.length'),0);
    assert.equal(run('state.pacing.warning'),run('GAME_DATA.pacing.warning'));
    run('drawCalls.length=0;drawWaveEventWarning()');
    const expected=kind==='tide'?1:4;
    assert.equal(run('drawCalls.filter(c=>c[0]==="fillRect").length'),expected);
    assert.equal(run('drawCalls.some(c=>c[0]==="fillText" || c[0]==="strokeText")'),false);
    // 完整 render 仍會畫出邊緣；鏡頭移動不影響其螢幕座標。
    run('drawCalls.length=0;render()');
    assert.ok(run('drawCalls.some(c=>c[0]==="fillRect" && c[1]===0 && c[2]===0 && c[3]===12/(state.zoom||1) && c[4]===state.height)'));
    run('updatePacing(GAME_DATA.pacing.warning/2)');
    assert.equal(run('state.enemies.length'),0);
    assert.equal(run('sounds.length'),1);
    run('updatePacing(GAME_DATA.pacing.warning/2);drawCalls.length=0;drawWaveEventWarning()');
    assert.equal(run('drawCalls.length'),0);
    run('updatePacing(0)');
    assert.equal(run('state.enemies.length'),1);
    assert.equal(run('targetVisible(state.enemies[0])'),false);
  }
}
// Maker 修改來向時，預警隨同改變；不可覆寫老師或其他通知。
run(`resetGame();ensurePacing();state.pacing.events=['tide','ring'];
  GAME_DATA.waveEvents={tide:{position:'bottom'}};state.stageElapsed=45;
  enemyNotice.textContent='保留其他通知';enemyNotice.hidden=false;state.bookNoticeTimer=2;
  updatePacing(0);drawCalls.length=0;drawWaveEventWarning();`);
assert.equal(run('JSON.stringify(drawCalls.filter(c=>c[0]==="fillRect"))'),run('JSON.stringify([["fillRect",0,state.height-12/(state.zoom||1),state.width,12/(state.zoom||1)]])'));
assert.equal(run('enemyNotice.textContent'),'保留其他通知');
assert.equal(run('enemyNotice.hidden'),false);
assert.equal(run('state.bookNoticeTimer'),2);
run('state.boss={};drawCalls.length=0;drawWaveEventWarning()');
assert.equal(run('drawCalls.length'),0);
run('resetGame();drawCalls.length=0;drawWaveEventWarning()');
assert.equal(run('drawCalls.length'),0);
console.log('PASS: four wave events without banners, edge pulses at three viewport sizes, one sound, warning delay/offscreen spawn, custom direction, other notices/boss/reset preserved');
