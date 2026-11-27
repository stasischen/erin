"use strict";
/* ============================================================
   塔防小遊戲（純 vanilla JS，可離線玩）
   ============================================================
   ★ 可以自己改的地方（改完存檔、重新整理就生效）：
   - 下方「設定區」的數字都可以改：塔的價格／傷害／射程／射速、
     敵人血量與血量成長、起始金幣、命的數量、賣出返還比例等。
   ============================================================ */

// ===== 設定區：可以自己改的地方 =====

// 地圖：一格 48px，12 欄 × 8 列
const TILE = 48;
const COLS = 12;
const ROWS = 8;

// 起始資源：可以自己改（起始金幣、命的數量）
const START_GOLD = 220;
const START_LIVES = 20;

// 賣出返還比例：可以自己改（0.7 = 返還已投入金幣的 70%）
const SELL_RATIO = 0.7;

// 每波完成獎勵：可以自己改（固定獎勵 + 每波多給的量）
const WAVE_CLEAR_BONUS_BASE = 20;
const WAVE_CLEAR_BONUS_PER_WAVE = 2;

// 敵人走到終點扣的命：可以自己改（Boss 扣比較多條）
const BOSS_LIVES_COST = 3;

// 冰塔緩速：可以自己改（0.45 = 緩速 45%，持續 1.5 秒）
const ICE_SLOW_RATIO = 0.45;
const ICE_SLOW_SECONDS = 1.5;

// 敵人血量隨波數成長：可以自己改（每波血量 ×(1 + (波數-1) × 這個數字)）
const ENEMY_HP_GROWTH = 0.22;

// 四種塔的數值：可以自己改（cost 價格、damage 傷害、range 射程（格）、fireRate 每秒發射次數、aoe 範圍傷害半徑（格，0 = 只打一隻））
const TOWER_TYPES = {
  arrow:  { name: "箭塔",   icon: "箭", color: "#f2b134", cost: 50,  damage: 12, range: 2.6, fireRate: 2.5, aoe: 0,   desc: "便宜、射速快" },
  cannon: { name: "炮塔",   icon: "炮", color: "#e4572e", cost: 100, damage: 30, range: 2.4, fireRate: 0.7, aoe: 1.1, desc: "慢、範圍傷害" },
  ice:    { name: "冰塔",   icon: "冰", color: "#4db8e8", cost: 70,  damage: 5,  range: 2.3, fireRate: 1.5, aoe: 0,   desc: "緩速 45%" },
  sniper: { name: "狙擊塔", icon: "狙", color: "#7d5ba6", cost: 150, damage: 95, range: 4.5, fireRate: 0.5, aoe: 0,   desc: "射程遠、單發高傷" },
};

// 升級：可以自己改（最高等級、每級升級費 = 塔價 × 倍率、每級傷害倍率、每級射程多幾格）
const MAX_LEVEL = 3;
const UPGRADE_COST_RATIOS = [0, 0.8, 1.3]; // index = 目標等級-1 的費用倍率（Lv2 用 0.8、Lv3 用 1.3）
const UPGRADE_DAMAGE_MULT = 1.6;           // 每升一級，傷害 ×1.6
const UPGRADE_RANGE_ADD = 0.25;            // 每升一級，射程 +0.25 格

// 敵人種類：可以自己改（hp 基礎血量、speed 每秒走幾格、reward 擊殺金幣、armor 裝甲減傷比例）
const ENEMY_TYPES = {
  normal: { name: "普通", color: "#e84a5f", radius: 14, hp: 30,  speed: 1.0, reward: 8,  armor: 0 },
  fast:   { name: "快速", color: "#ff9f1c", radius: 11, hp: 18,  speed: 1.9, reward: 10, armor: 0 },
  armored:{ name: "裝甲", color: "#6c757d", radius: 15, hp: 70,  speed: 0.7, reward: 14, armor: 0.5 },
  boss:   { name: "Boss", color: "#8e24aa", radius: 22, hp: 900, speed: 0.55, reward: 150, armor: 0.2 },
};

// 每波敵人數量：可以自己改（基礎數量 + 每波多幾隻）
const WAVE_BASE_COUNT = 8;
const WAVE_COUNT_PER_WAVE = 2;

// 最佳波次的 localStorage key（不要改，改了舊紀錄會讀不到）
const BEST_KEY = "erin-tower-defense-best";
// 成績紀錄的 localStorage key（erin 版無後端，成績只存本機，欄位比照原版 scores 表）
const RECORDS_KEY = "erin-tower-defense-records";
const RECENT_LIMIT = 8;

// ===== 路徑（S 形彎路）：可以自己改路徑點（單位是格子座標，x 向右、y 向下）=====
const WAYPOINTS = [
  { x: -1, y: 1 }, { x: 9, y: 1 }, { x: 9, y: 3 },
  { x: 2, y: 3 }, { x: 2, y: 6 }, { x: 12, y: 6 },
];

// ===== 以下為遊戲程式（不用改也能玩）=====

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const $ = (id) => document.getElementById(id);
const els = {
  wave: $("wave"), lives: $("lives"), gold: $("gold"), best: $("best"),
  enemyCount: $("enemyCount"), overlay: $("overlay"), overlayTitle: $("overlayTitle"),
  overlayText: $("overlayText"), overlayBest: $("overlayBest"), overlayBtn: $("overlayBtn"),
  panelText: $("panelText"), buildButtons: $("buildButtons"), towerButtons: $("towerButtons"),
  bestWave: $("bestWave"), bestKills: $("bestKills"), playCount: $("playCount"), recentList: $("recentList"),
  upgradeBtn: $("upgradeBtn"), sellBtn: $("sellBtn"), closePanelBtn: $("closePanelBtn"),
  nextWaveBtn: $("nextWaveBtn"), pauseBtn: $("pauseBtn"), speedBtn: $("speedBtn"), restartBtn: $("restartBtn"),
};

// 路徑經過的格子（不能蓋塔）
const pathCells = new Set();
(function buildPathCells() {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    let { x, y } = WAYPOINTS[i];
    const end = WAYPOINTS[i + 1];
    const dx = Math.sign(end.x - x), dy = Math.sign(end.y - y);
    while (x !== end.x || y !== end.y) {
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) pathCells.add(x + "," + y);
      x += dx; y += dy;
    }
    if (end.x >= 0 && end.x < COLS && end.y >= 0 && end.y < ROWS) pathCells.add(end.x + "," + end.y);
  }
})();

const pathPoints = WAYPOINTS.map((p) => ({ x: (p.x + 0.5) * TILE, y: (p.y + 0.5) * TILE }));
// 路徑每段長度與總長（用來算敵人位置）
const segLens = [];
let pathTotal = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
  const len = Math.hypot(pathPoints[i + 1].x - pathPoints[i].x, pathPoints[i + 1].y - pathPoints[i].y);
  segLens.push(len); pathTotal += len;
}
function posAtDistance(d) {
  let rest = d;
  for (let i = 0; i < segLens.length; i++) {
    if (rest <= segLens[i]) {
      const t = segLens[i] === 0 ? 0 : rest / segLens[i];
      return {
        x: pathPoints[i].x + (pathPoints[i + 1].x - pathPoints[i].x) * t,
        y: pathPoints[i].y + (pathPoints[i + 1].y - pathPoints[i].y) * t,
      };
    }
    rest -= segLens[i];
  }
  const last = pathPoints[pathPoints.length - 1];
  return { x: last.x, y: last.y };
}

let best = 0;
try { best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0; } catch (e) { best = 0; }
function saveBest() {
  if (state.wave > best) {
    best = state.wave;
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* 離線/隱私模式時忽略 */ }
  }
}

// 成績紀錄（比照原版 getBest：最佳波次／擊殺、遊玩場次、最近 8 筆；資料存 localStorage）
let records = { plays: 0, bestKills: 0, recent: [] };
try {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.recent)) {
      records.plays = parseInt(parsed.plays, 10) || parsed.recent.length;
      records.bestKills = Number.isSafeInteger(parsed.bestKills) && parsed.bestKills >= 0 ? parsed.bestKills : 0;
      records.recent = parsed.recent.slice(0, RECENT_LIMIT);
    }
  }
} catch (e) { records = { plays: 0, bestKills: 0, recent: [] }; }
// Older saves lack bestKills; recover the best value still present in recent history.
for (const r of records.recent) {
  if (r.wave > best) best = r.wave;
  if (Number.isSafeInteger(r.kills) && r.kills > records.bestKills) records.bestKills = r.kills;
}
function persistRecords() {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); } catch (e) { /* 離線/隱私模式時忽略 */ }
}
function renderRecords() {
  if (els.bestWave) els.bestWave.textContent = best;
  if (els.bestKills) els.bestKills.textContent = records.bestKills;
  if (els.playCount) els.playCount.textContent = records.plays;
  if (!els.recentList) return;
  els.recentList.innerHTML = "";
  if (records.recent.length === 0) {
    const li = document.createElement("li");
    li.textContent = "還沒有戰績，先玩一場吧！";
    els.recentList.appendChild(li);
    return;
  }
  for (const r of records.recent) {
    const li = document.createElement("li");
    const when = r.created_at ? new Date(r.created_at) : null;
    const dateText = when && !isNaN(when.getTime()) ? when.toLocaleString("zh-Hant") + "：" : "";
    li.textContent = dateText + "第 " + r.wave + " 波，擊殺 " + r.kills + "，漏怪 " + r.leaks + "，賺 " + r.gold_earned + " 金幣，蓋塔 " + r.towers_built + " 座";
    els.recentList.appendChild(li);
  }
}
function saveScoreRecord() {
  const entry = {
    wave: state.wave,
    kills: state.stats.kills,
    leaks: state.stats.leaks,
    gold_earned: state.stats.goldEarned,
    towers_built: state.stats.towersBuilt,
    created_at: new Date().toISOString(),
  };
  records.plays += 1;
  records.recent.unshift(entry);
  records.recent = records.recent.slice(0, RECENT_LIMIT);
  if (entry.kills > records.bestKills) records.bestKills = entry.kills;
  saveBest();
  persistRecords();
  renderRecords();
}

const state = {
  running: false, over: false, paused: false, speed: 1,
  gold: START_GOLD, lives: START_LIVES, wave: 0,
  towers: [], enemies: [], projectiles: [],
  spawnQueue: [], spawnTimer: 0, waveActive: false,
  selected: null, // {col,row} 或 {tower}
  stats: { kills: 0, leaks: 0, goldEarned: 0, towersBuilt: 0 }, // 本場戰績（存檔時寫入紀錄）
};

function towerStats(tower) {
  const base = TOWER_TYPES[tower.type];
  return {
    damage: base.damage * Math.pow(UPGRADE_DAMAGE_MULT, tower.level - 1),
    range: (base.range + UPGRADE_RANGE_ADD * (tower.level - 1)) * TILE,
    fireRate: base.fireRate,
    aoe: base.aoe * TILE,
  };
}
function upgradeCost(tower) {
  if (tower.level >= MAX_LEVEL) return null;
  return Math.round(TOWER_TYPES[tower.type].cost * UPGRADE_COST_RATIOS[tower.level]);
}

// ===== 波次產生 =====
function buildWave(wave) {
  const queue = [];
  if (wave % 10 === 0) {
    // 每 10 波一隻 Boss，前面配一些普通敵人
    const n = 6 + wave / 2;
    for (let i = 0; i < n; i++) queue.push(i % 4 === 3 ? "armored" : "normal");
    queue.push("boss");
    return queue;
  }
  const count = WAVE_BASE_COUNT + (wave - 1) * WAVE_COUNT_PER_WAVE;
  for (let i = 0; i < count; i++) {
    if (wave >= 3 && i % 5 === 4) queue.push("fast");
    else if (wave >= 5 && i % 7 === 6) queue.push("armored");
    else queue.push("normal");
  }
  return queue;
}

function spawnEnemy(typeKey) {
  const base = ENEMY_TYPES[typeKey];
  const hp = base.hp * (1 + (state.wave - 1) * ENEMY_HP_GROWTH);
  state.enemies.push({
    type: typeKey, hp, maxHp: hp, dist: 0,
    speed: base.speed * TILE, reward: base.reward, armor: base.armor,
    radius: base.radius, slowUntil: 0, slowFactor: 1, x: 0, y: 0,
  });
}

function startNextWave() {
  if (!state.running || state.over || state.waveActive) return;
  state.wave += 1;
  state.spawnQueue = buildWave(state.wave);
  state.spawnTimer = 0;
  state.waveActive = true;
  saveBest();
  updateHud(); updatePanel();
}

// ===== 戰鬥 =====
function damageEnemy(enemy, rawDamage, now) {
  const real = rawDamage * (1 - enemy.armor);
  enemy.hp -= real;
  if (enemy.type === "boss") { /* Boss 也照常扣血 */ }
  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    state.gold += enemy.reward;
    state.stats.kills += 1;
    state.stats.goldEarned += enemy.reward;
  }
  void now;
}

function update(dt, now) {
  // 生成敵人
  if (state.spawnQueue.length > 0) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnEnemy(state.spawnQueue.shift());
      state.spawnTimer = 0.8;
    }
  }
  // 敵人移動
  for (const e of state.enemies) {
    const slowed = now < e.slowUntil;
    const speed = e.speed * (slowed ? (1 - ICE_SLOW_RATIO) : 1);
    e.dist += speed * dt;
    const p = posAtDistance(e.dist);
    e.x = p.x; e.y = p.y;
    if (e.dist >= pathTotal && !e.dead) {
      e.dead = true; e.leaked = true;
      state.stats.leaks += 1;
      state.lives -= (e.type === "boss" ? BOSS_LIVES_COST : 1);
      if (state.lives <= 0) { state.lives = 0; gameOver(); }
    }
  }
  state.enemies = state.enemies.filter((e) => !e.dead);

  // 塔開火（瞄準走最遠的敵人）
  for (const t of state.towers) {
    t.cooldown -= dt;
    const stats = towerStats(t);
    const cx = (t.col + 0.5) * TILE, cy = (t.row + 0.5) * TILE;
    let target = null;
    for (const e of state.enemies) {
      if (Math.hypot(e.x - cx, e.y - cy) <= stats.range && (!target || e.dist > target.dist)) target = e;
    }
    t.target = target;
    if (target && t.cooldown <= 0) {
      t.cooldown = 1 / stats.fireRate;
      state.projectiles.push({
        x: cx, y: cy - 10, target, speed: 420,
        damage: stats.damage, aoe: stats.aoe, type: t.type, color: TOWER_TYPES[t.type].color,
      });
    }
  }
  // 子彈飛行（追蹤目標）
  for (const p of state.projectiles) {
    if (!p.target || p.target.dead) { p.done = true; continue; }
    const dx = p.target.x - p.x, dy = p.target.y - p.y;
    const d = Math.hypot(dx, dy);
    const step = p.speed * dt;
    if (d <= step + p.target.radius * 0.4) {
      p.done = true;
      if (p.aoe > 0) {
        for (const e of state.enemies) {
          if (Math.hypot(e.x - p.target.x, e.y - p.target.y) <= p.aoe + e.radius) damageEnemy(e, p.damage, now);
        }
      } else {
        damageEnemy(p.target, p.damage, now);
        if (p.type === "ice" && !p.target.dead) {
          p.target.slowUntil = now + ICE_SLOW_SECONDS * 1000;
        }
      }
    } else {
      p.x += (dx / d) * step; p.y += (dy / d) * step;
    }
  }
  state.projectiles = state.projectiles.filter((p) => !p.done);
  state.enemies = state.enemies.filter((e) => !e.dead);

  // 波次結束檢查
  if (state.waveActive && state.spawnQueue.length === 0 && state.enemies.length === 0 && !state.over) {
    state.waveActive = false;
    const bonus = WAVE_CLEAR_BONUS_BASE + state.wave * WAVE_CLEAR_BONUS_PER_WAVE;
    state.gold += bonus;
    state.stats.goldEarned += bonus;
    els.panelText.textContent = "第 " + state.wave + " 波守住了！獎勵 " + bonus + " 金幣。按「開始下一波」繼續。";
  }
  updateHud();
}

// ===== 繪圖 =====
function draw(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 草地格子
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (c + r) % 2 === 0 ? "#82d95e" : "#76cc52";
      ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
  // 路徑
  ctx.strokeStyle = "#e0c084";
  ctx.lineWidth = TILE * 0.82;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(120,85,40,0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
  // 終點旗子
  const endP = posAtDistance(pathTotal - TILE * 0.4);
  ctx.fillStyle = "#22304a";
  ctx.fillRect(endP.x - 1, endP.y - 16, 3, 20);
  ctx.fillStyle = "#e84a5f";
  ctx.beginPath(); ctx.moveTo(endP.x + 2, endP.y - 16); ctx.lineTo(endP.x + 16, endP.y - 11); ctx.lineTo(endP.x + 2, endP.y - 6); ctx.closePath(); ctx.fill();

  // 選取格高亮
  if (state.selected && typeof state.selected.col === "number") {
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.strokeRect(state.selected.col * TILE + 2, state.selected.row * TILE + 2, TILE - 4, TILE - 4);
  }
  // 選中塔的射程圈
  if (state.selected && state.selected.tower) {
    const t = state.selected.tower;
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath(); ctx.arc((t.col + 0.5) * TILE, (t.row + 0.5) * TILE, towerStats(t).range, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
    ctx.strokeRect(t.col * TILE + 2, t.row * TILE + 2, TILE - 4, TILE - 4);
  }

  // 塔
  for (const t of state.towers) {
    const cx = (t.col + 0.5) * TILE, cy = (t.row + 0.5) * TILE;
    const base = TOWER_TYPES[t.type];
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(cx - 17, cy - 6, 34, 22);
    ctx.fillStyle = base.color;
    ctx.beginPath(); ctx.arc(cx, cy - 8, 15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#22304a"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#22304a";
    ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(base.icon, cx, cy - 8);
    ctx.fillStyle = "#fff7d8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Lv" + t.level, cx, cy + 10);
  }

  // 敵人
  for (const e of state.enemies) {
    const base = ENEMY_TYPES[e.type];
    const slowed = now < e.slowUntil;
    ctx.fillStyle = slowed ? "#7fd4ff" : base.color;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#22304a"; ctx.lineWidth = 2; ctx.stroke();
    if (e.type === "armored" || e.type === "boss") {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(e.type === "boss" ? "王" : "甲", e.x, e.y);
    }
    // 血條
    const w = e.radius * 2;
    ctx.fillStyle = "#22304a"; ctx.fillRect(e.x - e.radius, e.y - e.radius - 9, w, 5);
    ctx.fillStyle = "#5ee06e"; ctx.fillRect(e.x - e.radius + 1, e.y - e.radius - 8, (w - 2) * Math.max(0, e.hp / e.maxHp), 3);
  }

  // 子彈
  for (const p of state.projectiles) {
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.type === "cannon" ? 6 : 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#22304a"; ctx.lineWidth = 1; ctx.stroke();
  }

  if (state.paused && state.running && !state.over) {
    ctx.fillStyle = "rgba(20,32,54,0.45)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff7d8"; ctx.font = "bold 34px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("暫停中", canvas.width / 2, canvas.height / 2);
  }
}

// ===== UI =====
function updateHud() {
  els.wave.textContent = state.wave;
  els.lives.textContent = state.lives;
  els.gold.textContent = state.gold;
  els.best.textContent = best;
  if (els.bestWave) els.bestWave.textContent = best;
  if (els.bestKills) els.bestKills.textContent = records.bestKills;
  if (els.playCount) els.playCount.textContent = records.plays;
  els.enemyCount.textContent = state.enemies.length + state.spawnQueue.length;
  els.nextWaveBtn.disabled = !state.running || state.over || state.waveActive;
  els.nextWaveBtn.textContent = state.wave === 0 ? "開始第一波" : "開始下一波";
}

function clearSelection() { state.selected = null; updatePanel(); }

function updatePanel() {
  const sel = state.selected;
  els.buildButtons.innerHTML = "";
  els.towerButtons.classList.add("hidden");
  if (!sel) {
    els.panelText.textContent = "先點地圖上的一個空格，再選要蓋的塔。";
    return;
  }
  if (sel.tower) {
    const t = sel.tower;
    const base = TOWER_TYPES[t.type];
    const cost = upgradeCost(t);
    els.panelText.textContent = base.name + " Lv" + t.level + "（已投入 " + t.invested + " 金幣）";
    els.towerButtons.classList.remove("hidden");
    els.upgradeBtn.textContent = cost === null ? "已滿級 Lv" + MAX_LEVEL : "升級（" + cost + " 金幣）";
    els.upgradeBtn.disabled = cost === null || state.gold < cost;
    els.sellBtn.textContent = "賣出（+" + Math.floor(t.invested * SELL_RATIO) + " 金幣）";
    return;
  }
  // 空格：顯示四種塔的建造按鈕
  els.panelText.textContent = "選一座塔蓋在這一格（金幣：" + state.gold + "）：";
  for (const key of Object.keys(TOWER_TYPES)) {
    const def = TOWER_TYPES[key];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "build-btn";
    btn.innerHTML = "";
    const top = document.createElement("span"); top.textContent = def.name + " " + def.cost + " 金幣";
    const sub = document.createElement("small"); sub.textContent = def.desc;
    btn.appendChild(top); btn.appendChild(sub);
    btn.disabled = state.gold < def.cost;
    btn.addEventListener("click", () => buildTower(key));
    els.buildButtons.appendChild(btn);
  }
}

function buildTower(typeKey) {
  const sel = state.selected;
  if (!sel || typeof sel.col !== "number") return;
  const def = TOWER_TYPES[typeKey];
  if (state.gold < def.cost) return;
  state.gold -= def.cost;
  const tower = { type: typeKey, col: sel.col, row: sel.row, level: 1, invested: def.cost, cooldown: 0, target: null };
  state.towers.push(tower);
  state.stats.towersBuilt += 1;
  state.selected = { tower };
  updateHud(); updatePanel();
}

function findTower(col, row) { return state.towers.find((t) => t.col === col && t.row === row) || null; }

canvas.addEventListener("pointerdown", (ev) => {
  if (!state.running || state.over) return;
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
  const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
  const col = Math.floor(x / TILE), row = Math.floor(y / TILE);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
  const tower = findTower(col, row);
  if (tower) { state.selected = { tower }; updatePanel(); return; }
  if (pathCells.has(col + "," + row)) {
    els.panelText.textContent = "這格是敵人的路，不能蓋塔，換一格吧！";
    state.selected = null;
    els.buildButtons.innerHTML = ""; els.towerButtons.classList.add("hidden");
    return;
  }
  state.selected = { col, row };
  updatePanel();
});

els.upgradeBtn.addEventListener("click", () => {
  const sel = state.selected; if (!sel || !sel.tower) return;
  const cost = upgradeCost(sel.tower);
  if (cost === null || state.gold < cost) return;
  state.gold -= cost; sel.tower.invested += cost; sel.tower.level += 1;
  updateHud(); updatePanel();
});
els.sellBtn.addEventListener("click", () => {
  const sel = state.selected; if (!sel || !sel.tower) return;
  state.gold += Math.floor(sel.tower.invested * SELL_RATIO);
  state.towers = state.towers.filter((t) => t !== sel.tower);
  clearSelection(); updateHud();
});
els.closePanelBtn.addEventListener("click", clearSelection);
els.nextWaveBtn.addEventListener("click", startNextWave);
els.pauseBtn.addEventListener("click", () => {
  if (!state.running || state.over) return;
  state.paused = !state.paused;
  els.pauseBtn.textContent = state.paused ? "繼續" : "暫停";
});
els.speedBtn.addEventListener("click", () => {
  state.speed = state.speed >= 3 ? 1 : state.speed + 1;
  els.speedBtn.textContent = "速度 ×" + state.speed;
});
els.restartBtn.addEventListener("click", () => startGame());
els.overlayBtn.addEventListener("click", () => startGame());

function startGame() {
  state.running = true; state.over = false; state.paused = false; state.speed = 1;
  state.gold = START_GOLD; state.lives = START_LIVES; state.wave = 0;
  state.towers = []; state.enemies = []; state.projectiles = [];
  state.spawnQueue = []; state.waveActive = false; state.selected = null;
  state.stats = { kills: 0, leaks: 0, goldEarned: 0, towersBuilt: 0 };
  els.speedBtn.textContent = "速度 ×1";
  els.pauseBtn.textContent = "暫停";
  els.overlay.classList.add("hidden");
  els.panelText.textContent = "先點地圖上的一個空格蓋塔，再按「開始第一波」！";
  updateHud(); updatePanel();
}

function gameOver() {
  state.over = true; state.waveActive = false;
  saveScoreRecord();
  els.overlayTitle.textContent = "遊戲結束";
  els.overlayText.innerHTML = "";
  const line1 = document.createElement("span"); line1.textContent = "你守到了第 " + state.wave + " 波！";
  const br = document.createElement("br");
  const line2 = document.createElement("span"); line2.textContent = "最佳波次：" + best;
  els.overlayText.appendChild(line1); els.overlayText.appendChild(br); els.overlayText.appendChild(line2);
  els.overlayBtn.textContent = "再玩一次";
  els.overlay.classList.remove("hidden");
  updateHud();
}

// ===== 主迴圈 =====
let lastTime = 0;
function loop(timestamp) {
  const now = timestamp || 0;
  let dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
  lastTime = now;
  if (state.running && !state.paused && !state.over) {
    // 速度倍率：用小步進多次更新，避免子彈穿過敵人
    const steps = state.speed;
    for (let i = 0; i < steps; i++) update(dt, now);
  }
  draw(now);
  requestAnimationFrame(loop);
}

els.overlayBest.textContent = best;
renderRecords();
updateHud(); updatePanel();
requestAnimationFrame(loop);
