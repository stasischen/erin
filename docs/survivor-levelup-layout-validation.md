# 橫向升級選卡修正驗證

- 三張卡片並排；展示放在右側。依 visualViewport 實際遊戲高度判斷，低於 440px 隱藏展示與技能樹，保留卡片和確認鍵。
- 52px 圓形 ✓ 確認鈕獨立在內容區下方，有目前卡名的無障礙標籤。單點預覽、同一卡 350ms 內雙點直接選、鍵盤 1／2／3 維持直接選。
- 選卡、暫停設定、Maker 編輯區的祖先允許觸控平移；遊戲 canvas 仍禁止平移。設定面板保留內部捲動，Maker 保留工具列／頁籤／試玩列，只有編輯內容捲動。
- 遊戲入口資源版本更新為 `20261025s`，Service Worker 快取更新為 `erin-games-v23`。

已執行通過：

- `node --check games/survivor/game.js`
- `node --check games/survivor/tests/levelup-layout.cjs`
- `node games/survivor/tests/skill-preview.cjs`：66 展示場景、單點確認、雙點間隔與避免重複套用。
- `node games/survivor/tests/preview-host.cjs`
- `node games/survivor/tests/clean-hud.cjs`
- `node games/survivor/tests/maker-ui.cjs`
- `node games/survivor/tests/maker-traces.cjs`
- `node games/survivor/tests/pixel-icons.cjs`
- `git diff --check`

## Grok 與實機待驗證

`node games/survivor/tests/levelup-layout.cjs` 使用本機 Chrome 無頭模式及真實 DOM，不依賴 npm。可用 `CHROME_BIN` 指定 Chromium 路徑。

此沙盒中 Chrome 啟動即 `SIGABRT`，沒有產生 DOM 測試結果；**不能視為版面通過**。請 Grok 在可啟動 Chrome 的環境執行。也可經試玩伺服器開啟 `games/survivor/tests/levelup-layout.html` 看完整結果。

測試涵蓋 7 組視窗／可見範圍，包括 640×300、工具列偏移、安全區、直拿旋轉及 iPad；檢查三張卡與文字、圓鈕、展示邊界及可點擊性、選卡功能、設定完成鍵捲動可達、Maker 五頁的固定列與末端可達，以及選卡期間視覺視窗縮小。

家長／Erin 請在手機與 iPad 橫向確認：升級三選一卡和 ✓ 都看得到、單點後按 ✓ 能繼續、雙點能繼續；小畫面沒有展示仍可選卡；設定與 Maker 能用手指捲到最後；更新 PWA 後載入新版。沒有新增需要決定的遊戲設計。

此文件是實作驗證與待驗項目，獨立審查由 Grok 完成。commit、push 與 PR 由 erin-watch 代辦；未操作 main。
