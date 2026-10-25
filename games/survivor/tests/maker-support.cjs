const fs = require('node:fs'), vm = require('node:vm');
module.exports = function createRun(options = {}) {
  const elements={}, storage={...options.saved}, calls=[];
  const canvas=new Proxy({}, {get:(t,k)=>k in t?t[k]:(...args)=>calls.push([k,...args])});
  function element() {return {children:[],style:{setProperty(){}},dataset:{},hidden:false,textContent:'',classList:{add(){},remove(){}},querySelector:()=>element(),setPointerCapture(){},listeners:{},addEventListener(k,v){this.listeners[k]=v;},append(){},appendChild(node){this.children.push(node);},querySelectorAll(){return this.children;},setAttribute(){},getContext:()=>canvas,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0})};}
  const context=vm.createContext({ console, ...(options.preview ? {SURVIVOR_PREVIEW:options.preview,frameElement:{_previewVisible:false}} : {}), Math:Object.create(Math), Set, Map, URLSearchParams, performance:{now:()=>0}, requestAnimationFrame(){return 1;}, cancelAnimationFrame(){}, navigator:{}, location:{search:options.maker?'?maker=1':''}, window:{innerWidth:800,innerHeight:600,addEventListener(){}}, document:{getElementById:id=>elements[id]||(elements[id]=element()),querySelector:()=>element(),createElement:element,addEventListener(){}}, localStorage:{getItem:key=>storage[key]||null,setItem(key,value){if(options.storageFails)throw Error('full');storage[key]=value;}} });
  for(const file of ['icons.js','data/defaults.js','data/schema.js']) vm.runInContext(fs.readFileSync(`${__dirname}/../${file}`,'utf8'),context);
  vm.runInContext(fs.readFileSync(options.sourcePath||`${__dirname}/../game.js`,'utf8'),context);
  if(options.preview) vm.runInContext(fs.readFileSync(`${__dirname}/../preview-engine.js`,'utf8'),context);
  context.drawCalls=calls;
  const run=code=>vm.runInContext(code,context); run.storage=storage;run.elements=elements;return run;
};
