const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const createRun=require('./maker-support.cjs');
const run=createRun(), plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
assert.equal(run('SurvivorArt.validate(SurvivorArtManifest)'),true);
assert.equal(run("SurvivorArt.lookup('__proto__')"),null);
const data=plain('SurvivorArtManifest');
for(const [id,a] of Object.entries(data.assets)) {
  if(id==='character/gatekeeper') {assert.equal(a.sheet,'art/characters/gatekeeper.png');assert.ok(fs.existsSync(path.join(__dirname,'..',a.sheet)));}
  else assert.equal(a.sheet,null);
  const d=plain(`SurvivorArt.lookup(${JSON.stringify(id)},'run',99)`);
  assert.equal(d.frame,0);assert.deepEqual(d.frameSize,a.frameSize);
}
run(`globalThis.testArt=JSON.parse(JSON.stringify(SurvivorArtManifest));
 testArt.assets['character/player'].animations.active={frames:[2,4,6],fps:10,loop:false};`);
for(const [time,frame] of [[-1,2],[0,2],[.1,4],[.2,6],[999,6]])
 assert.equal(run(`SurvivorArt.lookup('character/player','active',${time},testArt).frame`),frame);
run("testArt.assets['character/player'].animations.active.loop=true");
assert.equal(run("SurvivorArt.lookup('character/player','active',.3,testArt).frame"),2);
assert.equal(run("SurvivorArt.lookup('character/player','bogus',0,testArt).animation"),'idle');
run("testArt.assets['character/player'].sheet='../bad.png'");
assert.equal(run('SurvivorArt.validate(testArt)'),false);
run("testArt.assets['character/player'].sheet='art/characters/player.png'");
assert.equal(run('SurvivorArt.validate(testArt)'),true);
run("SurvivorArt.lookup('character/player').pivot[0]=999");
assert.equal(run("SurvivorArt.lookup('character/player').pivot[0]"),.5);
// A real adapter load, row-major crop, pivot placement, cache, missing-frame fallback.
run(`globalThis.loads=[];globalThis.Image=class {constructor(){loads.push(this);}};
 SurvivorArtManifest.assets['projectile/water'].sheet='art/effects/water.png';
 SurvivorArtManifest.assets['projectile/water'].animations.active={frames:[3],fps:1,loop:false};`);
assert.equal(run("SurvivorArt.picture('projectile/water','active')"),null);
run('loads[0].width=32;loads[0].height=32;loads[0].onload();drawCalls.length=0');
assert.equal(run("SurvivorArt.picture('projectile/water','active').width"),16);
assert.deepEqual(plain('drawCalls[0].slice(2)'),[16,16,16,16,0,0,16,16]);
assert.equal(run("SurvivorArt.picture('projectile/water','active')===SurvivorArt.picture('projectile/water','active')"),true);
run("SurvivorArtManifest.assets['projectile/water'].pivot=[.25,.75]");
assert.deepEqual(plain("SurvivorArt.bounds('projectile/water',10,20,40,40)"),[20,10,40,40]);
run("SurvivorArtManifest.assets['projectile/water'].animations.active.frames=[99]");
assert.equal(run("SurvivorArt.picture('projectile/water','active')"),null);
run("SurvivorArtManifest.assets['projectile/water'].sheet=null");
// Fixed pre-refactor Canvas command hashes and battle results: no screenshots / DOM needed.
const scenarios=[
  'drawHero();drawBlob(30,40,17,"red",.2,false);drawClassroom()',
  'state.player.moving=true;state.player.walkPhase=.7;state.player.invincible=1;drawHero()',
  'drawBolt(20,30,100,80);drawSwirl(50,60,30,.4);drawGroundShadow(10,20,17,35)',
  `state.vfx=[{kind:'gust',x:30,y:40,x2:100,y2:70,life:.3,maxLife:.6,color:'blue'},{kind:'sparkle',x:20,y:30,radius:40,life:.3,maxLife:.6,color:'pink'}];drawSkillVisuals()`,
  `drawHammerSwing({x:20,y:30,angle:.3,arc:2,radius:70,colors:['water'],heavy:true},.4)`,
  `state.projectiles=[{x:30,y:40,r:8,alive:true,colors:['wind','thunder'],vx:40,vy:10,piercing:true,charged:true}];state.gems=[{x:30,y:50,wobble:.3}];state.effects=[{kind:'water-hit',x:25,y:35,life:.2,maxLife:.4,text:'1',color:'blue'}];render()`
];
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Normalize battle numbers to six decimals before hashing; Math.sin/cos tails vary by runtime.
// Canvas command hashes remain exact. This is a test-only comparison policy.
const battleHash=value=>hash(JSON.parse(JSON.stringify(value,(_key,item)=>
 typeof item==='number'?Number(item.toFixed(6)):item)));
assert.equal(battleHash({shots:[[-110.82700212995589]]}),battleHash({shots:[[-110.8270021299559]]}));
assert.notEqual(battleHash({shots:[[-110.827002]]}),battleHash({shots:[[-110.827004]]}));
function snapshots(r) {
 return scenarios.map(code=>{
  r("state.width=800;state.height=600;resetGame();state.mode='playing';state.elapsed=.5;Math.random=()=>.5;"+code);
  r('drawCalls.length=0');r(code);
  return hash(JSON.parse(r('JSON.stringify(drawCalls)')));
 });
}
const fixture=path.join(__dirname,'art-baseline.json');
const expected=JSON.parse(fs.readFileSync(fixture));
assert.deepEqual(snapshots(createRun()),expected.canvas);
assert.equal(expected.battleNumberDecimals,6);
assert.equal(battleHash(require('./maker-traces.cjs')(createRun())),expected.battle);
// Visual frame selection cannot enter an active damage phase or emit a hit.
run("globalThis.before=JSON.stringify(SurvivorTiming.advance({phase:'windup',left:.5},{windup:.5,active:.2,recovery:.3,cooldown:1},.1));testArt.assets['character/player'].animations.active.fps=999");
run("SurvivorArt.lookup('character/player','active',99,testArt)");
assert.equal(run("JSON.stringify(SurvivorTiming.advance({phase:'windup',left:.5},{windup:.5,active:.2,recovery:.3,cooldown:1},.1))===before"),true);
console.log('PASS: art schema / pure frame selection, load / crop / pivot / fallback, pre-refactor Canvas snapshots and 153 battle traces; timing independent of animation');
