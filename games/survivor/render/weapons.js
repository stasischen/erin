// 只讀揮擊事件畫圖，碰撞與傷害在 engine/weapons.js。
function drawHammerSwing(v, progress) {
  if(v.thrust) {
    ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.angle);ctx.fillStyle='#bdefff';ctx.globalAlpha*=.6;ctx.fillRect(0,-v.width,v.radius,v.width*2);ctx.restore();
    SurvivorIcons.draw(ctx,v.weaponId==='candy-sword'?'candy-sword':'candy-hammer',v.x+Math.cos(v.angle)*v.radius-14,v.y+Math.sin(v.angle)*v.radius-14,28);return;
  }
  const start=v.angle-v.arc/2, end=start+v.arc;
  const colors=(v.colors || ['water']).map(id=>BUILD_TUNING[id].color);
  ctx.save();ctx.lineWidth=v.boosted?8:5;
  for(let i=0;i<colors.length;i++) {
    const a=start+v.arc*i/colors.length,b=start+v.arc*(i+1)/colors.length;
    ctx.fillStyle=colors[i];ctx.strokeStyle=colors[i];
    ctx.globalAlpha*=.3;ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.arc(v.x,v.y,v.radius,a,b);ctx.closePath();ctx.fill();ctx.globalAlpha/=.3;
    ctx.beginPath();ctx.arc(v.x,v.y,v.radius,a,b);ctx.stroke();
  }
  const angle=start+(end-start)*(v.reverse?1-progress:progress);
  SurvivorIcons.draw(ctx,v.weaponId==='candy-sword'?'candy-sword':'candy-hammer',v.x+Math.cos(angle)*v.radius-14,v.y+Math.sin(angle)*v.radius-14,28);
  if(v.colors.includes('thunder')) {
    ctx.fillStyle='#ffef96';for(let i=0;i<5;i++){const a=start+v.arc*i/4;ctx.fillRect(Math.round(v.x+Math.cos(a)*v.radius)-2,Math.round(v.y+Math.sin(a)*v.radius)-2,4,4);}
  }
  ctx.restore();
}
function drawHeldWeapon() {
  const weapon=activeWeapon(), a=state.weaponAttack;
  if(a) {
    ctx.save();ctx.strokeStyle=a.charge>=weapon.chargeSeconds?'#ffe28a':'#8bdcff';ctx.lineWidth=3;
    if(weapon.chargeEnabled && a.charge>0) {ctx.beginPath();ctx.arc(state.player.x,state.player.y,state.player.r+9,-Math.PI/2,-Math.PI/2+Math.PI*2*a.charge/weapon.chargeSeconds);ctx.stroke();}
    if(weapon.comboEnabled && a.number) {ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText(String(a.number)+' / '+weapon.comboEvery,state.player.x-12,state.player.y-state.player.r-14);}
    ctx.restore();
  }
  if(weapon.kind!=='melee') return;
  SurvivorIcons.draw(ctx,weapon.icon,state.player.x+state.player.facing*20-10,state.player.y-5,24);
}
Survivor.render = Survivor.render || {};
Survivor.render.weapons = {drawHammerSwing,drawHeldWeapon};
