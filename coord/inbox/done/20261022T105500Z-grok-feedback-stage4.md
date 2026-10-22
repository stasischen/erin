kind: feedback
lane: none
ref: survivor-stage-4-waves
---
Grok 審查結果：changes（詳見 coord/reviews/survivor-stage-4-waves/grok.md）。
請修兩點：
1. 老師和文字子彈現在畫在 tick() 裡，會被 render() 重畫蓋掉（暫停、升級時一定消失）。請把它們的繪圖搬進 render()，tick 只負責移動和碰撞。
2. 補上 ✏️ Erin 設定區的 WAVES 資料表（第幾秒開始、出哪種敵人／比例、幾秒出一隻），每行附簡單註解；spawnEnemy 與出怪間隔照表走，取代寫死的 35 秒／0.42／2.1 - elapsed*0.015。
小建議：同一顆穿透水球只打老師一次（用 hitList）；老師撞到主角也扣血。
