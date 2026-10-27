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
// 外殼必須只編輯一個項目；舊作品不需要轉換資料。
let ui=setup();ui.ids.makerLink.fire('click');assert.equal(ui.state.mode,'maker');
const defaults=JSON.parse(vm.runInContext('JSON.stringify(SurvivorData.defaults())',ui.context));
const slider=(label,value)=>{const n=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(n,label);n.value=value;n.fire('input');return n;};
const choose=(tab,id)=>{ui.tab(tab);ui.item(id);};
const saved=()=>JSON.parse(ui.storage['erin-survivor-maker-v1']);
for(const tab of ['weapons','cards','enemies','boss','stages','rules']) {ui.tab(tab);assert.ok(ui.nodes().length);assert.equal(ui.nodes().filter(n=>n.className==='maker-item-heading').length,1);}
ui.ids.save.fire('click');assert.deepEqual(saved(),JSON.parse(vm.runInContext('JSON.stringify(SurvivorData.validate(SurvivorData.defaults()).data)',ui.context)),'切分頁只補相容時機格式，不改戰鬥數值');
choose('cards','schools');ui.field('水','彩虹水');
choose('cards',defaults.cards[0].id);ui.field('卡片名稱','我的新招');
slider('最高等級',4);ui.click('暈眩');ui.click('按衝刺時');
choose('cards','rapid-water');ui.click('＋ 我的新招');ui.ids.save.fire('click');
assert.equal(saved().cards[0].name,'我的新招');assert.equal(saved().cards[0].effects[0].type,'stun');assert.equal(saved().cards[0].effects[0].trigger,'dash');assert.equal(saved().build.water.name,'彩虹水');
// 各武器的相同名稱欄位分別儲存，不會改到另一把武器。
for(const [i,w] of defaults.weapons.entries()) {choose('weapons',w.id);slider('站定聚氣秒數',[.8,1.2,1.5][i]);slider('最後一段傷害倍率',[1.8,2,3][i]);slider('開始移動保留聚氣比例（0 為重置）',[0,.5,1][i]);assert.equal(ui.nodes().filter(n=>n.tag==='input'&&n.attrs['aria-label']==='站定聚氣秒數').length,1);}
ui.click('自動聚氣：開');ui.ids.save.fire('click');assert.deepEqual(saved().weapons.map(w=>w.chargeSeconds),[.8,1.2,1.5]);assert.deepEqual(saved().weapons.map(w=>w.chargeEnabled),[true,true,false]);
choose('weapons','candy-hammer');
assert.equal(ui.nodes().filter(n=>n.className==='weapon-block').length,20,'四招各五種可收合積木');
const folded=ui.nodes().find(n=>n.className==='weapon-block');folded.open=false;folded.fire('toggle');
ui.click('自動聚氣：開');
assert.equal(ui.nodes().find(n=>n.className==='weapon-block').open,false,'切換招式選項保留收合狀態');
ui.click('自動聚氣：關');
slider('起手預警秒數',.25);
assert.ok(ui.nodes().some(n=>n.className==='timing-timeline'&&n.textContent.includes('起手 0.25秒')));
slider('特殊招冷卻秒數',4);slider('特殊招傷害倍率',2.5);
slider('揮擊距離',100);slider('受到傷害減少比例',.2);
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
assert.equal(data.weapons[1].timing.windup,.25);assert.equal(data.weapons[0].timing.windup,.1);
assert.equal(data.enemies[0].phaseAttack.timing.windup,1.5);
assert.equal(data.weapons[1].blocks.moves[3].timing.specialCooldown,4);
assert.equal(data.weapons[1].specialDamage,2.5);
assert.equal(data.weapons[1].blocks.moves[0].shape.radius,100);
assert.equal(data.weapons[1].blocks.moves[0].timing.phases.windup,.25);
assert.equal(data.weapons[0].blocks.moves[2].trigger.chargeSeconds,.8);
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
ui.ids.reset.fire('click');assert.deepEqual(saved(),JSON.parse(vm.runInContext('JSON.stringify(SurvivorData.validate(SurvivorData.defaults()).data)',ui.context)));
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

// 怪物與老師使用武器同款五積木；編輯、收合、預覽與試玩不會混寫其他來源。
ui=setup();choose('enemies','pudding');
assert.equal(ui.nodes().filter(n=>n.className==='weapon-block').length,10);
let enemyFold=ui.nodes().find(n=>n.className==='weapon-block');enemyFold.open=false;enemyFold.fire('toggle');
slider('觸發距離',125);slider('起手預警秒數',1.4);
ui.click('使用分階段攻擊：開');
assert.equal(ui.nodes().find(n=>n.className==='weapon-block').open,false);
ui.click('使用分階段攻擊：關');
ui.ids.save.fire('click');
let blockData=saved(),pudding=blockData.enemies.find(e=>e.id==='pudding');
assert.equal(pudding.blocks.moves[0].trigger.triggerDistance,125);
assert.equal(pudding.blocks.moves[0].timing.windup,1.4);
assert.equal(pudding.phaseAttack.windup,1.4);
ui.click('試這隻');assert.equal(ui.calls[ui.calls.length-1].id,'pudding');
assert.equal(ui.calls[ui.calls.length-1].data.enemies.find(e=>e.id==='pudding').phaseAttack.windup,1.4);
choose('enemies','jaben');slider('開始攻擊等級',3);
choose('boss','words');
assert.equal(ui.nodes().filter(n=>n.className==='weapon-block').length,5);
slider('預警秒數',1.6);slider('傷害',26);ui.click('試這隻');
assert.equal(ui.calls[ui.calls.length-1].spec.id,'words');
assert.equal(ui.calls[ui.calls.length-1].data.boss.moves[0].warning,1.6);
ui.ids.save.fire('click');blockData=saved();
assert.equal(blockData.enemies[0].blocks.moves[1].trigger.level,3);
assert.equal(blockData.boss.moves[0].blocks.moves[0].timing.warning,1.6);
assert.equal(blockData.boss.moves[0].blocks.moves[0].effect.damage,26);
assert.equal(blockData.boss.moves[0].damage,26);
ui=setup({saved:ui.storage});ui.ids.save.fire('click');assert.deepEqual(saved(),blockData);
console.log('PASS: shared five-part enemy/teacher editors, folded state, canonical phase/legacy/boss edits, trial current draft, save/reload');

// Ten migrated thunder cards show folded trigger/condition/action stacks, edit shared refs, preview and save old works.
{
  const m=setup();m.tab('cards');
  const ids=['thunder-attack','thunder-skill','thunder-counter','thunder-ultimate','fusion-dash','thunder-charge','thunder-rod','thunder-step','thunder-static','thunder-super'];
  for(const id of ids) {
    m.item(id);
    const stacks=m.nodes().filter(n=>n.attrs && n.className==='card-block-stack');
    assert.ok(stacks.length,id);assert.equal(stacks[0].open,false);
    stacks[0].open=true;stacks[0].fire('toggle');
    assert.ok(stacks[0].textContent.includes('動作 →'),id);
    m.click('看這個積木的效果');
    assert.equal(m.calls[m.calls.length-1].spec.id,id);
    assert.equal(m.nodes().find(n=>n.className==='card-block-stack').open,true);
  }
  m.item('thunder-static');
  const row=m.nodes().find(n=>n.className==='maker-number'&&n.textContent.startsWith('靜電傷害'));
  assert.ok(row);row.children[1].children.find(n=>n.tag==='button'&&n._text==='＋').fire('click');
  m.ids.save.fire('click');
  const saved=JSON.parse(m.storage['erin-survivor-maker-v1']);
  assert.equal(saved.schoolRules.staticDamage,21);
  const reloaded=setup({saved:m.storage});reloaded.tab('cards');reloaded.item('thunder-static');
  assert.ok(reloaded.nodes().find(n=>n.className==='card-block-stack'));
  assert.ok(!reloaded.ids.editor.textContent.includes('原本組合：靜電'));
}
console.log('PASS: ten thunder card stacks, fold/preview persistence, shared numeric edit and old-work reload');

// Water stacks reuse the same editor, refs and old-work storage.
{
  const m=setup();m.tab('cards');
  const ids=['water-attack','water-skill','water-dash','water-ultimate','fusion-puddle','water-drop','water-fountain','water-bubble','water-wet','water-rain'];
  for(const id of ids) {
    m.item(id);
    const stacks=m.nodes().filter(n=>n.className==='card-block-stack');
    assert.ok(stacks.length,id);assert.equal(stacks[0].open,false);
    stacks[0].open=true;stacks[0].fire('toggle');
    assert.ok(!stacks.some(n=>n.textContent.includes('undefined')),id);
    assert.ok(stacks[0].textContent.includes('動作 →'),id);
    m.click('看這個積木的效果');assert.equal(m.calls[m.calls.length-1].spec.id,id);
    assert.equal(m.nodes().find(n=>n.className==='card-block-stack').open,true);
  }
  m.ids.save.fire('click');const beforePush=JSON.parse(m.storage['erin-survivor-maker-v1']).schoolRules.fountainPush;
  m.item('water-fountain');
  const row=m.nodes().find(n=>n.className==='maker-number'&&n.textContent.startsWith('噴泉擊退距離'));
  assert.ok(row);row.children[1].children.find(n=>n.tag==='button'&&n._text==='＋').fire('click');
  m.ids.save.fire('click');const saved=JSON.parse(m.storage['erin-survivor-maker-v1']);
  assert.equal(saved.schoolRules.fountainPush,beforePush+1);
  const reloaded=setup({saved:m.storage});reloaded.tab('cards');reloaded.item('water-fountain');
  assert.ok(reloaded.nodes().find(n=>n.className==='card-block-stack'));
  assert.ok(!reloaded.ids.editor.textContent.includes('原本組合：噴泉'));
}
console.log('PASS: ten water card stacks, fold/preview persistence, shared edit and old-work reload');

// Wind stacks reuse the same editor, refs and old-work storage.
{
  const m=setup();m.tab('cards');
  const ids=['wind-attack','wind-dash','wind-speed','wind-ultimate','fusion-storm','wind-blade','wind-gust','wind-refund','wind-light','wind-eye'];
  for(const id of ids) {
    m.item(id);
    const stacks=m.nodes().filter(n=>n.className==='card-block-stack');
    assert.ok(stacks.length,id);assert.equal(stacks[0].open,false);
    stacks[0].open=true;stacks[0].fire('toggle');
    assert.ok(!stacks.some(n=>n.textContent.includes('undefined')),id);
    assert.ok(stacks[0].textContent.includes('動作 →'),id);
    m.click('看這個積木的效果');assert.equal(m.calls[m.calls.length-1].spec.id,id);
    assert.equal(m.nodes().find(n=>n.className==='card-block-stack').open,true);
  }
  m.ids.save.fire('click');const beforePush=JSON.parse(m.storage['erin-survivor-maker-v1']).schoolRules.gustPush;
  m.item('wind-gust');
  const row=m.nodes().find(n=>n.className==='maker-number'&&n.textContent.startsWith('吹飛距離'));
  assert.ok(row);row.children[1].children.find(n=>n.tag==='button'&&n._text==='＋').fire('click');
  m.ids.save.fire('click');const saved=JSON.parse(m.storage['erin-survivor-maker-v1']);
  assert.equal(saved.schoolRules.gustPush,beforePush+1);
  const reloaded=setup({saved:m.storage});reloaded.tab('cards');reloaded.item('wind-gust');
  assert.ok(reloaded.nodes().find(n=>n.className==='card-block-stack'));
  assert.ok(!reloaded.ids.editor.textContent.includes('原本組合：吹飛'));
}
console.log('PASS: ten wind card stacks, fold/preview persistence, shared edit and old-work reload');

// Support stacks reuse the same editor, refs and old-work storage.
{
  const m=setup();m.tab('cards');
  const ids=["big-water", "rapid-water", "multi-water", "onion-dash", "bubble-shield", "gem-magnet", "piercing-water", "splash-water", "auto-heal"];
  for(const id of ids) {
    m.item(id);
    const stacks=m.nodes().filter(n=>n.className==='card-block-stack');
    assert.ok(stacks.length,id);assert.equal(stacks[0].open,false);
    stacks[0].open=true;stacks[0].fire('toggle');
    assert.ok(!stacks.some(n=>n.textContent.includes('undefined')),id);
    assert.ok(stacks[0].textContent.includes('動作 →'),id);
    m.click('看這個積木的效果');assert.equal(m.calls[m.calls.length-1].spec.id,id);
    assert.equal(m.nodes().find(n=>n.className==='card-block-stack').open,true);
  }
  m.ids.save.fire('click');const beforePush=JSON.parse(m.storage['erin-survivor-maker-v1']).tuning.waterSizePerLevel;
  m.item('big-water');
  const row=m.nodes().find(n=>n.className==='maker-number'&&n.textContent.startsWith('每級水球大小加成'));
  assert.ok(row);row.children[1].children.find(n=>n.tag==='button'&&n._text==='＋').fire('click');
  m.ids.save.fire('click');const saved=JSON.parse(m.storage['erin-survivor-maker-v1']);
  assert.ok(Math.abs(saved.tuning.waterSizePerLevel-(beforePush+.01))<1e-12);
  const reloaded=setup({saved:m.storage});reloaded.tab('cards');reloaded.item('big-water');
  assert.ok(reloaded.nodes().find(n=>n.className==='card-block-stack'));
  assert.ok(!reloaded.ids.editor.textContent.includes('原本組合：水球加大'));
}
console.log('PASS: nine support card stacks, fold/preview persistence, shared edit and old-work reload');

// Neutral stacks expose bounded shared refs, persist old feature/power works and preview each card.
{
 const m=setup();m.tab('cards');
 const edits={wall:'浪花互撞傷害',candy:'炸彈傷害',bird:'小鳥傷害',bank:'金庫每幾顆球成長',split:'分裂角度',magnet:'磁鐵拾取倍率',crown:'王冠減少最大血量',clover:'幸運草稀有權重倍率',cookie:'餅乾回血所需擊倒數'};
 for(const id of ['wall','candy','bird','bank','split','magnet','crown','clover','rear','cookie']) {
  m.item('item-'+id);const stacks=m.nodes().filter(n=>n.className==='card-block-stack');
  assert.ok(stacks.length,id);assert.equal(stacks[0].open,false);
  stacks[0].open=true;stacks[0].fire('toggle');
  assert.ok(!stacks.some(n=>n.textContent.includes('undefined')),id);
  assert.ok(stacks.every(n=>n.textContent.includes('動作 →')),id);
  if(edits[id]) {
   const row=m.nodes().find(n=>n.className==='maker-number'&&n.textContent.startsWith(edits[id]));assert.ok(row,id);
   row.children[1].children.find(n=>n.tag==='button'&&n._text==='＋').fire('click');
  }
  m.click('看這個積木的效果');assert.equal(m.calls[m.calls.length-1].spec.id,'item-'+id);
  assert.equal(m.nodes().find(n=>n.className==='card-block-stack').open,true);
 }
 m.ids.save.fire('click');const data=JSON.parse(m.storage['erin-survivor-maker-v1']);
 assert.equal(data.neutralRules.cookieKills,21);assert.equal(data.neutralRules.crownHealth,2);
 assert.equal(data.neutralRules.bankEvery,11);assert.equal(data.cards.find(c=>c.id==='item-clover').effects[0].feature,'item-clover');
 const reload=setup({saved:m.storage});reload.tab('cards');reload.item('item-crown');
 assert.ok(reload.nodes().find(n=>n.className==='card-block-stack'));
 assert.ok(!reload.ids.editor.textContent.includes('原本組合：'));
 reload.ids.save.fire('click');assert.deepEqual(JSON.parse(reload.storage['erin-survivor-maker-v1']).neutralRules,data.neutralRules);
}
console.log('PASS: ten neutral card stacks, folding/preview, shared bounded edits and old-work reload');
// Wave stacks are editable through the same folding shells; targeted trial keeps stage selection.
{
 const ui=setup();ui.tab('stages');ui.item('playground');
 assert.ok(ui.ids.editor.textContent.includes('觸發積木'));
 assert.ok(ui.ids.editor.textContent.includes('生出哪種怪'));
 const number=(label,value)=>{const n=ui.nodes().find(n=>n.tag==='input'&&n.type==='range'&&n.attrs['aria-label']===label);assert.ok(n,label);n.value=value;n.fire('input');};
 number('每批怪物數',4);
 ui.click('布丁');
 ui.click('預覽');assert.ok(ui.ids.editor.textContent.includes('×4'));
 ui.ids.save.fire('click');
 const data=JSON.parse(ui.storage['erin-survivor-maker-v1']);
 assert.equal(data.stages[1].waves[0].count,4);
 assert.equal(data.stages[1].waves[0].typeId,'pudding');
 ui.click('試玩');assert.equal(ui.location.href,'?maker=1&play=1&stage=playground');
 const reload=setup({saved:ui.storage});reload.tab('stages');reload.item('playground');
 assert.ok(reload.ids.editor.textContent.includes('生出哪種怪：布丁'));
 reload.item('pacing');
 const first=reload.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']==='第一個事件秒數');first.value=100;first.fire('input');
 assert.ok(reload.ids.makerStatus.textContent.includes('事件時間需遞增'));
 reload.click('試玩');assert.equal(reload.location.href,'');
 first.value=30;first.fire('input');reload.ids.save.fire('click');
 assert.equal(JSON.parse(reload.storage['erin-survivor-maker-v1']).pacing.eventTimes[0],30);
}
console.log('PASS: wave block number/type edits, preview refresh, persistence, targeted stage trial and invalid timing recovery');

// The footer play button uses the current selection, including after switching tabs.
{
 const ui=setup();ui.tab('stages');
 for(const id of ['classroom','playground','pacing','elites','chocobear']) {
  ui.item(id);ui.location.href='';ui.ids.play.fire('click');
  const stage=['classroom','playground'].includes(id)?'&stage='+id:'';
  assert.equal(ui.location.href,'?maker=1&play=1'+stage,'footer trial: '+id);
  assert.ok(ui.storage['erin-survivor-maker-v1'],'footer saves before trial');
 }
 ui.item('playground');ui.tab('rules');ui.location.href='';ui.ids.play.fire('click');
 assert.equal(ui.location.href,'?maker=1&play=1','other tab ignores the previously selected stage');
 ui.tab('stages');ui.location.href='';ui.ids.play.fire('click');
 assert.equal(ui.location.href,'?maker=1&play=1&stage=playground','stage selection survives tab switches');
 ui.item('pacing');
 const first=ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']==='第一個事件秒數');
 first.value=100;first.fire('input');
 const before=ui.storage['erin-survivor-maker-v1'];ui.location.href='';ui.ids.play.fire('click');
 assert.equal(ui.location.href,'');assert.equal(ui.storage['erin-survivor-maker-v1'],before);
 assert.ok(ui.ids.makerStatus.textContent.includes('事件時間需遞增'));
 first.value=30;first.fire('input');ui.item('classroom');ui.ids.play.fire('click');
 assert.equal(ui.location.href,'?maker=1&play=1&stage=classroom');
 const failed=setup({fails:true});failed.tab('stages');failed.item('playground');failed.ids.play.fire('click');
 assert.equal(failed.location.href,'');assert.ok(failed.ids.makerStatus.textContent.includes('無法儲存'));
}
console.log('PASS: footer play clicks for both stages and shared stage items, tab switches, invalid timing recovery and storage failure');

// 家長要求：老師頁的每一個架勢參數都可編輯並經白名單保存／重讀。
ui=setup();choose('boss','phases');
const postureValues={window:['完美閃避時間窗（秒）',.15],maximum:['架勢滿條',120],dodgeGain:['完美閃避累積量',35],recoveryGain:['收招命中累積量',15],interruptGain:['打斷招式累積量',25],decay:['架勢每秒下降',8],stunSeconds:['滿架勢暈眩秒數',3],chargeBonus:['暈眩時聚氣加速比例',.7],damageMultiplier:['暈眩時蓄力傷害倍率',4],heal:['破架勢回血量',5]};
for(const [label,value] of Object.values(postureValues))slider(label,value);
ui.ids.save.fire('click');
for(const [key,[,value]] of Object.entries(postureValues))assert.equal(saved().boss.posture[key],value,key);
ui=setup({saved:ui.storage});choose('boss','phases');
for(const [label,value] of Object.values(postureValues))assert.equal(Number(ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label).value),value,label);
console.log('PASS: all ten teacher posture controls save and reload through schema');

// 三級回饋／自訂與共用時機積木實際操作、儲存、重新載入。
ui=setup();ui.ids.makerLink.fire('click');choose('weapons','candy-sword');
ui.click('大');slider('粒子數',7);slider('輸入緩衝秒數',.14);ui.ids.save.fire('click');
assert.equal(saved().weapons[2].feedback.primary.level,'large');
assert.equal(saved().weapons[2].feedback.primary.particles,7);
assert.equal(saved().weapons[2].timing.inputBuffer,.14);
const tierStorage={...ui.storage};ui=setup({saved:tierStorage});ui.ids.makerLink.fire('click');choose('weapons','candy-sword');
ui.click('自訂');slider('閃白強度',.4);ui.ids.save.fire('click');
assert.equal(saved().weapons[2].feedback.primary.level,'custom');
assert.equal(saved().weapons[2].feedback.primary.flash,.4);
assert.equal(saved().weapons[2].feedback.primary.particles,7);
console.log('PASS: feedback tier selection, individual override, custom mode, buffer edit and storage reload');

// 共用 AI 規則：觸控編輯、招式清單與時機積木一同存回資料。
ui=setup();choose('boss','ai');slider('權重（0 停用）',7);slider('朝向加權',2);slider('第 2 階段血量門檻',.5);
ui.ids.save.fire('click');assert.equal(saved().boss.ai.rules[0].weight,7);assert.equal(saved().boss.ai.rules[0].angleWeight,2);assert.equal(saved().boss.phases[1].threshold,.5);
ui.click('移出招式清單');ui.ids.save.fire('click');assert.ok(!saved().boss.ai.rules.some(r=>r.moveId==='words'));
ui.click('加入 '+defaults.boss.moves[0].name);ui.ids.save.fire('click');assert.ok(saved().boss.ai.rules.some(r=>r.moveId==='words'));
choose('boss','words');slider('收招停頓秒數',.7);slider('招後冷卻秒數（至少階段休息）',3);ui.ids.save.fire('click');
assert.equal(saved().boss.moves[0].recovery,.7);assert.equal(saved().boss.moves[0].cooldown,3);
console.log('PASS: Maker AI weights/angle/phase threshold, remove/add move rules and per-move recovery/cooldown persisted');

// 弱點積木：實際選條件/AND、調數值、新增部位，經白名單存讀並帶入練習。
ui=setup();choose('boss','weakpoint');
slider('普通部位傷害倍率',.25);slider('弱點傷害倍率',4);slider('弱點開啟秒數',2.5);
slider('弱點關閉提示秒數',.4);slider('允許命中角度弧',180);slider('相對朝向角度',180);
ui.click('全部成立');ui.click('指定招式收招後');ui.click('加入弱點部位');
const armors=ui.nodes().filter(n=>n.tag==='input'&&n.attrs['aria-label']==='普通部位傷害倍率');
armors[1].value=.24;armors[1].fire('input');
ui.ids.save.fire('click');
assert.equal(saved().boss.weakpoint.armorMultiplier,.25);assert.equal(saved().boss.weakpoint.criticalMultiplier,4);
assert.equal(saved().boss.weakpoint.parts.length,2);assert.equal(saved().boss.weakpoint.parts[0].mode,'all');
assert.equal(saved().boss.weakpoint.parts[0].conditions[0].type,'after-move');assert.equal(saved().boss.weakpoint.parts[0].conditions[0].moveId,'words');
assert.equal(saved().gallery.bosses[0].weakpoint.armorMultiplier,.24);
const weakStorage={...ui.storage};ui=setup({saved:weakStorage});choose('boss','weakpoint');
assert.equal(Number(ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']==='弱點傷害倍率').value),4);
choose('boss','podium-leap');ui.click('試這隻');assert.equal(ui.calls.at(-1).data.boss.weakpoint.criticalMultiplier,4);
choose('boss','weakpoint');slider('弱點開啟秒數',.5);slider('弱點關閉提示秒數',1);ui.ids.save.fire('click');
assert.equal(ui.ids.makerStatus.className,'error');assert.equal(JSON.parse(ui.storage['erin-survivor-maker-v1']).boss.weakpoint.parts[0].duration,2.5);
slider('弱點開啟秒數',2.5);ui.click('移除弱點積木');ui.ids.save.fire('click');assert.equal(saved().boss.weakpoint,null);
ui.click('加入弱點積木');ui.ids.save.fire('click');assert.equal(saved().boss.weakpoint.criticalMultiplier,3);
console.log('PASS: weakpoint Maker numbers / AND / after-move / multiple parts / separate Boss settings / save reload / current draft trial / invalid timing / remove reinstall');

// 同名phaseCount依範圍語意分開：舊0/1開關、新1..8連斬數值；全程走渲染控件事件。
ui=setup();ui.ids.makerLink.fire('click');choose('boss','gallery');
const fieldNode=label=>ui.nodes().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);
const back=fieldNode('後半場連斬刀數');assert.ok(back);assert.equal(back.type,'range');assert.equal(back.value,5);assert.equal(back.min,1);assert.equal(back.max,8);assert.equal(back.step,1);
assert.equal(ui.nodes().some(n=>n.attrs.role==='switch'&&n._text.startsWith('後半場連斬刀數')),false);
slider('後半場連斬刀數',7);ui.nodes().find(n=>n.attrs['aria-label']==='後半場連斬刀數 增加').fire('click');assert.equal(back.value,8);
slider('前半場連斬刀數',7);choose('boss','weakpoint');
function assassinFields(){const box=ui.nodes().find(n=>n.tag==='fieldset'&&n.children.some(c=>c.tag==='legend'&&c._text==='雙刃刺客'));assert.ok(box);return ui.nodes(box);}
for(const [label,value]of [['普通部位傷害倍率',.25],['弱點傷害倍率',4],['破架勢蓄力額外倍率',1.8]]){const n=assassinFields().find(n=>n.tag==='input'&&n.attrs['aria-label']===label);assert.ok(n);n.value=value;n.fire('input');}
ui.ids.save.fire('click');const customWork=saved();const customBoss=customWork.gallery.bosses.find(b=>b.id==='assassin');assert.deepEqual([customBoss.moves[0].blocks.moves[0].effect.sequence.count,customBoss.moves[0].blocks.moves[0].effect.sequence.phaseCount,customBoss.weakpoint.armorMultiplier,customBoss.weakpoint.criticalMultiplier,customBoss.weakpoint.postureChargeMultiplier],[7,8,.25,4,1.8]);
assert.deepEqual(customWork.boss.weakpoint,defaults.boss.weakpoint);assert.deepEqual(customWork.gallery.bosses[0].weakpoint,defaults.gallery.bosses[0].weakpoint);
ui=setup({saved:ui.storage});ui.ids.makerLink.fire('click');choose('boss','gallery');assert.equal(fieldNode('前半場連斬刀數').value,7);assert.equal(fieldNode('後半場連斬刀數').value,8);choose('boss','weakpoint');
for(const [label,value]of [['普通部位傷害倍率',.25],['弱點傷害倍率',4],['破架勢蓄力額外倍率',1.8]])assert.equal(assassinFields().find(n=>n.attrs['aria-label']===label).value,value);
choose('boss',defaults.boss.moves[0].id);
const legacySwitch=()=>ui.nodes().find(n=>n.attrs.role==='switch'&&n._text.startsWith('每個階段是否多一個目標'));assert.ok(legacySwitch());
const initial=defaults.boss.moves[0].phaseCount;legacySwitch().fire('click');ui.ids.save.fire('click');assert.equal(saved().boss.moves[0].phaseCount,initial?0:1);legacySwitch().fire('click');ui.ids.save.fire('click');assert.equal(saved().boss.moves[0].phaseCount,initial);
ui.ids.reset.fire('click');ui=setup({saved:ui.storage});ui.ids.makerLink.fire('click');choose('boss','gallery');assert.equal(fieldNode('前半場連斬刀數').value,4);assert.equal(fieldNode('後半場連斬刀數').value,5);choose('boss','weakpoint');
for(const [label,value]of [['普通部位傷害倍率',.2],['弱點傷害倍率',3],['破架勢蓄力額外倍率',1.5]])assert.equal(assassinFields().find(n=>n.attrs['aria-label']===label).value,value);
assert.deepEqual(saved().boss.weakpoint,defaults.boss.weakpoint);assert.deepEqual(saved().gallery.bosses[0].weakpoint,defaults.gallery.bosses[0].weakpoint);
console.log('PASS: Maker renderer control events: numeric 5 / bounds1..8 / plus, 7-8 and five parameters save-reload-reset-reload, teacher/gatekeeper unchanged and legacy phaseCount switch0/1');
