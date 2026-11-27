// 霓虹賽車（three.js 真 3D 版）
// 使用方式：用基本幾何組車子與場景，不需要任何外部圖片或模型，離線也能玩。
import * as THREE from './three.module.min.js';

// ============================================================
// ★ 可以自己改的地方（改數字就能調整遊戲，改完存檔重新整理即可）★
// ============================================================
const 起始速度 = 13;        // 一開始的速度（公尺／秒）
const 最高速度 = 52;        // 不按加速時的最高速度（公尺／秒，52 約 187 km/h）
const 加速時最高速度 = 68;  // 按住加速時可以衝到的最高速度
const 自動加速 = 0.35;      // 速度隨時間自己變快的量（每秒加多少）
const 加速衝刺 = 14;        // 按住加速時，每秒額外加多少速度
const 轉向速度 = 15;        // 左右轉向移動的速度（越大越靈活）
const 金幣分數 = 100;       // 撿到一枚金幣加幾分
const 車流量 = 10;          // 同時在路上的其他車輛數量
const 金幣數量 = 18;        // 同時在路上的金幣數量
const 最佳紀錄鍵 = 'erin-neon-racer-best'; // localStorage 存最佳紀錄用的 key
// ============================================================

const canvas = document.getElementById('gameCanvas');
const stageEl = document.getElementById('stage');
const distanceEl = document.getElementById('distance');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const startOverlay = document.getElementById('startOverlay');
const overOverlay = document.getElementById('overOverlay');
const finalDistanceEl = document.getElementById('finalDistance');
const finalScoreEl = document.getElementById('finalScore');
const bestDistanceStartEl = document.getElementById('bestDistanceStart');
const bestScoreStartEl = document.getElementById('bestScoreStart');
const bestDistanceOverEl = document.getElementById('bestDistanceOver');
const bestScoreOverEl = document.getElementById('bestScoreOver');

// ---------- three.js 基本設定 ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // 平板效能：像素比最多 2

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05051a); // 深色夜空
scene.fog = new THREE.Fog(0x05051a, 60, 230); // 遠方霧氣，順便遮住回收重生的物件

const camera = new THREE.PerspectiveCamera(68, 16 / 9, 0.1, 500);

// 燈光：環境光＋月光方向光＋玩家車頭燈（聚光燈只有一盞，效能 OK）
scene.add(new THREE.HemisphereLight(0x8899ff, 0x110022, 0.9));
const moonLight = new THREE.DirectionalLight(0xaaccff, 1.1);
moonLight.position.set(-20, 40, 10);
scene.add(moonLight);
const headLight = new THREE.SpotLight(0xbfefff, 60, 60, Math.PI / 6, 0.45);
scene.add(headLight);
scene.add(headLight.target);

// ---------- 共用材質（重複使用材質與幾何，減少平板負擔） ----------
const MAT = {
  road: new THREE.MeshStandardMaterial({ color: 0x14142e, roughness: 0.9 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x0a0a24, roughness: 1 }),
  edgePink: new THREE.MeshBasicMaterial({ color: 0xff2e88 }),
  edgeCyan: new THREE.MeshBasicMaterial({ color: 0x22e6ff }),
  dash: new THREE.MeshBasicMaterial({ color: 0xd8fbff }),
  pole: new THREE.MeshStandardMaterial({ color: 0x222244, roughness: 0.7 }),
  lampPink: new THREE.MeshBasicMaterial({ color: 0xff7ac0 }),
  lampCyan: new THREE.MeshBasicMaterial({ color: 0x8ff6ff }),
  building: new THREE.MeshStandardMaterial({ color: 0x101030, roughness: 0.95 }),
  buildingGlow: new THREE.MeshBasicMaterial({ color: 0x3555ff }),
  tire: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 }),
  coin: new THREE.MeshStandardMaterial({ color: 0xffc21f, emissive: 0xff9d00, emissiveIntensity: 1.2, metalness: 0.7, roughness: 0.25 }),
};
const 車道X = [-4, 0, 4]; // 三個車道的左右位置
const 道路半寬 = 6;

// ---------- 道路：用一段段路塊循環回收（物件池概念，不一直新增） ----------
const 路塊長度 = 20;
const 路塊數量 = 30;
const 路塊總長 = 路塊長度 * 路塊數量;
const roadChunks = [];

const roadGeo = new THREE.BoxGeometry(道路半寬 * 2, 0.2, 路塊長度);
const edgeGeo = new THREE.BoxGeometry(0.28, 0.3, 路塊長度);
const dashGeo = new THREE.BoxGeometry(0.22, 0.06, 3.2);
const poleGeo = new THREE.BoxGeometry(0.18, 4.6, 0.18);
const lampGeo = new THREE.BoxGeometry(0.55, 0.3, 0.55);
const buildingGeo = new THREE.BoxGeometry(5, 14, 5);

function makeRoadChunk(index) {
  const group = new THREE.Group();
  const road = new THREE.Mesh(roadGeo, MAT.road);
  road.position.y = -0.1;
  group.add(road);

  // 兩側霓虹路緣：一邊粉紅、一邊青色
  const leftEdge = new THREE.Mesh(edgeGeo, MAT.edgePink);
  leftEdge.position.set(-道路半寬 - 0.15, 0.05, 0);
  group.add(leftEdge);
  const rightEdge = new THREE.Mesh(edgeGeo, MAT.edgeCyan);
  rightEdge.position.set(道路半寬 + 0.15, 0.05, 0);
  group.add(rightEdge);

  // 車道虛線（隔一段才畫，做出虛線感）
  if (index % 2 === 0) {
    for (const x of [-2, 2]) {
      const dash = new THREE.Mesh(dashGeo, MAT.dash);
      dash.position.set(x, 0.04, 0);
      group.add(dash);
    }
  }

  // 路燈：每段兩側各一盞，顏色交替
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(poleGeo, MAT.pole);
    pole.position.set(side * (道路半寬 + 1.6), 2.3, -路塊長度 / 2 + 2);
    group.add(pole);
    const lamp = new THREE.Mesh(lampGeo, (index + (side > 0 ? 1 : 0)) % 2 === 0 ? MAT.lampPink : MAT.lampCyan);
    lamp.position.set(side * (道路半寬 + 1.6), 4.7, -路塊長度 / 2 + 2);
    group.add(lamp);
  }

  // 遠景建築光點：每 3 段在兩側放一棟暗色大樓＋一條發光窗帶
  if (index % 3 === 0) {
    for (const side of [-1, 1]) {
      const building = new THREE.Mesh(buildingGeo, MAT.building);
      building.position.set(side * (道路半寬 + 10 + (index % 4)), 7, 0);
      building.scale.y = 0.7 + ((index * 7 + (side > 0 ? 3 : 0)) % 10) / 8;
      group.add(building);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 5.2), MAT.buildingGlow);
      glow.position.set(building.position.x, 4 + (index % 5), 0);
      group.add(glow);
    }
  }

  group.position.z = -index * 路塊長度;
  scene.add(group);
  return group;
}
for (let i = 0; i < 路塊數量; i++) roadChunks.push(makeRoadChunk(i));

// 路面兩旁的地面（跟著玩家移動，不用真的做很長）
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 700), MAT.ground);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.25;
scene.add(ground);

// 星空：一群小光點，跟著玩家移動，看起來永遠不會用完
const starGeo = new THREE.BufferGeometry();
{
  const positions = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 500;
    positions[i * 3 + 1] = 25 + Math.random() * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 500;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
}
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbfe9ff, size: 0.9 }));
scene.add(stars);

// 月亮：一顆發光的大圓球掛在遠方
const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 20), new THREE.MeshBasicMaterial({ color: 0xf4f7ff }));
scene.add(moon);

// ---------- 用基本幾何組一台車 ----------
const bodyGeo = new THREE.BoxGeometry(1.9, 0.5, 3.6);
const cabinGeo = new THREE.BoxGeometry(1.5, 0.45, 1.7);
const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 14);
const spoilerGeo = new THREE.BoxGeometry(1.9, 0.1, 0.5);
const lightGeo = new THREE.BoxGeometry(0.34, 0.14, 0.08);

function makeCar(bodyColor, glowColor) {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.5, roughness: 0.35 });
  const glowMat = new THREE.MeshBasicMaterial({ color: glowColor });

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.55;
  car.add(body);

  const cabin = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({ color: 0x11182e, metalness: 0.6, roughness: 0.2 }));
  cabin.position.set(0, 1.0, 0.15);
  car.add(cabin);

  const spoiler = new THREE.Mesh(spoilerGeo, bodyMat);
  spoiler.position.set(0, 1.05, 1.75);
  car.add(spoiler);

  // 車底霓虹光條
  const underGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 3.8), glowMat);
  underGlow.position.y = 0.22;
  car.add(underGlow);

  // 四顆輪子（圓柱轉 90 度當輪胎）
  for (const [x, z] of [[-0.95, -1.25], [0.95, -1.25], [-0.95, 1.25], [0.95, 1.25]]) {
    const wheel = new THREE.Mesh(wheelGeo, MAT.tire);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.36, z);
    car.add(wheel);
  }

  // 車頭燈（前方，朝 -Z）與尾燈
  for (const x of [-0.6, 0.6]) {
    const head = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xeaffff }));
    head.position.set(x, 0.62, -1.82);
    car.add(head);
    const tail = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xff2244 }));
    tail.position.set(x, 0.68, 1.82);
    car.add(tail);
  }
  return car;
}

// 玩家車
const playerCar = makeCar(0xff2e88, 0x22e6ff);
scene.add(playerCar);

// 其他車輛（物件池：先全部做好，之後只改位置重複使用）
const trafficColors = [0x22e6ff, 0xffd94a, 0x7c5cff, 0x37ff9a, 0xff7a3c, 0xf4f4ff];
const traffic = [];
for (let i = 0; i < 車流量; i++) {
  const mesh = makeCar(trafficColors[i % trafficColors.length], 0xff2e88);
  scene.add(mesh);
  traffic.push({ mesh, lane: 0, ownSpeed: 10, active: true });
}

// 金幣（物件池：金色圓環，會自己旋轉）
const coinGeo = new THREE.TorusGeometry(0.65, 0.24, 12, 24);
const coins = [];
for (let i = 0; i < 金幣數量; i++) {
  const mesh = new THREE.Mesh(coinGeo, MAT.coin);
  mesh.position.y = 1.1;
  scene.add(mesh);
  coins.push({ mesh, active: true });
}

// ---------- 遊戲狀態 ----------
const input = { left: false, right: false, boost: false };
let state = 'ready'; // ready（未開始）／ playing（進行中）／ over（結束）
let playerX = 0;
let playerZ = 0;
let speed = 0;
let distance = 0; // 公尺
let score = 0;

function loadBest() {
  try {
    const data = JSON.parse(localStorage.getItem(最佳紀錄鍵) || 'null');
    if (data && typeof data.distance === 'number' && typeof data.score === 'number') return data;
  } catch (e) { /* 存檔壞掉就當作沒有紀錄 */ }
  return { distance: 0, score: 0 };
}
let best = loadBest();

function showBest() {
  bestDistanceStartEl.textContent = Math.floor(best.distance);
  bestScoreStartEl.textContent = best.score;
  bestDistanceOverEl.textContent = Math.floor(best.distance);
  bestScoreOverEl.textContent = best.score;
}

function saveBest() {
  best.distance = Math.max(best.distance, Math.floor(distance));
  best.score = Math.max(best.score, score);
  try { localStorage.setItem(最佳紀錄鍵, JSON.stringify(best)); } catch (e) { /* 無痕模式等情況存不了就算了 */ }
  showBest();
}

function randomLane() { return 車道X[Math.floor(Math.random() * 車道X.length)]; }

// 把一台交通車放到玩家前方遠處（同車道附近不要有另一台車，避免完全堵死）
function placeTraffic(car, minAhead, maxAhead) {
  for (let tries = 0; tries < 8; tries++) {
    const lane = randomLane();
    const z = playerZ - (minAhead + Math.random() * (maxAhead - minAhead));
    const blocked = traffic.some(other => other !== car && other.active && other.lane === lane && Math.abs(other.mesh.position.z - z) < 16);
    if (!blocked) {
      car.lane = lane;
      car.mesh.position.set(lane, 0, z);
      car.ownSpeed = 8 + Math.random() * 8; // 其他車自己的速度（比玩家慢，玩家會追上並需要閃避）
      car.active = true;
      car.mesh.visible = true;
      return;
    }
  }
  car.mesh.position.set(randomLane(), 0, playerZ - maxAhead);
  car.active = true;
  car.mesh.visible = true;
}

function placeCoin(coin, minAhead, maxAhead) {
  coin.mesh.position.set(randomLane() + (Math.random() - 0.5) * 0.8, 1.1, playerZ - (minAhead + Math.random() * (maxAhead - minAhead)));
  coin.active = true;
  coin.mesh.visible = true;
}

function resetGame() {
  playerX = 0;
  playerZ = 0;
  speed = 起始速度;
  distance = 0;
  score = 0;
  for (let i = 0; i < roadChunks.length; i++) roadChunks[i].position.z = -i * 路塊長度;
  traffic.forEach((car, i) => placeTraffic(car, 60 + i * 22, 90 + i * 22));
  coins.forEach((coin, i) => placeCoin(coin, 30 + i * 14, 55 + i * 14));
  updateHud();
}

function startGame() {
  resetGame();
  state = 'playing';
  startOverlay.classList.add('hidden');
  overOverlay.classList.add('hidden');
}

function gameOver() {
  state = 'over';
  saveBest();
  finalDistanceEl.textContent = Math.floor(distance);
  finalScoreEl.textContent = score;
  overOverlay.classList.remove('hidden');
}

function updateHud() {
  distanceEl.textContent = Math.floor(distance);
  scoreEl.textContent = score;
  speedEl.textContent = Math.round(speed * 3.6); // 公尺／秒換成 km/h 顯示
}

// ---------- 操作：鍵盤 ----------
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { input.left = true; e.preventDefault(); }
  if (e.key === 'ArrowRight') { input.right = true; e.preventDefault(); }
  if (e.key === 'ArrowUp') { input.boost = true; e.preventDefault(); }
  if ((e.key === ' ' || e.key === 'Enter') && state !== 'playing') startGame();
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') input.left = false;
  if (e.key === 'ArrowRight') input.right = false;
  if (e.key === 'ArrowUp') input.boost = false;
});

// ---------- 操作：觸控按鈕（按住不放） ----------
function bindHoldButton(id, key) {
  const btn = document.getElementById(id);
  const on = (e) => { e.preventDefault(); input[key] = true; btn.classList.add('active'); };
  const off = (e) => { if (e) e.preventDefault(); input[key] = false; btn.classList.remove('active'); };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('pointercancel', off);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
bindHoldButton('leftBtn', 'left');
bindHoldButton('rightBtn', 'right');
bindHoldButton('boostBtn', 'boost');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('startBtn2').addEventListener('click', startGame);

// ---------- 畫面大小（跟著舞台寬度縮放，保持 16:9） ----------
function resize() {
  const w = stageEl.clientWidth || 960;
  const h = w * 9 / 16;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ---------- 主迴圈 ----------
const clock = new THREE.Clock();

function update(dt) {
  if (state !== 'playing') return;

  // 速度：自動緩慢上升；按住加速衝更快；放開加速且超過一般上限就慢慢降回來
  const cap = input.boost ? 加速時最高速度 : 最高速度;
  speed += 自動加速 * dt;
  if (input.boost) speed += 加速衝刺 * dt;
  if (speed > cap) speed = Math.max(cap, speed - 20 * dt);
  speed = Math.min(speed, 加速時最高速度);

  // 轉向：平滑左右移動，限制在道路內
  const steer = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  playerX += steer * 轉向速度 * dt;
  playerX = Math.max(-(道路半寬 - 1.1), Math.min(道路半寬 - 1.1, playerX));
  playerCar.rotation.z = -steer * 0.12;
  playerCar.rotation.y = -steer * 0.22;

  // 前進
  playerZ -= speed * dt;
  distance += speed * dt;

  // 其他車輛：同方向行駛（往 -Z），玩家比較快會追上它們
  for (const car of traffic) {
    if (!car.active) continue;
    car.mesh.position.z -= car.ownSpeed * dt;
    // 被玩家超過（跑到玩家後方）或離太遠，就回收重生到前方
    if (car.mesh.position.z > playerZ + 12 || car.mesh.position.z < playerZ - 320) {
      placeTraffic(car, 140, 300);
      continue;
    }
    // 撞車判定：距離夠近且左右重疊
    const dz = Math.abs(car.mesh.position.z - playerZ);
    const dx = Math.abs(car.mesh.position.x - playerX);
    if (dz < 2.4 && dx < 1.7) { gameOver(); return; }
  }

  // 金幣：旋轉、撿取判定、回收
  for (const coin of coins) {
    if (!coin.active) continue;
    coin.mesh.rotation.y += dt * 3.2;
    if (coin.mesh.position.z > playerZ + 8) { placeCoin(coin, 120, 280); continue; }
    const dz = Math.abs(coin.mesh.position.z - playerZ);
    const dx = Math.abs(coin.mesh.position.x - playerX);
    if (dz < 2 && dx < 1.5) {
      score += 金幣分數;
      placeCoin(coin, 120, 280); // 撿到後直接在前方重生，等於回收再利用
    }
  }

  updateHud();
}

function render() {
  // 玩家車位置
  playerCar.position.set(playerX, 0, playerZ);

  // 路塊回收：跑到玩家後方的路塊移到最前面
  for (const chunk of roadChunks) {
    if (chunk.position.z - 路塊長度 / 2 > playerZ + 25) chunk.position.z -= 路塊總長;
  }

  // 地面、星空、月亮跟著玩家走，看起來無限延伸
  ground.position.z = playerZ - 250;
  stars.position.z = playerZ - 100;
  moon.position.set(playerX * 0.4 - 55, 42, playerZ - 190);

  // 相機跟在玩家車後上方，看向道路前方
  camera.position.set(playerX * 0.55, 4.3, playerZ + 8.6);
  camera.lookAt(playerX * 0.85, 1.1, playerZ - 14);

  // 車頭燈跟著玩家車
  headLight.position.set(playerX, 2.2, playerZ - 1);
  headLight.target.position.set(playerX, 0, playerZ - 25);

  renderer.render(scene, camera);
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05); // 卡頓時不要一次跳太大步
  update(dt);
  // 未開始／結束時也讓金幣慢慢轉，畫面比較生動
  if (state !== 'playing') for (const coin of coins) coin.mesh.rotation.y += dt * 1.5;
  render();
}

// ---------- 啟動 ----------
showBest();
resetGame();
speed = 0; // 還沒開始前停在起點，開始時 resetGame 會給起始速度
updateHud();
resize();
loop();
