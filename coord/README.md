# 協作紀錄

這裡是可公開、用 Git 管理的協作資料；實際規則見 [AGENTS.md](../AGENTS.md)。遊戲執行不需要這些檔案。

| 位置 | 用途 |
|---|---|
| [tasks/README.md](tasks/README.md) | 正式任務索引、六卡順序與分支 |
| `tasks/<id>.json` | 唯一正式狀態，`brief` 指向公開規格 |
| `tasks/specs/` | 從舊暫存卡整理的公開規格 |
| `reviews/<id>/<reviewer>.md` | 獨立 session 的判定、被審 SHA 與證據 |
| [handoff/latest.md](handoff/latest.md) | 接手先讀的目前狀態與下一步 |
| [handoff/workflow-alignment-20261027.md](handoff/workflow-alignment-20261027.md) | 本輪流程調整與 GROKBOT 恢復清單 |
| `knowledge/` | 決策、環境與踩坑 |
| `inbox/` | 可公開需求摘要及既有歷史來源 |

私人原話、截圖、完整日誌、完整 session 對話與備份放 `~/.local/share/erin/`，不提交到這裡。不要整份貼入私人對話；公開紀錄保留任務、SHA、測試結論及可重現步驟即可。

`/tmp/erin-queue/` 已是舊副本，不是任務來源。舊 watcher 已停用；只有家長叫醒主控後，才依最新卡片、PR 與交接決定這一輪工作。舊卡可能保留歷史狀態；不能只因看到 todo／peer_review 就自行接卡或推斷未合併，需核對 PR。
