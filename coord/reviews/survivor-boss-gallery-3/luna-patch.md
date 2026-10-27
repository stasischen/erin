verdict: approve
9ae7e85ef8aadd33dab6458746e596c3cafa2ead

這是 base + 精確 patch 的獨立審查，不代表 base 已包含新碼，也不是整 PR104 或 UI 批准。

審查綁定 patch SHA-256 `55fa253feb96798966e3daf1eb0bef8c0b737b13f1daf76ff410112058c8d777`（12,960 bytes）。變更僅限五個允許路徑：`games/survivor/render/hud.js`、`games/survivor/render/gallery.js`、`games/survivor/style.css`、`games/survivor/index.html`、新增 `games/survivor/tests/boss-hud.cjs`。獨立檢查了單體與冰火雙子角色／血量映射、一般模式護甲比例、舊 DOM 參照與缺少新節點的 VM stub 相容性、暫停及離場清理、頂部布局的三種指定寬度理論幾何；確認 patch 沒有輸入或戰鬥邏輯變更。新測試直接執行 HUD 呈現邏輯並覆蓋雙子各自血量、存活名單更新、列重用、單體顯示與模式清理。

在隔離快照中 `git apply --check` 與精確套用成功，五個實際 postimage SHA-256 均符合 patch 宣告；新增測試通過。Mac 工作目錄隨後套用同一精確 patch，五個 postimage 再次吻合。版本同步至 `20261028a`，機械差異限於 `games/survivor/version.json`、`games/survivor/index.html`、`games/survivor/preview.html`、`games/survivor/preview.js`、`games/survivor/practice.html`、`games/survivor/practice-host.js` 與 `sw.js`。

Mac 執行 `node games/survivor/tools/test.cjs --layout`，exit 0；runner 收錄 73 個測試檔（含新 `boss-hud.cjs` 與 `levelup-layout.cjs`），共有 122 行 `PASS:`。`git diff --check` 通過。測試前後的 source/test/cache SHA-256 對照涵蓋相同 161 個檔案（含新測試），全部一致。

尚未進行三尺寸實際 DOM 幾何測量、Dot 固定候選雲端瀏覽器試玩或整 PR104 最終 gate；未據此宣稱 UI 驗收。獨立 Mac grok session 保留整 PR 審查與最後批准。
