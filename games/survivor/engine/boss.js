function summonTeacher() {
  const position = offscreenSpawn(60); // 老師下方名字也必須在鏡頭外。
  if (!position) return;
  playSound("warning");
  state.boss = { ...position, r: GAME_DATA.boss.radius, speed: GAME_DATA.boss.speed, hp: gameSettings.teacherHealth * currentStage().bossHealthScale, maxHp: gameSettings.teacherHealth * currentStage().bossHealthScale, flash: 0, wobble: 0 };
  clearBossMoves(); state.bossPhase = 1; state.bossPhasePause = 0; state.bossRest = 0.5; state.lastBossMoves = []; state.bossShout = 0; state.bossShake = 0; state.bossIntro = 2.2;
  startBossZone();
  updateHud();
}

// 老師招式的預告、位置和命中都用世界座標；鏡頭外取消，重新看見時重新預告。
function clearBossMoves() {
  for (const move of state.bossMoves) state.bossMovePool.push(move);
  state.bossMoves = [];
  for (let i = state.enemyShots.length - 1; i >= 0; i--) {
    if (state.enemyShots[i].source === "teacher") state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]);
  }
}
function bossHurtPlayer(damage) {
  if (!state.boss || !targetVisible(state.boss) || state.player.damageDisabled || state.player.invincible > 0) return;
  state.player.health = Math.max(0, state.player.health - damage);
  state.player.invincible = INVINCIBLE_SECONDS; state.player.hitFlash = 0.16;
  playSound("hurt"); updateHud(); counterDischarge();
  if (state.mode === "playing" && state.player.health <= 0) finishRun(false);
}
function bossDefinition(move) { return BOSS_MOVES.find(row => row.id === move.id); }
function bossKind(move) { return move.kind || (bossDefinition(move) || {}).kind; }
function beginBossMove(id) {
  const definition = BOSS_MOVES.find(row => row.id === id);
  if (!definition || definition.minPhase > state.bossPhase) return;
  const kind = definition.kind;
  const p = state.player;
  const b = state.boss && { ...state.boss, x: state.cameraX + state.width / 2 + deltaX(state.boss.x, state.cameraX + state.width / 2), y: state.cameraY + state.height / 2 + deltaY(state.boss.y, state.cameraY + state.height / 2) };
  if (!b || !targetVisible(b) || state.bossMoves.length >= BOSS_TUNING.hazardLimit) return;
  if (["ring","cage"].includes(kind) && Math.min(state.width, state.height) < 196) return; // 太窄就不封路。
  playSound("warning");
  const angle = Math.atan2(deltaY(p.y, b.y), deltaX(p.x, b.x));
  const move = takeFromPool(state.bossMovePool, {
    id, kind, x: b.x, y: b.y, angle, warning: definition.warning,
    wallWidth: 0, wallHeight: 0, wallDuration: 0, dodged: false, active: false, pulse: 0, life: 0, points: [], radius: 0, endX: b.x, endY: b.y,
    count: Math.min(10, definition.count + definition.phaseCount * state.bossPhase)
  });
  if (kind === "wall") { move.wallWidth = state.width - 24; move.wallHeight = state.height; move.x = state.cameraX + 12; move.y = state.cameraY; move.endY = state.cameraY + state.height; move.endX = state.cameraX + state.width - 12; move.wallDuration = Math.max(definition.duration,state.width / definition.speed + .1); }
  if (kind === "dash") {
    const length = Math.min(definition.distance, Math.hypot(deltaX(p.x, b.x), deltaY(p.y, b.y)) + 70);
    move.endX = Math.max(state.cameraX + b.r, Math.min(state.cameraX + state.width - b.r, b.x + Math.cos(angle) * length));
    move.endY = Math.max(state.cameraY + b.r, Math.min(state.cameraY + state.height - b.r, b.y + Math.sin(angle) * length));
  }
  if (kind === "rain" || kind === "call") {
    move.radius = definition.radius;
    const count = Math.min(10, definition.count + definition.phaseCount * state.bossPhase);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, distance = i ? 85 + Math.random() * 65 : 0;
      const point = { x: p.x + Math.cos(a) * distance, y: p.y + Math.sin(a) * distance, r: move.radius };
      clampToMap(point);
      if (targetVisible(point)) move.points.push(point);
    }
  }
  if (kind === "ring" || kind === "cage") {
    move.radius = Math.min(definition.radius, state.width / 2 - 38, state.height / 2 - 38);
    move.x = Math.max(state.cameraX + move.radius + 12, Math.min(state.cameraX + state.width - move.radius - 12, p.x));
    move.y = Math.max(state.cameraY + move.radius + 12, Math.min(state.cameraY + state.height - move.radius - 12, p.y));
    // 缺口朝向主角；整段綠色弧線不會長出國字。
    move.angle = Math.atan2(deltaY(p.y, move.y), deltaX(p.x, move.x));
  }
  const endX = move.endX, endY = move.endY;
  clampToMap(move);
  move.endX = wrapCoordinate(endX, state.worldWidth); move.endY = wrapCoordinate(endY, state.worldHeight);
  state.bossMoves.push(move);
}
function fireBossFan(move) {
  const spread = bossDefinition(move).spread;
  const speed = bossDefinition(move).speed;
  for (let i = 0; i < move.count; i++) {
    if (state.enemyShots.filter(shot => shot.source === "teacher").length >= UPGRADE_TUNING.teacherShotLimit) break;
    const a = move.angle + (i - (move.count - 1) / 2) * spread;
    state.enemyShots.push(takeFromPool(state.enemyShotPool, {
      dodged: false, source: "teacher", x: move.x, y: move.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      r: bossKind(move) === "chalk" ? 10 : 17, text: bossKind(move) === "chalk" ? "粉筆" : ["作業！", "認真！", "加油！"][i % 3],
      damage: bossDefinition(move).damage, life: 4
    }));
  }
}
function ringPoints(move) {
  const definition = bossDefinition(move);
  const points = [], gap = bossKind(move) === "cage" ? 0 : definition.gap;
  const endRadius = bossKind(move) === "cage" ? 0 : Math.max(50, move.radius * 0.52); // 收到最後也留得下主角通過的缺口。
  const radius = endRadius + (move.radius - endRadius) * Math.max(0, move.life / definition.duration);
  for (let i = 0; i <= 16; i++) {
    const a = move.angle + gap / 2 + (Math.PI * 2 - gap) * i / 16;
    points.push({ x: move.x + Math.cos(a) * radius, y: move.y + Math.sin(a) * radius, r: 10 });
  }
  return points;
}
function wallX(move) { return move.x + (move.active ? Math.min(move.wallWidth, ((move.wallDuration || bossDefinition(move).duration) - move.life) * bossDefinition(move).speed) : 0); }
function updateBoss(dt) {
  state.bossShake = countdown(state.bossShake, dt); state.bossShout = countdown(state.bossShout, dt);
  const b = state.boss;
  if (!b || state.bossIntro > 0) { clearBossMoves(); return; }
  b.wobble += dt * 3; b.flash = Math.max(0, b.flash - dt);
  b.slowTimer = countdown(b.slowTimer || 0, dt); b.stunTimer = countdown(b.stunTimer || 0, dt);
  // 逐一跨過 66%、33%；一次大傷害跨兩條線也會依序演出兩次轉場。
  const nextPhase = GAME_DATA.boss.phases.reduce((phase, row, i) => b.hp / b.maxHp <= row.threshold ? i + 1 : phase, 1);
  if (nextPhase > state.bossPhase && state.bossPhasePause <= 0) {
    state.bossPhase++; state.bossPhasePause = BOSS_TUNING.phasePause;
    state.bossShout = BOSS_TUNING.phasePause; b.flash = 0.25;
    clearBossMoves(); state.bossRest = GAME_DATA.boss.phases[state.bossPhase - 1].rest;
    state.bossShake = BOSS_TUNING.shakeSeconds;
  }
  if (state.bossPhasePause > 0) { state.bossPhasePause = countdown(state.bossPhasePause, dt); updateHud(); return; }
  if (!targetVisible(b)) {
    clearBossMoves(); state.bossRest = Math.max(state.bossRest, 0.5);
  }
  // 預警時老師站定；衝撞只沿預告線走，不追蹤玩家。
  if (!state.bossMoves.length && !(b.stunTimer > 0)) {
    const dx = deltaX(state.player.x, b.x), dy = deltaY(state.player.y, b.y), length = Math.max(1, Math.hypot(dx, dy));
    const speed = b.speed * (b.slowTimer > 0 ? (b.makerSlow || BUILD_TUNING.slowMultiplier) : 1);
    b.x += dx / length * speed * dt; b.y += dy / length * speed * dt; clampToMap(b);
  }
  if (!targetVisible(b) || b.stunTimer > 0) return;
  if (!state.bossMoves.length) {
    state.bossRest = countdown(state.bossRest, dt);
    if (state.bossRest > 0) return;
    if (state.bossRest <= 0) {
      const previousMoves = state.lastBossMoves;
      const unlocked = BOSS_MOVES.filter(move => move.minPhase <= state.bossPhase && (!["ring","cage"].includes(bossKind(move)) || Math.min(state.width, state.height) >= 196));
      const freshChoices = unlocked.filter(move => !state.lastBossMoves.includes(move.id));
      const choices = freshChoices.length ? freshChoices : unlocked;
      if (!choices.length) { state.bossRest = .5; return; }
      const id = choices[Math.floor(Math.random() * choices.length)].id;
      beginBossMove(id); state.lastBossMoves = [id];
      // 只搭配容易看懂的兩招，避開衝撞與收縮圈同時封路。
      if (state.bossPhase >= 2 && (["rain", "call"].includes(BOSS_MOVES.find(m => m.id === id).kind))) {
        const combo = GAME_DATA.boss.phases[state.bossPhase - 1].combo;
        if (combo && combo !== id && !previousMoves.includes(combo)) { beginBossMove(combo); state.lastBossMoves.push(combo); }
      }
      return; // 開始預告的這幀不扣時間，保證完整預警。
    }
  }
  for (let i = state.bossMoves.length - 1; i >= 0; i--) {
    const move = state.bossMoves[i];
    if (!move.active) {
      move.warning = countdown(move.warning, dt);
      if (move.warning > 0) continue;
      move.active = true; move.life = bossKind(move) === "dash" ? Math.hypot(deltaX(move.endX, move.x), deltaY(move.endY, move.y)) / bossDefinition(move).speed : (move.wallDuration || bossDefinition(move).duration);
      if (bossKind(move) === "words" || bossKind(move) === "chalk") { fireBossFan(move); move.pulse = bossDefinition(move).pulse; }
      if (bossKind(move) === "summon") for (let n = 0; n < Math.min(10, bossDefinition(move).count + bossDefinition(move).phaseCount * state.bossPhase); n++) spawnEnemy();
      if (bossKind(move) === "ring" || bossKind(move) === "dash" || bossKind(move) === "rain") state.bossShake = BOSS_TUNING.shakeSeconds;
      continue; // 出手畫面至少呈現一幀，再開始範圍命中判斷。
    }
    if (bossKind(move) === "wall") {
      if (Math.abs(deltaX(wallX(move),state.player.x)) < state.player.r + 10 && deltaY(state.player.y,move.y) >= 0 && deltaY(state.player.y,move.y) <= move.wallHeight) bossHurtPlayer(bossDefinition(move).damage);
    } else if (bossKind(move) === "chalk") {
      move.pulse = countdown(move.pulse, dt);
      if (move.pulse <= 0) { fireBossFan(move); move.pulse = bossDefinition(move).pulse; }
    } else if (bossKind(move) === "rain" || bossKind(move) === "call") {
      for (const point of move.points) if (targetVisible(point) && Math.hypot(deltaX(state.player.x, point.x), deltaY(state.player.y, point.y)) < point.r + state.player.r) bossHurtPlayer(bossDefinition(move).damage);
    } else if (bossKind(move) === "cage") {
      const radius = move.radius * Math.max(0,move.life/bossDefinition(move).duration);
      if (Math.abs(Math.hypot(deltaX(state.player.x,move.x),deltaY(state.player.y,move.y))-radius) < state.player.r+10) bossHurtPlayer(bossDefinition(move).damage);
    } else if (bossKind(move) === "ring") {
      for (const point of ringPoints(move)) if (targetVisible(point) && Math.hypot(deltaX(state.player.x, point.x), deltaY(state.player.y, point.y)) < point.r + state.player.r) bossHurtPlayer(bossDefinition(move).damage);
    } else if (bossKind(move) === "dash") {
      const dx = deltaX(move.endX, b.x), dy = deltaY(move.endY, b.y), length = Math.hypot(dx, dy);
      const step = Math.min(length, bossDefinition(move).speed * dt);
      if (length > 0) { b.x += dx / length * step; b.y += dy / length * step; clampToMap(b); }
      if (Math.hypot(deltaX(b.x, state.player.x), deltaY(b.y, state.player.y)) < b.r + state.player.r) bossHurtPlayer(bossDefinition(move).damage);
    }
    if (state.mode !== "playing" || state.boss !== b) { clearBossMoves(); return; }
    move.life = countdown(move.life, dt);
    if (move.life <= 0) state.bossMovePool.push(state.bossMoves.splice(i, 1)[0]);
  }
  if (!state.bossMoves.length) state.bossRest = GAME_DATA.boss.phases[state.bossPhase - 1].rest;
  updateHud();
}


// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.engine = globalThis.Survivor.engine || {};
globalThis.Survivor.engine.boss = globalThis.Survivor.engine.boss || {};
Object.defineProperties(globalThis.Survivor.engine.boss, {
  startBossZone: { enumerable: true, get: () => startBossZone },
  bossZoneDistance: { enumerable: true, get: () => bossZoneDistance },
  outsideBossZone: { enumerable: true, get: () => outsideBossZone },
  updateBossZone: { enumerable: true, get: () => updateBossZone },
  bossZoneSpawn: { enumerable: true, get: () => bossZoneSpawn },
  summonTeacher: { enumerable: true, get: () => summonTeacher },
  clearBossMoves: { enumerable: true, get: () => clearBossMoves },
  bossHurtPlayer: { enumerable: true, get: () => bossHurtPlayer },
  bossDefinition: { enumerable: true, get: () => bossDefinition },
  bossKind: { enumerable: true, get: () => bossKind },
  beginBossMove: { enumerable: true, get: () => beginBossMove },
  fireBossFan: { enumerable: true, get: () => fireBossFan },
  ringPoints: { enumerable: true, get: () => ringPoints },
  updateBoss: { enumerable: true, get: () => updateBoss }
});

// ✏️ Erin 設定在 data/defaults.js 的 bossZone，Maker「魔王」也能改。
// 老師出場時的戰場（鏡頭）中心固定下來，不追著主角跑；接縫共用 wrapped 距離。
function startBossZone() {
  const config = GAME_DATA.bossZone;
  state.bossZone = !PREVIEW_MODE && config.enabled ? {
    x: state.player.x, y: state.player.y, span: Math.max(state.width, state.height),
    radius: Math.max(state.width, state.height) * 1.5, target: Math.max(state.width, state.height) * 1.5,
    completed: 0, warning: 0, shrinking: false
  } : null;
}
function bossZoneDistance(body) {
  const z = state.bossZone;
  return z ? Math.hypot(deltaX(body.x, z.x), deltaY(body.y, z.y)) : 0;
}
function outsideBossZone() {
  return !!(state.boss && state.bossZone && bossZoneDistance(state.player) > state.bossZone.radius);
}
function updateBossZone(dt) {
  const z = state.bossZone, config = GAME_DATA.bossZone;
  if (!state.boss || !config.enabled || PREVIEW_MODE) { state.bossZone = null; return; }
  if (!z || state.mode !== "playing" || state.bossIntro > 0) return;
  // 轉向、放大視窗也保留至少 1.5 個螢幕寬的直徑，不趁旋轉偷偷縮圈。
  const span = Math.max(z.span, state.width, state.height);
  if (span > z.span) { z.radius *= span / z.span; z.target *= span / z.span; z.span = span; }
  const due = Math.min(config.steps, state.bossPhase);
  if (!z.shrinking && z.warning <= 0 && z.radius <= z.target && z.completed < due) {
    z.target = z.span * (1.5 - .75 * (z.completed + 1) / config.steps);
    z.warning = 4; playSound("warning");
  }
  // 完成每次預告才開始收圈；大傷害跨階段也按順序預告。
  if (z.warning > 0) z.warning = countdown(z.warning, dt);
  else if (z.radius > z.target) {
    z.shrinking = true;
    z.radius = Math.max(z.target, z.radius - config.speed * dt);
    if (z.radius <= z.target) { z.completed++; z.shrinking = false; }
  }
  // 紫霧是持續小傷害，不觸發反擊、連續音效或受傷無敵；衝刺仍可保護。
  if (outsideBossZone() && !state.player.damageDisabled && state.player.invincible <= 0 && config.damage > 0) {
    state.player.health = Math.max(0, state.player.health - config.damage * Math.min(dt, MAX_DT));
    updateHud();
    if (state.player.health <= 0) finishRun(false);
  }
}
function bossZoneSpawn(r) {
  const z = state.bossZone;
  if (!state.boss || !z) return offscreenSpawn(r);
  const angle = Math.random() * Math.PI * 2, radius = Math.sqrt(Math.random()) * Math.max(0, z.radius - r - 16);
  return { x: wrapCoordinate(z.x + Math.cos(angle) * radius, state.worldWidth), y: wrapCoordinate(z.y + Math.sin(angle) * radius, state.worldHeight) };
}
