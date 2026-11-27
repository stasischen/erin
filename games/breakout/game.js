"use strict";
/* ============================================================
   打磚塊（霓虹橢圓磚版）— 純 vanilla JS，不連任何後端
   成績只存在 localStorage，key：erin-breakout-best（最佳成績）、
   erin-breakout-records（每場紀錄，欄位比照原版：score / level /
   bricks_broken / cleared / played_at）
   ============================================================ */

/* ===== 可以自己改的地方（設定區）===== */
const 設定 = {
  球速: 390,              // 小球基本速度（每秒像素）；越大越快、越難
  每關加速: 22,           // 每升一關，球速增加多少
  球拍寬度: 112,          // 球拍基本寬度
  球拍加寬寬度: 176,      // 吃到「寬」道具後的球拍寬度
  球拍高度: 14,
  球半徑: 8,
  起始命數: 3,            // 一開始有幾條命
  最高命數: 6,            // 命最多累積到幾條
  道具掉落率: 0.22,       // 打破磚塊時掉道具的機率（0~1）
  額外命權重: 5,          // 「命」道具的稀有度權重（越小越稀有；其他道具約 20~30）
  加寬秒數: 12,           // 「寬」道具持續秒數
  慢速秒數: 10,           // 「慢」道具持續秒數
  慢速倍率: 0.62,         // 「慢」生效時球速乘上這個倍率（越小越慢）
  雷射秒數: 12,           // 「雷」道具持續秒數
  雷射冷卻秒數: 0.22,     // 兩發雷射之間的間隔秒數
  最多同時球數: 4,        // 「球」道具分裂後，同時最多幾顆球
  每磚基本分: 10,         // 每打破一塊磚：基本分 × 目前連擊數
  總關卡數: 5,            // 總共幾關
};
/* ===== 設定區結束 ===== */

const 畫布寬 = 800;
const 畫布高 = 600;
const 球拍Y = 畫布高 - 42;
const 磚塊區上 = 64;
const 磚塊區高 = 212;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const el = {
  score: document.getElementById("score"),
  best: document.getElementById("best"),
  lives: document.getElementById("lives"),
  level: document.getElementById("level"),
  combo: document.getElementById("combo"),
  bricksLeft: document.getElementById("bricksLeft"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  overlayBest: document.getElementById("overlayBest"),
  recordBest: document.getElementById("recordBest"),
  recordGames: document.getElementById("recordGames"),
  recentList: document.getElementById("recentList"),
};

/* ---------- 關卡設計：每關列數／欄數／兩擊磚比例不同 ---------- */
/* 可以自己改的地方：想改每關磚塊排列，改這張表和下面的 圖案() 即可 */
const 關卡表 = [
  { 列: 4, 欄: 8,  兩擊比例: 0.0,  圖案: "滿版" },
  { 列: 5, 欄: 9,  兩擊比例: 0.15, 圖案: "棋盤" },
  { 列: 5, 欄: 10, 兩擊比例: 0.25, 圖案: "菱形" },
  { 列: 6, 欄: 10, 兩擊比例: 0.35, 圖案: "直條" },
  { 列: 7, 欄: 11, 兩擊比例: 0.45, 圖案: "滿版" },
];

function 圖案有磚(圖案, r, c, rows, cols) {
  if (圖案 === "棋盤") return (r + c) % 5 !== 4;               // 每 5 格空 1 格
  if (圖案 === "菱形") {
    const mid = (cols - 1) / 2;
    return Math.abs(c - mid) + Math.abs(r - (rows - 1) / 2) <= mid + 0.5 || r === 0 || r === rows - 1;
  }
  if (圖案 === "直條") return c % 3 !== 2 || r === 0;           // 每 3 欄空 1 欄（第一列除外）
  return true; // 滿版
}

/* 一擊磚用亮色、兩擊磚用較深飽和的顏色（被打第一下後會變淡並出現裂痕） */
const 一擊色 = ["#ff2d95", "#22e6ff", "#ffe93d", "#7cff4f", "#ff8a3d", "#b26bff"];
const 兩擊色 = ["#c4006b", "#0077b6", "#b8860b", "#1d9e4b", "#c1440e", "#6a2bd8"];

/* ---------- 遊戲狀態 ---------- */
let state = "menu"; // menu | ready | playing | levelclear | gameover | win
let score = 0;
let best = Number(localStorage.getItem("erin-breakout-best") || 0) || 0;
let lives = 設定.起始命數;
let levelIdx = 0;
let combo = 0;
let gameTime = 0;
let bricks = [];
let balls = [];
let powerups = [];
let lasers = [];
let particles = [];
let keys = { left: false, right: false };
let bricksBroken = 0; // 本場累計打破的磚塊數（寫入每場紀錄用）
let effects = { wideUntil: 0, slowUntil: 0, laserUntil: 0, lastLaserAt: -99 };
let levelClearTimer = 0;

const paddle = { x: 畫布寬 / 2, w: 設定.球拍寬度 };

function paddleWidth() { return gameTime < effects.wideUntil ? 設定.球拍加寬寬度 : 設定.球拍寬度; }
function isSlow() { return gameTime < effects.slowUntil; }
function hasLaser() { return gameTime < effects.laserUntil; }

function currentSpeed() { return 設定.球速 + levelIdx * 設定.每關加速; }

function makeBall(x, y, angleDeg, stuck) {
  const sp = currentSpeed();
  const a = (angleDeg * Math.PI) / 180;
  return { x, y, vx: Math.sin(a) * sp, vy: -Math.cos(a) * sp, r: 設定.球半徑, stuck: !!stuck };
}

function resetBallOnPaddle() {
  balls = [makeBall(paddle.x, 球拍Y - 設定.球半徑 - 2, 25, true)];
  lasers = [];
  powerups = [];
  combo = 0;
}

function buildLevel(idx) {
  const def = 關卡表[idx];
  bricks = [];
  const cellW = 畫布寬 / def.欄;
  const cellH = 磚塊區高 / def.列;
  for (let r = 0; r < def.列; r++) {
    for (let c = 0; c < def.欄; c++) {
      if (!圖案有磚(def.圖案, r, c, def.列, def.欄)) continue;
      // 用位置決定兩擊磚（固定分布，不用隨機，方便重玩同一關）
      const isTwo = def.兩擊比例 > 0 && ((r * 7 + c * 13 + idx * 5) % 20) < Math.round(def.兩擊比例 * 20);
      bricks.push({
        x: cellW * c + cellW / 2,
        y: 磚塊區上 + cellH * r + cellH / 2,
        rx: cellW * 0.42,   // 橢圓半寬
        ry: cellH * 0.36,   // 橢圓半高
        hp: isTwo ? 2 : 1,
        maxHp: isTwo ? 2 : 1,
        colorIdx: (r + idx) % 一擊色.length,
      });
    }
  }
}

function startGame() {
  score = 0;
  bricksBroken = 0;
  lives = 設定.起始命數;
  levelIdx = 0;
  gameTime = 0;
  effects = { wideUntil: 0, slowUntil: 0, laserUntil: 0, lastLaserAt: -99 };
  particles = [];
  buildLevel(levelIdx);
  paddle.x = 畫布寬 / 2;
  resetBallOnPaddle();
  state = "ready";
  hideOverlay();
  updateHud();
}

function nextLevel() {
  levelIdx++;
  if (levelIdx >= 設定.總關卡數) { winGame(); return; }
  buildLevel(levelIdx);
  resetBallOnPaddle();
  state = "ready";
  showOverlay("第 " + (levelIdx + 1) + " 關", "點按畫面或按空白鍵發射小球！");
  updateHud();
}

function loseLife() {
  lives--;
  combo = 0;
  effects.wideUntil = 0; effects.slowUntil = 0; effects.laserUntil = 0;
  updateHud();
  if (lives <= 0) { gameOver(); return; }
  resetBallOnPaddle();
  state = "ready";
  showOverlay("少了一條命", "還剩 " + lives + " 條命。點按畫面或按空白鍵發射小球！");
}

function saveBest() {
  if (score > best) {
    best = score;
    try { localStorage.setItem("erin-breakout-best", String(best)); } catch (e) { /* 隱私模式等情況就略過 */ }
  }
}

/* ---------- 成績紀錄（localStorage，取代原版後端 getRecords／saveResult） ---------- */
const 紀錄Key = "erin-breakout-records";

function loadRecords() {
  try {
    const raw = JSON.parse(localStorage.getItem(紀錄Key) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(r => r && Number.isFinite(Number(r.score)) && Number.isFinite(Number(r.level)))
      .map(r => ({
        score: Number(r.score),
        level: Number(r.level),
        bricks_broken: Number(r.bricks_broken) || 0,
        cleared: !!r.cleared,
        played_at: typeof r.played_at === "string" ? r.played_at : "",
      }));
  } catch (e) { return []; }
}

let records = loadRecords();

function renderRecords() {
  const recordBestScore = records.reduce((m, r) => Math.max(m, r.score), 0);
  el.recordBest.textContent = String(Math.max(best, recordBestScore));
  el.recordGames.textContent = String(records.length);
  el.recentList.innerHTML = "";
  const recent = records.slice(-5).reverse(); // 最近 5 場，最新在前
  if (recent.length === 0) {
    const li = document.createElement("li");
    li.textContent = "還沒有紀錄，先玩一場吧！";
    el.recentList.appendChild(li);
    return;
  }
  for (const r of recent) {
    const li = document.createElement("li");
    li.textContent = r.score + " 分 · 第 " + r.level + " 關" + (r.cleared ? " · 通關" : "");
    el.recentList.appendChild(li);
  }
}

/* 每場結束寫入一筆紀錄（分數、到達關卡、打破磚數、是否通關、時間） */
function saveRecord(cleared) {
  records.push({
    score: score,
    level: levelIdx + 1,
    bricks_broken: bricksBroken,
    cleared: !!cleared,
    played_at: new Date().toISOString(),
  });
  try { localStorage.setItem(紀錄Key, JSON.stringify(records)); } catch (e) { /* 隱私模式等情況就略過 */ }
  renderRecords();
}

function finishGame(cleared) {
  saveBest();
  saveRecord(cleared);
}

function gameOver() {
  state = "gameover";
  finishGame(false);
  showOverlay("遊戲結束", "你的分數：" + score + " 分（第 " + (levelIdx + 1) + " 關）<br />按「重新開始」再玩一次！");
  updateHud();
}

function winGame() {
  state = "win";
  finishGame(true);
  showOverlay("🎉 全部通關！", "你打完了全部 " + 設定.總關卡數 + " 關！<br />總分數：" + score + " 分。按「重新開始」再挑戰更高分！");
  updateHud();
}

/* ---------- 道具 ---------- */
/* 可以自己改的地方：道具種類、文字和權重在這裡調 */
const 道具表 = [
  { type: "wide",  label: "寬", color: "#22e6ff", weight: 30 },
  { type: "multi", label: "球", color: "#ffe93d", weight: 25 },
  { type: "slow",  label: "慢", color: "#7cff4f", weight: 20 },
  { type: "laser", label: "雷", color: "#ff2d95", weight: 20 },
  { type: "life",  label: "命", color: "#ff5a5a", weight: 設定.額外命權重 },
];

function maybeDropPowerup(x, y) {
  if (Math.random() >= 設定.道具掉落率) return;
  const total = 道具表.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * total;
  let chosen = 道具表[0];
  for (const p of 道具表) { roll -= p.weight; if (roll <= 0) { chosen = p; break; } }
  powerups.push({ x, y, vy: 150, type: chosen.type, label: chosen.label, color: chosen.color });
}

function applyPowerup(p) {
  if (p.type === "wide") effects.wideUntil = gameTime + 設定.加寬秒數;
  else if (p.type === "slow") effects.slowUntil = gameTime + 設定.慢速秒數;
  else if (p.type === "laser") effects.laserUntil = gameTime + 設定.雷射秒數;
  else if (p.type === "life") lives = Math.min(設定.最高命數, lives + 1);
  else if (p.type === "multi") {
    // 分裂：每顆現有球多生一顆（反方向角度），最多同時 4 顆
    const src = balls.filter(b => !b.stuck);
    for (const b of src) {
      if (balls.length >= 設定.最多同時球數) break;
      const sp = Math.hypot(b.vx, b.vy) || currentSpeed();
      const ang = Math.atan2(b.vy, b.vx) + 0.55;
      balls.push({ x: b.x, y: b.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: b.r, stuck: false });
    }
  }
  updateHud();
}

/* ---------- 發射 / 雷射 ---------- */
function launchOrFire() {
  if (state === "menu" || state === "gameover" || state === "win") { startGame(); return; }
  if (state === "levelclear") return;
  const stuck = balls.find(b => b.stuck);
  if (stuck) {
    stuck.stuck = false;
    state = "playing";
    hideOverlay();
    return;
  }
  if (state === "playing" && hasLaser() && gameTime - effects.lastLaserAt >= 設定.雷射冷卻秒數) {
    effects.lastLaserAt = gameTime;
    const w = paddleWidth();
    lasers.push({ x: paddle.x - w / 2 + 6, y: 球拍Y - 10, vy: -560 });
    lasers.push({ x: paddle.x + w / 2 - 6, y: 球拍Y - 10, vy: -560 });
  }
}

/* ---------- 碰撞與計分 ---------- */
function burst(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 60 + Math.random() * 160;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.45, color });
  }
}

function hitBrick(brick, ball) {
  brick.hp--;
  if (brick.hp > 0) {
    // 兩擊磚第一下：不破，變色＋裂痕（在 draw 裡依 hp<maxHp 畫裂痕）
    burst(brick.x, brick.y, 兩擊色[brick.colorIdx]);
    return;
  }
  brick.dead = true;
  bricksBroken++;
  combo++; // 連擊：球還沒回到球拍前，每打破一塊就 +1
  const gain = 設定.每磚基本分 * Math.max(1, combo);
  score += gain;
  burst(brick.x, brick.y, 一擊色[brick.colorIdx]);
  maybeDropPowerup(brick.x, brick.y);
  if (bricks.every(b => b.dead)) {
    state = "levelclear";
    levelClearTimer = 1.4;
    saveBest();
  }
  updateHud();
}

function ballHitsBrick(ball, brick) {
  // 把球當成圓，檢查是否碰到橢圓磚（橢圓依球半徑稍微放大）
  const rx = brick.rx + ball.r * 0.55;
  const ry = brick.ry + ball.r * 0.55;
  const dx = ball.x - brick.x;
  const dy = ball.y - brick.y;
  const q = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
  if (q > 1) return false;
  // 依橢圓法線方向反彈
  let nx = dx / (brick.rx * brick.rx);
  let ny = dy / (brick.ry * brick.ry);
  const nl = Math.hypot(nx, ny) || 1;
  nx /= nl; ny /= nl;
  const dot = ball.vx * nx + ball.vy * ny;
  if (dot < 0) {
    ball.vx -= 2 * dot * nx;
    ball.vy -= 2 * dot * ny;
  } else {
    ball.vy = -ball.vy;
  }
  // 把球推出橢圓外，避免連續重複碰撞
  ball.x = brick.x + nx * (brick.rx + ball.r + 1);
  ball.y = brick.y + ny * (brick.ry + ball.r + 1);
  return true;
}

function normalizeBallSpeed(ball) {
  // 保持球速穩定（慢速道具生效時整體變慢），並避免太平／太直的角度
  const target = currentSpeed() * (isSlow() ? 設定.慢速倍率 : 1);
  const sp = Math.hypot(ball.vx, ball.vy) || target;
  ball.vx = (ball.vx / sp) * target;
  ball.vy = (ball.vy / sp) * target;
  const minVy = target * 0.28;
  if (Math.abs(ball.vy) < minVy) {
    ball.vy = ball.vy < 0 ? -minVy : minVy;
    const sx = ball.vx < 0 ? -1 : 1;
    ball.vx = sx * Math.sqrt(Math.max(0, target * target - ball.vy * ball.vy));
  }
}

/* ---------- 更新 ---------- */
function update(dt) {
  if (state === "levelclear") {
    levelClearTimer -= dt;
    updateParticles(dt);
    if (levelClearTimer <= 0) nextLevel();
    return;
  }
  if (state !== "playing" && state !== "ready") { updateParticles(dt); return; }
  gameTime += dt;

  // 鍵盤移動球拍
  const keySpeed = 560;
  if (keys.left) paddle.x -= keySpeed * dt;
  if (keys.right) paddle.x += keySpeed * dt;
  const w = paddleWidth();
  paddle.x = Math.max(w / 2, Math.min(畫布寬 - w / 2, paddle.x));

  // 黏在球拍上的球跟著球拍走
  for (const b of balls) if (b.stuck) { b.x = paddle.x; b.y = 球拍Y - b.r - 2; }

  if (state !== "playing") { updateParticles(dt); return; }

  // 小球移動與碰撞
  for (const ball of balls) {
    if (ball.stuck) continue;
    normalizeBallSpeed(ball);
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
    if (ball.x > 畫布寬 - ball.r) { ball.x = 畫布寬 - ball.r; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

    // 球拍碰撞：依打中位置改變反彈角度；碰到球拍 → 連擊重置
    if (ball.vy > 0 && ball.y + ball.r >= 球拍Y && ball.y - ball.r <= 球拍Y + 設定.球拍高度 &&
        Math.abs(ball.x - paddle.x) <= w / 2 + ball.r) {
      const rel = Math.max(-1, Math.min(1, (ball.x - paddle.x) / (w / 2)));
      const sp = Math.hypot(ball.vx, ball.vy) || currentSpeed();
      const ang = rel * 1.05; // 最大約 60 度
      ball.vx = Math.sin(ang) * sp;
      ball.vy = -Math.cos(ang) * sp;
      ball.y = 球拍Y - ball.r - 1;
      combo = 0;
      updateHud();
    }

    // 磚塊碰撞（一幀最多打一塊，避免穿透連打）
    for (const brick of bricks) {
      if (brick.dead) continue;
      if (ballHitsBrick(ball, brick)) { hitBrick(brick, ball); break; }
    }
    if (state !== "playing") return; // 剛好過關
  }

  // 雷射移動與打磚
  for (const l of lasers) {
    l.y += l.vy * dt;
    for (const brick of bricks) {
      if (brick.dead) continue;
      const dx = (l.x - brick.x) / brick.rx;
      const dy = (l.y - brick.y) / brick.ry;
      if (dx * dx + dy * dy <= 1) {
        l.dead = true;
        hitBrick(brick, null);
        break;
      }
    }
    if (l.y < 0) l.dead = true;
    if (state !== "playing") { lasers = lasers.filter(x => !x.dead); return; }
  }
  lasers = lasers.filter(l => !l.dead);

  // 道具掉落與接取
  for (const p of powerups) {
    p.y += p.vy * dt;
    if (p.y >= 球拍Y - 6 && p.y <= 球拍Y + 設定.球拍高度 + 10 && Math.abs(p.x - paddle.x) <= w / 2 + 14) {
      p.dead = true;
      applyPowerup(p);
      burst(p.x, 球拍Y, p.color);
    }
    if (p.y > 畫布高 + 20) p.dead = true;
  }
  powerups = powerups.filter(p => !p.dead);

  // 球掉出底部：全部球都掉了才扣一命
  balls = balls.filter(b => b.stuck || b.y - b.r <= 畫布高 + 10);
  if (balls.length === 0) loseLife();

  updateParticles(dt);
}

function updateParticles(dt) {
  for (const pt of particles) {
    pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 300 * dt; pt.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
}

/* ---------- 繪圖（所有磚塊一律畫橢圓形） ---------- */
function drawBrick(b) {
  const two = b.maxHp === 2;
  const damaged = b.hp < b.maxHp;
  const base = two ? 兩擊色[b.colorIdx] : 一擊色[b.colorIdx];
  ctx.save();
  ctx.shadowColor = base;
  ctx.shadowBlur = two ? 16 : 12;
  ctx.beginPath();
  ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = damaged ? "#e8e4f5" : base; // 兩擊磚受損後變淡色
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = two ? 3.5 : 2;
  ctx.strokeStyle = damaged ? base : "rgba(255,255,255,0.75)";
  ctx.stroke();
  // 橢圓上的高光
  ctx.beginPath();
  ctx.ellipse(b.x - b.rx * 0.3, b.y - b.ry * 0.35, b.rx * 0.38, b.ry * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();
  // 兩擊磚：畫一個內圈表示比較硬；受損後再畫裂痕
  if (two && !damaged) {
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.rx * 0.55, b.ry * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (damaged) {
    ctx.beginPath();
    ctx.moveTo(b.x - b.rx * 0.5, b.y - b.ry * 0.4);
    ctx.lineTo(b.x - b.rx * 0.1, b.y);
    ctx.lineTo(b.x - b.rx * 0.4, b.y + b.ry * 0.5);
    ctx.moveTo(b.x + b.rx * 0.45, b.y - b.ry * 0.5);
    ctx.lineTo(b.x + b.rx * 0.1, b.y + b.ry * 0.1);
    ctx.lineTo(b.x + b.rx * 0.4, b.y + b.ry * 0.55);
    ctx.strokeStyle = "rgba(30,10,60,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  // 背景
  const g = ctx.createLinearGradient(0, 0, 0, 畫布高);
  g.addColorStop(0, "#12082e");
  g.addColorStop(1, "#07031a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 畫布寬, 畫布高);
  ctx.strokeStyle = "rgba(90,70,200,0.16)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 畫布寬; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 畫布高); ctx.stroke(); }
  for (let y = 0; y <= 畫布高; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(畫布寬, y); ctx.stroke(); }

  // 磚塊（橢圓）
  for (const b of bricks) if (!b.dead) drawBrick(b);

  // 道具
  for (const p of powerups) {
    ctx.save();
    ctx.shadowColor = p.color; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
    ctx.fillStyle = "#1d1450"; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = p.color; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = p.color;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(p.label, p.x, p.y + 1);
    ctx.restore();
  }

  // 雷射
  ctx.save();
  ctx.shadowColor = "#ff2d95"; ctx.shadowBlur = 10;
  ctx.fillStyle = "#ff5fb0";
  for (const l of lasers) ctx.fillRect(l.x - 2, l.y - 10, 4, 14);
  ctx.restore();

  // 球拍
  const w = paddleWidth();
  ctx.save();
  const laserOn = hasLaser();
  ctx.shadowColor = laserOn ? "#ff2d95" : "#22e6ff";
  ctx.shadowBlur = 16;
  const pg = ctx.createLinearGradient(paddle.x - w / 2, 0, paddle.x + w / 2, 0);
  pg.addColorStop(0, laserOn ? "#ff2d95" : "#22e6ff");
  pg.addColorStop(0.5, "#ffffff");
  pg.addColorStop(1, laserOn ? "#ff2d95" : "#22e6ff");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(paddle.x - w / 2, 球拍Y, w, 設定.球拍高度, 7);
  ctx.fill();
  ctx.restore();
  if (laserOn) { // 雷射球拍兩端的砲口
    ctx.fillStyle = "#ff2d95";
    ctx.fillRect(paddle.x - w / 2 + 2, 球拍Y - 8, 8, 8);
    ctx.fillRect(paddle.x + w / 2 - 10, 球拍Y - 8, 8, 8);
  }

  // 小球
  for (const b of balls) {
    ctx.save();
    ctx.shadowColor = "#ffe93d"; ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "#fffbe0"; ctx.fill();
    ctx.restore();
  }

  // 粒子
  for (const pt of particles) {
    ctx.globalAlpha = Math.max(0, pt.life / 0.45);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
  }
  ctx.globalAlpha = 1;

  // 道具剩餘時間提示
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  let ty = 8;
  const remain = (until) => Math.max(0, Math.ceil(until - gameTime));
  if (gameTime < effects.wideUntil) { ctx.fillStyle = "#22e6ff"; ctx.fillText("加寬球拍：" + remain(effects.wideUntil) + " 秒", 10, ty); ty += 18; }
  if (isSlow()) { ctx.fillStyle = "#7cff4f"; ctx.fillText("慢速球：" + remain(effects.slowUntil) + " 秒", 10, ty); ty += 18; }
  if (hasLaser()) { ctx.fillStyle = "#ff5fb0"; ctx.fillText("雷射球拍：" + remain(effects.laserUntil) + " 秒（點按發射）", 10, ty); ty += 18; }
  if (combo >= 2 && state === "playing") {
    ctx.fillStyle = "#ff2d95";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("連擊 ×" + combo, 畫布寬 - 12, 8);
  }
}

/* ---------- HUD / 覆蓋畫面 ---------- */
function updateHud() {
  el.score.textContent = String(score);
  el.best.textContent = String(Math.max(best, score));
  el.lives.textContent = "❤".repeat(Math.max(0, lives)) || "0";
  el.level.textContent = (levelIdx + 1) + " / " + 設定.總關卡數;
  el.combo.textContent = "×" + combo;
  el.bricksLeft.textContent = String(bricks.filter(b => !b.dead).length);
}

function showOverlay(title, html) {
  el.overlayTitle.textContent = title;
  el.overlayText.innerHTML = html;
  el.overlayBest.textContent = "最佳分數：" + Math.max(best, score);
  el.overlay.classList.remove("hidden");
}
function hideOverlay() { el.overlay.classList.add("hidden"); }

/* ---------- 控制：滑鼠 / 觸控 / 鍵盤 ---------- */
function pointerToGameX(clientX) {
  const rect = canvas.getBoundingClientRect();
  return ((clientX - rect.left) / rect.width) * 畫布寬;
}

let dragging = false;
canvas.addEventListener("pointermove", (e) => {
  if (e.pointerType === "mouse" || dragging) paddle.x = pointerToGameX(e.clientX);
});
canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 不支援時略過 */ }
  paddle.x = pointerToGameX(e.clientX);
  launchOrFire(); // 點按／輕觸：發射黏住的球，或發射雷射
  e.preventDefault();
});
canvas.addEventListener("pointerup", () => { dragging = false; });
canvas.addEventListener("pointercancel", () => { dragging = false; });

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") { keys.left = true; e.preventDefault(); }
  else if (e.code === "ArrowRight") { keys.right = true; e.preventDefault(); }
  else if (e.code === "Space") { launchOrFire(); e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  else if (e.code === "ArrowRight") keys.right = false;
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);
document.getElementById("fireBtn").addEventListener("click", launchOrFire);

/* ---------- 主迴圈 ---------- */
let lastTs = 0;
function loop(ts) {
  const dt = Math.min(0.033, lastTs ? (ts - lastTs) / 1000 : 0.016);
  lastTs = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

/* 初始畫面：先排好第一關當背景，顯示開始說明與最佳分數 */
buildLevel(0);
resetBallOnPaddle();
renderRecords();
showOverlay("打磚塊", "移動球拍反彈小球，打掉所有橢圓磚塊！<br />點按畫面或按空白鍵發射小球，過完 " + 設定.總關卡數 + " 關就通關。");
updateHud();
requestAnimationFrame(loop);
