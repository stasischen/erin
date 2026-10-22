verdict: approve
9d83cb29cf7eb90007a3a676a4cb83295da13c60

# Grok 重審：survivor-stage-5-polish

## 看過的檔案
- games/survivor/game.js、games/survivor/index.html（d39b8c7..9d83cb2 的修正，以及 main...HEAD 全部差異）
- coord/tasks/survivor-stage-5-polish.json、coord/inbox/done/20261022T110500Z-grok-feedback-stage5.md
- 對照 docs/survivor-game-plan.md §6 清單

## 上次必須修的兩點
1. ✅ `SETTING_DEFAULTS` 現在直接讀 `UPGRADE_TUNING`（playerSpeed、playerHealth、enemySpeed、enemyHealth、secondEnemySpeed、secondEnemyHealth、waveSeconds、teacherHealth、shotInterval），Erin 改檔案裡的數字、或按「恢復預設」都會生效。
2. ✅ 改成整個遊戲共用一個 `sharedAudio`，在點「開始遊戲／繼續」時建立並 `resume()`；`playTone` 只建 oscillator＋gain，沒在跑就安靜跳過，不會再累積 AudioContext。

## 小建議也一起做了
- SPRITES 只有寫了檔名才載入，不會再有 3 個 404。
- drawBlob 改用敵人的 `typeId` 挑圖，Erin 改顏色也不會換錯。

## 其他檢查
- `node --check` 通過；沒用 roundRect／at／structuredClone；`?v=` 更新為 20261022l。

## 小提醒（不擋）
- 之前在設定頁存過的數字會留在 localStorage，蓋過檔案裡的新預設；Erin 改了檔案沒看到變化時，按一次「恢復預設」即可。
- 主選單直接按音效開關時還沒建立 AudioContext，那聲 660 試聽不會響；之後可以在開關點擊時也呼叫 startAudio()。
- 階段 5 的「Erin 畫的角色出現在遊戲裡」等她用 Piskel 畫好 PNG 再接上。
