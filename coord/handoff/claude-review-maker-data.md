# Claude 審查交接（2026-11-05）

請獨立 review 本輪 Maker／預設資料拆分與設定入口改動，找出實際回歸或資料相容性問題；不要直接改遊戲、擴充功能、合併或發布。先讀此工作目錄的 AGENTS.md，再讀本交接。既有 approve 是證據索引，不取代你的判斷。

## 工作位置與固定範圍

- 工作目錄：`/Users/maxstudio/Dev/projects/erin-upgrade-balance`
- 分支：`codex/survivor-upgrade-balance`
- [PR 113](https://github.com/stasischen/erin/pull/113)：OPEN／草稿，正式站未合併。
- 本輪比較起點：`43979f8857f90a7bd1980b4d7e9a5045a7f09d20`
- 本輪遊戲來源及測試頁來源：`5768808d3aa6c4454132f352be1ac1811b60ebc2`
- 交接時分支 HEAD：`24714cf6765890319b2052107861d0fdeb77192f`
- 遊戲來源之後的提交只有任務卡、審查及交接文件；此交接檔隨後以純文件提交發布，遊戲來源不變。
- 遊戲版本：`20261104f`。

請先核對 HEAD 與工作目錄，勿切換或清理其他工作目錄。主要 review 範圍是上述起點到遊戲來源，54 個檔案；大量行數是搬檔及將舊資料覆寫結果展開。PR 113 累積了更早的玩法改動，不能把本輪審查當成整張 PR 的完整批准。若要延伸檢查早期玩法，請分開報告範圍與證據。

```sh
cd /Users/maxstudio/Dev/projects/erin-upgrade-balance
git status --short
git rev-parse HEAD
git diff --stat 43979f8857f90a7bd1980b4d7e9a5045a7f09d20..5768808d3aa6c4454132f352be1ac1811b60ebc2
git diff 43979f8857f90a7bd1980b4d7e9a5045a7f09d20..5768808d3aa6c4454132f352be1ac1811b60ebc2
git diff --name-only 5768808d3aa6c4454132f352be1ac1811b60ebc2..HEAD
```

## 使用者要求與完成內容

使用者要求先拆剩下的 Maker 編輯器，再拆預設資料，玩法與存檔維持不變；Maker 藏在設定裡，不在開始畫面出現。

1. `maker/maker.js` 從 618 行縮至 119 行。共用元件、武器卡片、敵人與 Boss、關卡、規則分到五個 factory 模組；原外殼保有唯一 draft／dirty／分頁／選取狀態，透過 ctx getter/setter 共用，沒有另複製草稿。
2. `#makerLink` 實際移入 `#settingsPanel`。入口為「設定 → 自己設計」。一般遊戲退出 Maker 回原準備或暫停狀態的設定；不自動續玩。原 `?editor=1` 直接入口仍保留，使用者沒有要求禁止深連結。Maker 試玩關閉設計室仍沿原導航回首頁。
3. `data/defaults.js` 從 2,624 行縮至 259 行，完整預設分成 14 檔：核心、武器、支援卡、水風雷卡、敵人、老師 Boss、試煉設定與四位 Boss、關卡。舊檔尾端覆寫已展開成最終資料值，49 張卡保留原索引與順序。
4. `maker/manifest.js` 與 `data/manifest.js` 各自提供唯一載入順序；沿既有 parser-time loader 方式。index／preview／practice、VM 測試、版本與離線快取同步使用清單。

本輪不改 schema、存檔鍵、歷史測試基準、玩法或數值；未新增框架。前輪已拆 world／combat／loop，本輪維持原接口與每幀順序。

## 優先審查點

- Maker 模組是否還有漏改的裸引用，尤其展開運算子與深層編輯分支；ctx 是否讀到即時草稿，重設後是否仍有舊物件引用。
- 儲存、重載、恢復預設、兩種試玩與編輯預覽是否維持；六個分頁以及卡片、弱點、波次控制項能否操作。
- 開始畫面沒有 Maker 按鈕；準備／暫停 → 設定 → Maker → 關閉 → 設定 → 完成／續玩，時間與遊戲狀態是否正確。
- 全部預設載入後是否與舊完整物件相等，包括 null、陣列順序與卡片索引；不只抽查幾個數值。舊作品仍走同一驗證與儲存接口。
- 三個 HTML 入口在 schema 前是否已載入全部資料；VM 是否仍有只讀 defaults.js 的漏網處；版本、快取、預覽與練習 iframe 是否漏檔。
- 修改測試是否只是追隨模組入口與設定導航，沒有刪斷言或改歷史基準來掩蓋問題。

維護入口：`docs/survivor-module-map.md`。正式規格：`coord/tasks/specs/survivor-upgrade-balance.md` 最後兩節。既有獨立審查：`coord/reviews/survivor-upgrade-balance/maker-data-review.md`。

## 已有證據及重現方式

主控完整 Mac 執行 `node games/survivor/tools/test.cjs --layout`，exit 0、134 行 PASS，並通過 `git diff --check`。第一位非作者另跑實際 Chrome 操作與資料比較，核閱完整套件日誌；他沒有自行重跑完整套件，不能寫成雙方都跑過。

本機證據目錄（不要把私人原圖與完整日誌加入 Git；僅從 GitHub 閱讀時無法存取這些檔案，請以公開審查紀錄與自行驗證結果為準，不宣稱看過本機日誌）：

- 日誌：`/Users/maxstudio/.local/share/erin/logs/`
- 腳本及比較原件：`/Users/maxstudio/.local/share/erin/history/survivor-upgrade-balance/`
- 截圖：`/Users/maxstudio/.local/share/erin/art-review/`
- `maker-data-full.log`：完整套件。
- `defaults-identity-final.log`／`defaults-identity.cjs`：完整資料深度比較、49 卡順序、舊作品驗證結果相同與獨立副本；baseline 原件已核對 Git 起點原文。
- `maker-data-final.log`、`maker-data-independent.log`：740×360 真 Chrome，六分頁、卡片最高級／Boss 弱點／武器聚氣修改保存、重載、兩種試玩、暫停返回與時間不前進。
- `maker-data-boundary.log`：獨立真 Chrome，三尺寸 resize、試煉及真正 preview／practice iframe 時間前進。
- `maker-data-natural-verified.log`：1024×461、740×360、1180×820 各自然遊玩約 33 秒，選卡、第二波、大招及暫停續玩，未注入血量或經驗。
- `maker-data-isolation.log`／`.json`：125 檔、832 執行期請求與七個存檔鍵的候選隔離檢查。
- `maker-data-public-settings.log`、`maker-data-public-natural.log`：部署後公開網址的 Maker 操作與 740×360 自然遊玩。

需要自行跑遊戲時，在上述工作目錄執行 `python3 -m http.server 8000`，開 `http://localhost:8000/games/survivor/`。先使用獨立瀏覽器 profile 完成真實流程，再跑必要測試；不要清除使用者原瀏覽器的存檔。私有瀏覽器腳本用 `--card` 決定新的證據目錄，重跑請用新名稱，勿覆寫既有截圖。

```sh
node games/survivor/tools/test.cjs --layout
git diff --check
```

先前一次自然試玩在截圖期間剛好升級，遮罩擋住大招按鈕。私有腳本改為先完成自然選卡再按技能後通過，產品未因此更改。資料驗證補充腳本也改用既有完整 fixture，並比較舊新驗證的完整結果，避免誤把原本積木重新編譯的行為判成回歸。這兩項不應被當作產品修復。

## 公開測試頁與限制

[開啟固定來源測試頁](https://stasischen.github.io/erin-preview/pr-113/5768808d3aa6c4454132f352be1ac1811b60ebc2/games/survivor/)

Pages 部署 41792656294 成功；122 個候選檔的公開 HTTP 內容與本機候選逐位元相同，既有 1,736 檔保持。預覽提交為 `7a64af8b83259e3045e309318410a14dd7c845f0`。測試頁使用隔離存檔；不要把它的隔離鍵改成正式鍵。

已驗證的是 Mac Chrome 與手機尺寸模擬，不是手機硬體或 Dot 雲端。未聲稱自然完整兩關、所有配裝平衡或長時間效能已驗。schema 尚未拆，本輪不要求延伸拆分。

## 請回報

列出實際看過的範圍、實際執行的測試，以及每個問題的檔案／行號、重現步驟、影響。將會讓正常流程中斷或損壞存檔的問題與可後續處理的小問題分開；沒有發現時直接寫沒有發現，並保留未驗證範圍。遵守既有最多兩輪審查規則，不自行新增流程門檻。

如輸出正式審查檔，第一行 `verdict: approve` 或 `verdict: changes`，第二行為實際鎖定的完整來源 SHA。請明確註記這是本輪增量 review，不是整張 PR 的合併授權。把結果交回主控，不直接修碼或合併。
