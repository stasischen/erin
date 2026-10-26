// 純規則：角度用弧度、距離用世界單位；不讀時間、畫面或亂數。
globalThis.SurvivorWeapons = (() => {
  function receivedDamage(damage, weapon) { return damage * (1 - (weapon.damageReduction || 0)); }
  function swing(weapon, number, angle, powers) {
    const spin = number % weapon.spinEvery === 0;
    return { type:'weapon-swung', weaponId:weapon.id, number, angle, spin,
      arc:spin ? Math.PI * 2 : Math.min(Math.PI * 2, weapon.arcDegrees * Math.PI / 180 + powers.extraArc),
      radius:weapon.radius * powers.size, damage:powers.damage * weapon.damageMultiplier, push:weapon.push + powers.push };
  }
  // 圓形敵人與扇形相交：先比半徑，再比兩條邊線，角落不會漏判。
  function intersects(dx, dy, radius, event) {
    const distance = Math.hypot(dx,dy);
    if (distance > event.radius + radius) return false;
    const diff = Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-event.angle),Math.cos(Math.atan2(dy,dx)-event.angle)));
    if (diff <= event.arc / 2 || distance <= radius) return true;
    const edge = event.angle + (Math.sin(Math.atan2(dy,dx)-event.angle) >= 0 ? 1 : -1) * event.arc/2;
    return SurvivorSchools.segmentDistance(dx,dy,Math.cos(edge)*event.radius,Math.sin(edge)*event.radius) <= radius;
  }
  function cardNote(card, weapon) {
    if (weapon.kind !== 'melee') return card.description;
    return card.descriptionMelee || card.description;
  }
  return { swing, intersects, receivedDamage, cardNote };
})();

// 接合層：一次揮擊產生一次事件；先取命中清單，再結算，特效不參與判定。
function activeWeapon() { return GAME_DATA.weapons.find(w => w.id === state.weaponId) || GAME_DATA.weapons[0]; }
function swingAtNearest() {
  const target = closestEnemy(), weapon = activeWeapon();
  if (!target) return;
  const c = state.schoolCombat, r = GAME_DATA.schoolRules;
  const number = state.swingCount + 1;
  const properties = SurvivorSchools.shot(c ? c.shots + 1 : number,c ? c.kills : 0,c ? c.chargedUsed : 0,{drop:effectLevel('water-drop'),charge:effectLevel('thunder-charge')},r);
  const boosted = state.dashAttack > 0 && state.dashTimer <= 0;
  const look = buildAppearance();
  const event = SurvivorWeapons.swing(weapon,number,Math.atan2(deltaY(target.y,state.player.y),deltaX(target.x,state.player.x)),{
    extraArc:effectLevel('multi-water') * UPGRADE_TUNING.extraShotAngle,
    size:properties.size * (transformed('water') ? 1+r.waterFormSize : 1) * (1+effectLevel('big-water')*UPGRADE_TUNING.waterSizePerLevel) * (1+effectLevel('wind-attack')*BUILD_TUNING.windSpeed) * (1+effectLevel('piercing-water')*.1) * (boosted ? UPGRADE_TUNING.dashAttackSize : 1),
    damage:effectiveDamage()*properties.damage*(boosted ? UPGRADE_TUNING.dashAttackDamage : 1),push:properties.push
  });
  const targets = combatTargets();
  const hits = targets.filter(t=>SurvivorWeapons.intersects(deltaX(t.x,state.player.x),deltaY(t.y,state.player.y),t.r,event));
  // 目標太遠不空揮，也不消耗蓄電、第四下或衝刺強化。
  if (!hits.length) return;
  state.swingCount = number;
  if (c) { c.shots++; if (properties.charged) c.chargedUsed = Math.floor(c.kills/r.chargeKills); }
  if (boosted) state.dashAttack = 0;
  const visual = {...event,colors:look.colors.slice(),boosted,life:.24};
  skillVisual('hammer-swing',state.player.x,state.player.y,visual); playSound('shoot');
  // 後射對應後方小扇形；同一揮擊每個目標最多結算一次。
  if (effectLevel('item-rear') && !event.spin) {
    const rear={...event,angle:event.angle+Math.PI};
    skillVisual('hammer-swing',state.player.x,state.player.y,{...rear,colors:look.colors.slice(),boosted,life:.24});
    for(const t of targets) if(!hits.includes(t) && SurvivorWeapons.intersects(deltaX(t.x,state.player.x),deltaY(t.y,state.player.y),t.r,rear)) hits.push(t);
  }
  for (const t of hits) {
    if (t !== state.boss && !t.alive) continue;
    const shot={x:t.x,y:t.y,vx:deltaX(t.x,state.player.x),vy:deltaY(t.y,state.player.y),damage:event.damage,push:0,charged:properties.charged,schools:effectLevel('water-attack')?['water']:[],hitList:hits,melee:true,pierce:0};
    schoolShotHit(shot,t);
    hitBuildTarget(t,event.damage);
    if(state.mode!=='playing') return;
    if(t===state.boss || t.alive) shiftTarget(t,state.player.x,state.player.y,event.push);
    if(t.alive) waveNeutralHit(t,deltaX(t.x,state.player.x),deltaY(t.y,state.player.y));
    for(const school of ['water','thunder']) if(effectLevel(school+'-attack') || school==='water' && (effectLevel('water-skill')||effectLevel('fusion-puddle'))) {
      schoolEffect(school,t,t.x,t.y,event.damage,hits);
      if(state.mode!=='playing') return;
    }
    if(effectLevel('splash-water')) {
      const radius=UPGRADE_TUNING.splashBaseRadius+effectLevel('splash-water')*UPGRADE_TUNING.splashPerLevel;
      skillVisual('splash',t.x,t.y,{radius});
      for(const other of combatTargets()) if(other!==t && !hits.includes(other) && Math.hypot(deltaX(other.x,t.x),deltaY(other.y,t.y))<radius) {hitBuildTarget(other,event.damage*BUILD_TUNING.supportSplashDamage);if(state.mode!=='playing')return;}
    }
    triggerMakerEffects('hit',t.x,t.y);
    if(state.mode!=='playing') return;
  }
  // 風刃變成一次近距離追斬；不額外發射遠程水球。
  if(effectLevel('wind-blade')) {
    const other=combatTargets().find(t=>!hits.includes(t) && Math.hypot(deltaX(t.x,state.player.x),deltaY(t.y,state.player.y))<=event.radius+t.r && hits.some(h=>Math.hypot(deltaX(t.x,h.x),deltaY(t.y,h.y))<=r.windBladeRange));
    if(other) {skillVisual('gust',state.player.x,state.player.y,{x2:other.x,y2:other.y,color:BUILD_TUNING.wind.color});hitBuildTarget(other,event.damage*r.windBladeDamage);}
  }
}
Survivor.engine.weapons = {activeWeapon,swingAtNearest,rules:SurvivorWeapons};
