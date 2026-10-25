// 測 UI 事件接線：改名、換積木、前置循環阻擋、保存、試玩路徑與恢復。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attrs={};this.value='';this._text='';}
  appendChild(n){this.children.push(n);return n;}
  set textContent(s){this._text=s;this.children=[];}get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
  addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=v;}
  fire(event){if(this.listeners[event])this.listeners[event]({target:this,preventDefault(){}});}
}
function setup(options={}){
  const storage={...options.saved}, ids=Object.fromEntries(['editor','status','save','play','reset'].map(id=>[id,new Node()]));
  const tabs=['schools','cards','enemies','boss','numbers'].map(tab=>{const n=new Node('button');n.dataset.tab=tab;return n;});
  const location={href:''}, context=vm.createContext({console,window:{addEventListener(){}},location,document:{createElement:tag=>new Node(tag),getElementById:id=>ids[id],querySelectorAll:()=>tabs},localStorage:{getItem:k=>storage[k]||null,setItem(k,v){if(options.fails)throw Error('full');storage[k]=v;}}});
  for(const file of ['data/defaults.js','data/schema.js','maker/maker.js'])vm.runInContext(fs.readFileSync(`${__dirname}/../${file}`,'utf8'),context);
  function nodes(node=ids.editor){return node.children.flatMap(c=>[c,...nodes(c)]);}
  function tab(name){tabs.find(n=>n.dataset.tab===name).fire('click');}
  function select(label,value){const row=nodes().find(n=>n.tag==='label'&&n._text===label);assert.ok(row,label);const input=row.children.find(c=>c.tag==='select');input.value=value;input.fire('change');}
  return {ids,nodes,tab,select,storage,location};
}
let ui=setup();
assert.ok(ui.ids.status.textContent.includes('開始設計'));
for(const name of ['cards','enemies','boss','numbers','schools']) {ui.tab(name);assert.ok(ui.nodes().some(n=>n.tag==='input'));}
let name=ui.nodes().find(n=>n.tag==='input'&&n.type==='text');name.value='彩虹水';name.fire('input');ui.ids.save.fire('click');
assert.equal(JSON.parse(ui.storage['erin-survivor-maker-v1']).build.water.name,'彩虹水');
ui.tab('cards');name=ui.nodes().find(n=>n.tag==='input'&&n.type==='text');name.value='我的新招';name.fire('input');
ui.select('選擇效果','stun');ui.select('什麼時候發動？','dash');ui.ids.play.fire('click');
assert.equal(ui.location.href,'../?maker=1');
let data=JSON.parse(ui.storage['erin-survivor-maker-v1']);assert.equal(data.cards[0].name,'我的新招');assert.equal(data.cards[0].effects[0].type,'stun');assert.equal(data.cards[0].effects[0].trigger,'dash');
ui=setup({saved:{'erin-survivor-maker-v1':JSON.stringify(data)}});ui.tab('cards');ui.select('先挑一張卡','1');
const bad=ui.nodes().find(n=>n.tag==='label'&&n.className==='check'&&n.textContent.includes('我的新招')).children[0];bad.checked=true;bad.fire('change');ui.ids.save.fire('click');
// Selecting the first card as prerequisite is initially legal; reverse it to form a cycle.
ui.select('先挑一張卡','0');const reverse=ui.nodes().find(n=>n.tag==='label'&&n.className==='check'&&n.textContent.includes('連發水球')).children[0];reverse.checked=true;reverse.fire('change');
const before=ui.storage['erin-survivor-maker-v1'];ui.ids.play.fire('click');assert.equal(ui.location.href,'');assert.equal(ui.storage['erin-survivor-maker-v1'],before);assert.ok(ui.ids.status.textContent.includes('圈'));
ui.ids.reset.fire('click');data=JSON.parse(ui.storage['erin-survivor-maker-v1']);assert.equal(data.cards[0].name,'水球加大');
ui=setup({fails:true});ui.ids.play.fire('click');assert.equal(ui.location.href,'');assert.ok(ui.ids.status.textContent.includes('無法儲存'));
console.log('PASS: every Maker tab renders, edited names/primitive/trigger persist, play saves/routes, cycle blocks save/play, reset restores, storage failure prevents silent play');
