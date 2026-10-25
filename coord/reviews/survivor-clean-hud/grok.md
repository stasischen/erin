verdict: approve
68e9ccc9a819e994140900b4fdf0e043b1bcc5f1

## 檢查的檔案
- games/survivor/game.js、index.html、style.css、tests/clean-hud.cjs、tests/viewport.html、sw.js
- coord/tasks/survivor-clean-hud.json、coord/inbox/done/20261025T093753Z-parent-clean-hud.md、docs/survivor-clean-hud-validation.md

## 結果
- 鏡頭外生成：`offscreenSpawn(r)` 只在鏡頭四邊外（身體 + 16px 緩衝）且在地圖內取點；沒有合法邊時回傳 null 延後生成，不會退回畫面內。小怪、老師召喚的小怪（都走 spawnEnemy）與老師（60px 含名字）共用。老師在第 931 行條件下每 tick 重試，沒問題。
- 按鈕：返回（🏠）、⚙️、🌀、💨 都是圓形、只有圖示，保留 aria-label／title；冷卻環沿用 conic-gradient。
- HUD：四欄位從戰鬥畫面移到設定面板，設定中顯示卡名、等級、流派，並可展開技能樹看合體／終極前置條件。⚙️ 直接暫停並開設定；升級選卡時不會打開。
- 雷雲折線改用 cameraY 插值，鏡頭捲動後位置正確。
- ?v= 升到 20261025k，sw.js 升到 erin-games-v15。
- 沒有使用 roundRect、Array.at、structuredClone；沒有外部素材；文字繁中；範圍符合卡片。
- 六組 Node 測試在本機重跑全部通過。

## 小提醒（不擋上線）
- 升級畫面的技能樹現在也列出合體卡（原本過濾掉），資訊多一點但無害。
- viewport.html 與實機手感仍待 Erin 在手機／iPad 試玩確認。
