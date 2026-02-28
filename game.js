const arena = document.getElementById("arena");
const dropsLayer = document.getElementById("drops");
const coneEl = document.getElementById("cone");
const hitFlash = document.getElementById("hitFlash");
const countdownOverlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");
const stackTower = document.getElementById("stackTower");
const coneBody = document.getElementById("coneBody");
const coneLevelBadge = document.getElementById("coneLevelBadge");
const scoreEl = document.getElementById("score");
const stackCountEl = document.getElementById("stackCount");
const stageLevelEl = document.getElementById("stageLevel");
const keyCountEl = document.getElementById("keyCount");
const coneLevelEl = document.getElementById("coneLevel");
const timeEl = document.getElementById("time");
const targetFlavorEl = document.getElementById("targetFlavor");
const targetColorDot = document.getElementById("targetColorDot");
const targetPreview = document.getElementById("targetPreview");
const coneNameEl = document.getElementById("coneName");
const resultText = document.getElementById("resultText");
const starText = document.getElementById("starText");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const musicBtn = document.getElementById("musicBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
let audioCtx = null;
let bgmIntervalId = 0;
let bgmStep = 0;

const flavors = ["strawberry", "vanilla", "mint", "choco"];
const flavorName = {
  strawberry: "草莓",
  vanilla: "香草",
  mint: "薄荷",
  choco: "巧克力",
};
const levelColorName = {
  1: "黃色",
  2: "粉色",
  3: "藍色",
  4: "綠色",
  5: "紫色",
  6: "黑色",
  7: "紅色",
};

const state = {
  running: false,
  score: 0,
  stackCount: 0,
  timeLeft: 40,
  coneX: 0,
  coneSpeed: 9,
  moveLeft: false,
  moveRight: false,
  drops: [],
  lastSpawnAt: 0,
  targetFlavor: "strawberry",
  stageLevel: 1,
  keysCollected: 0,
  stage4Unlocked: false,
  stage3KeyPlan: [],
  coneLevel: 1,
  loopId: 0,
  timerId: 0,
  bgmOn: true,
};

function randomFlavor() {
  return flavors[Math.floor(Math.random() * flavors.length)];
}

function pickNewTarget() {
  state.targetFlavor = randomFlavor();
  targetFlavorEl.textContent = flavorName[state.targetFlavor];
  targetColorDot.className = `target-dot ${state.targetFlavor}`;
  targetPreview.className = `target-preview ${state.targetFlavor}`;
}

function buildStage3KeyPlan() {
  const plan = [true, true, true, false, false, false, false];
  for (let i = plan.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = plan[i];
    plan[i] = plan[j];
    plan[j] = tmp;
  }
  return plan;
}

function resetRound() {
  state.score = 0;
  state.stackCount = 0;
  state.timeLeft = 40;
  state.coneLevel = 1;
  if (state.stageLevel === 3) {
    state.keysCollected = 0;
    state.stage3KeyPlan = buildStage3KeyPlan();
  }
  state.drops = [];
  dropsLayer.innerHTML = "";
  stackTower.innerHTML = "";
  state.lastSpawnAt = performance.now();
  scoreEl.textContent = "0";
  stackCountEl.textContent = "0";
  timeEl.textContent = "40";
  resultText.textContent = "快接冰淇淋！";
  starText.textContent = "星星：☆☆☆";
  stageLevelEl.textContent = String(state.stageLevel);
  keyCountEl.textContent = state.stageLevel === 3 ? `${state.keysCollected}/3` : "0/3";
  hitFlash.className = "hit-flash";
  updateConeLevel();
  pickNewTarget();
  placeConeAtCenter();
}

function placeConeAtCenter() {
  const w = arena.clientWidth;
  state.coneX = w / 2 - coneEl.clientWidth / 2;
  applyConePosition();
}

function applyConePosition() {
  coneEl.style.left = `${state.coneX}px`;
}

function spawnDrop() {
  const machineIndex = Math.floor(Math.random() * 4);
  const colWidth = arena.clientWidth / 4;
  const x = machineIndex * colWidth + colWidth / 2 - 15;
  const flavor = randomFlavor();

  const el = document.createElement("div");
  el.className = `drop ${flavor}`;
  dropsLayer.appendChild(el);

  const baseSpeed = state.stageLevel === 3 ? 2.9 : state.stageLevel >= 2 ? 3.8 : 2.2;
  const speedRange = state.stageLevel === 3 ? 1.4 : state.stageLevel >= 2 ? 2.8 : 2.0;
  const mode =
    state.stageLevel === 3 ? "diagonal" : state.stageLevel >= 2 && Math.random() < 0.55 ? "diagonal" : "vertical";
  let vx = 0;
  if (mode === "diagonal") {
    const dir = Math.random() < 0.5 ? -1 : 1;
    vx = dir * (state.stageLevel === 3 ? 0.8 + Math.random() * 0.7 : 0.9 + Math.random() * 1.3);
  }

  let hasKey = false;
  if (state.stageLevel === 3) {
    if (!state.stage3KeyPlan.length) {
      state.stage3KeyPlan = buildStage3KeyPlan();
    }
    hasKey = state.stage3KeyPlan.shift();
    if (hasKey) {
      el.classList.add("has-key");
    }
  }

  const drop = { x, y: 45, speed: baseSpeed + Math.random() * speedRange, flavor, el, vx, hasKey };
  el.style.left = `${x}px`;
  el.style.top = `${drop.y}px`;
  state.drops.push(drop);
}

function handleCatch(drop) {
  const flavor = drop.flavor;
  if (state.stageLevel === 3 && drop.hasKey && state.keysCollected < 3) {
    state.keysCollected += 1;
    keyCountEl.textContent = `${state.keysCollected}/3`;
    showHitText("Key!", true);
    if (state.keysCollected >= 3 && !state.stage4Unlocked) {
      state.stage4Unlocked = true;
      resultText.textContent = "你集滿 3 把鑰匙，已解鎖新關卡！";
    }
  }

  if (flavor === state.targetFlavor) {
    state.score += 10;
    state.stackCount += 1;
    stackCountEl.textContent = String(state.stackCount);
    const scoop = document.createElement("div");
    scoop.className = `stacked-scoop ${flavor}`;
    stackTower.appendChild(scoop);
    updateConeLevel();
    showHitText("+1", true);
  } else {
    state.score -= 5 + Math.floor(Math.random() * 3);
    showHitText("Oops!", false);
    vibrate(80);
    arena.classList.add("shake");
    setTimeout(() => arena.classList.remove("shake"), 180);
  }
  state.score = Math.max(0, Math.min(100, state.score));
  scoreEl.textContent = String(state.score);
}

function showHitText(text, isGood) {
  hitFlash.textContent = text;
  hitFlash.className = `hit-flash show ${isGood ? "good" : "bad"}`;
  clearTimeout(showHitText.timer);
  showHitText.timer = setTimeout(() => {
    hitFlash.className = "hit-flash";
  }, 220);
}

function vibrate(ms) {
  if ("vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

function playFireworks() {
  const burstCount = 3;
  for (let b = 0; b < burstCount; b += 1) {
    setTimeout(() => {
      const centerX = 80 + Math.random() * (arena.clientWidth - 160);
      const centerY = 80 + Math.random() * 120;
      for (let i = 0; i < 18; i += 1) {
        const spark = document.createElement("div");
        spark.className = "firework";
        const angle = (Math.PI * 2 * i) / 18;
        const distance = 30 + Math.random() * 38;
        spark.style.left = `${centerX}px`;
        spark.style.top = `${centerY}px`;
        spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
        spark.style.background = ["#ffd93d", "#ff6b6b", "#6bcBef", "#95e06c"][i % 4];
        arena.appendChild(spark);
        setTimeout(() => spark.remove(), 760);
      }
    }, b * 260);
  }
}

function getConeLevel() {
  return Math.min(1 + state.stackCount, 7);
}

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration = 0.18, volume = 0.04, type = "triangle") {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function startBgm() {
  if (!state.bgmOn || bgmIntervalId) return;
  const melody = [523, 659, 784, 659, 587, 659, 523, 494];
  bgmStep = 0;
  bgmIntervalId = setInterval(() => {
    if (!state.bgmOn) return;
    const note = melody[bgmStep % melody.length];
    playTone(note, 0.16, 0.025, "sine");
    if (bgmStep % 2 === 0) {
      playTone(note / 2, 0.14, 0.018, "triangle");
    }
    bgmStep += 1;
  }, 260);
}

function stopBgm() {
  if (bgmIntervalId) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = 0;
  }
}

function updateMusicBtn() {
  musicBtn.textContent = `音樂：${state.bgmOn ? "開" : "關"}`;
}

function playLevelUpSound(level) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const base = 300 + level * 60;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.linearRampToValueAtTime(base + 130, now + 0.12);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.17);
}

function updateConeLevel() {
  const level = getConeLevel();
  const classList = "level-1 level-2 level-3 level-4 level-5 level-6 level-7";
  coneLevelBadge.classList.remove(...classList.split(" "));
  coneBody.classList.remove(...classList.split(" "));
  coneLevelBadge.classList.add(`level-${level}`);
  coneBody.classList.add(`level-${level}`);
  coneLevelBadge.textContent = `L${level}`;
  coneLevelEl.textContent = `L${level} ${levelColorName[level]}`;
  if (level > state.coneLevel) {
    playLevelUpSound(level);
  }
  state.coneLevel = level;
}

function updateDrops() {
  const coneRect = coneEl.getBoundingClientRect();

  state.drops = state.drops.filter((drop) => {
    drop.y += drop.speed;
    drop.x += drop.vx || 0;
    if (drop.x < 0) {
      drop.x = 0;
      drop.vx = Math.abs(drop.vx || 0);
    }
    if (drop.x > arena.clientWidth - 30) {
      drop.x = arena.clientWidth - 30;
      drop.vx = -Math.abs(drop.vx || 0);
    }
    drop.el.style.left = `${drop.x}px`;
    drop.el.style.top = `${drop.y}px`;

    const dropRect = drop.el.getBoundingClientRect();
    const hit = !(
      dropRect.right < coneRect.left ||
      dropRect.left > coneRect.right ||
      dropRect.bottom < coneRect.top ||
      dropRect.top > coneRect.bottom
    );

    if (hit) {
      handleCatch(drop);
      drop.el.remove();
      return false;
    }

    if (drop.y > arena.clientHeight + 10) {
      drop.el.remove();
      return false;
    }

    return true;
  });
}

function moveCone() {
  const maxX = arena.clientWidth - coneEl.clientWidth;
  if (state.moveLeft) state.coneX -= state.coneSpeed;
  if (state.moveRight) state.coneX += state.coneSpeed;
  state.coneX = Math.max(0, Math.min(maxX, state.coneX));
  applyConePosition();
}

function gameLoop(now) {
  if (!state.running) return;

  const spawnInterval = state.stageLevel === 3 ? 500 : state.stageLevel >= 2 ? 360 : 600;
  if (now - state.lastSpawnAt > spawnInterval) {
    spawnDrop();
    state.lastSpawnAt = now;
  }

  moveCone();
  updateDrops();
  if (state.stackCount >= 6) {
    stopGame();
    return;
  }
  state.loopId = requestAnimationFrame(gameLoop);
}

function getStars() {
  if (state.stackCount >= 6) return 3;
  if (state.stackCount >= 4) return 2;
  if (state.stackCount >= 2) return 1;
  return 0;
}

function showResult(stars) {
  const starsStr = "★".repeat(stars) + "☆".repeat(3 - stars);
  starText.textContent = `星星：${starsStr}`;

  if (stars === 3) {
    resultText.textContent = `太棒了！你疊了 ${state.stackCount} 顆，3 星過關！`;
    coneNameEl.textContent = "彩色甜筒";
    playFireworks();
    if (state.stageLevel === 1) {
      state.stageLevel = 2;
      stageLevelEl.textContent = "2";
      resultText.textContent += " 已解鎖第 2 關（更快、會斜落）！";
    } else if (state.stageLevel === 2) {
      state.stageLevel = 3;
      stageLevelEl.textContent = "3";
      resultText.textContent += " 已解鎖第 3 關（斜落+反彈+鑰匙球）！";
    } else if (state.stageLevel === 3 && state.stage4Unlocked) {
      resultText.textContent += " 你也成功解鎖了新關卡！";
    }
  } else if (stars === 2) {
    resultText.textContent = `你疊了 ${state.stackCount} 顆，拿到 2 星，要再重做一次喔！`;
    retryBtn.disabled = false;
  } else if (stars === 1) {
    resultText.textContent = `你疊了 ${state.stackCount} 顆，這次是 1 星，再試一次！`;
    retryBtn.disabled = false;
  } else {
    resultText.textContent = "這次還沒有星星，繼續練習就會變強！";
    retryBtn.disabled = false;
  }
}

function runCountdownAndStart() {
  let count = 3;
  countdownOverlay.classList.remove("hidden");
  countdownText.textContent = String(count);
  countdownText.style.animation = "none";
  countdownText.offsetHeight;
  countdownText.style.animation = "";

  const intervalId = setInterval(() => {
    count -= 1;
    if (count > 0) {
      countdownText.textContent = String(count);
      countdownText.style.animation = "none";
      countdownText.offsetHeight;
      countdownText.style.animation = "";
      return;
    }
    clearInterval(intervalId);
    countdownText.textContent = "GO!";
    countdownText.style.animation = "none";
    countdownText.offsetHeight;
    countdownText.style.animation = "";
    setTimeout(() => {
      countdownOverlay.classList.add("hidden");
      state.loopId = requestAnimationFrame(gameLoop);
      state.timerId = setInterval(() => {
        state.timeLeft -= 1;
        timeEl.textContent = String(state.timeLeft);
        if (state.timeLeft <= 0) {
          stopGame();
        }
      }, 1000);
    }, 700);
  }, 900);
}

function stopGame() {
  state.running = false;
  clearInterval(state.timerId);
  cancelAnimationFrame(state.loopId);

  const stars = getStars();
  showResult(stars);
  startBtn.disabled = false;
}

function startGame() {
  if (state.running) return;
  startBgm();
  resetRound();
  state.running = true;
  startBtn.disabled = true;
  retryBtn.disabled = true;
  runCountdownAndStart();
}

startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);
musicBtn.addEventListener("click", () => {
  state.bgmOn = !state.bgmOn;
  if (state.bgmOn) {
    startBgm();
  } else {
    stopBgm();
  }
  updateMusicBtn();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") state.moveLeft = true;
  if (e.key === "ArrowRight") state.moveRight = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") state.moveLeft = false;
  if (e.key === "ArrowRight") state.moveRight = false;
});

function bindTouchMove(btn, direction) {
  const press = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (direction === "left") state.moveLeft = true;
    if (direction === "right") state.moveRight = true;
  };
  const release = (e) => {
    if (e) e.stopPropagation();
    if (direction === "left") state.moveLeft = false;
    if (direction === "right") state.moveRight = false;
  };

  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("pointerleave", release);
}

bindTouchMove(leftBtn, "left");
bindTouchMove(rightBtn, "right");

function bindArenaSwipeMove() {
  let dragging = false;
  let draggingPointerId = null;
  let dragOffsetX = 0;

  const moveToClientX = (clientX) => {
    const rect = arena.getBoundingClientRect();
    const targetX = clientX - rect.left - dragOffsetX;
    const maxX = arena.clientWidth - coneEl.clientWidth;
    state.coneX = Math.max(0, Math.min(maxX, targetX));
    applyConePosition();
  };

  arena.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".mobile-controls")) return;
    if (e.pointerType !== "touch") return;
    if (!coneEl.contains(e.target)) return;
    e.preventDefault();
    const rect = arena.getBoundingClientRect();
    dragging = true;
    draggingPointerId = e.pointerId;
    dragOffsetX = e.clientX - rect.left - state.coneX;
    coneEl.setPointerCapture(e.pointerId);
    moveToClientX(e.clientX);
  });

  arena.addEventListener("pointerup", (e) => {
    if (e.pointerId === draggingPointerId) {
      dragging = false;
      draggingPointerId = null;
    }
  });

  arena.addEventListener("pointercancel", (e) => {
    if (e.pointerId === draggingPointerId) {
      dragging = false;
      draggingPointerId = null;
    }
  });

  arena.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "touch") return;
    if (!dragging) return;
    if (e.pointerId !== draggingPointerId) return;
    e.preventDefault();
    moveToClientX(e.clientX);
  });
}

bindArenaSwipeMove();

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("resize", () => {
  const maxX = arena.clientWidth - coneEl.clientWidth;
  state.coneX = Math.max(0, Math.min(maxX, state.coneX));
  applyConePosition();
});

pickNewTarget();
placeConeAtCenter();
updateMusicBtn();
