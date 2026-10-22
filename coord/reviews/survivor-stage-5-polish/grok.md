verdict: changes
92a84869a614de83ac2facf845148130fb89858e

# Grok 審查：survivor-stage-5-polish

## 看過的檔案
- games/survivor/game.js、games/survivor/index.html、games/survivor/style.css、index.html
- GAMES_IDEAS.md、coord/knowledge/DECISIONS.md、coord/tasks/survivor-stage-5-polish.json、coord/inbox/done/20261022T105159Z-parent-settings.md
- 對照 docs/survivor-game-plan.md §6 清單與階段 5 的「Grok 特別檢查」

## 做得好的地方
- 設定頁：10 個大滑桿＋音效／震動開關＋恢復預設＋完成，從主選單開、遊戲中按會先暫停；localStorage 讀寫都包 try/catch，讀回的值有夾在 min/max 之間。
- 最佳紀錄存在 localStorage，結算畫面有顯示；勝利／失敗都走 finishRun。
- 音量小（0.055）、聲音短，不會一打開就很吵；沒有外部圖片或音效網址。
- `?v=` 已更新為 20261022k；`node --check` 通過；沒用 roundRect／at／structuredClone；繪圖仍保留 imageSmoothingEnabled = false。
- 首頁卡片改成正式介紹、GAMES_IDEAS.md 已完成表加一行、DECISIONS.md 有記家長決定。

## 必須修
1. ✏️ Erin 設定區失效：`SETTING_DEFAULTS` 把 190、100、62… 又寫死一次，遊戲現在讀 `gameSettings`，Erin 改 `UPGRADE_TUNING` 裡的 playerSpeed、playerHealth、enemySpeed、enemyHealth、secondEnemySpeed、secondEnemyHealth、waveSeconds、teacherHealth、shotInterval 都不會有作用，註解「請改上面的 playerSpeed」也變成誤導。請讓預設值直接來自 `UPGRADE_TUNING`（例如 `playerSpeed: UPGRADE_TUNING.playerSpeed`），「恢復預設」就回到 Erin 寫在檔案裡的數字。
2. 音效在 iPad 上很可能沒聲音、且會累積：`playTone` 每一聲都 `new AudioContext()`。iPad Safari 在點擊以外建立的 AudioContext 會停在 suspended（打倒甲本、被撞時都不是點擊），瀏覽器對同時存在的 AudioContext 數量也有限制，打怪很密時會一直開新的。請改成整個遊戲共用一個 AudioContext，在第一次點「開始遊戲」（或任何點擊）時建立並 `resume()`，之後每個音只建 oscillator＋gain。

## 小建議（不擋）
- 目前沒有 assets/ 資料夾，但程式每次開遊戲都去抓 assets/player.png、jaben.png、otsubon.png，會有 3 個 404。可以在 SPRITES 表裡寫檔名（null 代表還沒畫），有寫才載入，Erin 放圖時也知道要改哪裡。
- drawBlob 用顏色判斷是不是乙本，Erin 改顏色後可能換錯圖；可以改成傳敵人的 id。
- 階段 5 完成條件「Erin 畫的角色出現在遊戲裡」還沒達成；程式修好上線後，等 Erin 用 Piskel 畫好 PNG 再接上即可。
