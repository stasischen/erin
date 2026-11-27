"use strict";
/*
方塊格子（Tetris 式）— 純 vanilla JavaScript，不呼叫任何後端、不載入外部資源。
成績只存 localStorage。

============================================================
★ 可以自己改的地方（改下面這些常數就好，不用動其他程式）★
============================================================
*/

// 棋盤大小（原版常數）：10 欄 × 20 列，BUFFER=2 為出生緩衝列數
const COLS = 10;
const ROWS = 20;
const BUFFER = 2;
const CELL = 30; // 每格像素（主棋盤）；預覽區會另外縮小

// 消行計分表（原版常數 CLEAR_POINTS）：一次消 1/2/3/4 行的基礎分（會再乘以等級）
const CLEAR_POINTS = [0, 100, 300, 500, 800];

// 下落間隔（原版公式）：max(70, round(820 × 0.8^(level-1))) 毫秒
const FALL_BASE_MS = 820;
const FALL_MIN_MS = 70;

// 鎖定延遲與消行間隔（原版常數）
const LOCK_MS = 420; // 方塊接觸地面後，過這麼久才鎖定
const CLEAR_MS = 170; // 消行後到下一塊出現的間隔
const MAX_LOCK_RESETS = 12; // 同一塊重置鎖定計時的上限（lockResets < 12 才可重置）

// 旋轉踢牆表（原版完整 8 段，依序嘗試 [dx, dy]）
const WALL_KICKS = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1], [-1, -1], [1, -1]];

// 升級條件：每消幾行升一級（level = floor(lines / 10) + 1）
const LINES_PER_LEVEL = 10;

// 額外加分：軟降每下一格 +1 分、硬降每下一格 +2 分
const SOFT_DROP_POINTS = 1;
const HARD_DROP_POINTS = 2;

// 方塊顏色：7 種四格方塊各一個固定顏色
const COLORS = {
I: "#22d3ee",
O: "#facc15",
T: "#e879f9",
S: "#4ade80",
Z: "#f87171",
J: "#60a5fa",
L: "#fb923c",
};

// 最佳分數的 localStorage 鍵名（規格指定，不要隨意改，改了舊紀錄會讀不到）
const BEST_KEY = "erin-block-grid-best";

/* ============================================================
以下為遊戲程式，一般不用改
============================================================ */

// 方塊形狀定義（用矩陣表示，1 = 有格子）
const SHAPES = {
I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
O: [[1, 1], [1, 1]],
T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
};
const TYPES = Object.keys(SHAPES);

// ---- DOM ----
const boardCanvas = document.getElementById("board");
const boardCtx = boardCanvas.getContext("2d");
const holdCanvas = document.getElementById("holdCanvas");
const holdCtx = holdCanvas.getContext("2d");
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const resultText = document.getElementById("resultText");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayBest = document.getElementById("overlayBest");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

// ---- 遊戲狀態 ----
let grid = null; // 棋盤：null 或顏色字串
let current = null; // 目前方塊 { type, matrix, x, y}
let holdType = null; // 暫存槽裡的方塊種類（null = 空）
let canHold = true; // 本個方塊落地前是否還能暫存（每落一個只能換一次）
let queue = []; // 接下來的方塊佇列（前面 3 個會顯示預覽）
let bag = []; // 7-bag 發牌袋
let score = 0;
let lines = 0;
let level = 1;
let best = loadBest();
let running = false;
let paused = false;
let gameOver = false;
let dropTimer = null;
let lastTime = 0;
let dropCounter = 0;
let lockCounter = 0; // 方塊接觸地面後累計的鎖定計時（毫秒）
let lockResets = 0; // 目前方塊已重置鎖定計時的次數
let pendingSpawn = false; // 消行後等待 CLEAR_MS 再出下一塊
let clearTimer = 0;

function loadBest() {
try {
const v = Number(localStorage.getItem(BEST_KEY));
return Number.isFinite(v) && v > 0? Math.floor(v): 0;
} catch (e) {
return 0; // 無痕模式等情況讀不到時，就當作 0，不要讓遊戲壞掉
}
}

function saveBest() {
if (score > best) {
best = score;
try { localStorage.setItem(BEST_KEY, String(best));} catch (e) { /* 存不了也沒關係 */}
}
}

function fallInterval() {
return Math.max(FALL_MIN_MS, Math.round(FALL_BASE_MS * Math.pow(0.8, level - 1)));
}

function emptyGrid() {
return Array.from({ length: ROWS}, () => Array(COLS).fill(null));
}

// 7-bag 隨機：一袋裡 7 種方塊各一個，抽完再洗一袋，比較公平
function refillBag() {
bag = TYPES.slice();
for (let i = bag.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
const t = bag[i]; bag[i] = bag[j]; bag[j] = t;
}
}
function nextType() {
if (bag.length === 0) refillBag();
return bag.pop();
}
function ensureQueue() {
while (queue.length < 5) queue.push(nextType());
}

function makePiece(type) {
const matrix = SHAPES[type].map((row) => row.slice());
return {
type: type,
matrix: matrix,
x: Math.floor((COLS - matrix[0].length) / 2),
y: type === "I"? -1: 0,
};
}

// 檢查某個矩陣放在 (px, py) 會不會出界或撞到已堆好的方塊
function collides(matrix, px, py) {
for (let r = 0; r < matrix.length; r++) {
for (let c = 0; c < matrix[r].length; c++) {
if (!matrix[r][c]) continue;
const x = px + c;
const y = py + r;
if (x < 0 || x >= COLS || y >= ROWS) return true;
if (y >= 0 && grid[y][x]) return true;
}
}
return false;
}

function spawnPiece() {
ensureQueue();
current = makePiece(queue.shift());
ensureQueue();
canHold = true;
lockCounter = 0;
lockResets = 0;
dropCounter = 0;
// 出生位置若一開始就撞到東西，代表堆到頂了，遊戲結束
if (collides(current.matrix, current.x, current.y)) {
// 再往上一格試試，給一點緩衝
current.y -= 1;
if (collides(current.matrix, current.x, current.y)) {
endGame();
return;
}
}
draw();
}

function lockPiece() {
if (!current) return;
for (let r = 0; r < current.matrix.length; r++) {
for (let c = 0; c < current.matrix[r].length; c++) {
if (!current.matrix[r][c]) continue;
const x = current.x + c;
const y = current.y + r;
if (y < 0) { endGame(); return;} // 有格子鎖在棋盤上方 = 堆到頂
grid[y][x] = COLORS[current.type];
}
}
const cleared = clearLines();
current = null;
lockCounter = 0;
lockResets = 0;
if (!gameOver) {
if (cleared > 0) {
// 消行後等 CLEAR_MS 再出下一塊
pendingSpawn = true;
clearTimer = 0;
draw();
} else {
spawnPiece();
}
}
}

function clearLines() {
let cleared = 0;
for (let r = ROWS - 1; r >= 0; r--) {
if (grid[r].every((cell) => cell!== null)) {
grid.splice(r, 1);
grid.unshift(Array(COLS).fill(null));
cleared++;
r++; // 同一列再檢查一次（上面整排掉下來了）
}
}
if (cleared > 0) {
score += CLEAR_POINTS[cleared] * level; // 計分表 × 等級
lines += cleared;
level = Math.floor(lines / LINES_PER_LEVEL) + 1;
updateHud();
}
return cleared;
}

// 方塊接觸地面時，移動／旋轉成功可重置鎖定計時，但同一塊最多重置 MAX_LOCK_RESETS 次以內（lockResets < 12）
function tryLockReset() {
if (!current) return;
if (lockResets < MAX_LOCK_RESETS && collides(current.matrix, current.x, current.y + 1)) {
lockCounter = 0;
lockResets++;
}
}

function move(dx) {
if (!current || paused || gameOver ||!running) return;
if (!collides(current.matrix, current.x + dx, current.y)) {
current.x += dx;
tryLockReset();
draw();
}
}

function rotateMatrix(matrix) {
const n = matrix.length;
const m = matrix[0].length;
const out = [];
for (let c = 0; c < m; c++) {
const row = [];
for (let r = n - 1; r >= 0; r--) row.push(matrix[r][c]);
out.push(row);
}
return out;
}

function rotate() {
if (!current || paused || gameOver ||!running) return;
if (current.type === "O") return; // O 方塊旋轉沒差別
const rotated = rotateMatrix(current.matrix);
// 踢牆：依原版完整 8 段表 [dx, dy] 依序嘗試，都不行就不轉
for (const kick of WALL_KICKS) {
if (!collides(rotated, current.x + kick[0], current.y + kick[1])) {
current.matrix = rotated;
current.x += kick[0];
current.y += kick[1];
tryLockReset();
draw();
return;
}
}
}

function softDrop() {
if (!current || paused || gameOver ||!running) return;
if (!collides(current.matrix, current.x, current.y + 1)) {
current.y += 1;
score += SOFT_DROP_POINTS;
updateHud();
dropCounter = 0;
}
// 已接觸地面時不立即鎖定，改由 tick 的 LOCK_MS 鎖定延遲計時處理
draw();
}

function hardDrop() {
if (!current || paused || gameOver ||!running) return;
let dist = 0;
while (!collides(current.matrix, current.x, current.y + 1)) {
current.y += 1;
dist++;
}
score += dist * HARD_DROP_POINTS;
updateHud();
lockPiece();
dropCounter = 0;
draw();
}

function hold() {
if (!current || paused || gameOver ||!running ||!canHold) return;
const curType = current.type;
if (holdType === null) {
holdType = curType;
spawnPiece(); // spawnPiece 會把 canHold 重設，要在之後再鎖住
} else {
const swap = holdType;
holdType = curType;
current = makePiece(swap);
lockCounter = 0;
lockResets = 0;
dropCounter = 0;
if (collides(current.matrix, current.x, current.y)) { endGame(); draw(); return;}
}
canHold = false; // 每個方塊落地前只能換一次
draw();
}

// 幽靈方塊：目前方塊垂直落下會停的 y
function ghostY() {
let y = current.y;
while (!collides(current.matrix, current.x, y + 1)) y++;
return y;
}

// ---- 繪圖 ----
function drawCell(ctx, x, y, size, color, alpha) {
ctx.save();
ctx.globalAlpha = alpha;
ctx.fillStyle = color;
ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
ctx.fillStyle = "rgba(255,255,255,0.28)";
ctx.fillRect(x * size + 1, y * size + 1, size - 2, Math.max(3, size * 0.22));
ctx.restore();
}

function drawMatrix(ctx, matrix, ox, oy, size, color, alpha) {
for (let r = 0; r < matrix.length; r++) {
for (let c = 0; c < matrix[r].length; c++) {
if (matrix[r][c]) drawCell(ctx, ox + c, oy + r, size, color, alpha);
}
}
}

function draw() {
// 主棋盤
boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
boardCtx.fillStyle = "#14161c";
boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
// 格線
boardCtx.strokeStyle = "rgba(255,255,255,0.07)";
boardCtx.lineWidth = 1;
for (let c = 1; c < COLS; c++) {
boardCtx.beginPath(); boardCtx.moveTo(c * CELL, 0); boardCtx.lineTo(c * CELL, ROWS * CELL); boardCtx.stroke();
}
for (let r = 1; r < ROWS; r++) {
boardCtx.beginPath(); boardCtx.moveTo(0, r * CELL); boardCtx.lineTo(COLS * CELL, r * CELL); boardCtx.stroke();
}
if (grid) {
for (let r = 0; r < ROWS; r++) {
for (let c = 0; c < COLS; c++) {
if (grid[r][c]) drawCell(boardCtx, c, r, CELL, grid[r][c], 1);
}
}
}
if (current &&!gameOver) {
// 幽靈方塊（半透明預覽落點）
const gy = ghostY();
if (gy!== current.y) drawMatrix(boardCtx, current.matrix, current.x, gy, CELL, COLORS[current.type], 0.28);
drawMatrix(boardCtx, current.matrix, current.x, current.y, CELL, COLORS[current.type], 1);
}
drawPreviews();
}

function drawMini(ctx, canvas, type, centerY, size) {
if (!type) return;
const matrix = SHAPES[type];
const w = matrix[0].length * size;
const h = matrix.length * size;
const ox = Math.round((canvas.width - w) / 2 / size);
const oy = Math.round((centerY - h / 2) / size);
drawMatrix(ctx, matrix, ox, oy, size, COLORS[type], 1);
}

function drawPreviews() {
// 暫存槽
holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
holdCtx.fillStyle = "#14161c";
holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
if (holdType) drawMini(holdCtx, holdCanvas, holdType, holdCanvas.height / 2, 20);
// 接下來 3 個
nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
nextCtx.fillStyle = "#14161c";
nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
ensureQueue();
for (let i = 0; i < 3; i++) {
drawMini(nextCtx, nextCanvas, queue[i], 45 + i * 90, 20);
}
}

function updateHud() {
scoreEl.textContent = String(score);
bestEl.textContent = String(Math.max(best, score));
linesEl.textContent = String(lines);
levelEl.textContent = String(level);
}

// ---- 遊戲流程 ----
function showOverlay(title, text) {
overlayTitle.textContent = title;
overlayText.textContent = text;
overlayBest.textContent = String(Math.max(best, score));
overlay.classList.remove("hidden");
}
function hideOverlay() { overlay.classList.add("hidden");}

function startGame() {
grid = emptyGrid();
queue = [];
bag = [];
holdType = null;
canHold = true;
score = 0;
lines = 0;
level = 1;
running = true;
paused = false;
gameOver = false;
dropCounter = 0;
lockCounter = 0;
lockResets = 0;
pendingSpawn = false;
clearTimer = 0;
lastTime = 0;
updateHud();
hideOverlay();
pauseBtn.disabled = false;
pauseBtn.textContent = "暫停";
resultText.textContent = "加油，消掉整行得分！";
spawnPiece();
cancelAnimationFrame(dropTimer);
dropTimer = requestAnimationFrame(tick);
}

function endGame() {
gameOver = true;
running = false;
saveBest();
updateHud();
pauseBtn.disabled = true;
resultText.textContent = "遊戲結束！分數 " + score + "、消了 " + lines + " 行、到第 " + level + " 級。";
showOverlay("遊戲結束", "分數：" + score + "\n行數：" + lines + "　等級：" + level + "\n按「重新開始」再玩一次！");
draw();
}

function togglePause() {
if (!running || gameOver) return;
paused =!paused;
pauseBtn.textContent = paused? "繼續": "暫停";
if (paused) {
resultText.textContent = "暫停中，按「繼續」或 P 繼續。";
showOverlay("暫停中", "按「繼續」或 P 繼續玩。");
} else {
resultText.textContent = "繼續加油！";
hideOverlay();
lastTime = 0;
}
draw();
}

function tick(timestamp) {
if (!running) return;
dropTimer = requestAnimationFrame(tick);
if (paused || gameOver) { lastTime = timestamp; return;}
if (!lastTime) lastTime = timestamp;
const dt = timestamp - lastTime;
lastTime = timestamp;
// 消行後先等 CLEAR_MS，再出下一塊
if (pendingSpawn) {
clearTimer += dt;
if (clearTimer >= CLEAR_MS) {
pendingSpawn = false;
spawnPiece();
}
return;
}
if (!current) return;
// 方塊接觸地面：累計鎖定延遲，滿 LOCK_MS 才鎖定
if (collides(current.matrix, current.x, current.y + 1)) {
lockCounter += dt;
dropCounter = 0;
if (lockCounter >= LOCK_MS) {
lockPiece();
draw();
}
return;
}
lockCounter = 0;
dropCounter += dt;
if (dropCounter >= fallInterval()) {
dropCounter = 0;
current.y += 1;
draw();
}
}

// ---- 控制：鍵盤 ----
document.addEventListener("keydown", function (e) {
if (e.key === "p" || e.key === "P" || e.key === "Escape") { togglePause(); return;}
if (!running || paused || gameOver) return;
switch (e.key) {
case "ArrowLeft": e.preventDefault(); move(-1); break;
case "ArrowRight": e.preventDefault(); move(1); break;
case "ArrowDown": e.preventDefault(); softDrop(); break;
case "ArrowUp": e.preventDefault(); rotate(); break;
case "x": case "X": rotate(); break;
case " ": e.preventDefault(); hardDrop(); break;
case "c": case "C": hold(); break;
default: break;
}
});

// ---- 控制：觸控／滑鼠按鈕（平板必備）----
// 按住可連續觸發的按鈕（左、右、軟降）：按下先做一次，之後每 90ms 重複，鬆開停止
function bindHoldButton(id, action) {
const el = document.getElementById(id);
let interval = null;
function start(e) {
e.preventDefault();
action();
clearInterval(interval);
interval = setInterval(action, 90);
}
function stop() { clearInterval(interval); interval = null;}
el.addEventListener("pointerdown", start);
el.addEventListener("pointerup", stop);
el.addEventListener("pointerleave", stop);
el.addEventListener("pointercancel", stop);
el.addEventListener("contextmenu", function (e) { e.preventDefault();});
}
// 按一下觸發一次的按鈕（旋轉、硬降、暫存）
function bindTapButton(id, action) {
const el = document.getElementById(id);
el.addEventListener("pointerdown", function (e) { e.preventDefault(); action();});
el.addEventListener("contextmenu", function (e) { e.preventDefault();});
}
bindHoldButton("leftBtn", function () { move(-1);});
bindHoldButton("rightBtn", function () { move(1);});
bindHoldButton("softBtn", softDrop);
bindTapButton("rotateBtn", rotate);
bindTapButton("hardBtn", hardDrop);
bindTapButton("holdBtn", hold);
bindTapButton("pauseTouchBtn", togglePause);
bindTapButton("restartTouchBtn", startGame);

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);

// ---- 初始畫面 ----
grid = emptyGrid();
updateHud();
bestEl.textContent = String(best);
overlayBest.textContent = String(best);
showOverlay("方塊格子", "按「開始」來玩！");
draw();
