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
  const tabs=['weapons','cards','enemies','boss','stages','rules'].map(tab=>{const n=new Node('button');n.dataset.tab=tab;return n;});
  const location={href:'',search:options.search||''}, state={keys:new Set(),mode:'ready'},window={addEventListener(){}};
  const calls=[];
  const context=vm.createContext({SurvivorPreview:{stop(){},refresh(){},mount(host,data,spec){calls.push({kind:'preview',data,spec});}},SurvivorPractice:{close(){},refresh(){},mount(){},unmount(){},open(data,container,onClose,id){calls.push({kind:'practice',data,id});}},console,window,location,state,MAKER_MODE:!!options.maker,URLSearchParams,drawBlob(){},updateActionControls(){},showOverlay(mode){state.mode=mode;},document:{createElement:tag=>new Node(tag),getElementById:id=>ids[id]||(ids[id]=new Node()),querySelectorAll:()=>tabs},localStorage:{getItem:k=>storage[k]||null,setItem(k,v){if(options.fails)throw Error('full');storage[k]=v;}}});
  for(const file of ['render/monsters.js','icons.js','data/defaults.js','data/schema.js','maker/maker.js'])vm.runInContext(fs.readFileSync(`${__dirname}/../${file}`,'utf8'),context);
  function nodes(node=ids.editor){return node.children.flatMap(c=>[c,...nodes(c)]);}
  function tab(name){tabs.find(n=>n.dataset.tab===name).fire('click');}
  function click(text,exact=true){const n=nodes().find(n=>n.tag==='button'&&(exact?n._text===text:n._text.includes(text)));assert.ok(n,text);n.fire('click');}
  function item(id){const n=nodes().find(n=>n.dataset.item===id);assert.ok(n,id);n.fire('click');}
  function field(label,value){const row=nodes().find(n=>n.tag==='label'&&n._text===label);assert.ok(row,label);const input=row.children[0];input.value=value;input.fire('input');}
  return {ids,nodes,tab,item,click,field,storage,location,state,window,context,calls};
}
// 外殼必須只編輯一個項目；舊作品不需要轉換資料。
let ui=setup();ui.ids.makerLink.fire('click');assert.equal(ui.state.mode,'maker');
const defaults=JSON.parse(vm.runInContext('JSON.stringify(SurvivorData.defaults())',ui.context));
const slider=(label,value)=>{const n=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(n,label);n.value=value;n.fire('input');return n;};
const choose=(tab,id)=>{ui.tab(tab);ui.item(id);};
const saved=()=>JSON.parse(ui.storage['erin-survivor-maker-v1']);
for(const tab of ['weapons','cards','enemies','boss','stages','rules']) {ui.tab(tab);assert.ok(ui.nodes().length);assert.equal(ui.nodes().filter(n=>n.className==='maker-item-heading').length,1);}
ui.ids.save.fire('click');assert.deepEqual(saved(),defaults,'只切分頁不改作品或戰鬥數值');
choose('cards','schools');ui.field('水','彩虹水');
choose('cards',defaults.cards[0].id);ui.field('卡片名稱','我的新招');
slider('最高等級',4);ui.click('暈眩');ui.click('按衝刺時');
choose('cards','rapid-water');ui.click('＋ 我的新招');ui.ids.save.fire('click');
assert.equal(saved().cards[0].name,'我的新招');assert.equal(saved().cards[0].effects[0].type,'stun');assert.equal(saved().cards[0].effects[0].trigger,'dash');assert.equal(saved().build.water.name,'彩虹水');
// 各武器的相同名稱欄位分別儲存，不會改到另一把武器。
for(const [i,w] of defaults.weapons.entries()) {choose('weapons',w.id);slider('站定聚氣秒數',[.8,1.2,1.5][i]);slider('最後一段傷害倍率',[1.8,2,3][i]);slider('開始移動保留聚氣比例（0 為重置）',[0,.5,1][i]);assert.equal(ui.nodes().filter(n=>n.tag==='input'&&n.attrs['aria-label']==='站定聚氣秒數').length,1);}
ui.click('自動聚氣：開');ui.ids.save.fire('click');assert.deepEqual(saved().weapons.map(w=>w.chargeSeconds),[.8,1.2,1.5]);assert.deepEqual(saved().weapons.map(w=>w.chargeEnabled),[true,true,false]);
choose('weapons','candy-hammer');slider('揮擊距離',100);slider('受到傷害減少比例',.2);
// 八種怪物逐一可編輯，畫面只建立選中的造型與攻擊。
for(const [i,e] of defaults.enemies.entries()) {choose('enemies',e.id);assert.equal(ui.nodes().filter(n=>n.tag==='canvas'&&n.attrs['aria-label']&&n.attrs['aria-label'].endsWith('角色預覽')).length,1);slider('移動速度',60+i);}
choose('enemies',defaults.enemies[0].id);ui.nodes().find(n=>n.tag==='button'&&n.attrs['aria-label']==='蘑菇跳跳').fire('click');
slider('重量',5);slider('起手預警秒數',1.5);slider('收招停頓秒數',1);slider('四周子彈缺口角度',90);ui.click('使用分階段攻擊：關');
choose('boss','zone');ui.click('紫霧縮圈：開');slider('縮圈速度（每秒距離）',75);
choose('boss',defaults.boss.moves[0].id);slider('預警秒數',1.2);
choose('boss','phases');ui.field('魔王名稱','我的老師');
choose('stages','pacing');slider('出怪密度倍率',.6);ui.click('穩定出怪');
choose('stages',defaults.stages[0].id);slider('0 秒起出怪間隔',2.5);
choose('stages','elites');ui.nodes().find(n=>n.attrs['aria-label']==='啟用精英怪：開').fire('click');slider('精英抽選間隔秒數',25);
choose('stages','chocobear');ui.field('小頭目名稱','糖衣大熊');slider('糖衣盔甲血量',250);
choose('rules','body');ui.click('碰撞只會推開，不會受傷：關');ui.click('身體柔性分離：開');ui.click('重量影響推拉：開');slider('老師重量',50);
// 每個規則項目的可見標籤不可洩漏原始欄位名。
for(const id of ['defaults','body','neutral','schoolRules','tuning','build','bossTuning']) {choose('rules',id);for(const n of ui.nodes().filter(n=>n.tag==='input'&&n.type==='range')) assert.match(n.attrs['aria-label'],/[\u3400-\u9fff]/,id+': '+n.attrs['aria-label']);}
choose('rules','defaults');let details=ui.nodes().find(n=>n.tag==='details');details.open=true;
ui.click('搖桿跟隨：開');assert.equal(ui.nodes().find(n=>n.tag==='details').open,true,'切換後仍展開');
ui.click('音樂：開');assert.equal(ui.nodes().find(n=>n.tag==='details').open,true);
ui.click('自動');assert.equal(ui.nodes().find(n=>n.tag==='details').open,true);slider('搖桿大小',50);
ui.ids.save.fire('click');const data=saved();
assert.equal(data.weapons[1].radius,100);assert.equal(data.weapons[1].damageReduction,.2);
assert.deepEqual(data.enemies.map(e=>e.speed),defaults.enemies.map((e,i)=>60+i));
assert.equal(data.enemies[0].spriteId,'mushroom-hopper');assert.equal(data.enemies[0].mass,5);assert.equal(data.enemies[0].phaseAttack.enabled,true);assert.equal(data.enemies[0].phaseAttack.windup,1.5);
assert.equal(data.bossZone.speed,75);assert.equal(data.bossZone.enabled,false);assert.equal(data.boss.moves[0].warning,1.2);assert.equal(data.boss.name,'我的老師');
assert.equal(data.pacing.pattern,'steady');assert.equal(data.pacing.density,.6);assert.equal(data.stages[0].waves[0].every,2.5);assert.equal(data.elites.enabled,false);assert.equal(data.chocobear.armor,250);
assert.equal(data.bodyContact.pushOnly,true);assert.equal(data.bodySeparation.enabled,false);assert.equal(data.knockback.bossMass,50);assert.equal(data.knockback.enabled,false);
assert.equal(data.playerDefaults.joystickRadius,50);assert.equal(data.playerDefaults.joystickFollow,false);assert.equal(data.playerDefaults.attackMode,'auto');assert.equal(data.playerDefaults.attackModeChosen,true);
ui=setup({saved:ui.storage});ui.ids.save.fire('click');assert.deepEqual(saved(),data,'重新載入保留全部修改');
ui.ids.play.fire('click');assert.equal(ui.location.href,'?maker=1&play=1');
// 前置卡循環與儲存失敗仍擋住試玩。
choose('cards',defaults.cards[0].id);ui.click('＋ 連發水球');const before=ui.storage['erin-survivor-maker-v1'];ui.location.href='';ui.ids.play.fire('click');assert.equal(ui.location.href,'');assert.equal(ui.storage['erin-survivor-maker-v1'],before);assert.ok(ui.ids.makerStatus.textContent.includes('圈'));
ui.ids.reset.fire('click');assert.deepEqual(saved(),defaults);
ui=setup({fails:true});ui.ids.play.fire('click');assert.equal(ui.location.href,'');assert.ok(ui.ids.makerStatus.textContent.includes('無法儲存'));
ui=setup({search:'?editor=1'});assert.equal(ui.state.mode,'maker');ui.ids.makerClose.fire('click');assert.equal(ui.state.mode,'ready');
ui=setup({maker:true});ui.window.openSurvivorMaker('試玩結束');assert.equal(ui.ids.makerStatus.textContent,'試玩結束');ui.ids.makerClose.fire('click');assert.equal(ui.location.href,'./');
console.log('PASS: six Maker tabs, one item, every old editor reachable, Chinese rule labels, defaults stay open, independent edits/save/reload, no behavior change from navigation, cycles/storage failure block play, entry/exit');

// 項目旁的試玩帶目前草稿與所選 id；開關預覽不改存檔。
ui=setup();choose('weapons','candy-hammer');slider('揮擊距離',105);ui.click('試玩');
assert.equal(ui.calls[ui.calls.length-1].kind,'practice');assert.equal(ui.calls[ui.calls.length-1].id,'candy-hammer');assert.equal(ui.calls[ui.calls.length-1].data.weapons[1].radius,105);
choose('enemies',defaults.enemies[1].id);slider('移動速度',75);ui.click('試玩');assert.equal(ui.calls[ui.calls.length-1].id,defaults.enemies[1].id);assert.equal(ui.calls[ui.calls.length-1].data.enemies[1].speed,75);
choose('cards',defaults.cards[0].id);ui.click('試玩');assert.equal(ui.calls[ui.calls.length-1].spec.id,defaults.cards[0].id);
choose('boss',defaults.boss.moves[0].id);ui.click('試玩');assert.equal(ui.calls[ui.calls.length-1].spec.kind,'move');
ui=setup();ui.click('預覽');assert.equal(ui.nodes().find(n=>n.className==='maker-preview').hidden,false);ui.click('收起預覽');assert.equal(ui.nodes().find(n=>n.className==='maker-preview').hidden,true);
choose('rules','defaults');const outer=ui.nodes().find(n=>n.tag==='details');outer.open=true;ui.click('預覽');assert.equal(ui.nodes().find(n=>n.tag==='details').open,true);
console.log('PASS: selected weapon/enemy draft trial routing, card/boss effect trials, preview toggle and defaults expansion survive rendering');
