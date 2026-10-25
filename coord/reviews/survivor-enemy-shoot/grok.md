verdict: approve
64ea091cc1308bad16aceec8f0c55ed02c90d784

# Grok 審查：survivor-enemy-shoot

## 檢查的檔案
- games/survivor/game.js、index.html、style.css、sw.js
- games/survivor/tests/enemy-shoot.cjs、docs/survivor-enemy-shoot-validation.md
- coord/knowledge/DECISIONS.md、coord/tasks/survivor-enemy-shoot.json

## 結果
- 規格符合：Lv8 起甲乙本朝主角丟「甲乙字考寫讀」，乙本間隔較長（5 秒 vs 3 秒），全體至少隔 0.65 秒、上限 12，橘色方紙單字與老師粉紅詞句可區分，打中扣血，升級顯示一次「甲本開始丟字了！」。
- 數值都在 ✏️ Erin 設定區並有小學生看得懂的註解；設定頁加了 5 個可調項，舊 v2 存檔補預設值並限制範圍。
- 移動與計時都用 dt；暫停／升級畫面時 tick 不跑，子彈與提示凍結；合體期間、畫面外與死掉的小兵不射。
- 命中判定先看 invincible 再扣，沿用既有無敵保護；新增致命傷同幀立即結算，避免卡在升級畫面。
- 子彈用物件池（takeFromPool）重用，book／teacher 分開計數上限；重開清除提示、計時與子彈。
- 沒用 roundRect／.at／structuredClone；繪圖用 save/restore 包住，不影響其他文字設定。
- index.html ?v= 改為 20261025c，sw 快取 v6→v7；沒有外部素材；改動未超出卡片範圍。
- 本機重跑 `node games/survivor/tests/enemy-shoot.cjs`、`balance.cjs`、`node --check` 皆通過。

## 小建議（不擋上線）
- 提示框 z-index 2 會在升級卡畫面最下方顯示；若和卡片重疊，可之後微調位置。
- 國字辨識度與難度需 Erin 在 iPad 實機試玩確認。
