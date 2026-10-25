// 關卡連續性、換場清理、背景快取及真實擊退／拉近回位。
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun();
run(`startGame(); state.level=8;state.xp=3;state.upgrades={'water-attack':2};state.player.health=47;state.elapsed=150;
state.stageElapsed=150;state.keys.add('w');activateDash();activateSkill();summonTeacher();state.bossIntro=0;
state.boss.x=state.player.x+50;state.boss.y=state.player.y;state.boss.hp=1;hitBuildTarget(state.boss,10);`);
assert.equal(run('state.mode'),'transition');assert.equal(run('state.stageIndex'),1);
assert.equal(run('state.level'),8);assert.equal(run('state.xp'),3);assert.equal(run('upgradeLevel("water-attack")'),2);assert.equal(run('state.player.health'),47);
assert.equal(run('state.stageElapsed'),0);assert.equal(run('state.elapsed'),150);
assert.equal(run('state.boss===null && state.bomb===null && !state.enemies.length && !state.enemyShots.length && !state.bossMoves.length && !state.fields.length && !state.vfx.length && !state.keys.size && state.joy===null'),true);
run('activateSkill();activateDash();tick(1);render();');
assert.equal(run('state.stageTransition'),1);assert.equal(run('state.bomb'),null);
assert.ok(run('drawCalls.some(c=>c[0]==="fillText" && c[1]==="第2關：操場")'));
assert.equal(run('state.elapsed'),150);
run('tick(1);tick(.05)');assert.equal(run('state.mode'),'playing');assert.equal(run('state.boss'),null);
assert.equal(run('state.stageElapsed'),.05);
run('Math.random=()=>.99;spawnEnemy();');assert.equal(run('state.enemies[0].maxHp'),120*1.12);assert.equal(run('state.enemies[0].speed'),75*1.06);
run('state.stageElapsed=gameSettings.waveSeconds;tick(0);');assert.ok(run('state.boss'));assert.equal(run('state.boss.maxHp'),2000*1.12);
run('state.bossIntro=0;state.boss.x=state.player.x+50;state.boss.y=state.player.y;state.boss.hp=1;hitBuildTarget(state.boss,10);');assert.equal(run('state.mode'),'won');
run('resetGame();render();');assert.equal(run('currentStage().background'),'classroom');
assert.equal(run('Object.keys(BACKGROUND_TILES).sort().join(",")'),'classroom,playground');
run('globalThis.tiles=BACKGROUND_TILES;globalThis.classTile=backgroundTile("classroom");render();render();');assert.equal(run('backgroundTile("classroom")===classTile'),true);
const data=JSON.parse(run('JSON.stringify(GAME_DATA)'));
for(const distance of [50,-40]) {
 const custom=JSON.parse(JSON.stringify(data));custom.cards[0].effects=[{...run('SurvivorData.PARAMS'),type:'knockback',trigger:'skill',distance,radius:130}];
 const r=createRun({preview:{data:custom,spec:{kind:'effect',id:custom.cards[0].id,index:0}}});
 assert.equal(r('SurvivorData.validate(GAME_DATA).valid'),true);
 r('for(let i=0;i<5;i++)stepPreview(.05)');
 const shift=r('state.enemies[0].x-state.enemies[0].homeX');assert.ok(distance>0?shift>30:shift< -20,`位移 ${distance}: ${shift}`);
 r('for(let i=0;i<55;i++)stepPreview(.05)');assert.ok(Math.abs(r('state.enemies[0].x-state.enemies[0].homeX'))<.01);
}
const legacy=JSON.parse(JSON.stringify(data));delete legacy.stages;
run(`globalThis.oldData=${JSON.stringify(legacy)}`);assert.equal(run('SurvivorData.validate(oldData).valid'),true);assert.equal(run('SurvivorData.validate(oldData).data.stages.length'),2);
console.log('PASS: real boss kill → frozen transition → stronger second wave/boss → final victory; growth/health retained; attacks/input cleared; restart; two cached backgrounds; push/pull and smooth return; legacy Maker data');
