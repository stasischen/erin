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
// 流派可以混搭；四欄顯示本局已拿到的效果，不會蓋掉先前選的卡。

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
pauseButton.addEventListener("click", () => { if (state.mode !== "levelup") openSettings(); });
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (state.mode === "maker" || settingsPanel.hidden === false || (state.mode !== "playing" && event.target && event.target.tagName === "BUTTON") || (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) return;
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
// CSS 直拿時順時針轉 90 度；把螢幕位置轉回遊戲位置（包含縮放）。
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  if (window.innerHeight > window.innerWidth) {
    return { x: (event.clientY - rect.top) * state.width / rect.height,
      y: (rect.right - event.clientX) * state.height / rect.width };
  }
  return { x: (event.clientX - rect.left) * state.width / rect.width,
    y: (event.clientY - rect.top) * state.height / rect.height };
}
canvas.addEventListener("pointerdown", (event) => {
  if (state.mode !== "playing" || event.target.closest("button")) return;
  if (state.pointerId !== null) return;
  const { x: baseX, y: baseY } = canvasPoint(event);
  if (baseX > state.width / 2) return;
  event.preventDefault(); state.pointerId = event.pointerId; canvas.setPointerCapture(event.pointerId);
  state.joy = { baseX, baseY, x: 0, y: 0 };
});
canvas.addEventListener("pointermove", (event) => { if (event.pointerId !== state.pointerId || !state.joy) return; event.preventDefault(); const point = canvasPoint(event); const dx = point.x - state.joy.baseX, dy = point.y - state.joy.baseY; const distance = Math.max(1, Math.hypot(dx, dy)); const amount = Math.min(1, distance / 35); state.joy.x = dx / distance * amount; state.joy.y = dy / distance * amount; });
function endPointer(event) { if (event.pointerId !== state.pointerId) return; state.pointerId = null; state.joy = null; }
canvas.addEventListener("pointerup", endPointer); canvas.addEventListener("pointercancel", endPointer); canvas.addEventListener("lostpointercapture", endPointer);
window.addEventListener("resize", () => { if (!PREVIEW_MODE) resize(); });
if (window.visualViewport && !PREVIEW_MODE) {
  window.visualViewport.addEventListener("resize", resize);
  window.visualViewport.addEventListener("scroll", resize);
}
if (!PREVIEW_MODE) { resize(); showOverlay("ready"); renderLoop(); }
if (MAKER_MODE && !PREVIEW_MODE) {
  const makerLink = document.getElementById("makerLink");
  makerLink.innerHTML = SurvivorIcons.html("maker") + " 回設計室";
  if (MAKER_LOAD.valid && new URLSearchParams(location.search).get("play") === "1") startGame();
  else textEl.textContent = MAKER_LOAD.errors.join("；") + "。本次使用預設作品。";
}


// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.input = globalThis.Survivor.input || {};
Object.defineProperties(globalThis.Survivor.input, {
  movementInput: { enumerable: true, get: () => movementInput },
  canvasPoint: { enumerable: true, get: () => canvasPoint },
  endPointer: { enumerable: true, get: () => endPointer }
});
