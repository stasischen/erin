// ===== 音符頻率（Hz）=====
// ✏️ 她可以改的地方：每個音的頻率
const NOTES = {
  "C":  262,  // Do
  "C#": 277,
  "D":  294,  // Re
  "D#": 311,
  "E":  330,  // Mi
  "F":  349,  // Fa
  "F#": 370,
  "G":  392,  // Sol
  "G#": 415,
  "A":  440,  // La
  "A#": 466,
  "B":  494,  // Si
  "C2": 523,  // 高音 Do
};

// ✏️ 她可以改的地方：每個音持續多久（毫秒）
const NOTE_DURATION = 300;

// ===== 遊戲狀態 =====
let isRecording = false;
let recordedNotes = [];   // 儲存錄下的音符
let recordStartTime = 0;
let isPlaying = false;

// ===== DOM =====
const statusEl = document.getElementById("status");
const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const clearBtn = document.getElementById("clearBtn");
const piano = document.getElementById("piano");
const keys = piano.querySelectorAll(".key");

// ===== 音效（Web Audio API）=====
let audioCtx = null;
function playNote(note) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = NOTES[note];
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + NOTE_DURATION / 1000);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + NOTE_DURATION / 1000);
}

// ===== 視覺回饋 =====
function flashKey(keyEl) {
  keyEl.classList.add("active");
  setTimeout(() => keyEl.classList.remove("active"), NOTE_DURATION);
}

// ===== 彈奏音符 =====
function handleKeyPress(note, keyEl) {
  playNote(note);
  flashKey(keyEl);

  // 錄音中就記錄下來
  if (isRecording) {
    const elapsed = Date.now() - recordStartTime;
    recordedNotes.push({ note, time: elapsed });
  }
}

// ===== 錄音 =====
function toggleRecord() {
  if (isRecording) {
    // 停止錄音
    isRecording = false;
    recordBtn.classList.remove("recording");
    recordBtn.textContent = "⏺ 錄音";
    statusEl.textContent = `錄音完成！錄了 ${recordedNotes.length} 個音`;
    playBtn.disabled = recordedNotes.length === 0;
  } else {
    // 開始錄音
    recordedNotes = [];
    recordStartTime = Date.now();
    isRecording = true;
    recordBtn.classList.add("recording");
    recordBtn.textContent = "⏹ 停止";
    statusEl.textContent = "錄音中…彈彈看！";
    playBtn.disabled = true;
  }
}

// ===== 播放 =====
async function playRecording() {
  if (recordedNotes.length === 0 || isPlaying) return;
  isPlaying = true;
  playBtn.disabled = true;
  statusEl.textContent = "播放中…";

  for (let i = 0; i < recordedNotes.length; i++) {
    const { note, time } = recordedNotes[i];
    const nextTime = i < recordedNotes.length - 1 ? recordedNotes[i + 1].time : time + NOTE_DURATION;
    const delay = i === 0 ? 0 : nextTime - time;

    await sleep(delay);

    // 找到對應的按鍵並亮起
    const keyEl = piano.querySelector(`[data-note="${note}"]`);
    handleKeyPress(note, keyEl);
  }

  await sleep(NOTE_DURATION);
  isPlaying = false;
  playBtn.disabled = false;
  statusEl.textContent = "播放完成！再彈一次吧！";
}

// ===== 清除 =====
function clearRecording() {
  recordedNotes = [];
  isRecording = false;
  recordBtn.classList.remove("recording");
  recordBtn.textContent = "⏺ 錄音";
  playBtn.disabled = true;
  statusEl.textContent = "已清除，重新錄吧！";
}

// ===== 工具函式 =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== 綁定事件 =====
recordBtn.addEventListener("click", toggleRecord);
playBtn.addEventListener("click", playRecording);
clearBtn.addEventListener("click", clearRecording);

keys.forEach(key => {
  const note = key.dataset.note;
  key.addEventListener("click", () => handleKeyPress(note, key));
});

// ===== 鍵盤快捷鍵 =====
// ✏️ 她可以改的地方：鍵盤按鍵對應的音符
const KEY_MAP = {
  "a": "C",  "w": "C#",
  "s": "D",  "e": "D#",
  "d": "E",
  "f": "F",  "t": "F#",
  "g": "G",  "y": "G#",
  "h": "A",  "u": "A#",
  "j": "B",
  "k": "C2",
};

document.addEventListener("keydown", (e) => {
  if (isPlaying) return;
  const note = KEY_MAP[e.key.toLowerCase()];
  if (note) {
    const keyEl = piano.querySelector(`[data-note="${note}"]`);
    if (keyEl) handleKeyPress(note, keyEl);
  }
});
