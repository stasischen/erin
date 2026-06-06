// ===== 遊戲設定 =====
// ✏️ 可自訂：賽道參數
const TRACK_POINTS = 60; // 賽道控制點數量
const ROAD_WIDTH = 80;   // 路寬
const LAPS_TO_WIN = 3;   // 幾圈完成

// ✏️ 可自訂：車輛參數
const CAR_ACCEL = 0.15;   // 加速度
const CAR_BRAKE = 0.1;    // 煞車力
const CAR_FRICTION = 0.98; // 摩擦力（越大滑越遠）
const CAR_TURN_SPEED = 0.04; // 轉向速度
const MAX_SPEED = 4;       // 最高速度
const GRASS_PENALTY = 0.6; // 草地減速倍率

// ✏️ 可自訂：AI 數量
const AI_COUNT = 3;

// ✏️ 可自訂：道具出現間隔（幀數）
const ITEM_SPAWN_INTERVAL = 180;

// ===== 道具定義 =====
const ITEM_TYPES = [
  { id: "mushroom", emoji: "🍄", name: "蘑菇", duration: 90 },
  { id: "star", emoji: "⭐", name: "星星", duration: 120 },
  { id: "banana", emoji: "🍌", name: "香蕉皮", duration: 0 },
  { id: "bomb", emoji: "💣", name: "炸彈", duration: 0 },
];

// ===== 遊戲狀態 =====
let isPlaying = false;
let isFinished = false;
let gameTime = 0;
let itemCountdown = 0;
let bestTime = Infinity;

// ===== 賽道 =====
let trackCenter = []; // 賽道中心線點
let trackNormals = []; // 法線方向

// ===== 車輛 =====
class Car {
  constructor(color, isPlayer = false) {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.speed = 0;
    this.color = color;
    this.isPlayer = isPlayer;
    this.lap = 0;
    this.lastCheckpoint = 0;
    this.checkpointProgress = 0;
    this.item = null;
    this.itemTimer = 0;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.isBoosted = false;
    this.boostTimer = 0;
    this.stunTimer = 0;
    this.rank = 0;
  }
}

let player;
let aiCars = [];
let allCars = [];

// ===== 道具 =====
let items = [];
let bananas = []; // 地上的香蕉皮

// ===== 特效 =====
let particles = [];

// ===== DOM =====
const statusEl = document.getElementById("status");
const lapEl = document.getElementById("lap");
const timeEl = document.getElementById("time");
const positionEl = document.getElementById("position");
const startBtn = document.getElementById("startBtn");
const arena = document.getElementById("arena");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const itemSlot = document.getElementById("itemSlot");

// ===== 觸控狀態 =====
const touchState = {
  left: false,
  right: false,
  accel: false,
  brake: false,
};

// ===== Canvas 尺寸 =====
function resizeCanvas() {
  const rect = arena.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

// ===== 生成賽道 =====
function generateTrack() {
  trackCenter = [];
  trackNormals = [];

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const rx = canvas.width * 0.35; // 水平半徑
  const ry = canvas.height * 0.3; // 垂直半徑

  for (let i = 0; i < TRACK_POINTS; i++) {
    const angle = (Math.PI * 2 * i) / TRACK_POINTS;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    trackCenter.push({ x, y });
  }

  // 計算法線
  for (let i = 0; i < TRACK_POINTS; i++) {
    const next = trackCenter[(i + 1) % TRACK_POINTS];
    const prev = trackCenter[(i - 1 + TRACK_POINTS) % TRACK_POINTS];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    trackNormals.push({ x: -dy / len, y: dx / len });
  }
}

// ===== 找最近的賽道點 =====
function getClosestTrackPoint(x, y) {
  let minDist = Infinity;
  let closestIdx = 0;

  for (let i = 0; i < TRACK_POINTS; i++) {
    const dx = x - trackCenter[i].x;
    const dy = y - trackCenter[i].y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }

  return { idx: closestIdx, dist: Math.sqrt(minDist) };
}

// ===== 判斷是否在賽道上 =====
function isOnRoad(x, y) {
  const { dist } = getClosestTrackPoint(x, y);
  return dist < ROAD_WIDTH / 2;
}

// ===== 初始化車輛 =====
function initCars() {
  const startAngle = -Math.PI / 2; // 從上方開始
  const startX = trackCenter[0].x;
  const startY = trackCenter[0].y;

  // 玩家
  player = new Car("#ef4444", true);
  player.x = startX;
  player.y = startY + 20;
  player.angle = startAngle;

  // AI
  aiCars = [];
  const aiColors = ["#3b82f6", "#22c55e", "#a855f7"];
  for (let i = 0; i < AI_COUNT; i++) {
    const car = new Car(aiColors[i]);
    car.x = startX + (i + 1) * 30 - 30;
    car.y = startY + 20 + (i + 1) * 25;
    car.angle = startAngle;
    car.aiTarget = 0;
    car.aiSpeed = 2 + Math.random() * 0.5;
    aiCars.push(car);
  }

  allCars = [player, ...aiCars];
}

// ===== 畫車子 =====
function drawCar(car) {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle + Math.PI / 2);

  // 無敵閃爍
  if (car.isInvincible && Math.floor(gameTime / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // 車身
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.roundRect(-10, -16, 20, 32, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 車窗
  ctx.fillStyle = "rgba(150,220,255,0.7)";
  ctx.fillRect(-6, -10, 12, 8);

  // 車燈
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(-7, 12, 5, 4);
  ctx.fillRect(2, 12, 5, 4);

  // 玩家標記
  if (car.isPlayer) {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, -12, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 加速特效
  if (car.isBoosted) {
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(-5, 16);
    ctx.lineTo(5, 16);
    ctx.lineTo(0, 24 + Math.random() * 6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ===== 畫賽道 =====
function drawTrack() {
  // 草地背景
  ctx.fillStyle = "#2d5a27";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 草地紋理
  ctx.fillStyle = "#3a6b32";
  for (let i = 0; i < 40; i++) {
    const x = (i * 137.5) % canvas.width;
    const y = (i * 97.3) % canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 賽道路面
  ctx.strokeStyle = "#555";
  ctx.lineWidth = ROAD_WIDTH + 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(trackCenter[0].x, trackCenter[0].y);
  for (let i = 1; i <= TRACK_POINTS; i++) {
    const p = trackCenter[i % TRACK_POINTS];
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 路面
  ctx.strokeStyle = "#666";
  ctx.lineWidth = ROAD_WIDTH;
  ctx.beginPath();
  ctx.moveTo(trackCenter[0].x, trackCenter[0].y);
  for (let i = 1; i <= TRACK_POINTS; i++) {
    const p = trackCenter[i % TRACK_POINTS];
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  // 車道線（虛線）
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(trackCenter[0].x, trackCenter[0].y);
  for (let i = 1; i <= TRACK_POINTS; i++) {
    const p = trackCenter[i % TRACK_POINTS];
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // 起跑線
  const startP = trackCenter[0];
  const startN = trackNormals[0];
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(startP.x + startN.x * ROAD_WIDTH / 2, startP.y + startN.y * ROAD_WIDTH / 2);
  ctx.lineTo(startP.x - startN.x * ROAD_WIDTH / 2, startP.y - startN.y * ROAD_WIDTH / 2);
  ctx.stroke();

  // 起跑線格子紋
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    if (i % 2 === 0) {
      const t = i / steps;
      const t2 = (i + 1) / steps;
      const x1 = startP.x + startN.x * ROAD_WIDTH / 2 * (1 - 2 * t);
      const y1 = startP.y + startN.y * ROAD_WIDTH / 2 * (1 - 2 * t);
      const x2 = startP.x + startN.x * ROAD_WIDTH / 2 * (1 - 2 * t2);
      const y2 = startP.y + startN.y * ROAD_WIDTH / 2 * (1 - 2 * t2);
      ctx.fillStyle = "#333";
      ctx.fillRect(x1 - 3, y1 - 3, 6, 6);
    }
  }
}

// ===== 畫道具 =====
function drawItems() {
  for (const item of items) {
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.emoji, item.x, item.y);

    // 光暈
    ctx.strokeStyle = "rgba(251,191,36,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 地上的香蕉皮
  for (const banana of bananas) {
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", banana.x, banana.y);
  }
}

// ===== 畫特效 =====
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ===== 生成道具 =====
function spawnItem() {
  const idx = Math.floor(Math.random() * TRACK_POINTS);
  const p = trackCenter[idx];
  const n = trackNormals[idx];
  const offset = (Math.random() - 0.5) * ROAD_WIDTH * 0.5;

  const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

  items.push({
    x: p.x + n.x * offset,
    y: p.y + n.y * offset,
    ...type,
  });
}

// ===== 粒子特效 =====
function spawnParticles(x, y, color, count = 6) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * 2,
      vy: Math.sin(angle) * 2,
      life: 1,
      color,
      size: 3 + Math.random() * 3,
    });
  }
}

// ===== 更新粒子 =====
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ===== 更新玩家 =====
function updatePlayer() {
  if (player.stunTimer > 0) {
    player.stunTimer--;
    player.speed *= 0.9;
    return;
  }

  // 轉向
  if (keys.left || touchState.left) {
    player.angle -= CAR_TURN_SPEED * (player.speed / MAX_SPEED);
  }
  if (keys.right || touchState.right) {
    player.angle += CAR_TURN_SPEED * (player.speed / MAX_SPEED);
  }

  // 加速
  let accel = 0;
  if (keys.up || touchState.accel) {
    accel = CAR_ACCEL;
  }
  if (keys.down || touchState.brake) {
    accel = -CAR_BRAKE;
  }

  // 道具效果
  if (player.isBoosted) {
    accel *= 1.5;
    player.boostTimer--;
    if (player.boostTimer <= 0) player.isBoosted = false;
  }
  if (player.isInvincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) player.isInvincible = false;
  }

  // 應用加速度
  player.speed += accel;

  // 草地減速
  if (!isOnRoad(player.x, player.y)) {
    player.speed *= GRASS_PENALTY;
  }

  // 摩擦力
  player.speed *= CAR_FRICTION;

  // 限制速度
  const maxSpd = player.isBoosted ? MAX_SPEED * 1.5 : MAX_SPEED;
  player.speed = Math.max(-MAX_SPEED * 0.3, Math.min(maxSpd, player.speed));

  // 移動
  player.x += Math.cos(player.angle) * player.speed;
  player.y += Math.sin(player.angle) * player.speed;

  // 邊界限制
  player.x = Math.max(10, Math.min(canvas.width - 10, player.x));
  player.y = Math.max(10, Math.min(canvas.height - 10, player.y));
}

// ===== 更新 AI =====
function updateAI(car) {
  if (car.stunTimer > 0) {
    car.stunTimer--;
    car.speed *= 0.9;
    return;
  }

  // 目標點
  const target = trackCenter[car.aiTarget];
  const dx = target.x - car.x;
  const dy = target.y - car.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // 轉向目標
  const targetAngle = Math.atan2(dy, dx);
  let angleDiff = targetAngle - car.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  car.angle += angleDiff * 0.08;

  // 速度控制
  const turnFactor = 1 - Math.abs(angleDiff) / Math.PI;
  car.speed = car.aiSpeed * turnFactor;

  // 加速效果
  if (car.isBoosted) {
    car.speed *= 1.5;
    car.boostTimer--;
    if (car.boostTimer <= 0) car.isBoosted = false;
  }
  if (car.isInvincible) {
    car.invincibleTimer--;
    if (car.invincibleTimer <= 0) car.isInvincible = false;
  }

  // 移動
  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;

  // 到達目標點，前往下一個
  if (dist < 30) {
    car.aiTarget = (car.aiTarget + 1) % TRACK_POINTS;
  }

  // 撿道具（AI 偶爾會撿）
  if (Math.random() < 0.01 && !car.item) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const d = Math.hypot(item.x - car.x, item.y - car.y);
      if (d < 30) {
        car.item = item;
        items.splice(i, 1);
        break;
      }
    }
  }
}

// ===== 更新圈數 =====
function updateLap(car) {
  const { idx } = getClosestTrackPoint(car.x, car.y);

  // 檢查是否通過檢查點
  if (idx >= TRACK_POINTS * 0.75 && car.lastCheckpoint < TRACK_POINTS * 0.75) {
    car.checkpointProgress = 1;
  }

  // 檢查是否通過起跑線
  if (idx < TRACK_POINTS * 0.1 && car.lastCheckpoint >= TRACK_POINTS * 0.75 && car.checkpointProgress) {
    car.lap++;
    car.checkpointProgress = 0;

    if (car.isPlayer) {
      lapEl.textContent = car.lap;
      spawnParticles(car.x, car.y, "#fbbf24", 10);

      if (car.lap >= LAPS_TO_WIN) {
        finishRace();
      }
    }
  }

  car.lastCheckpoint = idx;
}

// ===== 碰撞偵測 =====
function checkCollisions() {
  // 車對車
  for (let i = 0; i < allCars.length; i++) {
    for (let j = i + 1; j < allCars.length; j++) {
      const a = allCars[i];
      const b = allCars[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 24) {
        // 推開
        const nx = dx / dist;
        const ny = dy / dist;
        a.x += nx * 2;
        a.y += ny * 2;
        b.x -= nx * 2;
        b.y -= ny * 2;

        // 無敵車撞人
        if (a.isInvincible && !b.isInvincible) {
          b.stunTimer = 30;
          b.speed = 0;
          spawnParticles(b.x, b.y, "#fbbf24");
        } else if (b.isInvincible && !a.isInvincible) {
          a.stunTimer = 30;
          a.speed = 0;
          spawnParticles(a.x, a.y, "#fbbf24");
        } else {
          // 一般碰撞
          a.speed *= 0.5;
          b.speed *= 0.5;
          spawnParticles((a.x + b.x) / 2, (a.y + b.y) / 2, "#fff", 4);
        }
      }
    }
  }

  // 玩家撿道具
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const dx = item.x - player.x;
    const dy = item.y - player.y;
    if (Math.sqrt(dx * dx + dy * dy) < 24) {
      if (!player.item) {
        player.item = item;
        itemSlot.textContent = item.emoji;
        items.splice(i, 1);
        spawnParticles(item.x, item.y, "#fbbf24");
      }
    }
  }

  // 香蕉皮
  for (let i = bananas.length - 1; i >= 0; i--) {
    const banana = bananas[i];
    for (const car of allCars) {
      if (car.isInvincible) continue;
      const dx = banana.x - car.x;
      const dy = banana.y - car.y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        car.stunTimer = 40;
        car.speed *= 0.2;
        spawnParticles(banana.x, banana.y, "#fbbf24");
        bananas.splice(i, 1);
        break;
      }
    }
  }
}

// ===== 使用道具 =====
function useItem() {
  if (!player.item) return;

  const item = player.item;
  player.item = null;
  itemSlot.textContent = "?";

  switch (item.id) {
    case "mushroom":
      player.isBoosted = true;
      player.boostTimer = item.duration;
      spawnParticles(player.x, player.y, "#f97316", 8);
      break;

    case "star":
      player.isInvincible = true;
      player.invincibleTimer = item.duration;
      spawnParticles(player.x, player.y, "#fbbf24", 12);
      break;

    case "banana":
      bananas.push({
        x: player.x - Math.cos(player.angle) * 30,
        y: player.y - Math.sin(player.angle) * 30,
      });
      break;

    case "bomb":
      // 往前方丟
      const bombX = player.x + Math.cos(player.angle) * 80;
      const bombY = player.y + Math.sin(player.angle) * 80;
      spawnParticles(bombX, bombY, "#ef4444", 15);

      // 命中檢測
      for (const car of allCars) {
        if (car === player) continue;
        const dx = bombX - car.x;
        const dy = bombY - car.y;
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
          car.stunTimer = 60;
          car.speed = 0;
          spawnParticles(car.x, car.y, "#ef4444", 10);
        }
      }
      break;
  }
}

// ===== 計算排名 =====
function updateRanking() {
  // 用圈數和賽道位置計算進度
  for (const car of allCars) {
    const { idx } = getClosestTrackPoint(car.x, car.y);
    car.rank = car.lap * TRACK_POINTS + idx;
  }

  // 排序
  const sorted = [...allCars].sort((a, b) => b.rank - a.rank);
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].position = i + 1;
  }

  positionEl.textContent = player.position;
}

// ===== 計時 =====
function formatTime(frames) {
  const seconds = Math.floor(frames / 60);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ===== 遊戲結束 =====
function finishRace() {
  isFinished = true;
  isPlaying = false;

  const time = gameTime;
  if (time < bestTime) bestTime = time;

  const pos = player.position;
  let msg = "";
  if (pos === 1) msg = "🏆 冠軍！太棒了！";
  else if (pos === 2) msg = "🥈 第二名！好厲害！";
  else if (pos === 3) msg = "🥉 第三名！不錯喔！";
  else msg = `第 ${pos} 名，再試試！`;

  statusEl.textContent = `${msg} 時間：${formatTime(time)}`;
  startBtn.disabled = false;
  startBtn.textContent = "▶ 再來一場";
}

// ===== 遊戲迴圈 =====
function gameLoop() {
  if (!isPlaying) return;

  gameTime++;

  // 更新玩家
  updatePlayer();

  // 更新 AI
  for (const car of aiCars) {
    updateAI(car);
  }

  // 更新圈數
  for (const car of allCars) {
    updateLap(car);
  }

  // 碰撞
  checkCollisions();

  // 排名
  updateRanking();

  // 計時
  timeEl.textContent = formatTime(gameTime);

  // 道具生成
  itemCountdown++;
  if (itemCountdown >= ITEM_SPAWN_INTERVAL && items.length < 5) {
    spawnItem();
    itemCountdown = 0;
  }

  // 更新粒子
  updateParticles();

  // AI 使用道具
  for (const car of aiCars) {
    if (car.item && Math.random() < 0.02) {
      // AI 簡單使用道具
      if (car.item.id === "mushroom") {
        car.isBoosted = true;
        car.boostTimer = car.item.duration;
      } else if (car.item.id === "star") {
        car.isInvincible = true;
        car.invincibleTimer = car.item.duration;
      } else if (car.item.id === "banana") {
        bananas.push({ x: car.x, y: car.y });
      } else if (car.item.id === "bomb") {
        // 往玩家方向丟
        const dx = player.x - car.x;
        const dy = player.y - car.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          player.stunTimer = 40;
          player.speed = 0;
          spawnParticles(player.x, player.y, "#ef4444", 10);
        }
      }
      car.item = null;
    }
  }

  // 繪製
  draw();

  requestAnimationFrame(gameLoop);
}

// ===== 繪製 =====
function draw() {
  drawTrack();
  drawItems();
  drawParticles();

  // 畫所有車（玩家最後畫，在最上層）
  for (const car of aiCars) drawCar(car);
  drawCar(player);
}

// ===== 開始遊戲 =====
function startGame() {
  isPlaying = true;
  isFinished = false;
  gameTime = 0;
  itemCountdown = 0;
  items = [];
  bananas = [];
  particles = [];

  generateTrack();
  initCars();

  lapEl.textContent = "0";
  timeEl.textContent = "0:00";
  positionEl.textContent = "4";
  itemSlot.textContent = "?";
  statusEl.textContent = "🏁 出發！";
  startBtn.disabled = true;
  startBtn.textContent = "🏁 比賽中…";

  draw();
  requestAnimationFrame(gameLoop);
}

// ===== 鍵盤控制 =====
const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
};

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft": keys.left = true; break;
    case "ArrowRight": keys.right = true; break;
    case "ArrowUp": keys.up = true; break;
    case "ArrowDown": keys.down = true; break;
    case " ": e.preventDefault(); useItem(); break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft": keys.left = false; break;
    case "ArrowRight": keys.right = false; break;
    case "ArrowUp": keys.up = false; break;
    case "ArrowDown": keys.down = false; break;
  }
});

// ===== 觸控控制 =====
function setupTouchButton(id, stateKey) {
  const el = document.getElementById(id);
  el.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touchState[stateKey] = true;
  }, { passive: false });
  el.addEventListener("touchend", (e) => {
    e.preventDefault();
    touchState[stateKey] = false;
  }, { passive: false });
  el.addEventListener("mousedown", () => touchState[stateKey] = true);
  el.addEventListener("mouseup", () => touchState[stateKey] = false);
  el.addEventListener("mouseleave", () => touchState[stateKey] = false);
}

setupTouchButton("turnLeft", "left");
setupTouchButton("turnRight", "right");
setupTouchButton("accel", "accel");
setupTouchButton("brake", "brake");

document.getElementById("useItem").addEventListener("touchstart", (e) => {
  e.preventDefault();
  useItem();
}, { passive: false });
document.getElementById("useItem").addEventListener("click", useItem);

// ===== 按鈕 =====
startBtn.addEventListener("click", startGame);

// ===== 初始化 =====
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  if (!isPlaying) {
    generateTrack();
    draw();
  }
});

// 初始畫面
generateTrack();
initCars();
draw();
