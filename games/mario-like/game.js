const arena = document.getElementById("arena");
const world = document.getElementById("world");
const player = document.getElementById("player");
const coinCountEl = document.getElementById("coinCount");
const scoreEl = document.getElementById("score");
const resetBtn = document.getElementById("resetBtn");

// 角色設定
const playerWidth = 36;
const playerHeight = 48;
let px = 80;
let py = 0;
let vy = 0;
let onGround = false;
let moveLeft = false;
let moveRight = false;
let jumping = false;

const coins = [];
const platforms = [];
let score = 0;
let coinCount = 0;
let loopId = 0;

const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const MOVE_SPEED = 4;
const GROUND_Y = 350;
const LEVEL_HEIGHT = 400;

// 關卡設計：地面 + 平台 + 金幣
function buildLevel() {
  // 地面
  platforms.length = 0;
  platforms.push({ x: 0, y: GROUND_Y, w: 800, h: 50 });

  // 浮空平台（x, y, 寬度）
  const platformDefs = [
    { x: 120, y: 280, w: 80 },
    { x: 260, y: 220, w: 60 },
    { x: 380, y: 260, w: 80 },
    { x: 520, y: 200, w: 60 },
    { x: 640, y: 280, w: 80 },
  ];
  for (const p of platformDefs) {
    platforms.push({ x: p.x, y: p.y, w: p.w, h: 16 });
  }

  // 金幣
  coins.length = 0;
  const coinPositions = [
    { x: 140, y: 250 }, { x: 180, y: 250 },
    { x: 290, y: 190 }, { x: 330, y: 190 },
    { x: 410, y: 230 }, { x: 450, y: 230 },
    { x: 550, y: 170 }, { x: 590, y: 170 },
    { x: 670, y: 250 }, { x: 710, y: 250 },
  ];
  for (const c of coinPositions) {
    coins.push({ x: c.x, y: c.y, w: 20, h: 20, collected: false });
  }
}

// 重設角色位置
function resetPlayer() {
  px = 80;
  py = 0;
  vy = 0;
  onGround = false;
  moveLeft = false;
  moveRight = false;
  jumping = false;
}

function resetGame() {
  resetPlayer();
  buildLevel();
  score = 0;
  coinCount = 0;
  coinCountEl.textContent = "0";
  scoreEl.textContent = "0";
}

// Canvas 繪圖
function setupCanvas() {
  world.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = LEVEL_HEIGHT;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  world.appendChild(canvas);
  return canvas;
}

let canvas, ctx;

function init() {
  buildLevel();
  resetPlayer();
  canvas = setupCanvas();
  ctx = canvas.getContext("2d");
  loopId = requestAnimationFrame(gameLoop);
}

function drawPlayer() {
  const cx = px + playerWidth / 2;
  const cy = py + playerHeight / 2;
  const r = 16;

  // 身體（圓形）
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ef4444";
  ctx.fill();
  ctx.strokeStyle = "#b91c1c";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 眼睛
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 5, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#1e1e1e";
  ctx.fill();
}

function drawPlatforms() {
  for (const p of platforms) {
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    // 上面的草皮
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(p.x, p.y, p.w, 4);
  }
}

function drawCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#facc15";
    ctx.fill();
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 2;
    ctx.stroke();
    // 閃光
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2 - 3, c.y + c.h / 2 - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fffec4";
    ctx.fill();
  }
}

function drawBackground() {
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, 800, LEVEL_HEIGHT);
  // 雲朵
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(100, 50, 30, 0, Math.PI * 2);
  ctx.arc(140, 50, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(500, 80, 26, 0, Math.PI * 2);
  ctx.arc(540, 80, 20, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  // 水平移動
  if (moveLeft) px -= MOVE_SPEED;
  if (moveRight) px += MOVE_SPEED;
  px = Math.max(0, Math.min(750, px));

  // 重力
  vy += GRAVITY;
  py += vy;

  // 平台碰撞
  onGround = false;
  for (const p of platforms) {
    const playerLeft = px;
    const playerRight = px + playerWidth;
    const playerBottom = py + playerHeight;
    const platTop = p.y;
    const platLeft = p.x;
    const platRight = p.x + p.w;

    if (playerRight > platLeft && playerLeft < platRight &&
        playerBottom >= platTop && playerBottom <= platTop + 12 &&
        vy >= 0) {
      py = platTop - playerHeight;
      vy = 0;
      onGround = true;
    }
  }

  // 掉到畫面外就重設
  if (py > LEVEL_HEIGHT + 50) {
    resetPlayer();
    py = GROUND_Y - playerHeight;
    vy = 0;
    onGround = true;
  }

  // 金幣收集
  for (const c of coins) {
    if (c.collected) continue;
    const playerCenterX = px + playerWidth / 2;
    const playerCenterY = py + playerHeight / 2;
    const coinCenterX = c.x + c.w / 2;
    const coinCenterY = c.y + c.h / 2;
    const dist = Math.sqrt(
      (playerCenterX - coinCenterX) ** 2 +
      (playerCenterY - coinCenterY) ** 2
    );
    if (dist < 24) {
      c.collected = true;
      coinCount += 1;
      score += 50;
      coinCountEl.textContent = String(coinCount);
      scoreEl.textContent = String(score);
    }
  }

  // 跳躍
  if (jumping && onGround) {
    vy = JUMP_FORCE;
    onGround = false;
    jumping = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, 800, LEVEL_HEIGHT);
  drawBackground();
  drawPlatforms();
  drawCoins();
  drawPlayer();
}

function gameLoop() {
  update();
  draw();
  loopId = requestAnimationFrame(gameLoop);
}

// 控制
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft = true;
  if (e.key === "ArrowRight") moveRight = true;
  if (e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
    jumping = true;
  }
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") moveLeft = false;
  if (e.key === "ArrowRight") moveRight = false;
});

resetBtn.addEventListener("click", () => {
  resetGame();
});

// 觸控支援
function setupTouch() {
  let touchLeft = false;
  let touchRight = false;

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      jumping = true;
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
  });
}

// 開始
init();
