verdict: approve
69499ed20a670dcb7cb9f70398ce7eaf6b2f225e

看了什麼：
- `git diff main...codex/survivor-stage-0-setup`（13 個檔案，全為新增，229 行）。
- `AGENTS.md`：角色、檔案位置、卡片狀態、收件匣與審查格式、Git 流程、安全與隱私都與計畫 §3 一致；對照 agent-coord-kit `templates/RULES.md`，沒有衝突，且 merge／push 到 `main` 一律要家長明確同意，比 kit 預設更嚴。
- `CLAUDE.md`：只有一行 `@AGENTS.md`，符合計畫。
- `coord/tasks/` 階段 0～6 共 7 張卡：欄位與 §3.4 完全相符（`dependsOn` 只在 1～6），`id` 格式、`title`／`next` 長度、`pr` 為 `null`、UTC 時間都正確；1～6 為 `todo` 並用 `dependsOn` 依序串起來；階段 0 為 `peer_review`、已填 `branch`、`waitingFor: null`、`risk: medium`（家長指定）。
- `coord/inbox/done/20261022T052950Z-erin-design-sheet.md`：檔名與 `kind: request`／`lane: none`／`ref`／`---` 格式符合 §3.6；沒有全名、學校、年齡、照片或住址。
- `coord/knowledge/DECISIONS.md`：設計單整理正確並註明來源；「小兵跟大魔王會合體」只記錄、留給 Erin 和家長決定，沒有替 Erin 猜。
- `coord/knowledge/PITFALLS.md`：§6 列出的 6 個踩坑 commit 都已抄入。
- `coord/knowledge/SETUP.md`：工具、家長安全設定、試玩方式完整。
- 這階段沒有遊戲程式，§6 的 iPad／遊戲邏輯項目不適用；改動沒有超出卡片範圍。

問題與建議（皆不擋 approve，由家長決定是否處理）：
1. `SETUP.md` 與計畫 §4 第 4 點仍寫「Agent 不 push」，但 `AGENTS.md` 已改成 agent／erin-watch 可 push 自己的 `codex/*` 分支並開 PR。建議家長之後統一說法。
2. 階段 0 卡的 `pr` 仍是 `null`，實際 PR 為 #1；屬流程欄位，Codex 下一輪可補。
3. Erin 的勝利條件是「把甲本血條打完就贏」，和計畫原本「撐幾分鐘」不同；階段 4（時間、難度和 Boss）開工前，請 Erin 和家長確認是否改成打倒甲本為主。
4. 範圍外：erin-watch 日誌在開 PR 時出現 `gh: command not found`（腳本第 51、54 行，launchd 的 PATH 可能沒有 gh），PR 最後仍有開成功，建議家長檢查。
5. 依計畫，階段 0 完成條件是家長確認協作規則（B 級）並由家長 merge。
