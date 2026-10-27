# 目前交接

現行規則：AGENTS.md；正式任務：coord/tasks/README.md；GROKBOT 恢復清單：coord/handoff/workflow-alignment-20261027.md。公開摘要進 Git；私人原文、完整日誌與 session 對照留 ~/.local/share/erin/。

## 待獨立審查：第 3 張共用弱點積木

- 家長已同意接著做弱點卡；分支 codex/survivor-weakpoint，基底 origin/main 262bdab90fefeacbf596a526594b7c861d3b8ce9，待重審版本 20261027i。
- 共用弱點 block、老師／守門人護甲與部位、Maker 編輯與保存、具名美術錨點已完成。投射物／炸彈／場／連鎖等都走同一傷害入口；一般部位預設 0.2，開啟弱點 3，不與舊架勢疊成 9 倍。
- 開啟前預告、開啟發光及關閉前快閃，條件可 AND／OR；環境／誘餌是可接事件，不新增機關。保留競技場尺寸、AI距離帶、前方蓄力與其他 Boss。
- 首輪版本 20261027h 完整 Mac Studio `node games/survivor/tools/test.cjs --layout` exit 0、113 PASS；測試前後 32 個程式／測試檔 SHA-256 一致，`git diff --check` 通過。六組 Canvas／153 戰鬥 trace／所有 frozen legacy 基準沒有重生。作者開 PR 即停手，交獨立 session 鎖定 SHA 重審，不能自審／自併。
- PR #103：https://github.com/stasischen/erin/pull/103 ，實作被測 SHA d5e6ce3c3f93e5be83b70f2e80df7e94c19fa36a。後續只提交本卡 PR 編號與公開交接，主控應查最新完整 HEAD；作者已停手，尚未審查／合併／上線，正式網站仍是 20261027g。
- 驗收與 Godot §11 差距：docs/survivor-weakpoint-validation.md。新聲音保留 ZzFX 參數，尚未匯出 WAV／OGG、未執行 Godot。

## 已完成：第 2 張美術清單 v2

- 家長已指示主控繼續，家長同時試玩既有版本。卡：survivor-art-manifest-v2；分支 codex/survivor-artv2；已上線版本 20261027g。
- 方向／鏡像、atlas 排版、逐幀／階段動畫、顯示大小、外框與 VFX 設定已完成；正式角色仍沿用原美術，新增圖只供驗證。詳細交接：docs/survivor-art-manifest-v2-validation.md。
- Mac Studio 全套 node games/survivor/tools/test.cjs --layout：exit 0、110 PASS；含十尺寸真實 PNG 像素／鏡像／白閃與既有操作。六組原 Canvas hash／153 戰鬥 trace 基準未更新且全部相同，git diff --check 通過。
- PR #102：https://github.com/stasischen/erin/pull/102 ，第二輪實作被審 b588726ed8ea362c3f78609f94d157c0f40c8623；審查紀錄提交後完整 diff／HEAD 核對 dc2a220a4e131372e860902f4080d21237b855f1；merge 262bdab90fefeacbf596a526594b7c861d3b8ce9。獨立 session 重跑完整測試與三尺寸操作後通過，以 merge commit 合併。
- Pages run 40489171784 completed/success：https://github.com/stasischen/erin/actions/runs/40489171784 。部署後實際刷新首頁並進遊戲，資源 query／version.json 均為 20261027g，守門人試煉可載入且 console 無 error。
- 同帳號正式 approve 已嘗試但被 GitHub 拒絕；獨立 session 如實留言：https://github.com/stasischen/erin/pull/102#issuecomment-6439585102 。上線驗證：https://github.com/stasischen/erin/pull/102#issuecomment-6439695753 。
- 本 PR 同時收錄流程維護合併後的 done 與部署快照，沒有更改協作規則。

## 最近已完成

- PR #100：hotfix；被審 beea986d3a7e7adb2c78bfb34abfa8839ac22ed2，merge 11613a82642a33d793b083ca29af1892d3bf5f1a。Mac 完整測試與三尺寸實玩通過，Pages run 40473926886 success，線上 20261027e。手感：貼近偏近戰，拉開較容易看到衝鋒。
- PR #101：流程整理；被審 e8f31ebb31da7d9ca3e4052702389081464e4858，審查檔提交後確認 8c87acd9c45c7d1530f8ebcbbcd8689b990623bc，merge 24fe7b41bc4b9a4e821608d13d5dcca2f3556d3f。獨立完整 108 PASS、502 備份 hash／六卡原件／服務狀態核對通過，Pages run 40479105869 success，遊戲版本保持 20261027e。
- 公開 coord 留 Git；舊 watcher 停用且卸載，不自動接卡；正式來源不再讀 /tmp/erin-queue/。各自審查紀錄在 coord/reviews/，同作者帳號以 PR 留言如實記錄獨立判定。

## 接下來

家長已同意第 3 張 survivor-weakpoint，現在製作中；本卡結束回報後再等家長決定 boss3，後續仍照 boss3、boss4、boss5 順序，一次一張。GROKBOT 恢復時由主控交付進度與證據，不請家長手動派審。

PR102 合併後的卡片 done 與交接快照隨本次已授權 weakpoint 分支提交；不追加到已合併分支、不直接推 main、不另開只有快照的 PR。舊 watcher 維持停用。

審查歷程：PR #102 首輪 changes 指出落點圖與警示錯位；主控在同分支修正共享原點／形狀，裁切保留安全缺口。第二輪由原獨立 session 重驗三尺寸落點、環形／彈幕缺口、白閃／外框及完整操作後通過；原 changes 紀錄保留於提交 355d4f75c08bfaed2501f4a3095252c26aaa5101 與 PR 留言。

## PR102 給家長的回報（歷史）

美術清單 v2 已上線 20261027g，支援方向動畫、鏡像與特效設定，並修好圖片與落點預警錯位。重新整理遊戲後可進 Boss 試煉，觀察守門人跳砸的圖與落點，以及環形招式的安全缺口。Mac Studio 完整 110 PASS，740×360、1024×461、1180×820 獨立實玩通過，目前沒有新的阻擋問題。這版主要整理繪圖能力，正式主角仍沿用既有美術；Godot 對照只有文件契約核對，尚未實機執行，下一張弱點卡等待家長意見。

## Dot 瀏覽器複審導入狀態

家長希望 Dot 接手瀏覽器實測；主控已安排只針對公開已上線 20261027g、1024×461 的單輪能力驗證，結果由主控追蹤確認。現行 Mac 完整測試、獨立三尺寸驗收及合併權維持，候選版預覽與 Dot 能力驗通後才調整分工；此為導入狀態，不是已啟用的新硬性門檻。公開紀錄不放私人交換資訊、request ID、session 對照或截圖。

## PR103 第一輪修正版已交重審

獨立 changes：撞牆與破架勢讀同一個 shared stun，造成 AND／單選破架勢誤開；原紀錄在 coord/reviews/survivor-weakpoint/grok.md 及審查提交保留。實作者已接回同分支，將破架勢改由真正 posture-broken 事件建立獨立有效期，撞牆來源保持獨立，入口／轉階段／移除積木／新場景清除來源；原碰撞暈眩不變。新增真引擎事件組合與到期回歸已通過，修正版 20261027i 已在 Mac Studio 凍結來源跑完整 `node games/survivor/tools/test.cjs --layout`：exit0、114 PASS，測前後34個程式／測試檔hash一致，`git diff --check`通過。只推原PR103，作者已停手；交原獨立session對最新完整SHA重審及安排UI，尚未通過重審、合併或上線。
