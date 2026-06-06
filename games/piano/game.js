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

// ✏️ 她可以改的地方：音色類型 ("sine", "triangle", "square", "sawtooth")
const WAVE_TYPE = "sine";

// ===== 遊戲狀態 =====
let isRecording = false;
let recordedNotes = [];   // { note, start, end }
let recordStartTime = 0;
let isPlaying = false;

// 正在響的音符 → { osc, gain }
const activeOscillators = {};

// ===== DOM =====
const statusEl = document.getElementById("status");
const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const clearBtn = document.getElementById("clearBtn");
const piano = document.getElementById("piano");
const indicator = document.getElementById("indicator");
const keys = piano.querySelectorAll(".key");

// ===== 音效（Web Audio API）=====
let audioCtx = null;
function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function startNote(note) {
  ensureAudioCtx();
  if (activeOscillators[note]) return; // 已在響

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = WAVE_TYPE;
  osc.frequency.value = NOTES[note];
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  activeOscillators[note] = { osc, gain };
}

function stopNote(note) {
  const entry = activeOscillators[note];
  if (!entry) return;

  const { osc, gain } = entry;
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  osc.stop(audioCtx.currentTime + 0.06);
  delete activeOscillators[note];
}

// ===== 視覺回饋 =====
const NOTE_NAMES = { "C": "Do", "C#": "Do#", "D": "Re", "D#": "Re#", "E": "Mi", "F": "Fa", "F#": "Fa#", "G": "Sol", "G#": "Sol#", "A": "La", "A#": "La#", "B": "Si", "C2": "Do" };

function showIndicator(note) {
  indicator.textContent = NOTE_NAMES[note] || note;
  indicator.classList.add("visible");
}

function hideIndicator() {
  indicator.classList.remove("visible");
}

function highlightKey(note) {
  const keyEl = piano.querySelector(`[data-note="${note}"]`);
  if (keyEl) keyEl.classList.add("active");
}

function unhighlightKey(note) {
  const keyEl = piano.querySelector(`[data-note="${note}"]`);
  if (keyEl) keyEl.classList.remove("active");
}

// ===== 彈奏音符（按下）=====
function handleKeyDown(note) {
  startNote(note);
  highlightKey(note);
  showIndicator(note);

  // 錄音中就記錄 note-on
  if (isRecording) {
    const elapsed = Date.now() - recordStartTime;
    recordedNotes.push({ note, start: elapsed, end: null });
  }
}

// ===== 放開音符 =====
function handleKeyUp(note) {
  stopNote(note);
  unhighlightKey(note);
  hideIndicator();

  // 錄音中記錄 note-off
  if (isRecording) {
    const elapsed = Date.now() - recordStartTime;
    // 找到最近一個同音的 note-on 且還沒結束的
    for (let i = recordedNotes.length - 1; i >= 0; i--) {
      if (recordedNotes[i].note === note && recordedNotes[i].end === null) {
        recordedNotes[i].end = elapsed;
        break;
      }
    }
  }
}

// ===== 錄音 =====
function toggleRecord() {
  if (isRecording) {
    isRecording = false;
    recordBtn.classList.remove("recording");
    recordBtn.textContent = "⏺ 錄音";
    statusEl.textContent = `錄音完成！錄了 ${recordedNotes.length} 個音`;
    playBtn.disabled = recordedNotes.length === 0;
  } else {
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

  // 產生所有事件（note-on 和 note-off）
  const events = [];
  for (const n of recordedNotes) {
    events.push({ type: "on", note: n.note, time: n.start });
    if (n.end !== null) {
      events.push({ type: "off", note: n.note, time: n.end });
    }
  }
  events.sort((a, b) => a.time - b.time);

  let prevTime = 0;
  for (const ev of events) {
    const delay = ev.time - prevTime;
    if (delay > 0) await sleep(delay);
    prevTime = ev.time;

    if (ev.type === "on") {
      startNote(ev.note);
      highlightKey(ev.note);
      showIndicator(ev.note);
    } else {
      stopNote(ev.note);
      unhighlightKey(ev.note);
      hideIndicator();
    }
  }

  await sleep(200);
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

// 滑鼠：按下 + 放開
keys.forEach(key => {
  const note = key.dataset.note;

  key.addEventListener("mousedown", (e) => {
    e.preventDefault();
    handleKeyDown(note);
  });
  key.addEventListener("mouseup", () => handleKeyUp(note));
  key.addEventListener("mouseleave", () => handleKeyUp(note));

  // 觸控
  key.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleKeyDown(note);
  });
  key.addEventListener("touchend", (e) => {
    e.preventDefault();
    handleKeyUp(note);
  });
  key.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    handleKeyUp(note);
  });
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

const heldKeys = new Set();

document.addEventListener("keydown", (e) => {
  if (isPlaying) return;
  const key = e.key.toLowerCase();
  if (heldKeys.has(key)) return; // 防止重複觸發
  const note = KEY_MAP[key];
  if (note) {
    heldKeys.add(key);
    handleKeyDown(note);
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  const note = KEY_MAP[key];
  if (note) {
    heldKeys.delete(key);
    handleKeyUp(note);
  }
});
