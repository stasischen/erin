// ===== 顏色與音效 =====
// ✏️ 她可以改的地方：每個顏色對應的音頻（Hz）
const COLORS = ["green", "red", "yellow", "blue"];
const FREQS = { green: 392, red: 330, yellow: 262, blue: 440 };

// ✏️ 她可以改的地方：亮燈時間（毫秒）和間隔時間
const LIGHT_TIME = 500;   // 按鈕亮起持續時間
const GAP_TIME = 250;     // 亮燈之間的間隔

// ===== 遊戲狀態 =====
let sequence = [];      // 電腦出的顏色順序
let playerIndex = 0;    // 玩家目前輸入到第幾個
let round = 0;          // 目前回合數
let score = 0;          // 分數
let isPlaying = false;  // 是否在遊戲中
let isShowing = false;  // 是否正在播放序列

// ===== DOM =====
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round");
const startBtn = document.getElementById("startBtn");
const btns = {};
COLORS.forEach(c => { btns[c] = document.getElementById("btn-" + c); });

// ===== 音效（Web Audio API）=====
let audioCtx = null;
function playTone(color, duration = LIGHT_TIME) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = FREQS[color];
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration / 1000);
}

// ===== 按鈕亮燈 =====
function lightUp(color, duration = LIGHT_TIME) {
  return new Promise(resolve => {
    btns[color].classList.add("lit");
    playTone(color, duration);
    setTimeout(() => {
      btns[color].classList.remove("lit");
      resolve();
    }, duration);
  });
}

// ===== 顯示序列給玩家看 =====
async function showSequence() {
  isShowing = true;
  setBtnsDisabled(true);
  statusEl.textContent = "看仔細…";

  for (let i = 0; i < sequence.length; i++) {
    await lightUp(sequence[i]);
    if (i < sequence.length - 1) {
      await sleep(GAP_TIME);
    }
  }

  isShowing = false;
  setBtnsDisabled(false);
  statusEl.textContent = "換你了！";
}

// ===== 新增一回合 =====
function nextRound() {
  round++;
  roundEl.textContent = round;
  const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  sequence.push(nextColor);
  playerIndex = 0;
  showSequence();
}

// ===== 玩家按下按鈕 =====
function handlePlayerInput(color) {
  if (!isPlaying || isShowing) return;

  playTone(color, 200);

  if (color === sequence[playerIndex]) {
    playerIndex++;
    if (playerIndex === sequence.length) {
      score += 10;
      scoreEl.textContent = score;
      statusEl.textContent = "答對了！🎉";
      setBtnsDisabled(true);
      setTimeout(nextRound, 1000);
    }
  } else {
    gameOver();
  }
}

// ===== 遊戲結束 =====
function gameOver() {
  isPlaying = false;
  setBtnsDisabled(true);
  statusEl.textContent = `遊戲結束！你得了 ${score} 分`;
  startBtn.disabled = false;
  startBtn.textContent = "▶ 再玩一次";
}

// ===== 開始遊戲 =====
function startGame() {
  sequence = [];
  playerIndex = 0;
  round = 0;
  score = 0;
  scoreEl.textContent = score;
  roundEl.textContent = round;
  isPlaying = true;
  startBtn.disabled = true;
  startBtn.textContent = "▶ 遊戲中…";
  nextRound();
}

// ===== 工具函式 =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setBtnsDisabled(disabled) {
  COLORS.forEach(c => { btns[c].disabled = disabled; });
}

// ===== 綁定事件 =====
startBtn.addEventListener("click", startGame);
COLORS.forEach(c => {
  btns[c].addEventListener("click", () => handlePlayerInput(c));
});

// 初始狀態：遊戲按鈕不可按
setBtnsDisabled(true);
