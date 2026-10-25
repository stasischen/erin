// ✏️ Erin 設定區：改下面的數字，就能改變遊戲玩法。
const UPGRADE_TUNING = {
  maxUpgradeLevel: 5, // 每張升級卡最多升幾級；改大可以升更多級
  splashBaseRadius: 22, // 水花一開始濺多遠；改大會打到更遠的甲本
  splashPerLevel: 10, // 水花每升一級多遠；改大會濺得更遠
  invincibleSeconds: 1.0, // 被撞後保護幾秒；改大會比較不容易連續受傷
  waterSizePerLevel: 0.20, // 水球每升一級變大多少；改大看起來會長更快
  damagePerLevel: 0.25, // 水球每升一級多痛多少；改大打倒甲本更快
  fireRateReduction: 0.15, // 連發卡每級讓等待時間少多少；改大會射得更快
  extraShotAngle: 0.18, // 多顆水球分開的角度；改大會射得更散
  moveSpeedPerLevel: 0.12, // 洋蔥衝刺每級加多少速度；改大跑得更快
  magnetPerLevel: 0.40, // 磁鐵每級增加多少吸取距離；改大更遠就能撿寶石
  playerSpeed: 190, // 主角每秒走多遠；改大跑更快
  playerHealth: 90, // 主角血條有多長；改大比較耐撞
  enemyLimit: 26, // 畫面最多同時有幾個甲本；改大會有更多甲本
  enemySpeed: 75, // 甲本每秒走多遠；改大追得更快
  enemyRadius: 17, // 甲本有多大；改大會變大隻
  enemyDamage: 15, // 甲本撞一下扣多少血；改大會更危險
  enemyHealth: 120, // 打倒甲本要打掉多少血；改大要多打幾下
  secondEnemySpeed: 105, // 乙本每秒走多遠；比甲本快
  secondEnemyDamage: 12, // 乙本撞一下扣多少血；改大會更危險
  enemyShootLevel: 8, // 主角升到幾級，甲乙本才會丟字；改大會晚一點開始
  enemyShotInterval: 3, // 甲本丟完字至少休息幾秒；改大會射得比較少
  secondEnemyShotInterval: 5, // 乙本丟字的休息秒數；比甲本長就射得比較少
  enemyShotSpeed: 110, // 國字每秒飛多遠；改小會比較好躲
  enemyShotDamage: 6, // 國字打中扣多少血；改小會比較不痛
  enemyShotGap: 0.65, // 兩隻小兵丟字至少隔幾秒；改大就不會一起丟
  enemyShotLimit: 12, // 畫面最多幾個小兵國字；避免字太多
  enemySpeedGrowth: 0.05, // 每過 30 秒多加多少原本速度；0.05 就是加 5%
  secondEnemyHealth: 70, // 乙本有多少血；比甲本少
  waveSeconds: 120, // 幾秒後老師出場；120 秒就是 2 分鐘
  teacherHealth: 2000, // 老師血條有多長；改大要打更久
  teacherShotInterval: 1.0, // 老師隔幾秒發射一次文字
  teacherShotDamage: 20, // 老師文字打中扣多少血
  teacherShotCount: 3, // 每次發射幾個字
  teacherShotSpread: 0.28, // 文字扇形的間隔角度；改大比較分散
  teacherShotLimit: 36, // 畫面最多有幾個文字；避免太多文字卡住
  teacherSummonSeconds: 6, // 老師每隔幾秒叫小兵
  teacherSummonMin: 1, // 每次至少叫幾隻小兵
  teacherSummonMax: 1, // 每次最多叫幾隻小兵
  shotInterval: 0.72, // 平常隔幾秒射一顆水球；改小會射更快
  projectileDamage: 35, // 水球打中扣多少甲本的血；改大打得更痛
  projectileSpeed: 390, // 水球飛多快；改大會飛更快
  projectileLimit: 24, // 畫面最多同時有幾顆水球；改大會有更多水球
  gemLimit: 24, // 畫面最多同時有幾顆寶石；改大會留下更多寶石
  gemPullRadius: 105, // 靠多近寶石會被吸過來；改大能從更遠撿到
  xpToLevel: 5, // 第一次撿幾顆寶石會升級；改小會更快升級
  xpGrowthPerLevel: 1, // 每升一級多需要幾顆寶石；改大升級更慢
  dashCooldown: 2.5, // 衝刺後休息幾秒
  dashSeconds: 0.15, // 衝刺持續幾秒
  dashMultiplier: 3, // 衝刺是平常速度的幾倍
  bombCooldown: 8, // 泡泡炸彈用完休息幾秒
  bombDelay: 0.6, // 泡泡放下後幾秒爆開
  bombDamage: 100, // 泡泡爆開扣多少敵人的血
  bombRadius: 110, // 泡泡能打到多遠
  bombKnockback: 55, // 泡泡把敵人推多遠
  actionButtonSize: 88, // 衝刺按鈕有多大；技能按鈕小一點
  autoHealSeconds: 10 // 自動補血 Lv1 幾秒回 1 點；改小會回得更快
};
const SETTINGS_KEY = "erin-survivor-settings-v3";
const RECORD_KEY = "erin-survivor-best-seconds-v1";
const SETTING_DEFAULTS = {
  playerSpeed: UPGRADE_TUNING.playerSpeed, playerHealth: UPGRADE_TUNING.playerHealth,
  enemySpeed: UPGRADE_TUNING.enemySpeed, enemyHealth: UPGRADE_TUNING.enemyHealth,
  secondEnemySpeed: UPGRADE_TUNING.secondEnemySpeed, secondEnemyHealth: UPGRADE_TUNING.secondEnemyHealth,
  waveSeconds: UPGRADE_TUNING.waveSeconds, teacherHealth: UPGRADE_TUNING.teacherHealth,
  shotInterval: UPGRADE_TUNING.shotInterval, spawnScale: 1,
  enemyShootLevel: UPGRADE_TUNING.enemyShootLevel,
  enemyShotInterval: UPGRADE_TUNING.enemyShotInterval, secondEnemyShotInterval: UPGRADE_TUNING.secondEnemyShotInterval,
  enemyShotSpeed: UPGRADE_TUNING.enemyShotSpeed, enemyShotDamage: UPGRADE_TUNING.enemyShotDamage,
  dashCooldown: UPGRADE_TUNING.dashCooldown,
  dashSeconds: UPGRADE_TUNING.dashSeconds,
  dashMultiplier: UPGRADE_TUNING.dashMultiplier,
  bombCooldown: UPGRADE_TUNING.bombCooldown,
  bombDelay: UPGRADE_TUNING.bombDelay,
  bombDamage: UPGRADE_TUNING.bombDamage,
  bombRadius: UPGRADE_TUNING.bombRadius,
  bombKnockback: UPGRADE_TUNING.bombKnockback,
  actionButtonSize: UPGRADE_TUNING.actionButtonSize,
  sound: true, vibration: true
};
const SETTING_CONTROLS = [
  { key: "dashCooldown", label: "衝刺後休息幾秒", min: 1, max: 8, step: 0.5, unit: " 秒" },
  { key: "dashSeconds", label: "衝刺持續幾秒", min: 0.1, max: 0.4, step: 0.05, unit: " 秒" },
  { key: "dashMultiplier", label: "衝刺是平常速度的幾倍", min: 2, max: 5, step: 0.5, unit: " 倍" },
  { key: "bombCooldown", label: "泡泡炸彈用完休息幾秒", min: 2, max: 15, step: 1, unit: " 秒" },
  { key: "bombDelay", label: "泡泡放下後幾秒爆開", min: 0.2, max: 1.5, step: 0.1, unit: " 秒" },
  { key: "bombDamage", label: "泡泡爆開扣多少敵人的血", min: 20, max: 300, step: 10, unit: "" },
  { key: "bombRadius", label: "泡泡能打到多遠", min: 50, max: 180, step: 10, unit: "" },
  { key: "bombKnockback", label: "泡泡把敵人推多遠", min: 10, max: 100, step: 5, unit: "" },
  { key: "actionButtonSize", label: "衝刺按鈕有多大；技能按鈕小一點", min: 72, max: 104, step: 4, unit: " px" },

  { key: "playerSpeed", label: "水星人速度", min: 100, max: 320, step: 10, unit: "" },
  { key: "playerHealth", label: "水星人血量", min: 40, max: 200, step: 10, unit: "" },
  { key: "enemySpeed", label: "甲本速度", min: 30, max: 130, step: 5, unit: "" },
  { key: "enemyHealth", label: "甲本血量", min: 40, max: 240, step: 10, unit: "" },
  { key: "secondEnemySpeed", label: "乙本速度", min: 45, max: 170, step: 5, unit: "" },
  { key: "secondEnemyHealth", label: "乙本血量", min: 30, max: 180, step: 10, unit: "" },
  { key: "waveSeconds", label: "老師出場時間", min: 60, max: 300, step: 10, unit: " 秒" },
  { key: "teacherHealth", label: "老師血量", min: 500, max: 3000, step: 100, unit: "" },
  { key: "shotInterval", label: "水球發射間隔", min: 0.25, max: 1.5, step: 0.05, unit: " 秒" },
  { key: "enemyShootLevel", label: "甲乙本開始丟字等級", min: 2, max: 20, step: 1, unit: " 級" },
  { key: "enemyShotInterval", label: "甲本丟字間隔", min: 1, max: 10, step: 0.5, unit: " 秒" },
  { key: "secondEnemyShotInterval", label: "乙本丟字間隔", min: 1, max: 12, step: 0.5, unit: " 秒" },
  { key: "enemyShotSpeed", label: "甲乙本國字速度", min: 50, max: 200, step: 10, unit: "" },
  { key: "enemyShotDamage", label: "甲乙本國字傷害", min: 1, max: 30, step: 1, unit: "" },
  { key: "spawnScale", label: "波次出怪速度", min: 0.5, max: 2, step: 0.1, unit: " 倍", format: (value) => value.toFixed(1) }
];
function loadSavedSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const result = { ...SETTING_DEFAULTS };
    for (const item of SETTING_CONTROLS) {
      const value = Number(saved[item.key]);
      if (Number.isFinite(value)) result[item.key] = Math.max(item.min, Math.min(item.max, value));
    }
    if (typeof saved.sound === "boolean") result.sound = saved.sound;
    if (typeof saved.vibration === "boolean") result.vibration = saved.vibration;
    return result;
  } catch (_) { return { ...SETTING_DEFAULTS }; }
}
let gameSettings = loadSavedSettings();
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(gameSettings)); } catch (_) { /* 儲存空間不可用時仍可正常遊玩 */ }
}
function loadBestRecord() {
  try { const value = Number(localStorage.getItem(RECORD_KEY)); return Number.isFinite(value) && value > 0 ? value : 0; } catch (_) { return 0; }
}
let bestRecord = loadBestRecord();
let PLAYER_SPEED = gameSettings.playerSpeed; // 請改上面的 playerSpeed
let PLAYER_HEALTH = gameSettings.playerHealth; // 請改上面的 playerHealth
const ENEMY_LIMIT = UPGRADE_TUNING.enemyLimit; // 請改上面的 enemyLimit
const ENEMY_TYPES = [
  { id: "jaben", name: "甲本", color: "#d58b55", speed: gameSettings.enemySpeed, radius: UPGRADE_TUNING.enemyRadius, damage: UPGRADE_TUNING.enemyDamage, hp: gameSettings.enemyHealth },
  { id: "otsubon", name: "乙本", color: "#a879d8", speed: gameSettings.secondEnemySpeed, radius: 15, damage: UPGRADE_TUNING.secondEnemyDamage, hp: gameSettings.secondEnemyHealth }
];
// ✏️ Erin 可以改每一波：開始秒數、甲本比例、乙本比例、幾秒出一隻。
// 比例加起來請等於 1；秒數越小，怪物越常出現。
const WAVES = [
  { start: 0, jaben: 1, otsubon: 0, every: 1.84 }, // 一開始只有甲本，慢慢熟悉玩法
  { start: 20, jaben: 0.8, otsubon: 0.2, every: 1.495 }, // 20 秒後少量乙本加入
  { start: 35, jaben: 0.58, otsubon: 0.42, every: 1.15 }, // 35 秒後乙本變多
  { start: 60, jaben: 0.45, otsubon: 0.55, every: 0.8625 }, // 60 秒後出怪更快
  { start: 90, jaben: 0.35, otsubon: 0.65, every: 0.6325 },
  { start: 105, jaben: 0.35, otsubon: 0.65, every: 0.5175 } // 老師出場前最熱鬧
];
const SPRITES = { player: null, jaben: null, otsubon: null }; // 填入 assets 裡的 PNG 檔名；null 使用內建圖案
for (const name of Object.keys(SPRITES)) {
  const filename = SPRITES[name];
  if (!filename) continue;
  SPRITES[name] = null; // 載入完成前（或載入失敗）繼續使用內建圖案
  const picture = new Image();
  picture.onload = () => { SPRITES[name] = picture; };
  picture.src = `assets/${filename}`;
}
// ✏️ Erin 可以改水星人的顏色；每個字是一個像素，句點是透明。
const HERO_COLORS = { o: "#183b70", d: "#2464bb", b: "#388de6", l: "#78cfff", h: "#d6f6ff", w: "#ffffff", p: "#142e57", c: "#98dffa" };
const HERO_PIXELS = [
  "..........o.........",
  ".........olo........",
  ".....o...olbo.......",
  ".....olo.olbo..o....",
  "......oloolbo.olo...",
  "......ollllboolbo...",
  ".......olllbbldo....",
  ".......olllbbdo.....",
  "......ollllbbbdo....",
  ".....olhlllbbbbdo...",
  "....olhhlllbbbbddo..",
  "...olhhllllbbbbdddo.",
  "..olhllllllbbbbdddo.",
  "..ollllllllbbbbdddo.",
  ".ollllllllbbbbbddddo",
  ".olllllllbbbbbbddddo",
  ".olllllllbbbbbbddddo",
  ".olllllllbbbbbbddddo",
  "..olllllbbbbbbddddo.",
  "..olllllbbbbbbddddo.",
  "...ollllbbbbbddddo..",
  "....odbbbbbbddddo...",
  ".....ooddddddoo.....",
  ".......oooooo......."
];
// 只在開啟遊戲時畫兩張小圖；每幀直接貼圖，避免反覆建立像素。
function makeHeroPicture(hurt) {
  const picture = document.createElement("canvas");
  picture.width = 20; picture.height = 24;
  const pen = picture.getContext("2d");
  HERO_PIXELS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === ".") continue;
      pen.fillStyle = HERO_COLORS[row[x]]; pen.fillRect(x, y, 1, 1);
    }
  });
  function pixels(color, x, y, w, h) { pen.fillStyle = HERO_COLORS[color]; pen.fillRect(x, y, w, h); }
  if (hurt) {
    // 痛痛時閉眼，嘴巴變成小小的 O。
    for (const x of [5, 12]) {
      pixels("p", x, 13, 1, 1); pixels("p", x + 1, 14, 2, 1); pixels("p", x, 15, 1, 1);
    }
    pixels("p", 9, 17, 3, 3); pixels("h", 10, 18, 1, 1);
  } else {
    for (const x of [4, 11]) {
      pixels("o", x, 12, 5, 5); pixels("w", x, 12, 4, 4);
      pixels("p", x + 2, 13, 2, 3); pixels("w", x + 2, 13, 1, 1);
    }
    pixels("p", 8, 18, 1, 1); pixels("p", 9, 19, 3, 1); pixels("p", 12, 18, 1, 1);
  }
  pixels("c", 3, 17, 3, 1); pixels("c", 14, 17, 3, 1);
  return picture;
}
const HERO_PICTURES = { happy: makeHeroPicture(false), hurt: makeHeroPicture(true) };
const INVINCIBLE_SECONDS = UPGRADE_TUNING.invincibleSeconds; // 請改上面的 invincibleSeconds
let SHOT_INTERVAL = gameSettings.shotInterval; // 請改上面的 shotInterval
const PROJECTILE_DAMAGE = UPGRADE_TUNING.projectileDamage; // 請改上面的 projectileDamage
const PROJECTILE_SPEED = UPGRADE_TUNING.projectileSpeed; // 請改上面的 projectileSpeed
const PROJECTILE_LIMIT = UPGRADE_TUNING.projectileLimit; // 請改上面的 projectileLimit
const GEM_LIMIT = UPGRADE_TUNING.gemLimit; // 請改上面的 gemLimit
const GEM_PULL_RADIUS = UPGRADE_TUNING.gemPullRadius; // 請改上面的 gemPullRadius
const XP_TO_LEVEL = UPGRADE_TUNING.xpToLevel; // 請改上面的 xpToLevel
const MAX_DT = 0.05;
const HIT_FLASH_SECONDS = 0.08;
const KNOCKBACK_SPEED = 90;
const WATER_COLOR = "#168cff"; // Erin 可以改水球顏色
const GEM_COLOR = "#ff9f24"; // Erin 可以改經驗寶石顏色


// Erin 可以在這裡調整升級卡；專屬卡等 Erin 決定名稱、圖示和效果後再加入。
const UPGRADES = [
  // 水球加大：改 waterSizePerLevel、damagePerLevel。
  { id: "big-water", icon: "💧", name: "水球加大", description: "水球更大、傷害更高" },
  // 連發水球：改 fireRateReduction。
  { id: "rapid-water", icon: "⚡", name: "連發水球", description: "發射速度提升" },
  // 多重水球：目前每升一級多射一顆，角度改 extraShotAngle。
  { id: "multi-water", icon: "🌊", name: "多重水球", description: "每次多發一顆" },
  // 洋蔥衝刺：改 moveSpeedPerLevel。
  { id: "onion-dash", icon: "🧅", name: "洋蔥衝刺", description: "移動速度提升" },
  // 泡泡護盾：目前每升一級增加五分之一血條。
  { id: "bubble-shield", icon: "❤️", name: "泡泡護盾", description: "血條變長一點，並回一點血" },
  // 寶石磁鐵：改 magnetPerLevel。
  { id: "gem-magnet", icon: "🧲", name: "寶石磁鐵", description: "撿取範圍提升" },
  // 穿透水球：每升一級多穿透一隻，不需要改數字。
  { id: "piercing-water", icon: "🫧", name: "穿透水球", description: "水球多穿透一隻敵人" },
  // 水花四濺：改 splashBaseRadius 和 splashPerLevel。
  { id: "splash-water", icon: "💦", name: "水花四濺", description: "命中時造成小範圍傷害" },
  // 自動補血：改 autoHealSeconds，升級後每級回血間隔再快約 20%。
  { id: "auto-heal", icon: "🩹", name: "自動補血", description: "慢慢恢復血條" }
];

const stage = document.getElementById("stage");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const titleEl = document.getElementById("messageTitle");
const textEl = document.getElementById("messageText");
const iconEl = document.getElementById("messageIcon");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const healthFill = document.getElementById("healthFill");
const statusEl = document.getElementById("status");
const experienceFill = document.getElementById("experienceFill");
const bossHud = document.getElementById("bossHud");
const bossHealthFill = document.getElementById("bossHealthFill");
const levelLabel = document.getElementById("levelLabel");
const messageCard = document.querySelector(".message-card");
const upgradePanel = document.getElementById("upgradePanel");
const upgradeCards = document.getElementById("upgradeCards");
const settingsPanel = document.getElementById("settingsPanel");
const settingsControls = document.getElementById("settingsControls");
const settingsButton = document.getElementById("settingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const resetSettingsButton = document.getElementById("resetSettingsButton");
const soundToggle = document.getElementById("soundToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

const actionControls = document.getElementById("actionControls");
const dashButton = document.getElementById("dashButton");
const skillButton = document.getElementById("skillButton");
const portraitHint = document.getElementById("portraitHint");
const closePortraitHint = document.getElementById("closePortraitHint");
let portraitHintSeen = false;
try { portraitHintSeen = localStorage.getItem("erin-survivor-portrait-hint-v1") === "seen"; } catch (_) {}

const enemyNotice = document.getElementById("enemyNotice");
const BOOK_CHARACTERS = ["甲", "乙", "字", "考", "寫", "讀"];

const state = { dashTimer: 0, dashCooldown: 0, skillCooldown: 0, dashX: 1, dashY: 0, faceX: 1, faceY: 0, bomb: null, bombBlast: null, mode: "ready", player: { x: 0, y: 0, r: 18, health: PLAYER_HEALTH, invincible: 0, hitFlash: 0, walkPhase: 0, moving: false, facing: 1 }, enemies: [], projectiles: [], enemyShots: [], enemyShotPool: [], bookShotTimer: 0, bookNoticeTimer: 0, bookShootingStarted: false, gems: [], effects: [], projectilePool: [], gemPool: [], effectPool: [], keys: new Set(), pointerId: null, joy: null, elapsed: 0, spawnTimer: 0, shotTimer: 0, healTimer: 0, boss: null, bossShotTimer: 0, bossSummonTimer: 0, bossIntro: 0, xp: 0, level: 1, upgrades: {}, pendingChoices: [], lastTime: 0, width: 0, height: 0 };

let sharedAudio = null;
function startAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudio) sharedAudio = new AudioContextClass();
    if (sharedAudio.state === "suspended") sharedAudio.resume();
  } catch (_) { /* 裝置不支援音效時，遊戲仍可正常遊玩 */ }
}
function playTone(frequency, duration = 0.07, type = "sine") {
  if (!gameSettings.sound) return;
  try {
    if (!sharedAudio || sharedAudio.state !== "running") return;
    const oscillator = sharedAudio.createOscillator(), gain = sharedAudio.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.055, sharedAudio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sharedAudio.currentTime + duration);
    oscillator.connect(gain); gain.connect(sharedAudio.destination);
    oscillator.start(); oscillator.stop(sharedAudio.currentTime + duration);
  } catch (_) { /* 裝置不支援音效時，遊戲仍可正常遊玩 */ }
}

function updateSettingsButtons() {
  soundToggle.textContent = gameSettings.sound ? "🔊 音效：開" : "🔇 音效：關";
  vibrationToggle.textContent = gameSettings.vibration ? "📳 震動：開" : "📳 震動：關";
}

function updateSettingValue(key, value) {
  gameSettings[key] = Number(value);
  const enemy = ENEMY_TYPES;
  enemy[0].speed = gameSettings.enemySpeed; enemy[0].hp = gameSettings.enemyHealth;
  enemy[1].speed = gameSettings.secondEnemySpeed; enemy[1].hp = gameSettings.secondEnemyHealth;
  PLAYER_SPEED = gameSettings.playerSpeed; PLAYER_HEALTH = gameSettings.playerHealth; SHOT_INTERVAL = gameSettings.shotInterval;
  if (state.mode !== "playing" && state.mode !== "levelup") state.player.health = PLAYER_HEALTH;
  saveSettings(); updateHud(); updateActionControls();
}

function makeSettingsControls() {
  settingsControls.innerHTML = "";
  for (const setting of SETTING_CONTROLS) {
    const row = document.createElement("label"); row.className = "setting-row";
    const heading = document.createElement("span"); heading.className = "setting-heading";
    const name = document.createElement("strong"); name.textContent = setting.label;
    const value = document.createElement("span"); value.className = "setting-value";
    const range = document.createElement("input"); range.type = "range"; range.min = setting.min; range.max = setting.max; range.step = setting.step; range.value = gameSettings[setting.key];
    const showValue = () => { const shown = setting.format ? setting.format(Number(range.value)) : range.value; value.textContent = `${shown}${setting.unit}`; };
    range.setAttribute("aria-label", setting.label);
    range.addEventListener("input", () => { showValue(); updateSettingValue(setting.key, range.value); });
    heading.append(name, value); row.append(heading, range); settingsControls.appendChild(row); showValue();
  }
  updateSettingsButtons();
}

let settingsReturnMode = "ready";
function openSettings() {
  if (state.mode === "playing") togglePause();
  settingsReturnMode = state.mode;
  makeSettingsControls(); messageCard.hidden = true; upgradePanel.hidden = true;
  settingsPanel.hidden = false; overlay.classList.remove("hidden");
}
function closeSettings() {
  settingsPanel.hidden = true; messageCard.hidden = false;
  showOverlay(settingsReturnMode);
}

function takeFromPool(pool, values) {
  const item = pool.pop() || {};
  Object.assign(item, values);
  return item;
}

function resize() {
  const rect = stage.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = Math.max(1, rect.width);
  state.height = Math.max(1, rect.height);
  canvas.width = Math.round(state.width * ratio);
  canvas.height = Math.round(state.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (state.mode === "ready") { state.player.x = state.width / 2; state.player.y = state.height / 2; }
  state.player.x = Math.max(state.player.r, Math.min(state.width - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(state.height - state.player.r, state.player.y));
}

function resetGame() {
  state.dashTimer = 0; state.dashCooldown = 0; state.skillCooldown = 0;
  state.dashX = 1; state.dashY = 0; state.faceX = 1; state.faceY = 0;
  state.bomb = null; state.bombBlast = null; state.pointerId = null;
  for (const item of state.projectiles) state.projectilePool.push(item);
  for (const item of state.gems) state.gemPool.push(item);
  for (const item of state.effects) state.effectPool.push(item);
  state.player = { x: state.width / 2, y: state.height / 2, r: 18, health: PLAYER_HEALTH, invincible: 0, hitFlash: 0, walkPhase: 0, moving: false, facing: 1 };
  state.enemies = [];
  for (const item of state.enemyShots) state.enemyShotPool.push(item);
  state.enemyShots = [];
  state.bookShotTimer = 0; state.bookNoticeTimer = 0; state.bookShootingStarted = false;
  enemyNotice.hidden = true;
  state.boss = null; state.bossShotTimer = 0; state.bossSummonTimer = 0; state.bossIntro = 0;
  state.projectiles = [];
  state.gems = [];
  state.effects = [];
  state.elapsed = 0;
  state.spawnTimer = 0.5;
  state.shotTimer = 0.15;
  state.healTimer = 0;
  state.xp = 0;
  state.level = 1;
  state.upgrades = {}; state.pendingChoices = [];
  state.keys.clear();
  state.joy = null;
  state.player.health = PLAYER_HEALTH;
  updateHud();
}

function startGame() {
  resetGame();
  state.mode = "playing";
  overlay.classList.add("hidden");
  pauseButton.textContent = "Ⅱ";
  state.lastTime = performance.now();
  scheduleFrame();
  spawnEnemy();
  updateActionControls(); maybeShowPortraitHint();
  playTone(520, 0.1, "triangle");
}

function finishRun(won) {
  bestRecord = Math.max(bestRecord, Math.floor(state.elapsed));
  try { localStorage.setItem(RECORD_KEY, String(bestRecord)); } catch (_) { /* 無法儲存紀錄時不影響結算 */ }
  playTone(won ? 880 : 220, 0.28, "triangle");
  showOverlay(won ? "won" : "over");
}

function showOverlay(mode) {
  state.mode = mode;
  state.keys.clear(); state.pointerId = null; state.joy = null;
  updateActionControls(); portraitHint.hidden = true;
  overlay.classList.remove("hidden"); messageCard.hidden = false; upgradePanel.hidden = true; settingsPanel.hidden = true;
  if (mode === "paused") { iconEl.textContent = "⏸️"; titleEl.textContent = "先休息一下"; textEl.textContent = "準備好了再繼續玩。"; startButton.textContent = "繼續遊戲"; statusEl.textContent = "已暫停"; pauseButton.textContent = "▶"; }
  else if (mode === "over") { iconEl.textContent = "💫"; titleEl.textContent = "再試一次！"; textEl.textContent = `水星人的血條用完了。這次撐了 ${Math.floor(state.elapsed)} 秒。${bestRecord ? ` 最佳紀錄：${bestRecord} 秒。` : ""}`; startButton.textContent = "重新開始"; statusEl.textContent = "本局結束"; pauseButton.textContent = "Ⅱ"; }
  else if (mode === "won") { iconEl.textContent = "🎉"; titleEl.textContent = "打敗老師了！"; textEl.textContent = `老師的血條清空，這一局勝利！${bestRecord ? ` 最佳紀錄：${bestRecord} 秒。` : ""}`; startButton.textContent = "再玩一次"; statusEl.textContent = "勝利！"; pauseButton.textContent = "Ⅱ"; }
  else { iconEl.textContent = "🧅"; titleEl.textContent = "小怪獸"; textEl.textContent = "用搖桿或方向鍵移動，💨 衝刺躲字、🌀 放泡泡炸彈！"; startButton.textContent = "開始遊戲"; statusEl.textContent = "準備開始"; }
}

function updateHud() {
  const maxHealth = PLAYER_HEALTH + upgradeLevel("bubble-shield") * Math.ceil(PLAYER_HEALTH / 5);
  const ratio = Math.max(0, state.player.health / maxHealth);
  healthFill.style.width = `${ratio * 100}%`;
  healthFill.style.background = ratio < 0.3 ? "linear-gradient(#ff8585 0 48%, #e13e4d 49%)" : "linear-gradient(#5be08b 0 48%, #24b75c 49%)";
  experienceFill.style.width = `${state.xp / experienceNeeded() * 100}%`;
  levelLabel.textContent = `Lv.${state.level}`;
  bossHud.hidden = !state.boss;
  if (state.boss) bossHealthFill.style.width = `${Math.max(0, state.boss.hp / state.boss.maxHp) * 100}%`;
}

function spawnEnemy() {
  if (state.enemies.length >= ENEMY_LIMIT) return;
  let wave = WAVES[0];
  for (const row of WAVES) if (state.elapsed >= row.start) wave = row;
  const configuredTypes = [
    { ...ENEMY_TYPES[0], speed: gameSettings.enemySpeed, hp: gameSettings.enemyHealth },
    { ...ENEMY_TYPES[1], speed: gameSettings.secondEnemySpeed, hp: gameSettings.secondEnemyHealth }
  ];
  const type = Math.random() < wave.otsubon / (wave.jaben + wave.otsubon) ? configuredTypes[1] : configuredTypes[0];
  const side = Math.floor(Math.random() * 4);
  const pad = type.radius + 3;
  let x = side === 0 ? -pad : side === 1 ? state.width + pad : Math.random() * state.width;
  let y = side === 2 ? -pad : side === 3 ? state.height + pad : Math.random() * state.height;
  if (Math.hypot(x - state.player.x, y - state.player.y) < Math.min(state.width, state.height) * 0.32) { x = side < 2 ? x : (x + state.width / 2) % state.width; y = side >= 2 ? y : (y + state.height / 2) % state.height; }
  state.enemies.push({ typeId: type.id, x, y, r: type.radius, speed: type.speed, damage: type.damage, color: type.color, hp: type.hp, maxHp: type.hp, wobble: Math.random() * Math.PI * 2, alive: true, flash: 0, shotCooldown: Math.random() * bookShotInterval(type.id) });
}

function bookShotInterval(typeId) {
  return typeId === "otsubon" ? gameSettings.secondEnemyShotInterval : gameSettings.enemyShotInterval;
}

function startBookShooting() {
  if (state.bookShootingStarted || state.level < gameSettings.enemyShootLevel) return;
  state.bookShootingStarted = true; state.bookNoticeTimer = 4;
  enemyNotice.textContent = "甲本開始丟字了！"; enemyNotice.hidden = false;
}

function updateBookShooting(dt) {
  if (state.level < gameSettings.enemyShootLevel || state.bossIntro > 0) return;
  state.bookShotTimer = Math.max(0, state.bookShotTimer - dt);
  for (const enemy of state.enemies) enemy.shotCooldown = Math.max(0, enemy.shotCooldown - dt);
  if (state.bookShotTimer > 0 || state.enemyShots.filter((shot) => shot.source === "book").length >= UPGRADE_TUNING.enemyShotLimit) return;
  // 每次只選一隻準備好的小兵；離開畫面的、被打倒的都不能丟字。
  const ready = state.enemies.filter((enemy) => enemy.alive && enemy.shotCooldown <= 0 && enemy.x >= enemy.r && enemy.x <= state.width - enemy.r && enemy.y >= enemy.r && enemy.y <= state.height - enemy.r);
  if (!ready.length) return;
  const enemy = ready[Math.floor(Math.random() * ready.length)];
  const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
  state.enemyShots.push(takeFromPool(state.enemyShotPool, {
    source: "book", x: enemy.x, y: enemy.y, vx: Math.cos(angle) * gameSettings.enemyShotSpeed, vy: Math.sin(angle) * gameSettings.enemyShotSpeed,
    text: BOOK_CHARACTERS[Math.floor(Math.random() * BOOK_CHARACTERS.length)], r: 12, damage: gameSettings.enemyShotDamage
  }));
  enemy.shotCooldown = bookShotInterval(enemy.typeId);
  state.bookShotTimer = UPGRADE_TUNING.enemyShotGap;
}

function summonTeacher() {
  state.boss = { x: state.width / 2, y: -64, r: 32, speed: 24, hp: gameSettings.teacherHealth, maxHp: gameSettings.teacherHealth, flash: 0, wobble: 0 };
  state.bossShotTimer = UPGRADE_TUNING.teacherShotInterval; state.bossSummonTimer = UPGRADE_TUNING.teacherSummonSeconds; state.bossIntro = 2.2;
  updateHud();
}

function closestEnemy() {
  let target = null, best = Infinity;
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const distance = (enemy.x - state.player.x) ** 2 + (enemy.y - state.player.y) ** 2;
    if (distance < best) { best = distance; target = enemy; }
  }
  if (state.boss) {
    const distance = (state.boss.x - state.player.x) ** 2 + (state.boss.y - state.player.y) ** 2;
    if (distance < best) target = state.boss;
  }
  return target;
}

function fireAtNearest() {
  const target = closestEnemy();
  if (!target || state.projectiles.length >= PROJECTILE_LIMIT) return;
  const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x);
  const count = 1 + upgradeLevel("multi-water");
  for (let i = 0; i < count && state.projectiles.length < PROJECTILE_LIMIT; i++) {
    const spread = (i - (count - 1) / 2) * UPGRADE_TUNING.extraShotAngle, a = angle + spread;
    state.projectiles.push(takeFromPool(state.projectilePool, { x: state.player.x, y: state.player.y, vx: Math.cos(a) * PROJECTILE_SPEED, vy: Math.sin(a) * PROJECTILE_SPEED, r: state.player.r * 2 / 3 * (1 + upgradeLevel("big-water") * UPGRADE_TUNING.waterSizePerLevel), damage: effectiveDamage(), piercing: upgradeLevel("piercing-water") > 0, pierce: upgradeLevel("piercing-water"), hitList: [], alive: true }));
  }
}

// 命中時在水球位置留下水花；即使粒子很多也保留這個提示。
function resolveWaterHit(shot) {
  const continues = shot.pierce > 0;
  if (continues) shot.pierce--; else shot.alive = false;
  if (state.effects.length >= 90) state.effectPool.push(state.effects.shift());
  state.effects.push(takeFromPool(state.effectPool, { kind: "water-hit", x: shot.x, y: shot.y, vx: 0, vy: -18, color: continues ? "#ffffff" : "#168cff", life: 0.35, maxLife: 0.35, text: continues ? "穿！" : "啪" }));
  burst(shot.x, shot.y, "#75d7ff", 5);
}

function burst(x, y, color, count = 8) {
  for (let i = 0; i < count && state.effects.length < 90; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 45 + Math.random() * 110;
    state.effects.push(takeFromPool(state.effectPool, { kind: "spark", x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color, life: 0.42 + Math.random() * 0.22, maxLife: 0.64, text: "" }));
  }
}

function damageEnemy(enemy, damage = effectiveDamage()) {
  enemy.hp -= damage;
  enemy.flash = HIT_FLASH_SECONDS; enemy.knockX = enemy.x - state.player.x; enemy.knockY = enemy.y - state.player.y; enemy.knockback = KNOCKBACK_SPEED;
  if (enemy.hp <= 0) playTone(620, 0.09, "triangle");
  if (state.effects.length < 90) state.effects.push(takeFromPool(state.effectPool, { kind: "number", x: enemy.x, y: enemy.y - enemy.r, vx: 0, vy: -28, color: "#fff", life: 0.7, maxLife: 0.7, text: `${Math.round(damage)}` }));
  if (enemy.hp <= 0) {
    enemy.alive = false;
    if (state.effects.length < 90) state.effects.push(takeFromPool(state.effectPool, { kind: "evaporate", x: enemy.x, y: enemy.y, vx: 0, vy: 0, color: "#ffe2a8", life: 0.42, maxLife: 0.42, text: "" }));
    burst(enemy.x, enemy.y, "#ffe2a8", 8);
    if (state.gems.length < GEM_LIMIT) state.gems.push(takeFromPool(state.gemPool, { x: enemy.x, y: enemy.y, r: 8, value: 1, alive: true, wobble: Math.random() * 6 }));
  } else burst(enemy.x, enemy.y, "#ffffff", 4);
}

function upgradeLevel(id) { return state.upgrades[id] || 0; }
function effectiveDamage() { return PROJECTILE_DAMAGE * (1 + upgradeLevel("big-water") * UPGRADE_TUNING.damagePerLevel); }
function effectiveShotInterval() { return Math.max(0.12, SHOT_INTERVAL * (1 - upgradeLevel("rapid-water") * UPGRADE_TUNING.fireRateReduction)); }
function maxPlayerHealth() { return PLAYER_HEALTH + upgradeLevel("bubble-shield") * Math.ceil(PLAYER_HEALTH / 5); }
function addHealEffect() {
  if (state.effects.length >= 90) return;
  state.effects.push(takeFromPool(state.effectPool, { kind: "heal", x: state.player.x, y: state.player.y - state.player.r, vx: 0, vy: -24, color: "#21b85b", life: 0.8, maxLife: 0.8, text: "+1" }));
}
function chooseUpgradeCards() {
  const available = UPGRADES.filter((card) => upgradeLevel(card.id) < UPGRADE_TUNING.maxUpgradeLevel);
  if (!available.length) { state.pendingChoices = [{ id: "heal", icon: "❤️", name: "回血", description: "恢復 1 顆心" }]; }
  else {
    const shuffled = available.slice();
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    state.pendingChoices = shuffled.slice(0, Math.min(3, shuffled.length));
  }
  showUpgradeChoices();
}
function showUpgradeChoices() {
  render();
  state.mode = "levelup"; state.keys.clear(); state.pointerId = null; state.joy = null; updateActionControls(); portraitHint.hidden = true; overlay.classList.remove("hidden"); messageCard.hidden = true; upgradePanel.hidden = false; upgradeCards.innerHTML = "";
  state.pendingChoices.forEach((card, index) => {
    const level = card.id === "heal" ? "" : `Lv.${upgradeLevel(card.id)} → Lv.${upgradeLevel(card.id) + 1}`;
    const button = document.createElement("button"); button.className = "upgrade-card"; button.type = "button";
    button.innerHTML = `<span class="upgrade-icon">${card.icon}</span><strong>${card.name}</strong><span>${card.description}</span><small>${level}</small>`;
    button.addEventListener("click", () => applyUpgrade(index)); upgradeCards.appendChild(button);
  });
  statusEl.textContent = "選一張升級卡";
}
function applyUpgrade(index) {
  const card = state.pendingChoices[index]; if (!card || state.mode !== "levelup") return;
  if (card.id === "heal") state.player.health = Math.min(PLAYER_HEALTH + upgradeLevel("bubble-shield") * Math.ceil(PLAYER_HEALTH / 5), state.player.health + Math.ceil(PLAYER_HEALTH / 5));
  else { state.upgrades[card.id] = upgradeLevel(card.id) + 1; if (card.id === "bubble-shield") { state.player.health += Math.ceil(PLAYER_HEALTH / 5); } }
  state.pendingChoices = []; overlay.classList.add("hidden"); state.mode = "playing"; pauseButton.textContent = "Ⅱ"; updateActionControls(); updateHud(); state.lastTime = performance.now(); scheduleFrame();
}
function experienceNeeded() { return XP_TO_LEVEL + (state.level - 1) * UPGRADE_TUNING.xpGrowthPerLevel; }
function grantExperience(value) {
  state.xp += value;
  if (state.xp >= experienceNeeded()) { state.xp -= experienceNeeded(); state.level++; startBookShooting(); updateHud(); chooseUpgradeCards(); } else updateHud();
}
function countdown(value, dt) { return value - dt < 0.000001 ? 0 : value - dt; }
function movementInput() {
  let x = 0, y = 0;
  if (state.keys.has("ArrowLeft") || state.keys.has("a")) x--;
  if (state.keys.has("ArrowRight") || state.keys.has("d")) x++;
  if (state.keys.has("ArrowUp") || state.keys.has("w")) y--;
  if (state.keys.has("ArrowDown") || state.keys.has("s")) y++;
  if (state.joy) { x += state.joy.x; y += state.joy.y; }
  const length = Math.max(1, Math.hypot(x, y));
  return { x: x / length, y: y / length };
}
function activateDash() {
  if (state.mode !== "playing" || state.dashCooldown > 0) return;
  const input = movementInput(), length = Math.hypot(input.x, input.y);
  state.dashX = length > 0.01 ? input.x / length : state.faceX;
  state.dashY = length > 0.01 ? input.y / length : state.faceY;
  state.faceX = state.dashX; state.faceY = state.dashY;
  state.dashTimer = gameSettings.dashSeconds; state.dashCooldown = gameSettings.dashCooldown;
  state.player.invincible = Math.max(state.player.invincible, state.dashTimer);
  playTone(740, 0.08); updateActionControls();
}
function activateSkill() {
  if (state.mode !== "playing" || state.skillCooldown > 0 || state.bomb) return;
  state.bomb = { x: state.player.x, y: state.player.y, timer: gameSettings.bombDelay,
    delay: gameSettings.bombDelay, radius: gameSettings.bombRadius, damage: gameSettings.bombDamage, knockback: gameSettings.bombKnockback };
  state.skillCooldown = gameSettings.bombCooldown;
  playTone(480, 0.12); updateActionControls();
}
function updateBomb(dt) {
  if (state.bombBlast) { state.bombBlast.life -= dt; if (state.bombBlast.life <= 0) state.bombBlast = null; }
  const bomb = state.bomb;
  if (!bomb) return;
  bomb.timer -= dt;
  if (bomb.timer > 0.000001) return;
  state.bomb = null; state.bombBlast = { x: bomb.x, y: bomb.y, radius: bomb.radius, life: 0.35 };
  function pushAway(target) {
    const dx = target.x - bomb.x, dy = target.y - bomb.y, length = Math.hypot(dx, dy);
    target.x += (length > 0.01 ? dx / length : 1) * bomb.knockback;
    target.y += (length > 0.01 ? dy / length : 0) * bomb.knockback;
  }
  for (const enemy of state.enemies) {
    if (!enemy.alive || Math.hypot(enemy.x - bomb.x, enemy.y - bomb.y) > bomb.radius + enemy.r) continue;
    damageEnemy(enemy, bomb.damage);
    if (enemy.alive) { pushAway(enemy); enemy.knockback = 0; }
  }
  if (state.boss && state.bossIntro <= 0 && Math.hypot(state.boss.x - bomb.x, state.boss.y - bomb.y) <= bomb.radius + state.boss.r) {
    state.boss.hp -= bomb.damage; state.boss.flash = HIT_FLASH_SECONDS; pushAway(state.boss); updateHud();
    if (state.boss.hp <= 0) { state.boss = null; finishRun(true); }
  }
  burst(bomb.x, bomb.y, "#80eaff", 20); playTone(230, 0.18, "triangle");
}
function updateActionControls() {
  actionControls.hidden = state.mode !== "playing";
  actionControls.style.cssText = `--action-size: ${gameSettings.actionButtonSize}px`;
  for (const [button, remaining, total, label] of [
    [dashButton, state.dashCooldown, gameSettings.dashCooldown, "衝刺"],
    [skillButton, state.skillCooldown, gameSettings.bombCooldown, "泡泡炸彈"]
  ]) {
    const ready = remaining <= 0;
    button.style.background = `conic-gradient(#9df6ff ${Math.max(0, 1 - remaining / total) * 360}deg, #375776 0deg)`;
    button.setAttribute("aria-disabled", String(!ready || state.mode !== "playing"));
    button.setAttribute("aria-label", ready ? label + "準備好了" : label + "冷卻中");
    button.querySelector && (button.querySelector("small").textContent = ready ? "就緒" : `${Math.ceil(remaining)} 秒`);
  }
}
function maybeShowPortraitHint() {
  if (state.mode !== "playing" || portraitHintSeen || window.innerWidth >= window.innerHeight) return;
  portraitHint.hidden = false; portraitHintSeen = true;
  try { localStorage.setItem("erin-survivor-portrait-hint-v1", "seen"); } catch (_) {}
}
closePortraitHint.addEventListener("click", () => { portraitHint.hidden = true; });
for (const [button, activate] of [[dashButton, activateDash], [skillButton, activateSkill]]) {
  button.addEventListener("pointerdown", (event) => { event.preventDefault(); event.stopPropagation(); activate(); });
  // 鍵盤與輔助操作仍可使用原生按鈕 click；指標按下已觸發，不重複施放。
  button.addEventListener("click", (event) => { if (event.detail === 0) activate(); });
}

function tick(dt) {
  if (state.mode !== "playing") return;
  state.elapsed += dt;
  startBookShooting();
  state.bookNoticeTimer = Math.max(0, state.bookNoticeTimer - dt);
  enemyNotice.hidden = state.bookNoticeTimer <= 0;
  const healLevel = upgradeLevel("auto-heal");
  if (healLevel > 0) {
    state.healTimer += dt;
    const healInterval = UPGRADE_TUNING.autoHealSeconds * Math.pow(0.8, healLevel - 1);
    while (state.healTimer >= healInterval) {
      state.healTimer -= healInterval;
      if (state.player.health < maxPlayerHealth()) {
        state.player.health = Math.min(maxPlayerHealth(), state.player.health + 1);
        addHealEffect();
        updateHud();
      }
    }
  }
  const input = movementInput();
  let dx = input.x, dy = input.y;
  if (Math.hypot(dx, dy) > 0.01) {
    const length = Math.hypot(dx, dy); state.faceX = dx / length; state.faceY = dy / length;
  }
  const dashTime = Math.min(dt, state.dashTimer);
  const speed = PLAYER_SPEED * (1 + upgradeLevel("onion-dash") * UPGRADE_TUNING.moveSpeedPerLevel);
  const oldX = state.player.x, oldY = state.player.y;
  state.player.x += speed * (dx * (dt - dashTime) + state.dashX * gameSettings.dashMultiplier * dashTime);
  state.player.y += speed * (dy * (dt - dashTime) + state.dashY * gameSettings.dashMultiplier * dashTime);
  state.player.x = Math.max(state.player.r, Math.min(state.width - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(state.height - state.player.r, state.player.y));
  // 這幀有衝刺就保護到碰撞判斷結束，最後才扣時間。
  if (state.dashTimer > 0) state.player.invincible = Math.max(state.player.invincible, dt);
  state.dashTimer = countdown(state.dashTimer, dt);
  state.dashCooldown = countdown(state.dashCooldown, dt);
  state.skillCooldown = countdown(state.skillCooldown, dt);
  updateActionControls();
  updateBomb(dt);
  if (state.mode !== "playing") return;

  const moved = Math.hypot(state.player.x - oldX, state.player.y - oldY);
  state.player.moving = moved > 0.001;
  if (state.player.moving) state.player.walkPhase += moved / 12;
  else state.player.walkPhase = 0;
  if (state.player.x !== oldX) state.player.facing = state.player.x > oldX ? 1 : -1;

  state.spawnTimer -= dt;
  if (!state.boss && state.elapsed >= gameSettings.waveSeconds && state.bossIntro <= 0) summonTeacher();
  if (!state.boss) {
    let wave = WAVES[0];
    for (const row of WAVES) if (state.elapsed >= row.start) wave = row;
    const spawnEvery = wave.every / gameSettings.spawnScale;
    while (state.spawnTimer <= 0) { spawnEnemy(); state.spawnTimer += spawnEvery; }
  }
  if (state.boss && state.bossIntro <= 0) {
    state.bossSummonTimer -= dt;
    if (state.bossSummonTimer <= 0) {
      const count = UPGRADE_TUNING.teacherSummonMin + Math.floor(Math.random() * (UPGRADE_TUNING.teacherSummonMax - UPGRADE_TUNING.teacherSummonMin + 1));
      for (let i = 0; i < count; i++) spawnEnemy();
      state.bossSummonTimer += UPGRADE_TUNING.teacherSummonSeconds;
    }
  }
  if (state.bossIntro > 0) {
    state.bossIntro -= dt;
    for (const enemy of state.enemies) { enemy.x += (state.width / 2 - enemy.x) * Math.min(1, dt * 3); enemy.y += (state.height / 2 - enemy.y) * Math.min(1, dt * 3); }
    if (state.bossIntro <= 0) { burst(state.width / 2, state.height / 2, "#fff36b", 32); state.boss.y = Math.min(100, state.height * 0.25); updateHud(); }
  }
  state.shotTimer -= dt;
  if (state.shotTimer <= 0) { fireAtNearest(); state.shotTimer += effectiveShotInterval(); }
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const vx = state.player.x - enemy.x, vy = state.player.y - enemy.y;
    const distance = Math.max(0.01, Math.hypot(vx, vy));
    enemy.x += vx / distance * enemy.speed * (1 + Math.floor(state.elapsed / 30) * UPGRADE_TUNING.enemySpeedGrowth) * dt;
    enemy.y += vy / distance * enemy.speed * (1 + Math.floor(state.elapsed / 30) * UPGRADE_TUNING.enemySpeedGrowth) * dt;
    if (enemy.knockback > 0) { const k = Math.min(enemy.knockback, KNOCKBACK_SPEED) * dt; enemy.x += enemy.knockX / distance * k; enemy.y += enemy.knockY / distance * k; enemy.knockback = Math.max(0, enemy.knockback - KNOCKBACK_SPEED * dt); }
    enemy.wobble += dt * 6;
    enemy.flash = Math.max(0, enemy.flash - dt);
  }
  for (const shot of state.projectiles) {
    if (!shot.alive) continue;
    shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if (shot.x < -12 || shot.y < -12 || shot.x > state.width + 12 || shot.y > state.height + 12) { shot.alive = false; continue; }
    for (const enemy of state.enemies) {
      if (enemy.alive && !shot.hitList.includes(enemy) && Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < enemy.r + shot.r) {
        shot.hitList.push(enemy);
        damageEnemy(enemy, shot.damage);
        if (upgradeLevel("splash-water") > 0) {
          const radius = UPGRADE_TUNING.splashBaseRadius + upgradeLevel("splash-water") * UPGRADE_TUNING.splashPerLevel;
          for (const nearby of state.enemies) if (nearby !== enemy && nearby.alive && !shot.hitList.includes(nearby) && Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) < radius) { shot.hitList.push(nearby); damageEnemy(nearby, shot.damage * 0.35); }
        }
        resolveWaterHit(shot);
        if (!shot.alive) break;
      }
    }
    if (shot.alive && state.boss && !shot.hitList.includes(state.boss) && Math.hypot(state.boss.x - shot.x, state.boss.y - shot.y) < state.boss.r + shot.r) {
      shot.hitList.push(state.boss);
      state.boss.hp -= shot.damage; state.boss.flash = HIT_FLASH_SECONDS; updateHud();
      resolveWaterHit(shot);
      if (state.boss.hp <= 0) { state.boss = null; finishRun(true); return; }
    }
  }
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    if (!state.projectiles[i].alive) state.projectilePool.push(state.projectiles.splice(i, 1)[0]);
  }
  state.enemies = state.enemies.filter((enemy) => enemy.alive);
  updateBookShooting(dt);
  if (state.boss && state.bossIntro <= 0) {
    state.boss.wobble += dt * 3; state.boss.flash = Math.max(0, state.boss.flash - dt); updateHud();
    const bx = state.player.x - state.boss.x, by = state.player.y - state.boss.y, distance = Math.max(1, Math.hypot(bx, by));
    state.boss.x += bx / distance * state.boss.speed * dt; state.boss.y += by / distance * state.boss.speed * dt;
    state.bossShotTimer -= dt;
    if (state.bossShotTimer <= 0) {
      const angle = Math.atan2(by, bx), count = UPGRADE_TUNING.teacherShotCount;
      for (let i = 0; i < count && state.enemyShots.filter((shot) => shot.source !== "book").length < UPGRADE_TUNING.teacherShotLimit; i++) {
        const a = angle + (i - (count - 1) / 2) * UPGRADE_TUNING.teacherShotSpread;
        state.enemyShots.push(takeFromPool(state.enemyShotPool, { source: "teacher", damage: UPGRADE_TUNING.teacherShotDamage, x: state.boss.x, y: state.boss.y + 18, vx: Math.cos(a) * 135, vy: Math.sin(a) * 135, text: ["作業！", "認真！", "加油！"][i % 3], r: 17 }));
      }
      state.bossShotTimer += UPGRADE_TUNING.teacherShotInterval;
    }
  }
  for (let i = state.enemyShots.length - 1; i >= 0; i--) {
    const shot = state.enemyShots[i]; shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if (Math.hypot(shot.x - state.player.x, shot.y - state.player.y) < state.player.r + shot.r) {
      if (state.player.invincible <= 0) { state.player.health = Math.max(0, state.player.health - (shot.damage === undefined ? UPGRADE_TUNING.teacherShotDamage : shot.damage)); state.player.hitFlash = 0.16; state.player.invincible = INVINCIBLE_SECONDS; if (gameSettings.vibration && navigator.vibrate) navigator.vibrate(35); playTone(180, 0.12, "sawtooth"); updateHud(); }
      state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]);
    } else if (shot.x < -40 || shot.y < -40 || shot.x > state.width + 40 || shot.y > state.height + 40) state.enemyShotPool.push(state.enemyShots.splice(i, 1)[0]);
  }
  if (state.player.health <= 0) { finishRun(false); return; }
  for (const gem of state.gems) {
    if (!gem.alive) continue;
    gem.wobble += dt * 5;
    const dx = state.player.x - gem.x, dy = state.player.y - gem.y, distance = Math.hypot(dx, dy);
    const pullRadius = GEM_PULL_RADIUS * (1 + upgradeLevel("gem-magnet") * UPGRADE_TUNING.magnetPerLevel);
    if (distance < pullRadius && distance > 0.1) { const speed = 150 + (pullRadius - distance) * 3; gem.x += dx / distance * speed * dt; gem.y += dy / distance * speed * dt; }
    if (distance < state.player.r + gem.r + 3) { gem.alive = false; grantExperience(gem.value); if (state.mode === "levelup") break; }
  }
  if (state.mode === "levelup") return;
  for (let i = state.gems.length - 1; i >= 0; i--) {
    if (!state.gems[i].alive) state.gemPool.push(state.gems.splice(i, 1)[0]);
  }

  for (const effect of state.effects) { effect.life -= dt; effect.x += effect.vx * dt; effect.y += effect.vy * dt; }
  for (let i = state.effects.length - 1; i >= 0; i--) {
    if (state.effects[i].life <= 0) state.effectPool.push(state.effects.splice(i, 1)[0]);
  }
  // 先判斷碰撞，再減少無敵時間，避免最後一幀又被撞一次。
  if (state.player.invincible <= 0) {
    const touchingEnemy = state.enemies.find((enemy) => enemy.alive && Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) < enemy.r + state.player.r - 2);
    const touchingBoss = state.boss && state.bossIntro <= 0 && Math.hypot(state.boss.x - state.player.x, state.boss.y - state.player.y) < state.boss.r + state.player.r - 2;
    if (touchingEnemy || touchingBoss) {
      state.player.health = Math.max(0, state.player.health - (touchingEnemy ? touchingEnemy.damage : UPGRADE_TUNING.enemyDamage));
      state.player.invincible = INVINCIBLE_SECONDS;
      state.player.hitFlash = 0.16;
      if (gameSettings.vibration && navigator.vibrate) navigator.vibrate(35);
      playTone(180, 0.12, "sawtooth");
      updateHud();
    }
  }
  state.player.invincible = Math.max(0, state.player.invincible - dt);
  state.player.hitFlash = Math.max(0, state.player.hitFlash - dt);
  if (state.player.health <= 0) { finishRun(false); return; }
  statusEl.textContent = state.boss ? "老師出現！打完血條" : `躲避中　${Math.floor(state.elapsed)} 秒`;
}

function drawClassroom() {
  ctx.fillStyle = "#eaf4d5"; ctx.fillRect(0, 0, state.width, state.height);
  // 淡色方格地磚
  const size = 42;
  ctx.strokeStyle = "rgba(91,137,91,.12)"; ctx.lineWidth = 1;
  for (let x = 0; x < state.width; x += size) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.height); ctx.stroke(); }
  for (let y = 0; y < state.height; y += size) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke(); }
  // 教室牆邊的小彩色櫃子
  ctx.fillStyle = "#f4c76e"; ctx.fillRect(14, 42, 72, 18); ctx.fillStyle = "#9bc7e8"; ctx.fillRect(92, 42, 55, 18);
}

function drawHero() {
  const p = state.player;
  // 遊戲時間暫停時，彈跳與受傷閃爍也一起停下來。
  const hurt = p.invincible > 0;
  const hop = p.moving ? Math.abs(Math.sin(p.walkPhase)) * 2 : 0;
  const sway = p.moving ? Math.sin(p.walkPhase) * 0.055 : 0;
  ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y));
  ctx.fillStyle = "rgba(36,57,67,.22)";
  ctx.beginPath(); ctx.ellipse(0, p.r * .85, p.r * .9 - hop, p.r * .25, 0, 0, Math.PI * 2); ctx.fill();
  if (hurt && p.hitFlash <= 0 && Math.floor(state.elapsed / 0.09) % 2 === 0) ctx.globalAlpha = 0.45;
  ctx.translate(0, -Math.round(hop)); ctx.rotate(sway); ctx.scale(p.facing, 1);
  const sprite = SPRITES.player;
  if (sprite) ctx.drawImage(sprite, -p.r, -p.r, p.r * 2, p.r * 2);
  else {
    // 原生 20×24、放大兩倍：尖葉在上，身體仍以碰撞圓為中心。
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hurt ? HERO_PICTURES.hurt : HERO_PICTURES.happy, -20, -30, 40, 48);
  }
  ctx.restore();
}

function drawBlob(x, y, r, color, bounce, flash, enemyId = "jaben") {
  ctx.save(); ctx.translate(x, y + Math.sin(bounce) * 2);
  const sprite = SPRITES[enemyId];
  if (sprite) {
    if (flash) ctx.globalAlpha = 0.55 + Math.abs(Math.sin(performance.now() / 25)) * 0.45;
    ctx.drawImage(sprite, -r, -r, r * 2, r * 2); ctx.restore(); return;
  }
  ctx.fillStyle = "rgba(36,57,67,.22)"; ctx.beginPath(); ctx.ellipse(1, r * .82, r * .9, r * .27, 0, 0, Math.PI * 2); ctx.fill();
  if (flash) ctx.globalAlpha = 0.55 + Math.abs(Math.sin(performance.now() / 25)) * 0.45;
  ctx.fillStyle = flash ? "#fff" : color; ctx.strokeStyle = "#87522f"; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(-r * .82, -r * .8, r * 1.64, r * 1.6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f0bb80"; ctx.fillRect(-r * .5, -r * .55, r, r * .28);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-r * .3, -r * .12, r * .23, 0, Math.PI * 2); ctx.arc(r * .3, -r * .12, r * .23, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#243746"; ctx.beginPath(); ctx.arc(-r * .27, -r * .1, r * .1, 0, Math.PI * 2); ctx.arc(r * .33, -r * .1, r * .1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#243746"; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(0, r * .17, r * .16, .15, Math.PI - .15); ctx.stroke();
  ctx.restore();
}

function render() {
  drawClassroom();
  for (const shot of state.projectiles) {
    if (!shot.alive) continue;
    ctx.fillStyle = WATER_COLOR; ctx.strokeStyle = "#0759a8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (shot.piercing) {
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r + 4, 0, Math.PI * 2); ctx.stroke();
      const speed = Math.max(1, Math.hypot(shot.vx, shot.vy));
      ctx.beginPath(); ctx.moveTo(shot.x - shot.vx / speed * (shot.r + 5), shot.y - shot.vy / speed * (shot.r + 5));
      ctx.lineTo(shot.x - shot.vx / speed * (shot.r + 15), shot.y - shot.vy / speed * (shot.r + 15)); ctx.stroke();
    }
  }
  for (const gem of state.gems) {
    ctx.save(); ctx.translate(gem.x, gem.y + Math.sin(gem.wobble) * 2); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = GEM_COLOR; ctx.strokeStyle = "#a65300"; ctx.lineWidth = 2; ctx.fillRect(-7, -7, 14, 14); ctx.strokeRect(-7, -7, 14, 14);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.fillRect(-4, -4, 3, 3); ctx.restore();
  }
  for (const shot of state.enemyShots) {
    ctx.save(); ctx.textAlign = "center";
    if (shot.source === "book") {
      // 小兵是橘色方紙上的單字；老師仍是粉紅色詞句。
      ctx.fillStyle = "#fff3cc"; ctx.strokeStyle = "#a85c13"; ctx.lineWidth = 2;
      ctx.fillRect(shot.x - 12, shot.y - 12, 24, 24); ctx.strokeRect(shot.x - 12, shot.y - 12, 24, 24);
      ctx.font = "bold 20px system-ui"; ctx.textBaseline = "middle"; ctx.fillStyle = "#713809"; ctx.fillText(shot.text, shot.x, shot.y);
    } else {
      ctx.font = "bold 16px system-ui"; ctx.fillStyle = "#b42f54"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.strokeText(shot.text, shot.x, shot.y); ctx.fillText(shot.text, shot.x, shot.y);
    }
    ctx.restore();
  }
  if (state.boss) {
    const b = state.boss, x = b.x, y = b.y + Math.sin(b.wobble) * 2;
    ctx.fillStyle = "#3e2e35"; ctx.fillRect(x - 20, y - 33, 40, 10); ctx.fillRect(x - 25, y - 23, 8, 19);
    ctx.fillStyle = b.flash ? "#fff" : "#ffd7ad"; ctx.fillRect(x - 19, y - 22, 38, 29);
    ctx.fillStyle = "#263c5b"; ctx.fillRect(x - 24, y + 7, 48, 25);
    ctx.fillRect(x - 17, y - 12, 13, 9); ctx.fillRect(x + 4, y - 12, 13, 9); ctx.fillRect(x - 4, y - 9, 8, 3);
    ctx.fillStyle = "#fff"; ctx.fillRect(x - 25, y + 14, 15, 11); ctx.fillRect(x + 10, y + 14, 15, 11);
    ctx.fillStyle = "#293d51"; ctx.font = "bold 13px system-ui"; ctx.textAlign = "center"; ctx.fillText("老師", x, y + 52);
  }
  for (const enemy of state.enemies) {
    drawBlob(enemy.x, enemy.y, enemy.r, enemy.color, enemy.wobble, enemy.flash > 0, enemy.typeId);
    if (enemy.hp < enemy.maxHp) { ctx.fillStyle = "#fff"; ctx.fillRect(enemy.x - 15, enemy.y - enemy.r - 10, 30, 4); ctx.fillStyle = "#f16b68"; ctx.fillRect(enemy.x - 15, enemy.y - enemy.r - 10, 30 * enemy.hp / enemy.maxHp, 4); }
  }
  for (const effect of state.effects) {
    const alpha = Math.max(0, effect.life / effect.maxLife); ctx.globalAlpha = alpha; ctx.fillStyle = effect.color;
    if (effect.kind === "water-hit") {
      ctx.strokeStyle = effect.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(effect.x, effect.y, 5 + (1 - alpha) * 15, 0, Math.PI * 2); ctx.stroke();
      ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#2458a4"; ctx.lineWidth = 3; ctx.strokeText(effect.text, effect.x, effect.y - 14); ctx.fillText(effect.text, effect.x, effect.y - 14);
    }
    else if (effect.kind === "number") { ctx.font = "bold 15px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#355066"; ctx.lineWidth = 3; ctx.strokeText(effect.text, effect.x, effect.y); ctx.fillText(effect.text, effect.x, effect.y); }
    else if (effect.kind === "heal") { ctx.font = "bold 13px system-ui"; ctx.textAlign = "center"; ctx.fillText(effect.text, effect.x, effect.y); }
    else if (effect.kind === "evaporate") { ctx.beginPath(); ctx.ellipse(effect.x, effect.y, 13 * (1.5 - alpha), 18 * alpha, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillRect(effect.x - 2, effect.y - 2, 4, 4); }
    ctx.globalAlpha = 1;
  }
  if (state.bomb || state.bombBlast) {
    const bubble = state.bomb || state.bombBlast;
    const radius = state.bomb ? 24 + (1 - bubble.timer / bubble.delay) * 12 : bubble.radius * (1 - bubble.life / 0.35);
    ctx.fillStyle = "rgba(110,225,255,.25)"; ctx.strokeStyle = "#43aee9"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (state.bomb) { ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2); ctx.stroke(); }
  }
  if (state.dashTimer > 0) { ctx.strokeStyle = "#83eaff"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(state.player.x, state.player.y); ctx.lineTo(state.player.x - state.dashX * 45, state.player.y - state.dashY * 45); ctx.stroke(); }
  drawHero();
  if (state.joy) {
    ctx.globalAlpha = .42; ctx.strokeStyle = "#173f62"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(state.joy.baseX, state.joy.baseY, 46, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#4186be"; ctx.beginPath(); ctx.arc(state.joy.baseX + state.joy.x * 27, state.joy.baseY + state.joy.y * 27, 19, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
}

function renderLoop() { render(); requestAnimationFrame(renderLoop); }

let frameRequest = null;
function scheduleFrame() { if (frameRequest !== null) return; frameRequest = requestAnimationFrame(frame); }
function frame(now) { frameRequest = null; const dt = Math.min(MAX_DT, Math.max(0, (now - state.lastTime) / 1000)); state.lastTime = now; tick(dt); if (state.mode === "playing") scheduleFrame(); }
function togglePause() { if (!settingsPanel.hidden || state.mode === "levelup") return; if (state.mode === "playing") { if (frameRequest !== null) { cancelAnimationFrame(frameRequest); frameRequest = null; } showOverlay("paused"); } else if (state.mode === "paused") { state.mode = "playing"; overlay.classList.add("hidden"); pauseButton.textContent = "Ⅱ"; updateActionControls(); state.lastTime = performance.now(); scheduleFrame(); } }

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
resetSettingsButton.addEventListener("click", () => {
  gameSettings = { ...SETTING_DEFAULTS };
  saveSettings(); makeSettingsControls();
  updateSettingValue("playerSpeed", gameSettings.playerSpeed);
  ENEMY_TYPES[0].speed = gameSettings.enemySpeed; ENEMY_TYPES[0].hp = gameSettings.enemyHealth;
  ENEMY_TYPES[1].speed = gameSettings.secondEnemySpeed; ENEMY_TYPES[1].hp = gameSettings.secondEnemyHealth;
  if (state.mode !== "playing") { state.player.health = PLAYER_HEALTH; updateHud(); }
});
soundToggle.addEventListener("click", () => { gameSettings.sound = !gameSettings.sound; saveSettings(); updateSettingsButtons(); if (gameSettings.sound) playTone(660); });
vibrationToggle.addEventListener("click", () => { gameSettings.vibration = !gameSettings.vibration; saveSettings(); updateSettingsButtons(); });
startButton.addEventListener("click", () => { startAudio(); state.mode === "paused" ? togglePause() : startGame(); });
pauseButton.addEventListener("click", togglePause);
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (settingsPanel.hidden === false || (state.mode !== "playing" && event.target && event.target.tagName === "BUTTON") || (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "e"].includes(key)) event.preventDefault();
  state.keys.add(key);
  if (event.repeat) return;
  if (key === "Escape") togglePause();
  if (key === " ") activateDash();
  if (key === "e") activateSkill();
});
window.addEventListener("keydown", (event) => { if (state.mode === "levelup" && /^[123]$/.test(event.key)) { event.preventDefault(); applyUpgrade(Number(event.key) - 1); } });
window.addEventListener("keyup", (event) => state.keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener("blur", () => { state.keys.clear(); if (state.mode === "playing") showOverlay("paused"); });
document.addEventListener("visibilitychange", () => { if (document.hidden && state.mode === "playing") showOverlay("paused"); });
window.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("pointerdown", (event) => {
  if (state.mode !== "playing" || event.target.closest("button")) return;
  if (state.pointerId !== null) return;
  event.preventDefault(); state.pointerId = event.pointerId; canvas.setPointerCapture(event.pointerId);
  const rect = canvas.getBoundingClientRect(); const baseX = event.clientX - rect.left; const baseY = event.clientY - rect.top;
  state.joy = { baseX, baseY, x: 0, y: 0 };
});
canvas.addEventListener("pointermove", (event) => { if (event.pointerId !== state.pointerId || !state.joy) return; event.preventDefault(); const rect = canvas.getBoundingClientRect(); const dx = event.clientX - rect.left - state.joy.baseX, dy = event.clientY - rect.top - state.joy.baseY; const distance = Math.max(1, Math.hypot(dx, dy)); const amount = Math.min(1, distance / 35); state.joy.x = dx / distance * amount; state.joy.y = dy / distance * amount; });
function endPointer(event) { if (event.pointerId !== state.pointerId) return; state.pointerId = null; state.joy = null; }
canvas.addEventListener("pointerup", endPointer); canvas.addEventListener("pointercancel", endPointer); canvas.addEventListener("lostpointercapture", endPointer);
window.addEventListener("resize", () => { resize(); maybeShowPortraitHint(); });
resize(); showOverlay("ready"); renderLoop();
