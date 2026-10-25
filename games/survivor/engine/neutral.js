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
    return (1 + (powers.bank ? Math.min(rules.bankCap, Math.floor(gems/rules.bankEvery)*rules.bankStep) : 0)) * (1 + (powers.crown ? rules.crownDamage : 0));
  }
  // 螢幕矩形使用相對鏡頭的遊戲座標；角落算一次反彈，並保留原有射程。
  function bounce(x,y,vx,vy,r,width,height,remaining) {
    if (!remaining) return {x,y,vx,vy,remaining,bounced:false};
    const hitX = x-r <= -width/2 && vx<0 || x+r >= width/2 && vx>0;
    const hitY = y-r <= -height/2 && vy<0 || y+r >= height/2 && vy>0;
    return {x:hitX?Math.max(-width/2+r,Math.min(width/2-r,x)):x,y:hitY?Math.max(-height/2+r,Math.min(height/2-r,y)):y,vx:hitX?-vx:vx,vy:hitY?-vy:vy,remaining:remaining-(hitX||hitY?1:0),bounced:!!(hitX||hitY)};
  }
  return {reward,damage,bounce};
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
  state.projectiles.push(takeFromPool(state.projectilePool,{...source,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage,hitList:source.hitList.slice(),alive:true,fragment,bounces:effectLevel('item-wall')?1:0}));
}
function prepareNeutralShots(angle) {
  const volley=state.projectiles.filter(s=>s.alive && !s.maker && s.x===state.player.x && s.y===state.player.y);
  volley.forEach(s=>s.bounces=effectLevel('item-wall')?1:0);
  if (effectLevel('item-rear') && volley.length) neutralCopyShot(volley[0],angle+Math.PI,volley[0].damage,false);
}
function bounceNeutralShot(shot) {
  const cx=state.cameraX+state.width/2,cy=state.cameraY+state.height/2;
  const result=SurvivorNeutral.bounce(deltaX(shot.x,cx),deltaY(shot.y,cy),shot.vx,shot.vy,shot.r,state.width,state.height,shot.bounces||0);
  if (!result.bounced) return;
  Object.assign(shot,{x:cx+result.x,y:cy+result.y,vx:result.vx,vy:result.vy,bounces:result.remaining});
  skillVisual('sparkle',shot.x,shot.y,{radius:14,color:'#ffdfa2',life:.25});
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
    const radius=GEM_PULL_RADIUS*GAME_DATA.neutralRules.magnetMultiplier*(1+effectLevel('wind-light')*GAME_DATA.schoolRules.lightMagnet)*(1+effectLevel('gem-magnet')*UPGRADE_TUNING.magnetPerLevel);
    ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#e5c77d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  ['crown','bank','clover','cookie'].filter(id=>effectLevel('item-'+id)).forEach((id,i)=>{
    SurvivorIcons.draw(ctx,'item-'+id,p.x-28+i*18,p.y-p.r-30,16);
    if(id==='bank'||id==='cookie') {ctx.fillStyle='#fff1b9';ctx.font='10px sans-serif';ctx.fillText(String(id==='bank'?Math.round(Math.min(GAME_DATA.neutralRules.bankCap,Math.floor(state.neutral.gems/GAME_DATA.neutralRules.bankEvery)*GAME_DATA.neutralRules.bankStep)*100)+'%':state.neutral.kills%GAME_DATA.neutralRules.cookieKills),p.x-28+i*18,p.y-p.r-32);}
  });
}
