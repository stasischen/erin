// 查詢與影格選擇是純函式；圖片載入、裁格及 Canvas 是平台接合層。
(function(root) {
  'use strict';
  const owns = (o,k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o,k);
  const phases = ['idle','run','windup','active','recovery','hurt','stun'];
  function lookup(id, animation='idle', seconds=0, manifest=root.SurvivorArtManifest) {
    if (!manifest || !owns(manifest.assets,id)) return null;
    const asset=manifest.assets[id];
    const name=owns(asset.animations,animation)?animation:'idle', clip=asset.animations[name];
    const elapsed=Number.isFinite(seconds)?Math.max(0,seconds):0;
    const step=Math.floor(elapsed*clip.fps), count=clip.frames.length;
    const frame=clip.frames[clip.loop?step%count:Math.min(count-1,step)];
    return {id,animation:name,sheet:asset.sheet,mode:asset.mode,frame,
      frameSize:asset.frameSize.slice(),pivot:asset.pivot.slice(),hitboxAnchor:asset.hitboxAnchor.slice()};
  }
  function validate(manifest) {
    if (!manifest || manifest.schemaVersion!==1 || !manifest.assets) return false;
    return Object.entries(manifest.assets).every(([id,a]) => {
      const pair=(value,test)=>Array.isArray(value)&&value.length===2&&value.every(test);
      return /^[a-z-]+\/[a-z][a-z0-9-]*$/.test(id) &&
        (a.sheet===null || typeof a.sheet==='string' && /^art\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.png$/.test(a.sheet)) &&
        ['sprite','procedural'].includes(a.mode) && (a.mode!=='procedural'||a.sheet===null) &&
        pair(a.frameSize,n=>Number.isInteger(n)&&n>0&&n<=4096) &&
        pair(a.pivot,n=>Number.isFinite(n)&&n>=0&&n<=1) && pair(a.hitboxAnchor,n=>Number.isFinite(n)&&n>=0&&n<=1) &&
        a.animations && phases.every(name=>{
          const c=a.animations[name];return c && Array.isArray(c.frames)&&c.frames.length>0&&c.frames.every(n=>Number.isInteger(n)&&n>=0)&&Number.isFinite(c.fps)&&c.fps>=0&&typeof c.loop==='boolean';
        });
    });
  }
  if (!validate(root.SurvivorArtManifest)) throw Error('Invalid Survivor art manifest');
  const images=new Map(), frames=new Map();
  const version=typeof document!=='undefined' && document.currentScript ? new URL(document.currentScript.src).search : '';
  function image(path) {
    if (!images.has(path)) {
      if (typeof Image==='undefined') return null;
      const record={ready:false,value:new Image()};images.set(path,record);
      record.value.onload=()=>{
        record.ready=true;
        // HTML 圖示第一次可先顯示原圖，載好後更新同一個節點。
        if(document.querySelectorAll) for(const node of document.querySelectorAll('[data-survivor-art]')) {
          const frame=picture(node.dataset.survivorArt);
          if(frame)node.src=frame.toDataURL();
        }
      };
      record.value.onerror=()=>{record.ready=false;};
      record.value.src=path+version;
    }
    const record=images.get(path);return record.ready?record.value:null;
  }
  function picture(id,animation='idle',seconds=0) {
    const art=lookup(id,animation,seconds);
    if (!art || !art.sheet || art.mode!=='sprite') return null;
    const sheet=image(art.sheet);if(!sheet)return null;
    const [w,h]=art.frameSize, columns=Math.floor(sheet.width/w), rows=Math.floor(sheet.height/h);
    if (!columns || art.frame>=columns*rows) return null;
    const key=art.sheet+':'+w+':'+h+':'+art.frame;
    if (!frames.has(key)) {
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(sheet,(art.frame%columns)*w,Math.floor(art.frame/columns)*h,w,h,0,0,w,h);
      frames.set(key,canvas);
    }
    return frames.get(key);
  }
  function bounds(id,x,y,width,height) {
    const art=lookup(id);
    if (!art) return [x,y,width,height];
    return [x+width*(art.hitboxAnchor[0]-art.pivot[0]),y+height*(art.hitboxAnchor[1]-art.pivot[1]),width,height];
  }
  function draw(id,options) {
    const art=lookup(id,options && options.animation,options && options.time);
    if (!art || !options || art.mode!=='sprite') return false;
    const frame=picture(id,options.animation,options.time);if(!frame)return false;
    const {context:g,x,y,width,height}=options;
    // x/y 是舊佔位圖左上角；錨點偏移只移動美術，不回寫碰撞位置。
    g.save();g.imageSmoothingEnabled=false;
    g.drawImage(frame,...bounds(id,x,y,width,height));
    g.restore();return true;
  }
  function paint(id,options,fallback) {
    if (draw(id,options)) return;
    return fallback();
  }
  function iconHtml(id) {
    const art=lookup(id);if(!art || !art.sheet)return null;
    const frame=picture(id);if(!frame)return null;
    return '<img class="pixel-icon" data-survivor-art="'+id+'" src="'+frame.toDataURL()+'" alt="" aria-hidden="true" draggable="false">';
  }
  root.SurvivorArt={lookup,validate,bounds,picture,draw,paint,iconHtml};
  root.Survivor=root.Survivor || {};
  if(typeof window!=='undefined')window.Survivor=root.Survivor;
  root.Survivor.render=root.Survivor.render || {};
  root.Survivor.render.art=root.SurvivorArt;
  root.Survivor['art-manifest']={data:root.SurvivorArtManifest};
})(globalThis);
