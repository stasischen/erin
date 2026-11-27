"use strict";

// ============================================================
// 記憶翻牌 — 遊戲邏輯（純 vanilla JS，不呼叫任何後端）
// ============================================================

// 牌面 emoji 清單
// 每次開局會從這份清單隨機抽出需要的對數，所以清單要比最大難度（12 對）還多。
// 想換主題（例如全部換成動物或食物）就改這裡的字元即可。
const EMOJI_POOL = [
"🍎", "🍌", "🍇", "🍓", "🍑", "🍍",
"🐶", "🐱", "🐰", "🦊", "🐼", "🐸",
"🦁", "🐵", "🦄", "🐙", "🦋", "🚗",
];

// 難度設定
// pairs = 有幾對牌；cols = 棋盤一列放幾張（簡單 4×3、普通 4×4、困難 6×4）
const DIFFICULTIES = {
easy: { label: "簡單", pairs: 6, cols: 4},
normal: { label: "普通", pairs: 8, cols: 4},
hard: { label: "困難", pairs: 12, cols: 6},
};

// 星等評分門檻
// 用「翻牌次數 ÷ 對數」的倍率來評分（翻牌次數 = 每翻兩張算 1 次）：
// 倍率 <= threeStarMaxRatio 拿 3 星；<= twoStarMaxRatio 拿 2 星；其餘 1 星。
// 另外若用時超過 threeStarMaxSeconds，也最多只能拿 2 星。
const STAR_RULES = {
threeStarMaxRatio: 1.5,
twoStarMaxRatio: 2.5,
threeStarMaxSeconds: 120,
};

// 配對失敗時，牌停留多久才翻回去（單位：毫秒）
const FLIP_BACK_DELAY_MS = 800;

// 成績儲存的 localStorage key（各難度各存一份最佳紀錄）
const BEST_STORAGE_KEY = "erin-memory-flip-best";

// ---------- 取得畫面元素 ----------
const boardEl = document.getElementById("board");
const timeTextEl = document.getElementById("timeText");
const movesTextEl = document.getElementById("movesText");
const pairsTextEl = document.getElementById("pairsText");
const bestTextEl = document.getElementById("bestText");
const restartBtn = document.getElementById("restartBtn");
const diffButtons = Array.from(document.querySelectorAll(".diff-btn"));
const winOverlay = document.getElementById("winOverlay");
const winStarsEl = document.getElementById("winStars");
const winTimeEl = document.getElementById("winTime");
const winMovesEl = document.getElementById("winMoves");
const winBestEl = document.getElementById("winBest");
const playAgainBtn = document.getElementById("playAgainBtn");

// ---------- 遊戲狀態 ----------
const state = {
difficulty: "easy",
firstCard: null, // 已翻開的第一張牌（等第二張）
lockBoard: false, // 翻錯等待翻回期間鎖住棋盤，避免連點第三張
matchedPairs: 0,
moves: 0, // 翻牌次數：每翻兩張算 1 次
seconds: 0,
timerId: 0,
timerStarted: false,
};

// 洗牌（Fisher–Yates）
function shuffle(items) {
const arr = items.slice();
for (let i = arr.length - 1; i > 0; i -= 1) {
const j = Math.floor(Math.random() * (i + 1));
const tmp = arr[i];
arr[i] = arr[j];
arr[j] = tmp;
}
return arr;
}

// ---------- 最佳紀錄（localStorage） ----------
function loadAllBest() {
try {
const raw = localStorage.getItem(BEST_STORAGE_KEY);
const parsed = raw? JSON.parse(raw): {};
return parsed && typeof parsed === "object"? parsed: {};
} catch (e) {
return {};
}
}

function getBest(difficulty) {
const best = loadAllBest()[difficulty];
if (best && typeof best.seconds === "number" && typeof best.moves === "number") {
return best;
}
return null;
}

// 若這次成績更好（先比時間，再比翻牌次數），就存起來；回傳是否刷新紀錄
function saveBestIfBetter(difficulty, seconds, moves) {
const all = loadAllBest();
const old = all[difficulty];
const isBetter =
!old || seconds < old.seconds || (seconds === old.seconds && moves < old.moves);
if (isBetter) {
all[difficulty] = { seconds: seconds, moves: moves};
try {
localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(all));
} catch (e) {
// 儲存空間不可用時就跳過，不影響遊戲進行
}
}
return isBetter;
}

function renderBest() {
const setting = DIFFICULTIES[state.difficulty];
const best = getBest(state.difficulty);
if (best) {
bestTextEl.textContent =
"最佳紀錄（" + setting.label + "）：最短時間 " + best.seconds +
" 秒／最少翻牌 " + best.moves + " 次";
} else {
bestTextEl.textContent =
"最佳紀錄（" + setting.label + "）：尚無紀錄，快來挑戰！";
}
}

// ---------- 計時器 ----------
function startTimerOnce() {
if (state.timerStarted) return;
state.timerStarted = true;
state.timerId = setInterval(function () {
state.seconds += 1;
timeTextEl.textContent = state.seconds + " 秒";
}, 1000);
}

function stopTimer() {
if (state.timerId) {
clearInterval(state.timerId);
state.timerId = 0;
}
}

// ---------- 星等評分 ----------
function calcStars() {
const pairs = DIFFICULTIES[state.difficulty].pairs;
const ratio = state.moves / pairs;
if (ratio <= STAR_RULES.threeStarMaxRatio && state.seconds <= STAR_RULES.threeStarMaxSeconds) {
return 3;
}
if (ratio <= STAR_RULES.twoStarMaxRatio) {
return 2;
}
return 1;
}

// ---------- 開局 / 重開 ----------
function startGame(difficulty) {
state.difficulty = difficulty;
const setting = DIFFICULTIES[difficulty];

stopTimer();
state.firstCard = null;
state.lockBoard = false;
state.matchedPairs = 0;
state.moves = 0;
state.seconds = 0;
state.timerStarted = false;

timeTextEl.textContent = "0 秒";
movesTextEl.textContent = "0";
pairsTextEl.textContent = "0 / " + setting.pairs;
winOverlay.classList.add("hidden");

diffButtons.forEach(function (btn) {
btn.classList.toggle("is-active", btn.dataset.difficulty === difficulty);
});

// 從 emoji 清單隨機抽出所需對數，組成成對的牌再洗牌
const chosen = shuffle(EMOJI_POOL).slice(0, setting.pairs);
const deck = shuffle(chosen.concat(chosen));

boardEl.className = "board cols-" + setting.cols;
boardEl.innerHTML = "";

deck.forEach(function (emoji) {
const card = document.createElement("button");
card.type = "button";
card.className = "card";
card.dataset.emoji = emoji;
card.setAttribute("aria-label", "未翻開的牌");

const inner = document.createElement("span");
inner.className = "card-inner";

const back = document.createElement("span");
back.className = "card-face card-back";
back.textContent = "？";

const front = document.createElement("span");
front.className = "card-face card-front";
front.textContent = emoji;

inner.appendChild(back);
inner.appendChild(front);
card.appendChild(inner);
card.addEventListener("click", onCardClick);
boardEl.appendChild(card);
});

renderBest();
}

// ---------- 點牌 ----------
function onCardClick(event) {
const card = event.currentTarget;
if (state.lockBoard) return;
if (card.classList.contains("is-flipped") || card.classList.contains("is-matched")) return;

startTimerOnce();
card.classList.add("is-flipped");
card.setAttribute("aria-label", "牌面：" + card.dataset.emoji);

if (!state.firstCard) {
state.firstCard = card;
return;
}

// 翻開第二張：翻牌次數 +1（每翻兩張算 1 次）
const first = state.firstCard;
state.firstCard = null;
state.moves += 1;
movesTextEl.textContent = String(state.moves);

if (first.dataset.emoji === card.dataset.emoji) {
// 配對成功：兩張都留住
first.classList.add("is-matched");
card.classList.add("is-matched");
state.matchedPairs += 1;
pairsTextEl.textContent =
state.matchedPairs + " / " + DIFFICULTIES[state.difficulty].pairs;
if (state.matchedPairs === DIFFICULTIES[state.difficulty].pairs) {
finishGame();
}
} else {
// 配對失敗：短暫停留後翻回去
state.lockBoard = true;
setTimeout(function () {
first.classList.remove("is-flipped");
card.classList.remove("is-flipped");
first.setAttribute("aria-label", "未翻開的牌");
card.setAttribute("aria-label", "未翻開的牌");
state.lockBoard = false;
}, FLIP_BACK_DELAY_MS);
}
}

// ---------- 全部配對完成 ----------
function finishGame() {
stopTimer();
const stars = calcStars();
const isNewBest = saveBestIfBetter(state.difficulty, state.seconds, state.moves);

winStarsEl.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
winStarsEl.setAttribute("aria-label", "星等評分：" + stars + " 星");
winTimeEl.textContent = String(state.seconds);
winMovesEl.textContent = String(state.moves);
winBestEl.textContent = isNewBest
? "🏆 新紀錄！這是這個難度的最佳成績！"
: "";
winOverlay.classList.remove("hidden");
renderBest();
}

// ---------- 按鈕事件 ----------
restartBtn.addEventListener("click", function () {
startGame(state.difficulty);
});
playAgainBtn.addEventListener("click", function () {
startGame(state.difficulty);
});
diffButtons.forEach(function (btn) {
btn.addEventListener("click", function () {
startGame(btn.dataset.difficulty);
});
});

// 進入頁面先開一局簡單難度
startGame("easy");
