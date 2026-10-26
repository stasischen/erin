// 純輸入規則：只接收秒數、世界方向和武器設定，不讀 DOM。
globalThis.SurvivorAttackInput = {
  step(previous, weapon, dt, holding) {
    const p=previous||{number:0,idle:0,charge:0};
    const idle=p.idle+dt;
    return {...p,number:idle>=weapon.comboReset?0:p.number,idle,
      charge:holding&&weapon.chargeEnabled?Math.min(weapon.chargeSeconds,p.charge+dt):0};
  },
  release(kind, heldSeconds, angle, weapon, dash) {
    return {type:'attack-released',kind,weaponId:weapon.id,heldSeconds,angle,
      charged:kind==='attack'&&weapon.chargeEnabled&&heldSeconds>=weapon.chargeSeconds,dash:!!dash};
  },
  // 特殊招保留為獨立招式事件；效果積木可日後接同一個事件。
  special(weaponId, angle) {
    return {type:'weapon-special',weaponId,angle,cooldown:6,
      kind:weaponId==='candy-hammer'?'leap':weaponId==='candy-sword'?'sword-wave':'water-fan',
      count:weaponId==='water-ball'?5:1,spread:weaponId==='water-ball'?.18:0,
      range:weaponId==='candy-hammer'?110:420,damageMultiplier:2,leapDistance:80,leapSeconds:.25};
  }
};
const manualHolds={attack:null,special:null};
const manualButtons={attack:document.getElementById('attackButton'),special:document.getElementById('specialButton')};
function manualMode() {return GAME_DATA.attackMode==='manual';}
function manualAimAngle(hold) {
  if(hold&&hold.angle!==null)return hold.angle;
  const t=closestEnemy();
  return t?Math.atan2(deltaY(t.y,state.player.y),deltaX(t.x,state.player.x)):Math.atan2(state.faceY,state.faceX);
}
function beginManualAttack(kind, pointerId=null, point=null) {
  if(!manualMode()||state.mode!=='playing'||manualHolds[kind])return false;
  if(kind==='special'&&(state.specialCooldown>0||state.manualLeap))return false;
  manualHolds[kind]={pointerId,origin:point,angle:null,seconds:0};
  // 衝刺中的按下立即出招，不必等手指放開。
  if(kind==='attack'&&state.dashTimer>0&&!state.manualDashUsed)releaseManualAttack(kind);
  return true;
}
function cancelManualAttack() {
  manualHolds.attack=null;manualHolds.special=null;
  if(state.weaponAttack&&manualMode())state.weaponAttack.charge=0;
}
function releaseManualAttack(kind) {
  const hold=manualHolds[kind];manualHolds[kind]=null;
  if(!hold||!manualMode()||state.mode!=='playing')return;
  const dash=state.dashTimer>0&&!state.manualDashUsed;
  const event=SurvivorAttackInput.release(kind,hold.seconds,manualAimAngle(hold),activeWeapon(),dash);
  state.lastAttackInput=event;
  if(kind==='special') {
    if(state.specialCooldown>0||state.manualLeap)return;
    const special=SurvivorAttackInput.special(state.weaponId,event.angle);
    state.specialCooldown=special.cooldown;state.lastSpecialEvent=special;
    if(special.kind==='leap') {
      state.manualLeap={...special,left:special.leapSeconds};
      skillVisual('gust',state.player.x,state.player.y,{x2:state.player.x+Math.cos(event.angle)*special.leapDistance,y2:state.player.y+Math.sin(event.angle)*special.leapDistance,color:'#fff0a5'});
    } else executeManualSpecial(special);
  } else {
    if(state.manualRecovery>0&&!dash)return;
    state.weaponAttack={...(state.weaponAttack||{number:0,idle:0}),charge:event.charged?activeWeapon().chargeSeconds:0};
    fireAtNearest(event);
    if(dash)state.manualDashUsed=true;
    // 連點可走完連段；最後一段仍有既有的收招代價。
    state.manualRecovery=.12+(state.attackRecovery||0);state.attackRecovery=0;
    if(state.weaponAttack)state.weaponAttack.charge=0;
  }
  updateActionControls();
}
function executeManualSpecial(event) {
  if(event.kind==='leap') {
    const swing={angle:event.angle,arc:Math.PI*.8,radius:event.range,damage:effectiveDamage()*event.damageMultiplier,push:45,heavy:true,shape:'sector',width:20};
    skillVisual('hammer-swing',state.player.x,state.player.y,{...swing,colors:['water'],life:.3});
    for(const t of combatTargets().filter(t=>SurvivorWeapons.intersects(deltaX(t.x,state.player.x),deltaY(t.y,state.player.y),t.r,swing))) {
      const hp=t.hp;hitBuildTarget(t,swing.damage);
      if(t.hp<hp)meleeImpact(t,swing);
      if(state.mode!=='playing')return;
      if(t.alive||t===state.boss){shiftTarget(t,state.player.x,state.player.y,swing.push);t.stunTimer=Math.max(t.stunTimer||0,.8);}
    }
  } else {
    for(let i=0;i<event.count&&state.projectiles.length<PROJECTILE_LIMIT;i++) {
      const angle=event.angle+(i-(event.count-1)/2)*event.spread;
      state.projectiles.push(takeFromPool(state.projectilePool,{x:state.player.x,y:state.player.y,vx:Math.cos(angle)*PROJECTILE_SPEED,vy:Math.sin(angle)*PROJECTILE_SPEED,
        r:event.kind==='sword-wave'?16:12,damage:effectiveDamage()*event.damageMultiplier,pierce:event.kind==='sword-wave'?99:0,piercing:event.kind==='sword-wave',
        rangeLeft:event.range,colors:buildAppearance().colors,schools:[],hitList:[],alive:true,push:0,charged:false,blade:event.kind==='sword-wave',bigBubble:false,autoCharged:false,boosted:false,bounces:0,fragment:false,maker:false}));
    }
  }
  playSound('shoot');
}
function tickManualAttack(dt) {
  if(!manualMode())return;
  state.manualRecovery=countdown(state.manualRecovery||0,dt);
  state.specialCooldown=countdown(state.specialCooldown||0,dt);
  for(const hold of Object.values(manualHolds))if(hold)hold.seconds+=dt;
  state.weaponAttack=SurvivorAttackInput.step(state.weaponAttack,activeWeapon(),dt,!!manualHolds.attack);
  if(state.manualLeap) {
    const leap=state.manualLeap,step=Math.min(dt,leap.left)/leap.leapSeconds*leap.leapDistance;
    state.player.x+=Math.cos(leap.angle)*step;state.player.y+=Math.sin(leap.angle)*step;
    clampToMap(state.player);updateCamera();leap.left=countdown(leap.left,dt);
    if(!leap.left){state.manualLeap=null;executeManualSpecial(leap);}
  }
}
function updateManualControls() {
  const enabled=manualMode();
  if(actionControls.classList.toggle)actionControls.classList.toggle('manual-controls',enabled);
  for(const [kind,button] of Object.entries(manualButtons)) {
    if(!button)continue;
    button.hidden=!enabled;
    const remaining=kind==='special'?(state.specialCooldown||0):(state.manualRecovery||0);
    button.setAttribute('aria-disabled',String(remaining>0));
    button.style.background=`conic-gradient(#9df6ff ${Math.max(0,1-remaining/(kind==='special'?6:.12))*360}deg,#375776 0deg)`;
  }
  if(state.mode!=='playing')cancelManualAttack();
}
function drawManualAim() {
  if(!manualMode())return;
  const hold=manualHolds.special||manualHolds.attack;
  if(!hold||hold.angle===null)return;
  const angle=hold.angle,x=state.player.x,y=state.player.y,length=85;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle='#fff0a5';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(length,0);ctx.lineTo(length-14,-12);ctx.moveTo(length,0);ctx.lineTo(length-14,12);ctx.stroke();ctx.restore();
}
for(const [kind,button] of Object.entries(manualButtons)) {
  if(!button)continue;
  button.innerHTML='<span aria-hidden="true">'+SurvivorIcons.html(kind==='attack'?'candy-sword':'thunder-charge')+'</span>';
  button.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();
    if(beginManualAttack(kind,e.pointerId,canvasPoint(e)))button.setPointerCapture(e.pointerId);
  });
  button.addEventListener('pointermove',e=>{
    const hold=manualHolds[kind];if(!hold||hold.pointerId!==e.pointerId)return;
    e.preventDefault();const p=canvasPoint(e),dx=p.x-hold.origin.x,dy=p.y-hold.origin.y;
    hold.angle=Math.hypot(dx,dy)>=14?Math.atan2(dy,dx):null;
  });
  button.addEventListener('pointerup',e=>{
    const hold=manualHolds[kind];if(!hold||hold.pointerId!==e.pointerId)return;
    e.preventDefault();releaseManualAttack(kind);
  });
  for(const name of ['pointercancel','lostpointercapture'])button.addEventListener(name,e=>{
    if(manualHolds[kind]&&manualHolds[kind].pointerId===e.pointerId){manualHolds[kind]=null;if(kind==='attack'&&state.weaponAttack)state.weaponAttack.charge=0;}
  });
  button.addEventListener('click',e=>{if(e.detail===0){beginManualAttack(kind);releaseManualAttack(kind);}});
}
window.addEventListener('blur',cancelManualAttack);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelManualAttack();});

Survivor["manual-attack"]={rules:SurvivorAttackInput,beginManualAttack,releaseManualAttack,cancelManualAttack,tickManualAttack};
