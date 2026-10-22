verdict: approve
b8909630486f271451f62c6e9088bb5782fbe6eb

看了什麼（複審）：
- `git diff main...codex/survivor-stage-2-attack`，重點看上次審查後的 `b890963`：`sw.js`、`games/survivor/game.js`、`games/survivor/index.html`、任務卡、inbox/done 回饋紀錄。
- `node --check` 檢查 `sw.js`、`game.js` 語法通過；`sw.js` 預先快取清單裡的檔案都存在（含檔名有空格的 `Kenney Future.ttf`）。
- 第一次審查的遊戲部分（最近敵人、物件池、回收、Erin 的顏色與蒸發決定、`dt`、相容性）沒有變動，維持通過。

上次擋合併的問題已修好：
- `sw.js` 改成 `/erin/` 底下所有 GET 請求一律「網路優先」，成功就更新快取；只有離線抓不到時才用 `ignoreSearch` 退回快取，最後退回首頁。`game.js?v=新版` 會直接去網路抓，`?v=` 版本號機制恢復正常，舊遊戲沒有 `?v=` 的檔案在線上時也會拿到新版。
- `CACHE_NAME` 升到 `erin-games-v3`，啟用時會清掉舊的 `erin-games-*` 快取；註解寫清楚了更新規則。
- `?v=` 升到 `20261022e`。

小建議也一併做了：
- `startGame()` 改用 `scheduleFrame()`。
- 寶石外框改成深橘 `#a65300`。

小提醒（不擋）：
- 離線時若某個 JS／CSS 沒被快取，會退回首頁 HTML；因為所有遊戲檔都有預先快取，實際上不太會發生。
- 寶石上限滿了不掉寶石、經驗條顏色要不要改橘色，留到之後再問 Erin。

結論：通過，可以合併上線。
