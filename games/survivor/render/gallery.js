// 僅呈現規則輸出的世界座標；可替換的角色／招式皆透過美術清單。
function drawTrialArena() {
  const t=state.trial,a=t.arena;
  SurvivorArt.paint('scene/trial-arena',null,()=>{
    ctx.save();ctx.fillStyle='#52626d';ctx.fillRect(state.cameraX,state.cameraY,state.width,state.height);
    // 牆外石柱作背景裝飾，競技場仍鋪滿全畫面。
    for(let i=0;i<24;i++){const angle=i*Math.PI/12;ctx.fillStyle=i%2?'#647781':'#374d5a';ctx.fillRect(a.x+Math.cos(angle)*(a.radius+85)-15,a.y+Math.sin(angle)*(a.radius+85)-18,30,36);}
    ctx.beginPath();ctx.arc(a.x,a.y,a.radius,0,Math.PI*2);ctx.fillStyle='#d2bba1';ctx.fill();ctx.strokeStyle='#3b4659';ctx.lineWidth=24;ctx.stroke();
    ctx.beginPath();ctx.arc(a.x,a.y,a.radius-12,0,Math.PI*2);ctx.strokeStyle='#f4dfb6';ctx.lineWidth=3;ctx.stroke();
    for(let r=160;r<a.radius;r+=160){ctx.beginPath();ctx.arc(a.x,a.y,r,0,Math.PI*2);ctx.strokeStyle='#baa68e';ctx.lineWidth=2;ctx.stroke();}
    if(t.entry>0){const b=state.boss;ctx.beginPath();ctx.arc(b.x,b.y,b.r+25+Math.sin(state.elapsed*8)*5,0,Math.PI*2);ctx.fillStyle='rgba(255,90,70,.3)';ctx.fill();ctx.strokeStyle='#ff614d';ctx.lineWidth=5;ctx.stroke();}
    ctx.restore();
  });
}
function drawTrialShape(shape,origin,angle,active) {
  ctx.save();ctx.translate(origin.x,origin.y);ctx.rotate(angle);ctx.beginPath();
  if(shape.type==='line')ctx.rect(0,-shape.radius,shape.length,shape.radius*2);
  else if(shape.type==='sector'){ctx.moveTo(0,0);ctx.arc(0,0,shape.radius,-shape.angle*Math.PI/360,shape.angle*Math.PI/360);ctx.closePath();}
  else ctx.arc(0,0,shape.radius,0,Math.PI*2);
  ctx.fillStyle=active?'rgba(255,98,45,.55)':'rgba(229,42,74,.24)';ctx.strokeStyle=active?'#ffe391':'#d32c4d';ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.restore();
}
function drawTrialMoves() {
  const t=state.trial,b=state.boss;
  for(const f of t.hazards){ctx.save();ctx.globalAlpha=Math.min(1,f.life);drawTrialShape({type:'circle',radius:f.radius},f,0,true);ctx.restore();}
  for(const enemy of state.enemies)if(enemy.emergeTimer>0){ctx.save();ctx.beginPath();ctx.arc(enemy.x,enemy.y,enemy.r*(1-enemy.emergeTimer/.6)+8,0,Math.PI*2);ctx.strokeStyle='#ffe1a0';ctx.lineWidth=4;ctx.stroke();ctx.restore();}
  if(!b)return;
  if(t.entry>0) return;
  for(const m of state.bossMoves) {
    if(!['windup','active'].includes(m.ai.phase))continue;
    const def=t.definition.moves.find(d=>d.id===m.id),shape={...def.blocks.moves[0].shape};
    if(m.id==='charge')shape.length=SurvivorTrialRules.rayLength(b,m.angle,t.arena);
    SurvivorArt.paint('move/gatekeeper-'+m.id,{context:ctx,x:b.x-40,y:b.y-40,width:80,height:80,animation:m.ai.phase==='windup'?'windup':'active',time:state.elapsed},()=>{
      ctx.save();drawTrialShape(shape,m.id==='leap'?m.target:b,m.angle,m.ai.phase==='active');
      // 舉盾／舉斧、旋轉武器：圖形動作與地面範圍同時蓄力，無文字橫幅。
      ctx.translate(b.x,b.y);ctx.rotate(m.angle+(m.id==='spin'?state.elapsed*10:0));
      const lift=m.ai.phase==='windup'?-22:0;
      ctx.fillStyle='#4a5268';ctx.fillRect(18,-24+lift,12,38);ctx.fillStyle='#e9e5d7';
      if(['shield','charge'].includes(m.id))ctx.fillRect(22,-20+lift,18,32);
      else {ctx.fillRect(24,-34+lift,7,48);ctx.fillRect(12,-38+lift,30,17);}
      ctx.restore();
    });
  }
}

let trialPlaceholder=null;
function trialPicture() {
  const id=state.trial.definition.artId,frame=SurvivorArt.picture(id,trialAnimation(),state.elapsed);
  if(frame)return frame;
  if(!trialPlaceholder) {
    const art=SurvivorArt.lookup(id);trialPlaceholder=document.createElement('canvas');trialPlaceholder.width=art.frameSize[0];trialPlaceholder.height=art.frameSize[1];
    const colors=SurvivorArtManifest.assets[id].placeholder;const g=trialPlaceholder.getContext('2d');g.fillStyle=colors.outline;g.fillRect(4,1,8,14);g.fillStyle=colors.body;g.fillRect(5,2,6,5);g.fillRect(3,8,10,4);g.fillStyle=colors.eyes;g.fillRect(6,5,4,1);
  }return trialPlaceholder;
}
Survivor.render.gallery={drawTrialArena,drawTrialMoves};
