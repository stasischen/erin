// 固定輸入 → 世界視野／招式／追擊與時間邊界，不依賴裝置 DOM。
const assert=require('node:assert/strict'),run=require('./maker-support.cjs')();
const json=code=>JSON.parse(run('JSON.stringify('+code+')'));
for(const [w,h] of [[740,360],[844,390],[1024,768],[1180,820]]) {
 run(`globalThis.v=worldViewport(${w},${h})`);
 assert.ok(Math.abs(run('v.width*v.height')-320000)<1e-7);
 assert.ok(run('v.width*v.height>=320000*.75 && v.width*v.height<=320000*1.25'));
 assert.equal(run('v.viewLeft'),0);assert.equal(run('v.viewTop'),0);
 assert.ok(Math.abs(run('v.width*v.zoom-v.screenWidth'))<1e-7);
 assert.ok(Math.abs(run('v.height*v.zoom-v.screenHeight'))<1e-7);
 if(w===740) {
  // #89 之前為 1:1；兩個方向及總面積均不可變小。
  assert.ok(run('v.width>=740 && v.height>=360 && v.width*v.height>=740*360'));
 }
 run(`canvas.clientWidth=${w};canvas.clientHeight=${h};canvas.getBoundingClientRect=()=>({left:20,top:30,right:${w}+20,width:${w},height:${h}});window.innerWidth=${w};window.innerHeight=${h};resize();`);
 const before=json('[state.worldWidth,state.worldHeight]');
 assert.equal(run('ctx.imageSmoothingEnabled'),false);
 assert.equal(run('state.screenWidth'),w);assert.equal(run('state.screenHeight'),h);
 // CSS point at player center, then 100 world units to the right.
 assert.ok(Math.abs(run('canvasPoint({clientX:20+state.viewLeft+(state.width/2+100)*state.zoom,clientY:30+state.viewTop+state.height/2*state.zoom}).x-state.width/2')-100)<1e-7);
 // 任意方向與四角皆能從螢幕座標還原世界座標。
 for(const [fx,fy] of [[0,0],[1,0],[0,1],[1,1],[.25,.75]]) {
  run(`globalThis.aim=canvasPoint({clientX:20+${w}*${fx},clientY:30+${h}*${fy}})`);
  assert.ok(Math.abs(run('aim.x')-run('state.width')*fx)<1e-7);
  assert.ok(Math.abs(run('aim.y')-run('state.height')*fy)<1e-7);
 }
 run('resetGame();state.mode="playing";summonTeacher();state.bossIntro=0;');
 assert.equal(run('state.bossZone.radius'),600);
 assert.deepEqual(json('[state.worldWidth,state.worldHeight]'),before);
}
for(const [distance,visible,kinds] of [[100,true,['rain','call','ring','cage','leap','tracking']],[350,true,['words','chalk','barriers','dash','combo','summon']],[900,true,['leap','sniper']],[100,false,['leap','sniper']]]) {
 const choices=json(`teacherChoices(BOSS_MOVES,3,${distance},${visible},GAME_DATA.boss.combat)`);
 assert.ok(choices.length>0 && choices.every(m=>kinds.includes(m.kind)));
}
assert.ok(Math.abs(run('teacherHealth(2000,1.12,8,350)')-5376)<1e-7);
function fresh() {run(`resetGame();state.mode='playing';state.player.damageDisabled=true;state.spawnTimer=999;state.shotTimer=999;summonTeacher();state.bossIntro=0;state.bossRest=999;state.boss.x=state.player.x-150;state.boss.y=state.player.y;updateCamera();`);}
function step(t) {run(`for(let i=0;i<${Math.round(t/.05)};i++)updateBoss(.05)`);}
fresh();run('state.boss.x=state.player.x-1000;globalThis.old=state.boss.x;updateBoss(.1)');assert.equal(run('state.boss.pursuing'),true);assert.ok(Math.abs(run('deltaX(state.boss.x,old)')-14)<1e-6);
run('state.bossRest=0;updateBoss(0)');assert.ok(run("state.bossMoves.length===1 && ['leap','sniper'].includes(state.bossMoves[0].kind)"));
// 跳躍鎖定當下落點；空中弧線、落地後留 0.8 秒反擊。
fresh();run("beginBossMove('podium-leap');globalThis.m=state.bossMoves[0];globalThis.end=m.endX;state.player.x+=250");step(.95);assert.equal(run('m.active'),false);step(.4);assert.ok(run('bossAirHeight()>0'));step(.4);assert.ok(run('m.recovery>0'));assert.ok(Math.abs(run('deltaX(state.boss.x,end)'))<1e-6);step(.8);assert.equal(run('state.bossMoves.length'),0);
// 狙擊瞄準隨主角變，預警完鎖定、單發高速粉筆。
fresh();run("beginBossMove('chalk-snipe');state.player.y+=90;updateBoss(.4);globalThis.a=state.bossMoves[0].angle");assert.ok(run('a>0'));step(.4);assert.equal(run('state.enemyShots.length'),1);assert.ok(Math.abs(run('Math.hypot(state.enemyShots[0].vx,state.enemyShots[0].vy)')-420)<1e-7);
// 點名先跟隨一秒，再給半秒固定落點；最後一幀不能繼續追蹤。
fresh();run("state.bossPhase=3;state.boss.hp=state.boss.maxHp*.2;beginBossMove('tracking-call');state.player.x+=10");step(.5);const locked=run('state.bossMoves[0].points[0].x');step(.5);run('state.player.x+=100');step(.45);assert.equal(run('state.bossMoves[0].active'),false);assert.equal(run('state.bossMoves[0].points[0].x'),locked);step(.05);assert.equal(run('state.bossMoves[0].active'),true);
// 連衝重新瞄準，保留至少 .6 秒預警；第二階段兩次。
fresh();run("state.bossPhase=2;state.boss.hp=state.boss.maxHp*.5;beginBossMove('eraser-combo');globalThis.first=state.bossMoves[0].angle");step(.6);run('state.player.y+=120');run('for(let i=0;i<100 && state.bossMoves[0].repeats===2;i++)updateBoss(.05)');assert.equal(run('state.bossMoves[0].active'),false);assert.equal(run('state.bossMoves[0].warning'),.6);assert.notEqual(run('state.bossMoves[0].angle'),run('first'));step(.55);assert.equal(run('state.bossMoves[0].active'),false);step(.05);assert.equal(run('state.bossMoves[0].active'),true);run('for(let i=0;i<100 && state.bossMoves.length;i++)updateBoss(.05)');assert.equal(run('state.bossMoves.length'),0);
// 兩側短牆保留上下出口，三秒後收掉。
fresh();run("beginBossMove('board-barriers')");step(1);run('state.player.x=state.bossMoves[0].x+state.bossMoves[0].wallWidth;updateBoss(.05)');assert.ok(run('Math.abs(deltaX(state.player.x,state.bossMoves[0].x+state.bossMoves[0].wallWidth))>=state.player.r+8'));step(3);assert.equal(run('state.bossMoves.length'),0);
// 落地命中只扣一次、造成擊退；躲開鎖定落點與衝刺保護皆有效。
for(const protect of ['none','dodge','dash']) {
 fresh();run("state.player.damageDisabled=false;beginBossMove('podium-leap');globalThis.startX=state.player.x");
 if(protect==='dodge')run('state.player.y+=180');
 step(1);assert.equal(run('state.player.health'),90);
 if(protect==='dash')run('state.player.invincible=1');
 step(.7);
 assert.equal(run('state.player.health'),protect==='none'?78:90);
 if(protect==='none'){run('updateTargetSlide(state.player,.25)');assert.ok(Math.abs(run('deltaX(state.player.x,startX)')-60)<1e-7);}
 step(.4);assert.equal(run('state.player.health'),protect==='none'?78:90);
}
// 新欄位皆可安全存取；舊作品缺省遷移，新招也保留統一五積木。
run('globalThis.d=SurvivorData.defaults();delete d.boss.combat;d.boss.phases.forEach(p=>delete p.speed);d.boss.moves=d.boss.moves.slice(0,9);globalThis.result=SurvivorData.validate(d)');assert.equal(run('result.valid'),true);assert.equal(run('result.data.boss.moves.length'),14);
for(const expr of ['d.boss.combat.healthPerUpgrade=Infinity','d.boss.phases[2].speed=999','d.bossZone.finalRadius=0'])assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expr};return SurvivorData.validate(d).valid})()`),false);
console.log('PASS: four equal-area/fullscreen viewports, phone minimum view, world aim, fixed map/zone, pure distance choices/scaled health, offscreen pursuit, five new moves/time boundaries, legacy migration/bounds');
