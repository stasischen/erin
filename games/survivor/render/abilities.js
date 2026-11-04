// Soft clay silhouettes. Geometry is read from live effects; warnings keep their own red/orange art.
function drawSurvivalAbilities(){
  if(!state.abilities||!state.loadout)return;
  const palette=SurvivorArtManifest.elements;
  const disc=(x,y,r,ink,alpha=.3)=>{ctx.save();ctx.translate(x,y);ctx.globalAlpha*=alpha;const g=ctx.createRadialGradient(-r*.25,-r*.3,1,0,0,r);if(g?.addColorStop){g.addColorStop(0,ink.light);g.addColorStop(.55,ink.body);g.addColorStop(1,ink.edge);ctx.fillStyle=g;}else ctx.fillStyle=ink.body;ctx.beginPath();ctx.ellipse(0,0,r,r*.8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=ink.edge;ctx.lineWidth=2;ctx.stroke();ctx.restore();};
  const flower=(x,y,r,ink)=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;disc(x+Math.cos(a)*r*.45,y+Math.sin(a)*r*.45,r*.35,ink,.65);}disc(x,y,r*.23,ink,.8);};
  for(const e of state.abilities.effects){
    const ink=palette[e.school==='water'?'blue':e.school==='wind'?'green':'thunder'];ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=ink.edge;ctx.fillStyle=ink.body;ctx.lineWidth=4;
    if(e.kind==='wave'){
      ctx.translate(e.drawX??e.x,e.drawY??e.y);ctx.rotate(e.angle);ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(0,-e.radius);ctx.bezierCurveTo(e.radius*.6,-e.radius*.7,-e.radius*.5,-e.radius*.3,0,0);ctx.bezierCurveTo(e.radius*.5,e.radius*.3,-e.radius*.6,e.radius*.7,0,e.radius);ctx.stroke();ctx.strokeStyle=ink.light;ctx.lineWidth=2;ctx.stroke();
    }else if(e.kind==='orbit'){
      for(const p of e.points||[]) {disc(p.x,p.y,e.radius,ink,.3);ctx.beginPath();ctx.ellipse(p.x,p.y,e.radius*.7,e.radius*.3,e.age,0,Math.PI*1.8);ctx.stroke();}
    }else if(e.kind==='strike'){
      const r=24;disc(e.x,e.y-55,r,ink,.85);if(e.fired){ctx.beginPath();ctx.moveTo(e.x,e.y-50);ctx.quadraticCurveTo(e.x-15,e.y-20,e.x+5,e.y-18);ctx.quadraticCurveTo(e.x+14,e.y-5,e.x,e.y);ctx.stroke();disc(e.x,e.y,25,ink,.5);}
    }else if(e.kind==='meteor'){
      disc(e.x,e.y,e.radius,ink,.18);if(!e.fired){const h=Math.max(0,(e.delay-e.age)*120);ctx.beginPath();ctx.moveTo(e.x+25,e.y-h-30);ctx.lineTo(e.x,e.y-h);ctx.stroke();disc(e.x,e.y-h,14,ink,.85);}
    }else if(e.kind==='ice'||e.kind==='garden'){
      disc(e.x,e.y,e.radius,ink,.16);flower(e.x,e.y,e.radius*.6,ink);
    }else if(e.kind==='clone'){
      const active=e.level<5||Math.floor(e.age)%2===e.phase;disc(e.x,e.y+14,25,ink,.2);disc(e.x,e.y,20,ink,active?.8:.3);ctx.fillStyle=ink.edge;for(const x of [-6,6]){ctx.beginPath();ctx.arc(e.x+x,e.y-4,2,0,Math.PI*2);ctx.fill();}
    }else if(e.kind==='magnet'){
      disc(e.x,e.y,e.radius,ink,.15);for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(e.x,e.y,e.radius*(.35+i*.2),e.radius*(.15+i*.12),e.age*2,0,Math.PI*1.6);ctx.stroke();}
    }else if(e.kind==='shield'||e.kind==='fortress'){
      if(state.abilities.shield===e){disc(state.player.x,state.player.y,35,ink,.25);ctx.beginPath();ctx.arc(state.player.x,state.player.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,e.remaining/e.shield));ctx.stroke();}
    }else if(e.kind==='corridor'){
      ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.globalAlpha=.2;ctx.fillStyle=ink.body;ctx.fillRect(0,-e.radius,e.range,e.radius*2);ctx.globalAlpha=.6;for(const y of [-e.radius,e.radius]){ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(e.range*.5,y+Math.sin(e.age*3)*12,e.range,y);ctx.stroke();if(e.level>=5)for(let i=1;i<4;i++)disc(i*e.range/4,y,17,ink,.5);}
    }else if(e.kind==='frenzy'){
      for(let i=0;i<3;i++){const a=e.age*3+i*Math.PI*2/3;disc(state.player.x+Math.cos(a)*35,state.player.y+Math.sin(a)*35,7,ink,.85);}
    }else {const r=e.kind==='ring'?e.radius*(.55+.45*e.age/e.duration):e.radius;disc(e.x,e.y,r,ink,.12);ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
}
Survivor.render=Survivor.render||{};Survivor.render.abilities={drawSurvivalAbilities};
