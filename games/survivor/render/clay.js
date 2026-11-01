// D1 主角黏土造型：所有漸層與姿勢只在載入時預繪，遊戲逐幀只貼圖。
(function(root) {
  'use strict';
  const W=64,H=80,PAD=20,CW=W+PAD*2,S=2;
  const colors={hood:['#ffffff','#d6f6ff','#78cfff','#388de6','#2464bb'],body:['#78cfff','#388de6','#2464bb','#183b70'],skin:['#fff6ea','#f0cfa4','#c9936b'],limb:['#d6f6ff','#78cfff','#388de6'],leg:['#c9936b','#936246','#5a3a2b']};
  const cache={};
  const clamp=n=>Math.max(0,Math.min(1,n));
  let supported=false;
  try {
    const probe=document.createElement('canvas').getContext('2d').createRadialGradient(0,0,0,1,1,1);
    supported=!!probe&&typeof probe.addColorStop==='function';
  } catch {}
  function gradient(g,x,y,w,h,palette) {
    const r=Math.max(w,h)*.78,fill=g.createRadialGradient(x+w*.3,y+h*.26,1,x+w*.42,y+h*.48,r);
    const stops=palette.length===5?[0,.05,.32,.58,1]:palette.length===4?[0,.05,.38,1]:palette.length===3?[0,.42,1]:[0];
    palette.forEach((color,i)=>fill.addColorStop(stops[i],color));return fill;
  }
  function oval(g,x,y,w,h,palette,outline=false) {
    g.beginPath();g.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);
    g.fillStyle=gradient(g,x,y,w,h,palette);g.fill();
    if(outline){g.strokeStyle='#78cfff';g.lineWidth=1.3;g.stroke();}
  }
  function limb(g,x,y,angle) {
    g.save();g.translate(x,y);g.rotate(angle);oval(g,-5,-2,10,19,colors.limb,true);g.restore();
  }
  function foot(g,x,y,lift) { oval(g,x,y-lift,12,8,colors.leg,true); }
  function star(g,x,y,r) {
    g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r*.45:r,px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad;i?g.lineTo(px,py):g.moveTo(px,py);}
    g.closePath();g.fillStyle='#ffe08a';g.fill();g.strokeStyle='#fff6c5';g.lineWidth=.8;g.stroke();
  }
  function makePose(name,step=0) {
    const canvas=document.createElement('canvas');canvas.width=CW*S;canvas.height=H*S;
    const g=canvas.getContext('2d');g.scale(S,S);g.translate(PAD,0);
    let shiftX=0,tilt=0,sx=1,sy=1,armL=12*Math.PI/180,armR=-12*Math.PI/180,liftL=0,liftR=0,closed=false;
    if(name==='run'){tilt=step?-5:5;shiftX=0;sx=1.02;sy=.98;armL=(step?25:-25)*Math.PI/180;armR=-armL;liftL=step?0:4.5;liftR=step?4.5:0;}
    if(name==='windup'){sx=1.12;sy=.86;armL=140*Math.PI/180;armR=-140*Math.PI/180;}
    if(name==='active'){sx=.90;sy=1.14;armL=8*Math.PI/180;armR=-60*Math.PI/180;}
    if(name==='hurt'||name==='stun'){shiftX=3.2;tilt=10;sx=1.04;sy=.94;armL=-70*Math.PI/180;armR=70*Math.PI/180;closed=true;}
    if(name==='recovery'){const t=step/4;sx=1.12-(.22*t);sy=.86+(.28*t);armL=(140*(1-t)+12*t)*Math.PI/180;armR=(-140*(1-t)-12*t)*Math.PI/180;}
    g.translate(W/2+shiftX,H);g.rotate(tilt*Math.PI/180);g.scale(sx,sy);g.translate(-W/2,-H);
    foot(g,19,68.5,liftL);foot(g,34,68.5,liftR);
    oval(g,16,46,32,28,colors.body,true);
    limb(g,13,47,armL);limb(g,51,47,armR);
    oval(g,0,0,64,55,colors.hood,true);
    oval(g,11,17,42,34,colors.skin);
    // 高光只存在於預繪圖，不在遊戲每幀建立漸層。
    g.beginPath();g.ellipse(20,20,7,3,-.35,0,Math.PI*2);g.fillStyle='rgba(255,255,255,.62)';g.fill();
    if(closed){
      g.strokeStyle='#383349';g.lineWidth=1.8;
      for(const x of [22,42]){g.beginPath();g.moveTo(x-3,33);g.lineTo(x+3,36);g.stroke();}
    }else{
    for(const x of [21,38]){oval(g,x,28,5.8,9,['#383349']);g.fillStyle='#9a95b0';g.beginPath();g.arc(x+1.3,30,1.05,0,Math.PI*2);g.fill();}
    }
    oval(g,15,39,7,4,['#f5a1bc']);oval(g,42,39,7,4,['#f5a1bc']);
    if(name==='stun'){star(g,12,5,5);star(g,32,3,5);star(g,53,5,5);}
    return canvas;
  }
  if(supported){
    cache.idle=makePose('idle');cache.run=[makePose('run',0),makePose('run',1)];
    cache.windup=makePose('windup');cache.active=makePose('active');cache.hurt=makePose('hurt');cache.stun=makePose('stun');
    cache.recovery=Array.from({length:5},(_,i)=>makePose('recovery',i));
    cache.flash={};
    for(const [name,frames] of Object.entries(cache)){
      if(name==='flash')continue;
      const list=Array.isArray(frames)?frames:[frames];
      cache.flash[name]=list.map(source=>{
        const image=document.createElement('canvas');image.width=source.width;image.height=source.height;
        const ink=image.getContext('2d');ink.drawImage(source,0,0);ink.globalCompositeOperation='source-in';ink.fillStyle='#fff';ink.fillRect(0,0,image.width,image.height);return image;
      });
    }
  }
  function drawPlayer(g,options={}) {
    if(!supported)return false;
    let name=options.animation||'idle';if(name==='dodge')name='run';
    let index=0,frames=cache[name];
    if(name==='run'){frames=cache.run;index=Math.floor((options.elapsed||0)/.18)%2;}
    if(name==='recovery'){frames=cache.recovery;index=Math.round(4*clamp((options.phaseElapsed||0)/Math.max(.15,options.phaseDuration||.15)));}
    if(!Array.isArray(frames))frames=[frames];
    const sprite=frames[index]||cache.idle;
    const y=-H+(options.groundOffset||0);
    g.save();
    if(name==='idle')g.scale(1,1+.03*Math.sin((options.elapsed||0)*Math.PI*2/.8));
    if(name==='run')g.translate(0,-2);
    g.drawImage(sprite,-W/2-PAD,y,CW,H);
    if(options.flash){const flashFrames=cache.flash[name]||cache.flash.idle;g.globalCompositeOperation='lighter';g.globalAlpha=.72;g.drawImage(flashFrames[index]||flashFrames[0],-W/2-PAD,y,CW,H);}
    g.restore();return true;
  }
  const api=Object.freeze({drawPlayer,poses:Object.freeze(['idle','run','windup','active','recovery','hurt','stun'])});
  root.SurvivorClay=api;root.Survivor=root.Survivor||{};root.Survivor.render=root.Survivor.render||{};root.Survivor.render.clay=api;
})(globalThis);
