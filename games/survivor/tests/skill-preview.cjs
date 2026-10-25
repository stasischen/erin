const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const createRun=require('./maker-support.cjs');
const host=createRun(), data=JSON.parse(host('JSON.stringify(GAME_DATA)'));
const descriptions=vm.createContext({document:{currentScript:{src:'http://localhost/games/survivor/preview.js'}},URL});
vm.runInContext(fs.readFileSync(`${__dirname}/../preview.js`,'utf8'),descriptions);
const describe=spec=>descriptions.SurvivorPreview.describe(data,spec);
let count=0;
function scene(spec,custom=data){
 const before=host('JSON.stringify(state)'), storage=JSON.stringify(host.storage);
 host('globalThis.randomCalls=0; Math.random=()=>{randomCalls++;return .5;}');
 const run=createRun({preview:{data:JSON.parse(JSON.stringify(custom)),spec}});
 const effects=new Set();
 const counter=run('previewFeatures.includes("thunder-counter")');
 let wasHurt=false, hits=0, recoveries=0;
 assert.ok(run('PREVIEW_COMPOSITION.scale>=1.3 && PREVIEW_COMPOSITION.scale<=1.4'));
 assert.equal(run('state.player.invincible>0 || state.player.hitFlash>0'),false);

 for(let i=0;i<130;i++) {
  run('stepPreview(.05)');
  JSON.parse(run('JSON.stringify(state.vfx.map(v=>v.kind).concat(state.fields.map(f=>f.school),state.bossMoves.map(m=>m.kind)))')).forEach(x=>effects.add(x));
  assert.equal(run('state.mode'),'playing');
  const hurt=run('state.player.invincible>0 || state.player.hitFlash>0');
  if(!counter) assert.equal(hurt,false,`${spec.id}: 一般展示不受傷或閃爍`);
  if(hurt && !wasHurt) hits++;
  if(wasHurt && !hurt) recoveries++;
  wasHurt=hurt;
  if(spec.kind!=='move') assert.ok(run('state.enemies.every(e=>Math.hypot(e.x-state.player.x,e.y-state.player.y)>=PREVIEW_COMPOSITION.minDistance-.00001)'),`${spec.id}: 假怪保持三個主角寬`);

  assert.ok(run('state.enemies.length<=26 && state.projectiles.length<=24 && state.vfx.length<=48 && state.effects.length<=90 && state.bossMoves.length<=12'));
 }
 if(counter) {
  assert.equal(hits,3,'兩次重播共三輪，每輪只受傷一次');
  assert.equal(recoveries,2,'前兩輪受傷示範後均恢復');
 }
 assert.ok(run('drawCalls.length>0'));
 assert.equal(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number"||Number.isFinite(v)))'),true);
 assert.equal(run('previewRequest'),null,'offscreen scene has no scheduled frame');
 assert.equal(run('gameSettings.sound || gameSettings.vibration'),false);
 assert.equal(JSON.stringify(run.storage),'{}');
 assert.equal(host('JSON.stringify(state)'),before);assert.equal(JSON.stringify(host.storage),storage);assert.equal(host('randomCalls'),0);
 assert.ok(descriptions.SurvivorPreview.describe(custom,spec).length>=6);assert.ok(!/undefined|NaN/.test(descriptions.SurvivorPreview.describe(custom,spec)));
 count++;return {run,effects};
}
for(const card of data.cards) {
 const spec={kind:'card',id:card.id,level:1}, {run,effects}=scene(spec);
 if(card.id==='fusion-storm') assert.ok(effects.has('water') && effects.has('wind'));
 if(card.id==='fusion-puddle') assert.ok(effects.has('water') && effects.has('lightning'));
 if(card.id==='thunder-attack') assert.ok(effects.has('lightning'));
 if(card.id==='thunder-skill') assert.ok(effects.has('discharge'));
 card.effects.forEach((e,index)=>scene({kind:'effect',id:card.id,index}));
}
scene({kind:'card',id:'heal'});
const params=JSON.parse(host('JSON.stringify(SurvivorData.PARAMS)'));
for(const type of JSON.parse(host('JSON.stringify(Object.keys(SurvivorData.TYPES))'))) {
 const custom=JSON.parse(JSON.stringify(data));custom.cards[0].effects=[{...params,type,trigger:'skill'}];
 scene({kind:'effect',id:custom.cards[0].id,index:0},custom);
 const e=custom.cards[0].effects[0];assert.ok(descriptions.SurvivorPreview.effectDescription(e,custom,1).length>8);
}
for(const m of data.boss.moves) { const {effects}=scene({kind:'move',id:m.id});assert.ok(effects.has(m.kind),m.id); }
// A second effect survives repeated loop resets; edited recipe parameters drive actual sandbox data.
const custom=JSON.parse(JSON.stringify(data));custom.cards[0].effects=[{...params,type:'aoe',trigger:'skill'},{...params,type:'stun',trigger:'skill',radius:222,duration:1.7}];
const {run}=scene({kind:'effect',id:custom.cards[0].id,index:1},custom);
assert.equal(run('UPGRADES[0].effects[0].radius'),222);
assert.ok(descriptions.SurvivorPreview.describe(custom,{kind:'effect',id:custom.cards[0].id,index:1}).includes('1.7'));
const rapid={kind:'card',id:'rapid-water',level:2};assert.ok(describe(rapid).includes((data.tuning.shotInterval*(1-data.tuning.fireRateReduction*2)).toFixed(2)));
console.log(`PASS: ${count} preview scenes, all cards/recipes/blocks/boss moves, real VFX, fusion elements, two resets, numeric captions, bounded pools, finite drawing, separate state/RNG/storage, hidden scheduling`);

// Touch / focus only select a preview; confirmation applies exactly the highlighted card.
host(`globalThis.previewMounts=[]; globalThis.SurvivorPreview={stop(){},mount:(host,data,spec)=>previewMounts.push(spec)};
resetGame();state.mode='playing';state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();`);
assert.equal(host('state.mode'),'levelup');
host.elements.upgradeCards.children[1].listeners.click();
assert.equal(host('previewMounts[previewMounts.length-1].id'),'rapid-water');
assert.equal(host('upgradeLevel("rapid-water")'),0);
host.elements.confirmUpgrade.onclick();
assert.equal(host('upgradeLevel("rapid-water")'),1);assert.equal(host('state.mode'),'playing');
// Pause / settings owns clickable previews at the actually acquired level.
host('openSettings();');
const owned=host.elements.buildSlots.children.find(n=>n.textContent==='連發水球・看效果');
assert.ok(owned);owned.listeners.click();assert.equal(host('previewMounts[previewMounts.length-1].level'),1);
console.log('PASS: touch highlight then confirm, acquired-card preview at owned level');
// 雙點備案：只接受同一張卡的短間隔兩次點擊，不因 focus／滑過就套用。
const taps=createRun();
taps(`globalThis.SurvivorPreview={stop(){},mount(){}};globalThis.tapTime=1000;performance.now=()=>tapTime;
resetGame();state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();`);
taps.elements.upgradeCards.children[0].listeners.focus();
assert.equal(taps('state.mode'),'levelup');
taps.elements.upgradeCards.children[0].listeners.click();
taps('tapTime+=100');taps.elements.upgradeCards.children[1].listeners.click();
assert.equal(taps('state.mode'),'levelup','點不同卡不算雙點');
taps('tapTime+=400');taps.elements.upgradeCards.children[1].listeners.click();
assert.equal(taps('state.mode'),'levelup','超過間隔只預覽');
taps('tapTime+=100');taps.elements.upgradeCards.children[1].listeners.click();
assert.equal(taps('state.mode'),'playing');assert.equal(taps('upgradeLevel("rapid-water")'),1);
taps.elements.upgradeCards.children[1].listeners.dblclick();
assert.equal(taps('upgradeLevel("rapid-water")'),1,'原生 dblclick 不會重複升級');
console.log('PASS: focus does not apply, per-card double-tap timing, slow taps only preview, native dblclick applies at most once');

// 第零格即完成定位；命中可位移、循環回位，鏡頭固定對準命中區。
const close=createRun({preview:{data:JSON.parse(JSON.stringify(data)),spec:{kind:'card',id:'big-water',level:1}}});
const homes=close('JSON.stringify(state.enemies.map(e=>[e.x,e.y]))');
const camera=close('JSON.stringify([state.cameraX,state.cameraY])');
assert.ok(Math.abs(close('state.height')-360/1.35)<.01,'普攻使用共用1.35倍取景');
let hit=false;
for(let i=0;i<180;i++) {
 close('stepPreview(.05)');
 if(close('previewTime')===0) assert.equal(close('JSON.stringify(state.enemies.map(e=>[e.x,e.y]))'),homes,'重播回到起始位置');
 assert.equal(close('JSON.stringify([state.cameraX,state.cameraY])'),camera,'鏡頭不因角色走路而把假怪推到上方');
 hit=hit||close('state.enemies.some(e=>e.hp<e.maxHp)');
}
assert.ok(hit,'保持距離的真實水球命中');
const wide=createRun({preview:{data:JSON.parse(JSON.stringify(data)),spec:{kind:'card',id:'water-ultimate',level:1}}});
assert.equal(wide('state.height'),close('state.height'),'全場巨浪同用基準取景');
console.log('PASS: t=0 target placement, real hit and repeated loops, fixed close camera, 1.35x shared framing, smooth target return');

// 直接強迫四種傷害命中：展示免傷不依賴假怪距離，也不留下受傷表情。
const safe=createRun({preview:{data:JSON.parse(JSON.stringify(data)),spec:{kind:'card',id:'big-water',level:1}}});
safe(`globalThis.initialHealth=state.player.health;
Object.assign(state.enemies[0],{x:state.player.x,y:state.player.y,damage:30});
state.enemyShots.push({x:state.player.x,y:state.player.y,vx:0,vy:0,r:9,damage:30,source:'book'});
state.enemyHazards.push({x:state.player.x,y:state.player.y,r:50,warning:0,damage:30});
state.boss={x:state.player.x,y:state.player.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};
bossHurtPlayer(30);tick(.05);`);
assert.equal(safe('state.player.health'),safe('initialHealth'));
assert.equal(safe('state.player.invincible>0 || state.player.hitFlash>0'),false);
assert.equal(safe('state.enemyShots.length+state.enemyHazards.length'),0,'碰撞和警告確實已被處理');
safe('resetGame();');
assert.equal(safe('!!state.player.damageDisabled'),false,'正式遊戲重設後不沿用展示免傷');
console.log('PASS: preview immunity for contact, projectiles, custom hazards and boss moves; no hurt/flash; reset clears immunity');
