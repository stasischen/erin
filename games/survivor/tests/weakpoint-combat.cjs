// 真實傷害接合：相同Boss/來源方向跨投射物、爆炸、場、連鎖、Maker範圍。
const assert=require('node:assert/strict'),run=require('./maker-support.cjs')();
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function fresh(){run(`GAME_DATA.hitJuice.enabled=false;startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0;state.bossPhasePause=0;
 state.boss.x=state.player.x+70;state.boss.y=state.player.y;state.boss.facingAngle=0;state.bossRest=999;state.player.damageDisabled=true;
 state.bossMoves=[{id:'shield',kind:'shield',angle:0,ai:{phase:'windup',left:2},origin:{x:0,y:0},target:{x:0,y:0}}];
 state.boss.weakpoints={back:{phase:'open',left:1,matched:true},core:{phase:'closed',left:0,matched:false}};state.spawnTimer=999;state.shotTimer=999;globalThis.b=state.boss;`);}
for(const [side,multiplier] of [[1,.2],[-1,3]]){
 fresh();run(`state.weaponId='water-ball';fireAtNearest({angle:0});globalThis.shot=state.projectiles[0];shot.x=b.x;shot.y=b.y;shot.vx=${-side*10};shot.vy=0;shot.damage=100;shot.autoCharged=false;globalThis.hp=b.hp;tick(0)`);close(run('hp-b.hp'),100*multiplier);
 fresh();run(`state.bomb={x:b.x+${side*40},y:b.y,timer:0,delay:.1,radius:100,damage:100,knockback:0,schools:[]};globalThis.hp=b.hp;updateBomb(0)`);close(run('hp-b.hp'),100*multiplier);
 fresh();run(`state.fields=[{school:'water',x:b.x+${side*40},y:b.y,radius:100,life:1,timer:0}];state.upgrades={'water-skill':1};
 globalThis.damage=cardBlock('water-skill','onFieldTick',{level:1}).actions[0].amount;globalThis.hp=b.hp;updateFields(0)`);close(run('hp-b.hp'),run('damage')*multiplier);
 fresh();run(`state.upgrades={'thunder-attack':1};globalThis.from={x:b.x+${side*40},y:b.y};globalThis.damage=100*cardBlock('thunder-attack','onChain').actions[0].multiplier;globalThis.hp=b.hp;schoolEffect('thunder',from,from.x,from.y,100)`);close(run('hp-b.hp'),run('damage')*multiplier);
 fresh();run(`globalThis.hp=b.hp;executeMakerEffect({type:'aoe',radius:100,damage:100},b.x+${side*40},b.y,1)`);close(run('hp-b.hp'),100*multiplier);
}
// 新護甲下原50HP不會被100傷害炸彈秒殺；20HP才進原擊倒入口。
for(const [health,expected,mode] of [[50,30,'playing'],[20,0,'trial-menu']]){
 fresh();run(`b.weakpoints={};b.hp=${health};state.bomb={x:b.x+40,y:b.y,timer:0,radius:100,damage:100,knockback:0,schools:[]};updateBomb(0)`);close(run('b.hp'),expected);assert.equal(run('state.mode'),mode);
}
// 各種範圍／投射物的charged標誌均不再乘上舊架勢3倍；已開部位只有一次3倍。
fresh();run("b.posture={value:0,stun:2};b.weakpoints.core={phase:'open',left:1};globalThis.hp=b.hp;hitBuildTarget(b,100,{charged:true})");close(run('hp-b.hp'),300);
// 金屬小回饋在同批次不被後來的水聲／一般hit覆蓋，弱點的大回饋優先。
fresh();run(`GAME_DATA.hitJuice.enabled=true;GAME_DATA.hitJuice.intensity=1;globalThis.sounds=[];playSound=id=>sounds.push(id);
 b.weakpoints={};withImpactBatch(()=>{hitBuildTarget(b,10);queueImpact(0,'water',-1);damageHitSound();});`);
assert.equal(run('sounds.at(-1)'),'metal');assert.equal(run('b.feedbackNumberScale'),1);
run(`b.weakpoints.core={phase:'open',left:1};withImpactBatch(()=>{hitBuildTarget(b,10);queueImpact(0,'water',-1);});`);
assert.equal(run('sounds.at(-1)'),'posture');assert.equal(run('b.feedbackNumberScale'),1.7);
// 真正衝鋒撞牆會觸發核心，普通暈眩不冒充撞牆。
fresh();run(`b.weakpoints={};state.player.x=b.x+70;b.x=state.trial.arena.x+state.trial.arena.radius-b.r-1;b.y=state.trial.arena.y;
 state.bossMoves=[{id:'charge',kind:'charge',ai:{phase:'active',left:1},angle:0,origin:{x:b.x,y:b.y},target:{x:b.x+70,y:b.y}}];updateTrial(.05);updateBossWeakpoints(.15)`);
assert.equal(run('state.bossMoves.length'),0);assert.equal(run('b.weakpoints.core.phase'),'open');
// 未掛積木的Boss、普通怪物沿用舊傷害，未新增弱點狀態。
run("startTrial('winged');state.trial.entry=0;state.bossIntro=0;globalThis.b=trialBodies()[0];b.x=state.player.x+50;b.y=state.player.y;globalThis.hp=b.hp;hitBuildTarget(b,100)");close(run('hp-b.hp'),100);assert.equal(run('b.weakpoints'),undefined);
console.log('PASS: real projectile / bomb / field / chain / Maker sources, 20% armor vs back3x, armored bomb survival/death, no9x, metal/small and critical/large impact priority, real wall trigger and unconfigured Boss');
