verdict: changes
7e95116b3b0dc4f8cf57cf94652209dae20da55c

# Grok 審查：survivor-stage-4-waves

## 看過的檔案
- games/survivor/game.js、games/survivor/index.html、games/survivor/style.css、sw.js
- coord/knowledge/DECISIONS.md、coord/tasks/survivor-stage-4-waves.json、coord/inbox/done/*stage4*、*erin-card*、*erin-win*
- 對照 docs/survivor-game-plan.md §5 階段 4 與 §6 清單

## 做得好的
- 乙本（血 60 < 甲本 100、速度比甲本快）、老師 120 秒出場、文字彈幕、頂端血條、打完才勝利，都符合 Erin 的決定。
- 小兵聚集→閃光→老師的簡單合體版、勝利畫面、resetGame 重設 boss／enemyShots／healTimer。
- 老師的子彈先判斷碰撞再看無敵；enemyShots 有 18 顆上限。
- index.html 的 `?v=` 已更新、sw.js 快取版本 v4；沒用 roundRect／at 等新 API；沒有外部素材；文字溫和不嚇人。
- 自動補血卡照 Erin 原話實作（8 秒、每級快 20%、Lv5、綠色 +1）。

## 必須修
1. **老師和文字子彈畫在 tick() 裡，不在 render() 裡。** render()（renderLoop 每幀都畫、升級跳出前也會畫）會先把整個畫面重畫，畫面上不會有老師和文字子彈；暫停、升級三選一時老師和子彈會消失，遊玩時是否看得到取決於兩個 requestAnimationFrame 的先後順序。請把老師和 enemyShots 的繪圖搬到 render()（tick 只更新位置和碰撞）。
2. **缺少 `WAVES` 資料表。** 計畫 §5 要求「`WAVES` 資料表（第幾秒開始出哪種敵人、出多快）」，Erin 試玩後要自己調它。現在乙本出場是寫死的 `state.elapsed >= 35 && Math.random() < 0.42`，出怪速度是寫死公式 `2.1 - elapsed * 0.015`。請在 ✏️ Erin 設定區加一個 WAVES 表（例如每列：從第幾秒開始、甲本／乙本各佔多少、幾秒出一隻），每行附小學生看得懂的註解，spawnEnemy 和出怪間隔都照表走。

## 小建議（可一起修）
- 穿透水球打老師時沒有用 hitList，重疊的每一幀都會再扣一次血（和階段 3 修過的問題一樣）；請讓同一顆水球只打老師一次。
- 老師身體撞到主角目前不扣血，可以考慮和甲本一樣扣血。
- 計畫提到「慢速大隻」敵人，這次沒做；可以先不做，或之後請 Erin 設計。

## 手機效能
敵人上限、水球／寶石物件池沿用前面階段；文字子彈數量有上限，預期不會卡。
