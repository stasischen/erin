const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs'),fs=require('node:fs');
const run=createRun();
function fresh(weapon='candy-sword') {
 run(`GAME_DATA.attackMode='manual';resetGame();state.mode='playing';settingsPanel.hidden=true;state.weaponId='${weapon}';state.spawnTimer=999;state.eliteTimer=999;state.bearSpawned=true;state.shotTimer=0;state.player.damageDisabled=true;state.player.x=400;state.player.y=300;updateCamera();state.enemies=[];`);
}
fresh();run('for(let i=0;i<30;i++)tick(.05)');
assert.equal(run('state.swingCount'),0);assert.equal(run('state.weaponAttack.charge'),0);
run('beginManualAttack("attack");for(let i=0;i<20;i++)tick(.05)');
assert.equal(run('state.weaponAttack.charge'),1);assert.equal(run('state.swingCount'),0);
run('manualHolds.attack.angle=Math.PI/2;releaseManualAttack("attack")');
assert.equal(run('state.swingCount'),1);assert.equal(run('state.lastWeaponAttack.charged'),true);
assert.equal(run('state.vfx.at(-1).angle'),Math.PI/2);assert.equal(run('state.vfx.at(-1).thrust'),true);
// Empty swings still consume charge and advance the combo; no attack after cancellation.
fresh();run('beginManualAttack("attack");releaseManualAttack("attack");tickManualAttack(.13);beginManualAttack("attack");releaseManualAttack("attack")');
assert.equal(run('state.lastWeaponAttack.number'),2);
run('beginManualAttack("attack");tickManualAttack(.5);cancelManualAttack();releaseManualAttack("attack")');assert.equal(run('state.swingCount'),2);assert.equal(run('state.weaponAttack.charge'),0);
run('beginManualAttack("attack");showOverlay("paused");releaseManualAttack("attack")');assert.equal(run('state.swingCount'),2);
// Actual independent pointer identities: wrong finger cannot release/aim an attack.
fresh();
run(`manualButtons.attack.listeners.pointerdown({preventDefault(){},stopPropagation(){},pointerId:7,clientX:700,clientY:300});manualButtons.attack.listeners.pointermove({preventDefault(){},pointerId:8,clientX:700,clientY:400});manualButtons.attack.listeners.pointerup({preventDefault(){},pointerId:8});`);
assert.equal(run('manualHolds.attack.pointerId'),7);assert.equal(run('manualHolds.attack.angle'),null);
run(`manualButtons.attack.listeners.pointermove({preventDefault(){},pointerId:7,clientX:700,clientY:400});manualButtons.attack.listeners.pointerup({preventDefault(){},pointerId:7});`);
assert.equal(run('state.lastAttackInput.angle'),Math.PI/2);
// Dash key is a second input: first press during dash is immediate and never repeats on release/end.
fresh();run('activateDash();beginManualAttack("attack");releaseManualAttack("attack")');assert.equal(run('state.swingCount'),1);assert.equal(run('state.lastAttackInput.dash'),true);
run('for(let i=0;i<8;i++)tick(.05)');assert.equal(run('state.swingCount'),1);
// Each special has its own cooldown; all are directional, held specials do not fire early.
for(const weapon of ['water-ball','candy-sword','candy-hammer']) {
 fresh(weapon);run('beginManualAttack("special");tickManualAttack(.5)');assert.equal(run('state.projectiles.length'),0);assert.equal(run('state.specialCooldown'),0);
 run('manualHolds.special.angle=0;releaseManualAttack("special")');assert.equal(run('state.specialCooldown'),6);
 const expected=weapon==='water-ball'?5:weapon==='candy-sword'?1:0;
 assert.equal(run('state.projectiles.length'),expected);
 if(weapon==='candy-hammer') {
  run(`state.enemies=[{x:state.player.x+130,y:state.player.y,r:5,hp:10000,maxHp:10000,alive:true},{x:state.player.x-100,y:state.player.y,r:5,hp:10000,maxHp:10000,alive:true}];tickManualAttack(.25)`);
  assert.ok(run('state.enemies[0].hp')<10000);assert.equal(run('state.enemies[1].hp'),10000);assert.equal(run('state.manualLeap'),null);
 } else assert.equal(run('state.projectiles.every(s=>s.vx>0)'),true);
 run('beginManualAttack("special");releaseManualAttack("special")');assert.equal(run('state.projectiles.length'),expected);
 run('resetGame()');assert.equal(run('state.specialCooldown'),0);
}
// Charged attacks stay forward even with the rear-shot upgrade.
for(const weapon of ['water-ball','candy-hammer']) {
 fresh(weapon);run('state.upgrades["item-rear"]=1;beginManualAttack("attack");tickManualAttack(1);manualHolds.attack.angle=0;releaseManualAttack("attack")');
 if(weapon==='water-ball')assert.equal(run('state.projectiles.every(s=>s.vx>0)'),true);
 else assert.equal(run('state.vfx.filter(v=>v.kind==="hammer-swing").length'),1);
}
// Old works default to auto, unknown values fail, saved manual works survive validation.
assert.equal(run('(()=>{const d=SurvivorData.defaults();delete d.attackMode;return SurvivorData.validate(d).data.attackMode})()'),'auto');
assert.equal(run('(()=>{const d=SurvivorData.defaults();d.attackMode="manual";return SurvivorData.validate(d).data.attackMode})()'),'manual');
assert.equal(run('(()=>{const d=SurvivorData.defaults();d.attackMode="unknown";return SurvivorData.validate(d).valid})()'),false);
// Real practice loads manual data and attacks only on an explicit release.
run('globalThis.frameElement={}');run(fs.readFileSync(`${__dirname}/../practice-rules.js`,'utf8'));run(fs.readFileSync(`${__dirname}/../practice-engine.js`,'utf8'));
run('GAME_DATA.attackMode="manual";practiceId="candy-sword";practiceReset();for(let i=0;i<20;i++)practiceStep(.05)');assert.equal(run('state.swingCount'),0);
run('beginManualAttack("attack");releaseManualAttack("attack")');assert.equal(run('state.swingCount'),1);
console.log('PASS: manual idle, hold/release, direction, empty combo, cancellation/pause, independent pointers, dash press/end, three specials/cooldown, Maker migration and real practice');
