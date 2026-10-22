verdict: approve
b5b789d071b587313f485f7ac5cbefa662a6c3b0

# Grok 複審：survivor-stage-4-waves

## 看過的檔案
- games/survivor/game.js、games/survivor/index.html、sw.js、coord/tasks/survivor-stage-4-waves.json
- 對照上一輪審查（7e95116）的必須修項目，以及 docs/survivor-game-plan.md §6 清單

## 上一輪必須修：都修好了
1. 老師和文字子彈的繪圖已搬到 render()；tick() 裡已經沒有任何 ctx 繪圖，暫停和升級三選一時老師與子彈也看得到。
2. ✏️ Erin 設定區新增 `WAVES` 表（開始秒數、甲本／乙本比例、幾秒出一隻），每列有小學生看得懂的註解；spawnEnemy 和出怪間隔都照表走。

## 小建議：也處理了
- 穿透水球打老師改用 hitList，同一顆水球只打老師一次。
- 老師出場（bossIntro 結束）後身體撞到主角會扣血，且仍是先判斷碰撞再扣無敵時間。

## §6 檢查
- `?v=` 已更新為 20261022j；沒用 roundRect／at／structuredClone；`node --check` 語法通過。
- 沒有外部素材；文字溫和；改動在卡片範圍內。

## 之後可以考慮（不擋上線）
- spawnEnemy 和 tick 各自找一次目前波次，可以抽成小函式；比例除以總和，Erin 填的數字加起來不等於 1 也不會壞。
- 「慢速大隻」敵人還沒做，可以等 Erin 試玩後再設計。
