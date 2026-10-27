# 開發環境

現行分工、測試與授權以根目錄 AGENTS.md 為準；本檔是環境摘要，不覆寫家長的工具安全設定。

## Mac Studio

- Repo：`~/Dev/projects/erin`；正式卡在 repo 的 `coord/tasks/`，規格由 JSON 的 brief 連結。
- 主控使用 Codex，審查由另一個獨立 session 暫代 GROKBOT；恢復時讀 `coord/handoff/latest.md` 與流程變更紀錄。不要求另一個 GitHub 帳號；同作者帳號無法正式 review 時，以 PR 留言保留獨立審查證據。
- 所有測試都在這台 Mac Studio 跑：`node games/survivor/tools/test.cjs --layout`。Chrome 由既有測試使用本機安裝；不加 GitHub CI，不改既有 Pages 部署。
- 本機根目錄：`~/.local/share/erin/`。`inbox/` 私人原話、`logs/` 完整日誌、`screenshots/` 截圖、`history/` 完整對話與舊暫存原件、`backups/` 搬移前備份。公開 coord 保留 Git 管理。
- 舊 `/tmp/erin-queue/` 不再是正式來源；六張卡已匯入，其他舊暫存原件備份而不自動新增待辦。
- launchd `com.stasischen.erin-watch` 已停用且卸載；舊腳本與 plist 保留供查核，不可未經家長授權重新啟用。舊流程會自動接卡／切分支／提交，與現行流程不同。
- 主控負責通知審查、追蹤結果、修正後重審，以及每張 PR 結束主動回報並問下一步；不能依檔案變動自行開下一卡。

## 試玩與安全

在 repo 根目錄執行 `python3 -m http.server 8000`，開 `http://localhost:8000/games/survivor/`。同 Wi-Fi 裝置使用 Mac IP 取代 localhost；首次連入由家長允許。三個審查尺寸為 1024×461、740×360、1180×820。

AI 工具由家長操作，Erin 可在旁口述；公開資料不含全名、學校、年齡、照片或住址。工具權限由家長管理，本次沒有調整沙盒或工具授權。既有安全設定歷史見此檔的 Git 紀錄與計畫 §4；不能把舊確認當作現在環境的自動檢測結果。
