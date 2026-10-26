// 接合層：純規則產生的事件在這裡更新狀態與特效。
function handleSchoolEvents(events) {
  for (const event of events) {
    if (event.type === 'transformed') {
      if (event.schoolId === 'wind') state.dashCharges += GAME_DATA.schoolRules.windFormCharges;
      skillVisual('discharge', state.player.x, state.player.y, {radius:85,color:BUILD_TUNING[event.schoolId].color,life:1});
    }
    if (state.effects.length < 90) state.effects.push(takeFromPool(state.effectPool,{kind:'number',x:state.player.x,y:state.player.y-50,vx:0,vy:-15,text:event.type === 'transformed' ? GAME_DATA.schools.find(s => s.id === event.schoolId).form : '終極卡解鎖',color:BUILD_TUNING[event.schoolId].color,life:1.5,maxLife:1.5}));
  }
}
function schoolDamage(target, damage) { return damage * neutralDamageMultiplier() * (target.wetTimer > 0 && effectLevel('water-wet') ? 1 + GAME_DATA.schoolRules.wetDamage : 1); }
function absorbSchoolHit(damage) {
  if (damage > 0 && state.schoolCombat && state.schoolCombat.bubble) {
    state.schoolCombat.bubble = false;
    skillVisual('splash',state.player.x,state.player.y,{radius:50,color:BUILD_TUNING.water.color});
    return 0;
  }
  return SurvivorWeapons.receivedDamage(damage, activeWeapon());
}
function schoolWindWall() { return state.schoolCombat && effectLevel('wind-eye') && state.schoolCombat.still >= GAME_DATA.schoolRules.eyeWait; }
function schoolDashEnded() {
  const c = state.schoolCombat, r = GAME_DATA.schoolRules;
  if (!c) return;
  if (effectLevel('water-bubble')) c.bubble = true;
  if (effectLevel('wind-refund')) {
    // 半格是回充進度，不能用半格再發動一次完整衝刺。
    state.dashCooldown = Math.max(0, state.dashCooldown - gameSettings.dashCooldown * r.refundCharge);
    if (state.dashCooldown === 0 && state.dashCharges < maxDashCharges()) { state.dashCharges++; state.dashCooldown = state.dashCharges < maxDashCharges() ? gameSettings.dashCooldown : 0; }
  }
}
function schoolShotHit(shot, target) {
  const r = GAME_DATA.schoolRules;
  if ((shot.schools || []).includes('water') || effectLevel('water-skill')) target.wetTimer = r.wetSeconds;
  if (shot.push) shiftTarget(target, shot.x - shot.vx, shot.y - shot.vy, shot.push);
  if (shot.charged) { lightning(state.player.x,state.player.y,target.x,target.y); schoolEffect('thunder',target,target.x,target.y,shot.damage,shot.hitList); }
  if (!shot.melee && effectLevel('wind-blade') && shot.pierce > 0 && !shot.blade) {
    const other = combatTargets().find(e => !shot.hitList.includes(e) && Math.hypot(deltaX(e.x,target.x),deltaY(e.y,target.y)) <= r.windBladeRange);
    skillVisual('gust',target.x,target.y,{x2:target.x+shot.vx*.15,y2:target.y+shot.vy*.15,color:BUILD_TUNING.wind.color});
    if (other && state.projectiles.length < PROJECTILE_LIMIT) {
      const a = Math.atan2(deltaY(other.y,target.y),deltaX(other.x,target.x));
      state.projectiles.push(takeFromPool(state.projectilePool,{x:target.x,y:target.y,vx:Math.cos(a)*PROJECTILE_SPEED,vy:Math.sin(a)*PROJECTILE_SPEED,r:5,damage:shot.damage*r.windBladeDamage,rangeLeft:r.windBladeRange,hitList:[target],alive:true,blade:true,pierce:0,schools:[],colors:['wind'],transformed:false,push:0,charged:false,maker:true}));
    }
  }
}
function updateSchoolCombat(dt) {
  const c = state.schoolCombat, r = GAME_DATA.schoolRules;
  if (!c) return;
  c.still = state.moveRate > .01 ? 0 : c.still + dt;
  for (const target of state.enemies.concat(state.boss ? [state.boss] : [])) target.wetTimer = countdown(target.wetTimer || 0,dt);
  const pulse = (id, seconds, action) => {
    if (!effectLevel(id)) return;
    c.timers[id] = (c.timers[id] === undefined ? seconds : c.timers[id]) - dt;
    if (c.timers[id] > 0) return;
    c.timers[id] += seconds; action();
  };
  const push = (radius, distance, color) => {
    skillVisual('discharge',state.player.x,state.player.y,{radius,color,life:.4});
    for (const target of combatTargets()) if (Math.hypot(deltaX(target.x,state.player.x),deltaY(target.y,state.player.y)) <= radius) shiftTarget(target,state.player.x,state.player.y,distance);
  };
  pulse('water-fountain',r.fountainSeconds,() => { push(r.fountainRadius,r.fountainPush,BUILD_TUNING.water.color); for (const t of combatTargets()) if (Math.hypot(deltaX(t.x,state.player.x),deltaY(t.y,state.player.y)) <= r.fountainRadius) t.wetTimer=r.wetSeconds; });
  pulse('wind-gust',r.gustSeconds,() => push(r.gustRadius,r.gustPush,BUILD_TUNING.wind.color));
  pulse('water-rain',r.rainSeconds,() => {
    c.rain = r.rainDuration;
    // 下雨是全場緩速，不造成畫面外傷害。
    for (const target of state.enemies.concat(state.boss ? [state.boss] : [])) { target.slowTimer=r.rainDuration; target.makerSlow=0; target.wetTimer=r.wetSeconds; }
    skillVisual('splash',state.player.x,state.player.y,{radius:r.fountainRadius,color:BUILD_TUNING.water.color,life:.8});
  });
  c.rain = countdown(c.rain || 0,dt);
  if (c.rain > 0) for (const t of state.enemies.concat(state.boss ? [state.boss] : [])) { t.slowTimer=Math.max(t.slowTimer || 0,dt*2); t.makerSlow=0; t.wetTimer=r.wetSeconds; }
  pulse('thunder-rod',r.rodSeconds,() => { if (c.rods.length < 3) c.rods.push({x:state.player.x,y:state.player.y,life:r.rodDuration,timer:0}); });
  for (const rod of c.rods) {
    rod.life -= dt; rod.timer -= dt;
    if (rod.timer <= 0) {
      rod.timer += r.rodTick;
      skillVisual('sparkle',rod.x,rod.y,{radius:20,color:BUILD_TUNING.thunder.color,life:.5});
      for (const target of combatTargets()) if (Math.hypot(deltaX(target.x,rod.x),deltaY(target.y,rod.y)) <= r.rodRadius) { lightning(rod.x,rod.y,target.x,target.y); hitBuildTarget(target,r.rodDamage); if(state.mode!=='playing') return; }
    }
  }
  c.rods = c.rods.filter(rod => rod.life > 0);
  if (schoolWindWall()) for (const target of combatTargets()) if (Math.hypot(deltaX(target.x,state.player.x),deltaY(target.y,state.player.y)) < r.eyeRadius + target.r) shiftTarget(target,state.player.x,state.player.y,r.eyePush*dt);
  pulse('thunder-static',r.staticSeconds,() => {
    for (const target of combatTargets()) if (Math.hypot(deltaX(target.x,state.player.x),deltaY(target.y,state.player.y)) < state.player.r + target.r + 3) { lightning(state.player.x,state.player.y,target.x,target.y); hitBuildTarget(target,r.staticDamage); if(state.mode!=='playing') return; }
  });
}

function schoolDashCrossed(fromX,fromY,toX,toY) {
  if (!effectLevel('thunder-step')) return;
  for (const target of combatTargets()) {
    if (SurvivorSchools.segmentDistance(deltaX(target.x,fromX),deltaY(target.y,fromY),deltaX(toX,fromX),deltaY(toY,fromY)) <= target.r + state.player.r) {
      target.stunTimer = GAME_DATA.schoolRules.thunderStepStun;
      lightning(fromX,fromY,target.x,target.y);
    }
  }
}
Survivor.engine['school-combat'] = { handleSchoolEvents, schoolDamage, absorbSchoolHit, updateSchoolCombat };
