# 目前交接

## 當前摘要（優先於下方歷史，2026-10-28）

- 目前是 PR104／survivor-boss-gallery-3，`20261027k` 修正既有方向鍵 keyup 鍵名配對，Mac 全套與實際輸入 smoke 已完成，準備交新 SHA 重審；不是刺客新增回歸，不能據此推論 Dot 陣亡原因。
- 原 j 固定候選的 Dot 正式結果仍為 changes／incomplete_evidence，half／posture／win 等必要證據未完成；舊 j 的 pause-first 技術 probe 不是 k 版驗收。家長已給 erin-preview 隔離 Maker 草稿常設授權；主控核對 Dot 的原生確認，不能以 repo 文字擴權，本輪實作者不代送件。
- 正式站仍為 `20261027i`；PR104 尚未合併／上線。先獨立程式複審及 Mac 全套，再由主控發布新固定 SHA 並交 Dot 正式測；boss4／boss5 未開工。
- 下方按時間保留先前卡片與 j 候選證據；其中「boss3 未開工」等句子只代表當時狀態，不覆蓋本摘要與最末修正交接。

## 歷史紀錄與先前進度

現行規則：AGENTS.md；正式任務：coord/tasks/README.md；GROKBOT 恢復清單：coord/handoff/workflow-alignment-20261027.md。公開摘要進 Git；私人原文、完整日誌與 session 對照留 ~/.local/share/erin/。

## 已完成：第 3 張共用弱點積木

- 分支 codex/survivor-weakpoint，基底 origin/main 262bdab90fefeacbf596a526594b7c861d3b8ce9，正式站已上線 20261027i。獨立程式複驗與三尺寸人工 UI 完成，PR103 已合併。
- 共用弱點 block、老師／守門人護甲與部位、Maker 編輯與保存、具名美術錨點已完成。投射物／炸彈／場／連鎖等都走同一傷害入口；一般部位預設 0.2，開啟弱點 3，不與舊架勢疊成 9 倍。
- 開啟前預告、開啟發光及關閉前快閃，條件可 AND／OR；環境／誘餌是可接事件，不新增機關。保留競技場尺寸、AI距離帶、前方蓄力與其他 Boss。
- 首輪版本 20261027h 完整 Mac Studio `node games/survivor/tools/test.cjs --layout` exit 0、113 PASS；測試前後 32 個程式／測試檔 SHA-256 一致，`git diff --check` 通過。六組 Canvas／153 戰鬥 trace／所有 frozen legacy 基準沒有重生。作者開 PR 即停手，交獨立 session 鎖定 SHA 重審，不能自審／自併。
- PR #103：https://github.com/stasischen/erin/pull/103 ，修正版被測及獨立 Mac 複驗 SHA 206f285bf9aac1800613b88dd27daffcac2a8d6b；完整含 --layout 自行重跑 114 PASS，原撞牆重現通過。三尺寸原始來源 UI／Maker／老師及守門人／其他 Boss 回歸完成，沒有新阻擋問題。
- 最終 review-only HEAD e6730b4711814b93705e81a631ede0813e220b21，merge 2652f7603294068631b068223bc770c23d33a61a；Pages run 40510298449 completed/success，審查員實際開正式站並重開守門人確認 20261027i，SW／弱點／架勢檔與被測來源逐 byte 相同。共用作者帳號拒絕正式 approve，已如實留下獨立 session 判定及部署驗證於 PR 留言。
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

第 3 張 survivor-weakpoint 已合併上線，主控回報後等家長決定是否開始 boss3；目前未開工。後續仍照 boss3、boss4、boss5 順序，一次一張。GROKBOT 恢復時由主控交付進度與證據，不請家長手動派審。

PR102 合併後的卡片 done 與交接快照隨本次已授權 weakpoint 分支提交；不追加到已合併分支、不直接推 main、不另開只有快照的 PR。舊 watcher 維持停用。

審查歷程：PR #102 首輪 changes 指出落點圖與警示錯位；主控在同分支修正共享原點／形狀，裁切保留安全缺口。第二輪由原獨立 session 重驗三尺寸落點、環形／彈幕缺口、白閃／外框及完整操作後通過；原 changes 紀錄保留於提交 355d4f75c08bfaed2501f4a3095252c26aaa5101 與 PR 留言。

## PR102 給家長的回報（歷史）

美術清單 v2 已上線 20261027g，支援方向動畫、鏡像與特效設定，並修好圖片與落點預警錯位。重新整理遊戲後可進 Boss 試煉，觀察守門人跳砸的圖與落點，以及環形招式的安全缺口。Mac Studio 完整 110 PASS，740×360、1024×461、1180×820 獨立實玩通過，目前沒有新的阻擋問題。這版主要整理繪圖能力，正式主角仍沿用既有美術；Godot 對照只有文件契約核對，尚未實機執行，下一張弱點卡等待家長意見。

## Dot 瀏覽器複審導入狀態

家長已同意正式串接，並明確要求 Dot 使用自己的雲端電腦／雲端 browser，不使用連接的 Windows／Mac executor。舊 Windows Chrome 批准逾時只代表接錯執行端後沒有 UI 證據；不再要求家長於 Windows 批准 Chrome。完整自動化測試仍在 Mac Studio，不使用 GitHub CI 測試。

「下一張卡」先依下一張尚未開工的 boss3 記錄為正式試行起點；PR103 已依原流程完成驗收，公開候選快照另供雲端接線／三尺寸能力 smoke。這個 smoke 不等於完整弱點功能驗收，不授權合併；未測／工具不可用不能當作通過。不新增定時模型輪詢或自動叫醒。

## PR103 第一輪修正版已交重審

獨立 changes：撞牆與破架勢讀同一個 shared stun，造成 AND／單選破架勢誤開；原文保留於 coord/reviews/survivor-weakpoint/grok-first-changes.md 及 Git 歷史，最終 approve 在 grok.md。實作者已在同分支改由真正 posture-broken 事件建立獨立有效期，撞牆來源保持獨立；原碰撞暈眩不變。修正版完整含 --layout exit0、114 PASS，測前後34檔 hash 一致；原獨立 session 另行重跑同一完整 SHA 也114 PASS，原重現與雙來源時序矩陣通過。三尺寸 UI 最終通過、已合併部署，與另行 Dot smoke 的不完整結果分開記錄。

## 公開測試站已建置

- 站點：https://stasischen.github.io/erin-preview/ ，獨立公開 repo https://github.com/stasischen/erin-preview 。Pages source 為 codex/previews；發布 commit f2f085be2dc9567c66ae7e0923bc894b790ffa9f，Pages run 40503705865 completed/success。沒有新增 GitHub CI workflow，測試／打包在 Mac Studio。
- 固定候選：https://stasischen.github.io/erin-preview/pr-103/206f285bf9aac1800613b88dd27daffcac2a8d6b/games/survivor/ ，版本 20261027i。首頁明示測試版、PR、完整來源 SHA 與正式站外連，不在遊戲內加標籤改 viewport／HUD。
- 只在發布副本隔離五個儲存 key（包含舊資料遷移），停用該副本的 SW 註冊／PWA 安裝；不取消正式 SW、不刪正式 cache。其餘戰鬥／render 邏輯逐 byte 相同；來源／部署 hash 與完整差異在候選 preview-manifest.json、adapter-diff.patch，manifest SHA256 eba8a2e92c51586439c8a3b86c025faa5e97b54a8e929ed31131b5fa8f2ca14d。
- 71 檔共891027 bytes；Mac 本機驗開始／移動、Maker 保存／設定／紀錄、A-B 與 legacy 隔離，五個正式 key 與既有 SW/cache sentinel 未變，無404／console／JS error。公開後另核對 manifest 與69個 payload HTTP200／bytes/hash，並實際開頁確認可載入；這些是 Mac 工程 smoke，不冒稱 Dot 雲端實測。
- 可重現生成器、驗證器及說明用 Git 保存在測試站 repo 的非發布分支 codex/preview-tools，commit 18d74731a6d7e1e1f487db2b1bb57f85161af02c。Pages payload 不包含工具／測試、coord、完整日誌或截圖。已發布候選不可覆寫；新來源 SHA 或 adapter 版本使用新網址。
- 主控已用受審查的來源端直連工具自行送出 cloud-only smoke，並自行核對採納實際回覆，不再請其他專案中轉。原始結果為 changes／incomplete_evidence：Dot 回報自己的雲端 Linux／Chrome CDP，實際開始／移動／攻擊衝刺及只讀 Maker，只有1180×757 DPR1；指定三尺寸與 Maker 保存尚未完成。此擷取範圍有 extension 來源錯誤、未見遊戲來源 warn/error，不能稱零錯誤。
- 另一次有界 browser 層能力補查也已收件採納 changes／capability_unavailable：browser capability IDs 為空，沒有原生 viewport override，三尺寸未測；沒有安裝、改權限或回退本機。兩份原始結果與採納收據都保留本機，不覆寫成通過，也不當成遊戲缺陷。
- 固定 iframe 尺寸 lab v2 已追加發布：https://stasischen.github.io/erin-preview/lab/v2/?pr=103&sha=206f285bf9aac1800613b88dd27daffcac2a8d6b&size=1024x461 。發布 commit a29910eb83606b52b550b46a51042ba749d95413，Pages run 40514255891 success；原71檔未變，線上69個遊戲 payload 與4個 lab 檔 hash 全數吻合。Mac 工程驗三尺寸、實際操作、上下導覽、原生 fullscreen 防誤計與資料隔離通過；另實際開公開頁核對1024×461 frame／canvas 與版本i。外頁導覽解決來源遊戲攔截 wheel 的觀察問題，沒有更動遊戲。
- Dot 實際回覆 changes／incomplete_evidence：自己的 cloud Chrome 在1024×461、740×360、1180×820 frame 基本操作與 HUD 檢查均回報 pass，1180×820 如實分區捲動觀察；native top-level resize／fullscreen、Maker 保存與完整弱點驗收仍未測。主控核對作者、房間、request／source／manifest／bundle 及原始已發布 prompt bytes 相符；但原回覆把視覺 rows 放進檔案驗證用 coverage，正式 normalizer 拒收，尚未採納。原始回覆完整保留本機；已直接提供固定 source manifest preimage、request.json、原始 bundle 精確 bytes 與公開版本定位，請 Dot 實際重算並在同一請求另回格式修正版，把視覺 rows 原樣移到 viewport_results、保留 changes；不用重跑已完成 UI、不捏造 hash 旗標。修訂實際回覆已收件並通過原 normalizer，三尺寸原文、execution／console／excluded 與 changes 判定未變；Dot 已獨立重算 endpoint manifest1784 bytes、bundle7037 bytes 及 request ID，完整性缺件已關閉。採納的是 changes／incomplete_evidence，沒有把排除範圍變成已測或 approve。頂層 browser 尺寸、frame 尺寸及原生 fullscreen 分開記錄，1180×820 需分區觀察並註明外頁捲動；不能用縮圖／zoom 冒充。家長已明確回覆「允許隔離測試草稿」；僅限此 PR／SHA 的公開預覽 Maker 修改、儲存、重讀、恢復預設，不碰正式站、原作品或程式碼。主控已另外送出單輪 Dot 雲端 Maker 保存測試：老師倍率0.2／3 →0.25／4，保存後重載核對，再恢復預設並重載核對；遇到非預期既有作品先停止，不覆寫。完整 canonical manifest／request 與原 prompt 一次隨送件提供並讀回核對。Dot 已在自己的 cloud Chrome 完成且回覆 approve，主控用原 work-dir 正式收件採納，並再次核對線上固定候選 manifest hash；授權也由 Dot 在可信使用者對話直接確認。老師0.25／4保存重載仍在、守門人維持0.2／3，恢復預設後兩者重載均為0.2／3，測試值已清除。此 approve 僅限兩個倍率的可見保存循環，沒有直接檢視所有儲存 bytes；console 所讀子集只有 extension 錯誤，不能稱整頁零錯誤。舊三尺寸 changes 與其 native resize／fullscreen、全弱點驗收等排除範圍保留，不擴張成整卡／正式站／merge 批准。
- 發布注意：本候選 manifest 也固定了共用根目錄 index.html、README.md、.nojekyll 的 hash，追加 lab 時保留這些原檔；未來新增候選前須處理共用根目錄與固定 manifest 的關係，不能覆寫舊檔造成舊候選證據失效。
- 既有請求留原房間／ID完成，不跨房重送；新房間的 synthetic 讀寫已驗，獨立通知仍待驗收才切新任務。原始請求、固定版本、hash、實際回覆／採納收據、私人交換位置與 session 對照留本機。

GROKBOT 恢復時沿用公開測試站與 Git 版工具，分清 Mac 工程驗證、Dot 雲端 smoke 與完整卡片驗收；不能把舊 Windows 結果或通訊成功當成雲端瀏覽器通過。公開紀錄不放私人交換位置、request ID、session 對照、截圖或完整日誌。PR103 合併後 done／部署／接線摘要先留本機，隨下一條家長授權分支提交；不追加已合併分支、不為寫狀態直接推 main。

## PR103 給家長的回報

弱點／護甲積木已上線 20261027i，老師收招或破架勢、守門人背後或撞牆時會露出可攻擊的弱點。進試煉或 Maker 練習，觀察預告、發光及關閉前快閃，再比較護甲小回饋和弱點大回饋。Mac 完整114 PASS、三尺寸獨立實玩與部署確認都通過，沒有新的阻擋問題；Godot 尚未實機執行，環境／誘餌目前只提供共用事件入口。下一張 boss3 尚未開始，會在家長指示後套用已送測的 Dot 雲端流程。

## boss3 已獲授權開工

家長回覆「好開工」，本輪只做 survivor-boss-gallery-3（雙刃刺客）；由最新 origin/main 2652f7603294068631b068223bc770c23d33a61a 建 codex/survivor-boss3。前版 PR103 done／部署與 Dot 接線證據快照隨此授權分支保存。實作先完成完整 Mac 測試與 PR，之後實作者停手，由獨立 session 程式審查、Dot 自己的雲端電腦實際三尺寸與卡片功能試玩；測試站與正式站隔離，不能把前版 smoke 當本版驗收。boss4／boss5 尚未開工。


## boss3 實作完成，準備交 PR

- 本輪只有 `survivor-boss-gallery-3`，版本 `20261027j`；沿用競技場及其他王，新增雙刃刺客四／半血五連、逐刀完美閃避、背後影步白閃、苦無側滑、真破架勢紅弱點及可調的額外蓄力傷害。連段跨半血鎖住原刀數，有效暈眩／破架勢仍能打斷。
- 共用弱點開啟是3倍，只有刺客真正破架勢的 charged 命中再乘1.5，總4.5倍，不疊老師暈眩3倍。每王最快通關分一般／Maker兩個紀錄map；只成功且更快更新，暫停與入口不計、真實活動時鐘獨立於模擬dt上限。新兩個storage key及預覽隔離接面見實作文件。
- Mac `node games/survivor/tools/test.cjs --layout` 完整exit0（118行PASS），`git diff --check` PASS；159個遊戲／測試／快取檔測前後SHA-256完全相同，既有美術與戰鬥基準沿用並通過。完整日誌與圖片留repo外。
- 作者正常UI工程smoke在1024×461、740×360、1180×820通過：王冠選單四王與最佳時間列、刺客入場、移動／衝刺／按住放開攻擊／暫停續玩，Canvas滿版、HUD控件不重疊。只見既有本機favicon.ico404，無遊戲資源錯誤或JS例外；這不是獨立審查或Dot驗收，未聲稱作者UI已打贏或完成半血／破架勢。
- 正常試玩、半血／架勢操作、Maker設定與保存重載、Godot §11.1–11.7適用項目與差距見 `docs/survivor-boss-gallery-3.md`。純規則與真引擎已驗每刀信用、5刀衝刺資源、貼牆換位、白閃先於傷害、先射後滑、倍率及紀錄隔離；Godot未實機執行、手感平衡待實玩。
- 家長授權的Dot雲端分工已最小對齊AGENTS／GAME_WORKFLOW／本卡brief與DECISIONS；後續由獨立session先程式審查與Mac全套，再對同固定候選交Dot雲端正式三尺寸／卡片驗收。Maker須有該PR／SHA草稿許可並清理，正式站／原作品不碰。尚無本版Dot通過或合併判定；開PR後實作者停手，boss4／boss5不開工。


## boss3 PR104 交獨立審查

PR：https://github.com/stasischen/erin/pull/104 。實作與完整測試對應 SHA `24e8b64040b0c4ebe749ad01c92228c7b16f3e08`，版本 `20261027j`；本段與卡片 PR／狀態為後續純交接提交，遊戲／測試／快取159檔與受測內容相同，正式審查仍核對 PR 最新完整 HEAD。實作者已完成開 PR 所需交接，停止寫入，不 approve／merge；先由獨立 session 程式審查及 Mac 全套，再交 Dot 同一固定候選正式雲端試玩，任何實質修正都在原分支並重新驗證／綁定。boss4／boss5仍未開工。

## PR104 程式審查通過，Dot 正式驗收已送

- 固定來源 cd1d2a46c264b1712e1b6e47399dd9397f3001fd／20261027j；獨立 session 已重跑 Mac 完整含 --layout，118 PASS、159檔 hash 一致，code_ready 尚未 approve／merge：https://github.com/stasischen/erin/pull/104#issuecomment-6445909787 。
- 固定候選：https://stasischen.github.io/erin-preview/pr-104/cd1d2a46c264b1712e1b6e47399dd9397f3001fd/games/survivor/ 。三尺寸lab：https://stasischen.github.io/erin-preview/lab/v2/?pr=104&sha=cd1d2a46c264b1712e1b6e47399dd9397f3001fd&size=1024x461 。
- preview commit c6184945ad6b4df8580ef5be0c3a9ec40fe34eaa，Pages run40530128671 success；manifest SHA256487ff8b921879eeaa7e46da12e399024c22cc828b14259b803dbeb555257056d。公開145檔HTTP/hash通過，舊75檔與舊69payload未變；7個key與A/B正常/Maker每Boss紀錄保存重載、原SW/cache sentinel工程驗證通過。工具已Git保存於測試站非Pages分支 codex/preview-tools，commit fe1a7e74ac2c50976d7aae5ee071d4c4e90333f9。
- 主控已直接送本卡正式Dot雲端實測，完整canonical source descriptor／manifest preimage／request與精確prompt一併提供並讀回核對；要求本候選三尺寸、半血五連、真破架勢紅弱點、至少一次預設通關與紀錄重載、隔離Maker保存及清理。未收到實際結果前保持待審，不沿用PR103結果、不模型定時輪詢、不合併。正式站仍是20261027i，boss4／5未開工。
- 本段原為主控針對舊 j 候選的待審狀態快照；主控已明確授權隨本次小修保存，保留為歷史證據，不把狀態文字當遊戲來源。私人交換ID／原始結果及session對照只存本機。

## PR104 首輪 Dot 正式結果：changes／證據不足

主控已按原固定請求核對收件並採納 changes／incomplete_evidence，沒有改成通過。Dot 自己cloud Chrome在三個指定frame尺寸都實際進場操作，看到四Boss／最佳欄、入場圈、圓形arena、紅扇形與部分基本輸入；三次18～25秒陣亡，沒有完成逐刀信用、真破架勢紅弱點、低於半血五連、勝利或最佳紀錄重載，其他Boss進場也未測。Maker沒有寫入：Dot可信原生human授權只確認過PR103限定草稿，不接受此處轉述當作PR104standing grant。console僅所讀子集為extension來源錯誤，不宣稱零錯誤。

這是未完成驗收，不自動當成產品機制故障；主控已交獨立審查員只讀分類缺口，保持不approve／merge、不改低產品難度。準備一輪僅1024×461的暫停優先／短時間普通輸入能力試驗，仍須使用真實cloud及documented UI；不改遊戲clock／globals／HP、不寫Maker，不將單項能力試驗擴張成整卡通過。PR104 Maker原生確認已請家長在Dot對話完成，其他測試持續；正式站仍i，後卡未開工。


## PR104 k 修正：既有方向鍵放開（待獨立重審）

- 依 grok 的 changes 修正 baseline bug：keydown 保留 ArrowLeft 等多字元鍵名，keyup 現在使用相同正規化；一般字元仍轉小寫。只改輸入配對，沒有修改 Boss、難度或新增機制。這不是刺客引入的回歸，也不推論 Dot 陣亡原因；審查者原檔與 j 正式 changes／incomplete_evidence、half／posture／win 未測等證據保留。
- 新的實際註冊事件測試涵蓋四箭頭按下移動→keyup→真 tick 停止、重複 keydown、WASD交叉大小寫、對角只放一鍵、Escape／blur 清鍵與 J／K 放開／取消；未直接清 Set 偽造 keyup。只在測試 helper 加可選的 window callback 記錄器，沒有重生任何舊美術／戰鬥 frozen 基準。
- 版本 `20261027k` 已同步；Mac `node games/survivor/tools/test.cjs --layout` exit0、119行PASS、`git diff --check` PASS；160個程式／測試／快取檔測前後hash一致。Mac Chrome1024×461用正常選單及真CDP四箭頭keydown／keyup，按住皆移動，放開後input均為零且140ms後世界位置不再變動；僅讀診斷，不改遊戲state／Maker／Boss。這是修正輸入的工程smoke，不是Dot正式驗收。
- 家長對 erin-preview PR／SHA 隔離 Maker 草稿的修改／儲存／重讀／恢復預設已給常設授權；每次仍核對候選與namespace並清理。不擴及原作品、正式站、程式碼或安全設定；若原生可信對話／平台明確拒絕就報具體block，不靠repo文字擴權或繞過自動審核。原生確認由主控核實。
- 同 PR104／同分支交新 SHA 獨立程式複審與 Mac 全套，再由主控發布新的固定候選交 Dot 正式測；舊 j pause-first probe 不能當本版通過。實作者完成 push 後停筆，不 approve／merge，不動預覽維運／Pages，也不接 boss4。
