// 純規則：輸入事件、持有能力、數值與抽樣值；輸出新計數和可序列化事件。
globalThis.SurvivorNeutral = (() => {
  function reward(current, type, powers, rules, draw, cardId) {
    const next = {kills:current.kills, gems:current.gems}, events = [];
    if (type === 'death') {
      if (powers.cookie) { next.kills++; if (next.kills % rules.cookieKills === 0) events.push({type:'heal', amount:1}); }
      if (powers.candy && draw < rules.bombChance) events.push({type:'bomb-dropped'});
    }
    if (type === 'pickup' && powers.bank) {
      next.gems++;
      if (next.gems % rules.bankEvery === 0) events.push({type:'bank-grown', bonus:Math.min(rules.bankCap, Math.floor(next.gems/rules.bankEvery)*rules.bankStep)});
    }
    if (type === 'acquire') events.push({type:'item-acquired',cardId,rerolls:powers.cloverAcquired?1:0});
    return {next, events};
  }
  function damage(gems, powers, rules) {
    return SurvivorEffectBlocks.modify('neutralDamageMultiplier', 1 + (powers.bank ? Math.min(rules.bankCap, Math.floor(gems/rules.bankEvery)*rules.bankStep) : 0), {'item-crown':powers.crown}, {neutralRules:rules});
  }
  // 掃過的圓形路徑：固定輸入 → 第一個撞到的索引；使用相對世界座標。
  function collision(dx,dy,radius,targets) {
    const length=Math.hypot(dx,dy);
    if (!length) return -1;
    let first=-1, nearest=Infinity;
    targets.forEach((t,i)=>{
      const along=(t.x*dx+t.y*dy)/length;
      if (along<=0 || along>length+radius+t.r) return;
      if (SurvivorSchools.segmentDistance(t.x,t.y,dx,dy)<=radius+t.r && along<nearest) {first=i;nearest=along;}
    });
    return first;
  }
  return {reward,damage,collision};
})();
function neutralPowers() {
  return Object.fromEntries(['cookie','candy','bank','crown'].map(id=>[id,!!effectLevel('item-'+id)]));
}
function neutralDamageMultiplier() { return SurvivorNeutral.damage(state.neutral ? state.neutral.gems : 0,neutralPowers(),GAME_DATA.neutralRules); }
function neutralEvent(type,x,y,cardId) {
  if (!state.neutral) return;
  const result = SurvivorNeutral.reward(state.neutral,type,{...neutralPowers(),cloverAcquired:type==='acquire' && state.upgrades[cardId]===1 && UPGRADES.some(c=>c.id===cardId && c.effects.some(e=>e.feature==='item-clover'))},GAME_DATA.neutralRules,Math.random(),cardId);
  Object.assign(state.neutral,result.next);
  for (const event of result.events) {
    if (event.type==='bomb-dropped' && state.neutral.bombs.length<12) state.neutral.bombs.push({x,y,timer:GAME_DATA.neutralRules.bombDelay});
    if (event.type==='heal') { state.player.health=Math.min(maxPlayerHealth(),state.player.health+event.amount);addHealEffect();updateHud(); }
    if (event.type==='bank-grown') skillVisual('card',state.player.x,state.player.y-25,{text:'item-bank',color:'#ffd879',life:.6});
    if (event.type==='item-acquired') { state.rerollsRemaining+=event.rerolls; }
  }
}
function neutralCopyShot(source,angle,damage,fragment) {
  if (state.projectiles.length>=PROJECTILE_LIMIT) return;
  const speed = Math.hypot(source.vx,source.vy);
  state.projectiles.push(takeFromPool(state.projectilePool,{...source,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage,hitList:source.hitList.slice(),alive:true,bigBubble:fragment?false:source.bigBubble,fragment}));
}
function prepareNeutralShots(angle) {
  const volley=state.projectiles.filter(s=>s.alive && !s.maker && s.x===state.player.x && s.y===state.player.y);
  if (effectLevel('item-rear') && volley.length) neutralCopyShot(volley[0],angle+Math.PI,volley[0].damage,false);
}
// 碰撞不遞迴、不跳電；兩隻共用短冷卻。死亡仍由正式傷害入口結算。
function waveNeutralHit(target,vx,vy) {
  if (!effectLevel('item-wall') || (target!==state.boss && !target.alive) || !canAttackTarget(target)) return;
  const r=GAME_DATA.neutralRules, length=Math.hypot(vx,vy);
  if (!length) return;
  const x=target.x,y=target.y;
  shiftTarget(target,x-vx,y-vy,r.wavePush);
  skillVisual('splash',target.x,target.y,{radius:24,color:'#71d9f2',life:.3});
  if (target===state.boss || (target.waveReady||0)>state.elapsed) return;
  const others=combatTargets().filter(t=>t!==target && t!==state.boss && (t.waveReady||0)<=state.elapsed);
  const index=SurvivorNeutral.collision(deltaX(target.x,x),deltaY(target.y,y),target.r,others.map(t=>({x:deltaX(t.x,x),y:deltaY(t.y,y),r:t.r})));
  if(index<0) return;
  const other=others[index];
  target.waveReady=other.waveReady=state.elapsed+r.waveCooldown;
  hitBuildTarget(target,r.waveDamage);hitBuildTarget(other,r.waveDamage);
  skillVisual('splash',other.x,other.y,{radius:32,color:'#71d9f2',life:.4});
}
function splitNeutralShot(shot) {
  if (!effectLevel('item-split') || shot.fragment || shot.maker) return;
  // 同一顆穿透水球最多分裂一次；碎片不繼續分裂。
  shot.fragment=true;
  const angle=Math.atan2(shot.vy,shot.vx),r=GAME_DATA.neutralRules;
  for (const sign of [-1,1]) neutralCopyShot(shot,angle+sign*r.splitAngle,shot.damage*r.splitDamage,true);
  skillVisual('sparkle',shot.x,shot.y,{radius:25,color:'#fff0a0',life:.3});
}
function neutralBirdPosition() {
  const a=state.neutral.birdAngle,r=GAME_DATA.neutralRules.birdRadius;
  return {x:state.player.x+Math.cos(a)*r,y:state.player.y+Math.sin(a)*r};
}
function updateNeutralItems(dt) {
  const n=state.neutral;if(!n) return;
  const r=GAME_DATA.neutralRules;
  n.birdAngle=(n.birdAngle+dt*2.5)%(Math.PI*2);n.birdTimer=Math.max(0,n.birdTimer-dt);
  if (effectLevel('item-bird') && n.birdTimer<=0) {
    const pos=neutralBirdPosition(),target=combatTargets().filter(t=>Math.hypot(deltaX(t.x,pos.x),deltaY(t.y,pos.y))<=r.birdReach+t.r).sort((a,b)=>Math.hypot(deltaX(a.x,pos.x),deltaY(a.y,pos.y))-Math.hypot(deltaX(b.x,pos.x),deltaY(b.y,pos.y)))[0];
    if (target) { n.birdTimer=r.birdSeconds;skillVisual('gust',pos.x,pos.y,{x2:target.x,y2:target.y,color:'#ffd879',life:.2});hitBuildTarget(target,r.birdDamage); }
  }
  if (state.mode!=='playing') return;
  // 先移除到期炸彈，再處理傷害；連鎖掉落只在下次更新倒數。
  const due=[];
  for(let i=n.bombs.length-1;i>=0;i--) {n.bombs[i].timer-=dt;if(n.bombs[i].timer<=0) due.push(n.bombs.splice(i,1)[0]);}
  for(const bomb of due) {
    skillVisual('splash',bomb.x,bomb.y,{radius:r.bombRadius,color:'#ffc269',life:.4});playSound('explosion');
    for(const t of combatTargets()) { if(Math.hypot(deltaX(t.x,bomb.x),deltaY(t.y,bomb.y))<=r.bombRadius+t.r) hitBuildTarget(t,r.bombDamage);if(state.mode!=='playing') return; }
  }
}
function drawNeutralItems() {
  if (!state.neutral) return;
  const p=state.player;
  if (effectLevel('item-bird')) {const pos=neutralBirdPosition();SurvivorIcons.draw(ctx,'item-bird',pos.x-12,pos.y-12,24);}
  for(const bomb of state.neutral.bombs) SurvivorIcons.draw(ctx,'item-candy',bomb.x-12,bomb.y-12,24+Math.sin(bomb.timer*20)*2);
  if (effectLevel('item-magnet')) {
    const radius=GEM_PULL_RADIUS*GAME_DATA.neutralRules.magnetMultiplier*cardBlock('wind-light','onPickup').actions[0].multiplier*cardBlock('gem-magnet','onPickup').actions[0].multiplier;
    ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#e5c77d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  ['crown','bank','clover','cookie'].filter(id=>effectLevel('item-'+id)).forEach((id,i)=>{
    SurvivorIcons.draw(ctx,'item-'+id,p.x-28+i*18,p.y-p.r-30,16);
    if(id==='bank'||id==='cookie') {ctx.fillStyle='#fff1b9';ctx.font='10px sans-serif';ctx.fillText(String(id==='bank'?Math.round(Math.min(GAME_DATA.neutralRules.bankCap,Math.floor(state.neutral.gems/GAME_DATA.neutralRules.bankEvery)*GAME_DATA.neutralRules.bankStep)*100)+'%':state.neutral.kills%GAME_DATA.neutralRules.cookieKills),p.x-28+i*18,p.y-p.r-32);}
  });
}
