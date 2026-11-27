"use strict";
/* ============================================================
   球球消除（泡泡射擊）
   純 vanilla JavaScript，不呼叫任何後端、不載入外部資源。
   成績只存 localStorage。
   ============================================================ */

/* ---------- 可以自己改的地方（設定區） ---------- */

// 球的五種顏色：對齊原版實作使用的馬卡龍色碼（見 DESIGN.md）
const COLORS = ["#ffb3c6", "#ffd98e", "#a8e6c1", "#a5cdf5", "#d3b8f2"];

// 場地底色：深靛藍夜空（原版）
const FIELD_COLOR = "#171233";

// 棋盤欄數（固定 15 欄，球直徑＝欄寬）
const COLS = 15;

// 每顆球的分數：消除一顆的得分、掉落一顆的額外得分（原版：掉落 ×15）
const POP_SCORE = 10;
const DROP_SCORE = 15;

// 棋盤全清獎勵：100 ＋ 關卡 × 50（原版）
const CLEAR_BONUS_BASE = 100;
const CLEAR_BONUS_PER_LEVEL = 50;

// 每射幾球都沒有消除，頂部就推下一列
const PUSH_EVERY = 6;

// 各關初始列數表：第 1~10 關照這張表，之後每關 +0.5 列，上限 20 列。
// 「半列」（如 16.5）代表最後一列只填左半邊欄位。
const LEVEL_ROWS_TABLE = [8, 10, 11, 12, 13, 14, 15, 16, 16.5, 17];
const LEVEL_ROWS_AFTER_TABLE = 0.5; // 第 10 關之後每關增加的列數
const LEVEL_ROWS_MAX = 20;

// 半列要填幾欄（左半邊）：15 欄的一半取 7 欄
const HALF_ROW_COLS = Math.floor(COLS / 2);

// 發射球飛行速度（像素／秒，原版 BALL_SPEED=820）、瞄準線預覽長度（像素）
const BALL_SPEED = 820;
const GUIDE_LENGTH = 330;

// 最佳成績存 localStorage 的 key（存 {score, level}）
const BEST_KEY = "erin-bubble-pop-best";

/* ---------- 幾何（通常不用改） ---------- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;            // 420（原版棋盤寬）
const H = canvas.height;           // 640（原版棋盤高）
// 格位間距（pitch）：欄寬 = 420 / 15 = 28；球半徑 R=13.33（原版），
// 球直徑 26.66 略小於間距，球與球之間留一點點間隙。
const BALL_D = W / COLS;           // 28
const R = 13.33;                   // 球半徑（原版）
const ROW_H = Math.round(BALL_D * 0.866); // 六角交錯列高 ≈ 24
const TOP_Y = 8;                   // 棋盤頂部（天花板）高度
// 紅色警戒線位置：原版 DEAD_Y=556，任何球越過就結束（固定值，不隨列高計算）
const DEAD_Y = 556;
const LAUNCHER = { x: W / 2, y: 588 };    // 底部中央發射器位置
const MAX_AIM_ANGLE = 1.25;               // 瞄準角度上限（離垂直方向 ±約 72 度）

/* ---------- DOM ---------- */
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");
const poppedEl = document.getElementById("popped");
const pushEl = document.getElementById("pushCount");
const messageEl = document.getElementById("message");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayTextEl = document.getElementById("overlayText");
const overlayBestEl = document.getElementById("overlayBest");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const swapBtn = document.getElementById("swapBtn");
const nextBallEl = document.getElementById("nextBall");

/* ---------- 遊戲狀態 ---------- */
let grid = [];          // grid[r][c] = 顏色 index，沒有球是 -1
let parityFlip = 0;     // 推下列時切換，讓既有球的左右位置不跳動（見 pushDownOneRow）
let score = 0;
let poppedCount = 0;    // 本局累計已消除球數（消除＋掉落，HUD「已消除」）
let level = 1;
let state = "ready";    // "ready" | "playing" | "over"
let paused = false;     // 暫停中（state 仍為 "playing"）
let currentColor = 0;
let nextColor = 1;
let shotsSincePop = 0;  // 連續幾球沒有消除（到 PUSH_EVERY 就推下一列）
let flying = null;      // 飛行中的球 {x, y, vx, vy, color}
let falling = [];       // 失去支撐、正在掉落的球 {x, y, vy, color}
let sparkles = [];      // 消除時的小亮點特效 {x, y, vx, vy, color, life}
let aiming = false;
let aimAngle = 0;       // 0 = 正上方，正負代表左右偏
let best = loadBest();

/* ---------- 小工具 ---------- */
function randInt(n) {
  return Math.floor(Math.random() * n);
}

// 某一列的物理偏移：回傳 0（不偏移）或 1（偏移半格，奇數列）
function rowParity(r) {
  return (r + parityFlip) % 2;
}

// 偏移列少一欄（不然最右邊會超出棋盤）
function colsInRow(r) {
  return rowParity(r) === 1 ? COLS - 1 : COLS;
}

// 格子中心座標（橫向以格位間距 BALL_D 為準，偏移列右移半格）
function cellCenter(r, c) {
  return {
    x: BALL_D / 2 + c * BALL_D + (rowParity(r) === 1 ? BALL_D / 2 : 0),
    y: TOP_Y + R + r * ROW_H,
  };
}

// 六角排列的鄰居：偏移列與不偏移列的斜鄰居欄位不同
function neighbors(r, c) {
  const list = [[r, c - 1], [r, c + 1]];
  const diag = rowParity(r) === 1 ? [c, c + 1] : [c - 1, c];
  for (const nr of [r - 1, r + 1]) {
    for (const nc of diag) list.push([nr, nc]);
  }
  return list.filter(([nr, nc]) => nr >= 0 && nr < grid.length && nc >= 0 && nc < colsInRow(nr));
}

function inGrid(r, c) {
  return r >= 0 && r < grid.length && c >= 0 && c < colsInRow(r) && grid[r][c] !== -1;
}

// 棋盤上還存在的顏色（發射球只從這些顏色隨機選，避免必死局）
function presentColors() {
  const set = new Set();
  for (const row of grid) for (const v of row) if (v !== -1) set.add(v);
  return [...set];
}

function randomPresentColor() {
  const present = presentColors();
  if (present.length === 0) return randInt(COLORS.length);
  return present[randInt(present.length)];
}

function boardIsEmpty() {
  return presentColors().length === 0;
}

/* ---------- 關卡列數 ---------- */
// 查表 + 之後每關 +0.5 列、上限 20 列（可以自己改的地方：LEVEL_ROWS_TABLE）
function rowsForLevel(lv) {
  if (lv <= LEVEL_ROWS_TABLE.length) return LEVEL_ROWS_TABLE[lv - 1];
  const extra = (lv - LEVEL_ROWS_TABLE.length) * LEVEL_ROWS_AFTER_TABLE;
  return Math.min(LEVEL_ROWS_MAX, LEVEL_ROWS_TABLE[LEVEL_ROWS_TABLE.length - 1] + extra);
}

// 建立一關的初始盤面
function buildLevel(lv) {
  grid = [];
  parityFlip = 0;
  falling = [];
  flying = null;
  shotsSincePop = 0;
  const total = rowsForLevel(lv);
  const fullRows = Math.floor(total);
  const hasHalf = total - fullRows > 0;
  const rowCount = fullRows + (hasHalf ? 1 : 0);
  for (let r = 0; r < rowCount; r++) {
    const row = new Array(colsInRow(r)).fill(-1);
    const fillCount = hasHalf && r === rowCount - 1 ? HALF_ROW_COLS : row.length;
    for (let c = 0; c < fillCount; c++) row[c] = randInt(COLORS.length);
    grid.push(row);
  }
  currentColor = randomPresentColor();
  nextColor = randomPresentColor();
}

/* ---------- 最佳成績（localStorage） ---------- */
function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return { score: 0, level: 0 };
    const data = JSON.parse(raw);
    if (typeof data === "number") return { score: data, level: 0 };
    return { score: data.score | 0, level: data.level | 0 };
  } catch (e) {
    return { score: 0, level: 0 };
  }
}

function saveBest() {
  if (score > best.score) best.score = score;
  if (level > best.level) best.level = level;
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch (e) { /* 存不了就跳過，不影響玩 */ }
}

/* ---------- HUD ---------- */
function updateHud() {
  scoreEl.textContent = String(score);
  levelEl.textContent = String(level);
  bestEl.textContent = String(Math.max(best.score, score));
  poppedEl.textContent = String(poppedCount);
  pushEl.textContent = String(PUSH_EVERY - shotsSincePop);
  nextBallEl.style.background = COLORS[nextColor];
}

function setMessage(text) {
  messageEl.textContent = text;
}

function showOverlay(title, text) {
  overlayTitleEl.textContent = title;
  overlayTextEl.innerHTML = text;
  overlayBestEl.textContent = best.score > 0
    ? "最佳分數：" + best.score + "（最高到第 " + Math.max(best.level, 1) + " 關）"
    : "";
  startBtn.textContent = state === "over" ? "再玩一次" : "開始遊戲";
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

/* ---------- 遊戲流程 ---------- */
function startGame() {
  score = 0;
  poppedCount = 0;
  level = 1;
  paused = false;
  pauseBtn.textContent = "暫停";
  buildLevel(level);
  state = "playing";
  hideOverlay();
  setMessage("第 1 關開始！拖曳瞄準，放開發射。");
  updateHud();
}

// 暫停／繼續
function togglePause() {
  if (state !== "playing") return;
  paused = !paused;
  aiming = false;
  pauseBtn.textContent = paused ? "繼續" : "暫停";
  setMessage(paused ? "已暫停，按「繼續」回到遊戲。" : "繼續遊戲！拖曳瞄準，放開發射。");
}

function gameOver(reason) {
  state = "over";
  paused = false;
  pauseBtn.textContent = "暫停";
  saveBest();
  updateHud();
  showOverlay("遊戲結束", reason + "<br />你的分數：" + score + "，到第 " + level + " 關。");
  setMessage("遊戲結束，按「再玩一次」重新開始。");
}

function nextLevel() {
  saveBest();
  level += 1;
  buildLevel(level);
  setMessage("過關！進入第 " + level + " 關（" + rowsForLevel(level) + " 列）。");
  updateHud();
}

// 交換目前發射球與下一顆預覽球
function swapBalls() {
  if (state !== "playing" || paused || flying) return;
  const t = currentColor;
  currentColor = nextColor;
  nextColor = t;
  updateHud();
}

/* ---------- 發射與飛行 ---------- */
function shoot() {
  if (state !== "playing" || paused || flying) return;
  flying = {
    x: LAUNCHER.x,
    y: LAUNCHER.y,
    vx: Math.sin(aimAngle) * BALL_SPEED,
    vy: -Math.cos(aimAngle) * BALL_SPEED,
    color: currentColor,
  };
  currentColor = nextColor;
  nextColor = randomPresentColor();
  updateHud();
}

// 把飛行球吸附到最近的空格位；回傳吸附到的 {r, c} 或 null
function snapFlying() {
  let bestCell = null;
  let bestDist = Infinity;
  const maxRow = Math.min(grid.length, 40); // 最多往下探一列新列
  for (let r = 0; r <= maxRow; r++) {
    const n = r < grid.length ? colsInRow(r) : (rowParity(r) === 1 ? COLS - 1 : COLS);
    for (let c = 0; c < n; c++) {
      if (r < grid.length && grid[r][c] !== -1) continue;
      const p = cellCenter(r, c);
      const d = Math.hypot(p.x - flying.x, p.y - flying.y);
      if (d < bestDist) {
        bestDist = d;
        bestCell = { r, c };
      }
    }
  }
  if (!bestCell) return null;
  // 需要新的一列就補上
  while (grid.length <= bestCell.r) {
    grid.push(new Array(colsInRow(grid.length)).fill(-1));
  }
  grid[bestCell.r][bestCell.c] = flying.color;
  return bestCell;
}

// 同色相連群（BFS）
function sameColorGroup(r, c) {
  const color = grid[r][c];
  const seen = new Set([r + "," + c]);
  const stack = [[r, c]];
  const group = [];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    group.push([cr, cc]);
    for (const [nr, nc] of neighbors(cr, cc)) {
      const key = nr + "," + nc;
      if (!seen.has(key) && inGrid(nr, nc) && grid[nr][nc] === color) {
        seen.add(key);
        stack.push([nr, nc]);
      }
    }
  }
  return group;
}

// 與頂部（第 0 列）相連的球集合；不在裡面的就是失去支撐
function connectedToTop() {
  const seen = new Set();
  const stack = [];
  if (grid.length > 0) {
    for (let c = 0; c < colsInRow(0); c++) {
      if (grid[0][c] !== -1) {
        seen.add("0," + c);
        stack.push([0, c]);
      }
    }
  }
  while (stack.length) {
    const [cr, cc] = stack.pop();
    for (const [nr, nc] of neighbors(cr, cc)) {
      const key = nr + "," + nc;
      if (!seen.has(key) && inGrid(nr, nc)) {
        seen.add(key);
        stack.push([nr, nc]);
      }
    }
  }
  return seen;
}

function addSparkles(r, c, colorIdx) {
  const p = cellCenter(r, c);
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 90;
    sparkles.push({
      x: p.x, y: p.y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      color: COLORS[colorIdx], life: 0.45,
    });
  }
}

// 飛行球停下來之後的結算：消除 → 掉落 → 推下／過關／結束檢查
function resolveLanded(cell) {
  const group = sameColorGroup(cell.r, cell.c);
  let popped = false;
  if (group.length >= 3) {
    popped = true;
    for (const [r, c] of group) {
      addSparkles(r, c, grid[r][c]);
      grid[r][c] = -1;
      score += POP_SCORE;
      poppedCount += 1;
    }
    // 失去與頂部連接支撐的球掉落，額外加分
    const supported = connectedToTop();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < colsInRow(r); c++) {
        if (grid[r][c] !== -1 && !supported.has(r + "," + c)) {
          const p = cellCenter(r, c);
          falling.push({ x: p.x, y: p.y, vy: 60, color: grid[r][c] });
          grid[r][c] = -1;
          score += DROP_SCORE;
          poppedCount += 1;
        }
      }
    }
    setMessage("消除 " + group.length + " 顆，得分！");
  }

  // 去掉尾端整列空白的列（盤面變矮）
  while (grid.length > 0 && grid[grid.length - 1].every((v) => v === -1)) grid.pop();

  if (boardIsEmpty()) {
    // 全清獎勵：100 ＋ 關卡 × 50（以全清當下的關卡計算）
    const bonus = CLEAR_BONUS_BASE + level * CLEAR_BONUS_PER_LEVEL;
    score += bonus;
    updateHud();
    nextLevel();
    setMessage("棋盤全清！獎勵 " + bonus + " 分，進入第 " + level + " 關（" + rowsForLevel(level) + " 列）。");
    return;
  }

  if (popped) {
    shotsSincePop = 0;
  } else {
    shotsSincePop += 1;
    if (shotsSincePop >= PUSH_EVERY) {
      shotsSincePop = 0;
      pushDownOneRow();
      setMessage("太久沒消除，頂部推下一列！");
    }
  }

  updateHud();
  checkGameOver();
}

// 任何球越過警戒線就結束
function checkGameOver() {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < colsInRow(r); c++) {
      if (grid[r][c] !== -1 && cellCenter(r, c).y + R > DEAD_Y) {
        gameOver("有球越過紅色警戒線了！");
        return;
      }
    }
  }
}

// 頂部推下一列：新增一列隨機球，整盤下移一列。
// parityFlip 切換後，既有球算出的物理偏移不變，畫面不會左右跳動。
function pushDownOneRow() {
  parityFlip = parityFlip === 0 ? 1 : 0;
  const present = presentColors();
  const pool = present.length ? present : COLORS.map((_, i) => i);
  const row = new Array(colsInRow(0)).fill(-1);
  for (let c = 0; c < row.length; c++) row[c] = pool[randInt(pool.length)];
  grid.unshift(row);
}

/* ---------- 更新（飛行、掉落、特效） ---------- */
function update(dt) {
  // 掉落中的球
  for (const b of falling) {
    b.vy += 1500 * dt;
    b.y += b.vy * dt;
  }
  falling = falling.filter((b) => b.y - R < canvas.height);

  // 消除亮點
  for (const s of sparkles) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 300 * dt;
    s.life -= dt;
  }
  sparkles = sparkles.filter((s) => s.life > 0);

  if (!flying) return;
  // 分小步移動，避免高速穿過球
  const steps = Math.max(1, Math.ceil((BALL_SPEED * dt) / (R / 2)));
  const sdt = dt / steps;
  for (let i = 0; i < steps; i++) {
    flying.x += flying.vx * sdt;
    flying.y += flying.vy * sdt;
    // 碰牆反彈
    if (flying.x < R) { flying.x = R; flying.vx = Math.abs(flying.vx); }
    if (flying.x > W - R) { flying.x = W - R; flying.vx = -Math.abs(flying.vx); }
    // 碰到頂部 → 吸附
    if (flying.y - R <= TOP_Y) {
      flying.y = TOP_Y + R;
      landFlying();
      return;
    }
    // 碰到其他球 → 吸附
    let hit = false;
    for (let r = 0; r < grid.length && !hit; r++) {
      for (let c = 0; c < colsInRow(r); c++) {
        if (grid[r][c] === -1) continue;
        const p = cellCenter(r, c);
        if (Math.hypot(p.x - flying.x, p.y - flying.y) < BALL_D - 2) { hit = true; break; }
      }
    }
    if (hit) {
      landFlying();
      return;
    }
  }
}

function landFlying() {
  const cell = snapFlying();
  const color = flying.color;
  flying = null;
  if (!cell) return;
  grid[cell.r][cell.c] = color; // snapFlying 已放入，這行保險用（同值）
  resolveLanded(cell);
}

/* ---------- 瞄準指引（含碰牆反彈預覽） ---------- */
// 沿瞄準方向一步步推：遇到牆就反彈，遇到球或頂部就停；回傳線段端點陣列
function computeGuidePoints() {
  const pts = [{ x: LAUNCHER.x, y: LAUNCHER.y }];
  let px = LAUNCHER.x;
  let py = LAUNCHER.y;
  let dx = Math.sin(aimAngle);
  let dy = -Math.cos(aimAngle);
  let remain = GUIDE_LENGTH;
  for (let seg = 0; seg < 4 && remain > 0; seg++) {
    let t = remain;
    let bounce = false;
    // 到左右牆的距離
    if (dx > 0.0001) {
      const tw = (W - R - px) / dx;
      if (tw < t) { t = tw; bounce = true; }
    } else if (dx < -0.0001) {
      const tw = (R - px) / dx;
      if (tw < t) { t = tw; bounce = true; }
    }
    // 到頂部的距離
    if (dy < -0.0001) {
      const tt = (TOP_Y + R - py) / dy;
      if (tt < t) { t = tt; bounce = false; }
    }
    // 到最近一顆球的距離（射線對圓）
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < colsInRow(r); c++) {
        if (grid[r][c] === -1) continue;
        const p = cellCenter(r, c);
        const ox = p.x - px;
        const oy = p.y - py;
        const proj = ox * dx + oy * dy;
        if (proj <= 0) continue;
        const perp2 = ox * ox + oy * oy - proj * proj;
        const rr = BALL_D - 2;
        if (perp2 >= rr * rr) continue;
        const thit = proj - Math.sqrt(rr * rr - perp2);
        if (thit > 0 && thit < t) { t = thit; bounce = false; }
      }
    }
    px += dx * t;
    py += dy * t;
    pts.push({ x: px, y: py });
    remain -= t;
    if (!bounce) break;
    dx = -dx; // 碰牆反彈
  }
  return pts;
}

/* ---------- 繪圖 ---------- */
function drawBall(x, y, colorIdx) {
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = COLORS[colorIdx];
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(23, 18, 51, 0.35)";
  ctx.stroke();
  // 高光
  ctx.beginPath();
  ctx.arc(x - R * 0.35, y - R * 0.38, R * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fill();
}

function draw() {
  // 場地底色：深靛藍夜空
  ctx.fillStyle = FIELD_COLOR;
  ctx.fillRect(0, 0, W, H);

  // 頂部天花板
  ctx.fillStyle = "#d3b8f2";
  ctx.fillRect(0, 0, W, TOP_Y);

  // 棋盤上的球
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < colsInRow(r); c++) {
      if (grid[r][c] === -1) continue;
      const p = cellCenter(r, c);
      drawBall(p.x, p.y, grid[r][c]);
    }
  }

  // 紅色警戒線
  ctx.save();
  ctx.strokeStyle = "#ff4d6d";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.moveTo(0, DEAD_Y);
  ctx.lineTo(W, DEAD_Y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#ff4d6d";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("警戒線", 8, DEAD_Y - 6);
  ctx.restore();

  // 掉落中的球
  for (const b of falling) drawBall(b.x, b.y, b.color);

  // 瞄準虛線（遊戲中、沒有球在飛、沒有拖曳以外的狀態都顯示目前方向）
  if (state === "playing" && !flying) {
    const pts = computeGuidePoints();
    ctx.save();
    ctx.strokeStyle = "rgba(245, 242, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([2, 9]);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  // 發射器底座
  ctx.save();
  ctx.translate(LAUNCHER.x, LAUNCHER.y + 26);
  ctx.fillStyle = "#a5cdf5";
  ctx.strokeStyle = "rgba(245, 242, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-34, 22);
  ctx.quadraticCurveTo(0, -16, 34, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 發射器上的目前球 / 飛行中的球
  if (state === "playing" && !flying) drawBall(LAUNCHER.x, LAUNCHER.y, currentColor);
  if (flying) drawBall(flying.x, flying.y, flying.color);

  // 消除亮點
  for (const s of sparkles) {
    ctx.globalAlpha = Math.max(0, s.life / 0.45);
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- 主迴圈 ---------- */
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min(0.033, lastTime ? (timestamp - lastTime) / 1000 : 0.016);
  lastTime = timestamp;
  if (!paused) update(dt);
  draw();
  requestAnimationFrame(loop);
}

/* ---------- 操作：拖曳瞄準、放開發射（滑鼠＋觸控都走 Pointer Events） ---------- */
function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (W / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function aimAt(pos) {
  const dx = pos.x - LAUNCHER.x;
  const dy = pos.y - LAUNCHER.y;
  if (dy > -12) return; // 指標在發射器下方時不更新角度，避免亂跳
  let angle = Math.atan2(dx, -dy);
  angle = Math.max(-MAX_AIM_ANGLE, Math.min(MAX_AIM_ANGLE, angle));
  aimAngle = angle;
}

canvas.addEventListener("pointerdown", (event) => {
  if (state !== "playing" || paused || flying) return;
  event.preventDefault();
  aiming = true;
  canvas.setPointerCapture(event.pointerId);
  aimAt(pointerPos(event));
});

canvas.addEventListener("pointermove", (event) => {
  if (!aiming) return;
  aimAt(pointerPos(event));
});

function endAim(event) {
  if (!aiming) return;
  aiming = false;
  if (state === "playing" && !paused && !flying) shoot();
}

canvas.addEventListener("pointerup", endAim);
canvas.addEventListener("pointercancel", () => { aiming = false; });

// 鍵盤輔助：左右鍵微調角度、空白鍵發射、S 交換（平板沒鍵盤也沒關係）
window.addEventListener("keydown", (event) => {
  if (state !== "playing") return;
  if (event.key === "ArrowLeft") aimAngle = Math.max(-MAX_AIM_ANGLE, aimAngle - 0.06);
  else if (event.key === "ArrowRight") aimAngle = Math.min(MAX_AIM_ANGLE, aimAngle + 0.06);
  else if (event.key === " ") { event.preventDefault(); shoot(); }
  else if (event.key === "s" || event.key === "S") swapBalls();
  else if (event.key === "p" || event.key === "P") togglePause();
});

/* ---------- 按鈕 ---------- */
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
swapBtn.addEventListener("click", swapBalls);
nextBallEl.addEventListener("click", swapBalls);

/* ---------- 初始化：先畫出第 1 關盤面當背景，顯示開始畫面 ---------- */
buildLevel(1);
updateHud();
showOverlay(
  "球球消除",
  "拖曳瞄準、放開發射。<br />三顆以上同色相連就會消除，<br />失去支撐的球會掉下來加分！"
);
requestAnimationFrame(loop);
