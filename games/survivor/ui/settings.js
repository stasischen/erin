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
  soundToggle.innerHTML = SurvivorIcons.html(gameSettings.sound ? "sound" : "mute") + (gameSettings.sound ? " 音效：開" : " 音效：關");
  vibrationToggle.innerHTML = SurvivorIcons.html("vibration") + (gameSettings.vibration ? " 震動：開" : " 震動：關");
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
  if (state.mode === "transition") return;
  if (state.mode === "playing") togglePause();
  settingsReturnMode = state.mode;
  makeSettingsControls(); updateHud(); renderSkillTree(document.getElementById("settingsSkillTree")); messageCard.hidden = true; upgradePanel.hidden = true;
  settingsPanel.hidden = false; overlay.classList.remove("hidden");
}
function closeSettings() {
  if (globalThis.SurvivorPreview) SurvivorPreview.stop();
  settingsPanel.hidden = true; messageCard.hidden = false;
  showOverlay(settingsReturnMode);
}



// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.ui = globalThis.Survivor.ui || {};
globalThis.Survivor.ui.settings = globalThis.Survivor.ui.settings || {};
Object.defineProperties(globalThis.Survivor.ui.settings, {
  startAudio: { enumerable: true, get: () => startAudio },
  playTone: { enumerable: true, get: () => playTone },
  updateSettingsButtons: { enumerable: true, get: () => updateSettingsButtons },
  updateSettingValue: { enumerable: true, get: () => updateSettingValue },
  makeSettingsControls: { enumerable: true, get: () => makeSettingsControls },
  settingsReturnMode: { enumerable: true, get: () => settingsReturnMode },
  openSettings: { enumerable: true, get: () => openSettings },
  closeSettings: { enumerable: true, get: () => closeSettings }
});
