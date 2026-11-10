# Boss4 雲端 UI 證據與 Rolling Eye 1024×461 缺口

此文件記錄目前可核對的證據與阻礙，不取代 canonical 任務卡 `coord/tasks/survivor-boss-gallery-4.json`，也不代表 Rolling Eye 通過或發現遊戲缺陷。

## 2026-10-31 父雲端 Mask Statue 實戰 UI 觀察

以下是父端回報的固定候選真實畫面觀察，僅適用於 PR #105 head `cc7702eeb3dc4aaed2f1805a6c891c39f211a1f1`、遊戲版本 `20261031d`，視窗尺寸 1188×761。操作中沒有注入遊戲 state。

- 15:00:26.086：出現向右直線箭頭預警。
- 15:00:27.115：Boss 沿預警方向衝撞玩家，玩家扣血。
- 15:00:29.148：右牆撞擊後出現暈眩圖示，Boss 左側出現弱點。
- 15:00:31.091：Boss 恢復後再次向左衝撞。

這些畫面只證明該尺寸下觀察到箭頭預警、衝撞命中、撞牆暈眩／弱點顯示及再次出招。未據此判定正面傷害量、弱點增傷值或精確的 2 秒時長；亦不代表三尺寸實玩、Mask Statue 美術驗收或 Boss4 整卡通過。

## 自動測試紀錄（與上方視覺觀察分開）

原作者回報 `node games/survivor/tools/test.cjs --layout` 為 135 個 PASS、exit 0。本次只補記父雲端 UI 證據，沒有重跑完整測試；這筆自動測試結果不是上述畫面觀察的推論。

## 現有證據

- Canonical 卡記載：Rolling Eye 固定候選 `20261028e` 的 740×360 與 1180×820 beam／hit 試玩已完成；1024×461 記錄只到 E→N，下一個預警是 E。
- 卡片仍要求在 1024×461 親眼確認 E→N→W，並在靜止狀態確認 +90° 姿態。現有可見記錄沒有證明這兩項；不能把缺少證據推論成遊戲缺陷。
- 本機 Boss Gallery 4 專用截圖目錄只有 baseline 與三尺寸 HUD 戰鬥截圖，沒有 Rolling Eye 路徑或 +90° 姿態截圖。沒有可供核對的其他本機 Rolling Eye 操作紀錄。

## 已嘗試的瀏覽器讀值與限制

現有工具紀錄顯示，曾用 Node 透過 Chrome DevTools WebSocket 連本機頁面，以 `Emulation.setDeviceMetricsOverride` 設為 1024×461、停用瀏覽器快取，並用 `Runtime.evaluate` 操作試煉選單與讀取遊戲 state。輪詢腳本把 `Runtime.evaluate` 的回傳值轉成 JSON 解析。

兩次 state 讀取都沒有得到可用值：

1. 一次讀取只輸出 `undefined` 與空選項陣列，沒有產生可核對的 state。
2. 另一次輪詢把 `undefined` 傳給 `JSON.parse`，實際錯誤為 `SyntaxError: "undefined" is not valid JSON`。

設定階段另有一次 DOM click 錯誤：`TypeError: Cannot read properties of undefined (reading 'click')`。現有紀錄無法判定根因在 DevTools 回傳包裝、頁面執行作用域，還是遊戲 state hook；不對任何一層作推測。本輪依重複阻礙規則停止再試 DevTools，也沒有重跑測試或啟動瀏覽器。

## 最小人工觀察方案，待使用者決定

在固定 PR105 候選的實際遊戲畫面，以 1024×461 錄一段不中斷影片：進入 Rolling Eye 試煉，記錄連續的 E→N→W，接著在靜止狀態記錄 +90° 姿態。保留原尺寸與原驗收條件，不插入 state、不降低標準，也不增加測項；由使用者決定是否採用此方式補證。

## 卡片順序與 PR 狀態

- Canonical 卡保持 `doing`，`next` 仍要求先完成上述 Rolling Eye 證據，再處理 Mask Statue；因此 Mask Statue 依原卡順序等待 Rolling Eye，不另開工作。
- PR #105 目前 open／draft，分支 `codex/survivor-boss4`，目前遠端 HEAD `cc7702eeb3dc4aaed2f1805a6c891c39f211a1f1`，版本 `20261031d`。本文前述舊比較中的 `aab3795` 是此文件早期記錄時的 HEAD，不是目前候選。
- 歷史比較：以 PR HEAD `b3d86327de17eec850942a9f63f58efe15c2f218` 比較當時的 HEAD `aab3795204c46ab5cf2b23386cebc6935c8b93c3`，GitHub 回報的 changed paths 為：
  - `coord/tasks/survivor-boss-gallery-4.json`
  - `games/survivor/index.html`
  - `games/survivor/practice-host.js`
  - `games/survivor/practice.html`
  - `games/survivor/preview.html`
  - `games/survivor/preview.js`
  - `games/survivor/style.css`
  - `games/survivor/version.json`
  - `sw.js`

本文件記錄證據與尚待項目；不代表 PR review、整卡完成或合併許可。Rolling Eye 缺少的 1024×461 E→N→W 與靜止 +90° 驗證仍未補；Mask Statue 最終美術仍待使用者視覺驗收。PR 維持 open／draft，正式站未變。
