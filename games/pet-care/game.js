// ===== 寵物設定 =====
// ✏️ 她可以改的地方：寵物名字
const PET_NAME = "小咪";

// ✏️ 她可以改的地方：每秒減少多少數值（越大越難照顧）
const DECAY_RATE = 2;

// ✏️ 她可以改的地方：每次按按鈕恢復多少
const FEED_AMOUNT = 20;
const WASH_AMOUNT = 20;
const PLAY_AMOUNT = 20;

// ✏️ 她可以改的地方：數值更新間隔（毫秒）
const TICK_INTERVAL = 2000; // 每 2 秒減一次

// ✏️ 她可以改的地方：不同狀態的表情
const FACES = {
  happy:   "😺",  // 三項都好
  ok:      "😐",  // 普通
  hungry:  "😿",  // 餓了
  dirty:   "🙀",  // 髒了
  sad:     "😾",  // 不開心
  sick:    "😵",  // 很慘
};

// ===== 遊戲狀態 =====
let hunger = 100;
let clean = 100;
let happy = 100;
let gameOver = false;

// ===== DOM =====
const statusEl = document.getElementById("status");
const petNameEl = document.getElementById("petName");
const petFaceEl = document.getElementById("petFace");
const hungerBar = document.getElementById("hungerBar");
const cleanBar = document.getElementById("cleanBar");
const happyBar = document.getElementById("happyBar");
const hungerVal = document.getElementById("hungerVal");
const cleanVal = document.getElementById("cleanVal");
const happyVal = document.getElementById("happyVal");
const feedBtn = document.getElementById("feedBtn");
const washBtn = document.getElementById("washBtn");
const playBtn = document.getElementById("playBtn");

// ===== 初始化 =====
petNameEl.textContent = PET_NAME;

// ===== 更新畫面 =====
function updateDisplay() {
  hungerBar.style.width = hunger + "%";
  cleanBar.style.width = clean + "%";
  happyBar.style.width = happy + "%";

  hungerVal.textContent = Math.round(hunger);
  cleanVal.textContent = Math.round(clean);
  happyVal.textContent = Math.round(happy);

  // 低數值變紅
  hungerBar.classList.toggle("low", hunger < 25);
  cleanBar.classList.toggle("low", clean < 25);
  happyBar.classList.toggle("low", happy < 25);

  // 更新表情
  updateFace();
}

function updateFace() {
  const minVal = Math.min(hunger, clean, happy);

  if (minVal < 15) {
    petFaceEl.textContent = FACES.sick;
    statusEl.textContent = "牠快撐不住了！快照顧牠！";
  } else if (hunger < 30) {
    petFaceEl.textContent = FACES.hungry;
    statusEl.textContent = "牠肚子好餓…";
  } else if (clean < 30) {
    petFaceEl.textContent = FACES.dirty;
    statusEl.textContent = "牠身上好髒…";
  } else if (happy < 30) {
    petFaceEl.textContent = FACES.sad;
    statusEl.textContent = "牠心情不好…";
  } else if (minVal < 60) {
    petFaceEl.textContent = FACES.ok;
    statusEl.textContent = "還可以，繼續照顧牠吧！";
  } else {
    petFaceEl.textContent = FACES.happy;
    statusEl.textContent = "牠很開心！";
  }
}

function bouncePet() {
  petFaceEl.classList.remove("bounce");
  void petFaceEl.offsetWidth; // 重啟動畫
  petFaceEl.classList.add("bounce");
}

// ===== 按鈕動作 =====
function feed() {
  if (gameOver) return;
  hunger = Math.min(100, hunger + FEED_AMOUNT);
  statusEl.textContent = "吃飽飽！🍗";
  bouncePet();
  updateDisplay();
}

function wash() {
  if (gameOver) return;
  clean = Math.min(100, clean + WASH_AMOUNT);
  statusEl.textContent = "乾乾淨淨！🛁";
  bouncePet();
  updateDisplay();
}

function play() {
  if (gameOver) return;
  happy = Math.min(100, happy + PLAY_AMOUNT);
  statusEl.textContent = "好開心！🎾";
  bouncePet();
  updateDisplay();
}

// ===== 定時減少數值 =====
function tick() {
  if (gameOver) return;

  hunger = Math.max(0, hunger - DECAY_RATE);
  clean = Math.max(0, clean - DECAY_RATE * 0.8);
  happy = Math.max(0, happy - DECAY_RATE * 0.6);

  updateDisplay();

  // 檢查是否遊戲結束
  if (hunger <= 0 || clean <= 0 || happy <= 0) {
    gameOver = true;
    statusEl.textContent = "牠撐不住了…遊戲結束 😢";
    feedBtn.disabled = true;
    washBtn.disabled = true;
    playBtn.disabled = true;
  }
}

// ===== 綁定事件 =====
feedBtn.addEventListener("click", feed);
washBtn.addEventListener("click", wash);
playBtn.addEventListener("click", play);

// ===== 啟動 =====
updateDisplay();
setInterval(tick, TICK_INTERVAL);
