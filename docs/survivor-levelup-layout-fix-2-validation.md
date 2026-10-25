# 手機選卡與設計室兩欄修正驗證

依據 `coord/inbox/done/20261025T115156Z-parent-levelup-layout-fix-2.md`。

- 移除 `data-short` 與 440px 隱藏展示規則。選卡面板用具名容器查詢，依自己的內容高度排版；只有面板內容高度低於 200px（含內距、標題等約為可見高度 260px 以下）才隱藏展示。
- 卡片與展示為 3:2 兩欄，三卡靠上、不拉高。短面板卡片保留圖示、名稱、流派、稀有度和等級；長效果說明由右側展示提供，前置條件可開左下技能樹查看。展示保留 16:9，說明為一行，可水平捲動讀完。
- 確認鍵固定在面板右下，最短邊 64px，使用共用像素圖集的勾選圖與「選這張」文字。沒有可預覽卡片時停用，有預覽選取才啟用。保留預設第一張預覽、單點切換、同卡雙點直接選取與鍵盤 1／2／3。
- Maker 技能樹分頁：左側可捲動卡片樹，右側可捲動編輯面板，點卡片切換編輯且保留清單捲動位置。工具列、分頁與試玩／狀態頁尾保留固定空間。
- 遊戲與預覽入口資源版本 `20261025t`，Service Worker `erin-games-v24`。

已通過：`node --check`（game.js、maker/maker.js、tests/levelup-layout.cjs）、`skill-preview.cjs`、`preview-host.cjs`、`maker-ui.cjs`、`maker-traces.cjs`、`clean-hud.cjs`、`pixel-icons.cjs`、`git diff --check`。這些是實作檢查，獨立審查由 Grok 執行。

## 必須補做的真實排版與實機驗證

`node games/survivor/tests/levelup-layout.cjs` 以 Chrome CDP pipe 控制真實頁面，依序設定 412×915、384×832、915×412、800×360、732×310，DPR 3、行動裝置與觸控模擬。包含展示必須顯示、16:9 iframe 與三張卡完整位於視窗、卡文字不裁切、確認鈕最短邊 64px 且沒有遮擋，並用 `Input.dispatchTouchEvent` 測試點卡／確認／雙點、鍵盤事件，以及 Maker 左右面板與頁尾可見、點清單選卡。

**本次實際執行 Chrome 啟動即 SIGABRT，未取得任何尺寸的排版通過結果。** 不可把 Node 測試通過視為手機排版通過，也不可把隱藏展示當成手機尺寸的合格條件。請 Grok 在可執行 Chrome 的環境執行上述命令；`CHROME_BIN` 可指定 Chrome 路徑。輔助頁 `tests/levelup-layout.html` 也已去掉舊的「手機隱藏展示」通過條件，但該頁不提供 CDP 觸控及 DPR 模擬。

家長與 Erin 實機確認：直向鎖定後橫拿手機，三張卡、展示與「選這張」都看得到且可點，設計室卡片樹與編輯區同時顯示，試玩鍵不被擠走。尚無需要先決定的新遊戲設計。未進行 commit、push、開 PR 或 main 操作，交 erin-watch 代辦。
