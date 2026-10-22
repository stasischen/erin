verdict: approve
4f33a25c4aaab7fa7ab8be1a199b3e128f4a85c6

看了什麼：
- `git diff main...codex/survivor-stage-1-move`，重點看上一輪（`d52ab22`）之後的修正 `4f33a25`：`games/survivor/game.js`、`index.html`、`style.css`、任務卡、inbox/done 的回饋紀錄。
- 依 docs/survivor-game-plan.md §6 清單複查；`node --check game.js` 語法通過。

上一輪擋合併的兩項，都修好了：
1. 無敵計時順序：`invincible`、`hitFlash` 的遞減已移到碰撞判定之後，和註解「先判斷碰撞，再減少無敵時間」一致。
2. 輸掉時狀態文字：`showOverlay("over")` 之後直接 `return`，結束畫面不會再被改成「躲避中」。

上一輪的小建議也都處理了：
- 暫停／繼續改用 `scheduleFrame()` + `frameRequest`，暫停時 `cancelAnimationFrame`，不會重複開迴圈。
- `INVINCIBLE_SECONDS` 加了給 Erin 看的註解；`MAX_DT` 移到設定區外並加註解。
- `.game-shell` 先寫 `height: 100%` 再寫 `100dvh`，舊 iPad 有備案。
- 快取版本號更新為 `?v=20261022b`。

小建議（不擋，可留到階段 2）：
- `startGame()` 第 56 行仍直接呼叫 `requestAnimationFrame(frame)`，沒有經過 `scheduleFrame()`，所以 `frameRequest` 沒記到。極端情況（按開始後同一幀內立刻暫停再繼續）可能短暫跑兩個迴圈。改成 `scheduleFrame()` 就一致了。
- blur／visibilitychange 自動暫停時沒有取消已排的 frame；目前因為 `scheduleFrame()` 會擋重複、`frame()` 只在 playing 時續排，所以沒問題，只是提醒之後改動時留意。

結論：階段 1 可以交給 Erin 試玩。
