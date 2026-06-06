// ===== 遊戲設定 =====
const ROAD_WIDTH = 100;
const LAPS_TO_WIN = 3;

// 車子物理
const CAR_ACCEL = 0.12;
const CAR_BRAKE = 0.15;
const CAR_FRICTION = 0.97;
const CAR_TURN_SPEED = 0.045;
const MAX_SPEED = 3.5;
const GRASS_PENALTY = 0.85;

// AI
const AI_COUNT = 3;

// 道具
const ITEM_SPAWN_INTERVAL = 200;
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

// ===== 賽道 =====
// 用一系列控制點定義賽道（俯視座標）
let trackPoints = [];
const TRACK_SEGMENT_LEN = 8; // 每段長度（像素）

// ===== 車輛 =====
class Car {
  constructor(color, isPlayer = false) {
    this.x = 0;
    this.y = 0;
    this.angle = 0; // 朝向（弧度）
    this.speed = 0;
    this.color = color;
    this.isPlayer = isPlayer;
    this.lap = 0;
    this.trackProgress = 0; // 在賽道上的位置（0~1）
    this.item = null;
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

// ===== 道具 & 特效 =====
let trackItems = [];
let bananas = [];
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

// ===== 觸控 =====
const touchState = { left: false, right: false, brake: false };

// ===== Canvas =====
function resizeCanvas() {
  const rect = arena.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

// ===== 生成賽道（橢圓形） =====
function generateTrack() {
  trackPoints = [];
  const cx = 0;
  const cy = 0;
  const rx = 600;
  const ry = 400;
  const totalPoints = 120;

  for (let i = 0; i < totalPoints; i++) {
    const angle = (Math.PI * 2 * i) / totalPoints;
    trackPoints.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    });
  }
}

// ===== 取得賽道上某個位置的座標和方向 =====
function getTrackPosition(progress) {
  const totalPoints = trackPoints.length;
  const idx = ((progress % 1) + 1) % 1 * totalPoints;
  const i = Math.floor(idx);
  const t = idx - i;
  const p0 = trackPoints[i % totalPoints];
  const p1 = trackPoints[(i + 1) % totalPoints];

  const x = p0.x + (p1.x - p0.x) * t;
  const y = p0.y + (p1.y - p0.y) * t;

  // 方向
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const angle = Math.atan2(dy, dx);

  return { x, y, angle };
}

// ===== 初始化車輛 =====
function initCars() {
  const startPos = getTrackPosition(0);

  // 玩家
  player = new Car("#ef4444", true);
  player.x = startPos.x;
  player.y = startPos.y;
  player.angle = startPos.angle;
  player.trackProgress = 0;

  // AI
  aiCars = [];
  const aiColors = ["#3b82f6", "#22c55e", "#a855f7"];
  for (let i = 0; i < AI_COUNT; i++) {
    const car = new Car(aiColors[i]);
    const startOffset = 0.02 + i * 0.02;
    const pos = getTrackPosition(startOffset);
    car.x = pos.x;
    car.y = pos.y;
    car.angle = pos.angle;
    car.trackProgress = startOffset;
    car.aiTargetProgress = startOffset;
    car.aiSpeed = 2.2 + Math.random() * 0.5;
    car.aiSteerSmooth = 0;
    aiCars.push(car);
  }

  allCars = [player, ...aiCars];
}

// ===== 座標轉換：世界座標 → 螢幕座標 =====
// 鏡頭跟著玩家，玩家永遠在螢幕中央偏下，朝上
function worldToScreen(wx, wy) {
  const screenCX = canvas.width / 2;
  const screenCY = canvas.height * 0.65;

  // 相對於玩家的位置
  const dx = wx - player.x;
  const dy = wy - player.y;

  // 旋轉（玩家朝上 = -PI/2）
  const camAngle = player.angle + Math.PI / 2;
  const cos = Math.cos(-camAngle);
  const sin = Math.sin(-camAngle);

  const sx = dx * cos - dy * sin + screenCX;
  const sy = dx * sin + dy * cos + screenCY;

  return { x: sx, y: sy };
}

// ===== 畫賽道 =====
function drawTrack() {
  // 背景草地
  ctx.fillStyle = "#2d5a27";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 草地紋理
  ctx.fillStyle = "#3a6b32";
  for (let i = 0; i < 60; i++) {
    const wx = (i * 173.7) % 2000 - 1000;
    const wy = (i * 131.3) % 2000 - 1000;
    const sp = worldToScreen(wx, wy);
    if (sp.x < -20 || sp.x > canvas.width + 20 || sp.y < -20 || sp.y > canvas.height + 20) continue;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 畫路面（只畫可見部分）
  const totalPoints = trackPoints.length;
  const viewRange = 0.15; // 畫玩家前後 15% 的賽道

  for (let pass = 0; pass < 2; pass++) {
    // pass 0: 路面外框, pass 1: 路面本體
    const lineWidth = pass === 0 ? ROAD_WIDTH + 10 : ROAD_WIDTH;
    const color = pass === 0 ? "#555" : "#666";

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    let started = false;
    for (let t = -viewRange; t <= viewRange; t += 0.005) {
      const progress = ((player.trackProgress + t) % 1 + 1) % 1;
      const pos = getTrackPosition(progress);
      const sp = worldToScreen(pos.x, pos.y);

      if (!started) {
        ctx.moveTo(sp.x, sp.y);
        started = true;
      } else {
        ctx.lineTo(sp.x, sp.y);
      }
    }
    ctx.stroke();
  }

  // 車道線（虛線）
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  let started = false;
  for (let t = -viewRange; t <= viewRange; t += 0.005) {
    const progress = ((player.trackProgress + t) % 1 + 1) % 1;
    const pos = getTrackPosition(progress);
    const sp = worldToScreen(pos.x, pos.y);
    if (!started) {
      ctx.moveTo(sp.x, sp.y);
      started = true;
    } else {
      ctx.lineTo(sp.x, sp.y);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // 起跑線
  const startLine = getTrackPosition(0);
  const startSp = worldToScreen(startLine.x, startLine.y);
  const perpAngle = startLine.angle + Math.PI / 2;
  const halfW = ROAD_WIDTH / 2;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(startSp.x + Math.cos(perpAngle) * halfW, startSp.y + Math.sin(perpAngle) * halfW);
  ctx.lineTo(startSp.x - Math.cos(perpAngle) * halfW, startSp.y - Math.sin(perpAngle) * halfW);
  ctx.stroke();
}

// ===== 畫車子 =====
function drawCar(car) {
  const sp = worldToScreen(car.x, car.y);

  // 不在畫面內就跳過
  if (sp.x < -30 || sp.x > canvas.width + 30 || sp.y < -30 || sp.y > canvas.height + 30) return;

  ctx.save();
  ctx.translate(sp.x, sp.y);

  // 車子角度（相對於鏡頭）
  const camAngle = player.angle + Math.PI / 2;
  const drawAngle = car.angle - camAngle;
  ctx.rotate(drawAngle);

  // 無敵閃爍
  if (car.isInvincible && Math.floor(gameTime / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // 車身
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.rect(-10, -16, 20, 32);
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

  // 加速火焰
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

// ===== 畫道具 =====
function drawItems() {
  for (const item of trackItems) {
    const sp = worldToScreen(item.x, item.y);
    if (sp.x < -30 || sp.x > canvas.width + 30 || sp.y < -30 || sp.y > canvas.height + 30) continue;

    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.emoji, sp.x, sp.y);

    // 光暈
    ctx.strokeStyle = "rgba(251,191,36,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 香蕉皮
  for (const banana of bananas) {
    const sp = worldToScreen(banana.x, banana.y);
    if (sp.x < -30 || sp.x > canvas.width + 30 || sp.y < -30 || sp.y > canvas.height + 30) continue;
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", sp.x, sp.y);
  }
}

// ===== 畫粒子 =====
function drawParticles() {
  for (const p of particles) {
    const sp = worldToScreen(p.x, p.y);
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ===== 畫 HUD（方向提示） =====
function drawDirectionHint() {
  // 畫一個小箭頭提示賽道方向
  const hintProgress = player.trackProgress + 0.05;
  const hintPos = getTrackPosition(hintProgress);
  const sp = worldToScreen(hintPos.x, hintPos.y);

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 20, 0, Math.PI * 2);
  ctx.stroke();
}

// ===== 生成道具 =====
function spawnItem() {
  const progress = Math.random();
  const pos = getTrackPosition(progress);
  const perpAngle = pos.angle + Math.PI / 2;
  const offset = (Math.random() - 0.5) * ROAD_WIDTH * 0.4;
  const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

  trackItems.push({
    x: pos.x + Math.cos(perpAngle) * offset,
    y: pos.y + Math.sin(perpAngle) * offset,
    ...type,
  });
}

// ===== 粒子 =====
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

  // 轉向（相對於車子前方）
  if (keys.left || touchState.left) {
    player.angle -= CAR_TURN_SPEED;
  }
  if (keys.right || touchState.right) {
    player.angle += CAR_TURN_SPEED;
  }

  // 自動加速
  let accel = CAR_ACCEL;

  // 煞車
  if (keys.brake || touchState.brake) {
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

  player.speed += accel;

  // 草地減速
  if (!isOnTrack(player.x, player.y)) {
    player.speed *= GRASS_PENALTY;
  }

  player.speed *= CAR_FRICTION;
  const maxSpd = player.isBoosted ? MAX_SPEED * 1.5 : MAX_SPEED;
  player.speed = Math.max(0, Math.min(maxSpd, player.speed));

  // 移動
  player.x += Math.cos(player.angle) * player.speed;
  player.y += Math.sin(player.angle) * player.speed;

  // 更新賽道進度
  updateTrackProgress(player);
}

// ===== 判斷是否在賽道上 =====
function isOnTrack(x, y) {
  let minDist = Infinity;
  for (const p of trackPoints) {
    const dx = x - p.x;
    const dy = y - p.y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) minDist = dist;
  }
  return Math.sqrt(minDist) < ROAD_WIDTH / 2;
}

// ===== 更新賽道進度 =====
function updateTrackProgress(car) {
  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < trackPoints.length; i++) {
    const dx = car.x - trackPoints[i].x;
    const dy = car.y - trackPoints[i].y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }

  const newProgress = closestIdx / trackPoints.length;
  const oldProgress = car.trackProgress;

  // 檢查是否完成一圈
  if (oldProgress > 0.9 && newProgress < 0.1) {
    car.lap++;
    if (car.isPlayer) {
      lapEl.textContent = car.lap;
      spawnParticles(car.x, car.y, "#fbbf24", 10);
      if (car.lap >= LAPS_TO_WIN) {
        finishRace();
      }
    }
  }
  // 倒退
  if (oldProgress < 0.1 && newProgress > 0.9) {
    car.lap = Math.max(0, car.lap - 1);
    if (car.isPlayer) lapEl.textContent = car.lap;
  }

  car.trackProgress = newProgress;
}

// ===== 更新 AI =====
function updateAI(car) {
  if (car.stunTimer > 0) {
    car.stunTimer--;
    car.speed *= 0.9;
    return;
  }

  // AI 目標：往前看一段距離
  const lookAhead = 0.03;
  const targetProgress = car.trackProgress + lookAhead;
  const targetPos = getTrackPosition(targetProgress);

  // 計算需要轉多少
  const dx = targetPos.x - car.x;
  const dy = targetPos.y - car.y;
  const targetAngle = Math.atan2(dy, dx);

  let angleDiff = targetAngle - car.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  // 平滑轉向
  car.angle += angleDiff * 0.1;

  // 速度（轉彎時減速）
  const turnFactor = 1 - Math.abs(angleDiff) / Math.PI * 0.5;
  car.speed = car.aiSpeed * turnFactor;

  // 道具效果
  if (car.isBoosted) {
    car.speed *= 1.4;
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

  // 更新進度
  updateTrackProgress(car);

  // AI 撿道具
  if (Math.random() < 0.01 && !car.item) {
    for (let i = trackItems.length - 1; i >= 0; i--) {
      const item = trackItems[i];
      const d = Math.hypot(item.x - car.x, item.y - car.y);
      if (d < 30) {
        car.item = item;
        trackItems.splice(i, 1);
        break;
      }
    }
  }

  // AI 用道具
  if (car.item && Math.random() < 0.02) {
    if (car.item.id === "mushroom") {
      car.isBoosted = true;
      car.boostTimer = car.item.duration;
    } else if (car.item.id === "star") {
      car.isInvincible = true;
      car.invincibleTimer = car.item.duration;
    } else if (car.item.id === "banana") {
      bananas.push({ x: car.x, y: car.y });
    } else if (car.item.id === "bomb") {
      const d = Math.hypot(player.x - car.x, player.y - car.y);
      if (d < 150) {
        player.stunTimer = 40;
        player.speed = 0;
        spawnParticles(player.x, player.y, "#ef4444", 10);
      }
    }
    car.item = null;
  }
}

// ===== 碰撞 =====
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
        const nx = dx / dist;
        const ny = dy / dist;
        a.x += nx * 2;
        a.y += ny * 2;
        b.x -= nx * 2;
        b.y -= ny * 2;

        if (a.isInvincible && !b.isInvincible) {
          b.stunTimer = 30;
          b.speed = 0;
        } else if (b.isInvincible && !a.isInvincible) {
          a.stunTimer = 30;
          a.speed = 0;
        } else {
          a.speed *= 0.5;
          b.speed *= 0.5;
        }
      }
    }
  }

  // 玩家撿道具
  for (let i = trackItems.length - 1; i >= 0; i--) {
    const item = trackItems[i];
    const d = Math.hypot(item.x - player.x, item.y - player.y);
    if (d < 24 && !player.item) {
      player.item = item;
      itemSlot.textContent = item.emoji;
      trackItems.splice(i, 1);
      spawnParticles(item.x, item.y, "#fbbf24");
    }
  }

  // 香蕉皮
  for (let i = bananas.length - 1; i >= 0; i--) {
    const banana = bananas[i];
    for (const car of allCars) {
      if (car.isInvincible) continue;
      const d = Math.hypot(banana.x - car.x, banana.y - car.y);
      if (d < 20) {
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
      const bombX = player.x + Math.cos(player.angle) * 80;
      const bombY = player.y + Math.sin(player.angle) * 80;
      spawnParticles(bombX, bombY, "#ef4444", 15);
      for (const car of allCars) {
        if (car === player) continue;
        const d = Math.hypot(bombX - car.x, bombY - car.y);
        if (d < 50) {
          car.stunTimer = 60;
          car.speed = 0;
          spawnParticles(car.x, car.y, "#ef4444", 10);
        }
      }
      break;
  }
}

// ===== 排名 =====
function updateRanking() {
  for (const car of allCars) {
    car.rank = car.lap * 1000 + car.trackProgress * 1000;
  }
  const sorted = [...allCars].sort((a, b) => b.rank - a.rank);
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].position = i + 1;
  }
  positionEl.textContent = player.position;
}

// ===== 時間 =====
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

  const pos = player.position;
  let msg = "";
  if (pos === 1) msg = "🏆 冠軍！太棒了！";
  else if (pos === 2) msg = "🥈 第二名！好厲害！";
  else if (pos === 3) msg = "🥉 第三名！不錯喔！";
  else msg = `第 ${pos} 名，再試試！`;

  statusEl.textContent = `${msg} 時間：${formatTime(gameTime)}`;
  startBtn.disabled = false;
  startBtn.textContent = "▶ 再來一場";
}

// ===== 遊戲迴圈 =====
function gameLoop() {
  if (!isPlaying) return;

  gameTime++;

  updatePlayer();
  for (const car of aiCars) updateAI(car);
  checkCollisions();
  updateRanking();

  timeEl.textContent = formatTime(gameTime);

  // 道具生成
  itemCountdown++;
  if (itemCountdown >= ITEM_SPAWN_INTERVAL && trackItems.length < 5) {
    spawnItem();
    itemCountdown = 0;
  }

  updateParticles();

  draw();
  requestAnimationFrame(gameLoop);
}

// ===== 繪製 =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();
  drawDirectionHint();
  drawItems();
  drawParticles();

  // AI 先畫，玩家最後畫（在最上層）
  for (const car of aiCars) drawCar(car);
  drawCar(player);
}

// ===== 開始 =====
function startGame() {
  isPlaying = true;
  isFinished = false;
  gameTime = 0;
  itemCountdown = 0;
  trackItems = [];
  bananas = [];
  particles = [];

  generateTrack();
  initCars();

  lapEl.textContent = "0";
  timeEl.textContent = "0:00";
  positionEl.textContent = "4";
  itemSlot.textContent = "?";
  statusEl.textContent = "🏁 出發！轉彎控制方向！";
  startBtn.disabled = true;
  startBtn.textContent = "🏁 比賽中…";

  draw();
  requestAnimationFrame(gameLoop);
}

// ===== 鍵盤 =====
const keys = { left: false, right: false, brake: false };

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft": case "a": case "A": keys.left = true; break;
    case "ArrowRight": case "d": case "D": keys.right = true; break;
    case "ArrowDown": case "s": case "S": keys.brake = true; break;
    case " ": e.preventDefault(); useItem(); break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft": case "a": case "A": keys.left = false; break;
    case "ArrowRight": case "d": case "D": keys.right = false; break;
    case "ArrowDown": case "s": case "S": keys.brake = false; break;
  }
});

// ===== 觸控按鈕 =====
function setupTouch(id, stateKey) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("touchstart", (e) => { e.preventDefault(); touchState[stateKey] = true; }, { passive: false });
  el.addEventListener("touchend", (e) => { e.preventDefault(); touchState[stateKey] = false; }, { passive: false });
  el.addEventListener("touchcancel", () => { touchState[stateKey] = false; });
  el.addEventListener("mousedown", () => { touchState[stateKey] = true; });
  el.addEventListener("mouseup", () => { touchState[stateKey] = false; });
  el.addEventListener("mouseleave", () => { touchState[stateKey] = false; });
}

setupTouch("turnLeft", "left");
setupTouch("turnRight", "right");
setupTouch("brake", "brake");

const useItemBtn = document.getElementById("useItem");
if (useItemBtn) {
  useItemBtn.addEventListener("touchstart", (e) => { e.preventDefault(); useItem(); }, { passive: false });
  useItemBtn.addEventListener("click", useItem);
}

// ===== 按鈕 =====
startBtn.addEventListener("click", startGame);

// ===== 初始化 =====
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  if (!isPlaying) {
    generateTrack();
    initCars();
    draw();
  }
});

generateTrack();
initCars();
draw();
