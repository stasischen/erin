// 真實引擎：精英能力、大熊盔甲、預警、衝刺、獎勵與資料相容性。
const assert = require('node:assert/strict');
const createRun = require('./maker-support.cjs');
const run = createRun();
function fresh() {
  run(`state.width=800;state.height=600;resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;
    GAME_DATA.elites.enabled=true;GAME_DATA.chocobear.enabled=true;Math.random=Object.getPrototypeOf(Math).random;`);
}
function elite(ability) {
  fresh();
  run(`GAME_DATA.elites.abilities=['${ability}'];spawnEnemy({elite:true});
    globalThis.e=state.enemies[0];e.x=state.player.x+120;e.y=state.player.y;e.speed=0;`);
}
function bear() {
  fresh();run(`spawnChocobear();globalThis.b=state.miniboss;b.x=state.player.x+100;b.y=state.player.y;b.speed=0;`);
}
function offscreen() {
  assert.equal(run(`state.enemies.every(e =>
    Math.abs(deltaX(e.x,state.cameraX+state.width/2))>=state.width/2+e.r+16 ||
    Math.abs(deltaY(e.y,state.cameraY+state.height/2))>=state.height/2+e.r+16)`),true);
}
let cases=0;
for (const [w,h] of [[800,600],[915,412],[360,800],[120,100]]) {
  for (const position of ['5,5','state.worldWidth-5,5','5,state.worldHeight-5','state.worldWidth-5,state.worldHeight-5','state.worldWidth/2,state.worldHeight/2']) {
    for (const rand of [0,.25,.5,.75,.999]) {
      fresh();run(`state.width=${w};state.height=${h};[state.player.x,state.player.y]=[${position}];updateCamera();Math.random=()=>${rand};spawnEnemy({elite:true});spawnChocobear();`);
      assert.equal(run('state.enemies.length'),2);offscreen();cases++;
    }
  }
}
fresh();run('state.width=state.worldWidth;state.height=state.worldHeight;updateCamera();spawnEnemy({elite:true});spawnChocobear();');
assert.equal(run('state.enemies.length'),0);assert.equal(run('state.bearSpawned'),false);
// 體型、血量與前 3 下完全擋住；第 4 下才受傷。
elite('shield');
assert.equal(run('e.r'),run('ENEMY_TYPES.find(t=>t.id===e.typeId).radius*1.25'));
assert.equal(run('e.hp'),run('(e.typeId===ENEMY_TYPES[0].id ? gameSettings.enemyHealth : gameSettings.secondEnemyHealth)*5'));
run('globalThis.hp=e.hp;for(let i=0;i<3;i++)damageEnemy(e,999);');
assert.equal(run('e.hp'),run('hp'));assert.equal(run('e.shield'),0);
run('hitBuildTarget(e,10);');assert.equal(run('e.hp'),run('hp-10'));
// 必得獎勵不依賴寶石容量；分裂恰好三隻小怪，無遞迴精英，都從畫面外來。
elite('split');run('state.gems=Array.from({length:GEM_LIMIT},()=>({alive:false}));damageEnemy(e,99999);');
assert.equal(run('state.xp'),5);assert.equal(run('state.splitQueue.length'),3);
run('state.enemies=state.enemies.filter(e=>e.alive);updateEncounters(0);');
assert.equal(run('state.enemies.length'),3);assert.equal(run('state.enemies.every(s=>!s.elite && s.r<e.r && s.maxHp<e.maxHp)'),true);offscreen();
run('openEncounterReward()');assert.equal(run('state.mode'),'levelup');assert.equal(run('state.level'),2);
// wrapped 加速光環只影響範圍內；糖漿有 0.6 秒預告再緩速，會消失且有上限。
elite('haste');run('e.x=state.worldWidth-10;globalThis.n={x:5,y:e.y};');
assert.equal(run('eliteSpeed(n)'),1.35);run('n.x=500;');assert.equal(run('eliteSpeed(n)'),1);
elite('syrup');run('e.x=state.player.x;e.y=state.player.y;updateEncounters(.7);');
assert.equal(run('state.syrup.length'),1);assert.equal(run('syrupSpeed()'),1);
run('updateEncounters(.6)');assert.equal(run('syrupSpeed()'),.65);
run('e.alive=false;updateEncounters(5)');assert.equal(run('syrupSpeed()'),1);assert.equal(run('state.syrup.length'),0);
elite('syrup');run('for(let i=0;i<300;i++)updateEncounters(.7)');assert.ok(run('state.syrup.length')<=48);
// 傳送落點固定、先閃爍；暈眩暫停能力；玩家站到落點時取消。
elite('teleport');run('Math.random=()=>0;e.abilityTimer=0;globalThis.oldX=e.x;updateEncounters(0)');
assert.equal(run('e.x'),run('oldX'));assert.ok(run('e.teleport.warning')>=.8);
run('e.stunTimer=1;updateEncounters(1)');assert.equal(run('e.teleport.warning'),1.2);
run('e.stunTimer=0;updateEncounters(1.19)');assert.equal(run('e.x'),run('oldX'));
run('updateEncounters(.01)');assert.equal(run('Math.round(deltaX(e.x,state.player.x))'),150);
run('e.abilityTimer=0;updateEncounters(0);globalThis.before=e.x;state.player.x=e.teleport.x;state.player.y=e.teleport.y;updateCamera();updateEncounters(1.2)');
assert.equal(run('e.x'),run('before'));assert.equal(run('e.teleport'),null);
// 抽選的間隔／機率／數量上限與開關都生效；普通生成不意外升級。
fresh();run('GAME_DATA.elites.chance=1;Math.random=()=>0;updateEncounters(17.9)');assert.equal(run('state.enemies.length'),0);
run('updateEncounters(.1)');assert.equal(run('state.enemies.length'),1);
run('updateEncounters(18);updateEncounters(18);updateEncounters(18)');assert.equal(run('state.enemies.filter(e=>e.elite).length'),3);
fresh();run('GAME_DATA.elites.chance=0;updateEncounters(18)');assert.equal(run('state.enemies.length'),0);
run('GAME_DATA.elites.enabled=false;GAME_DATA.chocobear.enabled=false;state.stageElapsed=60;updateEncounters(60)');assert.equal(run('state.enemies.length'),0);
// 每關中途一次；重開及換關重新計次。
fresh();run('state.stageElapsed=gameSettings.waveSeconds*.5-.01;updateEncounters(0)');assert.equal(run('state.miniboss'),null);
run('state.stageElapsed+=.01;updateEncounters(0);updateEncounters(0)');assert.equal(run('state.enemies.filter(e=>e.miniboss).length'),1);
assert.equal(run('bossHud.hidden'),false);
assert.ok(run("document.getElementById('bossName').textContent.includes('巧克力大熊')"));
// 破甲不穿透、所有攻擊經同一傷害入口；本體死後兩張不同卡，不消耗經驗或普通等級。
bear();run('damageEnemy(b,99999)');assert.equal(run('b.armor'),0);assert.equal(run('b.hp'),run('b.maxHp'));
run('hitBuildTarget(b,99999);openEncounterReward()');assert.equal(run('state.mode'),'levelup');assert.equal(run('state.rewardChoices'),2);
run('globalThis.first=state.pendingChoices[0].id;applyUpgrade(0)');assert.equal(run('state.mode'),'levelup');assert.equal(run('state.rewardChoices'),1);
assert.equal(run('state.pendingChoices.some(c=>c.id===first)'),false);
run('rerollUpgradeCards()');assert.equal(run('state.pendingChoices.some(c=>c.id===first)'),false);
run('applyUpgrade(0)');assert.equal(run('state.mode'),'playing');assert.equal(run('state.level'),1);assert.equal(run('state.xp'),0);assert.equal(run('Object.keys(state.upgrades).length'),2);
// 滿卡池也能兩次回血，不能卡死。
bear();run('for(const c of UPGRADES)state.upgrades[c.id]=5;b.armor=0;damageEnemy(b,99999);openEncounterReward();applyUpgrade(0);applyUpgrade(0)');assert.equal(run('state.mode'),'playing');
// 重擊先有固定影圈；畫面外不攻擊／取消預告；擊中、普通衝刺免傷、完美閃避皆走真實流程。
bear();run('b.slamTimer=0;updateEncounters(0)');assert.equal(run('state.enemyHazards.length'),1);assert.equal(run('state.player.health'),90);
run('updateMakerEffects(1.19)');assert.equal(run('state.player.health'),90);
run('updateMakerEffects(.01)');assert.equal(run('state.player.health'),72);
bear();run('b.slamTimer=0;updateEncounters(0);updateMakerEffects(1.1);activateDash();updateMakerEffects(.1)');assert.equal(run('state.player.health'),90);
assert.equal(run('state.enemyHazards.length'),0);assert.ok(run('state.slowMotion')>0);
bear();run('b.x=state.player.x+state.width;b.slamTimer=0;updateEncounters(0)');assert.equal(run('state.enemyHazards.length'),0);
bear();run('b.slamTimer=0;updateEncounters(0);b.x=state.player.x+state.width;updateEncounters(.05)');assert.equal(run('state.enemyHazards.length'),0);
// 暫停不動、重開清空、換關可再次出場；畫圖保持有限座標。
bear();run('b.slamTimer=0;updateEncounters(0);showOverlay("paused");tick(1)');assert.equal(run('state.enemyHazards[0].warning'),1.2);
run('render();resetGame()');assert.equal(run('state.miniboss'),null);assert.equal(run('state.bearSpawned'),false);assert.equal(run('state.syrup.length+state.splitQueue.length+state.rewardChoices'),0);
run('state.stageIndex=1;state.stageElapsed=gameSettings.waveSeconds*.5;state.mode="playing";updateEncounters(0)');assert.ok(run('state.miniboss'));
// 新資料嚴格驗證且舊作品保留原設定；儲存讀回、自訂值真正進引擎。
for (const change of ['d.elites.chance=2','d.elites.interval=NaN','d.elites.limit=1.5','d.elites.abilities=[]','d.elites.abilities=["x"]','d.elites.enabled="yes"','d.chocobear.name="<script>"','d.chocobear.slamWarning=.1','d.chocobear.armor=Infinity']) {
  assert.equal(run(`(()=>{const d=SurvivorData.defaults();${change};return SurvivorData.validate(d).valid})()`),false,change);
}
assert.equal(run('(()=>{const d=SurvivorData.defaults();delete d.elites;delete d.chocobear;d.enemies[0].hp=222;const r=SurvivorData.validate(d);return r.valid && r.data.elites.enabled && r.data.enemies[0].hp===222;})()'),true);
run('globalThis.d=SurvivorData.defaults();d.chocobear.armor=250;d.chocobear.slamWarning=2;d.elites.rewardXp=8;SurvivorData.save(d)');
const custom=createRun({maker:true,saved:run.storage});custom('resetGame();spawnChocobear()');assert.equal(custom('state.miniboss.armor'),250);assert.equal(custom('GAME_DATA.chocobear.slamWarning'),2);
console.log(`PASS: ${cases} wrapped offscreen elite/bear cases; all five abilities; bounded split/syrup; guaranteed XP; schedule/chance/caps; armor; two unique legal rewards/fallback; slam warning/hit/dash/perfect/offscreen; pause/reset/stages; schema/migration/storage/custom values`);
// 第一張的雙點／確認殘留事件不能順帶選第二張。
bear();run('b.armor=0;damageEnemy(b,99999);openEncounterReward();globalThis.oldChoices=state.pendingChoices;applyUpgrade(0,oldChoices);applyUpgrade(0,oldChoices)');
assert.equal(run('state.rewardChoices'),1);assert.equal(run('Object.keys(state.upgrades).length'),1);
console.log('PASS: stale double-click/confirm cannot consume the second bear reward');
// 非完美時機的一般衝刺，仍靠現有無敵躲掉重擊（含 tick 開頭的落地判定）。
bear();run('b.slamTimer=0;updateEncounters(0);updateMakerEffects(1.1);UPGRADE_TUNING.perfectWindow=.05;activateDash();tick(.05);tick(.05)');
assert.equal(run('state.player.health'),90);assert.equal(run('state.slowMotion'),0);assert.equal(run('state.enemyHazards.length'),0);
console.log('PASS: ordinary dash protects the slam impact at the tick boundary without a perfect dodge');
