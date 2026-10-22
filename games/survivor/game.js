// ✏️ Erin 設定區：改大會變多或變快，改小會變少或變慢。
const PLAYER_SPEED = 190; // 主角每秒走幾步；改大跑更快，改小跑更慢
const PLAYER_HEALTH = 100; // 主角血條長度；改大比較耐撞，改小比較容易輸
const ENEMY_LIMIT = 18; // 最多同時幾個甲本；改大畫面更熱鬧
const ENEMY_TYPES = [
  { id: "jaben", name: "甲本", color: "#d58b55", speed: 62, radius: 17, damage: 12, hp: 100 }
];
const SPRITES = { player: null, jaben: null }; // null 會用程式畫色塊
const INVINCIBLE_SECONDS = 1.15; // 被撞後閃爍幾秒，這段時間不會再扣血
const SHOT_INTERVAL = 0.72; // 每隔幾秒自動發射一顆水球
const PROJECTILE_DAMAGE = 35; // 每顆水球造成多少傷害
const PROJECTILE_SPEED = 390; // 水球飛行速度
const PROJECTILE_LIMIT = 24; // 同時存在的水球上限
const GEM_LIMIT = 24; // 同時存在的經驗寶石上限
const GEM_PULL_RADIUS = 105; // 靠多近時，寶石會被吸過來
const XP_TO_LEVEL = 5; // 升級需要收集幾顆寶石
const WATER_COLOR = "#168cff"; // Erin 可以改水球顏色
const GEM_COLOR = "#ff9f24"; // Erin 可以改經驗寶石顏色

const MAX_DT = 0.05; // 切回遊戲時，限制單次更新不要跳太遠
const stage = document.getElementById("stage");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const titleEl = document.getElementById("messageTitle");
const textEl = document.getElementById("messageText");
const iconEl = document.getElementById("messageIcon");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const healthFill = document.getElementById("healthFill");
const statusEl = document.getElementById("status");
const experienceFill = document.getElementById("experienceFill");
const levelLabel = document.getElementById("levelLabel");

const state = { mode: "ready", player: { x: 0, y: 0, r: 18, health: PLAYER_HEALTH, invincible: 0, hitFlash: 0 }, enemies: [], projectiles: [], gems: [], effects: [], projectilePool: [], gemPool: [], effectPool: [], keys: new Set(), pointerId: null, joy: null, elapsed: 0, spawnTimer: 0, shotTimer: 0, xp: 0, level: 1, lastTime: 0, width: 0, height: 0 };

function takeFromPool(pool, values) {
  const item = pool.pop() || {};
  Object.assign(item, values);
  return item;
}

function resize() {
  const rect = stage.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = Math.max(1, rect.width);
  state.height = Math.max(1, rect.height);
  canvas.width = Math.round(state.width * ratio);
  canvas.height = Math.round(state.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (state.mode === "ready") { state.player.x = state.width / 2; state.player.y = state.height / 2; }
  state.player.x = Math.max(state.player.r, Math.min(state.width - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(state.height - state.player.r, state.player.y));
}

function resetGame() {
  for (const item of state.projectiles) state.projectilePool.push(item);
  for (const item of state.gems) state.gemPool.push(item);
  for (const item of state.effects) state.effectPool.push(item);
  state.player = { x: state.width / 2, y: state.height / 2, r: 18, health: PLAYER_HEALTH, invincible: 0, hitFlash: 0 };
  state.enemies = [];
  state.projectiles = [];
  state.gems = [];
  state.effects = [];
  state.elapsed = 0;
  state.spawnTimer = 0.5;
  state.shotTimer = 0.15;
  state.xp = 0;
  state.level = 1;
  state.keys.clear();
  state.joy = null;
  updateHud();
}

function startGame() {
  resetGame();
  state.mode = "playing";
  overlay.classList.add("hidden");
  pauseButton.textContent = "Ⅱ";
  state.lastTime = performance.now();
  requestAnimationFrame(frame);
  spawnEnemy();
}

function showOverlay(mode) {
  state.mode = mode;
  overlay.classList.remove("hidden");
  if (mode === "paused") { iconEl.textContent = "⏸️"; titleEl.textContent = "先休息一下"; textEl.textContent = "準備好了再繼續玩。"; startButton.textContent = "繼續遊戲"; statusEl.textContent = "已暫停"; pauseButton.textContent = "▶"; }
  else if (mode === "over") { iconEl.textContent = "💫"; titleEl.textContent = "再試一次！"; textEl.textContent = "甲本把血條撞光了，按下按鈕重新開始。"; startButton.textContent = "重新開始"; statusEl.textContent = "本局結束"; pauseButton.textContent = "Ⅱ"; }
  else { iconEl.textContent = "🧅"; titleEl.textContent = "小怪獸"; textEl.textContent = "用方向鍵、WASD 或手指搖桿移動，躲開甲本！"; startButton.textContent = "開始遊戲"; statusEl.textContent = "準備開始"; }
}

function updateHud() {
  const ratio = Math.max(0, state.player.health / PLAYER_HEALTH);
  healthFill.style.width = `${ratio * 100}%`;
  healthFill.style.background = ratio < 0.3 ? "linear-gradient(#ff8585 0 48%, #e13e4d 49%)" : "linear-gradient(#5be08b 0 48%, #24b75c 49%)";
  experienceFill.style.width = `${state.xp / XP_TO_LEVEL * 100}%`;
  levelLabel.textContent = `Lv.${state.level}`;
}

function spawnEnemy() {
  if (state.enemies.length >= ENEMY_LIMIT) return;
  const type = ENEMY_TYPES[0];
  const side = Math.floor(Math.random() * 4);
  const pad = type.radius + 3;
  let x = side === 0 ? -pad : side === 1 ? state.width + pad : Math.random() * state.width;
  let y = side === 2 ? -pad : side === 3 ? state.height + pad : Math.random() * state.height;
  if (Math.hypot(x - state.player.x, y - state.player.y) < Math.min(state.width, state.height) * 0.32) { x = side < 2 ? x : (x + state.width / 2) % state.width; y = side >= 2 ? y : (y + state.height / 2) % state.height; }
  state.enemies.push({ x, y, r: type.radius, speed: type.speed, color: type.color, hp: type.hp, maxHp: type.hp, wobble: Math.random() * Math.PI * 2, alive: true, flash: 0 });
}

function closestEnemy() {
  let target = null, best = Infinity;
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const distance = (enemy.x - state.player.x) ** 2 + (enemy.y - state.player.y) ** 2;
    if (distance < best) { best = distance; target = enemy; }
  }
  return target;
}

function fireAtNearest() {
  const target = closestEnemy();
  if (!target || state.projectiles.length >= PROJECTILE_LIMIT) return;
  const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x);
  state.projectiles.push(takeFromPool(state.projectilePool, { x: state.player.x, y: state.player.y, vx: Math.cos(angle) * PROJECTILE_SPEED, vy: Math.sin(angle) * PROJECTILE_SPEED, r: state.player.r * 2 / 3, alive: true }));
}

function burst(x, y, color, count = 8) {
  for (let i = 0; i < count && state.effects.length < 90; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 45 + Math.random() * 110;
    state.effects.push(takeFromPool(state.effectPool, { kind: "spark", x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color, life: 0.42 + Math.random() * 0.22, maxLife: 0.64, text: "" }));
  }
}

function damageEnemy(enemy) {
  enemy.hp -= PROJECTILE_DAMAGE;
  enemy.flash = 0.12;
  if (state.effects.length < 90) state.effects.push(takeFromPool(state.effectPool, { kind: "number", x: enemy.x, y: enemy.y - enemy.r, vx: 0, vy: -28, color: "#fff", life: 0.7, maxLife: 0.7, text: `${PROJECTILE_DAMAGE}` }));
  if (enemy.hp <= 0) {
    enemy.alive = false;
    if (state.effects.length < 90) state.effects.push(takeFromPool(state.effectPool, { kind: "evaporate", x: enemy.x, y: enemy.y, vx: 0, vy: 0, color: "#ffe2a8", life: 0.42, maxLife: 0.42, text: "" }));
    burst(enemy.x, enemy.y, "#ffe2a8", 8);
    if (state.gems.length < GEM_LIMIT) state.gems.push(takeFromPool(state.gemPool, { x: enemy.x, y: enemy.y, r: 8, value: 1, alive: true, wobble: Math.random() * 6 }));
  } else burst(enemy.x, enemy.y, "#ffffff", 4);
}

function tick(dt) {
  if (state.mode !== "playing") return;
  state.elapsed += dt;
  let dx = 0, dy = 0;
  if (state.keys.has("ArrowLeft") || state.keys.has("a")) dx -= 1;
  if (state.keys.has("ArrowRight") || state.keys.has("d")) dx += 1;
  if (state.keys.has("ArrowUp") || state.keys.has("w")) dy -= 1;
  if (state.keys.has("ArrowDown") || state.keys.has("s")) dy += 1;
  if (state.joy) { dx += state.joy.x; dy += state.joy.y; }
  const length = Math.hypot(dx, dy);
  if (length > 1) { dx /= length; dy /= length; }
  state.player.x = Math.max(state.player.r, Math.min(state.width - state.player.r, state.player.x + dx * PLAYER_SPEED * dt));
  state.player.y = Math.max(state.player.r, Math.min(state.height - state.player.r, state.player.y + dy * PLAYER_SPEED * dt));

  state.spawnTimer -= dt;
  const spawnEvery = Math.max(0.72, 2.1 - state.elapsed * 0.015);
  while (state.spawnTimer <= 0) { spawnEnemy(); state.spawnTimer += spawnEvery; }
  state.shotTimer -= dt;
  if (state.shotTimer <= 0) { fireAtNearest(); state.shotTimer += SHOT_INTERVAL; }
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const vx = state.player.x - enemy.x, vy = state.player.y - enemy.y;
    const distance = Math.max(0.01, Math.hypot(vx, vy));
    enemy.x += vx / distance * enemy.speed * dt;
    enemy.y += vy / distance * enemy.speed * dt;
    enemy.wobble += dt * 6;
    enemy.flash = Math.max(0, enemy.flash - dt);
  }
  for (const shot of state.projectiles) {
    if (!shot.alive) continue;
    shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if (shot.x < -12 || shot.y < -12 || shot.x > state.width + 12 || shot.y > state.height + 12) { shot.alive = false; continue; }
    for (const enemy of state.enemies) {
      if (enemy.alive && Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < enemy.r + shot.r) {
        shot.alive = false; damageEnemy(enemy); break;
      }
    }
  }
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    if (!state.projectiles[i].alive) state.projectilePool.push(state.projectiles.splice(i, 1)[0]);
  }
  state.enemies = state.enemies.filter((enemy) => enemy.alive);
  for (const gem of state.gems) {
    if (!gem.alive) continue;
    gem.wobble += dt * 5;
    const dx = state.player.x - gem.x, dy = state.player.y - gem.y, distance = Math.hypot(dx, dy);
    if (distance < GEM_PULL_RADIUS && distance > 0.1) { const speed = 150 + (GEM_PULL_RADIUS - distance) * 3; gem.x += dx / distance * speed * dt; gem.y += dy / distance * speed * dt; }
    if (distance < state.player.r + gem.r + 3) { gem.alive = false; state.xp += gem.value; if (state.xp >= XP_TO_LEVEL) { state.xp -= XP_TO_LEVEL; state.level++; } updateHud(); }
  }
  for (let i = state.gems.length - 1; i >= 0; i--) {
    if (!state.gems[i].alive) state.gemPool.push(state.gems.splice(i, 1)[0]);
  }
  for (const effect of state.effects) { effect.life -= dt; effect.x += effect.vx * dt; effect.y += effect.vy * dt; }
  for (let i = state.effects.length - 1; i >= 0; i--) {
    if (state.effects[i].life <= 0) state.effectPool.push(state.effects.splice(i, 1)[0]);
  }
  // 先判斷碰撞，再減少無敵時間，避免最後一幀又被撞一次。
  if (state.player.invincible <= 0) {
    for (const enemy of state.enemies) {
      if (enemy.alive && Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) < enemy.r + state.player.r - 2) {
        state.player.health = Math.max(0, state.player.health - ENEMY_TYPES[0].damage);
        state.player.invincible = INVINCIBLE_SECONDS;
        state.player.hitFlash = 0.16;
        updateHud();
        break;
      }
    }
  }
  state.player.invincible = Math.max(0, state.player.invincible - dt);
  state.player.hitFlash = Math.max(0, state.player.hitFlash - dt);
  if (state.player.health <= 0) { showOverlay("over"); return; }
  statusEl.textContent = `躲避中　${Math.floor(state.elapsed)} 秒`;
}

function drawClassroom() {
  ctx.fillStyle = "#eaf4d5"; ctx.fillRect(0, 0, state.width, state.height);
  // 淡色方格地磚
  const size = 42;
  ctx.strokeStyle = "rgba(91,137,91,.12)"; ctx.lineWidth = 1;
  for (let x = 0; x < state.width; x += size) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.height); ctx.stroke(); }
  for (let y = 0; y < state.height; y += size) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke(); }
  // 教室牆邊的小彩色櫃子
  ctx.fillStyle = "#f4c76e"; ctx.fillRect(14, 42, 72, 18); ctx.fillStyle = "#9bc7e8"; ctx.fillRect(92, 42, 55, 18);
}

function drawBlob(x, y, r, color, isPlayer, bounce, flash) {
  ctx.save(); ctx.translate(x, y + Math.sin(bounce) * 2);
  ctx.fillStyle = "rgba(36,57,67,.22)"; ctx.beginPath(); ctx.ellipse(1, r * .82, r * .9, r * .27, 0, 0, Math.PI * 2); ctx.fill();
  if (flash) ctx.globalAlpha = 0.55 + Math.abs(Math.sin(performance.now() / 25)) * 0.45;
  ctx.fillStyle = flash ? "#fff" : color; ctx.strokeStyle = isPlayer ? "#2458a4" : "#87522f"; ctx.lineWidth = 3;
  ctx.beginPath();
  if (isPlayer) { ctx.ellipse(0, 0, r * .88, r, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-r * .32, -r * .8, r * .42, r * .4, -.4, 0, Math.PI * 2); ctx.ellipse(r * .32, -r * .8, r * .42, r * .4, .4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else { ctx.rect(-r * .82, -r * .8, r * 1.64, r * 1.6); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#f0bb80"; ctx.fillRect(-r * .5, -r * .55, r, r * .28); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-r * .3, -r * .12, r * .23, 0, Math.PI * 2); ctx.arc(r * .3, -r * .12, r * .23, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#243746"; ctx.beginPath(); ctx.arc(-r * .27, -r * .1, r * .1, 0, Math.PI * 2); ctx.arc(r * .33, -r * .1, r * .1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#243746"; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(0, r * .17, r * .16, .15, Math.PI - .15); ctx.stroke();
  ctx.restore();
}

function render() {
  drawClassroom();
  for (const gem of state.gems) {
    ctx.save(); ctx.translate(gem.x, gem.y + Math.sin(gem.wobble) * 2); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = GEM_COLOR; ctx.strokeStyle = "#268b64"; ctx.lineWidth = 2; ctx.fillRect(-7, -7, 14, 14); ctx.strokeRect(-7, -7, 14, 14);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.fillRect(-4, -4, 3, 3); ctx.restore();
  }
  for (const enemy of state.enemies) {
    drawBlob(enemy.x, enemy.y, enemy.r, enemy.color, false, enemy.wobble, enemy.flash > 0);
    if (enemy.hp < enemy.maxHp) { ctx.fillStyle = "#fff"; ctx.fillRect(enemy.x - 15, enemy.y - enemy.r - 10, 30, 4); ctx.fillStyle = "#f16b68"; ctx.fillRect(enemy.x - 15, enemy.y - enemy.r - 10, 30 * enemy.hp / enemy.maxHp, 4); }
  }
  for (const shot of state.projectiles) { ctx.fillStyle = "rgba(28,93,125,.25)"; ctx.beginPath(); ctx.arc(shot.x + 2, shot.y + 3, shot.r + 1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = WATER_COLOR; ctx.strokeStyle = "#2877a8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.arc(shot.x - 2, shot.y - 2, 2, 0, Math.PI * 2); ctx.fill(); }
  for (const effect of state.effects) {
    const alpha = Math.max(0, effect.life / effect.maxLife); ctx.globalAlpha = alpha; ctx.fillStyle = effect.color;
    if (effect.kind === "number") { ctx.font = "bold 15px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#355066"; ctx.lineWidth = 3; ctx.strokeText(effect.text, effect.x, effect.y); ctx.fillText(effect.text, effect.x, effect.y); }
    else if (effect.kind === "evaporate") { ctx.beginPath(); ctx.ellipse(effect.x, effect.y, 13 * (1.5 - alpha), 18 * alpha, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillRect(effect.x - 2, effect.y - 2, 4, 4); }
    ctx.globalAlpha = 1;
  }
  const blinking = state.player.invincible > 0 && Math.floor(performance.now() / 90) % 2 === 0;
  if (!blinking || state.player.hitFlash > 0) drawBlob(state.player.x, state.player.y, state.player.r, "#4a9dff", true, state.elapsed * 9, state.player.hitFlash > 0);
  if (state.joy) {
    ctx.globalAlpha = .42; ctx.strokeStyle = "#173f62"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(state.joy.baseX, state.joy.baseY, 46, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#4186be"; ctx.beginPath(); ctx.arc(state.joy.baseX + state.joy.x * 27, state.joy.baseY + state.joy.y * 27, 19, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  requestAnimationFrame(render);
}

let frameRequest = null;
function scheduleFrame() { if (frameRequest !== null) return; frameRequest = requestAnimationFrame(frame); }
function frame(now) { frameRequest = null; const dt = Math.min(MAX_DT, Math.max(0, (now - state.lastTime) / 1000)); state.lastTime = now; tick(dt); if (state.mode === "playing") scheduleFrame(); }
function togglePause() { if (state.mode === "playing") { if (frameRequest !== null) { cancelAnimationFrame(frameRequest); frameRequest = null; } showOverlay("paused"); } else if (state.mode === "paused") { state.mode = "playing"; overlay.classList.add("hidden"); pauseButton.textContent = "Ⅱ"; state.lastTime = performance.now(); scheduleFrame(); } }

startButton.addEventListener("click", () => state.mode === "paused" ? togglePause() : startGame());
pauseButton.addEventListener("click", togglePause);
window.addEventListener("keydown", (event) => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) event.preventDefault(); state.keys.add(key); if (key === "Escape" || key === " ") togglePause(); });
window.addEventListener("keyup", (event) => state.keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener("blur", () => { state.keys.clear(); if (state.mode === "playing") showOverlay("paused"); });
document.addEventListener("visibilitychange", () => { if (document.hidden && state.mode === "playing") showOverlay("paused"); });
window.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  if (state.pointerId !== null) return;
  event.preventDefault(); state.pointerId = event.pointerId; canvas.setPointerCapture(event.pointerId);
  const rect = canvas.getBoundingClientRect(); const baseX = event.clientX - rect.left; const baseY = event.clientY - rect.top;
  state.joy = { baseX, baseY, x: 0, y: 0 };
});
canvas.addEventListener("pointermove", (event) => { if (event.pointerId !== state.pointerId || !state.joy) return; event.preventDefault(); const rect = canvas.getBoundingClientRect(); const dx = event.clientX - rect.left - state.joy.baseX, dy = event.clientY - rect.top - state.joy.baseY; const distance = Math.max(1, Math.hypot(dx, dy)); const amount = Math.min(1, distance / 35); state.joy.x = dx / distance * amount; state.joy.y = dy / distance * amount; });
function endPointer(event) { if (event.pointerId !== state.pointerId) return; state.pointerId = null; state.joy = null; }
canvas.addEventListener("pointerup", endPointer); canvas.addEventListener("pointercancel", endPointer); canvas.addEventListener("lostpointercapture", endPointer);
window.addEventListener("resize", resize);
resize(); showOverlay("ready"); render();
