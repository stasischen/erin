// Migration and Stone Hands increment. Synthetic future entries cover schema identity only.
// Run on Mac with the existing complete test runner; this file does not install or publish anything.
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun(),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('globalThis.originalRoster=SurvivorData.copy(SURVIVOR_DEFAULTS.gallery.bosses)');
const oldIds=['gatekeeper','frostfire','winged','assassin'];
assert.deepEqual(json('originalRoster.map(b=>b.id)'),[...oldIds,'stone-hands','rolling-eye']);
// Isolate the migration contract against both the current five definitions and a future seven.
// The extra definitions are test-only clones, never production placeholders or gameplay coverage.
for(const future of [false,true]){
 run(`SURVIVOR_DEFAULTS.gallery.bosses=SurvivorData.copy(originalRoster);
  if(${future})for(const id of ['mask-statue']){
   const fixture=SurvivorData.copy(originalRoster[0]);fixture.id=id;
   SURVIVOR_DEFAULTS.gallery.bosses.push(fixture);
  }
  globalThis.baseSnapshot=JSON.stringify(SURVIVOR_DEFAULTS);`);
 const count=future?7:6;
 for(const length of [1,3,4,5])for(const reverse of [false,true]){
  run(`globalThis.work=SurvivorData.defaults();work.gallery.bosses=SurvivorData.copy(originalRoster.slice(0,${length}));
   for(const [i,b] of work.gallery.bosses.entries()){
    b.name='自訂王'+i;b.hp=1900+i*100;b.speed=71+i;
    b.moves[0].weight=3+i;b.moves[0].blocks.moves[0].timing.windup=1.25;
   }
   if(${reverse})work.gallery.bosses.reverse();
   globalThis.inputSnapshot=JSON.stringify(work);
   globalThis.checked=SurvivorData.validate(work);`);
  assert.equal(run('checked.valid'),true,JSON.stringify(json('checked.errors')));
  assert.equal(run('JSON.stringify(work)'),run('inputSnapshot'),'validation mutated input');
  assert.equal(run('JSON.stringify(SURVIVOR_DEFAULTS)'),run('baseSnapshot'),'validation mutated defaults');
  assert.equal(run('checked.data.gallery.bosses.length'),count);
  assert.deepEqual(json('checked.data.gallery.bosses.map(b=>b.id)'),json('SURVIVOR_DEFAULTS.gallery.bosses.map(b=>b.id)'));
  // Compare all retained editable nested values, not merely the number of entries.
  for(let i=0;i<length;i++){
   const id=[...oldIds,'stone-hands'][i];
   assert.deepEqual(json(`checked.data.gallery.bosses.find(b=>b.id==='${id}')`),json(`work.gallery.bosses.find(b=>b.id==='${id}')`));
  }
  run('globalThis.saved=SurvivorData.save(work);globalThis.loaded=SurvivorData.load();globalThis.again=SurvivorData.validate(loaded.data)');
  assert.equal(run('saved.valid&&loaded.valid&&again.valid'),true);
  assert.deepEqual(json('loaded.data.gallery'),json('checked.data.gallery'));
  assert.deepEqual(json('again.data.gallery'),json('checked.data.gallery'),'repeat load appended duplicates');
  run('checked.data.gallery.bosses[0].hp=4999');
  assert.equal(run('JSON.stringify(SURVIVOR_DEFAULTS)'),run('baseSnapshot'),'output aliases defaults');
 }
 // Full current-version roster may be reordered; entries are matched by ID, including future edits.
 run("work=SurvivorData.defaults();work.gallery.bosses.forEach((b,i)=>b.hp=2000+i*100);work.gallery.bosses.reverse();checked=SurvivorData.validate(work)");
 assert.equal(run('checked.valid'),true);
 for(let i=0;i<count;i++)assert.equal(run(`checked.data.gallery.bosses[${i}].hp`),2000+i*100);
 for(const edit of [
  'work.gallery=null',
  'work.gallery=[]',
  'work.gallery.schemaVersion=99',
  'work.gallery.bosses=[]',
  'work.gallery.bosses=[null]',
  'work.gallery.bosses=[work.gallery.bosses[1]]',
  'work.gallery.bosses=work.gallery.bosses.slice(0,2)',
  'work.gallery.bosses[1]=work.gallery.bosses[0]',
  "work.gallery.bosses[0].id='unknown-boss'",
  "work.gallery.bosses[0].id='__proto__'",
  "work.gallery.bosses[0].artId='character/assassin'",
  'work.gallery.bosses[0].hp=NaN',
  'work.gallery.bosses[0].moves[0].blocks.moves[0].timing.windup=0'
 ]){
  run('work=SurvivorData.defaults();'+edit+';globalThis.storageBefore=localStorage.getItem(SurvivorData.KEY);checked=SurvivorData.save(work)');
  assert.equal(run('checked.valid'),false,edit);
  assert.equal(run('localStorage.getItem(SurvivorData.KEY)'),run('storageBefore'),'invalid input replaced saved work');
 }
 // An invalid partial future roster must not be mistaken for one of the historic ID sets.
 if(future){
  run("work=SurvivorData.defaults();work.gallery.bosses=[work.gallery.bosses[0],work.gallery.bosses[1],work.gallery.bosses[4]]");
  assert.equal(run('SurvivorData.validate(work).valid'),false);
 }
 // Retain schema-1 arena conversion and supplied edits while adding only absent defaults.
 run('work=SurvivorData.defaults();work.gallery.schemaVersion=1;work.gallery.arenaRadius=620;work.gallery.bosses=SurvivorData.copy(originalRoster.slice(0,1));work.gallery.bosses[0].hp=2100;checked=SurvivorData.validate(work)');
 assert.equal(run('checked.valid'),true);assert.equal(run('checked.data.gallery.arenaRadius'),200);
 assert.equal(run('checked.data.gallery.bosses[0].hp'),2100);assert.equal(run('checked.data.gallery.bosses.length'),count);
}
run('SURVIVOR_DEFAULTS.gallery.bosses=SurvivorData.copy(originalRoster)');
console.log('PASS: ID-based 1/3/4 migration and complete-roster reorder; edits preserved; save/load idempotence; invalid and duplicate identities rejected without replacing storage; no input/default alias mutation');

// Real selectable fifth Boss: no synthetic clone participates in these engine assertions.
run("globalThis.stone=GAME_DATA.gallery.bosses.find(b=>b.id==='stone-hands');globalThis.limb=SurvivorTrialBlocks");
assert.ok(run('!!stone'));
assert.equal(run('SurvivorData.validate(SurvivorData.defaults()).valid'),true);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
run('globalThis.body={x:0,y:0,r:34};globalThis.target={x:500,y:0};globalThis.arena={x:0,y:0,radius:200};globalThis.before=JSON.stringify([body,target,arena])');
assert.deepEqual(json('limb.limbTarget(body,target,100,arena)'),{x:100,y:0});
assert.deepEqual(json('limb.limbTarget(body,target,300,arena)'),{x:200,y:0});
assert.equal(run('JSON.stringify([body,target,arena])'),run('before'));
for(const side of [-1,1])for(const sample of [0,.5,.999]){
 run(`globalThis.id=limb.limbChoice(stone,1,${side},100,${sample})`);
 assert.equal(run('stone.moves.find(m=>m.id===id).blocks.moves[0].effect.limb.side'),-side);
}
function hands(side=-1){
 run(`startTrial('stone-hands');state.trial.entry=0;state.bossIntro=0;globalThis.handBoss=state.boss;handBoss.x=state.trial.arena.x-100;handBoss.y=state.trial.arena.y;state.player.x=state.trial.arena.x;state.player.y=state.trial.arena.y;state.player.invincible=0;state.player.damageDisabled=false;handBoss.rest=0;state.bossRest=0;Math.random=()=>${side===1?.999:0};updateTrial(0);globalThis.handMove=handBoss.moves[0];globalThis.handSpec=stone.moves.find(m=>m.id===handMove.id).blocks.moves[0];`);
}
hands();
assert.equal(run('handMove.ai.phase'),'windup');assert.equal(run('state.trial.events[0].type'),'limb-warning');
run('globalThis.hp=state.player.health;globalThis.locked=JSON.stringify(handMove.target);updateTrial(.5)');
assert.equal(run('state.player.health'),run('hp'));
assert.ok(run('limb.limbPose(handBoss,-1,handMove,handSpec).height>0'));
assert.equal(run('limb.limbPose(handBoss,1,handMove,handSpec).height'),0);
run('state.player.x-=80;updateTrial(.69)');assert.equal(run('JSON.stringify(handMove.target)'),run('locked'));assert.equal(run('state.player.health'),run('hp'));
run('updateTrial(.01)');assert.equal(run('state.player.health'),run('hp'),'moving outside the locked footprint must evade');
assert.equal(run("state.trial.events.some(e=>e.type==='limb-slam'&&e.side===-1)"),true);
// The next actual slam alternates, including a cancelled attempt before it.
run('handBoss.stunTimer=1;updateTrial(.01);handBoss.stunTimer=0;handBoss.rest=0;state.bossRest=0;updateTrial(0)');
assert.equal(run('stone.moves.find(m=>m.id===handBoss.moves[0].id).blocks.moves[0].effect.limb.side'),1);
run('handBoss.stunTimer=1;updateTrial(.01);handBoss.stunTimer=0;handBoss.rest=0;state.bossRest=0;updateTrial(0)');
assert.equal(run('stone.moves.find(m=>m.id===handBoss.moves[0].id).blocks.moves[0].effect.limb.side'),1,'cancelled right hand must not consume alternation');
run('state.player.x=handBoss.moves[0].target.x;state.player.y=handBoss.moves[0].target.y;state.player.invincible=0;globalThis.hp=state.player.health;updateTrial(1.2)');
assert.ok(run('state.player.health<hp'));assert.equal(run('handBoss.lastLimb'),1);
// Each damage assertion uses a fresh encounter: a prior impact legitimately freezes the target.
hands();run('globalThis.beforeHp=handBoss.hp;hitBuildTarget(handBoss,10)');near(run('beforeHp-handBoss.hp'),2);
assert.equal(run('handBoss.feedbackFrozen'),true);
run('updateBossWeakpoints(.16)');assert.equal(run('handBoss.weakpoints.core.phase'),'warning','hit-stop must prevent the presumed opening');
function openHands(){hands();run('updateBossWeakpoints(.16)');assert.equal(run('handBoss.weakpoints.core.phase'),'open');}
openHands();run('beforeHp=handBoss.hp;hitBuildTarget(handBoss,10)');near(run('beforeHp-handBoss.hp'),30);
openHands();run('beforeHp=handBoss.hp;hitBuildTarget(handBoss,10,{point:{x:handBoss.x+100,y:handBoss.y,r:0}})');near(run('beforeHp-handBoss.hp'),2);
openHands();run('beforeHp=handBoss.hp;hitBuildTarget(handBoss,10,{charged:true})');near(run('beforeHp-handBoss.hp'),30);
openHands();run('stunTarget(handBoss,1);updateBossWeakpoints(.01)');assert.equal(run('handBoss.weakpoints.core.phase'),'closing');
run('beforeHp=handBoss.hp;hitBuildTarget(handBoss,10)');near(run('beforeHp-handBoss.hp'),30);
// No preceding damage in this independent expiry scenario: genuine elapsed time can advance.
openHands();run('stunTarget(handBoss,1);updateBossWeakpoints(.01);updateBossWeakpoints(.3)');
assert.equal(run('handBoss.weakpoints.core.phase'),'closed');
run('beforeHp=handBoss.hp;hitBuildTarget(handBoss,10)');near(run('beforeHp-handBoss.hp'),2);
assert.equal(run('handBoss.moves.length'),0);
// Starting another encounter never reuses the cancelled target or hand side.
hands();assert.equal(run('handBoss.lastLimb'),undefined);assert.equal(run('handBoss.moves.length'),1);
run("trialMenu();startTrial('stone-hands')");assert.equal(run('state.boss.lastLimb'),undefined);assert.equal(run('state.boss.moves.length'),0);
// Explicit schema bounds and preserved real new-Boss edits.
for(const edit of ['b.moves[0].blocks.moves[0].effect.limb.side=1','b.moves[0].blocks.moves[0].effect.limb.reach=301','b.moves[0].blocks.moves[0].effect.limb.lift=19',"b.weakpoint.parts[0].requiresMatch='yes'"]){
 run("work=SurvivorData.defaults();globalThis.b=work.gallery.bosses.find(b=>b.id==='stone-hands');"+edit);assert.equal(run('SurvivorData.validate(work).valid'),false,edit);
}
run("work=SurvivorData.defaults();b=work.gallery.bosses.find(b=>b.id==='stone-hands');b.moves[0].blocks.moves[0].effect.limb.reach=220;b.moves[1].blocks.moves[0].effect.limb.lift=95;checked=SurvivorData.save(work)");
assert.equal(run('checked.valid'),true);assert.deepEqual(json('SurvivorData.load().data.gallery'),json('checked.data.gallery'));
// Observe actual production draw calls, not a marker-only or duplicated multiplier assertion.
function exposureFrame(expected){
 run(`globalThis.exposureDraws=[];globalThis.savedPaint=SurvivorArt.paint;globalThis.savedSprite=drawOutlinedSprite;
 SurvivorArt.paint=function(id,options,fallback){if(id==='character/stone-hand-left'||id==='character/stone-hand-right')exposureDraws.push({kind:id,box:SurvivorArt.bounds(id,options.x,options.y,options.width,options.height),x:options.x,y:options.y});return savedPaint(id,options,fallback);};
 drawOutlinedSprite=function(context,picture,x,y,width,height,...rest){exposureDraws.push({kind:'torso',box:[x,y,width,height]});return savedSprite(context,picture,x,y,width,height,...rest);};
 try{drawTrialBodies();}finally{SurvivorArt.paint=savedPaint;drawOutlinedSprite=savedSprite;}`);
 const draws=json('exposureDraws'),ti=draws.findIndex(d=>d.kind==='torso');assert.ok(ti>=0);
 const hands=draws.map((d,i)=>({...d,i})).filter(d=>d.kind.startsWith('character/stone-hand-'));assert.equal(hands.length,2);
 const critical=run("resolveBossWeakpoint(handBoss).kind==='critical'");assert.equal(critical,expected);
 assert.equal(run('!!trialCoreExposure(handBoss)'),expected,'renderer and actual shared hit state must agree');
 if(expected){
  for(const hand of hands)assert.ok(hand.i<ti,'the actual torso sprite, not just weakpoint marker, must be above both floor-plane hands');
  const core=json('trialCoreExposure(handBoss)'),box=draws[ti].box;
  near(core.x,box[0]+box[2]/2);near(core.y,box[1]+box[3]/2);
  const current=run('handBoss.moves[0]?.id||null');
  for(const hand of hands){
   const side=hand.kind.endsWith('left')?-1:1;
   if(current===(side<0?'left-slam':'right-slam'))continue; // attacking hand keeps its exact target, below torso
   const [x,y,w,h]=hand.box,cx=Math.max(x,Math.min(core.x,x+w)),cy=Math.max(y,Math.min(core.y,y+h));
   assert.ok(Math.hypot(cx-core.x,cy-core.y)>core.radius,'nonattacking guard must physically clear the full visible core circle');
  }
 }else for(const hand of hands)assert.ok(hand.i>ti,'closed guard remains in front of torso');
}
for(const side of [-1,1]){
 for(const seconds of [.01,.16,.6,1.19]){hands(side);run(`updateTrial(${seconds});updateBossWeakpoints(${seconds})`);exposureFrame(seconds>=.15);}
 // Closing tail during a real slam remains exposed, even when target is directly over the torso.
 hands(side);run('updateTrial(.6);updateBossWeakpoints(.6);handMove.target={x:handBoss.x,y:handBoss.y};updateTrial(.61);updateBossWeakpoints(.01)');
 assert.equal(run('handBoss.weakpoints.core.phase'),'closing');exposureFrame(true);
 // Actual cancellation removes the move; both resting hands stay aside until the shared critical tail ends.
 hands(side);run('updateTrial(.6);updateBossWeakpoints(.6);stunTarget(handBoss,1);updateTrial(.01);updateBossWeakpoints(.01)');
 assert.equal(run('handBoss.moves.length'),0);assert.equal(run('handBoss.weakpoints.core.phase'),'closing');exposureFrame(true);
 run('updateBossWeakpoints(.3)');exposureFrame(false);
 // Ordinary stun before exposure cannot invent an open core.
 hands(side);run('stunTarget(handBoss,1);updateTrial(.01);updateBossWeakpoints(.01)');exposureFrame(false);
}
// Editable hand footprint changes cannot invalidate the guard clearance rule.
for(const radius of [20,55,160])for(const side of [-1,1]){
 run(`globalThis.poseSpec=JSON.parse(JSON.stringify(stone.moves[0].blocks.moves[0]));poseSpec.shape.radius=${radius};globalThis.coreBox={x:10,y:20,radius:20.4};globalThis.park=limb.limbPose({x:10,y:24.25,r:34},${side},null,poseSpec,coreBox)`);
 assert.ok(Math.abs(run('park.x-coreBox.x'))-radius*.6>run('coreBox.radius'));
}
// The supplied original PNG has an opaque chest pixel at the actual .5/.5 manifest anchor.
// This prevents a transparent torso + marker-only rendering from satisfying the layer regression.
{
 const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
 const png=fs.readFileSync(path.join(__dirname,'../art/characters/stone-hands.png'));let offset=8,idat=[];
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 while(offset<png.length){const length=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8),data=png.subarray(offset+8,offset+8+length);if(type==='IHDR'){assert.equal(data.readUInt32BE(0),48);assert.equal(data.readUInt32BE(4),16);assert.equal(data[8],8);assert.equal(data[9],6);}if(type==='IDAT')idat.push(data);offset+=12+length;}
 const pixels=zlib.inflateSync(Buffer.concat(idat)),stride=1+48*4;
 for(let y=0;y<16;y++)assert.equal(pixels[y*stride],0,'original generator uses explicit unfiltered RGBA rows');
 assert.deepEqual([...pixels.subarray(8*stride+1+8*4,8*stride+1+9*4)],[185,231,207,255]);
}
console.log('PASS: actual torso/hand manifest bounds and layer order across both sides, early/late windup, active closing, cancellation and stun; opaque original core pixel');

// Actual trialMenu + production SurvivorArt async frame loading, not only a lookup assertion.
{
 const menu=createRun();
 menu(`globalThis.menuImages=[];globalThis.menuNodes=[];globalThis.menuIds={};globalThis.oldGet=document.getElementById.bind(document);
 class MenuNode{constructor(tag){this.tag=tag;this.dataset={};this.children=[];this.style={};this.hidden=false;this.classList={add(){},remove(){}};this.crops=[];this.src='';}
 appendChild(n){this.children.push(n);return n;}setAttribute(k,v){this[k]=v;}set innerHTML(v){this.children=[];}
 getContext(){const n=this;return {scale(){},translate(){},save(){},restore(){},fillRect(){},drawImage(image,...rect){n.crops.push({sheet:image.src,rect});}};}
 toDataURL(){return 'data:image/png;test,'+JSON.stringify({width:this.width,height:this.height,crops:this.crops});}}
 document.createElement=tag=>{const n=new MenuNode(tag);menuNodes.push(n);return n;};
 for(const id of ['trialPanel','trialChoices','trialTitle','makerPanel'])menuIds[id]=new MenuNode('div');menuIds.makerPanel.hidden=true;
 document.getElementById=id=>menuIds[id]||oldGet(id);
 document.querySelectorAll=selector=>selector==='[data-survivor-art]'?menuNodes.filter(n=>n.dataset.survivorArt):[];
 globalThis.Image=class{constructor(){this.width=48;this.height=16;menuImages.push(this);}set src(v){this.path=v;}get src(){return this.path;}};
 trialMenu();globalThis.stoneImage=menuIds.trialChoices.children.find(n=>n['aria-label']==='石像雙手').children[0];`);
 const get=code=>JSON.parse(menu('JSON.stringify('+code+')'));
 const fallback=menu('stoneImage.src');assert.ok(fallback.startsWith('data:image/png;test,'));
 assert.equal(menu('stoneImage.dataset.survivorArt'),'character/stone-hands');
 assert.equal(get('menuIds.trialChoices.children').length,6);
 assert.equal(JSON.parse(fallback.split(',').slice(1).join(',')).crops.length,0,'not loaded: visible placeholder, no raw strip');
 menu("globalThis.sheet=menuImages.find(i=>i.src.startsWith('art/characters/stone-hands.png'));sheet.onerror()");
 assert.equal(menu('stoneImage.src'),fallback,'image error preserves placeholder');
 menu('sheet.onload()');
 const loaded=JSON.parse(menu('stoneImage.src').split(',').slice(1).join(','));
 assert.equal(loaded.width,16);assert.equal(loaded.height,16);assert.equal(loaded.crops.length,1);
 assert.deepEqual(loaded.crops[0].rect,[0,0,16,16,0,0,16,16],'actual menu body must crop frame0, never stretch48x16');
 menu("for(const image of menuImages)if(image!==sheet){image.width=16;image.height=16;image.onload();}");
 for(const img of get('menuIds.trialChoices.children.map(n=>n.children[0])')){assert.ok(img.src.startsWith('data:image/png;test,'));assert.ok(img.dataset.survivorArt);}
 menu('trialMenu();globalThis.loadedAgain=menuIds.trialChoices.children.find(n=>n["aria-label"]==="石像雙手").children[0].src');
 assert.deepEqual(JSON.parse(menu('loadedAgain').split(',').slice(1).join(',')),loaded,'already loaded: correct cached body frame');
 menu("globalThis.eyeSheet=menuImages.find(i=>i.src.startsWith('art/characters/rolling-eye.png'));eyeSheet.width=112;eyeSheet.height=16;eyeSheet.onload();globalThis.eyeMenuImage=menuIds.trialChoices.children.find(n=>n['aria-label']==='翻滾巨眼').children[0].src");
 const eyeIcon=JSON.parse(menu('eyeMenuImage').split(',').slice(1).join(','));assert.deepEqual(eyeIcon.crops[0].rect,[96,0,16,16,0,0,16,16]);
 console.log('PASS: real menu pending/error placeholder, loaded manifest frame crop for Stone/Eye, reopen and old Boss icons');
}

for(const [width,height] of [[740,360],[1024,461],[1180,820]]){
 hands();run(`Object.assign(state,worldViewport(${width},${height}));state.player.damageDisabled=true;for(let i=0;i<500;i++){tick(.02);if(i%20===0)render()}`);
 assert.equal(run('state.enemies.length'),0);assert.ok(run('Math.hypot(state.boss.x-state.trial.arena.x,state.boss.y-state.trial.arena.y)<=state.trial.arena.radius-state.boss.r+.001'));
}
console.log('PASS: real Stone Hands target warning / immutable landing / alternating actual slams / cancellation / shared core armor, geometry and closing / cleanup / schema bounds / three-size engine smoke (not cloud UI acceptance)');

{
// 遊戲內設計室事件：卡片、積木、觸控加減、儲存、返回、失敗阻擋。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attrs={};this.value='';this._text='';this.hidden=true;this.style={setProperty(){}};this.classList={add(){},remove(){}};}
  appendChild(n){this.children.push(n);return n;}
  querySelector(selector){const all=node=>node.children.flatMap(c=>[c,...all(c)]);return all(this).find(n=>selector[0]==='.' && (n.className||'').split(' ').includes(selector.slice(1)))||null;}
  set textContent(s){this._text=s;this.children=[];}get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
  addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=v;}
  focus(){this.focused=true;} scrollIntoView(){} getContext(){return {fillRect(){},drawImage(){}};}
  fire(event){if(this.listeners[event])this.listeners[event]({target:this,preventDefault(){}});}
}
function setup(options={}){
  const storage={...options.saved}, ids=Object.fromEntries(['editor','makerStatus','save','play','reset','makerPanel','makerLink','makerClose','overlay'].map(id=>[id,new Node()]));
  const tabs=['weapons','cards','enemies','boss','stages','rules'].map(tab=>{const n=new Node('button');n.dataset.tab=tab;return n;});
  const location={href:'',search:options.search||''}, state={keys:new Set(),mode:'ready'},window={addEventListener(){}};
  const calls=[];
  const context=vm.createContext({SurvivorPreview:{stop(){},refresh(){},mount(host,data,spec){calls.push({kind:'preview',data,spec});}},SurvivorPractice:{close(){},refresh(){},mount(){},unmount(){},open(data,container,onClose,id){calls.push({kind:'practice',data,id});}},console,window,location,state,MAKER_MODE:!!options.maker,URLSearchParams,drawBlob(){},updateActionControls(){},showOverlay(mode){state.mode=mode;},document:{createElement:tag=>new Node(tag),getElementById:id=>ids[id]||(ids[id]=new Node()),querySelectorAll:()=>tabs},localStorage:{getItem:k=>storage[k]||null,setItem(k,v){if(options.fails)throw Error('full');storage[k]=v;}}});
  for(const file of ['render/monsters.js','icons.js','data/defaults.js','data/schema.js','engine/timing.js','engine/effect-blocks.js','maker/maker.js'])vm.runInContext(fs.readFileSync(`${__dirname}/../${file}`,'utf8'),context);
  function nodes(node=ids.editor){return node.children.flatMap(c=>[c,...nodes(c)]);}
  function tab(name){tabs.find(n=>n.dataset.tab===name).fire('click');}
  function click(text,exact=true){const n=nodes().find(n=>n.tag==='button'&&(exact?n._text===text:n._text.includes(text)));assert.ok(n,text);n.fire('click');}
  function item(id){const n=nodes().find(n=>n.dataset.item===id);assert.ok(n,id);n.fire('click');}
  function field(label,value){const row=nodes().find(n=>n.tag==='label'&&n._text===label);assert.ok(row,label);const input=row.children[0];input.value=value;input.fire('input');}
  return {ids,nodes,tab,item,click,field,storage,location,state,window,context,calls};
}

 let ui=setup();ui.ids.makerLink.fire('click');ui.tab('boss');ui.item('gallery');
 const section=()=>ui.nodes().find(n=>n.tag==='fieldset'&&n.children.some(c=>c.tag==='legend'&&c._text==='石像雙手'));
 const nodes=n=>n.children.flatMap(c=>[c,...nodes(c)]);
 const field=(label,value)=>{const n=nodes(section()).find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(n,label);if(value!==undefined){n.value=value;n.fire('input');}return n;};
 field('肢體觸及距離',230);field('舉手高度',90);field('預警秒數',1.7);
 ui.ids.save.fire('click');const saved=JSON.parse(ui.storage['erin-survivor-maker-v1']);
 const boss=saved.gallery.bosses.find(b=>b.id==='stone-hands');
 assert.equal(boss.moves[0].blocks.moves[0].effect.limb.reach,230);assert.equal(boss.moves[0].blocks.moves[0].effect.limb.lift,90);
 assert.equal(boss.moves[0].blocks.moves[0].timing.windup,1.7);
 ui=setup({saved:ui.storage});ui.ids.makerLink.fire('click');ui.tab('boss');ui.item('gallery');
 assert.equal(field('肢體觸及距離').value,230);assert.equal(field('舉手高度').value,90);
 ui.tab('boss');ui.item('weakpoint');
 const weak=ui.nodes().find(n=>n.tag==='fieldset'&&n.children.some(c=>c.tag==='legend'&&c._text==='石像雙手'));
 const toggle=nodes(weak).find(n=>n.tag==='button'&&n._text==='條件消失即關閉：開');assert.ok(toggle);toggle.fire('click');
 ui.ids.save.fire('click');assert.equal(JSON.parse(ui.storage['erin-survivor-maker-v1']).gallery.bosses.find(b=>b.id==='stone-hands').weakpoint.parts[0].requiresMatch,false);
 ui.ids.reset.fire('click');ui=setup({saved:ui.storage});ui.ids.makerLink.fire('click');ui.tab('boss');ui.item('gallery');
 assert.equal(field('肢體觸及距離').value,170);assert.equal(field('舉手高度').value,70);
 assert.equal(JSON.parse(ui.storage['erin-survivor-maker-v1']).gallery.bosses.find(b=>b.id==='stone-hands').weakpoint.parts[0].requiresMatch,true);
 console.log('PASS: real Maker controls for limb reach/lift/timing and live-condition weakpoint; save, reload and reset');
 const eyeSection=()=>ui.nodes().find(n=>n.tag==='fieldset'&&n.children.some(c=>c.tag==='legend'&&c._text==='翻滾巨眼'));
 const eyeField=(label,value)=>{const n=nodes(eyeSection()).find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(n,label);if(value!==undefined){n.value=value;n.fire('input');}return n;};
 eyeField('格步翻滾格距',100);eyeField('光束半寬',6);eyeField('光束最長距離',420);
 ui.ids.save.fire('click');let eyeSaved=JSON.parse(ui.storage['erin-survivor-maker-v1']).gallery.bosses.find(b=>b.id==='rolling-eye');
 assert.equal(eyeSaved.moves[0].blocks.moves[0].effect.gridRoll.cell,100);assert.equal(eyeSaved.moves[1].blocks.moves[0].effect.beam.width,6);assert.equal(eyeSaved.moves[1].blocks.moves[0].effect.beam.range,420);
 ui=setup({saved:ui.storage});ui.ids.makerLink.fire('click');ui.tab('boss');ui.item('gallery');
 assert.equal(eyeField('格步翻滾格距').value,100);assert.equal(eyeField('光束半寬').value,6);assert.equal(eyeField('光束最長距離').value,420);
 ui.ids.reset.fire('click');ui=setup({saved:ui.storage});ui.ids.makerLink.fire('click');ui.tab('boss');ui.item('gallery');
 assert.equal(eyeField('格步翻滾格距').value,80);assert.equal(eyeField('光束半寬').value,10);assert.equal(eyeField('光束最長距離').value,600);
 for(const label of ['形狀半徑','招式移速','追擊速度','第二階段速度倍率','AI 第二階段加權','AI 選招權重'])assert.equal(nodes(eyeSection()).some(n=>n.tag==='input'&&n.attrs['aria-label']===label),false,label+' must not be a visible inert control');
 eyeField('光束啟用 0 關 1 開',0);eyeField('格步翻滾格距',100);eyeField('光束半寬',6);eyeField('光束最長距離',120);ui.ids.save.fire('click');
 const effective=JSON.parse(ui.storage['erin-survivor-maker-v1']),actual=createRun();
 actual('trialDraft='+JSON.stringify(effective.gallery)+";startTrial('rolling-eye');globalThis.eb=state.boss;state.player.damageDisabled=true;globalThis.observed=[]");
 for(let i=0;i<1000;i++)actual("updateTrial(.02);updateBossWeakpoints(.02);observed.push(...state.trial.events)");
 assert.equal(actual("observed.some(e=>e.type==='beam-warning')"),false);assert.ok(actual("observed.filter(e=>e.type==='grid-warning').length>3"));
 actual("globalThis.spec=state.trial.definition.moves.find(m=>m.blocks.moves[0].effect.beam).blocks.moves[0];globalThis.region=SurvivorTrialBlocks.boundedBeam({x:0,y:0},{x:200,y:0},spec.effect.beam.width,spec.effect.beam.range,{x:0,y:0,radius:300})");
 assert.equal(actual('region.shape.radius'),6);assert.equal(actual('region.shape.length'),120);
 actual("globalThis.roll=state.trial.definition.moves.find(m=>m.blocks.moves[0].effect.gridRoll).blocks.moves[0];globalThis.cell=roll.effect.gridRoll.cell;globalThis.next=SurvivorTrialBlocks.gridTarget({x:0,y:0,r:32},{x:200,y:0},{x:0,y:0,radius:300},cell)");
 assert.equal(actual('next.x'),100);assert.equal(actual('next.y'),0);
 console.log('PASS: real Eye Maker effective grid/beam/enable controls save, reload, reset, imported engine behavior and no inert controls');
}

// New sixth Boss tests; actual Mac runner required. These assertions are not a PASS claim.
{
 const eyeRun=createRun(),read=code=>JSON.parse(eyeRun('JSON.stringify('+code+')'));
 eyeRun("globalThis.eye=GAME_DATA.gallery.bosses.find(b=>b.id==='rolling-eye');globalThis.grid=SurvivorTrialBlocks;globalThis.a={x:0,y:0,radius:200}");
 assert.equal(eyeRun('!!eye'),true);
 assert.equal(eyeRun('SurvivorData.validate(SurvivorData.defaults()).valid'),true);
 for(const radius of [20,32,50])for(const cell of [60,80,120]){
  eyeRun(`globalThis.cells=grid.gridCells(a,${radius},${cell})`);
  const cells=read('cells');assert.ok(cells.length>1);
  for(const c of cells){
   assert.ok(Math.hypot(c.x,c.y)+radius<=200+1e-8);
   near(c.x/cell,c.col);near(c.y/cell,c.row);
   for(const target of [{x:900,y:900},{x:-900,y:0},{x:0,y:-900}]){
    eyeRun(`globalThis.gbody=${JSON.stringify({...c,r:radius})};globalThis.goal=${JSON.stringify(target)};globalThis.before=JSON.stringify([gbody,goal,a]);globalThis.next=grid.gridTarget(gbody,goal,a,${cell})`);
    assert.equal(eyeRun('JSON.stringify([gbody,goal,a])'),eyeRun('before'));
    assert.equal(eyeRun('Math.abs(next.col-gbody.col)+Math.abs(next.row-gbody.row)'),1);
    assert.ok(eyeRun(`Math.hypot(next.x,next.y)+${radius}<=200+1e-8`));
    for(const p of [0,.25,.5,.75,1])assert.ok(eyeRun(`Math.hypot(grid.gridPose(gbody,next,${p}).x,grid.gridPose(gbody,next,${p}).y)+${radius}<=200+1e-8`));
   }
  }
 }
 // Actual initialization + selection: no continuous pursuit during entry/rest/windup.
 eyeRun("startTrial('rolling-eye');globalThis.actor=state.boss;globalThis.initial={x:actor.x,y:actor.y};globalThis.events=[];state.player.damageDisabled=true");
 for(let i=0;i<400&&!eyeRun('actor.moves.length');i++)eyeRun('updateTrial(.02);updateBossWeakpoints(.02);events.push(...state.trial.events)');
 assert.equal(eyeRun('actor.moves[0].id'),'grid-roll');
 assert.deepEqual(read('({x:actor.x,y:actor.y})'),read('initial'));
 assert.ok(eyeRun("events.some(e=>e.type==='grid-warning')"));
 eyeRun('globalThis.locked=JSON.stringify(actor.moves[0].target);globalThis.origin=JSON.stringify(actor.moves[0].origin);updateTrial(100);updateBossWeakpoints(100)');
 assert.equal(eyeRun('actor.moves[0].ai.phase'),'windup','slow frame must retain visible warning');
 assert.equal(eyeRun('JSON.stringify(actor.moves[0].target)'),eyeRun('locked'));
 assert.deepEqual(read('({x:actor.x,y:actor.y})'),read('initial'));
 assert.equal(eyeRun("Object.values(actor.weakpoints||{}).some(p=>p.phase==='open')"),false,'roll must not expose eye');
 // Natural cycles reach outward orientation, actual shared exposure, then a laser.
 let sawOpen=false,sawBeam=false,sawActive=false,rolls=0;
 for(let i=0;i<1800&&!sawActive;i++){
  eyeRun('updateTrial(.02);updateBossWeakpoints(.02);events.push(...state.trial.events)');
  if(eyeRun("state.trial.events.some(e=>e.type==='move-phase'&&e.moveId==='grid-roll'&&e.phase==='recovery')")){
   rolls++;
   assert.ok(eyeRun('Math.abs((actor.x-state.trial.arena.x)/80-Math.round((actor.x-state.trial.arena.x)/80))<1e-8'));
   assert.ok(eyeRun('Math.abs((actor.y-state.trial.arena.y)/80-Math.round((actor.y-state.trial.arena.y)/80))<1e-8'));
  }
  const id=eyeRun('actor.moves[0]?.id||null');
  if(id==='eye-beam'){
   sawBeam=true;assert.equal(eyeRun('actor.gridOrientation.face'),3);
   if(eyeRun('trialGridExposure(actor)'))sawOpen=true;
   if(eyeRun("actor.moves[0].ai.phase==='active'")){assert.equal(sawOpen,true);sawActive=true;}
   eyeRun('globalThis.region=actor.moves[0].region;globalThis.anchor=bossWeakpointPoints(actor,bossWeakpointConfig(actor)).weakpoint');
   near(eyeRun('region.origin.x'),eyeRun('anchor.x'));near(eyeRun('region.origin.y'),eyeRun('anchor.y'));
  }
 }
 assert.ok(rolls>0);assert.equal(sawBeam&&sawOpen&&sawActive,true);
 // Independent cancellation setup: actual roll is interrupted, harmless coast ends at its original cell.
 eyeRun("startTrial('rolling-eye');actor=state.boss;state.player.damageDisabled=true");
 for(let i=0;i<500&&!eyeRun('!!actor.gridTransit');i++)eyeRun('updateTrial(.02);updateBossWeakpoints(.02)');
 eyeRun('updateTrial(.1);globalThis.destination=JSON.stringify(actor.gridTransit.target);globalThis.beforeCancel={x:actor.x,y:actor.y};stunTarget(actor,1)');
 for(let i=0;i<50&&eyeRun('!!actor.gridTransit');i++)eyeRun('updateTrial(.02);updateBossWeakpoints(.02)');
 const target=JSON.parse(eyeRun('destination'));near(eyeRun('actor.x'),target.x);near(eyeRun('actor.y'),target.y);
 assert.equal(eyeRun('actor.moves.length'),0);assert.equal(eyeRun('!!actor.gridTransit'),false);
 // Existing displacement hook protects grid alignment without bypassing stun or hit-stop.
 eyeRun('globalThis.beforeShift=JSON.stringify({x:actor.x,y:actor.y});shiftTarget(actor,actor.x-100,actor.y,100);updateTargetSlide(actor,.2)');
 assert.equal(eyeRun('JSON.stringify({x:actor.x,y:actor.y})'),eyeRun('beforeShift'));
 // Bounds, malformed live conditions and supplied Maker data survive ordinary save/load.
 for(const change of ['b.moves[0].blocks.moves[0].effect.gridRoll.cell=59','b.moves[1].blocks.moves[0].effect.beam.width=21','b.moves[1].blocks.moves[0].effect.beam.range=801','b.weakpoint=null',"b.weakpoint.parts[0].conditions=[{type:'windup'}]",'b.weakpoint.parts[0].duration=.5']){
  eyeRun("globalThis.work=SurvivorData.defaults();globalThis.b=work.gallery.bosses.find(b=>b.id==='rolling-eye');"+change);
  assert.equal(eyeRun('SurvivorData.validate(work).valid'),false,change);
 }
 eyeRun("work=SurvivorData.defaults();b=work.gallery.bosses.find(b=>b.id==='rolling-eye');b.moves[0].blocks.moves[0].effect.gridRoll.cell=100;b.moves[1].blocks.moves[0].effect.beam.width=6;b.moves[1].blocks.moves[0].effect.beam.range=420;globalThis.saved=SurvivorData.save(work)");
 assert.equal(eyeRun('saved.valid'),true);assert.deepEqual(read('SurvivorData.load().data.gallery'),read('saved.data.gallery'));
 for(const custom of [false,true]){
  eyeRun(`trialDraft=${custom?'SurvivorData.defaults().gallery':'null'};startTrial('rolling-eye');state.trial.elapsed=23;finishRun(true)`);
  assert.equal(eyeRun(`loadTrialRecords(${custom})['rolling-eye']`),23);
 }
 console.log('PASS: real sixth Eye pure cell bounds, natural warned roll/outward eye/beam, slow-frame warning, cancellation-to-cell, displacement immunity, strict schema/save/load and separate records');
}


{
 const e=createRun(),j=code=>JSON.parse(e('JSON.stringify('+code+')'));
 e("startTrial('rolling-eye');globalThis.eyeBody=state.boss;state.player.damageDisabled=true;globalThis.openSeen=false;globalThis.usedAnimations=[];globalThis.oldPicture=SurvivorArt.picture;SurvivorArt.picture=function(id,animation,...args){if(id==='character/rolling-eye')usedAnimations.push(animation);return oldPicture(id,animation,...args);}");
 for(let i=0;i<1800&&!e('trialGridExposure(eyeBody)');i++)e('updateTrial(.02);updateBossWeakpoints(.02)');
 assert.equal(e('trialGridExposure(eyeBody)'),true);
 e('globalThis.point=bossWeakpointPoints(eyeBody,bossWeakpointConfig(eyeBody)).weakpoint;trialEyePicture(eyeBody)');
 assert.equal(e('usedAnimations.at(-1)'),'eye_open');
 assert.equal(e('resolveBossWeakpoint(eyeBody,{point:{...point,r:0}}).kind'),'critical');
 assert.equal(e('resolveBossWeakpoint(eyeBody,{point:{x:point.x+100,y:point.y,r:0}}).kind'),'armor');
 e('globalThis.phaseBefore=JSON.stringify(eyeBody.weakpoints);hitBuildTarget(eyeBody,10,{point:{...point,r:0}});updateBossWeakpoints(.5)');
 assert.equal(e('eyeBody.feedbackFrozen'),true);assert.equal(e('JSON.stringify(eyeBody.weakpoints)'),e('phaseBefore'),'target hit-stop must freeze actual critical window');
 // Independent fresh instance for cancellation expiry, no previous hit-stop contamination.
 const c=createRun();c("startTrial('rolling-eye');globalThis.eb=state.boss;state.player.damageDisabled=true");
 for(let i=0;i<1800&&!c('trialGridExposure(eb)');i++)c('updateTrial(.02);updateBossWeakpoints(.02)');
 c('stunTarget(eb,1);updateBossWeakpoints(.01)');assert.equal(c('eb.weakpoints.eye.phase'),'closing');
 assert.equal(c('trialGridExposure(eb)'),true);
 for(let i=0;i<20;i++)c('updateBossWeakpoints(.02)');
 assert.equal(c('eb.weakpoints.eye.phase'),'closed');assert.equal(c('trialGridExposure(eb)'),false);
 assert.equal(c('resolveBossWeakpoint(eb).kind'),'armor');
 // Manifest selection and literal original pixels distinguish closed lids from visible iris.
 assert.equal(e("SurvivorArt.lookup('character/rolling-eye','face3').frame"),3);
 assert.equal(e("SurvivorArt.lookup('character/rolling-eye','eye_open').frame"),6);
 const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
 const png=fs.readFileSync(path.join(__dirname,'../art/characters/rolling-eye.png'));let pos=8,chunks=[];
 while(pos<png.length){const n=png.readUInt32BE(pos),type=png.toString('ascii',pos+4,pos+8);if(type==='IDAT')chunks.push(png.subarray(pos+8,pos+8+n));pos+=12+n;}
 assert.equal(png.readUInt32BE(16),112);assert.equal(png.readUInt32BE(20),16);
 const pixels=zlib.inflateSync(Buffer.concat(chunks)),pixel=(frame,x,y)=>Array.from(pixels.subarray(y*(112*4+1)+1+(frame*16+x)*4,y*(112*4+1)+1+(frame*16+x)*4+4));
 assert.deepEqual(pixel(6,6,6),[189,244,223,255]);assert.notDeepEqual(pixel(3,6,6),pixel(6,6,6));
 console.log('PASS: natural actual eye exposure and geometry, selected real open frame, independent cancellation/closing, target hit-stop, original opaque iris pixels');
}


{
 const r=createRun();r("startTrial('rolling-eye');globalThis.eb=state.boss;state.player.invincible=0;state.player.damageDisabled=false");
 for(let i=0;i<400&&!r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
 r('state.player.x=eb.moves[0].target.x;state.player.y=eb.moves[0].target.y;globalThis.hp=state.player.health;globalThis.warned=state.trial.events.some(e=>e.type===\'grid-warning\')');
 assert.equal(r('warned'),true);
 for(let i=0;i<20;i++){r('updateTrial(.02);updateBossWeakpoints(.02)');assert.equal(r('state.player.health'),r('hp'));}
 let rollHit=false;
 for(let i=0;i<100&&!rollHit;i++){r('updateTrial(.02);updateBossWeakpoints(.02)');rollHit=r('state.player.health<hp');}
 assert.equal(rollHit,true,'actual warned roll must damage inside its swept path');
 const l=createRun();l("startTrial('rolling-eye');globalThis.eb=state.boss;state.player.damageDisabled=true");
 for(let i=0;i<1800&&!l("eb.moves[0]?.id==='eye-beam'");i++)l('updateTrial(.02);updateBossWeakpoints(.02)');
 l('globalThis.beam=eb.moves[0];globalThis.g=beam.region;state.player.x=g.origin.x+Math.cos(g.angle)*g.shape.length*.5;state.player.y=g.origin.y+Math.sin(g.angle)*g.shape.length*.5;state.player.invincible=0;state.player.damageDisabled=false;globalThis.hp=state.player.health');
 assert.equal(l("state.trial.events.some(e=>e.type==='beam-warning')"),true);
 let laserHit=false,openBeforeHit=false;
 for(let i=0;i<150&&!laserHit;i++){
  const warning=l("beam.ai.phase==='windup'");
  l('updateTrial(.02);updateBossWeakpoints(.02)');
  if(warning)assert.equal(l('state.player.health'),l('hp'),'warning frame cannot apply laser damage');
  if(l('trialGridExposure(eb)'))openBeforeHit=true;
  laserHit=l('state.player.health<hp');
 }
 assert.equal(laserHit,true);assert.equal(openBeforeHit,true);
 console.log('PASS: separate real-engine warned roll collision and actual beam damage follow visible warning and eye exposure');
}


// Luna blocking findings: real cardinal orientation, disabled beam fallback, no inert Maker controls.
{
 const r=createRun(),read=code=>JSON.parse(r('JSON.stringify('+code+')'));
 const origin={x:0,y:0};
 for(const [face,step,expected,angle] of [[0,{x:60,y:0},1,1],[0,{x:-60,y:0},4,-1],[0,{x:0,y:-60},2,1],[0,{x:0,y:60},5,-1],[1,{x:-60,y:0},0,-1],[1,{x:0,y:-60},1,1],[1,{x:60,y:0},3,1]]){
  const t=read(`SurvivorTrialBlocks.gridTurn(${face},${JSON.stringify(origin)},${JSON.stringify(step)})`);
  assert.equal(t.face,expected);near(t.angle,angle*Math.PI/2);
 }
 function begin(beamEnabled){
  r(`resetGame();globalThis.work=SurvivorData.defaults();globalThis.b=work.gallery.bosses.find(b=>b.id==='rolling-eye');b.moves[0].blocks.moves[0].effect.gridRoll.cell=60;b.moves[1].weight=${beamEnabled};globalThis.valid=SurvivorData.validate(work);trialDraft=valid.data.gallery;startTrial('rolling-eye');globalThis.eb=state.boss;state.player.damageDisabled=true;globalThis.animations=[];globalThis.originalPicture=SurvivorArt.picture;SurvivorArt.picture=function(id,animation,...args){if(id==='character/rolling-eye')animations.push(animation);return originalPicture(id,animation,...args);}`);
  assert.equal(r('valid.valid'),true);
 }
 // Opposite and perpendicular moves deliberately invalidate a simple roll counter.
 const route=[[1,0,1],[-1,0,0],[0,-1,2],[0,1,0],[1,0,1],[1,0,3]];
 function oneRoll(dx,dy,expected){
  r(`state.player.x=eb.x+${dx}*60;state.player.y=eb.y+${dy}*60;globalThis.want={x:state.player.x,y:state.player.y}`);
  assert.equal(r('SurvivorTrialRules.boundary({...want,r:eb.r},state.trial.arena).hit'),false);
  for(let i=0;i<500&&!r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  assert.equal(r('eb.moves[0].id'),'grid-roll','no premature count-based beam');
  assert.deepEqual(read('({x:eb.moves[0].target.x,y:eb.moves[0].target.y})'),read('want'));
  assert.equal(r('eb.moves[0].turn.face'),expected);
  for(let i=0;i<250&&!r('!!eb.gridTransit');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  r('updateTrial(.02);drawCalls.length=0;drawTrialBodies();globalThis.expectedAngle=SurvivorTrialBlocks.gridRenderPose(eb.gridOrientation,eb.gridTransit).angle');
  assert.ok(r("drawCalls.some(c=>c[0]==='rotate'&&Math.abs(c[1]-expectedAngle)<1e-8)"),'real renderer consumes signed step rotation');
  for(let i=0;i<500&&r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  assert.equal(r('eb.gridOrientation.face'),expected);r('trialEyePicture(eb)');assert.equal(r('animations.at(-1)'),'face'+expected);
  assert.equal(r('SurvivorTrialBlocks.gridOutward(eb.gridOrientation)'),expected===3);
 }
 begin(1);for(const args of route)oneRoll(...args);
 for(let i=0;i<100&&!r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
 assert.equal(r('eb.moves[0].id'),'eye-beam');assert.equal(r('eb.gridOrientation.face'),3);
 // Fresh imported valid Maker configuration disables beam, but not locomotion.
 r('SurvivorArt.picture=originalPicture');begin(0);for(const args of route)oneRoll(...args);
 oneRoll(0,1,2); // Front face with disabled beam must immediately recover into a warned roll.
 r("work=SurvivorData.defaults();b=work.gallery.bosses.find(b=>b.id==='rolling-eye');b.moves.forEach(m=>m.weight=0);globalThis.before=localStorage.getItem(SurvivorData.KEY);globalThis.invalid=SurvivorData.save(work)");
 assert.equal(r('invalid.valid'),false,'both-disabled encounter is explicitly unsupported');
 assert.equal(r('localStorage.getItem(SurvivorData.KEY)'),r('before'));
 console.log('PASS: actual E W N S step normals and rendered frames, signed render rotation, outward-only beam scheduling, disabled-beam fallback and both-disabled validation');
}


// v4 regression: full cube basis survives rest, interruption and outward exposure.
{
 const r=createRun(),read=code=>JSON.parse(r('JSON.stringify('+code+')'));
 const dirs=[[1,0],[0,-1],[-1,0],[0,1]],origin={x:0,y:0};
 function turn(pose,dx,dy){return read(`SurvivorTrialBlocks.gridTurn(${JSON.stringify(pose)},${JSON.stringify(origin)},{x:${dx*60},y:${dy*60}}).orientation`);}
 let pose=read('SurvivorTrialBlocks.gridState(0)');
 const initial=pose,seen=new Map(),queue=[pose];
 const key=p=>[p.face,p.up.x,p.up.y,p.up.z].join(',');
 while(queue.length){const p=queue.shift();if(seen.has(key(p)))continue;seen.set(key(p),p);for(const [dx,dy] of dirs)queue.push(turn(p,dx,dy));}
 assert.equal(seen.size,24,'all and only the 24 discrete cube orientations');
 for(const p of seen.values())for(const [dx,dy] of dirs){
  assert.deepEqual(turn(turn(p,dx,dy),-dx,-dy),p,'inverse steps restore complete pose');
  let four=p;for(let i=0;i<4;i++)four=turn(four,dx,dy);assert.deepEqual(four,p,'four identical turns restore full basis');
 }
 for(const [dx,dy] of [[1,0],[0,-1],[-1,0]])pose=turn(pose,dx,dy);
 assert.deepEqual(pose,{face:0,up:{x:1,y:0,z:0}});
 near(r(`SurvivorTrialBlocks.gridTwist(${JSON.stringify(pose)})`),Math.PI/2);
 assert.equal(r(`SurvivorTrialBlocks.gridOutward(${JSON.stringify(pose)})`),false);
 function begin(){
  r("globalThis.work=SurvivorData.defaults();work.gallery.bosses.find(b=>b.id==='rolling-eye').moves[0].blocks.moves[0].effect.gridRoll.cell=60;trialDraft=SurvivorData.validate(work).data.gallery;startTrial('rolling-eye');globalThis.eb=state.boss;state.player.damageDisabled=true;globalThis.frames=[];globalThis.pictureBefore=SurvivorArt.picture;SurvivorArt.picture=function(id,animation,...args){if(id==='character/rolling-eye')frames.push(animation);return pictureBefore(id,animation,...args);}");
 }
 function actualRoll(dx,dy){
  const before=read('eb.gridOrientation');
  r(`state.player.x=eb.x+${dx}*60;state.player.y=eb.y+${dy}*60`);
  for(let i=0;i<500&&!r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  assert.equal(r('eb.moves[0].id'),'grid-roll');
  for(let i=0;i<500&&r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  const expected=turn(before,dx,dy);assert.deepEqual(read('eb.gridOrientation'),expected);
  r('drawCalls.length=0;drawTrialBodies();trialEyePicture(eb)');
  const angle=r('SurvivorTrialBlocks.gridTwist(eb.gridOrientation)');
  assert.ok(r(`drawCalls.some(c=>c[0]==='rotate'&&Math.abs(c[1]-${angle})<1e-8)`),'rest renderer retains in-plane twist');
  assert.equal(r('frames.at(-1)'),'face'+expected.face);
  return expected;
 }
 function reachBeam(){
  for(let i=0;i<100&&!r('eb.moves.length');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  assert.equal(r('eb.moves[0].id'),'eye-beam');
  for(let i=0;i<100&&!r('!!trialGridExposure(eb)');i++)r('updateTrial(.02);updateBossWeakpoints(.02)');
  assert.equal(r('SurvivorTrialBlocks.gridOutward(eb.gridOrientation)'),true);
  assert.equal(r('!!trialGridExposure(eb)'),true);r('drawCalls.length=0;drawTrialBodies();trialEyePicture(eb)');
  assert.equal(r('frames.at(-1)'),'eye_open');
  const angle=r('SurvivorTrialBlocks.gridTwist(eb.gridOrientation)');
  assert.ok(r(`drawCalls.some(c=>c[0]==='rotate'&&Math.abs(c[1]-${angle})<1e-8)`),'open eye retains same stable twist');
  assert.ok(r("drawCalls.some(c=>c[0]==='translate'&&Math.abs(c[1]-bossWeakpointPoints(eb,bossWeakpointConfig(eb)).weakpoint.x)<1e-8&&Math.abs(c[2]-bossWeakpointPoints(eb,bossWeakpointConfig(eb)).weakpoint.y)<1e-8)"),'sprite rotation pivot is real weakpoint/beam anchor');
  return read('eb.gridOrientation');
 }
 begin();actualRoll(1,0);actualRoll(1,0);const direct=reachBeam();r('SurvivorArt.picture=pictureBefore');
 begin();actualRoll(1,0);actualRoll(0,-1);const rest=actualRoll(-1,0);
 assert.deepEqual(rest,{face:0,up:{x:1,y:0,z:0}});near(r('SurvivorTrialBlocks.gridTwist(eb.gridOrientation)'),Math.PI/2);
 // E N W has the original normal but a different persistent rendered twist.
 assert.notDeepEqual(rest,initial);actualRoll(1,0);actualRoll(1,0);const twisted=reachBeam();
 assert.equal(direct.face,3);assert.equal(twisted.face,3);assert.notDeepEqual(direct.up,twisted.up);
 near(r(`SurvivorTrialBlocks.gridTwist(${JSON.stringify(direct)})`),0);near(r('SurvivorTrialBlocks.gridTwist(eb.gridOrientation)'),Math.PI/2);
 r('SurvivorArt.picture=pictureBefore');
 console.log('PASS: 24 full cube bases, inverse/four-turn laws, actual E N W rest twist, same-outward distinct twist and truthful beam/eye renderer pivot');
}
