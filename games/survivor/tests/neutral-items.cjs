// 固定輸入 → 預期狀態／事件，以及正式引擎的接合。
const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')();
const val=s=>JSON.parse(run(`JSON.stringify(${s})`));
function fresh(ids=[]) {run(`resetGame();state.mode='playing';settingsPanel.hidden=true;state.spawnTimer=999;state.shotTimer=999;state.upgrades=Object.fromEntries(${JSON.stringify(ids)}.map(id=>['item-'+id,1]));globalThis.book=(dx=60,hp=10000)=>({typeId:'jaben',x:state.player.x+dx,y:state.player.y,r:17,speed:0,damage:0,hp,maxHp:hp,alive:true,wobble:0,flash:0,shotCooldown:999});state.enemies=[book()];`);}
fresh();assert.equal(run('SurvivorData.validate(SurvivorData.defaults()).valid'),true);
// All ten items have a chance in every run; fixed five unique items survive rerolls.
const seen=new Set();for(let i=0;i<150;i++) {run('state.schoolRun=SurvivorSchools.createRun(GAME_DATA,Array.from({length:64},()=>Math.random()));');const pool=val('state.schoolRun.neutralPool');assert.equal(pool.length,5);assert.equal(new Set(pool).size,5);pool.forEach(id=>seen.add(id));assert.equal(run('UPGRADES.filter(c=>c.neutral&&canOffer(c)).length'),5);run('globalThis.old=JSON.stringify(state.schoolRun);chooseUpgradeCards();rerollUpgradeCards();');assert.equal(run('JSON.stringify(state.schoolRun)'),run('old'));}assert.equal(seen.size,10);
// Neutral cards never count toward transformations, fusion or starter bias.
fresh(['wall','candy','bird','crown','cookie']);assert.deepEqual(val('SurvivorSchools.counts(UPGRADES,state.upgrades)'),{});assert.equal(run('buildAppearance().forms.length'),0);
// Pure death/drop boundary, cookie threshold, bank cap, supplied corner bounce.
run('globalThis.r=GAME_DATA.neutralRules');
assert.deepEqual(val(`SurvivorNeutral.reward({kills:19,gems:9},'death',{cookie:true,candy:true},r,.099).events`),[{type:'heal',amount:1},{type:'bomb-dropped'}]);
assert.deepEqual(val(`SurvivorNeutral.reward({kills:0,gems:0},'death',{candy:true},r,.1).events`),[]);
assert.equal(run('SurvivorNeutral.damage(9999,{bank:true,crown:true},r)'),1.3*1.3);
// Rear shot keeps the same appearance; the replaced item never bounces at screen edges.
fresh(['wall','rear']);run('fireAtNearest();');assert.equal(run('state.projectiles.length'),2);assert.ok(run('state.projectiles[0].vx*state.projectiles[1].vx<0'));
// Actual projectile kill splits two children once, including a penetrating parent.
fresh(['split']);run('state.enemies=[book(35,1)];fireAtNearest();tick(.05);');assert.equal(run('state.projectiles.filter(s=>s.alive).length'),2);assert.equal(run('state.projectiles.every(s=>s.fragment)'),true);run('splitNeutralShot(state.projectiles[0]);');assert.equal(run('state.projectiles.length'),2);
fresh(['wall','rear','split']);run('for(let i=0;i<200;i++)fireAtNearest();');assert.ok(run('state.projectiles.length<=PROJECTILE_LIMIT'));
// Kills have one settlement. Bombs have a fuse and cap; no offscreen damage.
fresh(['candy','cookie']);run('Math.random=()=>0;state.neutral.kills=19;state.player.health=10;state.enemies=[book(60,1),book(70),book(1400)];damageEnemy(state.enemies[0],2);damageEnemy(state.enemies[0],2);');assert.equal(run('state.neutral.kills'),20);assert.equal(run('state.player.health'),11);assert.equal(run('state.neutral.bombs.length'),1);
run('updateNeutralItems(.3)');assert.equal(run('state.enemies[1].hp'),10000);run('updateNeutralItems(.3)');assert.equal(run('state.enemies[1].hp'),9955);assert.equal(run('state.enemies[2].hp'),10000);
run('for(let i=0;i<100;i++)neutralEvent("death",state.player.x,state.player.y)');assert.equal(run('state.neutral.bombs.length'),12);
// Bird attacks nearby visible targets; bank counts spheres, including elite spheres, not XP value.
fresh(['bird']);run('updateNeutralItems(.05);');assert.equal(run('state.enemies[0].hp'),9980);run('updateNeutralItems(.05);');assert.equal(run('state.enemies[0].hp'),9980);
fresh(['bank']);run('for(let i=0;i<10;i++)neutralEvent("pickup",0,0);damageEnemy(state.enemies[0],100);');assert.equal(run('state.enemies[0].hp'),9899);
// Magnet actually pulls beyond ordinary range; crown applies to all damage and clamps health on acquisition.
fresh(['magnet']);run('state.gems=[{x:state.player.x+GEM_PULL_RADIUS*1.8,y:state.player.y,r:8,value:1,alive:true,wobble:0}];globalThis.gx=state.gems[0].x;tick(.05);');assert.ok(run('state.gems[0].x<gx'));
fresh();run('state.player.health=PLAYER_HEALTH;state.schoolRun.neutralPool.push("item-crown");state.mode="levelup";state.pendingChoices=[UPGRADES.find(c=>c.id==="item-crown")];applyUpgrade(0);damageEnemy(state.enemies[0],100);');assert.equal(run('maxPlayerHealth()'),89);assert.equal(run('state.player.health'),89);assert.equal(run('state.enemies[0].hp'),9870);
// Lucky clover: one immediate reroll; increased rare probability with identical supplied draw.
fresh();run('state.schoolRun.neutralPool.push("item-clover");state.mode="levelup";state.pendingChoices=[UPGRADES.find(c=>c.id==="item-clover")];globalThis.quota=state.rerollsRemaining;applyUpgrade(0);');assert.equal(run('state.rerollsRemaining'),run('quota+1'));run('neutralEvent("acquire",0,0,"item-bank")');assert.equal(run('state.rerollsRemaining'),run('quota+1'));
assert.equal(run(`SurvivorSchools.pick([{id:'a',rarity:'common'},{id:'b',rarity:'rare'}],{},null,{...GAME_DATA.schoolRules,rareWeight:.5},[.6])[0].id`),'a');assert.equal(run(`SurvivorSchools.pick([{id:'a',rarity:'common'},{id:'b',rarity:'rare'}],{},null,{...GAME_DATA.schoolRules,rareWeight:.8},[.6])[0].id`),'b');
// Counter progress + quota + pool persist across stages, clear on restart; pause freezes.
fresh(['bank','cookie']);run('state.neutral.gems=29;state.neutral.kills=19;state.rerollsRemaining=1;globalThis.pool=JSON.stringify(state.schoolRun);finishRun(true);');assert.equal(run('state.neutral.gems'),29);assert.equal(run('state.neutral.kills'),19);assert.equal(run('state.rerollsRemaining'),1);assert.equal(run('JSON.stringify(state.schoolRun)'),run('pool'));run('state.mode="paused";tick(1)');assert.equal(run('state.neutral.kills'),19);run('resetGame()');assert.equal(run('state.neutral.gems+state.neutral.kills+state.neutral.bombs.length'),0);
// Old Maker works migrate by id; bounded settings and neutral identity survive edits.
run('globalThis.d=SurvivorData.defaults();delete d.neutralRules;d.cards=d.cards.filter(c=>!c.neutral);d.cards[0].name="我的球";globalThis.m=SurvivorData.validate(d)');assert.equal(run('m.valid'),true);assert.equal(run('m.data.cards.length'),49);assert.equal(run('m.data.cards[0].name'),'我的球');
for(const expr of ['d.neutralRules.bombChance=NaN','d.neutralRules.itemsPerRun=10','d.neutralRules.cookieKills=5.5','d.cards[39].school="water"'])assert.equal(run(`(()=>{const d=SurvivorData.defaults();${expr};return SurvivorData.validate(d).valid})()`),false,expr);
// Every new preview uses real engine and loops without throwing; neutral VFX appear.
for(const id of ['wall','candy','bird','bank','split','magnet','crown','clover','rear','cookie']) {
 const data=JSON.parse(run('JSON.stringify(SurvivorData.defaults())'));
 const preview=require('./maker-support.cjs')({preview:{data,spec:{kind:'card',id:'item-'+id,level:1}}});
 preview('for(let i=0;i<130;i++)stepPreview(.05);');assert.ok(preview('drawCalls.length>0'),id);
}
console.log('PASS: ten neutral items, fixed sampled pool, pure reward/damage rules, all live effects, limits, stages/pause/reset, Maker migration/bounds, ten real previews');
