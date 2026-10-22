verdict: changes
d52ab220714ea50ce0127c50eb03ffcac08b8ece

看了什麼：
- `git diff main...codex/survivor-stage-1-move`（10 個檔案，+285／-9）：`games/survivor/game.js`、`index.html`、`style.css`、首頁 `index.html`、任務卡、DECISIONS.md、SETUP.md、survivor-game-plan.md §4、兩筆 inbox/done。
- 依 docs/survivor-game-plan.md §6 清單逐項檢查。

需要修（擋合併）：
1. 無敵計時順序（§6「無敵計時在碰撞判定之後才扣」，`612cbd8` 的老坑）：`tick()` 一開頭就做 `state.player.invincible -= dt`，碰撞判定在後面，順序和清單相反；碰撞判定上方的註解寫「先判斷碰撞，再減少無敵時間」，但程式不是這樣做，會誤導 Erin。請把 `invincible`（和 `hitFlash`）的遞減移到碰撞判定之後，讓註解和程式一致。
2. 輸掉時狀態文字被蓋掉：`tick()` 裡 `showOverlay("over")` 之後，下一行仍把 `statusEl` 改成「躲避中 N 秒」，所以結束畫面上方顯示的是「躲避中」而不是「本局結束」。輸掉後請直接 return（或只在 playing 時更新狀態文字）。

小建議（不擋）：
- 暫停後在同一幀內又馬上繼續，`togglePause()` 會多叫一次 `requestAnimationFrame(frame)`，可能同時跑兩個迴圈、遊戲變兩倍速。可以用一個旗標或記住 rAF id 避免重複。
- ✏️ Erin 設定區的 `INVINCIBLE_SECONDS`、`MAX_DT` 沒有給小朋友看的註解；`MAX_DT` 是技術值，可以移到設定區外，`INVINCIBLE_SECONDS` 加一句「被撞後閃爍幾秒不會再扣血」。
- `.game-shell` 只寫 `height: 100dvh`，舊 iPad（iOS 15.4 以前）不認得 dvh；可在前面先加 `height: 100%` 當備案。
- 敵人目前只會新增不會移除，有 `ENEMY_LIMIT` 上限，階段 1 沒問題；階段 2 開始打倒敵人時記得做物件重複使用。

通過的項目：
- `touch-action: none`、`user-select`、`-webkit-touch-callout`、擋 `contextmenu`；按鈕 `touch-action: manipulation`。
- 搖桿用 Pointer Events + `setPointerCapture`，只追第一根手指 `pointerId`；暫停按鈕在 canvas 外，不會叫出搖桿；沒有用 media query 藏觸控介面。
- 沒用 `roundRect`／`.at`／`structuredClone`；`ellipse`、`closest` 舊 iPad 可用。
- resize 後重設 `setTransform` 和 `imageSmoothingEnabled = false`。
- 切走（blur／visibilitychange）自動暫停；`dt` 上限 0.05、繼續時重設 `lastTime`，不會瞬移。
- 移動與計時用 `dt`；重新開始用 `resetGame()` 重設所有狀態。
- `?v=20261022a` 版本號有加；沒有外部圖片或音效網址。
- 文字繁體中文、不嚇人；血條約 220px（兩個食指長）、甲本畫成長方形作業本，符合 Erin 的決定。
- SETUP.md 與 plan §4 的修改是家長在 inbox 指定的，沒有超出範圍。
