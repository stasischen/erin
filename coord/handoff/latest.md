# 目前交接

現行規則：AGENTS.md；正式任務：coord/tasks/README.md；GROKBOT 恢復清單：coord/handoff/workflow-alignment-20261027.md。公開摘要進 Git；私人原文、完整日誌與 session 對照留 ~/.local/share/erin/。

## 進行中：第 2 張美術清單 v2

- 家長已指示主控繼續，家長同時試玩既有版本。卡：survivor-art-manifest-v2；分支 codex/survivor-artv2；目標版本 20261027f。
- 方向／鏡像、atlas 排版、逐幀／階段動畫、顯示大小、外框與 VFX 設定已完成；正式角色仍沿用原美術，新增圖只供驗證。詳細交接：docs/survivor-art-manifest-v2-validation.md。
- Mac Studio 全套 node games/survivor/tools/test.cjs --layout：exit 0、109 PASS；含十尺寸真實 PNG 像素／鏡像／白閃與既有操作。六組原 Canvas hash／153 戰鬥 trace 基準未更新且全部相同，git diff --check 通過。
- PR 待建立；主控開 PR 後停手交既有獨立審查 session。審查須看確切 HEAD、自行重跑測試、三尺寸實玩原遊戲及暫換 sample 資產確認新欄位；通過才依授權合併與檢查 Pages。
- 本 PR 同時收錄流程維護合併後的 done 與部署快照，沒有更改協作規則。

## 最近已完成

- PR #100：hotfix；被審 beea986d3a7e7adb2c78bfb34abfa8839ac22ed2，merge 11613a82642a33d793b083ca29af1892d3bf5f1a。Mac 完整測試與三尺寸實玩通過，Pages run 40473926886 success，線上 20261027e。手感：貼近偏近戰，拉開較容易看到衝鋒。
- PR #101：流程整理；被審 e8f31ebb31da7d9ca3e4052702389081464e4858，審查檔提交後確認 8c87acd9c45c7d1530f8ebcbbcd8689b990623bc，merge 24fe7b41bc4b9a4e821608d13d5dcca2f3556d3f。獨立完整 108 PASS、502 備份 hash／六卡原件／服務狀態核對通過，Pages run 40479105869 success，遊戲版本保持 20261027e。
- 公開 coord 留 Git；舊 watcher 停用且卸載，不自動接卡；正式來源不再讀 /tmp/erin-queue/。各自審查紀錄在 coord/reviews/，同作者帳號以 PR 留言如實記錄獨立判定。

## 接下來

主控追蹤 artv2 審查，有修改回同分支與同 PR；合併部署後主動向家長回報改動、試玩、測試、版本與小毛病，再問下一步。第 3 張 survivor-weakpoint 尚未開工；需等家長決定才開始。GROKBOT 恢復時由主控交付進度與證據，不請家長手動派審。
