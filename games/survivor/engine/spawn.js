function spawnEnemy() {
  if (state.enemies.length >= ENEMY_LIMIT) return;
  let wave = currentWaves()[0];
  for (const row of currentWaves()) if (state.stageElapsed >= row.start) wave = row;
  const configuredTypes = [
    { ...ENEMY_TYPES[0], speed: gameSettings.enemySpeed, hp: gameSettings.enemyHealth },
    { ...ENEMY_TYPES[1], speed: gameSettings.secondEnemySpeed, hp: gameSettings.secondEnemyHealth }
  ];
  const type = Math.random() < wave.otsubon / (wave.jaben + wave.otsubon) ? configuredTypes[1] : configuredTypes[0];
  const position = offscreenSpawn(type.radius);
  if (!position) return; // 視窗大到看見整張地圖時，等有鏡頭外空間再生成。
  const { x, y } = position;
  state.enemies.push({ typeId: type.id, behavior: type.behavior, x, y, r: type.radius, speed: type.speed * currentStage().enemySpeedScale, damage: type.damage, color: type.color, hp: type.hp * currentStage().enemyHealthScale, maxHp: type.hp * currentStage().enemyHealthScale, wobble: Math.random() * Math.PI * 2, alive: true, flash: 0, shotCooldown: Math.random() * bookShotInterval(type.id) });
}

function bookShotInterval(typeId) {
  if (MAKER_MODE) return ENEMY_TYPES.find(e => e.id === typeId).attack.interval;
  return typeId === "otsubon" ? gameSettings.secondEnemyShotInterval : gameSettings.enemyShotInterval;
}

function startBookShooting() {
  const firstLevel = MAKER_MODE ? Math.min(...ENEMY_TYPES.filter(e => e.attack.type !== "none").map(e => e.attack.level)) : gameSettings.enemyShootLevel;
  if (state.bookShootingStarted || state.level < firstLevel) return;
  state.bookShootingStarted = true; state.bookNoticeTimer = 4;
  enemyNotice.textContent = MAKER_MODE ? "怪物開始用招式了！" : ENEMY_TYPES[0].name + "開始丟字了！"; enemyNotice.hidden = false;
}

function updateBookShooting(dt) {
  if (state.level < (MAKER_MODE ? Math.min(...ENEMY_TYPES.map(e => e.attack.level)) : gameSettings.enemyShootLevel) || state.bossIntro > 0) return;
  state.bookShotTimer = Math.max(0, state.bookShotTimer - dt);
  for (const enemy of state.enemies) enemy.shotCooldown = Math.max(0, enemy.shotCooldown - dt);
  if (state.bookShotTimer > 0 || state.enemyShots.filter((shot) => shot.source === "book").length >= UPGRADE_TUNING.enemyShotLimit) return;
  // 每次只選一隻準備好的小兵；離開畫面的、被打倒的都不能丟字。
  const ready = state.enemies.filter((enemy) => enemy.alive && !(enemy.stunTimer > 0) && enemy.shotCooldown <= 0 && enemy.x >= state.cameraX + enemy.r && enemy.x <= state.cameraX + state.width - enemy.r && enemy.y >= state.cameraY + enemy.r && enemy.y <= state.cameraY + state.height - enemy.r);
  if (!ready.length) return;
  const allowed = ready.filter(e => !MAKER_MODE || (ENEMY_TYPES.find(t => t.id === e.typeId).attack.type !== "none" && state.level >= ENEMY_TYPES.find(t => t.id === e.typeId).attack.level));
  if (!allowed.length) return;
  const enemy = allowed[Math.floor(Math.random() * allowed.length)];
  const attack = MAKER_MODE ? ENEMY_TYPES.find(t => t.id === enemy.typeId).attack : { type: "projectile", count: 1, spread: 0, speed: gameSettings.enemyShotSpeed, damage: gameSettings.enemyShotDamage, radius: 12 };
  const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
  if (attack.type === "aoe") {
    // 怪物範圍攻擊先預警，落點固定，不追著玩家跑。
    if (state.enemyHazards.length < 8) state.enemyHazards.push({ x: state.player.x, y: state.player.y, r: attack.radius, damage: attack.damage, warning: .9 });
  } else if (attack.type === "summon") {
    for (let n = 0; n < attack.count; n++) spawnEnemy();
  } else for (let n = 0; n < attack.count; n++) {
    if (state.enemyShots.filter(s => s.source === "book").length >= UPGRADE_TUNING.enemyShotLimit) break;
    const a = angle + (n - (attack.count - 1) / 2) * attack.spread;
    state.enemyShots.push(takeFromPool(state.enemyShotPool, {
      source: "book", x: enemy.x, y: enemy.y, vx: Math.cos(a) * attack.speed, vy: Math.sin(a) * attack.speed,
      text: BOOK_CHARACTERS[Math.floor(Math.random() * BOOK_CHARACTERS.length)], r: attack.radius, damage: attack.damage
    }));
  }
  enemy.shotCooldown = bookShotInterval(enemy.typeId);
  state.bookShotTimer = UPGRADE_TUNING.enemyShotGap;
}

// 從鏡頭四邊選仍在地圖內的一側；整個身體加緩衝都在畫面外。
function offscreenSpawn(r) {
  const gap = r + 16;
  const left = state.cameraX, top = state.cameraY;
  const right = left + state.width, bottom = top + state.height;
  const minX = Math.max(r, left), maxX = Math.min(state.worldWidth - r, right);
  const minY = Math.max(r, top), maxY = Math.min(state.worldHeight - r, bottom);
  const sides = [];
  if (minY <= maxY) {
    if (left - gap >= r) sides.push(() => ({ x: left - gap, y: minY + Math.random() * (maxY - minY) }));
    if (right + gap <= state.worldWidth - r) sides.push(() => ({ x: right + gap, y: minY + Math.random() * (maxY - minY) }));
  }
  if (minX <= maxX) {
    if (top - gap >= r) sides.push(() => ({ x: minX + Math.random() * (maxX - minX), y: top - gap }));
    if (bottom + gap <= state.worldHeight - r) sides.push(() => ({ x: minX + Math.random() * (maxX - minX), y: bottom + gap }));
  }
  return sides.length ? sides[Math.floor(Math.random() * sides.length)]() : null;
}



// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.engine = globalThis.Survivor.engine || {};
globalThis.Survivor.engine.spawn = globalThis.Survivor.engine.spawn || {};
Object.defineProperties(globalThis.Survivor.engine.spawn, {
  spawnEnemy: { enumerable: true, get: () => spawnEnemy },
  bookShotInterval: { enumerable: true, get: () => bookShotInterval },
  startBookShooting: { enumerable: true, get: () => startBookShooting },
  updateBookShooting: { enumerable: true, get: () => updateBookShooting },
  offscreenSpawn: { enumerable: true, get: () => offscreenSpawn }
});
