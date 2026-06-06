// ===== 植物設定 =====
// ✏️ 她可以改的地方：每種植物的資訊
const PLANTS = {
  carrot:  { name: "胡蘿蔔", emoji: "🥕", seed: "🟤", sprout: "🌱", growTime: 8000,  value: 10 },
  tomato:  { name: "番茄",   emoji: "🍅", seed: "🟤", sprout: "🌱", growTime: 12000, value: 20 },
  lettuce: { name: "生菜",   emoji: "🥬", seed: "🟤", sprout: "🌱", growTime: 10000, value: 15 },
  corn:    { name: "玉米",   emoji: "🌽", seed: "🟤", sprout: "🌱", growTime: 15000, value: 30 },
};

// ✏️ 她可以改的地方：澆水加速多少（毫秒）
const WATER_BOOST = 3000;

// ✏️ 她可以改的地方：花園有幾格
const PLOTS = 12;

// ===== 遊戲狀態 =====
let selectedSeed = "carrot";
let coins = 0;
let harvested = 0;

// 每一格的狀態 { seed, plantedAt, watered, ready }
const plots = Array(PLOTS).fill(null);

// ===== DOM =====
const statusEl = document.getElementById("status");
const coinsEl = document.getElementById("coins");
const harvestedEl = document.getElementById("harvested");
const gardenEl = document.getElementById("garden");
const waterBtn = document.getElementById("waterBtn");
const harvestBtn = document.getElementById("harvestBtn");
const seedBtns = document.querySelectorAll(".seed-btn");

// ===== 初始化花園 =====
function initGarden() {
  gardenEl.innerHTML = "";
  for (let i = 0; i < PLOTS; i++) {
    const plot = document.createElement("div");
    plot.className = "plot empty";
    plot.dataset.index = i;
    plot.addEventListener("click", () => handlePlotClick(i));
    gardenEl.appendChild(plot);
  }
}

// ===== 更新畫面 =====
function updateDisplay() {
  coinsEl.textContent = coins;
  harvestedEl.textContent = harvested;

  const plotEls = gardenEl.querySelectorAll(".plot");
  for (let i = 0; i < PLOTS; i++) {
    const plot = plots[i];
    const el = plotEls[i];

    if (!plot) {
      el.className = "plot empty";
      el.innerHTML = "";
    } else if (plot.ready) {
      el.className = "plot planted ready";
      el.innerHTML = `
        <span class="plot-emoji">${PLANTS[plot.seed].emoji}</span>
        <span class="plot-label">${PLANTS[plot.seed].name}</span>
      `;
    } else {
      const elapsed = Date.now() - plot.plantedAt;
      const total = PLANTS[plot.seed].growTime;
      const progress = Math.min(1, elapsed / total);
      const stage = progress < 0.5 ? "seed" : "sprout";
      const emoji = stage === "seed" ? PLANTS[plot.seed].seed : PLANTS[plot.seed].sprout;
      const label = stage === "seed" ? "種子" : "發芽中";

      el.className = `plot planted${plot.watered ? " watered" : ""}`;
      el.innerHTML = `
        <span class="plot-emoji">${emoji}</span>
        <span class="plot-label">${label}</span>
        <div class="plot-bar"><div class="plot-fill" style="width:${progress * 100}%"></div></div>
      `;
    }
  }
}

// ===== 種植 =====
function plantSeed(index) {
  if (plots[index]) return;
  plots[index] = { seed: selectedSeed, plantedAt: Date.now(), watered: false, ready: false };
  statusEl.textContent = `種下了${PLANTS[selectedSeed].name}！等它長大吧～`;
  updateDisplay();
}

// ===== 澆水 =====
function waterAll() {
  let watered = 0;
  for (let i = 0; i < PLOTS; i++) {
    const plot = plots[i];
    if (plot && !plot.ready && !plot.watered) {
      plot.plantedAt -= WATER_BOOST;
      plot.watered = true;
      watered++;
    }
  }
  if (watered > 0) {
    statusEl.textContent = `💧 幫 ${watered} 格菜澆了水！長得更快了！`;
  } else {
    statusEl.textContent = "沒有需要澆水的菜～";
  }
  updateDisplay();
}

// ===== 收成 =====
function harvestReady() {
  let count = 0;
  let totalValue = 0;
  for (let i = 0; i < PLOTS; i++) {
    const plot = plots[i];
    if (plot && plot.ready) {
      const value = PLANTS[plot.seed].value;
      totalValue += value;
      plots[i] = null;
      count++;
      harvested++;
    }
  }
  if (count > 0) {
    coins += totalValue;
    statusEl.textContent = `🧺 收成了 ${count} 樣蔬菜，賺了 ${totalValue} 金幣！`;
  } else {
    statusEl.textContent = "還沒有菜可以收成～再等等吧！";
  }
  updateDisplay();
}

// ===== 點擊格子 =====
function handlePlotClick(index) {
  const plot = plots[index];
  if (!plot) {
    plantSeed(index);
  } else if (plot.ready) {
    const value = PLANTS[plot.seed].value;
    coins += value;
    harvested++;
    plots[index] = null;
    statusEl.textContent = `🧺 收成了${PLANTS[plot.seed].name}，賺了 ${value} 金幣！`;
    updateDisplay();
  }
}

// ===== 選擇種子 =====
seedBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    seedBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSeed = btn.dataset.seed;
    statusEl.textContent = `選了${PLANTS[selectedSeed].name}，點空地種下去吧！`;
  });
});

// ===== 按鈕 =====
waterBtn.addEventListener("click", waterAll);
harvestBtn.addEventListener("click", harvestReady);

// ===== 定時檢查成長 =====
function checkGrowth() {
  for (let i = 0; i < PLOTS; i++) {
    const plot = plots[i];
    if (plot && !plot.ready) {
      const elapsed = Date.now() - plot.plantedAt;
      if (elapsed >= PLANTS[plot.seed].growTime) {
        plot.ready = true;
      }
    }
  }
  updateDisplay();
}

// ===== 啟動 =====
initGarden();
updateDisplay();
setInterval(checkGrowth, 500);
