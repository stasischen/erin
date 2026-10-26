// 遊戲內設計室事件：卡片、積木、觸控加減、儲存、返回、失敗阻擋。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attrs={};this.value='';this._text='';this.hidden=true;this.style={setProperty(){}};this.classList={add(){},remove(){}};}
  appendChild(n){this.children.push(n);return n;}
  set textContent(s){this._text=s;this.children=[];}get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
  addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=v;}
  focus(){this.focused=true;} scrollIntoView(){} getContext(){return {fillRect(){},drawImage(){}};}
  fire(event){if(this.listeners[event])this.listeners[event]({target:this,preventDefault(){}});}
}
function setup(options={}){
  const storage={...options.saved}, ids=Object.fromEntries(['editor','makerStatus','save','play','reset','makerPanel','makerLink','makerClose','overlay'].map(id=>[id,new Node()]));
  const tabs=['schools','cards','enemies','boss','numbers'].map(tab=>{const n=new Node('button');n.dataset.tab=tab;return n;});
  const location={href:'',search:options.search||''}, state={keys:new Set(),mode:'ready'},window={addEventListener(){}};
  const context=vm.createContext({console,window,location,state,MAKER_MODE:!!options.maker,URLSearchParams,drawBlob(){},updateActionControls(){},showOverlay(mode){state.mode=mode;},document:{createElement:tag=>new Node(tag),getElementById:id=>ids[id]||(ids[id]=new Node()),querySelectorAll:()=>tabs},localStorage:{getItem:k=>storage[k]||null,setItem(k,v){if(options.fails)throw Error('full');storage[k]=v;}}});
  for(const file of ['render/monsters.js','icons.js','data/defaults.js','data/schema.js','maker/maker.js'])vm.runInContext(fs.readFileSync(`${__dirname}/../${file}`,'utf8'),context);
  function nodes(node=ids.editor){return node.children.flatMap(c=>[c,...nodes(c)]);}
  function tab(name){tabs.find(n=>n.dataset.tab===name).fire('click');}
  function click(text,exact=true){const n=nodes().find(n=>n.tag==='button'&&(exact?n._text===text:n._text.includes(text)));assert.ok(n,text);n.fire('click');}
  function field(label,value){const row=nodes().find(n=>n.tag==='label'&&n._text===label);assert.ok(row,label);const input=row.children[0];input.value=value;input.fire('input');}
  return {ids,nodes,tab,click,field,storage,location,state,window};
}
let ui=setup();ui.ids.makerLink.fire('click');assert.equal(ui.state.mode,'maker');assert.equal(ui.ids.makerPanel.hidden,false);
for(const name of ['cards','enemies','boss','numbers','schools']) {ui.tab(name);assert.ok(ui.nodes().length);assert.ok(!ui.nodes().some(n=>n.tag==='select'||(n.tag==='input'&&!['text','range'].includes(n.type))));}
ui.field('水','彩虹水');ui.ids.save.fire('click');ui.field('水','彩虹水二');ui.ids.save.fire('click');
assert.equal(JSON.parse(ui.storage['erin-survivor-maker-v1']).build.water.name,'彩虹水二');
ui.tab('cards');const levelRow=ui.nodes().find(n=>n.className==='maker-number');const level=levelRow.children[1].children[0];ui.nodes(levelRow).find(n=>n._text==='−').fire('click');assert.equal(level.textContent,'4');ui.nodes(levelRow).find(n=>n._text==='＋').fire('click');assert.equal(level.textContent,'5');ui.field('卡片名稱','我的新招');ui.nodes().find(n=>n.attrs['aria-label']==='暴風雨').fire('click');ui.click('暈眩');ui.click('按衝刺時');ui.ids.play.fire('click');
assert.equal(ui.location.href,'?maker=1&play=1');
let data=JSON.parse(ui.storage['erin-survivor-maker-v1']);assert.equal(data.cards[0].name,'我的新招');assert.equal(data.cards[0].icon,'fusion-storm');assert.equal(data.cards[0].effects[0].type,'stun');assert.equal(data.cards[0].effects[0].trigger,'dash');
ui=setup({saved:{'erin-survivor-maker-v1':JSON.stringify(data)}});ui.tab('cards');
ui.click('連發水球',false);ui.click('＋ 我的新招');ui.ids.save.fire('click');
ui.click('我的新招');ui.click('＋ 連發水球');const before=ui.storage['erin-survivor-maker-v1'];ui.ids.play.fire('click');assert.equal(ui.location.href,'');assert.equal(ui.storage['erin-survivor-maker-v1'],before);assert.ok(ui.ids.makerStatus.textContent.includes('圈'));
ui.ids.reset.fire('click');data=JSON.parse(ui.storage['erin-survivor-maker-v1']);assert.equal(data.cards[0].name,'水球加大');
ui=setup({fails:true});ui.ids.play.fire('click');assert.equal(ui.location.href,'');assert.ok(ui.ids.makerStatus.textContent.includes('無法儲存'));
ui=setup({search:'?editor=1'});assert.equal(ui.state.mode,'maker');ui.ids.makerClose.fire('click');assert.equal(ui.state.mode,'ready');assert.equal(ui.ids.makerPanel.hidden,true);
ui=setup({maker:true});ui.window.openSurvivorMaker('試玩結束');assert.equal(ui.state.mode,'maker');assert.equal(ui.ids.makerStatus.textContent,'試玩結束');ui.ids.makerClose.fire('click');assert.equal(ui.location.href,'./');
// 勝敗都呼叫實際的遊戲返回事件；一般模式保留原結算。
const createRun=require('./maker-support.cjs');
for(const won of [false,true]){const run=createRun({maker:true});run('window.openSurvivorMaker = text => { globalThis.result = text; state.mode="maker"; }; startGame(); state.stageIndex=STAGES.length-1;');run(`finishRun(${won});`);assert.equal(run('state.mode'),'maker');assert.ok(run('result').includes(won?'過關':'結束'));}
console.log('PASS: in-game entry/exit, five custom-control tabs, names/icons/effect edits persist, play route, cycles/storage failure block play, reset, both game outcomes return to Maker');

// 造型按鈕要有真實像素縮圖，換裝後存檔且不改怪物能力。
ui=setup();ui.tab('enemies');
const skins=ui.nodes().filter(n=>n.tag==='button'&&n.attrs['aria-label']==='蘑菇跳跳');
assert.equal(skins.length,8);assert.ok(skins[0].children.some(n=>n.tag==='canvas'));
skins[0].fire('click');ui.ids.save.fire('click');
const skinData=JSON.parse(ui.storage['erin-survivor-maker-v1']);
assert.equal(skinData.enemies[0].spriteId,'mushroom-hopper');
assert.equal(skinData.enemies[0].hp,120);assert.equal(skinData.enemies[0].attack.type,'projectile');
console.log('PASS: Maker skin thumbnails, selection and persistence preserve behavior');

// 魔王安全圈：操作真正的 Maker 控制項後儲存、重載。
ui=setup();ui.tab('boss');ui.click('紫霧縮圈：開');
for (const [label,value] of [['縮圈次數（每階段一次）',2],['縮圈速度（每秒距離）',75],['紫霧每秒扣血',1.5]]) {
 const slider=ui.nodes().find(n=>n.tag==='input' && n.attrs['aria-label']===label);
 assert.ok(slider,label);slider.value=value;slider.fire('input');
}
ui.ids.save.fire('click');
assert.deepEqual(JSON.parse(ui.storage['erin-survivor-maker-v1']).bossZone,{enabled:false,steps:2,speed:75,damage:1.5});
ui=setup({saved:ui.storage});ui.tab('boss');assert.ok(ui.nodes().some(n=>n._text==='紫霧縮圈：關'));
console.log('PASS: Maker zone toggle/count/speed/damage controls persist and reload');

// 精英與大熊：真正操作新開關、能力選擇、圖示加減、滑桿與儲存重載。
ui=setup();ui.tab('enemies');
const switchButton=label=>ui.nodes().find(n=>n.tag==='button'&&n.attrs['aria-label']===label);
switchButton('啟用精英怪：開').fire('click');
switchButton('啟用巧克力大熊：開').fire('click');
switchButton('傳送：開').fire('click');
for (const [label,value] of [['精英抽選間隔秒數',25],['每次抽選出現機率',.7],['糖衣盔甲血量',250],['重擊預警秒數',2]]) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(slider);slider.value=value;slider.fire('input');
}
const minus=ui.nodes().find(n=>n.tag==='button'&&n.attrs['aria-label']==='擊敗精英獎勵經驗 減少');
assert.ok(minus.innerHTML.includes('pixel-icon'));assert.equal(minus._text,'');minus.fire('click');
ui.field('小頭目名稱','糖衣大熊');ui.ids.save.fire('click');
const encounterData=JSON.parse(ui.storage['erin-survivor-maker-v1']);
assert.equal(encounterData.elites.enabled,false);assert.equal(encounterData.chocobear.enabled,false);
assert.equal(encounterData.elites.interval,25);assert.equal(encounterData.elites.chance,.7);assert.equal(encounterData.elites.rewardXp,4);
assert.equal(encounterData.elites.abilities.includes('teleport'),false);assert.equal(encounterData.chocobear.armor,250);assert.equal(encounterData.chocobear.slamWarning,2);assert.equal(encounterData.chocobear.name,'糖衣大熊');
ui=setup({saved:ui.storage});ui.tab('enemies');assert.ok(switchButton('啟用精英怪：關'));assert.ok(switchButton('傳送：關'));
console.log('PASS: Maker elite/bear icon toggles, abilities, numeric controls, name, save/reload');
// 出怪節奏、波次型態、每關密度和八種怪物皆可實際儲存重載。
ui=setup();ui.tab('enemies');
for(const [label,value] of [['出怪密度倍率',.6],['強波密度倍率',1.3],['喘息波密度倍率',.5],['強弱交替秒數',15],['每次事件怪物數',4]]) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(slider,label);slider.value=value;slider.fire('input');
}
const waveSlider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']==='0 秒起出怪間隔');assert.ok(waveSlider);waveSlider.value=2.5;waveSlider.fire('input');
assert.ok(ui.nodes().filter(n=>n.tag==='input'&&n.attrs['aria-label']==='移動速度').length>=8);
assert.equal(ui.nodes().filter(n=>n.tag==='canvas'&&n.attrs['aria-label']&&n.attrs['aria-label'].endsWith('角色預覽')).length,8);
ui.click('穩定出怪');ui.ids.save.fire('click');
const pacingData=JSON.parse(ui.storage['erin-survivor-maker-v1']);assert.equal(pacingData.pacing.density,.6);assert.equal(pacingData.pacing.pattern,'steady');assert.equal(pacingData.stages[0].waves[0].every,2.5);
ui=setup({saved:ui.storage});ui.tab('enemies');assert.ok(ui.nodes().some(n=>n._text==='波次型態：穩定出怪'));
console.log('PASS: Maker density/strong/weak/cycle/event count, pattern selector, stage wave intervals and all eight speed controls persist');

// 錘子數值的真實 Maker 控制項可存檔與重載。
ui=setup();ui.tab('numbers');
for(const [label,value] of [['揮錘間隔秒',1],['揮擊距離',100],['每幾下旋轉一圈',3],['受到傷害減少比例',.2]]) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(slider,label);slider.value=value;slider.fire('input');
}
ui.ids.save.fire('click');const weapons=JSON.parse(ui.storage['erin-survivor-maker-v1']).weapons;
assert.equal(weapons[1].interval,1);assert.equal(weapons[1].radius,100);assert.equal(weapons[1].spinEvery,3);assert.equal(weapons[1].damageReduction,.2);
ui=setup({saved:ui.storage});ui.tab('numbers');assert.equal(ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']==='揮擊距離').value,100);
console.log('PASS: Maker melee cadence/range/spin/mitigation controls persist and reload');

ui=setup();ui.tab('numbers');ui.click('搖桿跟隨：開');
for(const [label,value] of [['搖桿半徑',50],['搖桿死區',7]]) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(slider);slider.value=value;slider.fire('input');
}
ui.ids.save.fire('click');
assert.deepEqual(JSON.parse(ui.storage['erin-survivor-maker-v1']).joystick,{follow:false,radius:50,deadZone:7});
ui=setup({saved:ui.storage});ui.tab('numbers');
assert.ok(ui.nodes().some(n=>n._text==='搖桿跟隨：關'&&n.attrs['aria-checked']==='false'));
console.log('PASS: Maker joystick switch/sliders save and reopen');

// 身體／招式分開的實際控制項：編輯、儲存及重載。
ui=setup();ui.tab('enemies');ui.click('碰撞只會推開，不會受傷：關');
for(const [label,value] of [['身體傷害倍率（所有小怪，Boss 除外）',.5],['起手預警秒數',1.5],['收招停頓秒數',1],['四周子彈缺口角度',90]]) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(slider,label);slider.value=value;slider.fire('input');
}
ui.click('使用分階段攻擊：關');ui.ids.save.fire('click');
const phaseData=JSON.parse(ui.storage['erin-survivor-maker-v1']);
assert.deepEqual(phaseData.bodyContact,{pushOnly:true,damageScale:.5});
assert.equal(phaseData.enemies[0].phaseAttack.enabled,true);assert.equal(phaseData.enemies[0].phaseAttack.windup,1.5);
assert.equal(phaseData.enemies[0].phaseAttack.recovery,1);assert.equal(phaseData.enemies[0].phaseAttack.gapDegrees,90);
ui=setup({saved:ui.storage});ui.tab('enemies');assert.ok(ui.nodes().some(n=>n._text==='碰撞只會推開，不會受傷：開'&&n.attrs['aria-checked']==='true'));
console.log('PASS: Maker body push switch, damage scale, phase timing/shape parameters, enabling attack, save/reopen');

ui=setup();ui.tab('enemies');ui.click('身體柔性分離：開');
for(const [label,value] of [['身體半徑倍率',1.2],['主角與怪物推力',.8],['怪物之間推力',.4]]) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(slider,label);slider.value=value;slider.fire('input');
}
ui.ids.save.fire('click');
assert.deepEqual(JSON.parse(ui.storage['erin-survivor-maker-v1']).bodySeparation,{enabled:false,radiusScale:1.2,playerForce:.8,enemyForce:.4});
ui=setup({saved:ui.storage});ui.tab('enemies');
assert.ok(ui.nodes().some(n=>n._text==='身體柔性分離：關'&&n.attrs['aria-checked']==='false'));
console.log('PASS: Maker body separation toggle, radius and two forces persist and reload');

// Weight controls persist and reopen alongside individual enemy mass.
function weightField(label,value) {
 const slider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);
 assert.ok(slider,label);slider.value=value;slider.fire('input');
}
ui=setup();ui.tab('enemies');
ui.click('重量影響推拉：開');
weightField('重量影響（越大越難推動大怪）',2);
weightField('小頭目重量',10);weightField('老師重量',50);
weightField('老師推拉倍率（0 固定不動）',.2);weightField('重量',5);
ui.ids.save.fire('click');
const weightData=JSON.parse(ui.storage['erin-survivor-maker-v1']);
assert.deepEqual(weightData.knockback,{enabled:false,strength:2,minibossMass:10,bossMass:50,bossMultiplier:.2});
assert.equal(weightData.enemies[0].mass,5);
ui=setup({saved:ui.storage});ui.tab('enemies');
assert.ok(ui.nodes().some(n=>n._text==='重量影響推拉：關'));
const massSlider=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']==='重量');
assert.equal(Number(massSlider.value),5);
console.log('PASS: Maker weight toggle, strength, boss/miniboss mass, boss multiplier and per-enemy mass save/reopen');
