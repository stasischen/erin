// 真實展示管理器：單一 iframe、資料副本、120ms 更新與不可見停止通知。
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
class Node {
 constructor(){this.children=[];this.visible=[];this.contentWindow={setPreviewVisible:v=>this.visible.push(v)};}
 set textContent(value){this.text=value;this.children=[];}get textContent(){return this.text;}
 appendChild(n){this.children.push(n);}
}
let pending=null;const observers=[];
class Observer {
 constructor(fn){this.fn=fn;observers.push(this);}observe(frame){this.frame=frame;}disconnect(){this.disconnected=true;}
}
const context=vm.createContext({URL,document:{currentScript:{src:'http://localhost/erin/games/survivor/preview.js'},createElement:()=>new Node()},setTimeout:fn=>{pending=fn;return 1;},clearTimeout:()=>{pending=null;},IntersectionObserver:Observer});
for(const f of ['data/defaults.js','data/schema.js','preview.js'])vm.runInContext(fs.readFileSync(`${__dirname}/../${f}`,'utf8'),context);
const api=context.SurvivorPreview,data=context.SurvivorData.defaults(),a=new Node(),b=new Node();
api.mount(a,data,{kind:'card',id:data.cards[0].id});
const frame=a.children[1];assert.equal(frame.src,'http://localhost/erin/games/survivor/preview.html?v=20261025u');
assert.notEqual(frame._previewPayload.data,data);
observers[0].fn([{isIntersecting:false}]);assert.equal(frame._previewVisible,false);assert.deepEqual(frame.visible,[false]);
api.mount(b,data,{kind:'move',id:data.boss.moves[0].id});assert.equal(a.children.length,0);assert.ok(observers[0].disconnected);
data.boss.moves[0].warning=2.1;api.refresh();const refresh=pending;assert.ok(refresh);refresh();assert.ok(b.children[2].textContent.includes('2.1'));
api.stop();assert.equal(b.children.length,0);assert.equal(pending,null);
// Static dependencies and all engine element references are present in the offline shell.
const game=fs.readFileSync(`${__dirname}/../game.js`,'utf8'),shell=fs.readFileSync(`${__dirname}/../preview.html`,'utf8');
for(const [,id] of game.matchAll(/getElementById\("([^"]+)"\)/g))assert.ok(shell.includes(`id="${id}"`),id);
const sw=fs.readFileSync(`${__dirname}/../../../sw.js`,'utf8');
for(const path of ['preview.html','preview.js','preview-engine.js'])assert.ok(sw.includes(`games/survivor/${path}`));
console.log('PASS: one iframe, deep data copy, current URL, hidden callback, disconnect/dispose, debounced numeric refresh, complete engine DOM and offline dependencies');
