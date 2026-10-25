// 所有物件共用環形座標；負數也會回到 0～size。
function wrapCoordinate(value, size) { return size > 0 && (value < 0 || value >= size) ? ((value % size) + size) % size : value; }
function wrapDelta(to, from, size) {
  const diff = to - from;
  return size > 0 && Math.abs(diff) >= size / 2 ? wrapCoordinate(diff + size / 2, size) - size / 2 : diff;
}
function deltaX(to, from) { return wrapDelta(to, from, state.worldWidth); }
function deltaY(to, from) { return wrapDelta(to, from, state.worldHeight); }
function clampToMap(body) {
  body.x = wrapCoordinate(body.x, state.worldWidth);
  body.y = wrapCoordinate(body.y, state.worldHeight);
}
function updateCamera() {
  state.cameraX = state.player.x - state.width / 2;
  state.cameraY = state.player.y - state.height / 2;
}
function resetMap() {
  // 預留最大螢幕邊長；每邊至少為可見範圍的 2.5 倍。
  // 整張世界也是地磚的整數倍，跨過世界接縫時花紋不跳動。
  const span = Math.max(4096, state.width, state.height, window.screen ? window.screen.width : 0, window.screen ? window.screen.height : 0) * MAP_SCREENS;
  state.worldWidth = Math.ceil(span / 336) * 336;
  state.worldHeight = Math.ceil(span / 252) * 252;
}
function fitVisibleViewport() {
  const viewport = window.visualViewport;
  const width = viewport ? viewport.width : window.innerWidth;
  const height = viewport ? viewport.height : window.innerHeight;
  const rotated = window.innerHeight > window.innerWidth;
  // One viewport policy for HUD, levelup, settings and Maker, in shell coordinates.
  // Match the former CSS media queries using the layout viewport; visualViewport
  // still controls shell geometry and offsets below.
  const shellWidth = Math.max(window.innerWidth, window.innerHeight);
  const shellHeight = Math.min(window.innerWidth, window.innerHeight);
  if (gameShell.dataset) gameShell.dataset.short = [
    shellHeight <= 520 ? "compact" : "",
    shellWidth <= 660 ? "small" : "",
    shellWidth <= 600 ? "narrow" : ""
  ].filter(Boolean).join(" ");
  gameShell.style.width = `${rotated ? height : width}px`;
  gameShell.style.height = `${rotated ? width : height}px`;
  gameShell.style.left = `${viewport ? viewport.offsetLeft : 0}px`;
  gameShell.style.top = `${viewport ? viewport.offsetTop : 0}px`;
  gameShell.style.transform = rotated ? "rotate(90deg) translateY(-100%)" : "none";
}
function resize() {
  fitVisibleViewport();
  // 旋轉或工具列改變高度時，放開舊搖桿，避免沿舊座標繼續走。
  state.pointerId = null; state.joy = null; state.keys.clear();
  // client 尺寸不含外框，也不受整個容器旋轉影響。
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = Math.max(1, canvas.clientWidth || rect.width);
  state.height = Math.max(1, canvas.clientHeight || rect.height);
  canvas.width = Math.round(state.width * ratio);
  canvas.height = Math.round(state.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!state.worldWidth) {
    resetMap(); state.player.x = state.width * MAP_SCREENS / 2; state.player.y = state.height * MAP_SCREENS / 2;
  }
  if (state.width * 2.5 > state.worldWidth || state.height * 2.5 > state.worldHeight) resetMap();
  clampToMap(state.player); updateCamera();
}

function resetGame() {
  state.stageIndex = 0; state.stageElapsed = 0; state.stageTransition = 0;
  resetEncounters();
  state.enemyHazards = []; state.makerFields = []; state.makerTimers = {};
  state.schoolRun = PREVIEW_MODE ? null : SurvivorSchools.createRun(GAME_DATA, Array.from({length:64}, () => Math.random()));
  state.pickingSpirit = false; state.schoolCombat = { shots:0, kills:0, chargedUsed:0, timers:{}, bubble:false, still:0, rods:[] };
  resetMap();
  for (const visual of state.vfx) state.vfxPool.push(visual);
  state.vfx = [];
  for (const field of state.fields) state.fieldPool.push(field);
  state.fields = []; state.trailDistance = 0; state.ultimateTimer = 0; state.ultimateTimers = {}; state.ultimateVisuals = {}; state.ultimateVisual = null; state.moveRate = 0;
  state.dashCharges = UPGRADE_TUNING.dashCharges; state.dashAttack = 0; state.slowMotion = 0; state.dashGhosts = [];
  state.dashTimer = 0; state.dashCooldown = 0; state.skillCooldown = 0;
  state.dashX = 1; state.dashY = 0; state.faceX = 1; state.faceY = 0;
  state.bomb = null; state.bombBlast = null; state.pointerId = null;
  for (const item of state.projectiles) state.projectilePool.push(item);
  for (const item of state.gems) state.gemPool.push(item);
  for (const item of state.effects) state.effectPool.push(item);
  state.player = { x: state.width * MAP_SCREENS / 2, y: state.height * MAP_SCREENS / 2, r: 18, health: PLAYER_HEALTH, invincible: 0, hitFlash: 0, walkPhase: 0, moving: false, facing: 1 };
  state.enemies = [];
  for (const item of state.enemyShots) state.enemyShotPool.push(item);
  state.enemyShots = [];
  state.bookShotTimer = 0; state.bookNoticeTimer = 0; state.bookShootingStarted = false;
  enemyNotice.hidden = true;
  state.boss = null; state.bossIntro = 0; state.bossZone = null;
  clearBossMoves(); state.bossPhase = 1; state.bossPhasePause = 0; state.bossRest = 0; state.lastBossMoves = []; state.bossShout = 0; state.bossShake = 0;
  state.projectiles = [];
  state.gems = [];
  state.effects = [];
  state.elapsed = 0;
  state.spawnTimer = 0.5;
  state.shotTimer = 0.15;
  state.healTimer = 0;
  state.xp = 0;
  state.level = 1;
  state.upgrades = {}; state.pendingChoices = []; state.rerollsRemaining = LEVELUP_REROLLS;
  state.keys.clear();
  state.joy = null;
  state.player.health = PLAYER_HEALTH;
  updateCamera(); updateHud();
}

function startGame() {
  if (globalThis.SurvivorPreview) SurvivorPreview.stop();
  resetGame();
  state.mode = "playing";
  overlay.classList.add("hidden");
  SurvivorIcons.set(pauseButton, "settings");
  state.lastTime = performance.now();
  scheduleFrame();
  if (PREVIEW_MODE) spawnEnemy(); else showSpiritChoices();
  updateActionControls();
  playSound("click");
}

function finishRun(won) {
  if (won && !PREVIEW_MODE && state.stageIndex < STAGES.length - 1) {
    // 換場保留本局成長與血量，清空上一關的攻擊、警示、怪物與操作輸入。
    const progress = { stageIndex: state.stageIndex+1, elapsed: state.elapsed, level: state.level, xp: state.xp, upgrades: state.upgrades, schoolRun: state.schoolRun, schoolCombat: state.schoolCombat, health: state.player.health };
    resetGame();
    Object.assign(state, { stageIndex: progress.stageIndex, elapsed: progress.elapsed, level: progress.level, xp: progress.xp, upgrades: progress.upgrades, schoolRun: progress.schoolRun, schoolCombat: progress.schoolCombat, stageTransition: 2, mode: "transition" });
    state.player.health = progress.health;
    updateHud(); updateActionControls(); return;
  }
  clearBossMoves(); state.bossZone = null; state.bossShake = 0;
  bestRecord = Math.max(bestRecord, Math.floor(state.elapsed));
  try { localStorage.setItem(RECORD_KEY, String(bestRecord)); } catch (_) { /* 無法儲存紀錄時不影響結算 */ }
  playSound(won ? "win" : "over");
  if (MAKER_MODE && window.openSurvivorMaker) window.openSurvivorMaker(won ? "過關了！繼續設計或再試玩。" : "試玩結束！繼續設計或再試玩。");
  else showOverlay(won ? "won" : "over");
}


function countdown(value, dt) { return value - dt < 0.000001 ? 0 : value - dt; }

function tick(dt) {
  if (state.mode === "playing" && state.slowMotion > 0) {
    state.slowMotion = countdown(state.slowMotion, dt);
    dt *= UPGRADE_TUNING.perfectSlowScale;
  }
  if (state.mode === "transition") {
    state.stageTransition = countdown(state.stageTransition, dt);
    if (state.stageTransition <= 0) { state.mode = "playing"; state.keys.clear(); updateActionControls(); }
    return;
  }
  if (state.mode !== "playing") return;
  if (openEncounterReward()) return;
  updateSkillVisuals(dt);
  updateMakerEffects(dt);
  if (state.mode !== "playing") return;
  state.elapsed += dt; state.stageElapsed += dt;
  startBookShooting();
  state.bookNoticeTimer = Math.max(0, state.bookNoticeTimer - dt);
  enemyNotice.hidden = state.bookNoticeTimer <= 0;
  const healLevel = effectLevel("auto-heal");
  if (healLevel > 0) {
    state.healTimer += dt;
    const healInterval = UPGRADE_TUNING.autoHealSeconds * Math.pow(BUILD_TUNING.healIntervalMultiplier, healLevel - 1);
    while (state.healTimer >= healInterval) {
      state.healTimer -= healInterval;
      if (state.player.health < maxPlayerHealth()) {
        state.player.health = Math.min(maxPlayerHealth(), state.player.health + 1);
        addHealEffect();
        updateHud();
      }
    }
  }
  const input = movementInput();
  let dx = input.x, dy = input.y;
  if (Math.hypot(dx, dy) > 0.01) {
    const length = Math.hypot(dx, dy); state.faceX = dx / length; state.faceY = dy / length;
  }
  const dashTime = Math.min(dt, state.dashTimer);
  const speed = PLAYER_SPEED * (1 + effectLevel("wind-light") * GAME_DATA.schoolRules.lightSpeed) * (1 + effectLevel("onion-dash") * UPGRADE_TUNING.moveSpeedPerLevel) * (outsideBossZone() ? 0.8 : 1) * syrupSpeed();
  const oldX = state.player.x, oldY = state.player.y;
  state.player.x += speed * (dx * (dt - dashTime) + state.dashX * gameSettings.dashMultiplier * dashTime);
  state.player.y += speed * (dy * (dt - dashTime) + state.dashY * gameSettings.dashMultiplier * dashTime);
  clampToMap(state.player); updateCamera();
  // 這幀有衝刺就保護到碰撞判斷結束，最後才扣時間。
  if (state.dashTimer > 0 && !state.player.damageDisabled) state.player.invincible = Math.max(state.player.invincible, dt);
  state.dashTimer = countdown(state.dashTimer, dt);
  if (dashTime > 0 && state.dashTimer === 0) schoolDashEnded();
  if (state.dashCharges < maxDashCharges()) {
    state.dashCooldown = countdown(state.dashCooldown, dt);
    if (state.dashCooldown <= 0) {
      state.dashCharges++;
      if (state.dashCharges < maxDashCharges()) state.dashCooldown = gameSettings.dashCooldown;
    }
  }
  if (dashTime > 0) state.dashAttack = UPGRADE_TUNING.dashAttackSeconds;
  else state.dashAttack = countdown(state.dashAttack, dt);
  state.dashGhosts = state.dashGhosts.filter(g => (g.life -= dt) > 0);
  if (dashTime > 0) state.dashGhosts.push({x:oldX,y:oldY,life:.22});
  state.skillCooldown = countdown(state.skillCooldown, dt);
  updateActionControls();
  if (dashTime > 0) schoolDashCrossed(oldX,oldY,state.player.x,state.player.y);
  if (dashTime > 0) leaveDashTrail(state.player.x, state.player.y, Math.hypot(deltaX(state.player.x, oldX), deltaY(state.player.y, oldY)), oldX, oldY);
  state.moveRate = Math.hypot(deltaX(state.player.x, oldX), deltaY(state.player.y, oldY)) / Math.max(.001, dt) / PLAYER_SPEED;
  updateSchoolCombat(dt);
  if (state.mode !== "playing") return;
  updateUltimate(dt);
  if (state.mode !== "playing") return;
  updateFields(dt);
  if (state.mode !== "playing") return;
  updateBomb(dt);
  if (state.mode !== "playing") return;

  const moved = Math.hypot(deltaX(state.player.x, oldX), deltaY(state.player.y, oldY));
  state.player.moving = moved > 0.001;
  if (state.player.moving) state.player.walkPhase += moved / 12;
  else state.player.walkPhase = 0;
  if (deltaX(state.player.x, oldX)) state.player.facing = deltaX(state.player.x, oldX) > 0 ? 1 : -1;

  updateEncounters(dt);
  state.spawnTimer -= dt;
  if (!state.boss && state.stageElapsed >= gameSettings.waveSeconds && state.bossIntro <= 0) summonTeacher();
  if (!state.boss) {
    let wave = currentWaves()[0];
    for (const row of currentWaves()) if (state.stageElapsed >= row.start) wave = row;
    const spawnEvery = wave.every / gameSettings.spawnScale;
    while (state.spawnTimer <= 0) { spawnEnemy(); state.spawnTimer += spawnEvery; }
  }
  if (state.bossIntro > 0) {
    state.bossIntro -= dt;
    for (const enemy of state.enemies) { if (enemy.miniboss) continue; enemy.x += (deltaX(state.boss.x, enemy.x)) * Math.min(1, dt * 3); enemy.y += (deltaY(state.boss.y, enemy.y)) * Math.min(1, dt * 3); }
    if (state.bossIntro <= 0) { burst(state.boss.x, state.boss.y, "#fff36b", 32); updateHud(); }
  }
  state.shotTimer -= dt;
  if (state.shotTimer <= 0) { fireAtNearest(); state.shotTimer += effectiveShotInterval(); }
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const vx = deltaX(state.player.x, enemy.x), vy = deltaY(state.player.y, enemy.y);
    const distance = Math.max(0.01, Math.hypot(vx, vy));
    enemy.x += vx / distance * enemy.speed * eliteSpeed(enemy) * (enemy.behavior === "still" ? 0 : enemy.behavior === "retreat" && distance < 230 ? -1 : 1) * (enemy.stunTimer > 0 ? 0 : 1) * (enemy.slowTimer > 0 ? (enemy.makerSlow || BUILD_TUNING.slowMultiplier) : 1) * (1 + Math.floor(state.stageElapsed / 30) * UPGRADE_TUNING.enemySpeedGrowth) * dt;
    enemy.y += vy / distance * enemy.speed * eliteSpeed(enemy) * (enemy.behavior === "still" ? 0 : enemy.behavior === "retreat" && distance < 230 ? -1 : 1) * (enemy.stunTimer > 0 ? 0 : 1) * (enemy.slowTimer > 0 ? (enemy.makerSlow || BUILD_TUNING.slowMultiplier) : 1) * (1 + Math.floor(state.stageElapsed / 30) * UPGRADE_TUNING.enemySpeedGrowth) * dt;
    if (enemy.knockback > 0) { const k = Math.min(enemy.knockback, KNOCKBACK_SPEED) * dt; enemy.x += enemy.knockX / distance * k; enemy.y += enemy.knockY / distance * k; enemy.knockback = Math.max(0, enemy.knockback - KNOCKBACK_SPEED * dt); }
    clampToMap(enemy);
    enemy.stunTimer = countdown(enemy.stunTimer || 0, dt);
    enemy.slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
    enemy.wobble += dt * 6;
    enemy.flash = Math.max(0, enemy.flash - dt);
  }
  for (const shot of state.projectiles) {
    if (!shot.alive) continue;
    shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    shot.rangeLeft -= Math.hypot(shot.vx, shot.vy) * dt;
    if (shot.rangeLeft <= 0) { shot.alive = false; continue; }
    clampToMap(shot);
    for (const enemy of state.enemies) {
      if (enemy.alive && canAttackTarget(enemy) && !shot.hitList.includes(enemy) && Math.hypot(deltaX(enemy.x, shot.x), deltaY(enemy.y, shot.y)) < enemy.r + shot.r) {
        shot.hitList.push(enemy);
        schoolShotHit(shot, enemy);
        damageEnemy(enemy, shot.damage);
        for (const school of shot.schools || []) schoolEffect(school, enemy, school === "wind" ? state.player.x : enemy.x, school === "wind" ? state.player.y : enemy.y, shot.damage, shot.hitList);
        if (state.mode !== "playing") return;
        if (effectLevel("splash-water") > 0) {
          const radius = UPGRADE_TUNING.splashBaseRadius + effectLevel("splash-water") * UPGRADE_TUNING.splashPerLevel;
          skillVisual("splash", enemy.x, enemy.y, { radius });
          for (const nearby of state.enemies) if (nearby !== enemy && nearby.alive && canAttackTarget(nearby) && !shot.hitList.includes(nearby) && Math.hypot(deltaX(nearby.x, enemy.x), deltaY(nearby.y, enemy.y)) < radius) { shot.hitList.push(nearby); damageEnemy(nearby, shot.damage * BUILD_TUNING.supportSplashDamage); }
        }
        resolveWaterHit(shot);
        if (!shot.alive) break;
      }
    }
    if (shot.alive && state.boss && canAttackTarget(state.boss) && !shot.hitList.includes(state.boss) && Math.hypot(deltaX(state.boss.x, shot.x), deltaY(state.boss.y, shot.y)) < state.boss.r + shot.r) {
      shot.hitList.push(state.boss);
      const boss = state.boss;
      playSound("hit");
      schoolShotHit(shot, boss);
      boss.hp -= schoolDamage(boss, shot.damage); boss.flash = HIT_FLASH_SECONDS; updateHud();
      for (const school of shot.schools || []) schoolEffect(school, boss, school === "wind" ? state.player.x : boss.x, school === "wind" ? state.player.y : boss.y, shot.damage, shot.hitList);
      resolveWaterHit(shot);
      if (state.mode !== "playing") return;
      if (state.boss && state.boss.hp <= 0) { state.boss = null; finishRun(true); return; }
    }
  }
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    if (!state.projectiles[i].alive) state.projectilePool.push(state.projectiles.splice(i, 1)[0]);
  }
  state.enemies = state.enemies.filter((enemy) => enemy.alive);
  updateBookShooting(dt);
  updateBoss(dt);
  updateBossZone(dt);
  if (state.mode !== "playing") return;
  for (let i = state.enemyShots.length - 1; i >= 0; i--) {
    const shot = state.enemyShots[i]; shot.x += shot.vx * dt; shot.y += shot.vy * dt; clampToMap(shot);
    if (shot.source === "teacher" && (!state.boss || !targetVisible(state.boss) || !targetVisible(shot) || (shot.life -= dt) <= 0)) {
      state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]); continue;
    }
    if (schoolWindWall() && Math.hypot(deltaX(shot.x, state.player.x), deltaY(shot.y, state.player.y)) < GAME_DATA.schoolRules.eyeRadius + shot.r) { state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]); continue; }
    if (Math.hypot(deltaX(shot.x, state.player.x), deltaY(shot.y, state.player.y)) < state.player.r + shot.r) {
      if (!state.player.damageDisabled && state.player.invincible <= 0) { state.player.health = Math.max(0, state.player.health - absorbSchoolHit(shot.damage === undefined ? UPGRADE_TUNING.teacherShotDamage : shot.damage)); counterDischarge(); if (state.mode !== "playing") return; state.player.hitFlash = 0.16; state.player.invincible = INVINCIBLE_SECONDS; if (gameSettings.vibration && navigator.vibrate) navigator.vibrate(35); playSound("hurt"); updateHud(); }
      state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]);
    } else if (shot.source !== "teacher" && ((shot.life = (shot.life === undefined ? 8 : shot.life) - dt) <= 0)) state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]);
  }
  if (state.player.health <= 0) { finishRun(false); return; }
  for (const gem of state.gems) {
    if (!gem.alive) continue;
    gem.wobble += dt * 5;
    const dx = deltaX(state.player.x, gem.x), dy = deltaY(state.player.y, gem.y), distance = Math.hypot(dx, dy);
    const pullRadius = GEM_PULL_RADIUS * (1 + effectLevel("wind-light") * GAME_DATA.schoolRules.lightMagnet) * (1 + effectLevel("gem-magnet") * UPGRADE_TUNING.magnetPerLevel);
    if (distance < pullRadius && distance > 0.1) { const speed = 150 + (pullRadius - distance) * 3; gem.x += dx / distance * speed * dt; gem.y += dy / distance * speed * dt; }
    clampToMap(gem);
    if (distance < state.player.r + gem.r + 3) { gem.alive = false; grantExperience(gem.value); if (state.mode === "levelup") break; }
  }
  if (state.mode === "levelup") return;
  for (let i = state.gems.length - 1; i >= 0; i--) {
    if (!state.gems[i].alive) state.gemPool.push(state.gems.splice(i, 1)[0]);
  }

  for (const effect of state.effects) { effect.life -= dt; effect.x += effect.vx * dt; effect.y += effect.vy * dt; clampToMap(effect); }
  for (let i = state.effects.length - 1; i >= 0; i--) {
    if (state.effects[i].life <= 0) state.effectPool.push(state.effects.splice(i, 1)[0]);
  }
  // 先判斷碰撞，再減少無敵時間，避免最後一幀又被撞一次。
  if (!state.player.damageDisabled && state.player.invincible <= 0) {
    const touchingEnemy = state.enemies.find((enemy) => enemy.alive && Math.hypot(deltaX(enemy.x, state.player.x), deltaY(enemy.y, state.player.y)) < enemy.r + state.player.r - 2);
    const touchingBoss = state.boss && targetVisible(state.boss) && state.bossIntro <= 0 && state.bossPhasePause <= 0 && !state.bossMoves.some(move => bossKind(move) === "dash") && Math.hypot(deltaX(state.boss.x, state.player.x), deltaY(state.boss.y, state.player.y)) < state.boss.r + state.player.r - 2;
    if (touchingEnemy || touchingBoss) {
      state.player.health = Math.max(0, state.player.health - absorbSchoolHit(touchingEnemy ? touchingEnemy.damage : UPGRADE_TUNING.enemyDamage));
      counterDischarge(); if (state.mode !== "playing") return;
      state.player.invincible = INVINCIBLE_SECONDS;
      state.player.hitFlash = 0.16;
      if (gameSettings.vibration && navigator.vibrate) navigator.vibrate(35);
      playSound("hurt");
      updateHud();
    }
  }
  state.player.invincible = Math.max(0, state.player.invincible - dt);
  state.player.hitFlash = Math.max(0, state.player.hitFlash - dt);
  if (state.player.health <= 0) { finishRun(false); return; }
  statusEl.textContent = `${Math.floor(state.elapsed)} 秒`;
}

// 小型背景圖塊預先繪製並快取；逐幀只貼鏡頭內圖塊，不配置世界大小的圖片。

function renderLoop() { render(); requestAnimationFrame(renderLoop); }

function scheduleFrame() { if (frameRequest !== null) return; frameRequest = requestAnimationFrame(frame); }
function frame(now) { Survivor.audio.sync(); frameRequest = null; const dt = Math.min(MAX_DT, Math.max(0, (now - state.lastTime) / 1000)); state.lastTime = now; tick(dt); if (state.mode === "playing" || state.mode === "transition") scheduleFrame(); }
function togglePause() { if (!settingsPanel.hidden || state.mode === "levelup") return; if (state.mode === "playing") { if (frameRequest !== null) { cancelAnimationFrame(frameRequest); frameRequest = null; } showOverlay("paused"); } else if (state.mode === "paused") { state.mode = "playing"; overlay.classList.add("hidden"); SurvivorIcons.set(pauseButton, "settings"); updateActionControls(); state.lastTime = performance.now(); scheduleFrame(); } }


// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.engine = globalThis.Survivor.engine || {};
globalThis.Survivor.engine.loop = globalThis.Survivor.engine.loop || {};
Object.defineProperties(globalThis.Survivor.engine.loop, {
  wrapCoordinate: { enumerable: true, get: () => wrapCoordinate },
  wrapDelta: { enumerable: true, get: () => wrapDelta },
  deltaX: { enumerable: true, get: () => deltaX },
  deltaY: { enumerable: true, get: () => deltaY },
  clampToMap: { enumerable: true, get: () => clampToMap },
  updateCamera: { enumerable: true, get: () => updateCamera },
  resetMap: { enumerable: true, get: () => resetMap },
  fitVisibleViewport: { enumerable: true, get: () => fitVisibleViewport },
  resize: { enumerable: true, get: () => resize },
  resetGame: { enumerable: true, get: () => resetGame },
  startGame: { enumerable: true, get: () => startGame },
  finishRun: { enumerable: true, get: () => finishRun },
  countdown: { enumerable: true, get: () => countdown },
  tick: { enumerable: true, get: () => tick },
  renderLoop: { enumerable: true, get: () => renderLoop },
  scheduleFrame: { enumerable: true, get: () => scheduleFrame },
  frame: { enumerable: true, get: () => frame },
  togglePause: { enumerable: true, get: () => togglePause }
});
