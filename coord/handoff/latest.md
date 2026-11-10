# 目前交接

## PR113 最新候選 Dot 雲端驗收（2026-11-10；等待回覆）

PR #113 仍為 Draft；派送 request 時 PR HEAD 為 `d4e876104fa2dd6b54fa8509dff475d4dbf629c2`。其後分支只新增 `coord/` 交接紀錄、未改遊戲來源；目前 PR HEAD 以 GitHub 即時值為準。固定遊戲來源 `cf14bc06f25fcb3cd8b93bd6842950b9b8749350`、版本 `20261105a`。核對原交換房後，未找到綁定此遊戲來源的既有 QA request；已在同一個 exchange PR #2 貼上三尺寸與實際升級流程驗收要求（comment [6769159773](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6769159773)，本機 thread `20261110-215444-2f95`）。目前只確認 GitHub 已收下留言並讀回，尚未確認 Dot 收件或回覆；舊 `5607ab95…` 的 partial 不套用到 `cf14…`。Mac 已有完整測試與部分實玩證據不重跑；尚缺目前候選 Dot 三尺寸及功能實測、整張 PR 的正式獨立審查。

家長已選玩法點子 **1 → 2 → 4 → 5**，第3項不做。Dot 已交付第1項「本局結算摘要」精簡規格，顯示時間、到達關卡／等級、小怪擊倒數、最後配裝／卡片、新最長紀錄；沿用現有畫面／重開操作與存檔，不加傷害排行或新存檔欄位，無待家長決定項目。依原約定，待 PR113 gate 完成並合併後才從最新 main 開第1項，之後依序做2、4、5。

PR105 維持 Draft；Dot 對固定候選的既有雲端結果仍是 partial，1024×461 viewport 在其雲端介面不可設定，Rolling Eye 的 E→N→W 與 +90°仍未證實。已結案的 Mac 補驗不重開，面具石像外觀由家長接受；不對同候選重派相同測試，除非 Dot 的受支援 viewport 能力有變。

---


## PR113 固定候選移動與自然局補驗（2026-11-09；本次補驗已結案）

家長限定授權在 Mac Studio 補驗固定候選 `cf14bc06f25fcb3cd8b93bd6842950b9b8749350`／版本 `20261105a`；不重跑既有三尺寸、不改遊戲、不重派Dot、不合併或部署。沿用同一公開候選與740×360畫面，Chrome全視窗方向輸入前後截圖可見主角相對巧克力大熊及場景地面物件位置改變；計時由78秒到79秒。這次可確認實際移動，不只憑方向鍵已送出或時間增加推斷。移動前／後畫面曾在CUA呼叫 `call_5d0da1e0d8e74226991311f6406d6557`、`call_8a62be9f38c04ae38ddfcd2cb023db53` 即時顯示，結算畫面曾在 `call_567d24620e0b4994813f7b5cb5ecf4c5` 顯示。一次有界核查確認 `read_thread(includeOutputs=true)` 只有呼叫metadata、沒有影像附件／bytes；本機 Erin 截圖資料夾也沒有本次原圖。Dot無法用這些呼叫編號重開像素圖，所以只記主控親見結果，不冒稱Dot已親眼核圖；未重開局或補拍。

正常選升級卡繼續後，未注入時間／血量／敵人；自然結束畫面顯示第3波、Lv.7、血量耗盡、84秒，最佳紀錄84秒。這是自然死亡結束，不是勝利。1024×461、740×360、1180×820畫面尺寸矩陣不重跑；已有的三尺寸升級畫面紀錄不變。本次沒有重跑 `node games/survivor/tools/test.cjs --layout`。

結果已記回PR113原卡與規格。PR113仍Draft；本次補驗不取代既有Dot閱讀／獨立審查，也未送新請求。家長已接受原圖未保存、Dot無法獨立核圖的限制，並同意只結案本次補驗；不記為Dot視覺複核或通過，也未重派新請求。整張PR113仍未完成：Dot既有partial_pass綁舊候選5607ab95ef2a1fb6bdda9528dc6713b58654c4c9，目前cf14候選仍缺Dot三尺寸與卡片功能雲端實玩；GitHub目前無正式review，PR仍Draft。這次補驗結案不取代剩餘gate。家長已選玩法點子1、2、4、5依序做；點子1結算摘要與PR113重疊，待PR113依原流程完成後再從最新main開工。

## PR113 解鎖後續驗：單尺寸與自然局已完成（2026-11-09）

家長已解鎖 Mac Studio，沒有其他 session／背景程序同時操作固定候選。使用本機 Chrome 開啟 `https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/`（遊戲來源 `cf14bc06f25fcb3cd8b93bd6842950b9b8749350`／`20261105a`）。DevTools 裝置工具列欄位實際顯示 1024×461，正常按開始進入戰鬥；畫面內容鋪滿、未見黑邊，左上狀態、上方計時／魔王訊息、右上資源與右下技能沒有重疊。這是 viewport 工具列所報尺寸與該畫面觀察，未以外框大小冒充內部 viewport。

同一局未注入狀態，讓遊戲正常運行至結束：第3波、Lv.1，80秒後血條耗盡，結算顯示本局結束與最佳80秒。此處記錄為完整自然結束局；沒有聲稱勝利或完成升級選卡。740×360與1180×820未測，不能推定通過。

為設定剩餘尺寸，Mac Chrome DevTools 寬度欄先後錯誤顯示40及1，高度欄被清空；停止重試。改查 Chrome「視窗」選單時，最小化、縮放、填滿、中央與「移動與調整大小」相關命令均顯示停用；未改系統顯示或安全設定。這是本機視窗控制卡點，不是遊戲缺陷。後續需要一般可拖曳的 Chrome 視窗或可直接精確設定 viewport 的控制介面，才能補測另外兩種尺寸。

本次沒有改遊戲程式、資料、版本或產品 gate，沒有重跑既有 `--layout` 136 PASS，沒有重派 Dot、合併或部署。原卡保持 blocked，`waitingFor` 已從 Mac 解鎖更新為精確 viewport 控制方式；PR #113 仍為草稿。原先鎖定的候選 bytes、既有程式審查與測試證據不變。

## PR113指定續驗與解鎖通知（2026-11-09）

依序確認沒有其他 session／背景程序正在跑同一候選；再沿既有隔離公開頁操作，並核對剩餘技術證據。Chrome頁正常載入，但開始鍵多次只取得焦點、畫面仍是「準備開始」，沒有進戰鬥，因此未開始三尺寸測試或自然完整局。CUA 原生桌面檢查曾回報：`The Mac is locked and automatic unlock could not unlock it. Ask the user to unlock the Mac manually before continuing.` 畫面截圖是 960×820，並非要求的三種尺寸；也沒有確認內部 viewport 尺寸。不能把這次列為測試失敗或產品缺陷。

離線技術一致性核對：固定遊戲候選 `cf14bc06f25fcb3cd8b93bd6842950b9b8749350` 的版本為 `20261105a`；候選到目前 PR HEAD 只有 `coord/`、`docs/` 紀錄變動，`games/survivor/` 與 `sw.js` 未變。既有該 SHA 的 Mac `node games/survivor/tools/test.cjs --layout` 136 PASS、非作者 approve 仍適用，這次沒有重跑。逐輪程式審查記錄已列於 [證據總表](pr113-evidence-summary.md)，此離線核對不等於三尺寸、完整局或PR整體驗收通過。

核對既有 Erin ntfy sender 後確認：它從設定讀取共用路由，但會吞掉錯誤、沒有保存伺服器回執；本機未找到 user-action 發送去重帳本或本任務先前發送紀錄。沿同一已授權路由只送一次「解鎖 Mac Studio，解鎖後回覆已解鎖」的最小提醒；ntfy 伺服器回 `HTTP 200` 並回傳 message receipt，已記在本機 `~/.local/share/erin/logs/pr113-unlock-ntfy-receipt-20261109.json`。這只證明伺服器受理，沒有宣稱手機已收到。

原卡現為 `blocked`，`waitingFor` 明列解鎖 Mac Studio 並在原 Erin coordinator 對話回覆；這是執行前置，不是玩法或合併決定。解鎖後沿同一候選補 1024×461、740×360、1180×820，再完成一局自然遊玩；無法開始前不判定產品有問題、不合併或部署。

## PR113證據彙整已交付（2026-11-09）

[整體驗收證據總表](pr113-evidence-summary.md)已完成：各輪固定SHA、Mac執行者／既有結果、純視覺紀錄、Dot g版部分通過、a版未驗限制分開列明。主控已讀回原卡與紀錄一致；本次只整理文件，沒有重跑測試、重試／繞路下載、重派Dot、改玩法或合併部署。P3已修，不再列待修。

PR113原卡owner仍是本對話codex；目前 `blocked` 是等 Mac 解鎖以完成瀏覽器驗收，不是重新實作或等待玩法決定。固定候選公開檔案核對與既有 P3 操作已完成；這些不等於整體驗收或合併批准。

### 2026-11-09 固定公開候選唯讀連線診斷

在 2026-11-09 04:44:01–04:44:02 UTC 對固定候選的精確 URL `https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/version.json` 做一次 `curl` GET（connect timeout 5 秒、總上限 15 秒、無 retry）。原始結果：`HTTP/2 200`、`curl_exit=0`、下載29 bytes；回應本文 `{"version":"20261105a"}`，GitHub edge IP `185.199.111.153`，request ID `52C4:0BC3:8CA8A:908BE:6AF14F91`。確認固定候選目前此版本檔可達，這不是全檔 bytes、完整載入、遊戲操作或整體驗收通過。

先前 Python 下載連線重設及 Chrome `loaded` 逾時僅有舊交接轉述，未找到對應原始失敗日誌，也沒有政策拒絕證據；本次成功且未遇政策拒絕。下一步由原主控沿同一固定候選完成既有公開檔案核對與公開操作核驗；不重跑136／P3、不重派Dot、不重新部署或合併。

### 2026-11-09 固定候選公開檔案／實際操作接續

原測試端沒有候選相關執行中進程。使用固定發布manifest `~/.local/share/erin/history/public-preview-stage/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/preview-manifest.json`，SHA256 `ef2c10e26b8338a9d9b3209ca2e8228eb41f2f059e047fab26ca11ff67886e8f`，版本`20261105a`、123個payload項目；公開manifest與detached digest均HTTP200且bytes/hash吻合。第一版檢查器把候選prefix重複加到repo-root-relative manifest `path`，曾產生錯誤404及一個錯誤對比；所有123筆原始回應保留在本機檢查日誌，並標為`invalid_url_mapping`，不是產品結果。對照既有發布repo `stasischen/erin-preview` commit `cd42279a40ce4ee0bb7ecb5b057e652fc44fed1c`後，確認123/123 manifest路徑皆與該commit檔案bytes/SHA吻合；正確URL為`https://stasischen.github.io/erin-preview/`加manifest `path`。按正確映射逐檔GET後，123/123公開payload皆HTTP200且完整bytes/SHA吻合，未遇政策拒絕。逐項原始結果留本機 `~/.local/share/erin/logs/pr113-public-bytes-cf14bc06-20261109.json`。

同一固定公開遊戲頁面 `https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/` 在Chrome正常載入並可玩：按「開始生存」進入第1波Lv.1，顯示`0秒／魔王150秒後來`；按暫停再按「繼續遊戲」，恢復畫面顯示`3秒／魔王147秒後來`；正常移動收集經驗自然到Lv.2，選取並確認「水球加大」後回到戰鬥，顯示`21秒／魔王129秒後來`。這是當前公開候選的載入、暫停續玩、自然升級選卡恢復證據；不是三尺寸矩陣、完整局或整體PR驗收。逐步操作紀錄在本機 `~/.local/share/erin/logs/pr113-public-candidate-interaction-20261109.md`。本次只完成固定候選公開檔案核對及指定UI操作，不是整體PR批准；三尺寸矩陣、完整局與原Dot未測範圍仍不能由本次結果推定。未重跑136／P3、未重派Dot、未部署或合併。

### 2026-11-09 04:41 PR113公開候選接續核對（後續已有新證據）

核對 PR113 目前仍為 OPEN／Draft，公開 HEAD `f2b5929093008a166410f728d9762cdcf2fe974f`；PR 文字與原總表指向同一固定遊戲候選 `cf14bc06f25fcb3cd8b93bd6842950b9b8749350`／版本`20261105a`、測試頁 `https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/`、Pages run `41967715588` 成功、預覽發布提交 `cd42279a40ce4ee0bb7ecb5b057e652fc44fed1c`。截至該次核對時 GitHub PR 沒有新留言；本機找不到這個候選的公開連線成功產物，也沒有 Python／Chrome 失敗執行原始日誌。該時點記錄的原失敗轉述後已被下方新診斷更新。`~/.local/share/erin/logs/pr113-public-http.json` 及 `pr113-public-preview-validation.json` 是 2026-11-03 的舊版本`20261103a`成功資料，不可挪用為本候選證據。未重試網路操作、未重跑測試、未重派 Dot；沒有待家長輸入或新的通知需求。

## P3計時文字已修復（2026-11-05）

家長授權開卡派subagent，卡survivor-timer-status-refresh，沿PR113。作者真Chrome先重現、修後驗證，再加回歸；非作者另真Chrome及Mac全套exit0／136PASS，第一輪approve。產品僅loop判斷一行、測試14行，第一tick恢復暫停／選卡覆寫文字，正常快取保留。來源cf14bc06f25fcb3cd8b93bd6842950b9b8749350，版本20261105a。未派Dot、未改升級節奏／存檔，前輪雲端未測範圍保留。

Pages41967715588成功，預覽提交cd42279a40ce4ee0bb7ecb5b057e652fc44fed1c；保留1980既有檔，新增122候選檔。當時初次公開核對遇Python下載連線重設及Chrome loaded逾時，因此先前不能宣稱全檔bytes或公開試玩通過；2026-11-09已依正確manifest根路徑補核，結果見上方。本機固定候選隔離與真Chrome均通過。
https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/

推送時Claude另有純文件提交，已正常merge保留；對固定受測來源的遊戲與sw無差異。詳coord/tasks/specs/survivor-timer-status-refresh.md與coord/reviews/survivor-timer-status-refresh/independent.md。PR仍草稿，不合併main。

## g版 Mac 全套重跑通過（2026-11-05）

依家長要求，主控在2ed68f29e8256cceb89d432b4498586103293d60執行 `node games/survivor/tools/test.cjs --layout`，exit0／136PASS，差異檢查通過；遊戲來源仍5607ab95ef2a1fb6bdda9528dc6713b58654c4c9／20261104g，無runtime差異。已更正後續規劃的Mac未測記載，詳docs/survivor-followup-plan-20261105.md。P3未修、升級節奏未動，Dot部分驗收限制仍保留，不合併。

## Dot 已回覆（2026-11-05）

Dot已回覆：固定增量程式審查通過，雲端三尺寸正常生存遊玩通過；整體partial_pass，沒有必改缺陷。P3計時文字同秒續玩延遲列FOLLOWUP，部分情境與可開啟截圖尚缺，詳[收件摘要](../reviews/survivor-upgrade-balance/dot-readability-result.md)。不宣稱整PR完整驗收，不合併main。

## Claude 修正接手與 Dot 送審（2026-11-05）

目前遊戲來源5607ab95ef2a1fb6bdda9528dc6713b58654c4c9，版本20261104g；上一份5768808／f版交接及預覽保留為歷史。新增魔王倒數、低血量紅框、普通同敵傷害數字合併及池引用清理；自動／手動模式沒有修改。一般無query入口「開始生存」是自動攻擊三槽，Boss試煉手動，Maker舊試玩依sandbox設定。不要從原erin目錄或正式站測本輪分支。

家長要求照流程送Dot。主控沿原worktree與PR113接手；非作者Mac本人完整套件exit0／136PASS及首輪approve，詳readability-review.md；[Dot固定請求](../reviews/survivor-upgrade-balance/dot-readability-request.md)。已沿原Dot討論串送件並核對GitHub留言：[送件紀錄](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6638166698)。請求metadata b9d19024eb084ec443fec6405fd0e791986262fa，request SHA256 bc3d0a639e2e66f027e45e1835536e313b4f641d5f5d4df76033f3dbc288294b。尚未取得Dot雲端結果，不宣稱驗收完成，不合併main。

Pages41882567310成功，預覽提交5120378237c27743604b62a8f7ee553edea60e51，既有1858檔保持，新增122候選檔。公開Chrome740x360自然33秒／兩次升級／第二波／技能／暫停續玩exit0。公開全檔逐位元核對未完成：Python連線重設，另一次Chrome載入逾時，已停止重試；不能宣稱122公開檔全驗通過，請Dot先核雲端可達與manifest。

新版測試頁：https://stasischen.github.io/erin-preview/pr-113/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/

---

## Claude 審查交接（2026-11-05）

家長要求交由 Claude review；[完整交接](claude-review-maker-data.md)已同步本分支，包含固定比較範圍、測試證據、重現步驟及限制。遊戲與測試頁維持下列來源，PR113仍為草稿；下一步等待 Claude 審查結果，不自動改碼或合併。這次只更新文件，未重跑遊戲測試或變更版本。

## Maker與預設資料拆分完成（2026-11-04）

Maker主檔618→119行，預設資料主檔2624→259行；完整預設依內容分14模組。Maker從「設定→自己設計」進入，不在開始畫面顯示。原完整資料、49卡順序、玩法與存檔格式維持。
https://stasischen.github.io/erin-preview/pr-113/5768808d3aa6c4454132f352be1ac1811b60ebc2/games/survivor/

來源5768808d3aa6c4454132f352be1ac1811b60ebc2，版本20261104f。完整Mac test.cjs --layout exit0／134行PASS，非作者首輪approve見maker-data-review.md。每步先真Chrome，六分頁深層編輯、保存重載、兩種試玩、真preview/practice iframe、三尺寸自然33秒升級與第二波皆通過。桌面Chrome不冒充手機硬體或自然完整長局。

發布前125檔／832執行請求存檔隔離檢查通過。發布結果：Pages41792656294成功，預覽提交7a64af8b83259e3045e309318410a14dd7c845f0；保留1736既有檔，122候選檔HTTP及內容一致。公開頁740×360 Maker設定入口、六分頁、編輯保存重載、兩種試玩，以及自然33秒兩次升級／第二波／技能／暫停續玩皆通過。PR113維持草稿，正式站未改；收尾僅文件，版本不另增。
下一步等家長意見，不自動擴拆schema或合併。

---

## 渲染、戰鬥與主迴圈拆分完成（2026-11-04）

依家長授權依序拆三個舊大檔：world738→176行、combat515→39行相容入口、loop472→308行，新增11個責任模組。101個原函式逐字相同、tick順序及原介面保留；玩法、數值、存檔格式與歷史基準未改。維護對照見docs/survivor-module-map.md。PR113維持草稿，正式站未變。
https://stasischen.github.io/erin-preview/pr-113/fb8df5c38956cbd5b3790c4e443103d7455858c2/games/survivor/

來源fb8df5c38956cbd5b3790c4e443103d7455858c2，版本20261104e。完整Mac `node games/survivor/tools/test.cjs --layout` exit0／134行PASS，diff check通過；非作者第一輪approve及完整結果補核見modules-review.md。每一步先真Chrome自然33秒升級／第二波／技能／暫停續玩，再下一步；最終三路線受控Boss換關、Maker兩入口、試煉、預覽與練習iframe、三尺寸resize通過。桌面Chrome不冒充手機硬體或自然完整長局。

預覽提交f2c9c570fe32e927c11d8b74a99ec759218acee9，Pages41783438632成功；發布前103檔／678請求隔離驗證，保留既有1636檔，發布後100候選檔HTTP及內容一致。公開頁740×360自然33秒兩次升級、第二波、技能、暫停續玩通過。存檔檢查工具私有副本僅反映finishRun搬檔，完整key/call/surface契約與負向檢查保留，獨立核過；原工具未動。

下一步等家長指示，不自動合併或擴拆Maker/schema/defaults。此交接僅文件，遊戲版本保持。

---

## 六種地圖主題與五種隊形測試版（2026-11-04）

開局可選森林／清涼／甜蜜三條路線，各兩關，共六主題；本局路線換關保留，重開可重選，沒有新增存檔欄位。五種隊形為單側、雙翼、分段交替、斜向、重裝編隊；每十秒輪換，沿原批次數與限制，完整身體畫外出生。PR113仍草稿，正式站未變。
https://stasischen.github.io/erin-preview/pr-113/4cf8a2e55098b242e96f7de3b0c881f2e90a009c/games/survivor/

來源4cf8a2e55098b242e96f7de3b0c881f2e90a009c，版本20261104d。完整Mac `node games/survivor/tools/test.cjs --layout` exit0／134行PASS，diff check通過；非作者第一輪approve及完整結果補核見routes-review.md。三尺寸自然選路／升級／第二波／觸控技能／暫停續玩，三路線受控Boss擊殺換關、五隊形實際進場、六快取隔離與穩定皆驗。桌面Chrome不冒充手機硬體或自然完整通關。

預覽提交07e3a1f9bed8888fb266ed64ec7329ec25320a03，Pages41781240699成功；發布前92檔／619請求隔離驗證，既有1547檔保持，發布後89候選檔HTTP與內容一致。公開頁740×360清涼路線自然33秒、三次升級、第二波與技能／暫停續玩通過。下一步等家長手機試玩，不自動合併或開新卡；本交接只改文件，遊戲版本保持。

---

## 元素材質、敵群重量與地景測試版（2026-11-04）

薄線主體改為厚實旋風、水體、雷片與光束；每30秒五階生存壓力18／28／40／52／64，八種原敵人逐階混編，重裝實際抗擊退，特殊怪限量，生存Boss150秒。兩關固定葉地／碎餅地、路徑與地標，波次淡色變化；修正小數鏡頭下地塊淡線。沿原兩關與八敵種，未新增存檔格式；PR113仍草稿、正式站未變。
https://stasischen.github.io/erin-preview/pr-113/2c2cfa62a067e7c111dbbed913c1f48c94fc2574/games/survivor/

來源2c2cfa62a067e7c111dbbed913c1f48c94fc2574，版本20261104c。完整Mac `node games/survivor/tools/test.cjs --layout` exit0／133行PASS，diff check通過；非作者兩輪approve及完整結果補核見world-review.md。三尺寸自然至第二波、升級、觸控技能、暫停續玩；受控五波／地景／能力及64敵短壓力通過。桌面Chrome不冒充手機硬體或自然長局平衡；傷害字遮擋、受擊旋轉地塊對齊列FOLLOWUPS。

預覽提交6be3a7ffef4b48759848b7bbe65ed256eae4c5ed，Pages41758130493成功；發布前91檔／602請求隔離驗證，既有1459檔保持，發布後88候選檔HTTP與內容一致；公開網址740×360自然遊玩33秒完成兩次升級、第二波、技能與暫停續玩。下一步等家長手機試玩，不自動合併或開新卡。這次交接僅文件，遊戲版本保持。

---

## 九秘技與六條主動大招測試版（2026-11-04）

一般生存新增九秘技、六條按鍵大招路線，各五級；三武器／兩秘技／一主動。三種不同同元素能力解鎖秘技；大招選定一路後專精，連兩次未出能力時下一次保留一格，重抽同樣保留。手機顯示路線名與等級。PR113維持草稿，正式站未變。
https://stasischen.github.io/erin-preview/pr-113/6ef9cd0e472259ab4c600450f6f55378d42cfef4/games/survivor/

來源6ef9cd0e472259ab4c600450f6f55378d42cfef4，版本20261104b。完整 Mac `node games/survivor/tools/test.cjs --layout` exit0／132行PASS，diff check通過；非作者兩輪後approve（abilities-review.md）。三尺寸自然取得潮汐／通道／裁決並真觸控施放及暫停續玩通過；十五能力各Lv1/3/5受控真Chrome作用驗證與圖像檢查通過。獨立真Chrome另驗護盾實際承傷、Boss與精英只緩速、狂歡三武器追加攻擊且全局被動不重複、兩種Maker真試玩入口。

預覽提交84ec4fef9551540abddf1d528674a50e4b9c9622，Pages41751973867成功；發布前88檔／571請求隔離驗證，既有1374檔保持，發布後85候選檔HTTP與內容逐位元一致。下一步等手機試玩，不自動合併或開新卡；本次交接是文件更新，遊戲版本保持。

---

## 十二武器三槽生存測試版（2026-11-04）

十二武器各五級、最多三把同時自動攻擊；Boss試煉保留原三把擇一手動。升級頁移除效果圖，武器／配裝／攻擊／畫圖／介面分模組，六組新武器合體只有設計。PR113保持草稿，正式站未變。
https://stasischen.github.io/erin-preview/pr-113/dd90dcf3c446c011b1f1aec798165b85bd04230e/games/survivor/

來源dd90dcf3c446c011b1f1aec798165b85bd04230e，版本20261104a；完整本機 `node games/survivor/tools/test.cjs --layout` exit0、130行PASS，diff check通過，非作者審查approve（survival-arsenal-review.md）。真Chrome三尺寸正常流程、十二武器Lv1/3/5傷害及Maker兩入口已驗；不是手機實機或全配裝長局平衡認證。

預覽提交9fe5589735033c46b287e3b6d61595cf724be889，Pages41696686120成功。發布前84檔及515執行期請求隔離驗證通過，保留既有1293檔；發布後81候選檔HTTP與內容一致。下一步等手機試玩，不自動開新卡。此次交接與審查記錄為文件更新，不變更遊戲版本。

---

## 武器成長與升級比較測試版（2026-11-03）

錘子重擊震波、劍收招劍氣／單體追斬、六項核心升級數值及目前／升級後比較、普通閃光減量已上測試頁。PR113保持草稿，不自動合併正式站。
https://stasischen.github.io/erin-preview/pr-113/e10fbe2d7c0397ba579e96da7a1ef862d26db839/games/survivor/

來源e10fbe2d7c0397ba579e96da7a1ef862d26db839，版本20261103e；完整127PASS、非作者獨立審查approve。三武器正常手動序列自然死亡結算，水球186.85秒跨第二關，錘128.91秒、劍79.02秒；手機尺寸下比較按鈕、真零級預覽及追加命中均驗證。這不是手機實機／後期完整平衡認證，詳見本卡規格與weapon-routes-review.md。

預覽提交a11247874d697cb1948d9ece87170d60bf7d8c3b，Pages41617195280成功；發布前75檔隔離驗證，保留既有1221檔，發布後72檔HTTP及內容一致。下一步等家長手機試玩，不自動接新卡。

---

## 統一圖示與主角縮小測試版（2026-11-03）

全套黏土圖示與水星人縮小15%已上測試頁，完整126PASS，等家長手機驗收；PR113維持草稿，正式站未變。https://stasischen.github.io/erin-preview/pr-113/862522b4b42ecf147a16e4f54041e3246377cb03/games/survivor/

來源862522b4b42ecf147a16e4f54041e3246377cb03，版本20261103d。美術快車道，80共用圖示改黏土風、試煉頭像改現有黏土Boss、場上主角與手持武器縮小15%；HUD頭像、碰撞與傷害不變。真Chrome三尺寸選武器/移動/完整蓄力通過，80圖示全部解碼，四個試煉頭像載入且可返回。test.cjs --layout exit0/126PASS，末尾純美術色票及頭像變更另跑pixel-icons/boss-gallery-2/art-manifest通過，diff check通過。

預覽提交8b3877b427ca6a93683b7466262586e4eb47573e，Pages41581728888成功。發布前75檔隔離驗證，保留既有1149檔；發布後72候選檔逐位元核對一致。下一步等家長試玩，不自動合併正式站。

---

## 地板與手持黏土武器測試版（2026-11-03）

地板細格線與手持黏土武器修正版已上測試頁，完整126PASS，等家長手機驗收；PR113維持草稿，正式站未變。https://stasischen.github.io/erin-preview/pr-113/aec5edeedc3e5ff2aacc5434a6eb01d8a5e80e82/games/survivor/

來源aec5edeedc3e5ff2aacc5434a6eb01d8a5e80e82，版本20261103c。美術快車道，單一實作者；未更動規則/數值/存檔，前輪非作者程式審查不冒稱審過本輪美術。完整test.cjs --layout exit0/126PASS、diff check通過。真Chrome三尺寸正常UI選武器、移動、完整蓄力及釋放，已檢視截圖；手機實機閃爍觀感等家長確認。

預覽提交dd765219aba18783c8c379cea7de87f6bf86160c，Pages41562512150成功。發布前75檔隔離驗證，保留既有1077檔；發布後72候選檔逐位元核對一致。Godot適用項與美術自評見本卡規格。

---

## 手機回饋修正版已上線（2026-11-03）

近戰與手機手動攻速修正版已上測試頁，完整126PASS及獨立審查通過；等家長試玩，PR113維持草稿，正式站未變。https://stasischen.github.io/erin-preview/pr-113/3a97f05dbf5eb047785306afee0249bc26fa642f/games/survivor/

來源3a97f05dbf5eb047785306afee0249bc26fa642f，版本20261103b。預覽提交d16e1a5325f62194eacfa522b4120f7282632df6，Pages41560879295成功。發布前真Chrome隔離75檔核對通過，保留既有1005檔；發布後72個候選檔HTTP與內容逐位元相同。三武器真Chrome手機尺寸診斷與限制見本卡規格及melee-review.md。下一步等手機試玩，不自動合併正式站。

---

## 升級與視覺整合版已公開供手機試玩（2026-11-03）

家長授權發布測試頁；PR113為草稿，正式站未變。

- 測試入口：https://stasischen.github.io/erin-preview/pr-113/f058861a2ebb2d94b51dbacc673069d798a1c9c4/games/survivor/
- 來源 f058861a2ebb2d94b51dbacc673069d798a1c9c4，版本20261103a；程式與獨立審查通過的3f6e0d7一致，後續只改coord。
- 預覽提交322e3012c4f88f26793d1acb686809daa3ae606b，Pages執行41558980176成功。
- 發布前真Chrome隔離驗證通過：75檔HTTP/hash、存檔A/B隔離；追加保留既有933檔。公開後72個候選檔全部HTTP/hash吻合。
- 本次公開頁瀏覽器重開受Work設定停用限制，未聲稱手機實機驗證；此前本機三尺寸、三武器試玩及獨立完整124PASS仍有效。
- 下一步：等家長手機試玩回饋，不自動合併或發布正式站。

---


## A／B作用域證據已收齊，交非作者做整PR最終判定（最新）

受測及公開候選source13851b6fd7c9f7683231b36c9e2613c30f050909／20261028b。主控只彙整證據，不自行批准自己早期實作；本提交僅公開coord紀錄，161個受測source/test/cache與該source完全相同。

| 範圍 | 已取得證據與限制 |
| --- | --- |
| Mac預設程式 | Luna與獨立Mac完整含layout均exit0／73test檔／123PASS，161hash測前後與提交一致；精確4.5倍、嚴格半血／鎖段、同幀事件順序、pause計時、較快才覆寫由純規則／真引擎覆蓋。 |
| 正常試煉 | Dot自己雲端normal-auto／pause-assisted真勝利52.56秒，reload保留；不是default-manual配平批准。 |
| Fixture A | CUSTOM只recoveryGain12→100，四encounter×三真iframe12格實玩／真暈眩；刺客真紅窗manual新充放命中；雙子Fire死只留Ice93%；Maker13.01與normal52.56分離且各自reload。另兩尺寸不補寫Fire未測格；獨審確認12encounter範圍充分。 |
| Fixture B | 同1024×461真frame：HP100時完整四次紅預警→橙出手→收招；HP47時完整五次。影步消失／背後重現／白閃／刺擊有直接片段，近牆落點留場內；苦無扇形／五彈與後續橫移可見。只連斬2/.5、三招傷害1為CUSTOM，未改HP／架勢／刀數／位移／權重。 |
| 發布工程 | 固定preview ec7e7bc0f6966a3bd463941cc3156369d1b39b71、Pages40560933832 success、285HTTP/hash、舊215不變；七key A/B隔離、78真Chrome工程幾何與30結算trace通過，這些不冒充Dot實玩。 |

A已採用Dot格式重發的標準封包，與原件實質完全相同；原始只format-superseded。B標準封包亦接收approve／fixture_b_visual_only，均whole_pr/code_approval=false。B未拍近牆那次橙刺擊frame，開放場地白閃→橙刺已拍；不聲稱同幀發射微序、精確wall算術或預設節拍配平。shadow active鄰文.12、slider accessibility.1與初始讀值相同、未編輯，不以此推測源資料被改。

A/B均UI Reset→Save→reload逐項恢復，B核HP1600、damage12/18/10、blade.85/.1、shadow1.1/.12、kunai.9/.5、counts4/5、recovery12/max100/dodge30/decay6/stun2.5、.2/3/1.5、manual1；normal52.56與Maker13.01重讀在，無pending或活局、自己的tabs已關。各早期partial保留，不改成整體通過。

最後由既有非作者Mac核全PR diff／鐵則／這份分層證據及僅coord新增差異，判approve或具體changes；同意才match-head merge commit，等正式Pages並開正式站核版本b。此刻尚未批准／merge，正式仍i；boss4/5未開工。私人原件／session／完整logs／screenshots不入repo。

---

## Fixture A格式已正式接收，僅剩B可見鏈路及最終核對（最新）

Dot已另發標準enum修正版，頂層approve但acceptance_scope=fixture_a_only、whole_pr/code_approval=false。Root逐欄比較：只有傳輸欄位變動，12格／紅窗／雙子／紀錄／清理等實質資料完全相同；標準receiver已成功採納修正版。原始不合法enum回件完整保留，只標format-superseded，不追溯改觀察、不重測、不在本機偽造approve。非作者Mac已認A的12個encounter×尺寸實玩／暈眩格與限定的雙子演員範圍充分，不新增Fire另外兩格硬門檻；CUSTOM仍不是default配平批准。

已送Fixture B，只在已驗1024×461補刺客可見4／5刀、影步消失／背後／白閃／刺擊及靠牆、苦無與側滑。先用恢復預設架勢、刀數4／5；需要才三招傷害1、連斬windup2/active.5、HP500、其他招windup2（active不變，避免改側滑距離），全部CUSTOM逐項列／末UI reset-save-reload恢復。先不改權重，不重做A。精確倍率／嚴格半血／跨半血鎖段／同幀發射先於移動／精準pause／較快才覆寫已有獨立Mac預設純規則與真引擎證據；normal老師／熊結算已有production-path及三尺寸Chrome工程，不另擴真人一般波次通關門檻。

之後仍須B實際結果與非作者Mac整份候選最終核對，尚未整PR批准／merge。程式仍13851b6／20261028b、Mac123PASS不重跑、正式仍i；normal52.56與Maker13.01、A及各partial依範圍保留。boss4／5未開工。

---

## Fixture A已回報12格功能完成，格式修正／最終獨審仍待（最新）

同source13851b6fd7c9f7683231b36c9e2613c30f050909／b的Dot原件：只改Maker共用recoveryGain12→100（未改HP／傷害），四既有試煉Boss×三真iframe尺寸12格均有實玩／真正暈眩觀察；CUSTOM不當default難度或default-manual。刺客1024真紅窗內切manual、新J充放實際命中，HP71→55→30（浮字263／394不拿來證exact4.5）；雙子1024分別受傷／暈眩，FIRE死亡只剩ICE93%血條。740／1180雙子只認列ICE暈眩，不冒稱FIRE也測到。Maker刺客真勝利13.01秒及reload，fresh normal仍52.56秒；紀錄隔離有直接UI證據。

UI Reset→Save→reload核對recovery12、maximum100／dodge30／decay6／stun2.5／chargeBonus.5、.2／3／1.5／4／5與manual1，無pending／live場景，所有自己頁籤已關。原件作者與request／source／manifest／bundle及12格集合已核實；但top verdict用了非協議值pass_scoped_functional_evidence，標準receiver拒收，尚未normalized adopt。原始回件完整保留，不在本機改成approve；已請Dot同請求重發格式正確原觀察不變的結果，fixture scope與wholePR未批准維持明確，不重測。

已交非作者Mac只讀核對A覆蓋與最少B視覺順序補驗。完整4／5刀、影步／貼牆、苦無先射後滑仍待；精確數學／半血鎖段等依其既有Mac證據分層判。原normal52.56及其他partials不改寫，程式仍b／123PASS、不merge、正式仍i、下一卡未開。

---

## Dot已正常通關52.56秒並驗證重載紀錄；整體仍未批准（最新）

已核實同13851b6fd7c9f7683231b36c9e2613c30f050909／20261028b的完整一局結果與request／manifest／bundle／作者。Dot自己雲端直接頁1180×757，normal-auto／pause-assisted／固定Sword，無Maker或數值／注入／重開，實際「挑戰成功！」，刺客最佳52.56秒，reload後仍52.56，其餘三王仍—。manual偏好恢復1並reload，自己頁籤已關、紀錄保留，沒有懸停中的局或清理待辦。畫面背景HUD54秒與選單best52.56是不同顯示；不由此推測計時bug或精確暫停扣除。

新直接證據只新增正常自動模式勝利及該筆紀錄存讀，不能冒稱default-manual／完整卡片批准。該局架勢最高讀75，沒有真正break／紅弱點／manual red-window charged；未可靠數出完整4/5刀、跨半血鎖段、影步貼牆與苦無先射後滑；faster-only、精準pause accounting、Boss/Maker map隔離、雙子及剩餘控制／normal結算矩陣仍缺。前幾局HP39／posture88等partial照原件保留，本局數值不混用。verdict仍changes／completed_partial_acceptance，product_defects空，無source／wholePR批准。

主控交現有非作者Mac審查員只讀核對累積矩陣及最少剩餘驗證方法。可控Maker fixture若獲認為適合功能補證，必須明標CUSTOM、列實際欄位與恢復，和normal勝利／Mac default規則測試分層；不擅自把自訂當預設、不默默降低正式卡門檻，非作者Mac已核對正式卡並認可受控CUSTOM診斷與normal勝利／獨立Macdefault測試可分層共同判定，卡片沒有另加每個格都要default-manual通關。已送fixture A：只把共用收招命中recoveryGain12→100（合法0..100），其他初始預設不變，透過真正Maker Play載入全作品；補四個既有試煉Boss×三尺寸實玩／真暈眩、刺客紅窗manual命中、雙子存活者與Maker／normal紀錄隔離。所有改值明標CUSTOM、完成時UI reset/save/reload恢復12及其他改值；中斷則明列pending，不假稱清理。之後fixture B才觀察招式視覺順序，精確數學／跨半血鎖段／較快覆寫／精準pause由既有Mac純規則與真引擎覆蓋，不無限新增真人門檻。這是方法認可，不是已測或已批准；程式仍原b、Mac123PASS不重跑，PR104不merge，正式仍i、boss4/5未開工。

---

## Dot單次收招補驗新增半血證據，仍未完整驗收（最新）

同13851b6fd7c9f7683231b36c9e2613c30f050909／20261028b的收招補件已核對實際原件與綁定。只有一次normal-auto刺客試煉、pause-assisted、固定Sword；沒有Maker／HP／傷害／源碼／儲存注入。HP依序到50／49、最後39%，確實曾低於半血；架勢峰值88%、退出時44%。E與auto劍混合輸出後有淨架勢增加，不能分離歸因成E單次12，更不能稱E有22 interrupt。主動經王冠／試煉選單退出，沒有勝利或死亡終態、沒有成功紀錄；未量到活動時間，不用牆鐘推算。manual偏好已恢復1並reload，自己的頁籤已關。

仍changes／incomplete_evidence，無product_defect。低於半血觀察不等於已驗完整五刀或跨半血鎖段；真break／取消／紅弱點manual蓄力、完整招式與勝利／紀錄、雙子survivor及剩餘矩陣仍開放。前兩份原partial與Maker／有限三frame幾何PASS保留，Mac123PASS不冒充雲端；PR不merge、下一卡不接。

前次任務由主控限定為收招觀察，所以Dot取到部分觀察後依指示退場。下一階段應是一局完整勝負驗證：不因中途HP／posture里程碑退出；如果工具預算／能力需中斷，暫停、釋放按鍵並保留自己隔離測試頁與續測線索，誠實記錄未完成及偏好清理待辦，不自行銷毀進度後重開。終態或最終停止才恢復偏好／清理。這只改操作交接，不改產品、驗收門檻或授權範圍；原已關閉局不假稱能續接。

---

## Dot b補測仍證據不足，尚未通關或批准（最新）

已核實同source13851b6fd7c9f7683231b36c9e2613c30f050909／20261028b的新補測原件與request／manifest／bundle。CUSTOM僅把刺客三招傷害12／18／10改1／1／1練習，未當正常通過；之後UI恢復並重讀傷害／HP1600／4-5刀／.2-3-1.5。一次normal-auto（不是default-manual）使Boss血量由100%到最後可讀57%、架勢最高74%，最終27秒死亡；手動偏好已恢復1並reload核對，沒有成功紀錄、沒有清除其他namespace。

這是有進展的部分證據，不是新bug或整版通過。仍缺真正破架勢／紅弱點蓄力、半血五刀、完整招式順序、normal通關／最好時間、雙子survivor及剩餘三尺寸互動。原三frame有限幾何與Maker五欄保存重置PASS保留，原changes不改寫，Mac123PASS／工程注入不補雲端缺項。Dot指出snapshot決策與實際.2遊戲秒閃避窗未同步；不追加同樣盲打。Luna只讀已核實固定Sword的收招命中每次加12、每秒衰減6，可累積真正架勢；E只有在收招命中才可能加12，不會中斷或加22。一般模式選Hammer的建議因試煉入口固定Sword已排除，不能當可執行方案。主控只追加一次同候選normal-auto收招路徑驗證（不改Maker或難度），嘗試有新來源依據的操作；若仍無直接證據保留未通過，不追加同樣盲打。產品與驗收規格未改。

PR104維持peer_review、不得merge，正式仍i、下一卡未接。交接與卡片更新先本機保存以維持候選HEAD，公開PR另留摘要；原始交換、日誌及操作細節仍在私有儲存。沒有重跑未改動的全套或新增CI。

---

## Dot b雲端部分通過，仍changes／incomplete_evidence（最新）

已核實本次真Dot雲端結果、source13851b6fd7c9f7683231b36c9e2613c30f050909／20261028b及公開manifest完全匹配。三種真iframe尺寸／canvas與上方雙子HUD幾何有直接證據；1024／740有部分實際操作，1180×820外頁裁切需上下分看，不能冒充原生fullscreen／完整互動矩陣。五項Maker UI修改／保存／reload／重置／reload已PASS並恢復.2／3／1.5／4／5，其他王未變。

仍缺全卡：兩次default manual刺客只HP100→99／98，未確認半血五刀、真破架勢與紅弱點蓄力、完整影步／苦無流程、normal成功通關／最佳時間存讀、雙子存活者更新。這是證據未完成，Dot未列產品缺陷；Mac123PASS／工程78筆不冒充它。主控安排只補缺項：隔離Maker低正傷害演練輸入／閃避節拍，參數、正常玩法、實際通關與未測分開；恢復後再正常測，不能把降難度當default通過。原changes結果不覆寫，獨立Mac核實剩餘矩陣後才finalgate。PR104不merge，boss4／5不接；源程式未改，不因證據不足亂修或重跑無關全套。

---

## PR104 b固定測試版已公開並送Dot雲端驗收（最新）

source13851b6fd7c9f7683231b36c9e2613c30f050909／20261028b已Luna及非作者Mac整PR code_ready，雙方Mac完整--layout exit0／73test檔／123PASS／161hash一致。新固定測試頁：https://stasischen.github.io/erin-preview/pr-104/13851b6fd7c9f7683231b36c9e2613c30f050909/games/survivor/ 。preview commit ec7e7bc0f6966a3bd463941cc3156369d1b39b71，既有Pages run40560933832 success，manifest ce77806f5c2bf42fe084e01eb10b8c238536bfe281b025a3e5ce6ff3003c57b9；全285檔HTTP/hash符合、舊215檔不變，未公開的a未混入。

Mac私有injected真Chrome78筆幾何及30筆真正normal勝負結算清除追蹤通過，未在結算後手動refresh來過測；七key A/B、紀錄/reload、SW/cache隔離也通過。這些是部署工程，不能當Dot雲端實戰。已將精確候選交既有Dot自己雲端，驗三尺寸、刺客全卡、成功通關紀錄與Maker五欄位保存/重載/重置；Dot是HP作者，其UI測試不取代Luna/非作者Mac code approval。原生常設隔離試玩範圍已確認，不重問。

等待Dot實際結果；未正式approve／merge，正式站仍20261027i，boss4／5未開始。本交接更新先本機待提交以保持送件source HEAD不漂移；PR說明與本機私有索引亦留發布/送件證據，後續依規範隨授權分支提交，不能因此直接改main。

---

## PR104 b正常結算補件已Luna獨審／精確套用，123PASS待重新工程與雲端（最新）

Dot以842f021183223a7b7b961bd61d9c81b6a975fb82為base的結算補件SHA256380960603244a4c541b9ad9be79f30b81350cfc9ce05bc82cffc675dc4226508，只改ui/levelup.js的一個非暫停showOverlay後HP刷新接點及既有boss-hud測試。Luna先驗同一新test在舊產品因teacher genuine end hides stale DOM失敗、加精確patch後通過，再對真repoexactapply核兩postimage；公開本人紀錄luna-normal-end-patch.md。沒有修改時鐘／紀錄／難度／戰鬥；Maker的獨立finish分支未改，不宣稱該分支已實測。

Mac機械版本20261028b、完整node games/survivor/tools/test.cjs --layout exit0／73test檔／123行PASS／161檔測前後hash一致，diffcheck通過。原a的122PASS／42Chrome幾何與normal結算finding保留，a從未公開；不能算b的真Chrome或Dot證據。接著對本新提交生成固定預覽、重測真Chrome三尺寸normal loss/win/pause/restart及trial end，既有非作者Mac整PR重審、Dot自己雲端整卡／Maker全驗收後才原PR merge。正式仍i，boss4／5未開工。

---

## 842候選工程幾何通過，normal結算殘留觀察待Dot補件（最新）

固定842f021183223a7b7b961bd61d9c81b6a975fb82／20261028a的A/B部署隔離與七key回歸通過，真Chrome injected工程42筆三尺寸HP幾何通過；這仍不是Dot雲端實測。另3尺寸皆捕捉normal老師失敗結算的舊HP DOM未refresh：實際finishRun(false)後mode over、資料entries空但畫面hidden仍false，留在暗幕後，不擋重試；試煉trialMenu清理正常。靜態看為既有結算流程遺留，未冒稱新回歸或已實測origin/main。

主控暫停發布842候選，交Dot判定與最小顯示刷新／實際transition回歸patch，再Luna審查後Mac套用測試。具體允許範圍小幅增加engine/loop.js或ui/levelup.js中normal結算顯示刷新接點，不改時鐘／紀錄／戰鬥；原HUD與test可調，超出須另說明。公開候選尚未發布、正式仍i；原122PASS／161hash／Luna首patch批准仍只對842受測內容有效，不跳過新實質修改重審。

---

## PR104血條patch已由Luna獨審／精確套用，122PASS待固定預覽與整版驗收（最新）

Dot邏輯patch以base9ae7e85ef8aadd33dab6458746e596c3cafa2ead／SHA25655fa253feb96798966e3daf1eb0bef8c0b737b13f1daf76ff410112058c8d777綁定，由Luna本人先在私有快照獨立審查，再在Mac精確套用五檔且postimage全符；公開審查見coord/reviews/survivor-boss-gallery-3/luna-patch.md。移除試煉Boss身體HP條、改共用上方HUD，冰火雙子各自HP與身份可分辨，保留身體弱點／架勢和原玩法；沒有私修Dot邏輯。

版本由Mac機械同步20261028a，完整node games/survivor/tools/test.cjs --layout exit0，73個test檔、122行PASS（含新boss-hud和真Chrome layout），161個source/test/cache測前後與目前一致；機械版本差異七檔另記，流程文件另列。這不是三尺寸BossHUD已量測或Dot雲端正式通過。下一步發布不可變候選，既有非作者Mac對整PR104重審，Dot自己雲端驗新候選的三尺寸、刺客完整卡片功能及Maker；所有gate通過才原PR merge。正式站仍20261027i，boss4／5未開工，舊j/k證據不混算。Godot§11：共用資料／渲染分層與資產路徑保留，未作Godot實機。

---

## 新流程已獲具體ready並啟用；血條patch進Luna獨審（最新）

Dot已針對固定base9ae7e85ef8aadd33dab6458746e596c3cafa2ead確認ready，完整讀取14個源並交回5檔精確血條patch。其approve僅允許進獨立審查，不是自審code或UI／PR／合併通過。主控已核對12960byte patch／SHA256、5檔pre/postimage與私有index精確apply，真實worktree尚未套用。Luna已接獨立審查，通過後才交筆機械套用；有問題原樣退Dot同卡修，不讓Luna發明邏輯後自批。

依家長條件授權已同步AGENTS／GAME_WORKFLOW／決策與詳細新流程；本次文件先保留未提交，避免改動Dot綁定base，等patch處理後與同PR指定檔案提交。Mac測試與公開固定候選／Dot雲端三尺寸實測仍未完成，既有非作者Mac保留整PR104最終gate。正式站仍i，PR104未合併，boss4／5未開始。舊待評估或授權pending段落依當時歷史保留，以本摘要為準。

---

## Dot首評已核實，試接輸入與Mac角色已補齊（最新）

Dot實際首評changes：概念分工可行、可讀固定源並產生patch文字，但缺精確HP允許檔／驗收及Mac角色就緒，不能當流程已導入。已補coord/tasks/specs/survivor-boss-hud-pilot.md，同PR104不開並行新卡；只改HUD顯示與有意義的回歸測試，版本另由Mac同步。獨立Luna已實際完成只讀就緒檢查並可接審查／精確apply；目前沒有patch可審或套。既有Mac審查員定點確認l Maker數值控件P2及舊smoke更正收斂，完整121PASS仍是作者證據，完整整版審查留最終組合SHA。

另已讀到Dot原生補件：家長常設授權包含後續隔離候選的完整正常試玩，舊Maker-only範圍缺口解除，不再重複詢問；實際平台檢查仍適用。舊j不完整證據、k控件changes均保留，不倒填PASS。以下授權pending句子只代表歷史當時狀態。本輪無程式修改／新遊戲驗收，正式站仍i、PR104仍未合併。

---

## 主控新流程提案待 Dot 評估（最新，優先於下方歷史）

家長明確指定：主控開卡，Dot提供精確patch，Luna獨立審查後在Mac套用測試分支，Mac跑完整測試與處理Git／PR／預覽發布，Dot驗公開測試版，通過後由Mac非作者角色合併。已寫成 coord/knowledge/DOT_PATCH_WORKFLOW.md 的draft並送Dot評估；收到實際ready結果才導入，不把概念同意當工具／原生授權已具備。Dot不需GitHub寫入權，Luna不能猜補patch邏輯或自寫自批，不新增排程／模型輪詢。

weakpoint PR103已合併上線；PR104目前l Maker修正HEAD8bacd68e2d776fa6952e52122aaf85d65e49c554、作者Mac完整含layout121PASS／160hash／真Chrome五參數回歸通過，作者已停筆，待專項確認與最終整版驗收。家長新回饋確認是Boss／刺客血條遮擋中央，將於流程ready後作本PR小修試接：固定上方、避開玩家HUD、兼顧雙子；目前尚未修改血條程式。正式站仍i，PR104未合併，boss4／5未開工。這份提案與進度由主控暫存，私人交換識別與原始回覆仍只留本機。

---

## 當前：PR104 l Maker 修正待重審（優先於全部歷史）

- 本輪 `20261027l` 只修新 sequence.phaseCount 的1～8數值控件與舊0／1布林同名碰撞，Boss預設／難度不變；真Chrome五參數UI保存／重載／重置回歸已通過，Mac完整含--layout已exit0／121PASS、160檔hash一致，受測修正SHA `ab260aa8d96090656a8c168d60a2a9a2c595e941` 待同PR重審（最新HEAD另含純交接提交）。
- k候選的215檔發布／119PASS屬下方歷史；該候選Maker在基線發現後半刀數錯畫switch，Dot未修改／保存，所以沒有清理動作。原review及原始結果保留，不把k code_ready或舊API smoke當本次UI通過。
- Maker草稿常設授權已由Dot自己的可信原生對話確認；每次仍核對PR／完整SHA／namespace並清理。普通gameplay原生範圍澄清仍pending，不重複索授權或繞過；本輪實作者不送Dot。
- 正式站仍20261027i，PR104未合併；boss4／5未開工。家長曾短暫回報開始按鈕無反應，隨即自行確認可操作；原因未定、未為此改碼。
- 下方舊「目前／未開工／已完成」等章節依當時狀態保留，以本摘要及最末修正SHA為準。

## 歷史：k 候選發布與授權快照（原主控更新）

PR104 的 20261027k／e396d9ebcf6afbdd0acd7170bb120fdc1733b1b8 已獨立重審 code_ready，原方向鍵放開 P2 已關閉；Mac 完整含 --layout 雙方119 PASS、160檔hash一致。尚未approve／merge；正式站仍20261027i，boss4／5未開工。

新固定候選：https://stasischen.github.io/erin-preview/pr-104/e396d9ebcf6afbdd0acd7170bb120fdc1733b1b8/games/survivor/ 。preview commit13b9d16f607c11dda7e8c927b2f6eddc8f019f83，Pages run40539336971 success，manifest SHA2567eaa2f2c3c93f710bd44d0f3b7f9748a2013a1e8935d5e1da418a5209c056786；公開215檔HTTP/hash核對通過，舊145檔與歷史候選全部保留。這是發布工程證據，不是Dot k戰鬥驗收。

家長已給所有測試版隔離Maker草稿常設修改／保存／重讀／恢復預設授權，Dot也以自己的可信原生對話確認包含後續版本、無須逐候選重問；不含正式站／原作品／repo程式碼／安全設定／合併。舊j Maker補件已真實完成清理，但不算k證據。新k的Maker五參數保存／重載／重置／重載已獨立送件，僅Maker UI，不重試被拒的遊戲操作。

一般試玩仍受Dot原生工具範圍限制：其自動審核曾以Maker-only拒絕下一次繼續遊戲，Dot已另向家長提出正常試玩／移動／攻擊／衝刺／暫停續玩／必要重試的直接確認。主控不重複發問、不繞過拒絕；普通gameplay範圍未確認前不派k完整戰鬥。舊j三次失敗及兩次pause-first cycles都保留changes／incomplete_evidence，沒有勝利／halfHP／真破架勢證據，不能混算為k通過。私人原始結果、交換ID與session對照仍留本機。

---

## 當前摘要（優先於下方歷史，2026-10-28）

- 目前是 PR104／survivor-boss-gallery-3，`20261027k` 修正既有方向鍵 keyup 鍵名配對，Mac 全套與實際輸入 smoke 已完成，受測修正 SHA `016802981eac2f80f14fa19b7fcdb236777cdb74` 待重審（PR 最新 HEAD 另含純交接提交，仍須核對）；不是刺客新增回歸，不能據此推論 Dot 陣亡原因。
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


### k 版受測修正 SHA

`016802981eac2f80f14fa19b7fcdb236777cdb74`／`20261027k`，PR104 同分支。之後僅更新本交接及卡片 SHA／狀態，160個受測程式／測試／快取檔保持逐byte相同；重審與後續公開候選應鎖PR最新完整HEAD。實作者已完成本次必要提交／push交接後停筆，由主控安排重審與新候選，不把舊j結果當k驗收。


## PR104 l：Maker 後半場刀數修正交重審

- 版本20261027l；range helper僅對實際0～1 bounds的舊phaseCount建立布林switch，新sequence.phaseCount的1～8維持原數值滑桿與加減事件。不改schema、Boss預設、難度或新機制。
- production-renderer事件與真Chrome DOM/AX均驗：baseline後半場slider=5、min1/max8/step1；input到7→點增加到8，再前半場設7；刺客護甲0.25、弱點4、蓄力額外1.8，UI存檔→整頁reload重開五值皆在；UI恢復預設（自動保存）→reload回4/5、0.2/3/1.5。老師／守門人保留原值，舊0/1開關及其保存行為不變。沒有直接修改draft代替UI。
- Mac完整 `node games/survivor/tools/test.cjs --layout` exit0／121行PASS、`git diff --check` PASS；160個程式／測試／快取檔測前後SHA256完全相同，舊frozen基準未重生。完整log與原始證據留本機，這是Mac工程證據，不是Dot對新固定候選的正式驗收。
- 更正先前「7刀／1.8工程smoke」：當時工具直接構造後半phaseCount7（前半4）與倍率1.8，保存API→新Maker VM載入→startTrial後讀definition。只證明資料／API接合，沒操作Maker控件、沒驗前7後8五參數循環、也沒實際打出七刀；先前未標明層次，回報範圍過寬，於此窄化。原對話工具輸出及一般UI原JSON不重寫，不補造前輪raw。
- k候選215檔發布／119PASS與Maker基線changes均保留歷史；Dot在基線即停、沒修改／保存，所以無清理。Maker原生常設授權已確認，普通gameplay原生澄清仍pending；不重問或繞過，不自行送Dot。正式站i、boss4/5未開工。


### l 版受測修正 SHA

`ab260aa8d96090656a8c168d60a2a9a2c595e941`／20261027l，之後只有交接及卡片狀態的純metadata更新；160個受測程式／測試／快取檔相同。正式重審及新候選仍以PR104最新完整HEAD核對。實作者完成同分支push後停止寫入，不自行審查／合併或送Dot。
