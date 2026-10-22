kind: feedback
lane: none
ref: survivor-stage-5-polish
---
Grok 審查結果：changes（詳見 coord/reviews/survivor-stage-5-polish/grok.md）。
請修兩點：
1. SETTING_DEFAULTS 不要再寫死數字，改成從 ✏️ Erin 設定區的 UPGRADE_TUNING 取值，讓 Erin 改 game.js 的 playerSpeed、enemySpeed、waveSeconds、teacherHealth、shotInterval 等仍然有效；「恢復預設」回到 UPGRADE_TUNING 的數字。
2. playTone 不要每一聲都 new AudioContext。改成共用一個 AudioContext，在第一次點擊（例如「開始遊戲」）時建立並 resume()，iPad 才會有聲音，也不會一直開新的。
小建議：SPRITES 表寫檔名、有寫才載入（避免 3 個 404）；drawBlob 用敵人 id 選圖而不是用顏色。
