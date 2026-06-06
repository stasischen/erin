// ===== 遊戲設定 =====
// ✏️ 她可以改的地方：球的顏色
const BALL_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

// ✏️ 她可以改的地方：球的大小
const BALL_RADIUS = 16;

// ✏️ 她可以改的地方：小丑手的寬度
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 24;

// ✏️ 她可以改的地方：球掉下來的速度範圍
const MIN_SPEED = 2;
const MAX_SPEED = 5;

// ✏️ 她可以改的地方：多久掉一顆球（毫秒）
const SPAWN_INTERVAL = 1200;

// ✏️ 她可以改的地方：開始有幾條命
const START_LIVES = 3;

// ===== 遊戲狀態 =====
let score = 0;
let lives = START_LIVES;
let combo = 0;
let bestCombo = 0;
let isPlaying = false;
let balls = [];
let catcherX = 0;
let spawnTimer = 0;
let lastTime = 0;

// ===== DOM =====
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const comboEl = document.getElementById("combo");
const startBtn = document.getElementById("startBtn");
const arena = document.getElementById("arena");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===== Canvas 尺寸 =====
function resizeCanvas() {
  const rect = arena.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  catcherX = canvas.width / 2;
}

// ===== 畫小丑 =====
function drawCatcher() {
  const x = catcherX;
  const y = canvas.height - 40;
  const hw = CATCHER_WIDTH / 2;

  // 身體
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 眼睛
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - 10, y - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 10, y - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1e1e1e";
  ctx.beginPath();
  ctx.arc(x - 10, y - 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 10, y - 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // 嘴巴
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + 5, 12, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // 帽子
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(x - 25, y - 25);
  ctx.lineTo(x, y - 55);
  ctx.lineTo(x + 25, y - 25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#991b1b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 手（接球區）
  ctx.fillStyle = "#f97316";
  ctx.fillRect(x - hw, y + 20, CATCHER_WIDTH, CATCHER_HEIGHT);
  ctx.strokeStyle = "#9a3412";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - hw, y + 20, CATCHER_WIDTH, CATCHER_HEIGHT);

  // 手掌
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x - hw, y + 32, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + hw, y + 32, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// ===== 畫球 =====
function drawBall(ball) {
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 閃光
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(ball.x - 4, ball.y - 4, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ===== 畫星星特效 =====
let particles = [];

function spawnParticles(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    particles.push({
      x, y,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      life: 1,
      color,
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ===== 生成球 =====
function spawnBall() {
  const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  balls.push({
    x: BALL_RADIUS + Math.random() * (canvas.width - BALL_RADIUS * 2),
    y: -BALL_RADIUS,
    speed,
    color,
  });
}

// ===== 更新遊戲 =====
function update(dt) {
  if (!isPlaying) return;

  // 生成球
  spawnTimer += dt;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer -= SPAWN_INTERVAL;
    spawnBall();
  }

  // 更新球的位置
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    ball.y += ball.speed;

    // 檢查是否接到
    const catcherY = canvas.height - 40;
    const catcherLeft = catcherX - CATCHER_WIDTH / 2;
    const catcherRight = catcherX + CATCHER_WIDTH / 2;

    if (ball.y + BALL_RADIUS >= catcherY + 20 &&
        ball.y - BALL_RADIUS <= catcherY + 20 + CATCHER_HEIGHT &&
        ball.x >= catcherLeft &&
        ball.x <= catcherRight) {
      // 接到了！
      score += 10 + combo * 2;
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      scoreEl.textContent = score;
      comboEl.textContent = combo;
      spawnParticles(ball.x, ball.y, ball.color);
      balls.splice(i, 1);
      continue;
    }

    // 檢查是否掉出去
    if (ball.y - BALL_RADIUS > canvas.height) {
      balls.splice(i, 1);
      lives--;
      combo = 0;
      livesEl.textContent = lives;
      comboEl.textContent = combo;

      if (lives <= 0) {
        gameOver();
        return;
      }
    }
  }

  updateParticles(dt);
}

// ===== 畫面 =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景星星
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (let i = 0; i < 20; i++) {
    const x = (i * 137.5) % canvas.width;
    const y = (i * 97.3) % canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const ball of balls) drawBall(ball);
  drawParticles();
  drawCatcher();
}

// ===== 遊戲迴圈 =====
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  update(dt);
  draw();

  if (isPlaying) {
    requestAnimationFrame(gameLoop);
  }
}

// ===== 開始遊戲 =====
function startGame() {
  score = 0;
  lives = START_LIVES;
  combo = 0;
  bestCombo = 0;
  balls = [];
  particles = [];
  spawnTimer = 0;
  lastTime = 0;
  isPlaying = true;

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  comboEl.textContent = combo;
  statusEl.textContent = "接住掉下來的球！";
  startBtn.disabled = true;
  startBtn.textContent = "🎮 遊戲中…";

  requestAnimationFrame(gameLoop);
}

// ===== 遊戲結束 =====
function gameOver() {
  isPlaying = false;
  statusEl.textContent = `遊戲結束！分數：${score}，最佳連接：${bestCombo}`;
  startBtn.disabled = false;
  startBtn.textContent = "▶ 再玩一次";
}

// ===== 控制小丑移動 =====
function moveCatcher(clientX) {
  const rect = arena.getBoundingClientRect();
  const x = clientX - rect.left;
  const scaleX = canvas.width / rect.width;
  catcherX = Math.max(CATCHER_WIDTH / 2, Math.min(canvas.width - CATCHER_WIDTH / 2, x * scaleX));
}

// 滑鼠
arena.addEventListener("mousemove", (e) => {
  if (!isPlaying) return;
  moveCatcher(e.clientX);
});

// 觸控
arena.addEventListener("touchmove", (e) => {
  if (!isPlaying) return;
  e.preventDefault();
  moveCatcher(e.touches[0].clientX);
}, { passive: false });

arena.addEventListener("touchstart", (e) => {
  if (!isPlaying) return;
  e.preventDefault();
  moveCatcher(e.touches[0].clientX);
}, { passive: false });

// 按鈕
startBtn.addEventListener("click", startGame);

// 初始化
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
draw();
