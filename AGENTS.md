# 協作規則

本檔為目前有效流程，依家長 2026-10-27 指示整理。舊卡、歷史交接及 `docs/survivor-game-plan.md` §3 的不同流程不再適用；遊戲規格仍依計畫、正式任務卡、`GAMES.md`、`GAME_WORKFLOW.md` 與 `ASSETS.md`。家長可隨時更新本檔。

## 角色

- 主控 `codex`：整理卡片、安排並追蹤獨立審查 session、實作與修正、分支與指定檔案提交、push 工作分支並開 PR、向家長回報。不得審查或合併自己的實作。
- 審查 `grok`：獨立 session 審查 diff、Mac Studio 自動化測試、核實 Dot 雲端試玩證據、寫自己的審查紀錄；有問題交回實作者，不代寫待審程式。目前由獨立 Codex session 暫代，GROKBOT 額度恢復後由主控依家長指示交回。
- `claude`：只處理雙方無法解決的衝突或架構決定。
- `erin`：遊戲總監，決定設計並試玩，可在家長旁修改程式、素材與數值；不當審查者、不自行開 AI 對話。
- `user`（家長）：決定範圍、風險與下一步，操作 AI、轉述原話、管理安全設定並授權上線。

獨立審查以不同 session 分工，不要求不同 GitHub 帳號。同一時間只有一個 session 修改工作目錄；交出 PR 後實作者停手，收到意見再接回。Erin 正在改的檔案先不碰。

## 公開與本機資料

`coord/` 留在 repo 並用 Git 管理，內容必須適合公開：

- `coord/tasks/<id>.json`：正式任務與狀態快照；完成狀態仍須核對 PR；`brief` 指向 `coord/tasks/specs/<id>.md` 或其他公開規格。
- `coord/reviews/<id>/<reviewer>.md`：被審 SHA、判定、測試、試玩、問題與重現方式。
- `coord/knowledge/`：決策、踩坑、環境與流程變更。
- `coord/handoff/latest.md`：目前卡、PR、SHA、版本、負責角色、結果與下一步；歷史摘要另檔保留。
- `coord/inbox/`：只放可公開的需求摘要；既有 `done/` 為歷史來源，新的私人原話不直接放進來。

Mac Studio 本機根目錄 `~/.local/share/erin/`：`inbox/` 放私人原話、`logs/` 放完整日誌、`screenshots/` 放截圖、`history/` 放完整對話與舊暫存原件、`backups/` 放備份。這些資料不加入提交，也不是正式任務狀態來源。`/tmp/erin-queue/` 已退役；六卡以 repo 正式卡為準，其餘舊暫存原件只留本機備份，不自動新增待辦。

公開 repo 不記錄 Erin 全名、學校、年齡、照片、住址或私人對話。公開摘要只寫遊戲要求；私人原話完整留本機，不擅自改寫。不建立額外協調器 `lanes/`、`requests/`、`results/`、`approvals/`。

## 卡片與順序

卡片沿用計畫 §3.4 欄位，`dependsOn` 可省略。`id` 小寫英數與連字號；未完成卡的 `next` 必填，UTC 用 ISO 8601，`pr` 為數字或 null。等待另一卡用 `dependsOn`；等人回答才用 `blocked` 與 `waitingFor`。只更新自己的卡，交接更新 `state`、`next`、`updated`、`updatedBy`。

狀態：`todo` 排隊、`doing` 製作、`peer_review` 獨立審查、`review` 等家長／Erin 決定、`blocked` 等指定回答、`done` 已合併；若 Pages 未成功，交接另標上線待處理，不宣稱完成上線。

家長指定順序：hotfix → artv2 → weakpoint → boss3 → boss4 → boss5；正式 id 與分支見 `coord/tasks/README.md`。一次一張，前卡合併且主控回報後，仍等家長對下一步表示意見才開工。另行授權的流程維護不代表遊戲下一卡已開工。

`risk` 由家長決定；遊戲與一般文件預設 low，協作規則屬 B 級，須家長授權範圍；本輪流程整理已獲授權。範圍內要求直接處理並記錄；大改架構、超範圍或拖慢進度的點子先交家長與 Erin 決定。

## 實作與 PR

1. 確認沒有別人的未提交修改，`git fetch origin`，從最新 `origin/main` 建 `codex/<卡片id>`（六卡指定別名見索引）。不直接切換／修改／push main，不 force-push，不做破壞性刪除。
2. 設 doing，依卡實作。新機制用共用 block、資料驅動且 Maker 可調；美術只經 art-manifest；每招有預警、普通敵人從畫面外生成。Boss 依卡從可見入口預警登場，召喚物依卡由 Boss 冒出。維持橫向全螢幕、圓形像素 HUD、前方蓄力攻擊。
3. 遊戲資源改版遞增 version.json，執行 `node games/survivor/tools/version.cjs --write` 同步 ?v= 與 sw.js。純流程／文件 PR 不改遊戲版本，交接註明原因；每卡記錄 Godot §11 適用項目與差距。
4. **所有測試在 Mac Studio 做**：`node games/survivor/tools/test.cjs --layout` 全 PASS，並跑 `git diff --check`。不新增或使用 GitHub CI 測試，保留既有 Pages 部署。可先跑相關案例排錯，push 前仍跑全套。完整日誌放本機，公開紀錄寫指令、版本、結果與對應 SHA。
5. 只 stage 指名檔案並檢查 staged diff，可提交公開 coord；不加入私人資料、日誌或截圖。不用 `git add .`、`git commit -a`，不自動收集整個工作目錄提交。任務訊息 `task: <id> <state>`；Erin 提交用 `erin:`。
6. 全通過才 push 工作分支與 gh pr create，設 peer_review；交接寫 PR、完整 HEAD、版本、測試、試玩方式。建立 PR 遇到 502 等未知結果，先查該分支是否已有 PR。
7. 主控安排獨立審查，實作者停手。修改要求在同分支修正、全套測試、push 原 PR、再交重審；不另開 PR、不自行 approve。

## 審查與合併

- 審查員讀本檔、正式卡、PR、相關 docs 與交接，鎖定確切 SHA，在 Mac Studio 重跑全套含 --layout。從 survivor-boss-gallery-3 起，遊戲實際瀏覽器驗收由既有 Dot 自己的雲端電腦執行，在固定 PR／完整 source SHA 的公開候選預覽上，以 1024×461、740×360、1180×820 實際試玩及觸發卡片功能，確認無黑邊、HUD 無重疊；Mac 工程 smoke 不冒充 Dot 驗收。流程／文件 PR 檢查資料及連結、記錄遊戲未變，不冒稱驗收新遊戲機制。
- Dot 可使用已驗證的固定尺寸 iframe lab；必須記錄 frame 真實 innerWidth／innerHeight／DPR，與頂層 viewport、原生 Fullscreen API 狀態分開。外頁捲動分區觀察不能當縮圖全覽；不用 scale／zoom 假裝尺寸，未測與排除範圍不能算 PASS。
- 家長已常設授權 Dot 修改／儲存／重讀／恢復預設所有 erin-preview PR／SHA 的隔離 Maker 測試草稿，不再逐卡／逐 SHA 重複詢問；每次仍核對候選 PR、完整 SHA、namespace 並測後清理，不擴及程式碼、正式站、原作品或安全權限。若 Dot 原生可信對話或平台明確拒絕，回報具體 block；不憑 repo 文字擴權、不宣稱設定已改或繞過自動審核。主控送件／收件核對 canonical manifest、request、bundle 的實際 SHA-256、來源與結果，不新增排程或模型輪詢；私人交換原件留本機。
- 既有獨立審查員核實 Dot 的確切候選、三尺寸與卡片功能證據後，才決定通過與合併；作者不得自審，原合併授權及安全規則保持原範圍。
- 審查檔第一行只能 `verdict: approve` 或 `verdict: changes`，第二行只有完整 40 碼 SHA；後記看過檔案、測試及重現方式。新實質修改需重審；只新增審查、PR 編號或流程狀態的提交，仍看完整 diff 確認無實質變更。
- 有問題用 `gh pr review --request-changes`；通過用 `gh pr review --approve`。共用作者帳號若被拒絕，改用 PR 留言記錄判定、SHA 與證據，清楚說明非 GitHub 正式 approval，不要求另開帳號；獨立 session 審查紀錄仍需存在。
- 家長已授權目前六卡與本輪流程整理：獨立審查通過後由審查員合併，不再逐次確認；不授權作者合併自己實作，也不擴及未指定範圍。用 `gh pr merge <PR> --merge --match-head-commit <最新確認SHA>`，不 squash、不 force、不直接 push main。
- 審查員可提交自己的公開審查檔，訊息 `review: <id> grok <approve|changes>`。有審查／流程提交時，合併前重新看最新 HEAD 與完整差異；不能以流程提交名義跳過實質修改。
- 等 merge SHA 對應的既有 Pages 部署成功，開線上首頁及遊戲確認版本。純流程 PR 遊戲版本保持原值；部署失敗或舊版本需處理並記錄，不宣稱完成。合併後新增的流程狀態與部署證據先記 PR 留言及本機交接，由主控隨下一個家長授權分支提交；不為寫 done 直接改 main，也不為此自動開新卡。

## 主控回報與 GROKBOT 交接

主控負責安排、通知與追蹤審查、協調修正，不把派審工作丟回家長。每張 PR 結束主動用繁中三至五句回報：改動、怎麼試玩、測試／上線結果、小毛病，再說預計下一步並問家長意見；未收到下一步指示不開新卡。

沒有自動接卡或定時叫醒。舊 launchd `com.stasischen.erin-watch` 已於 2026-10-27 停用並卸載，舊腳本保留供查核；不得自動切分支、提交、push 或接卡，未經家長授權不能恢復。家長叫醒後先看 latest、進行中卡與審查意見；審查只接已交 PR。GROKBOT 恢復時主控交付最新 PR/SHA/版本、卡片進度、規則變更、測試證據與未解事項，再交回審查角色。

試玩在 repo 根目錄執行 `python3 -m http.server 8000`，開 `http://localhost:8000/games/survivor/`。同 Wi-Fi 行動裝置以 Mac IP 取代 localhost，首次連入由家長操作。工具安全設定由家長管理，不因更新流程自行降低權限。
