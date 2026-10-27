verdict: approve
842f021183223a7b7b961bd61d9c81b6a975fb82

這是 base + 精確 patch 的獨立審查與 Mac 驗證批准；不代表 base 已包含新碼，也不是 UI 或整 PR104 批准。

審查綁定 patch SHA-256 `380960603244a4c541b9ad9be79f30b81350cfc9ce05bc82cffc675dc4226508`（3,495 bytes）。僅改 `games/survivor/ui/levelup.js` 與 `games/survivor/tests/boss-hud.cjs`。刷新呼叫位於既有 `showOverlay` mode 更新後：一般 `over`／`won` 結算會更新 Boss HUD；`paused` 仍沿用既有 `updateHud()` 路徑。試煉結算沿用既有 `trialMenu()` 清理。`finishRun` 的 Maker 分支未改；本次未宣稱該分支已經 runtime 測試。

新增回歸測試使用 `maker-support.cjs` 載入實際 manifest 與結算流程，不在結算後手動刷新 HUD。私有隔離驗證先在 base 安裝新測試：測試依預期失敗，指出一般老師結算後仍顯示舊 HUD；對同一測試精確套用 patch 後通過，涵蓋老師／糖衣熊勝負、暫停／繼續、重新開始及試煉結束。Mac 工作目錄精確套用後，兩個 postimage SHA-256 均符合宣告：`games/survivor/ui/levelup.js` `f5c9ee5caf08cf61d9291b0fffbadd497b8818e73c9304864af99cdd7ac94d05`；`games/survivor/tests/boss-hud.cjs` `4e7c7228f9c87d4f305da6105d59af75ca211ff95dd5aeb414190d30d004b19c`。

版本機械同步為 `20261028b`，差異限 `games/survivor/version.json`、`games/survivor/index.html`、`games/survivor/preview.html`、`games/survivor/preview.js`、`games/survivor/practice.html`、`games/survivor/practice-host.js` 與 `sw.js`。Mac 執行 `node games/survivor/tools/test.cjs --layout`，exit 0；runner 收錄 73 個測試檔（含 `boss-hud.cjs`、`levelup-layout.cjs`），有 123 行 `PASS:`。測試前後同一組 161 個 source/test/cache 檔（含 `boss-hud.cjs`）SHA-256 全部一致；`git diff --check` 通過。

本紀錄不批准實際 UI 或 Dot 雲端候選：此輪未做真實 Chrome 三尺寸測量、雲端試玩，也未完成整 PR104 最終 gate；整 PR 最終審查仍由獨立 Mac grok session 負責。
