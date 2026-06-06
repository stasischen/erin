// ===== 遊戲設定 =====
// ✏️ 車道數量
const LANES = 5;

// ✏️ 初始速度（越大越快）
let gameSpeed = 3;

// ✏️ 加速間隔（每幀增加多少速度）
const SPEED_UP = 0.001;

// ✏️ 障礙物出現頻率（越小越頻繁）
const OBSTACLE_INTERVAL = 60;

// ✏️ 道具出現頻率
const ITEM_INTERVAL = 200;

// ✏️ 生命數
const START_LIVES = 3;

// ✏️ 顏色
const CAR_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316"];
const OBSTACLE_COLORS = ["#6b7280", "#374151", "#1f2937"];

// ===== 遊戲狀態 =====
let isPlaying = false;
let score = 0;
let lives = START_LIVES;
let gameTime = 0;
let playerLane = 2; // 中間車道
let targetLane = 2;
let playerX = 0;
let playerY = 0;
let obstacles = []; // { x, y, lane, type }
let items = []; // { x, y, lane, type }
let roadLines = []; // { y }
let obstacleTimer = 0;
let itemTimer = 0;
let invincibleTimer = 0;
let slowTimer = 0;

// ===== DOM =====
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");
const arena = document.getElementById("arena");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===== 觸控 =====
const touchState = { left: false, right: false };

// ===== Canvas =====
function resizeCanvas() {
  const rect = arena.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  playerY = canvas.height - 100;
}

// ===== 取得車道 X 座標 =====
function getLaneX(lane) {
  const roadLeft = canvas.width * 0.1;
  const roadRight = canvas.width * 0.9;
  const roadWidth = roadRight - roadLeft;
  const laneWidth = roadWidth / LANES;
  return roadLeft + laneWidth * lane + laneWidth / 2;
}

// ===== 取得車道寬度 =====
function getLaneWidth() {
  const roadLeft = canvas.width * 0.1;
  const roadRight = canvas.width * 0.9;
  return (roadRight - roadLeft) / LANES;
}

// ===== 畫路面 =====
function drawRoad() {
  // 草地
  ctx.fillStyle = "#2d5a27";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 路面
  const roadLeft = canvas.width * 0.1;
  const roadRight = canvas.width * 0.9;
  ctx.fillStyle = "#555";
  ctx.fillRect(roadLeft, 0, roadRight - roadLeft, canvas.height);

  // 車道線
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  for (let i = 1; i < LANES; i++) {
    const x = getLaneX(i) - getLaneWidth() / 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 路邊線
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(roadLeft, 0);
  ctx.lineTo(roadLeft, canvas.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(roadRight, 0);
  ctx.lineTo(roadRight, canvas.height);
  ctx.stroke();
}

// ===== 畫玩家車子 =====
function drawPlayerCar() {
  const x = playerX;
  const y = playerY;
  const w = getLaneWidth() * 0.7;
  const h = w * 1.3;

  // 無敵閃爍
  if (invincibleTimer > 0 && Math.floor(gameTime / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // 車身
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill();
  ctx.strokeStyle = "#991b1b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 車窗
  ctx.fillStyle = "rgba(150,220,255,0.8)";
  ctx.fillRect(x - w * 0.3, y - h * 0.35, w * 0.6, h * 0.2);

  // 車燈
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(x - w * 0.35, y - h * 0.5, w * 0.2, h * 0.08);
  ctx.fillRect(x + w * 0.15, y - h * 0.5, w * 0.2, h * 0.08);

  // 尾燈
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(x - w * 0.35, y + h * 0.42, w * 0.2, h * 0.08);
  ctx.fillRect(x + w * 0.15, y + h * 0.42, w * 0.2, h * 0.08);

  ctx.globalAlpha = 1;
}

// ===== 畫障礙物 =====
function drawObstacle(ob) {
  const w = getLaneWidth() * 0.6;
  const h = w * 1.2;

  ctx.fillStyle = ob.color;
  ctx.beginPath();
  ctx.rect(ob.x - w / 2, ob.y - h / 2, w, h);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 車窗
  ctx.fillStyle = "rgba(100,100,100,0.5)";
  ctx.fillRect(ob.x - w * 0.3, ob.y - h * 0.3, w * 0.6, h * 0.15);
}

// ===== 畫道具 =====
function drawItem(item) {
  ctx.font = "28px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.emoji, item.x, item.y);

  // 光暈
  ctx.strokeStyle = "rgba(251,191,36,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(item.x, item.y, 18, 0, Math.PI * 2);
  ctx.stroke();
}

// ===== 畫生命 =====
function drawLives() {
  for (let i = 0; i < lives; i++) {
    ctx.font = "20px serif";
    ctx.fillText("❤️", 20 + i * 28, 30);
  }
}

// ===== 畫分數 =====
function drawScore() {
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText(`分數：${score}`, canvas.width - 20, 30);
}

// ===== 生成障礙物 =====
function spawnObstacle() {
  const lane = Math.floor(Math.random() * LANES);
  const color = OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)];
  obstacles.push({
    x: getLaneX(lane),
    y: -50,
    lane,
    color,
  });
}

// ===== 生成道具 =====
function spawnItem() {
  const lane = Math.floor(Math.random() * LANES);
  const types = [
    { emoji: "⭐", type: "star" },
    { emoji: "🛡️", type: "shield" },
    { emoji: "🐢", type: "slow" },
  ];
  const t = types[Math.floor(Math.random() * types.length)];
  items.push({
    x: getLaneX(lane),
    y: -50,
    lane,
    ...t,
  });
}

// ===== 更新遊戲 =====
function update() {
  if (!isPlaying) return;

  gameTime++;

  // 加速
  gameSpeed += SPEED_UP;

  // 無敵計時
  if (invincibleTimer > 0) invincibleTimer--;
  if (slowTimer > 0) {
    slowTimer--;
    if (slowTimer <= 0) gameSpeed = 3 + gameTime * SPEED_UP;
  }

  // 移動玩家到目標車道
  const targetX = getLaneX(targetLane);
  playerX += (targetX - playerX) * 0.15;
  playerLane = targetLane;

  // 生成障礙物
  obstacleTimer++;
  if (obstacleTimer >= OBSTACLE_INTERVAL) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  // 生成道具
  itemTimer++;
  if (itemTimer >= ITEM_INTERVAL) {
    spawnItem();
    itemTimer = 0;
  }

  // 更新障礙物
  const currentSpeed = slowTimer > 0 ? gameSpeed * 0.5 : gameSpeed;
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y += currentSpeed;
    if (obstacles[i].y > canvas.height + 50) {
      obstacles.splice(i, 1);
      score += 10;
      scoreEl.textContent = score;
    }
  }

  // 更新道具
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].y += currentSpeed;
    if (items[i].y > canvas.height + 50) {
      items.splice(i, 1);
    }
  }

  // 碰撞檢測：障礙物
  const carW = getLaneWidth() * 0.7;
  const carH = carW * 1.3;
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    const obW = getLaneWidth() * 0.6;
    const obH = obW * 1.2;

    if (invincibleTimer <= 0 &&
        Math.abs(playerX - ob.x) < (carW + obW) / 2 * 0.8 &&
        Math.abs(playerY - ob.y) < (carH + obH) / 2 * 0.8) {
      // 撞到了！
      lives--;
      livesEl.textContent = lives;
      invincibleTimer = 90; // 1.5秒無敵
      obstacles.splice(i, 1);

      if (lives <= 0) {
        gameOver();
        return;
      }
    }
  }

  // 碰撞檢測：道具
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (Math.abs(playerX - item.x) < carW * 0.8 &&
        Math.abs(playerY - item.y) < carH * 0.8) {
      // 吃到道具
      switch (item.type) {
        case "star":
          score += 100;
          scoreEl.textContent = score;
          break;
        case "shield":
          invincibleTimer = 180; // 3秒無敵
          break;
        case "slow":
          slowTimer = 180; // 3秒減速
          gameSpeed = 2;
          break;
      }
      items.splice(i, 1);
    }
  }
}

// ===== 畫面 =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();

  // 畫道具
  for (const item of items) drawItem(item);

  // 畫障礙物
  for (const ob of obstacles) drawObstacle(ob);

  // 畫玩家
  drawPlayerCar();

  // 畫 HUD
  drawLives();
  drawScore();

  // 減速效果
  if (slowTimer > 0) {
    ctx.fillStyle = "rgba(59,130,246,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ===== 遊戲迴圈 =====
function gameLoop() {
  update();
  draw();
  if (isPlaying) {
    requestAnimationFrame(gameLoop);
  }
}

// ===== 開始遊戲 =====
function startGame() {
  isPlaying = true;
  score = 0;
  lives = START_LIVES;
  gameTime = 0;
  gameSpeed = 3;
  playerLane = 2;
  targetLane = 2;
  playerX = getLaneX(2);
  obstacles = [];
  items = [];
  obstacleTimer = 0;
  itemTimer = 0;
  invincibleTimer = 0;
  slowTimer = 0;

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  statusEl.textContent = "閃避來車！";
  startBtn.disabled = true;
  startBtn.textContent = "🚗 遊戲中…";

  requestAnimationFrame(gameLoop);
}

// ===== 遊戲結束 =====
function gameOver() {
  isPlaying = false;
  statusEl.textContent = `遊戲結束！分數：${score}`;
  startBtn.disabled = false;
  startBtn.textContent = "▶ 再玩一次";
}

// ===== 控制 =====
function moveLeft() {
  if (targetLane > 0) targetLane--;
}

function moveRight() {
  if (targetLane < LANES - 1) targetLane++;
}

// 鍵盤
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft": case "a": case "A":
      moveLeft(); break;
    case "ArrowRight": case "d": case "D":
      moveRight(); break;
  }
});

// 觸控：點擊螢幕左半/右半
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const x = e.touches[0].clientX;
  const rect = arena.getBoundingClientRect();
  if (x < rect.left + rect.width / 2) {
    moveLeft();
  } else {
    moveRight();
  }
}, { passive: false });

canvas.addEventListener("click", (e) => {
  const x = e.clientX;
  const rect = arena.getBoundingClientRect();
  if (x < rect.left + rect.width / 2) {
    moveLeft();
  } else {
    moveRight();
  }
});

// 觸控按鈕
const turnLeftBtn = document.getElementById("turnLeft");
const turnRightBtn = document.getElementById("turnRight");

if (turnLeftBtn) {
  turnLeftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveLeft(); }, { passive: false });
  turnLeftBtn.addEventListener("click", moveLeft);
}
if (turnRightBtn) {
  turnRightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveRight(); }, { passive: false });
  turnRightBtn.addEventListener("click", moveRight);
}

// 按鈕
startBtn.addEventListener("click", startGame);

// 初始化
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
playerX = getLaneX(2);
draw();
