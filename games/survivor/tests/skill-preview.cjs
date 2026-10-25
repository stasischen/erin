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
 for(let i=0;i<130;i++) {
  run('stepPreview(.05)');
  JSON.parse(run('JSON.stringify(state.vfx.map(v=>v.kind).concat(state.fields.map(f=>f.school),state.bossMoves.map(m=>m.kind)))')).forEach(x=>effects.add(x));
  assert.equal(run('state.mode'),'playing');
  assert.ok(run('state.enemies.length<=26 && state.projectiles.length<=24 && state.vfx.length<=48 && state.effects.length<=90 && state.bossMoves.length<=12'));
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
