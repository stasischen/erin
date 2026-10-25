function canOffer(card) {
  if (upgradeLevel(card.id) >= Math.min(card.maxLevel, UPGRADE_TUNING.maxUpgradeLevel)) return false;
  if ((card.requires || []).some(id => !upgradeLevel(id))) return false;
  if (card.tier === "entry" && UPGRADES.some(other => other.tier === "entry" && other.slot === card.slot && other.school !== card.school && upgradeLevel(other.id))) return false;
  return card.tier !== "ultimate" || !UPGRADES.some(other => other.tier === "ultimate" && other.id !== card.id && upgradeLevel(other.id));
}
function cardRequirements(card) {
  return (card.requires || []).map(id => UPGRADES.find(other => other.id === id).name + " Lv1").join(" ＋ ");
}


function showOverlay(mode) {
  state.mode = mode;
  Survivor.audio.sync();
  state.keys.clear(); state.pointerId = null; state.joy = null;
  updateActionControls();
  overlay.classList.remove("hidden"); messageCard.hidden = false; upgradePanel.hidden = true; settingsPanel.hidden = true;
  if (mode === "paused") { SurvivorIcons.set(iconEl, "pause"); titleEl.textContent = "先休息一下"; textEl.textContent = "準備好了再繼續玩。"; startButton.textContent = "繼續遊戲"; statusEl.textContent = "已暫停"; SurvivorIcons.set(pauseButton, "settings"); }
  else if (mode === "over") { SurvivorIcons.set(iconEl, "over"); titleEl.textContent = "再試一次！"; textEl.textContent = `水星人的血條用完了。這次撐了 ${Math.floor(state.elapsed)} 秒。${bestRecord ? ` 最佳紀錄：${bestRecord} 秒。` : ""}`; startButton.textContent = "重新開始"; statusEl.textContent = "本局結束"; SurvivorIcons.set(pauseButton, "settings"); }
  else if (mode === "won") { SurvivorIcons.set(iconEl, "win"); titleEl.textContent = "打敗" + GAME_DATA.boss.name + "了！"; textEl.textContent = `${GAME_DATA.boss.name}的血條清空，這一局勝利！${bestRecord ? ` 最佳紀錄：${bestRecord} 秒。` : ""}`; startButton.textContent = "再玩一次"; statusEl.textContent = "勝利！"; SurvivorIcons.set(pauseButton, "settings"); }
  else { SurvivorIcons.set(iconEl, "onion-dash"); titleEl.textContent = "小怪獸"; textEl.textContent = "用搖桿或方向鍵移動，衝刺躲字、放泡泡炸彈！"; startButton.textContent = "開始遊戲"; statusEl.textContent = "準備開始"; }
}


function chooseUpgradeCards() {
  const available = UPGRADES.filter(canOffer);
  if (!available.length) { state.pendingChoices = [{ id: "heal", icon: "heal", name: "回血", description: "恢復 1 顆心" }]; }
  else {
    const shuffled = available.slice();
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    // 先各抽一張流派卡；某流派已滿時，用其他可選卡補齊。
    state.pendingChoices = ["water", "wind", "thunder"].map((school) => shuffled.find((card) => card.school === school)).filter(Boolean);
    const support = shuffled.find((card) => !card.school);
    if (support && state.pendingChoices.length === 3 && Math.random() < BUILD_TUNING.supportChance) state.pendingChoices[Math.floor(Math.random() * 3)] = support;
    for (const card of shuffled) if (state.pendingChoices.length < 3 && !state.pendingChoices.includes(card)) state.pendingChoices.push(card);
    for (let i = state.pendingChoices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [state.pendingChoices[i], state.pendingChoices[j]] = [state.pendingChoices[j], state.pendingChoices[i]]; }
  }
  showUpgradeChoices();
}
function renderSkillTree(tree) {
  tree.innerHTML = ["water", "wind", "thunder"].map(school => `<div><b style="color:${BUILD_TUNING[school].color}">${SurvivorIcons.html(school)}${BUILD_TUNING[school].name}</b> ${UPGRADES.filter(card => card.school === school).map(card => `<span class="${upgradeLevel(card.id) ? "owned" : ""}" title="${card.description}${card.requires && card.requires.length ? "；需要：" + cardRequirements(card) : ""}">${SurvivorIcons.html(card.icon)}${card.name} Lv${upgradeLevel(card.id)}${card.requires && card.requires.length ? " ← " + cardRequirements(card) : ""}</span>`).join("")}</div>`).join("");
}
function showUpgradeChoices() {
  playSound("levelup");
  render();
  state.mode = "levelup"; Survivor.audio.sync(); state.keys.clear(); state.pointerId = null; state.joy = null; updateActionControls(); overlay.classList.remove("hidden"); messageCard.hidden = true; upgradePanel.hidden = false; upgradeCards.innerHTML = "";
  renderSkillTree(document.getElementById("skillTree"));
  let selectedIndex = -1;
  const confirm = document.getElementById("confirmUpgrade");
  confirm.disabled = true;
  confirm.onclick = () => applyUpgrade(selectedIndex);
  state.pendingChoices.forEach((card, index) => {
    const level = card.id === "heal" ? "" : (card.maxLevel === 1 ? "選了就開啟" : `Lv.${upgradeLevel(card.id)} → Lv.${upgradeLevel(card.id) + 1}`);
    const button = document.createElement("button"); button.className = "upgrade-card"; button.type = "button";
    button.dataset.rarity = card.tier === "ultimate" ? "legendary" : card.tier === "fusion" ? "epic" : card.requires && card.requires.length ? "rare" : "common";
    if (card.school) button.style.setProperty("--school-color", BUILD_TUNING[card.school].color);
    const tag = card.school ? `${SurvivorIcons.html(card.school)}${BUILD_TUNING[card.school].name} · ${BUILD_SLOTS[card.slot]}` : `支援 · ${BUILD_SLOTS[card.slot] || "回血"}`;
    button.innerHTML = `<small>${SurvivorIcons.html(button.dataset.rarity === "legendary" ? "legendary" : button.dataset.rarity === "epic" ? "epic" : button.dataset.rarity === "rare" ? "rare" : "common")}${card.tier === "ultimate" ? "傳說" : card.tier === "fusion" ? "史詩" : card.requires && card.requires.length ? "稀有" : "普通"} · ${tag}</small><span class="upgrade-icon">${SurvivorIcons.html(card.icon)}</span><strong>${card.name}</strong><span class="upgrade-description">${card.description}</span><small>${level} / ${card.maxLevel ? Math.min(card.maxLevel, UPGRADE_TUNING.maxUpgradeLevel) : ""}</small>${card.requires && card.requires.length ? `<small class="requirements">需要：${cardRequirements(card)}</small>` : ""}`;
    upgradeCards.appendChild(button);
    if (!globalThis.SurvivorPreview) button.addEventListener("click", () => applyUpgrade(index));
    if (globalThis.SurvivorPreview) {
      const preview = () => {
        selectedIndex = index; confirm.disabled = false;
        confirm.setAttribute("aria-label", "選這張：" + card.name);
        confirm.title = "選這張：" + card.name;
        upgradeCards.querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
        SurvivorPreview.mount(document.getElementById('upgradePreview'), GAME_DATA, {kind:'card', id:card.id, level:upgradeLevel(card.id)+1});
      };
      let lastTap = -Infinity;
      button.addEventListener('click', () => {
        const now = performance.now();
        if (now - lastTap < 350) { applyUpgrade(index); return; }
        lastTap = now; preview();
      });
      button.addEventListener('dblclick', () => applyUpgrade(index)); button.addEventListener('focus', preview); button.addEventListener('pointerenter', preview);
      if (!index) preview();
    }
  });
  statusEl.textContent = "選一張升級卡";
}
function applyUpgrade(index) {
  const card = state.pendingChoices[index]; if (!card || state.mode !== "levelup" || (card.id !== "heal" && !canOffer(card))) return;
  if (globalThis.SurvivorPreview) SurvivorPreview.stop();
  if (card.id === "heal") state.player.health = Math.min(maxPlayerHealth(), state.player.health + Math.ceil(PLAYER_HEALTH / BUILD_TUNING.shieldHealthDivisor));
  else { state.upgrades[card.id] = upgradeLevel(card.id) + 1; if (upgradeLevel(card.id) === 1 && card.effects.some(e => e.feature === "water-ultimate")) state.ultimateTimer = BUILD_TUNING.ultimateSeconds; if (card.effects.some(e => e.feature === "bubble-shield")) { state.player.health = Math.min(maxPlayerHealth(), state.player.health + Math.ceil(PLAYER_HEALTH / BUILD_TUNING.shieldHealthDivisor)); } }
  skillVisual("card", state.player.x, state.player.y - 38, { text: card.icon || "health", color: card.school ? BUILD_TUNING[card.school].color : "#237bc2", life: .8 });
  playSound("select");
  state.pendingChoices = []; overlay.classList.add("hidden"); state.mode = "playing"; SurvivorIcons.set(pauseButton, "settings"); updateActionControls(); updateHud(); state.lastTime = performance.now(); scheduleFrame();
}


// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.ui = globalThis.Survivor.ui || {};
globalThis.Survivor.ui.levelup = globalThis.Survivor.ui.levelup || {};
Object.defineProperties(globalThis.Survivor.ui.levelup, {
  canOffer: { enumerable: true, get: () => canOffer },
  cardRequirements: { enumerable: true, get: () => cardRequirements },
  showOverlay: { enumerable: true, get: () => showOverlay },
  chooseUpgradeCards: { enumerable: true, get: () => chooseUpgradeCards },
  renderSkillTree: { enumerable: true, get: () => renderSkillTree },
  showUpgradeChoices: { enumerable: true, get: () => showUpgradeChoices },
  applyUpgrade: { enumerable: true, get: () => applyUpgrade }
});
