# Survivor 重構第一步：交接與驗證

依家長收件匣 `coord/inbox/done/20261025T133300Z-parent-refactor-1.md` 實作。這張卡只整理程式與樣式，沒有新增遊戲規則、卡片、數值或展示沙盒入口。

## 載入與相容介面

- `games/survivor/manifest.js` 是 11 個一般腳本的唯一順序清單：engine/state、loop、combat、spawn、boss，stages，render/world、hud，ui/levelup、settings，input。
- `index.html` 與 `preview.html` 都先載入 manifest，再由小型 `game.js` 入口同步寫入一般 script 標籤；Maker／preview-engine 仍在引擎完成後執行。沒有使用 module、fetch 載入器或新增套件。
- `window.Survivor.engine.*`、`.stages`、`.render.*`、`.ui.*`、`.input` 提供各區公開介面。getter 讀取同一份即時狀態，沒有複製設定或遊戲狀態。
- 第一輪保留既有頂層 lexical binding 與函式名稱供 VM 測試、Maker、preview-engine 使用；新命名空間是同一實作的介面。啟動時需要的設定、DOM 與圖片初始化暫留 state，沒有更改其內容。
- `tests/load-game.cjs` 從同一 manifest 逐檔執行，各檔分開解析，不靠串接腳本的跨檔 hoisting。原有 `SURVIVOR_SOURCE`／`sourcePath` 比較入口仍可指定舊版來源。

## 版號與離線快取

唯一版號來源為 `games/survivor/version.json`。更新後執行：

```sh
node games/survivor/tools/version.cjs --write
node games/survivor/tools/version.cjs
```

寫入指令同步兩個 HTML 的 `?v=`、preview.js 的 iframe URL、根目錄 sw.js 的 CACHE_NAME，並補入 manifest 腳本快取。未加 `--write` 時唯讀檢查：版本不一致、檔案不存在、清單重複或任一 manifest 腳本未預快取都會失敗。

## 樣式整理

HUD、升級選卡、設定與 Maker 各有集中區塊；`.upgrade-panel` 的一般規則合為一處。保留原有選擇器的 specificity，尺寸前綴使用 `:where()`，避免覆寫選取卡、稀有度與按鈕狀態。

尺寸門檻只在 `fitVisibleViewport()` 定義一次，再寫入 shell 的 `data-short`（compact／small／narrow）。保留原 CSS 的 520 高、660／600 寬門檻，均以橫向 layout viewport 尺寸判斷；visualViewport 繼續只決定容器的可見範圍與偏移，以免工具列改變原有斷點行為。方向 media 僅映射旋轉安全區；原本面板內容高度小於 400px 時隱藏說明的 container 規則保留。

## 實際驗證結果

```sh
node games/survivor/tools/test.cjs
node games/survivor/tools/test.cjs --layout
```

2026-10-25 本機沙盒結果：

- 15 支既有非瀏覽器測試全部通過；原有斷言保留，僅調整載入器、掃描拆分後來源與改用集中版號。
- `maker-baseline.json` 完全未改；一般模式與 Maker 模式各 153 組固定亂數快照原樣通過。
- 新增 `refactor.cjs` 通過：瀏覽器入口與 VM 順序一致、命名空間與舊名稱指向相同實作、即時設定、五種要求尺寸的旗標、visualViewport 相容、集中 CSS、逐一移除 12 個 manifest／腳本快取項目與過期 CACHE_NAME 的負例。
- 版號／所有快取路徑檢查通過；`git diff --check` 通過。
- **無頭版面測試未完成，不能視為通過。** 重構前與重構後，Chrome 都在啟動時以 `SIGABRT` 結束，尚未載入頁面。完整 `--layout` 指令因此回傳失敗，不會被測試工具隱藏。

保留既有真實 Chrome/CDP 測試，並增加瀏覽器實際載入命名空間的斷言。它鎖住 412×915 直拿旋轉、384×832、915×412、800×360、732×310，涵蓋 DPR3、觸控、三卡與展示比例、64px 確認、雙點／鍵盤、Maker 兩欄與點選。Grok 請在可啟動 Chrome 的環境執行 `--layout`；版面通過前不能宣稱視覺零變更。iPad Safari 實機仍需 Erin／家長試玩。

## 交接

卡片交 `peer_review`，請 Grok 審查 erin-watch 提交的完整 SHA；本文件為作者的執行紀錄，不是獨立審查。commit、push 與 PR 全交 erin-watch；未操作 .git、切換分支、merge 或推送 main。沒有新增需要 Erin 決定的遊戲設計。
