"use strict";

/* ============================================================
   怪海倖存者（Vampire Survivors 式小遊戲）
   玩家只需要移動，武器會自動攻擊。
   ============================================================
   ★ 可以自己改的地方 ★（改數字就能調整難度，手感自己試）
   下面的 CONFIG 就是「可以自己改的地方」：
   - spawnIntervalStart / spawnIntervalMin：敵人生成間隔（秒），越小怪越多
   - spawnRampPerSecond：生成間隔隨時間變快的速度
   - bossInterval：每幾秒出現一隻菁英／Boss（預設 75 秒）
   - maxEnemies / maxProjectiles / maxGems：數量上限（平板效能用，別調太高）
   - playerBaseHp / playerBaseSpeed：玩家的血量與移動速度
   武器與被動的每一級數值在 WEAPONS / PASSIVES 裡面改：
   - dmg＝傷害、interval＝攻擊間隔（秒）、count＝數量
   ============================================================ */
const CONFIG = {
  spawnIntervalStart: 1.1, // 一開始每幾秒生一隻怪
  spawnIntervalMin: 0.28, // 生成間隔最快到幾秒
  spawnRampPerSecond: 0.006, // 每過 1 秒，生成間隔縮短多少
  bossInterval: 75, // 每幾秒出現菁英／Boss
  maxEnemies: 120, // 敵人數量上限（效能）
  maxProjectiles: 220, // 子彈數量上限（效能）
  maxGems: 300, // 經驗寶石數量上限（效能）
  playerBaseHp: 100, // 玩家初始血量
  playerBaseSpeed: 230, // 玩家移動速度（像素／秒）
  playerRadius: 16, // 玩家體型半徑
  contactInvuln: 0.45, // 被怪碰到後的無敵時間（秒），避免瞬間融化
};

/* 武器定義：index 0 是 Lv1，index 4 是 Lv5（最高級）
   ★ 可以自己改的地方：每一級的 dmg（傷害）、interval（攻擊間隔）、count（數量） */
const WEAPONS = {
  missile: {
    name: "追蹤魔法飛彈",
    icon: "🚀",
    desc: "自動發射飛彈，追蹤最近的敵人",
    levels: [
      { dmg: 12, count: 1, interval: 0.9 },
      { dmg: 14, count: 2, interval: 0.85 },
      { dmg: 17, count: 2, interval: 0.75 },
      { dmg: 20, count: 3, interval: 0.7 },
      { dmg: 26, count: 4, interval: 0.6 },
    ],
  },
  blades: {
    name: "環繞飛刀",
    icon: "🗡️",
    desc: "飛刀繞著你旋轉，碰到敵人造成傷害",
    levels: [
      { dmg: 8, count: 2, radius: 62, rotSpeed: 2.6 },
      { dmg: 10, count: 3, radius: 68, rotSpeed: 2.9 },
      { dmg: 13, count: 3, radius: 74, rotSpeed: 3.2 },
      { dmg: 16, count: 4, radius: 80, rotSpeed: 3.5 },
      { dmg: 20, count: 5, radius: 88, rotSpeed: 3.9 },
    ],
  },
  lightning: {
    name: "連鎖閃電",
    icon: "⚡",
    desc: "定期電擊最近的敵人，還會跳傳到附近敵人",
    levels: [
      { dmg: 14, chains: 2, interval: 1.6 },
      { dmg: 17, chains: 3, interval: 1.5 },
      { dmg: 21, chains: 4, interval: 1.4 },
      { dmg: 26, chains: 5, interval: 1.3 },
      { dmg: 34, chains: 7, interval: 1.1 },
    ],
  },
  aura: {
    name: "火焰光環",
    icon: "🔥",
    desc: "你周圍燃起火焰，靠近的敵人持續受傷",
    levels: [
      { dps: 10, radius: 70 },
      { dps: 15, radius: 80 },
      { dps: 21, radius: 90 },
      { dps: 28, radius: 102 },
      { dps: 38, radius: 118 },
    ],
  },
};

/* 被動能力：最高 Lv5
   ★ 可以自己改的地方：每一級增加多少（perLevel） */
const PASSIVES = {
  power: { name: "攻擊力強化", icon: "💪", desc: "所有武器傷害 +15%", perLevel: 0.15 },
  speed: { name: "移動速度強化", icon: "👟", desc: "移動速度 +8%", perLevel: 0.08 },
  magnet: { name: "拾取範圍強化", icon: "🧲", desc: "經驗寶石的磁吸範圍 +35%", perLevel: 0.35 },
  regen: { name: "每秒回血", icon: "💗", desc: "每秒回復 +0.8 點血量", perLevel: 0.8 },
};
const PASSIVE_MAX = 5;
const WEAPON_MAX = 5;

/* 敵人種類 ★ 可以自己改的地方：hp 血量、speed 速度、dmg 碰撞傷害、xp 掉落經驗 */
const ENEMY_TYPES = {
  normal: { emoji: "🦀", hp: 22, speed: 62, dmg: 10, radius: 15, xp: 1 },
  fast: { emoji: "🦐", hp: 12, speed: 118, dmg: 7, radius: 12, xp: 1 },
  tank: { emoji: "🦈", hp: 95, speed: 36, dmg: 16, radius: 26, xp: 3 },
  elite: { emoji: "🐙", hp: 650, speed: 44, dmg: 22, radius: 38, xp: 18 },
  boss: { emoji: "🐲", hp: 1600, speed: 34, dmg: 30, radius: 50, xp: 45 },
};

const BEST_KEY = "erin-sea-survivor-best"; // 最佳紀錄的 localStorage key

// ---------- DOM ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const stageWrap = canvas.parentElement;
const hpFill = document.getElementById("hpFill");
const hpText = document.getElementById("hpText");
const xpFill = document.getElementById("xpFill");
const levelText = document.getElementById("levelText");
const timeText = document.getElementById("timeText");
const killText = document.getElementById("killText");
const joystickEl = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");
const startScreen = document.getElementById("startScreen");
const levelupScreen = document.getElementById("levelupScreen");
const overScreen = document.getElementById("overScreen");
const choiceRow = document.getElementById("choiceRow");
const bestOnStart = document.getElementById("bestOnStart");
const bestOnOver = document.getElementById("bestOnOver");
const overStats = document.getElementById("overStats");
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);

// ---------- 遊戲狀態 ----------
let state = "menu"; // menu | playing | levelup | over
let player, enemies, projectiles, gems, effects, bolts;
let kills, elapsed, spawnTimer, bossTimer, bossCount, lastTime, rafId;
let keys = {};
let joy = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
let viewW = 800, viewH = 600;

function resetState() {
  player = {
    x: 0, y: 0,
    hp: CONFIG.playerBaseHp, maxHp: CONFIG.playerBaseHp,
    level: 1, xp: 0, xpNeed: xpNeedFor(1),
    weapons: { missile: 1, blades: 0, lightning: 0, aura: 0 }, // 一開始有 Lv1 飛彈
    passives: { power: 0, speed: 0, magnet: 0, regen: 0 },
    timers: { missile: 0, lightning: 0 },
    bladeAngle: 0,
    invuln: 0,
    face: 1,
  };
  enemies = [];
  projectiles = [];
  gems = [];
  effects = []; // 簡單的受擊／死亡小特效（有上限）
  bolts = []; // 閃電線條特效，短暫顯示
  kills = 0;
  elapsed = 0;
  spawnTimer = 0.5;
  bossTimer = CONFIG.bossInterval;
  bossCount = 0;
}

function xpNeedFor(level) {
  // ★ 可以自己改的地方：升級需要的經驗（等級越高需要越多）
  return 5 + (level - 1) * 4;
}

// ---------- 最佳紀錄（localStorage） ----------
function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) {
      const b = JSON.parse(raw);
      return { time: b.time || 0, kills: b.kills || 0, level: b.level || 0 };
    }
  } catch (e) { /* 讀不到就當沒有紀錄 */ }
  return { time: 0, kills: 0, level: 0 };
}

function saveBest() {
  const best = loadBest();
  best.time = Math.max(best.time, Math.floor(elapsed));
  best.kills = Math.max(best.kills, kills);
  best.level = Math.max(best.level, player.level);
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (e) { /* 存不了就算了 */ }
  return best;
}

function bestText(best) {
  if (!best || (best.time === 0 && best.kills === 0 && best.level === 0)) return "尚無紀錄，來創下第一筆吧！";
  return "最佳紀錄：存活 " + fmtTime(best.time) + "｜擊殺 " + best.kills + "｜等級 " + best.level;
}

function fmtTime(sec) {
  sec = Math.floor(sec);
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
}

// ---------- 畫布大小 ----------
function resize() {
  const rect = stageWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // 上限 1.5，平板比較順
  viewW = Math.max(320, rect.width);
  viewH = Math.max(320, rect.height);
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);

// ---------- 輸入：鍵盤 ----------
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

// ---------- 輸入：觸控／滑鼠虛擬搖桿（在畫面上拖曳） ----------
function pointerPos(e) {
  const rect = stageWrap.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
canvas.addEventListener("pointerdown", (e) => {
  if (state !== "playing" || joy.active) return;
  const p = pointerPos(e);
  joy.active = true; joy.id = e.pointerId; joy.ox = p.x; joy.oy = p.y; joy.dx = 0; joy.dy = 0;
  joystickEl.classList.remove("hidden");
  joystickEl.style.left = p.x + "px";
  joystickEl.style.top = p.y + "px";
  joystickKnob.style.transform = "translate(-50%, -50%)";
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (!joy.active || e.pointerId !== joy.id) return;
  const p = pointerPos(e);
  let dx = p.x - joy.ox, dy = p.y - joy.oy;
  const len = Math.hypot(dx, dy);
  const max = 42; // 搖桿最大拖曳距離
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  joy.dx = dx / max; joy.dy = dy / max;
  joystickKnob.style.transform = "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";
});
function joyEnd(e) {
  if (e.pointerId !== joy.id) return;
  joy.active = false; joy.dx = 0; joy.dy = 0;
  joystickEl.classList.add("hidden");
}
canvas.addEventListener("pointerup", joyEnd);
canvas.addEventListener("pointercancel", joyEnd);

function moveInput() {
  let dx = 0, dy = 0;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;
  if (keys["w"] || keys["arrowup"]) dy -= 1;
  if (keys["s"] || keys["arrowdown"]) dy += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    return { x: dx / len, y: dy / len };
  }
  if (joy.active && (joy.dx !== 0 || joy.dy !== 0)) {
    // 搖桿推超過死區才移動；推多大走多快（向量長度已限制在 1 以內）
    const len = Math.hypot(joy.dx, joy.dy);
    if (len > 0.12) return { x: joy.dx, y: joy.dy };
  }
  return { x: 0, y: 0 };
}

// ---------- 敵人生成 ----------
function spawnPos() {
  // 從畫面外一圈隨機位置生成
  const camX = player.x - viewW / 2, camY = player.y - viewH / 2;
  const side = Math.floor(Math.random() * 4);
  const m = 60;
  if (side === 0) return { x: camX - m, y: camY + Math.random() * viewH };
  if (side === 1) return { x: camX + viewW + m, y: camY + Math.random() * viewH };
  if (side === 2) return { x: camX + Math.random() * viewW, y: camY - m };
  return { x: camX + Math.random() * viewW, y: camY + viewH + m };
}

function spawnEnemy(type) {
  if (enemies.length >= CONFIG.maxEnemies) return;
  const base = ENEMY_TYPES[type];
  const p = spawnPos();
  // 怪物的血量隨時間變厚 ★ 可以自己改的地方：0.35 是每分鐘的成長幅度
  const hpMul = 1 + (elapsed / 60) * 0.35;
  enemies.push({
    type, x: p.x, y: p.y,
    hp: base.hp * hpMul, maxHp: base.hp * hpMul,
    speed: base.speed * (0.9 + Math.random() * 0.2),
    dmg: base.dmg, radius: base.radius, xp: base.xp,
    emoji: base.emoji, flash: 0, bladeCd: 0,
  });
}

function pickEnemyType() {
  // 隨時間解鎖更強的怪 ★ 可以自己改的地方：各種類出現的比例
  const r = Math.random();
  if (elapsed > 90 && r < 0.16) return "tank";
  if (r < 0.42) return "fast";
  return "normal";
}

// ---------- 戰鬥 ----------
function powerMul() { return 1 + player.passives.power * PASSIVES.power.perLevel; }
function speedMul() { return 1 + player.passives.speed * PASSIVES.speed.perLevel; }
function magnetRadius() { return 90 * (1 + player.passives.magnet * PASSIVES.magnet.perLevel); } // 基礎拾取範圍 90

function nearestEnemy(x, y, maxDist, exclude) {
  let best = null, bestD = maxDist;
  for (const e of enemies) {
    if (exclude && exclude.has(e)) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function damageEnemy(e, dmg) {
  e.hp -= dmg;
  e.flash = 0.08;
}

function fireMissiles(dt) {
  const lv = player.weapons.missile;
  if (lv <= 0) return;
  const w = WEAPONS.missile.levels[lv - 1];
  player.timers.missile -= dt;
  if (player.timers.missile > 0) return;
  const target = nearestEnemy(player.x, player.y, 640);
  if (!target) return;
  player.timers.missile = w.interval;
  for (let i = 0; i < w.count && projectiles.length < CONFIG.maxProjectiles; i++) {
    const ang = Math.atan2(target.y - player.y, target.x - player.x) + (i - (w.count - 1) / 2) * 0.22;
    projectiles.push({
      x: player.x, y: player.y, vx: Math.cos(ang) * 340, vy: Math.sin(ang) * 340,
      dmg: w.dmg * powerMul(), life: 2.2, turn: 5.2, // turn＝追蹤轉向速度
    });
  }
}

function fireLightning(dt) {
  const lv = player.weapons.lightning;
  if (lv <= 0) return;
  const w = WEAPONS.lightning.levels[lv - 1];
  player.timers.lightning -= dt;
  if (player.timers.lightning > 0) return;
  let cur = nearestEnemy(player.x, player.y, 330);
  if (!cur) return;
  player.timers.lightning = w.interval;
  const hit = new Set();
  let fromX = player.x, fromY = player.y;
  for (let i = 0; i < w.chains && cur; i++) {
    bolts.push({ x1: fromX, y1: fromY, x2: cur.x, y2: cur.y, life: 0.14 });
    damageEnemy(cur, w.dmg * powerMul());
    hit.add(cur);
    fromX = cur.x; fromY = cur.y;
    cur = nearestEnemy(cur.x, cur.y, 170, hit); // 跳傳到附近還沒被電過的敵人
  }
}

function updateWeapons(dt) {
  fireMissiles(dt);
  fireLightning(dt);

  // 環繞飛刀：持續旋轉，接觸敵人造成傷害（每隻怪有短冷卻，避免一幀多段）
  const blv = player.weapons.blades;
  if (blv > 0) {
    const w = WEAPONS.blades.levels[blv - 1];
    player.bladeAngle += w.rotSpeed * dt;
    for (let i = 0; i < w.count; i++) {
      const a = player.bladeAngle + (Math.PI * 2 * i) / w.count;
      const bx = player.x + Math.cos(a) * w.radius;
      const by = player.y + Math.sin(a) * w.radius;
      for (const e of enemies) {
        if (e.bladeCd > 0) continue;
        if (Math.hypot(e.x - bx, e.y - by) < e.radius + 11) {
          damageEnemy(e, w.dmg * powerMul());
          e.bladeCd = 0.32;
        }
      }
    }
  }

  // 火焰光環：範圍內敵人持續受傷
  const alv = player.weapons.aura;
  if (alv > 0) {
    const w = WEAPONS.aura.levels[alv - 1];
    for (const e of enemies) {
      if (Math.hypot(e.x - player.x, e.y - player.y) < w.radius + e.radius) {
        damageEnemy(e, w.dps * powerMul() * dt);
      }
    }
  }
}

// ---------- 更新 ----------
function update(dt) {
  elapsed += dt;

  // 玩家移動
  const mv = moveInput();
  const spd = CONFIG.playerBaseSpeed * speedMul();
  player.x += mv.x * spd * dt;
  player.y += mv.y * spd * dt;
  if (mv.x !== 0) player.face = mv.x > 0 ? 1 : -1;

  // 回血被動
  const regen = player.passives.regen * PASSIVES.regen.perLevel;
  if (regen > 0) player.hp = Math.min(player.maxHp, player.hp + regen * dt);
  if (player.invuln > 0) player.invuln -= dt;

  // 生成敵人：間隔隨時間縮短
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnEnemy(pickEnemyType());
    const interval = Math.max(CONFIG.spawnIntervalMin, CONFIG.spawnIntervalStart - elapsed * CONFIG.spawnRampPerSecond);
    spawnTimer = interval;
  }

  // 菁英／Boss：奇數次菁英、偶數次 Boss
  bossTimer -= dt;
  if (bossTimer <= 0) {
    bossCount += 1;
    spawnEnemy(bossCount % 2 === 1 ? "elite" : "boss");
    bossTimer = CONFIG.bossInterval;
  }

  updateWeapons(dt);

  // 子彈：追蹤最近敵人
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    if (p.life <= 0) { projectiles.splice(i, 1); continue; }
    const t = nearestEnemy(p.x, p.y, 520);
    if (t) {
      const want = Math.atan2(t.y - p.y, t.x - p.x);
      const cur = Math.atan2(p.vy, p.vx);
      let diff = want - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const na = cur + Math.max(-p.turn * dt, Math.min(p.turn * dt, diff));
      const sp = Math.hypot(p.vx, p.vy);
      p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    for (const e of enemies) {
      if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 6) {
        damageEnemy(e, p.dmg);
        projectiles.splice(i, 1);
        break;
      }
    }
  }

  // 敵人：朝玩家移動、碰到玩家造成傷害、死亡掉寶石
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.flash > 0) e.flash -= dt;
    if (e.bladeCd > 0) e.bladeCd -= dt;
    if (e.hp <= 0) {
      kills += 1;
      if (gems.length < CONFIG.maxGems) gems.push({ x: e.x, y: e.y, xp: e.xp, vx: 0, vy: 0 });
      else { // 寶石滿了就把經驗併到最近的寶石上，不浪費
        const g = gems[gems.length - 1];
        if (g) g.xp += e.xp;
      }
      if (effects.length < 80) effects.push({ x: e.x, y: e.y, r: e.radius, life: 0.25, max: 0.25 });
      enemies.splice(i, 1);
      continue;
    }
    const d = Math.hypot(player.x - e.x, player.y - e.y) || 1;
    e.x += ((player.x - e.x) / d) * e.speed * dt;
    e.y += ((player.y - e.y) / d) * e.speed * dt;
    if (d < e.radius + CONFIG.playerRadius && player.invuln <= 0) {
      player.hp -= e.dmg;
      player.invuln = CONFIG.contactInvuln;
      if (player.hp <= 0) { player.hp = 0; gameOver(); return; }
    }
  }
  // 敵人之間簡單推擠，避免全部疊在一起（只推近距離的，省效能）
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const rr = a.radius + b.radius;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0.01 && d2 < rr * rr) {
        const d = Math.sqrt(d2), push = (rr - d) / 2;
        const nx = dx / d, ny = dy / d;
        a.x -= nx * push; a.y -= ny * push;
        b.x += nx * push; b.y += ny * push;
      }
    }
  }

  // 經驗寶石：進拾取範圍就磁吸飛向玩家
  const mag = magnetRadius();
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    const d = Math.hypot(player.x - g.x, player.y - g.y);
    if (d < mag) {
      const sp = 460;
      g.x += ((player.x - g.x) / (d || 1)) * sp * dt;
      g.y += ((player.y - g.y) / (d || 1)) * sp * dt;
    }
    if (d < CONFIG.playerRadius + 10) {
      gainXp(g.xp);
      gems.splice(i, 1);
      if (state !== "playing") return; // 升級畫面已開啟，暫停後續更新
    }
  }

  // 特效計時
  for (let i = effects.length - 1; i >= 0; i--) { effects[i].life -= dt; if (effects[i].life <= 0) effects.splice(i, 1); }
  for (let i = bolts.length - 1; i >= 0; i--) { bolts[i].life -= dt; if (bolts[i].life <= 0) bolts.splice(i, 1); }

  updateHud();
}

function gainXp(amount) {
  player.xp += amount;
  if (player.xp >= player.xpNeed) {
    player.xp -= player.xpNeed;
    player.level += 1;
    player.xpNeed = xpNeedFor(player.level);
    openLevelUp();
  }
}

// ---------- 升級三選一 ----------
function buildChoices() {
  const pool = [];
  for (const key of Object.keys(WEAPONS)) {
    const lv = player.weapons[key];
    if (lv < WEAPON_MAX) {
      pool.push({
        kind: "weapon", key,
        icon: WEAPONS[key].icon,
        name: WEAPONS[key].name + (lv === 0 ? "（新武器！）" : " Lv" + lv + " → Lv" + (lv + 1)),
        desc: WEAPONS[key].desc,
      });
    }
  }
  for (const key of Object.keys(PASSIVES)) {
    const lv = player.passives[key];
    if (lv < PASSIVE_MAX) {
      pool.push({
        kind: "passive", key,
        icon: PASSIVES[key].icon,
        name: PASSIVES[key].name + " Lv" + lv + " → Lv" + (lv + 1),
        desc: PASSIVES[key].desc,
      });
    }
  }
  // 洗牌後取 3 個
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
  }
  const choices = pool.slice(0, 3);
  // 全部滿級時的保底選項
  while (choices.length < 3) {
    choices.push(choices.length % 2 === 0
      ? { kind: "heal", icon: "🍖", name: "大補血", desc: "回復 40% 血量" }
      : { kind: "maxhp", icon: "❤️", name: "生命上限 +20", desc: "最大血量 +20 並回復 20" });
    if (choices.length >= 3) break;
  }
  return choices;
}

function openLevelUp() {
  state = "levelup";
  choiceRow.innerHTML = "";
  for (const c of buildChoices()) {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    const icon = document.createElement("span"); icon.className = "choice-icon"; icon.textContent = c.icon;
    const name = document.createElement("span"); name.className = "choice-name"; name.textContent = c.name;
    const desc = document.createElement("span"); desc.className = "choice-desc"; desc.textContent = c.desc;
    btn.append(icon, name, desc);
    btn.addEventListener("click", () => applyChoice(c));
    choiceRow.appendChild(btn);
  }
  levelupScreen.classList.remove("hidden");
}

function applyChoice(c) {
  if (c.kind === "weapon") player.weapons[c.key] += 1;
  else if (c.kind === "passive") player.passives[c.key] += 1;
  else if (c.kind === "heal") player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.4);
  else if (c.kind === "maxhp") { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); }
  levelupScreen.classList.add("hidden");
  state = "playing";
  lastTime = performance.now();
  updateHud();
}

// ---------- HUD ----------
function updateHud() {
  hpFill.style.width = Math.max(0, (player.hp / player.maxHp) * 100) + "%";
  hpText.textContent = "血量 " + Math.ceil(player.hp) + " / " + player.maxHp;
  xpFill.style.width = Math.min(100, (player.xp / player.xpNeed) * 100) + "%";
  levelText.textContent = player.level;
  timeText.textContent = fmtTime(elapsed);
  killText.textContent = kills;
}

// ---------- 繪圖 ----------
function draw() {
  const camX = player.x - viewW / 2, camY = player.y - viewH / 2;
  // 海面底色
  ctx.fillStyle = "#07304a";
  ctx.fillRect(0, 0, viewW, viewH);
  // 格線（跟著世界捲動）
  const grid = 64;
  ctx.strokeStyle = "rgba(140, 210, 255, 0.13)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -((camX % grid) + grid) % grid; x < viewW; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, viewH); }
  for (let y = -((camY % grid) + grid) % grid; y < viewH; y += grid) { ctx.moveTo(0, y); ctx.lineTo(viewW, y); }
  ctx.stroke();
  // 波紋裝飾（用世界座標固定的小弧線，位置由格子雜湊決定，不亂跳）
  ctx.strokeStyle = "rgba(160, 225, 255, 0.18)";
  const cell = 180;
  const x0 = Math.floor(camX / cell), x1 = Math.floor((camX + viewW) / cell);
  const y0 = Math.floor(camY / cell), y1 = Math.floor((camY + viewH) / cell);
  for (let cx = x0; cx <= x1; cx++) {
    for (let cy = y0; cy <= y1; cy++) {
      const h = Math.abs(Math.sin(cx * 127.1 + cy * 311.7) * 43758.5453) % 1;
      const wx = cx * cell + h * 90 + 30 - camX;
      const wy = cy * cell + ((h * 7) % 1) * 90 + 30 - camY;
      ctx.beginPath();
      ctx.arc(wx, wy, 13, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }

  const sx = (wx) => wx - camX, sy = (wy) => wy - camY;

  // 經驗寶石
  for (const g of gems) {
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("💎", sx(g.x), sy(g.y));
  }

  // 火焰光環範圍
  const alv = player.weapons.aura;
  if (alv > 0) {
    const w = WEAPONS.aura.levels[alv - 1];
    const flicker = w.radius + Math.sin(elapsed * 9) * 4;
    ctx.beginPath();
    ctx.arc(sx(player.x), sy(player.y), flicker, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 110, 40, 0.16)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 150, 50, 0.55)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 敵人
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const e of enemies) {
    const ex = sx(e.x), ey = sy(e.y);
    if (ex < -70 || ey < -70 || ex > viewW + 70 || ey > viewH + 70) continue;
    ctx.font = (e.radius * 2) + "px sans-serif";
    if (e.flash > 0) { ctx.globalAlpha = 0.45; }
    ctx.fillText(e.emoji, ex, ey);
    ctx.globalAlpha = 1;
    // 血條（菁英／Boss 與受傷的怪才顯示）
    if (e.hp < e.maxHp) {
      const bw = e.radius * 2;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(ex - bw / 2, ey - e.radius - 12, bw, 5);
      ctx.fillStyle = (e.type === "elite" || e.type === "boss") ? "#c084fc" : "#ff5a6e";
      ctx.fillRect(ex - bw / 2, ey - e.radius - 12, bw * Math.max(0, e.hp / e.maxHp), 5);
    }
    if (e.type === "elite" || e.type === "boss") {
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#e9d5ff";
      ctx.fillText(e.type === "boss" ? "BOSS" : "菁英", ex, ey - e.radius - 20);
    }
  }

  // 環繞飛刀
  const blv = player.weapons.blades;
  if (blv > 0) {
    const w = WEAPONS.blades.levels[blv - 1];
    ctx.font = "20px sans-serif";
    for (let i = 0; i < w.count; i++) {
      const a = player.bladeAngle + (Math.PI * 2 * i) / w.count;
      ctx.fillText("🗡️", sx(player.x + Math.cos(a) * w.radius), sy(player.y + Math.sin(a) * w.radius));
    }
  }

  // 子彈（魔法飛彈）
  ctx.font = "15px sans-serif";
  for (const p of projectiles) ctx.fillText("🔮", sx(p.x), sy(p.y));

  // 連鎖閃電線條
  ctx.strokeStyle = "rgba(160, 220, 255, 0.9)";
  ctx.lineWidth = 2.5;
  for (const b of bolts) {
    ctx.beginPath();
    const mx = (sx(b.x1) + sx(b.x2)) / 2 + (Math.random() - 0.5) * 18;
    const my = (sy(b.y1) + sy(b.y2)) / 2 + (Math.random() - 0.5) * 18;
    ctx.moveTo(sx(b.x1), sy(b.y1));
    ctx.lineTo(mx, my);
    ctx.lineTo(sx(b.x2), sy(b.y2));
    ctx.stroke();
  }

  // 死亡特效（擴散的圈）
  for (const ef of effects) {
    ctx.beginPath();
    ctx.arc(sx(ef.x), sy(ef.y), ef.r * (1.6 - ef.life / ef.max), 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255," + (ef.life / ef.max * 0.7) + ")";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 玩家（被擊中無敵時閃爍）
  if (!(player.invuln > 0 && Math.floor(elapsed * 14) % 2 === 0)) {
    ctx.font = "34px sans-serif";
    ctx.fillText("🧜", sx(player.x), sy(player.y));
  }
  // 玩家血量小圈（拾取範圍太淡，平常不畫，避免畫面太亂）
}

// ---------- 主迴圈 ----------
function loop(now) {
  rafId = requestAnimationFrame(loop);
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0); // dt 上限，避免切換分頁後暴衝
  lastTime = now;
  if (state === "playing") update(dt);
  if (state === "playing" || state === "levelup" || state === "over") draw();
}

// ---------- 開始／結束 ----------
function startGame() {
  resetState();
  startScreen.classList.add("hidden");
  overScreen.classList.add("hidden");
  levelupScreen.classList.add("hidden");
  joy.active = false; joy.dx = 0; joy.dy = 0;
  joystickEl.classList.add("hidden");
  state = "playing";
  lastTime = performance.now();
  updateHud();
}

function gameOver() {
  state = "over";
  const best = saveBest();
  overStats.textContent = "存活時間 " + fmtTime(elapsed) + "｜擊殺 " + kills + "｜等級 " + player.level;
  bestOnOver.textContent = bestText(best);
  overScreen.classList.remove("hidden");
}

// ---------- 啟動 ----------
resetState();
resize();
bestOnStart.textContent = bestText(loadBest());
updateHud();
requestAnimationFrame((now) => { lastTime = now; rafId = requestAnimationFrame(loop); });
