# 協作規則

本 repo 的遊戲協作依 `GAMES.md`、`GAME_WORKFLOW.md`、`ASSETS.md` 與 `docs/survivor-game-plan.md`。本檔整理 Survivor 計畫 §3；階段 0 完成後，代理人的協作流程以本檔為準，遊戲規格仍以遊戲計畫為準。家長可以更新本檔。

## 角色

- `codex`：讀卡與收件匣、實作、開分支與提交、更新自己的卡、啟動試玩伺服器。不得審查自己的程式、push 或 merge 到 `main`。
- `grok`：審查 Codex 分支並只寫自己的審查紀錄；不修改 Codex 的程式或卡片、不 merge。
- `claude`：只處理 Codex 與 Grok 無法解決或意見衝突的問題，以及架構決定。
- `erin`：遊戲總監，決定設計並試玩；可自己改程式、素材與設定值。她不自行開 AI 對話，也不當審查者。
- `user`（家長）：操作 AI、轉述 Erin 原話、決定風險、最後審查、管理安全設定並核准上線。

家長操作 AI；Erin 可以在旁口述。不要在公開 repo 記錄 Erin 的全名、學校、年齡、照片或住址。作者與審查者必須不同。同一檔案同一時間只由一人修改；Erin 正在改的檔案先不要碰。

## 檔案與任務卡

- 任務卡放 `coord/tasks/<id>.json`；審查放 `coord/reviews/<id>/<reviewer>.md`；原話收件匣放 `coord/inbox/`，處理完移到 `coord/inbox/done/`。
- 知識紀錄放 `coord/knowledge/DECISIONS.md`、`PITFALLS.md`、`SETUP.md`。
- 暫不建立協調器專用的 `lanes/`、`requests/`、`results/`、`approvals/`，不安裝排程或自動協調器。
- 卡片依計畫 §3.4 欄位，`dependsOn` 可省略。`id` 用小寫英數與連字號；未完成卡的 `next` 必填。UTC 時間用 ISO 8601。`pr` 是數字或 `null`。等待另一張卡用 `dependsOn`；等待某人回答才用 `blocked` 並填 `waitingFor`。
- 狀態：`todo` 排隊中、`doing` 製作中、`peer_review` 等 Grok、`review` 等 Erin 試玩與家長確認、`blocked` 等待指定對象、`done` 已 merge 並 push。
- 只更新自己負責的卡。交接時更新 `state`、`next`、`updated`、`updatedBy`。
- `risk` 由家長決定；只改遊戲、首頁卡片與文件預設 `low`。改本檔或協作規則屬 B 級，需家長決定。無論風險，merge 與 push 都必須有家長明確同意。

## 收件匣與審查

- 收件匣檔名為 `<UTC時間>-<短名>.md`，格式：`kind: request|feedback|approve`、`lane: none`、`ref: <卡片id>`、分隔線 `---`，接著放原話。Erin 的話照抄；家長核准才可用 `approve`，並在內文附 `sha: <完整40碼>`。
- 審查檔第一行只能是 `verdict: approve` 或 `verdict: changes`，第二行是被審完整 40 碼 SHA，後面記錄看過的檔案與檢查結果。Approve 只對該 SHA 有效；新實質程式提交需重審。
- Erin 在本階段範圍內的要求直接處理並記錄。超出範圍且會大改架構或拖慢進度的點子，先記錄再由 Erin 和家長決定是否開卡。資訊不足時標 `blocked` 並說明等待對象與所需答案。

## Git 與試玩

1. 從最新 `main` 建立 `codex/<卡片id>` 分支，將卡設為 `doing` 並填 `branch`。
2. 完成後提交指定檔案，卡設為 `peer_review`，請 Grok 審查 `git diff main...<branch>`。
3. Grok 審查通過後更新卡為 `review`，讓 Erin 試玩；有修改回饋則回到 `doing`。
4. 家長明確核准後才可記錄 `approve`，並由家長 merge、push。不得 force-push 或做破壞性刪除。

commit 只加入指名檔案，不使用 `git add .` 或 `git commit -a`。卡片提交訊息用 `task: <id> <state>`；審查用 `review: <id> grok <approve|changes>`；Erin 的提交用 `erin:` 開頭。

電腦試玩可在 repo 根目錄執行 `python3 -m http.server 8000`，網址為 `http://localhost:8000/games/survivor/`。同 Wi-Fi 的行動裝置使用 Mac IP 取代 `localhost`。首次允許連入由家長操作。每次改版更新遊戲資源的 `?v=` 版本號。

## 安全與隱私

AI 工具由家長操作；遊戲專用 Codex 工作階段限於工作資料夾並採 on-request 權限；Grok 本機工具每次執行前詢問。Agent 不 push；只有家長核准才能上線。家長可另用不登入 GitHub 的標準 macOS 帳號隔離遊戲工作。詳細設定依 `docs/survivor-game-plan.md` §4。

## 叫醒方式

沒有排程或輪詢。家長說「看卡片」後：Codex 先處理未完成的收件匣與自己的 `doing` 卡，再依賴關係接手可做的 `todo` 卡；Grok 找 `peer_review` 卡；Claude 找 `waitingFor: "claude"` 的 `blocked` 卡。完成回報要用家長能直接唸給 Erin 聽的簡單話。
