const fs = require('node:fs'), vm = require('node:vm');
module.exports = function createRun(options = {}) {
  const elements={}, storage={...options.saved}, calls=[], windowListeners={};
  const canvas=new Proxy({}, {get:(t,k)=>k in t?t[k]:k==='createLinearGradient'?()=>({addColorStop(){}}):(...args)=>calls.push([k,...args])});
  function element() {return {children:[],style:{setProperty(){}},dataset:{},hidden:false,textContent:'',classList:{add(){},remove(){}},querySelector:()=>element(),setPointerCapture(){},listeners:{},addEventListener(k,v){this.listeners[k]=v;},append(){},appendChild(node){this.children.push(node);},querySelectorAll(){return this.children;},setAttribute(){},getContext:()=>canvas,toDataURL:mockCanvasDataURL,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0})};}
  const context=vm.createContext({ console, ...(options.preview ? {SURVIVOR_PREVIEW:options.preview,frameElement:{_previewVisible:false}} : {}), Math:Object.create(Math), Set, Map, URLSearchParams, performance:{now:()=>0}, requestAnimationFrame(){return 1;}, cancelAnimationFrame(){}, navigator:{}, location:{search:options.maker?'?maker=1':''}, window:{innerWidth:800,innerHeight:600,addEventListener(name,callback){if(options.captureWindowEvents)(windowListeners[name]||(windowListeners[name]=[])).push(callback);}}, document:{getElementById:id=>elements[id]||(elements[id]=element()),querySelector:()=>element(),createElement:element,addEventListener(){}}, localStorage:{getItem:key=>storage[key]||null,setItem(key,value){if(options.storageFails)throw Error('full');storage[key]=value;}} });
  for(const file of ['icons.js','data/defaults.js','data/schema.js']) vm.runInContext(fs.readFileSync(`${__dirname}/../${file}`,'utf8'),context);
  require('./load-game.cjs').load(context, options.sourcePath);
  if(options.preview) vm.runInContext(fs.readFileSync(`${__dirname}/../preview-engine.js`,'utf8'),context);
  context.drawCalls=calls;
  const run=code=>vm.runInContext(code,context); run.storage=storage;run.elements=elements;run.windowListeners=windowListeners;return run;
};

// API-only canvas mock: preserves existing drawCalls; serializes a transparent raster, not recorded drawing.
function mockCanvasDataURL(){
 const width=Math.max(0,Math.trunc(this.width===undefined?300:this.width)),height=Math.max(0,Math.trunc(this.height===undefined?150:this.height));
 if(!width||!height)return 'data:,';
 if(!Number.isFinite(width)||!Number.isFinite(height)||width>4096||height>4096)throw new RangeError('mock canvas dimensions');
 const chunk=(name,data)=>{const type=Buffer.from(name),payload=Buffer.concat([type,data]);let crc=0xffffffff;
  for(const byte of payload){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  const n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([n,payload,c]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 const bytes=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',require('node:zlib').deflateSync(Buffer.alloc((width*4+1)*height))),chunk('IEND',Buffer.alloc(0))]);
 return 'data:image/png;base64,'+bytes.toString('base64');
}
