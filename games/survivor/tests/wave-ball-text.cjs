const assert=require('node:assert/strict'),create=require('./maker-support.cjs'),run=create();
const val=s=>JSON.parse(run(`JSON.stringify(${s})`));
function fresh(weapon='water-ball') {run(`resetGame();state.mode='playing';state.weaponId='${weapon}';state.spawnTimer=999;state.shotTimer=999;state.upgrades={'item-wall':1};globalThis.book=(dx,dy=0,hp=1000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y+dy,r:8,speed:0,damage:0,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});state.enemies=[book(50),book(95)];`);}
// Swept path catches targets passed in one push, ignores targets behind or to the side.
assert.equal(run('SurvivorNeutral.collision(55,0,8,[{x:40,y:0,r:8}])'),0);
for(const [x,y] of [[-20,0],[40,40],[90,0]])assert.equal(run(`SurvivorNeutral.collision(55,0,8,[{x:${x},y:${y},r:8}])`),-1);
fresh();run('waveNeutralHit(state.enemies[0],1,0);updateTargetSlide(state.enemies[0],.25)');assert.deepEqual(val('state.enemies.map(e=>e.hp)'),[982,982]);assert.equal(run('state.enemies[0].x-state.player.x'),79);
run('state.enemies[0].x=state.player.x+50;waveNeutralHit(state.enemies[0],1,0);updateTargetSlide(state.enemies[0],.25)');assert.deepEqual(val('state.enemies.map(e=>e.hp)'),[982,982]);
run('state.elapsed=.6;state.enemies[0].x=state.player.x+50;waveNeutralHit(state.enemies[0],1,0);updateTargetSlide(state.enemies[0],.25)');assert.deepEqual(val('state.enemies.map(e=>e.hp)'),[964,964]);
fresh();run('state.upgrades={};waveNeutralHit(state.enemies[0],1,0);updateTargetSlide(state.enemies[0],.25)');assert.equal(run('state.enemies[0].hp'),1000);assert.equal(run('state.enemies[0].x-state.player.x'),50);
// Real projectile and hammer integrations both push and cause collision damage.
fresh();run('fireAtNearest();for(let i=0;i<4;i++)tick(.05)');assert.ok(run('state.enemies[1].hp<1000'));
fresh('candy-hammer');run('fireAtNearest();updateTargetSlide(state.enemies[0],.25)');assert.ok(run('state.enemies[0].x-state.player.x>50'));assert.ok(run('state.enemies[1].hp<1000'));
// Offscreen targets cannot receive collision damage; lethal collision settles once.
fresh();run('state.enemies[1].x=state.player.x+2000;waveNeutralHit(state.enemies[0],1,0);updateTargetSlide(state.enemies[0],.25)');assert.equal(run('state.enemies[1].hp'),1000);
fresh();run("state.upgrades['item-cookie']=1;state.enemies.forEach(e=>e.hp=1);waveNeutralHit(state.enemies[0],1,0);updateTargetSlide(state.enemies[0],.25);waveNeutralHit(state.enemies[0],1,0)");assert.equal(run('state.neutral.kills'),2);
// Every card's data selects the appropriate description; missing melee data falls back.
for(const c of val('UPGRADES')) {
 assert.equal(run(`SurvivorWeapons.cardNote(UPGRADES.find(c=>c.id==='${c.id}'),GAME_DATA.weapons[0])`),c.description);
 assert.equal(run(`SurvivorWeapons.cardNote(UPGRADES.find(c=>c.id==='${c.id}'),GAME_DATA.weapons[1])`),c.descriptionMelee||c.description);
}
assert.equal(run("SurvivorWeapons.cardNote({description:'共用'},GAME_DATA.weapons[1])"),'共用');
for(const weapon of ['water-ball','candy-hammer']) {fresh(weapon);run("state.pendingChoices=[UPGRADES.find(c=>c.id==='big-water')];showUpgradeChoices()");assert.equal(run("document.getElementById('upgradeDescription').textContent"),weapon==='water-ball'?'水球更大、傷害更高':'揮擊範圍變大、傷害更高。');run("state.schoolRun.schools=['water'];renderSkillTree(document.getElementById('skillTree'))");assert.ok(run("document.getElementById('skillTree').innerHTML").includes(weapon==='water-ball'?'水球命中濺水花':'揮錘命中濺水花'));}
run("globalThis.d=SurvivorData.defaults();delete d.neutralRules.wavePush;delete d.neutralRules.waveDamage;delete d.neutralRules.waveCooldown;d.cards.find(c=>c.id==='item-wall').name='彈牆水球';d.cards.forEach(c=>delete c.descriptionMelee);globalThis.m=SurvivorData.validate(d)");assert.equal(run('m.valid'),true);assert.equal(run("m.data.cards.find(c=>c.id==='item-wall').name"),'浪花水球');assert.equal(run('m.data.neutralRules.wavePush'),55);
for(const expr of ["d.neutralRules.wavePush=121","d.neutralRules.waveCooldown=0","d.cards[0].descriptionMelee='<script>'"])assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expr};return SurvivorData.validate(d).valid})()`),false);
for(const weaponId of ['water-ball','candy-hammer']) {const p=create({preview:{data:val('SurvivorData.defaults()'),spec:{kind:'card',id:'item-wall',level:1,weaponId}}});p('for(let i=0;i<30;i++)stepPreview(.05)');assert.ok(p('state.enemies.some(e=>e.waveReady>0)'),weaponId);assert.equal(p('state.vfx.some(v=>v.kind==="lightning")'),false);}
console.log('PASS: swept wave collision, cooldown/death/visibility, both live weapons and previews, all card text/UI/tree, Maker migration/bounds');
