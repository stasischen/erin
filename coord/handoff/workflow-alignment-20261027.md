# 2026-10-27 協作流程調整與 GROKBOT 交接

本輪依家長明確授權整理協作規則；維護分支 `codex/coord-workflow-alignment`，基底為 PR #100 的 merge SHA `11613a82642a33d793b083ca29af1892d3bf5f1a`。不開始遊戲下一卡，不改遊戲資源版本或安全權限。

## 已確認的決定

1. 主控安排、通知與追蹤獨立審查，修正也由主控協調；獨立是不同 session，不需另一個 GitHub 帳號。GROKBOT 額度恢復後由家長指示切回，主控整理交接。
2. 所有測試都在 Mac Studio 做，完整套件包含 --layout。撤回新增 GitHub CI／required check 的建議，不建立測試 workflow；既有 Pages 部署保留。
3. 公開任務、決策、審查與交接摘要留 repo 的 coord/，繼續 Git 管理。撤回「全部 coord 退出 Git」及「交接不 commit」的舊建議；私人原話、截圖、完整日誌與完整對話只留 repo 外。
4. 一次一張，開 PR 後實作者停手；審查 changes 回原分支修正並重審同 PR。通過後由獨立審查員按授權 merge commit 合併、確認 Pages 與線上版本。
5. PR 結束主控主動告知改動、測試、試玩、部署及小毛病，再提出預計下一步、問家長意見。未收到下一步指示不自動接卡。

## 執行紀錄

- 搬動前先完整備份 coord、舊暫存佇列、AGENTS／GAME_WORKFLOW／SETUP、watcher 腳本與 plist、Git 本機 exclude；備份位於本機 `~/.local/share/erin/backups/20261027T085511Z/`，502 個協作／佇列原檔的 SHA-256 清單同存備份內。
- 保存原完整交接於本機 `history/handoff-before-workflow-alignment.md`，公開 latest 改成現況摘要；保留 PR #100 的被審／merge SHA、測試、部署及限制，不把完整對話公開。
- 原暫存佇列完整保存在本機 `history/legacy-queue/`；六卡正式規格匯入 `coord/tasks/specs/`，狀態在對應 JSON。舊卡的私人轉述前言不匯入公開規格；技術要求保留，過時的「不加 --layout」改為現行完整測試。其他舊暫存原件沒有自動重開成待辦。舊 /tmp 只留副本與轉址說明，避免破壞性刪除。
- hotfix 卡更新為 done、PR 100；匯入獨立審查員已發表的 PR 留言作為公開審查檔，主控沒有自行重新給自己的程式 approval。其餘五卡維持 todo、依順序相依，不代表已授權自動開始。
- 新私人原話放本機 inbox，截圖放 screenshots，完整日誌放 logs；本次兩份 hotfix 測試日誌與舊 watcher 執行紀錄已複製到固定位置。原本未追蹤的 hotfix 原話已校驗後移到本機 inbox/done；既有公開歷史不批次刪除或重寫。
- 移除本機 .git/info/exclude 的整個 /coord/ 忽略，新增 repo .gitignore 僅排除私人／日誌／截圖目錄與 .log，不忽略遊戲 PNG 或公開 coord。
- launchd `com.stasischen.erin-watch` 已執行 disable 與 bootout；服務停用且不載入。舊腳本仍保留但不能執行自動接卡。沒有新增任何排程、GitHub CI 或替代自動寫入服務。
- 更新 AGENTS、GAME_WORKFLOW、GAMES 範例與 SETUP；計畫 §3 標為歷史設計，以 AGENTS 為唯一現行流程，避免舊權限與分工覆寫新安排。

本機備份與服務狀態詳情見 `~/.local/share/erin/migration.json`；session 對照在同目錄 session-state.json，不需發布完整對話。

## GROKBOT 恢復時依序讀取

1. 最新 origin/main 的 AGENTS.md、coord/README.md、coord/handoff/latest.md 與本檔；不要從舊對話複製指示。
2. 正式卡 JSON／brief、正在審的 PR 與確切 HEAD，核對主控與審查 session 是否已停手，取得單一寫入權後才操作。
3. 既有審查與測試證據；自己的審查需在 Mac Studio 重跑含 --layout，遊戲改動補三尺寸實玩。共用帳號正式 review 被拒絕時，以 PR 留言明確記錄 session 判定及 SHA。
4. 保留 reviewer 身分，只處理主控交出的 PR；不代改待審程式、不從 todo 自行開工。通過按授權合併，等待 Pages，向主控提供結果。
5. 不恢復舊 watcher、不恢復 /tmp 佇列、不使用 GitHub CI，也不把私人內容搬回 repo。若要改服務或擴大工作範圍，另由家長授權。

## 驗證與回復

實作者已在 Mac Studio 跑 `node games/survivor/tools/test.cjs --layout`：exit 0、108 PASS（含指定三尺寸）；`git diff --check` 通過。另核對 502 個備份 hash、舊原文副本、七卡格式／依賴／規格路徑、Markdown 連結、忽略規則、watcher disabled/unloaded 與遊戲資源無差異；全部通過。完整日誌留本機 logs/coord-workflow-alignment-tests.log，不提交。遊戲內容未變，因此版本保持 20261027e，Godot §11 不適用。

若路徑或匯入有誤，從本機備份逐檔比對與復原；公共規則若需撤回，以新工作分支和 PR 處理，不 reset 或 force 改 Git 歷史。舊 watcher 腳本自動提交／切分支行為不符合新流程，不能僅為恢復資料而重新啟用；服務恢復須家長另行授權。

## 2026-10-27T09:15:58Z 維護 PR 已完成

PR #101 獨立審查通過，被審實作 e8f31ebb31da7d9ca3e4052702389081464e4858，審查檔提交後確認 HEAD 8c87acd9c45c7d1530f8ebcbbcd8689b990623bc，merge SHA 24fe7b41bc4b9a4e821608d13d5dcca2f3556d3f。審查員獨立完整測試 108 PASS、來源／備份／隱私／服務驗證通過；Pages run 40479105869 success，實際線上版本仍為 20261027e。沒有新增遊戲缺陷；主控已接回交接，artv2 尚未開工。合併後此流程快照隨下一授權分支入 Git，不直接 push main。
