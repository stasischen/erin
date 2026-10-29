# 目前交接

## 校正：共享 Lingo coordinator 正在每 60 秒輪詢；Erin 尚未接入（2026-10-29T10:08:20Z）

- 本機只讀核對到 `com.stasischen.lingo-coordinator` 的 launchd job 為 `running`、週期 60 秒、last exit 0；家長確認設定來源為 release-aggregator PR #411 與 lingo-agent-exchange PR #1，部署版 `41b52b4`。這是共享 Lingo coordinator，不是已停用的 Erin 專屬 `com.stasischen.erin-watch`；先前「舊 Erin watcher 停用」沒有錯，但不能推論 Mac 上完全沒有輪詢器。
- PR #443 `codex/prod-cross-project-resume` 目前 open，published HEAD `5a785cef367444e0a4d1f026f9654088c9d4bebf`，default-off ledger/CAS 有 Lingo 與 synthetic adapter；尚未把 verified exchange result 接進 result adoption、原始專案 thread routing 或 started proof，也未部署。既有 60 秒 coordinator pass 可作 Erin 新 adapter 的事件入口，不需要先建公網 webhook；但單純加 PR #2 到 sources 清單仍會錯送既有 manager，不能自動續回 Erin。
- PR #2 synthetic `dot_exchange_client` request 已在 PR105 source `a3d314c` 上人工 `find`／`receive` 成功；不代表自動接續。已將 Erin 綁定需求送給正在做 PR #443 的 session：在現有 deterministic poller 上加入 explicit Erin adapter/PR #2 allowlist、validated result→shared CAS→exact Erin thread，queue receipt 與實際 started evidence 分開；維持 default-off，不切部署設定、不動 launchd。
- 推薦先重用現行 60 秒 poller做離線整合與 Erin/synthetic replay，再經獨立審查才開 Erin 單專案 canary；目前不另建 push ingress、不更動線上 sources。若之後仍要求 webhook push，才需要 HTTPS endpoint 與簽章 secret 基礎設施。

## Erin PR #2 標準 client round-trip 已人工收件採納；push receiver 缺入口（2026-10-29T10:03:13Z）

- Dot 在 PR #2 回覆標準 result revision 3 [#6493667041](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6493667041)：request、PR105 source `a3d314c180bfccea23a380ed86a4b709fee55528`、manifest/bundle hash 全匹配；coverage 陣列及 canonical manifest 通過來源 parser。內容是 synthetic `label(0)` 回傳 positive 的 `changes` finding。Mac 對相同固定 SHA 執行來源 client `find`／`receive`，已寫入 repo 外私有測試 workdir 的 `review.md` 與 `adopted.json`；PR #2 direct request 先於 #411 pointer 到達，沒有重複執行。這僅接受合成路由測試，不是遊戲程式 approval。
- 房間流程已證實：PR #2 獨立 webhook 能喚醒 Dot，來源 client 綁 `rooms/erin.json` 可發布、人工 `find` 並驗證／採納標準結果。尚未證實來源 Codex session 自動接續；client 明確無 auto-poll/wake。
- 家長選擇 push receiver。只讀盤點發現沒有既有公網 ingress、tunnel 或 GitHub repo hook；要實作仍缺可到達的 HTTPS endpoint、GitHub event 註冊／簽章 secret 儲存，以及 receiver 到來源 thread 的授權固定綁定。家長已被詢問要提供現成 endpoint、授權新 hosting/tunnel 規劃，或暫維持人工；未取得入口前不部署、不恢復 launchd、不建立 credentials。
- Boss HUD 設計已確認維持浮層，warning 可超出畫面；這解除「預警必須完整在視窗」的設計限制。HUD 實作仍等 Dot 精確 patch/Luna 獨審，未由主控改遊戲程式。

## Push 自動接續方向已選；尚無可用外部 webhook 入口（2026-10-29T10:02:32Z）

- 家長選擇建置 push receiver，不恢復每分鐘 polling。獨立盤點 Erin、release-aggregator、agent-coord-kit 與 GitHub repo hooks 後，沒有既有 inbound webhook/tunnel/public host：release-aggregator 只有每次 coordinator pass 的 REST polling；kit 的 inbox polling 預設關閉、ntfy 僅 outbound；四個相關 GitHub repo 均無 repository hook。未檢視任何 secret 值，也未新增 hook、服務或帳號。
- 要讓 push flow 真正可用，仍需明確提供／授權一個可從 GitHub 到達的 HTTPS ingress、GitHub webhook event 註冊方式與簽章 secret 存放路徑，以及本機 receiver 呼叫 Codex queue 喚醒 Erin source thread 的授權與固定 thread binding。只建本機 HTTP listener 無法接收 GitHub 外部事件；GitHub Pages 是靜態站，不能當 webhook receiver。
- 目前可安全交付的下一步是先確認現成 ingress 或由家長指定可使用的 hosting/tunnel 與 secret 管理方式；取得後再把 receiver 的精確 patch 派給 Dot、交 Luna 獨審，Mac 套用及驗證。未取得入口前不部署、不修改 auth、無 GitHub Actions CI、source session 仍人工 `find`/`receive`。

## 家長確認 HUD 浮層可保留；標準房間回程被拒，source 自動接續需另定喚醒方式（2026-10-29T10:00:34Z）

- 家長確認 Boss HUD 維持浮層，預警提示超出畫面可接受；不再要求為所有方向／位置保證 tell 完整留在可視區。PR105 的 HUD 設計阻塞已解除此項產品政策問題，實作仍須照 Dot patch → Luna 獨審 → Mac 精確套用與完整測試，不能由主控補寫新邏輯。
- 標準合成房間結果 [PR #2 #6493384194](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6493384194) 正確辨識零值缺陷並綁定 request/source/manifest/bundle；但 `coverage` 回傳為 object，Mac `receive` 依現有 schema 拒絕（`result coverage must be a non-empty list`），因此尚未採用。已在 [PR #411 #6493631777](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6493631777) 要求同 request 僅修正 metadata：coverage 改一列 array，附 canonical manifest preimage，不重做 fixture review。PR105 source SHA 仍 `a3d314c180bfccea23a380ed86a4b709fee55528`；修正結果須先在此 SHA 用 `receive`，完成後才可提交本 handoff 變更。
- 獨立只讀檢查確認：release-aggregator 的 inbox 目前由 coordinator pass 呼叫 GitHub REST polling，run-once 文件預設每 60 秒；無 inbound webhook listener。結果驗證器只把結果落地，frozen request 沒有原始 source thread 綁定；agent-coord-kit 的 Codex thread queue 需本機 coordinator 主動呼叫，亦無 GitHub event receiver。舊 launchd 依家長先前指示保持停用，未恢復、未新增排程、未改碼。
- 自動接續缺的不是 Dot webhook（PR #2 新 comment delivery 已獨立驗證），而是 GitHub 結果事件抵達 Mac 後，安全驗證並喚醒對應 Erin Codex session 的 push receiver／授權執行點。需先由家長指定是否允許恢復既有 60 秒本機 polling、批准新 push receiver 所需基礎設施，或暫時維持人工 `find`／`receive`；目前沒有已授權的事件入口，不宣稱自動續接已完成。

## Erin 房間 PR #2 接線：獨立通知已驗證，標準 client 回程待完成（2026-10-29T09:44:53Z）

- 直接在私有房間 PR #2 發送合成通訊請求 [#6493131098](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6493131098)，沿用 Dot 指定的 request ID `dot-erin-room2-transport-check-20261028`、event ID `mac-erin-room2-transport-check-v1` 與 nonce `ERIN-ROOM2-20261028`。Dot 在同房回覆 [#6493165491](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6493165491)，回顯皆相符，回報 PR #2 `issue_comment/created` webhook delivery `f1a1b1a0-d37b-11f1-90d2-0d83b96dbab3`、非 PR #411 relay、非人工巡檢；這證實該次新房間事件獨立通知到 Dot。
- Erin Mac coordinator 以一次定向 `gh api` 讀回並人工核對後，在 PR #2 留來源收件回執 [#6493232888](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6493232888)。採用範圍僅限通訊回執；來源 session 自動喚醒未驗證，duplicate/recovery 未測，不代表正式程式審查或任何產品批准。
- 純通訊回執不符合來源 client 的 `kind=result`／request、source、manifest、bundle 綁定 schema，因此另以 `stasischen/erin` PR105 HEAD `a3d314c180bfccea23a380ed86a4b709fee55528`、`docs/tasks/DOT_SOURCE_CLIENT_20261027/rooms/erin.json` 凍結隔離 synthetic fixture，綁定房間 PR #2。標準 request `b4b48c859dddff9261246f84cede7beff233528f1d36a3f198d6851825619b74`（manifest `6f46192db67b460d96ff9d6048554844fcd3d50656bf88f9f6f34e5c5faf45d0`；bundle `4921dedf51799783412170adb4800ea62db30edffce370ead435b449232cd8a9`）已發布於 [PR #2 #6493248556](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6493248556)。只含零值標籤的固定小缺陷，不讀 Erin source、不執行程式、不改 repo、不做瀏覽器或產品審查。
- 來源 client 的一次性 `find` 尚未看到符合標準 marker 的結果；已按 rollout 在舊房 PR #411 發出僅含固定 URL／hash 的通知 [#6493299880](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6493299880)，要求 Dot 把標準結果回 PR #2。等待結果期間不重發、不把任何 PR105 frozen request 移房。正式 client `receive`、來源自動接續、duplicate/recovery 仍未驗；PR105 目前仍 draft、HEAD 未變。收到標準結果後先在此 source SHA 上用 client 精確 `receive`，再依結果更新正式任務及交接；不新增 scheduler 或輪詢。

## StoneHands slice independently approved/applied, full Mac128PASS (2026-10-28T05:58:26.429184+00:00)

Dot full replacement47577bytes/SHA256 fc665a8ff81640dba645d2c6c7d39e6802369b82ec3a561980f814a7e476d4e3 at base529078cea6200ced9d9382073e403db5dca3bef0 includes exact19path scope,16changed paths. New canvas fixture supplies valid dimensioned transparentPNG dataURI and retains drawCalls; no pixel acceptance inferred. All prior15production/test/art postimages matched the corrected priorproposal; only helper added. Canonical result received from actualGitHub, onlyauthorproposalready. Late priornotifications reconciled, unrelatedLingo tasks untouched.

Luna independently approved r4, privatechecked then exactly applied to source,16/16postimages/bytes match; targeted10/10 exit0,14JS/CJSsyntax and generatorAST pass, diffcheckpass. Public review coord/reviews/survivor-boss-gallery-4/luna-stone-hands-r4.md. Core guarded/open/closing render contract, true target warn/hit/dodge, alternating limbs, interrupted-state cleanup, actualmanifest menu crop/load/error/reopen, Maker controls and legacydata regressions verified in that scope. Prior r1/r2/r3 changes and real failure logs remain, not rewritten approve.

Root separately mechanically bumped internal20261028d, verified onlyc->d resourceversions/cache plus newmanifest PNG precache; full Mac node games/survivor/tools/test.cjs --layout exit0,74testfiles/128PASS/164files before-after identical. Full logs/hash/provenance private. First new real selectable Boss is implemented at defaults5; Eye/Mask are absent, not stubs. Automated realChrome/layout is not Dot cloud gameplay; wholecard/UI/defaultmanual difficulty is not accepted yet.

Commit/push this coherent slice, then repin actualfullSHA to Dot for RollingEye; Mask follows, samecard/branch. Preserve Stone+original4 and oldsaved1/3/4 edits, keep future7fixtures clearly synthetic. Only after all3Bosses and fulltests pass create onePR/immutablepreview, Dot self-cloud3sizes, nonauthorMac finalgate/merge/Pages/versionverify. No currentPR/candidate, productionstillb, boss5unstarted. Godot11 applicable data/pureblocks/serial events/16px source and worldcoords/tests addressed, no runtimeport/audio exports claimed.

---

## StoneHands r3: corrected hit-stop test, shared canvas fixture gap (2026-10-28T05:15:54.486274+00:00)

Latest exact53709byte patch / SHA256 6b18ab254381569325be1556019d90215e6632ec1f0fe4fb7f059c9a5fac692f at A434 base explicitly supersedes the earlier menu proposal after sanitized real Mac runtime evidence. Only test postimage changed from ed095; all production/menu/core/PNG bytes match prior static review. Root selected the corrected canonical result for formal receive; earlier result was held, not falsely approved or applied.

Luna r3 review: coord/reviews/survivor-boss-gallery-4/luna-stone-hands-r3.md. Private exact archive/15postimage test shows four suites blocked by shared tests/maker-support.cjs canvas element lacking toDataURL: Boss4/Boss2/Boss3/weakpoint-combat, with6other targeted suites passing.13JS/CJS syntax and generatorAST pass. This is a test DOM API gap, not evidence that browser PNG export is broken; no source apply/fullsuite/layout/cloudQA. Source stayed clean throughout except Luna's new review. Prior scratch a010 hitstop failure was real and preserved, followed by corrected independent test scenarios; no production freeze removed or damage expectations weakened.

Controller authorizes the single exact helper path as19th allowed path, with fresh source/hash manifest. Dot must supply the fixture change in a full replacement, preserving production frame cropping, all old assertions/golden and meaningful separate menu regression; no local controller/reviewer fix. Keep source c/migration124PASS/162bytes unchanged for this coordination-only commit, then rebind actualHEAD. All private logs/raw/scratch stay outside repo; this safe summary is committed. Eye/Mask and wholecard PR/preview/actualDotQA still pending; productionb.

---

## StoneHands r2 full static review: core fixed, menu frame still changes (2026-10-28T04:52:39.180817+00:00)

Exact replacement48097bytes / SHA256 a0104291930d2364f7d63bbbadeefbaeaa9a3bc9b8874b009b5a277ffc8c3839 at base df5670d54209985633aa6ba254e29974090cfea3 remains an author proposal. Luna batch-reviewed all14 changed files and confirmed core/closing exposure and render ordering fixed, with no other static blocker found. Review: coord/reviews/survivor-boss-gallery-4/luna-stone-hands-r2.md. No application, code/tests/generator execution or browser acceptance occurred.

Remaining blocker: trialMenu feeds the full48x16 three-cell sheet to an84x84 img, stretching body plus both hands together. Dot must select the manifest frame or equivalent correct image and add real menu-frame regression; engine/gallery.js is already within18 allowed paths. Root does not author the fix. Next full replacement must bind the actual new coordination-only HEAD and receive independent review again.

Game remains migration-only internalc with prior full74testfiles/124PASS/162unchanged hashes; production stillb, no boss4PR/preview, Eye/Mask pending. Review was committed first as b34aaa8; this followup completes controller card/handoff metadata after an input encoding failure, without rewriting history or changing game files. Full private records and old reviews preserved.

---

## StoneHands提案獨審changes，未套用，退回Dot修正（2026-10-28T04:22:41.883600+00:00）

完整提案41,696bytes/SHA256 ce777cee22c215cfe1ad69f14d2095a102257b35da5d1ab178c1380b0646cf0b，13text加原創48×16三格PNG。主控核過完整來源/preimage/patchbytes/hash/18path與PNG exact256bytes/hash；合法收件只代表作者提案ready。Luna另獨審在base d4542b73968cc1940bcd60e8ecaa7518307a2f5a判changes，見coord/reviews/survivor-boss-gallery-4/luna-stone-hands.md。

阻擋：攻擊手windup舉起時另一隻手仍在home守位，實際圖塊遮住胸口；弱點系統卻在windup開core，上層紅標不代表核心露出。新測試只看倍率/姿勢高度，沒有驗證曝光。Dot須修正清楚可見的曝光姿勢並補兩手/核心窗口的幾何或呈現回歸，含窗口起迄，不讓提示蓋住遮擋就宣稱通過。Root/Luna沒有代寫修正。

此次完全未套用提案，也未跑提案測試/生成器/瀏覽器。遊戲仍migration內部20261028c、先前完整74test檔/124PASS/162hash；目前162檔全相同，只有本公開review/卡/handoff新狀態，不無意義重跑或升遊戲版。正式仍b，無boss4PR/候選。接著以本次新實際HEAD重新綁Dot完整修正版，保持同卡/同分支，舊提案/審查/raw不抹除。過期原始migration通知已對照後來重綁/獨審/全測提交處理為歷史，不重複套用。

---

## boss4增量1完成：僅資料遷移，三王仍待實作（2026-10-28T02:58:52.107634+00:00）

Dot原生已實際承認作者授權並交精確7931-byte patch，SHA256 8ff56592199f582070c7797a5efc5e317de8adf2445983235e1310d9f0fa6ab2，綁base68e2a8e0528658c3bec0d1b91810c27d47255849；標準回件已收，僅code_patch_proposal_only、wholePR=false/card_complete=false。source讀取與hash/語意範圍有分列，不冒稱全部語意看完；原scope-only失敗與未發布prepare歷史保留。

Luna非作者獨審後只精確套用schema.js與新boss-gallery-4.cjs；pre/postimage/bytes完全相符，相關舊2/3與新migration測試通過，紀錄coord/reviews/survivor-boss-gallery-4/luna-migration.md。這段為已知ID的1/3/4王存檔遷移、保留編輯、重排、錯誤拒絕/冪等/不改原件；synthetic7只是測試fixture，沒有把三個新Boss塞placeholder上線。Root沒有代寫邏輯。

Root接回pen後機械升內部版20261028c，同步?v=/sw；完整node games/survivor/tools/test.cjs --layout在Mac exit0，74測試檔/124PASS，162檔before/after完全一致，gitdiffcheck通過。版本生成差異另核僅舊b→c。完整logs/hash/來源原件留repo外。尚無本卡PR/公開候選，正式仍20261028b，沒有把此增量當Boss4功能或Dot雲端驗收通過。

下一段同卡由Dot實作石像雙手，之後眼方塊、面具；每段以實際新提交重新鎖來源，Luna重審再套，Mac每次實質程式增量全測/升版。主控已找到舊gallery-2/3測試固定總數4及pop語意問題，下一請求會明列這兩精確路徑可修改，但保留舊1/3/4王自訂資料migration與原四王行為/紀錄的真回歸，不削弱測試。全部三王完成才開唯一PR/隔離預覽，再Dot自己雲端三尺寸功能操作、非作者Mac finalgate/merge/Pages。boss5未開工。

---

## boss4恢復派送：家長回報已完成Dot原生作者授權（2026-10-28T02:38:56.074841+00:00）

家長已回報完成前述原生確認，主控恢復doing、waitingFor清空，依最新實際HEAD重新建立同卡successor request。Dot負責完整三王程式patch文字提案；Luna不同session獨審及精確套用；Mac負責完整測試/版本/Git/PR/隔離測試站，Dot自己雲端實測，非作者Mac最終審查/合併/Pages。未授予Dot直接repo寫入/PR/merge/安全設定。原生scope仍由Dot實際核對，不拿repo聲明冒充平台設定。

原scope-only changes及不合法coverage object保留，不改raw或假採納；新正式回件要求合法非空coverage list、字串gate_review、來源/manifest/bundle與patch/pre/postimage綁定。現在仍無boss4程式或PR；下一步等真正patch後獨立審查，而非再評估是否啟用流程。boss5未開工。私人原話/原始交換/logs/screenshots留repo外，公開協作紀錄正常commit在本工作分支。

---

## boss4等待Dot原生程式提案作者範圍確認（2026-10-28T01:49:41.699448+00:00）

家長已直接授權接續boss4及Dot作者→Luna獨審/套用→Mac PR/預覽→Dot雲端驗證→非作者Mac合併；受信任跨session讀取亦核對到人類原始指示。不是缺Mac主控的家長同意。Dot原生回件明確表示當前收件範圍只有技術/內容審查與隔離試玩，不包含承接三個新Boss完整實作patch；要求在其原生對話確認該作者範圍。主控已請家長一次補確認Erin正式派卡的程式提案作者角色；不把既有Maker草稿授權拿來擴權，不改平台/安全設定，也不改叫別的作者代寫後自批。

已送精確公開base0fc5331e8a9b695eb81f77fd416580c6b89a1668、46來源清單/15允許路徑及完整request/manifest/prompt preimage；已回讀一致。回件verdict changes、request_scope_check_only，只讀request，未讀來源/產patch/跑測試/試玩。原始回件coverage是object，不符標準非空list，正式收件隔離；僅人工核對來源與綁定後記錄實際block，不假稱adopt，不改raw。私人交換識別、原始人類訊息與完整原件留repo外。沒有真正工具/平台拒絕。

當前branch codex/survivor-boss4，卡blocked/waitingFor:user，尚無PR/新程式/新遊戲測試；正式站仍20261028b。PR104完工卡與部署交接已在boss4開工commit0fc5331提交並push，不會永遠留本機。此次只提交可公開blocked狀態與路線摘要；原Dot請求仍綁原base，未來授權確認後必須依當時實際HEAD重新固定successor request，不把新patch硬套舊base。下一階段Luna獨立精確審查/套用；boss5未開工。不輪詢、不排程、不自動喚醒。

---

## boss4已獲家長授權開工（2026-10-28T01:37:05.410403+00:00）

正式卡survivor-boss-gallery-4，分支codex/survivor-boss4從最新origin/main a0b10ad63774bc9db8950cfdff6094c169a8d5d9建立，尚無PR。三王：石像雙手／翻滾眼方塊／面具石像，規格見coord/tasks/specs/survivor-boss-gallery-4.md。Root只寫協作與機械作業；Dot是程式patch作者，Luna不同session獨審/精確套用，Mac全測/版本/PR/隔離預覽，Dot自己雲端實測，非作者Mac finalgate/merge/Pages確認。當前唯一寫入者Root；交patch給Luna時停筆。boss5未授權開工。

家長問「完工交接為什麼不commit？」；現行規則是merge後完工／部署狀態先本機與PR留言，再隨下一張已授權分支提交，避免只為狀態改main。本次PR104的done卡及正式部署紀錄即隨boss4開工提交，並非協作紀錄永久不進Git；原始對話、screenshots與logs仍私有。以下「未commit待下一分支」保留為當時歷史，已由本次接續處理。

Godot§11：本卡要求資料驅動、共用純規則/秒與世界座標、可序列化事件、manifest原始像素與可移植輸入/輸出案例；只調三王相關接點，不做全引擎重構/JSON抽離/音訊匯出，Godot未實機執行。預期下一遊戲版本20261028c，Dot patch不碰版本生成檔，由Mac另行機械同步。

---

## PR104已獨立批准、merge commit合併及正式上線b（最新完工）

PR104：https://github.com/stasischen/erin/pull/104 。最終非作者判定approve見coord/reviews/survivor-boss-gallery-3/grok.md；被審內容15b7b4b420de212d5589e2adfc06bbf133137df3，review-only HEAD be0786bc335717a5a9c0ed757e8f6aaf7f6a0a1c，merge SHA a0b10ad63774bc9db8950cfdff6094c169a8d5d9。GitHub API確認MERGED與兩parent，使用精確HEAD --merge，無squash／force／checkout或直接push main。GitHub拒共用作者帳號正式approve，已依規則留不同session獨立判定留言，未假稱GitHub正式approval；歷史changes與各partial不抹除。

該merge的既有Pages run40604882840 completed/success：https://github.com/stasischen/erin/actions/runs/40604882840 。全新暫存profile真Chrome實際開https://stasischen.github.io/erin/與https://stasischen.github.io/erin/games/survivor/，兩頁complete、視察正常，遊戲ready／有效canvas、version20261028b、manifest含trial-blocks；這是上線載入確認，不冒充正式站重打整卡，不清使用者資料。Root另核確切merge tree161個source/test/cache hash全符受測13851b6。正式版本現已b，不再是i。

本版新增雙刃刺客4/5連斬／影步／苦無及紅弱點、每王最佳成功時間；修方向鍵釋放、Maker數字控件、共用上方Boss HP與雙子存活者、結算殘留。Mac雙方完整含layout123PASS／73test檔／161hash，Dot自有雲端normal-auto真勝利52.56存讀、五Maker欄UI循環、CUSTOM A12格stun/redmanual/twin/Maker13.01隔離及B可見鏈路共同經非作者整PR核實；CUSTOM不當default-manual配平，精準數學／時序由預設Mac證據分層覆蓋。A格式重發只換envelope，原件保留。影步active旁文.12與range輔助讀值.1是非阻擋顯示差異，實際資料未被編輯；手動節奏／Erin手感及Godot實機未宣稱驗收。

主控下一步預計boss4，仍等家長意見，boss4／5未開工。新流程已實際串通：主控開卡→Dot精確patch→Luna獨立審查與機械套用→Mac完整測試／Git／PR／固定預覽→Dot雲端實測→非作者Mac finalgate／merge／Pages；未新增GitHubCI、排程、模型輪詢或恢復watcher。GROKBOT恢復後依家長指示交回角色，交付本摘要／卡／審查與本機私有原件索引，不自動切換或接卡。

本次done卡與latest只更新本機、未commit，依流程隨下一個家長授權分支提交；不為寫完工狀態直接動main或推已合併分支。原始對話／交換識別／完整logs／screenshots仍repo外。

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

## Boss4 階段測試版 PR105 已發布（整卡仍進行中）

- 家長同意提早提供石像雙手階段試玩。Draft PR：[PR105](https://github.com/stasischen/erin/pull/105)。候選固定遊戲來源 `2bb7270f8590f34bdaedb3d4d1255fa7cd50326d`／版本 `20261028d`；測試版：[石像雙手](https://stasischen.github.io/erin-preview/pr-105/2bb7270f8590f34bdaedb3d4d1255fa7cd50326d/games/survivor/)。
- 候選 manifest SHA-256 `888f7bad4ddea1a36109f26dbbe3d088ef500b7df6c1a07d15d37c9725b16699`。Pages publication commit `5ddd531cf975b009bad35780491e3fff1263cc47`／run `40642665228` completed/success；線上舊285檔及新增71候選檔共356個HTTP200與SHA-256核對一致，舊檔和四份既有manifest payload完整未變。Mac隔離發布工程A/B驗證通過。
- Mac Studio來源 `node games/survivor/tools/test.cjs --layout` 已在固定程式SHA通過（exit0、74測試檔／128 PASS，164個程式／測試／快取hash一致），`git diff --check` PASS。只有Pages部署，沒有GitHub遊戲CI。PR保持draft；石像雙手是三Boss卡片中的第一個階段，翻滾眼方塊及面具石像未完成、未進此候選，正式站仍為 `20261028b`。
- Dot的PR105雲端三尺寸階段實玩已送，尚無結果；Mac工程／HTTP驗證不冒充Dot實玩。PR的測試版SHA、manifest及發布commit見PR描述。
- 下一步：保留目前候選讓家長試玩；收到Dot結果後記錄範圍與問題。繼續同卡Rolling Eye patch（需基於最新PR分支SHA重新綁定）→ Luna獨立審查／精確套用 → Mac完整測試 → Mask Statue；整卡與最終獨立審查完成前不merge。


## PR105：收件器漏讀已查明；Rolling Eye 等修正版

- PR105仍是draft，遠端source head `85e22bbfe749aa244b9fa87a46133bd90e3c5a0d`。先前回報「沒有Dot結果」是收件器錯誤：#411留言第一行帶 `recipient=mac-manager`，本機精確比對只接受不含recipient的舊格式，因此靜默漏讀。沒有重送舊request；改從GitHub原留言讀回原文，只在本機normalized副本移除該marker欄位，原始JSON/body保留，兩個結果都通過既有request/SHA/hash validator。修接收器工具尚未包含在 Erin 程式碼變更中。
- Stone Hands frozen 20261028d候選三尺寸補測回 `changes / partial_evidence`：1024×461核心攻擊顯示105、Boss HP 100→95；dash位移三尺寸都觀察到；1024×461有一組警示到撞擊。各尺寸連續左右交替且身份與impact frame清楚仍未證實。這是證據缺口，不是已診斷遊戲缺陷。只補此缺口的新雲端請求已送Dot，僅測固定公開候選，不改Maker/程式/HP。
- Rolling Eye patch proposal以精確source85e及12個變更路徑（全屬19項允許路徑）綁定，patch與postimage hash機械核對通過；Luna獨立審查判 `changes`：朝向/畫面旋轉與真實格步方向脫節；beam權重為0時序列停滯；Maker顯示不生效的半徑/移速欄。詳見 `coord/reviews/survivor-boss-gallery-4/luna.md`。尚未套用，未跑遊戲測試。
- 已請Dot基於同一個未變的85e提交修正版，新增朝向、多方向格步、beam=0與Maker實際控制測試；同時請Dot補Stone缺少的三尺寸交替落擊觀察。修正版仍需Luna複審，再機械套用、Mac跑完整 `node games/survivor/tools/test.cjs --layout`，發佈新的SHA固定測試版後才做Dot雲端實玩。PR105整卡、Mask Statue、approve/merge均未完成。
- PR公開進度：[Dot補測](https://github.com/stasischen/erin/pull/105#issuecomment-6464917262)、[Luna changes與Rolling Eye修正](https://github.com/stasischen/erin/pull/105#issuecomment-6465088180)、[新Stone缺口補測](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6465118541)、[Rolling Eye修正版請求](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6465082162)。


### PR105 請求完整性預檢補充（待Dot重驗）

- Eye revision與Stone Hands證據補測的兩份GitHub回覆都標為 `changes / incomplete`，僅屬 integrity preflight，沒有重跑遊戲或 UI。直接比對本機凍結 `source.json` 後，來源端的 `manifestHash` 可由完整manifest重算吻合；兩份預檢回報的「舊格式重建值」則剛好等於移除 `exchangeRoom` 欄位後的hash，確認這是新舊manifest格式不一致，沒有證據指向bundle或source內容損壞。
- 已分別向原兩個request送出metadata-only補充，含精確凍結 `request.json`、`source.json` descriptor/manifest preimage及 `SHA-256(UTF-8(json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":"))))` canonicalization。原request、source、scope及bundle都未變；請Dot只重驗manifest完整性，不重跑程式審查或瀏覽器測試。
- 補充留言：[Eye manifest preimage](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6465306269)、[Stone manifest preimage](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6465306797)。收到Dot明確重驗前，兩項 request 狀態仍維持 incomplete，Stone先前partial_evidence、Luna對patch的changes也都不變。


### PR105 Rolling Eye v3 patch 已收，等待Luna複審

- Dot確認Eye revision原request的manifest preimage已核實：hashed manifest含 `exchangeRoom`；完整preimage及source canonicalization重算完全吻合。見[完整性確認](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6465602032)。原source仍為PR105 head `85e22bbfe749aa244b9fa87a46133bd90e3c5a0d`。
- 新v3提案 `approve / proposal_ready_for_independent_review` 只表示可送Luna審查，不是程式審查通過。proposal SHA-256 `e425f7fa473ac53be6ad98337c00c4600d77d4927cb85b445c6283d245e4c520`、patch 51,039 bytes；主控用原normalizer/validator驗request、source、manifest、bundle及作者，並在exact-base scratch驗 `git apply --check`、11文字postimage與1張PNG postimage SHA/bytes、所有12條變更路徑均在19項allowlist。v3新增112×16 RGBA PNG（237 bytes），只在本機查看。
- v3聲稱修正前版三項Luna findings：實際格步方向驅動朝向/眼部/光束；beam disabled時安全輪轉並拒絕兩招全disabled；隱藏不生效Maker控件。已把精確patch與原始回覆交Luna再審；未套用、未跑CJS、Mac完整 `--layout`、素材產生器或瀏覽器。PR105保持draft。
- Stone Hands結果仍維持 `partial_evidence`；Stone preimage addendum已送出，但截至本紀錄尚無Dot對其manifest完整性的確認，也未補跑左右手撞擊序列。不得把Eye preflight完成推廣成Stone驗收通過。
- 本段目前等待Luna v3 verdict及Dot Stone完整性/落擊回覆；請照既定流程接續。

### Rolling Eye v3 Luna 複審：仍需修正面內扭轉

- Luna確認v3已修正前版三項問題，但對完整patch仍判 `changes`。新的blocking reproduction：face0起始走E→N→W，最後face normal回face0但signed roll總和+90°；active transit結束後程式只保存face，renderer回未旋轉face0，丟失眼面扭轉。face art不是90° rotationally symmetric；同一normal也可能對應不同面內twist。詳細審查檔在 `coord/reviews/survivor-boss-gallery-4/luna.md`，v2記錄保留於 `luna-v2.md`。
- v4修正請求已送Dot，source仍綁PR105 head85e；要求保存完整cube orientation/等價的normal+twist，E→N→W靜止姿態保留+90°，另測不同路徑到相同normal但扭轉不同時的穩定render/frame，並保留v3前三項修正。請求內已明列supersedes，且已附新的exact request/manifest preimage，避免重複完整性阻塞：[v4 patch request](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6466814725)、[manifest preimage](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6466818564)。
- PR105仍draft、遠端head未變85e；v3未套用，沒有跑新遊戲測試或瀏覽器測試。[PR更新](https://github.com/stasischen/erin/pull/105#issuecomment-6466823402)。


### PR105 Dot 收件漏讀原因與 Stone 窄範圍補測（2026-10-28）

- Dot 的 Stone 補測回覆一直存在於 [PR #411 #6466710501](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6466710501)。我先前說「還沒確認收到」是收件器漏讀後的錯誤推論：本機 exchange parser 只接受不含 `recipient=` 的舊 marker，遇到 `recipient=mac-manager` 就因精確比對失敗而跳過。原始留言沒有遺失；此後直接從 GitHub 讀回並以原始 request／source／manifest／bundle 綁定驗證。這是工具接收缺陷，修復及回歸測試尚未包含在 Erin repo。
- 另有獨立的 manifest preimage 對照問題：Dot 先前重建時漏掉 hashed manifest 的 `exchangeRoom`；[#6465603733](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6465603733) 核對補充後確認完整 preimage。這個 hash 對照問題與「收件器看不到留言」是兩件事。
- Stone Hands 結果 [#6466710501](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6466710501) 已在本機按固定 request、source SHA `2bb7270f8590f34bdaedb3d4d1255fa7cd50326d`、manifest、bundle 與預覽版本 `20261028d` 驗證。Dot 的結論僅核准三個 viewport 各兩次左右手交替 warning→impact 序列；1024×461、740×360、1180×820 皆有兩段序列。因交換格式把 viewport observations 放在 `coverage`（而現有 intake validator 把該欄當檔案覆蓋率），只在本機標準化副本搬到 `viewport_results` 後跑原 validator；原留言與證據未改。這不是 Stone 全功能、整卡、PR 或合併核准。
- 補測記錄另發現 740×360 的 raised hand top 與 HUD 重疊。Dot 此次 scope 只核對左右手預警／撞擊序列，故重疊仍是待修的 UI 問題；不把窄範圍 approve 擴大解讀。待 Rolling Eye v4 的同檔修改解決後，另基於當時最新 PR head 向 Dot 要 Stone HUD 修正，再對最後固定候選重測。
- PR105仍為 draft，remote head維持 `85e22bbfe749aa244b9fa87a46133bd90e3c5a0d`；尚未套用任何 patch，也未因這次收件核對重跑遊戲測試。


### PR105 Rolling Eye v4 Luna 核准、Mac 套用與完整測試（2026-10-28 11:28 UTC）

- Dot 原始提案 [#6467328114](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6467328114) 綁定既有 request、source `85e22bbfe749aa244b9fa87a46133bd90e3c5a0d`、manifest與bundle；結果 `approve` 僅 `code_patch_proposal_only`，明確不是獨立程式審查、整卡通過或合併授權。完整提案57,641 bytes，SHA-256 `94876616a2e9a629bbb5b2f5cf93e38e32764c8ef4dc533aecdbd7cb16edadb0`，明確取代未套用的v3。
- Luna獨立複審通過，詳見 `coord/reviews/survivor-boss-gallery-4/luna-v4.md`。24個 `(face, up)` 狀態保留完整朝向；E→N→W休止時維持face0及+90°扭轉；相同外向face的不同扭轉能被區分，beam/weakpoint及共用眼／光束錨點使用一致朝向。v3的beam停用回退及Maker有效設定修正仍保留。
- 主控核對request、source SHA、manifest canonical hash、bundle hash、patch長度/hash、11個文字preimage/postimage與1個獨立PNG payload；12個變更路徑皆在19項allowlist內。先於精確base scratch成功套用並驗postimage，再將文字patch及PNG分別套用至原PR分支；`version.json`升至 `20261028e`，由正式version工具同步頁面query及service-worker快取。
- Mac完整 `node games/survivor/tools/test.cjs --layout` 第二輪 exit0、134個PASS行，含Boss4朝向／renderer／beam／Maker案例與layout Chrome；`git diff --check`通過。第一次全套測試發現Boss4新測試一處仍讀舊`gridFace`欄位；換成`gridOrientation.face`後，定向測試揭露第二個fixture在舊`state.trial`未清時重啟，沿用舊beam權重；在fixture起始先`resetGame()`後定向與全套都通過。這兩處僅測試fixture修正，遊戲邏輯未增改。
- 目前尚未建立新commit、push PR或發布新preview；PR105仍draft、remote head仍是85e。下一步將明確列出檔案建立同分支commit/push，依append-only隔離流程發布新SHA候選，請Dot只對該候選做雲端實玩。舊Stone候選在740×360的raised hand/HUD重疊仍另待修；先避免與Eye同檔修改衝突，再按最新PR head另送Dot修正，不能把Eye v4核准或Stone窄範圍approve擴大為整卡/PR通過。


### PR105 Rolling Eye v4 固定預覽已發布，交Dot雲端實玩（2026-10-28 11:39 UTC）

- PR105 draft 的遊戲程式提交為 `09bfd3e0877e3b723cd2581ecb44b53dae57ea65`，版本 `20261028e`。測試站只追加新SHA目錄，Pages commit `d40a7711338a6046a261715c35c552ee4fd94068`／run `40680856243` completed/success；新候選manifest SHA-256 `ea18f6514c35fba62d8675ab4f42f444fee16e1a549739cae8a932194a1f3b0e`，73個manifest payload。上線後428個舊/新檔案逐一HTTP200與SHA-256核對一致，原356檔及五份舊manifest payload完全不變。Mac A/B工程檢查通過；無遊戲CI。
- 唯一固定遊玩URL：[PR105 source 09bfd3e／20261028e](https://stasischen.github.io/erin-preview/pr-105/09bfd3e0877e3b723cd2581ecb44b53dae57ea65/games/survivor/)。三尺寸Eye v4專項雲端測試已送至[#411 #6468015572](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6468015572)，完整manifest preimage已隨request bundle提供，避免另外重建hash。要求Dot只測自己的雲端Chrome實際操作、三尺寸canvas/HUD、E→N→W靜止面內扭轉、外向面Eye/beam warning與命中時序；不改code、HP、隱藏狀態或Maker，不碰正式站。回覆格式明確把觀察放`viewport_results`、`coverage:null`。
- 送件時PR105 head正是上述source SHA。request結果只評固定預覽Eye實玩，不代表獨立程式審查、整卡、PR或merge；收件後須再核request、manifest、bundle、source及comment作者。舊Stone候選740×360 raised-hand/HUD重疊明列為已知的另一項缺口，Eye範圍不修它也不遮蔽它。未來如有coord-only紀錄提交，不改候選遊戲檔；Eye結果仍只對固定source `09bfd3e`有效。
- PR105尚未approve/merge，Mask Statue未完成。等待Dot結果後先記錄其實測範圍；再另向Dot要求修Stone HUD重疊，Luna複審、Mac完整測試、新SHA候選及Dot驗收後才可進下一階段。


### Rolling Eye v4 Dot partial evidence與針對性補測（2026-10-28 12:18 UTC）

- 原始回覆 [#6468600347](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6468600347) 已讀回，通過既有request/source/manifest/bundle/作者normalizer與validator；`changes / partial_evidence`，scope只限固定預覽的Eye實玩。source仍是 `09bfd3e0877e3b723cd2581ecb44b53dae57ea65`、版本 `20261028e`；回覆不得套用到PR後續的新HEAD或宣稱程式缺陷。
- 三個iframe/canvas尺寸1024×461、740×360、1180×820皆核對一致。1024實測到一次Eye warning→實體beam→可見HP下降，beam起點與眼中心對齊；但路徑只確實完成E、N，下一玩家位置造成S而非W，故沒有E→N→W或相同法線靜止+90°畫面對照。740實際路徑E→N→E，缺W與扭轉對照，也沒完成beam warning→命中/傷害。1180曾觀察到N→W，但較早有未逐格計數的E移動，不能證明起始面連續E→N→W；沒完成beam鏈。不得以Mac規則測試補畫面證據。
- 原始Dot觀察另指出1024時Boss血條蓋住眼睛上部；740時玩家上身接近並被Boss HUD遮住。1180外頁窗較短且捲動，部分頂端HUD/右邊緣在外頁視口以外，不等於canvas內裁切；仍未完成整個HUD邊緣驗收。初次畫面Boss均可見，未觀察到畫面外生成。上述視覺遮擋待另作HUD問題處理，不能跟扭轉驗收混為一談。
- 已送針對性證據補測 [#6468770049](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6468770049)，candidate仍固定同一immutable URL/source09bfd3e；request manifest列明目前PR head `8b8db3d14df64abf4516dd03a82b6f998669d1ef`僅coord檔變更，遊戲檔與sw.js逐byte相同。補測只重做1024 E→N→W靜止對照、740/1180外向面beam warning→實際beam/HP變化，並附普通玩家位置引導；不改code、Maker、HP或隱藏狀態。`coverage:null`、畫面記錄放`viewport_results`。
- 目前任務維持blocked等待補測回覆。後續先核新回覆仍限同一固定候選及指定片段，再由Dot另提供HUD遮擋修正patch、Luna複審、Mac完整測試及新SHA候選；Stone raised-hand/HUD舊缺口與Mask Statue也尚未清除。

### PR #411 已有回覆的接收／採用狀態釐清（2026-10-28 12:20 UTC）

- Dot 已在約定的PR回覆，沒有漏掉回覆本身：Stone補測 [#6463244565](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6463244565) 對應request `e05006d…`；Rolling Eye完整patch提案 [#6463785368](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6463785368) 對應request `4b68295…`。兩份都有本機GitHub readback與normalized intake receipt。
- 收件流程曾因Dot marker多帶`recipient=mac-manager`、而舊receiver只比對不含recipient的格式，將回覆靜默漏進自動收件；手動從GitHub原留言核對後，normalized副本只修marker欄位，JSON與證據不變。這解釋了為何狀態曾顯示「沒收到」；後續不應再把它描述為仍待確認是否收到。
- 07:58 Eye回覆的`approve` scope是`code_patch_proposal_only`、status是`proposal_ready_for_independent_review`，表示提案可交Luna複審，並非patch已直接採納。Luna複審在原提案找到三項需修正處；後來修正版再經Luna approve，Mac才套用並提交source `09bfd3e`。所以「Dot有回覆／Mac收到」為是；「07:58原提案原樣採用」為否；「修正版已採用」為是。
- 先前把「沒有收到確認」和「提案尚未採用」合寫，讓人誤以為PR #411上沒有回覆，這是我對收件狀態及proposal scope描述不精確。毋須重送已完成的請求；目前等的是另一個固定source `09bfd3e` 的瀏覽器證據補測 `#6468770049`。


### Rolling Eye v4 固定候選 gap 補測 #6468910347（2026-10-28 12:29 UTC）

- 已從PR #411讀回 [Dot回覆](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6468910347)，綁定原request #6468770049、request `54175fe093703ff469c73c4eaacf00e3e68dd5f6c85f3e12667dc252bffa787a`、固定遊戲source `09bfd3e0877e3b723cd2581ecb44b53dae57ea65`、manifest `7c8b2ffe22c95cb34a5e51d2bcd293ea217cb3cb3d11137cf4d071e95f09f3c6`及bundle `1a9bdd913b6457e2183ea063ecdad999a6d3688a0ab8babf6eb5d676851d0e46`；既有exchange normalizer／validator通過。PR105目前HEAD `6996b391307e9f6cf178ba55a7df86d418b181b5`僅比tested source多coord紀錄，遊戲檔與sw.js未變；結果只適用immutable `20261028e`候選。
- 740×360已補齊Eye睜眼／光束預警→同錨點橙色beam穿過玩家→受擊變暗及HP下降；1180×820已看到預警→beam穿過玩家、受擊粒子及變暗／恢復，HP條在外頁視口外，沒有宣稱HP數值。兩尺寸的beam-chain缺口標為已補。
- 1024×461仍是`partial_evidence`：一般玩家操作重走結果為E→N→S；玩家往左側後先出現南向移動，完成後才看到西向預警。這不符合要求的連續E→N→W，因此未用後續西移代替第三步；起始法線返回後的靜止+90°畫面對照仍缺。沒讀寫hidden state，不據此推論程式缺陷。
- 全回覆為`changes / partial_evidence`，`coverage:null`，`whole_pr_approval=false`、`independent_code_approval=false`、`card_complete=false`、`merge_authority=false`。只更新證據狀態；不等於PR或整卡通過。下一步仍需處理1024單一缺口，再分開處理HUD遮擋及未完成的Mask Statue。


### Rolling Eye v4 1024×461 專項補測已送（2026-10-28 14:14 UTC）

- Dot上一輪回覆已確認740×360與1180×820光束鏈證據完成；1024×461仍是E→N→S，沒有要求的E→N→W與靜止+90°對照。已依此只發一個1024尺寸新請求：[PR #411 #6471339722](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471339722)，request `33e8b7b1715399874cf6dc1a895b54201d6fa1c56ad39a240cb7936760a5a37d`，manifest `8a77ab6dda271c246806cd09561416fdd93046b6fd22d70233bf75b78be549bd`，bundle `220fcf6ac15f954a193135f5960cd2fc683f12576de2f83ab50f3e206f3f76ec`。公開留言readback確認request id、manifest、bundle及候選SHA。
- 該request唯一候選仍是source `09bfd3e0877e3b723cd2581ecb44b53dae57ea65`／版本`20261028e`固定預覽；送件當下PR head為`1a30bee7d791a3e38f130d845f4305d99ab8cfcb`，其相對候選只有coord紀錄差異，遊戲檔與`sw.js`完全未變。新結果只適用該候選；禁止hidden state、devtools、Maker、程式修改或正式站。
- 本次只要求在1024×461用正常遊戲輸入記錄連續E→N→W實際預警，並比較初始與同法線返回後的靜止眼面扭轉。上次E→N→S後才出現W不能代替要求路徑；若仍分岔，照實回報並維持partial。等待Dot結果；不代表整卡、程式碼審查、PR或merge通過。


### Boss4 HUD patch與Rolling Eye 1024補測並行派送（2026-10-28 14:17 UTC）

- 收到家長指出不應停在等待後，確認先前只送了1024實測、沒有送HUD修改請求。已另發Dot code patch proposal：[PR #411 #6471404535](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471404535)，request `4965af3237abb0efaffbea2702f0c19f587be567334fd1d464151b1908ba166b`，base/head `5acc25a82e841f1f99c538301a52083517cbff02`、manifest `8b72f136640387a45e6f0303627a1fe466cdb1e68ea38b8cb1e34fed50a14aa1`、bundle `7001d6c4da08e0d8b0e6caebd03fa6b562ea7b05a97628736c1febccbca9925e`；PR留言readback已核對。
- HUD request只允許提案修改`games/survivor/style.css`，要求用共用響應式佈局處理1024 Eye上部、740玩家上身及石像手部預警與Boss HUD重疊，維持HP/架勢/名稱可讀；禁止遊戲邏輯、隱藏狀態、正式站、repo寫入、push或merge。若單一CSS不夠，Dot須停下說明所需路徑，不能擴大範圍。這只是code proposal，須Luna獨立審查/精確套用後由Mac測試、新發固定候選，再交Dot瀏覽器驗收。
- 此patch request固定在當時PR HEAD `5acc25a`；送件後協調紀錄提交不改遊戲檔。與1024瀏覽器補測request #6471339722（固定遊戲source `09bfd3e`）是兩個不同source、不同範圍的請求。兩者都等Dot回覆，但HUD patch審查可先啟動，不需等1024實測。


### Boss4 HUD patch 回件：缺少唯讀 viewport 上下文（2026-10-28 14:30 UTC）

- Dot回覆 [#6471522223](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471522223)，對應HUD patch request [#6471404535](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471404535)。本機normalizer/validator核對request、author、marker、source、manifest、bundle與schema一致。結果為`changes / partial_evidence`、scope `code_patch_proposal_only`、`changed_files=[]`、`patch=null`；不包含可套用程式碼，也不是PR/卡片核准。
- Dot完成7個指定唯讀檔的hash檢查，沒有執行程式、apply check、Mac測試或HUD預覽驗收。它指出CSS把Boss HUD疊在整個canvas上，單純移到角落/透明化不能保證不遮玩家與攻擊tell；縮放或裁切canvas還可能讓viewport與輸入座標失同步。因此它沒有猜測CSS patch，而要求下一階段先讀`games/survivor/game.js`中的`fitVisibleViewport`、canvas/worldViewport/camera、pointer座標及其固定模組，並提供同base bytes/hash。
- 目前凍結patch request base `5acc25a82e841f1f99c538301a52083517cbff02`，PR105現HEAD `0dbd092f2f7af521150ddabed2c4b6323317d46d`；兩者間只增加`coord/handoff/latest.md`和Boss4 task JSON，沒有遊戲程式變更。該差異不會把舊proposal升格為目前HEAD核准。style.css-only提案無patch，不採納/套用。
- 依原request allowlist，本輪未讀`game.js`，未修改、測試或擴大Dot權限。後續須先由家長決定是否允許Dot將`game.js`及它實際點名的viewport/render/input依賴僅列read-only；收到允許後另以當時PR最新HEAD重凍結request。Eye的1024-only雲端實測request #6471339722仍獨立待回。


### 家長批准Dot唯讀viewport上下文；HUD提案重新派送（2026-10-29 02:26 UTC）

- 家長明確同意Dot查看`games/survivor/game.js`及必要模組。原HUD回覆[#6471522223](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471522223)是partial、沒有patch；它要求先追蹤viewport/canvas/camera/pointer輸入契約，故沒有採納舊CSS-only方案。
- 已用當時PR105最新head `bc7d8e4c16cae08d3ca8d5ff9e8efe359e9fc085`重凍結並重送[#6486182355](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6486182355)，request `d455b741adf784f457cea74f03788e265931a958e321fc107e88f2fb8146b134`；manifest `55b28710b18326d2c567bb47d0e673d3d9d9b718b69e679cb71f22a62b348697`、bundle `fa5bc63634a73e89ba16e666081935ad8debe198a2486bb4192363bdb1e11153`。公開留言readback已驗證request/source/hash欄位。
- 新request只允許唯讀`game.js`和它實際需要的`games/survivor/`本地viewport/render/input模組；Dot須報告每個實際讀取路徑及SHA-256。任何patch寫入仍限`games/survivor/style.css`；若需修改其他模組須列出最小清單並再取得授權。此階段不要求瀏覽器驗收或Mac測試，不得改repo/push/merge。
- PR105現HEAD仍為`bc7d8e4`、保持draft。另一個Rolling Eye 1024×461固定候選實測[#6471339722](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471339722)繼續並行等待；其結果僅對source `09bfd3e`有效。


### HUD context 回件與待決顯示取捨（2026-10-29 04:22 UTC）

- Dot於2026-10-29 02:36 UTC回覆 [#6486337797](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6486337797)，對應request #6486182355。既有exchange normalizer/validator確認request、author、marker、source `bc7d8e4`、manifest `55b28710...`及bundle `fa5bc636...`一致。Dot回報讀取10個遊戲來源檔及bytes/SHA；路徑與hash列於回覆。未跑程式／Mac測試／瀏覽器驗收，也未修復重疊。
- Dot的結論是Boss HUD與canvas同層疊放；若CSS自行保留區域，canvas可用矩形會改變而牽動zoom、world viewport、camera與pointer座標。它認為要在共享viewport契約中安排HUD專區，最低新增提案可寫路徑為`games/survivor/engine/loop.js`（另保留`games/survivor/style.css`），但實際修改範圍仍待獨立審查。任何額外模組若實作證明需要，Dot要先列路徑再取得授權。
- 這需要家長決定顯示政策：保留完整戰鬥世界和Boss可見性、將遊戲畫面等比縮小以讓出HUD專區；或維持目前畫面比例、接受可見世界範圍縮減。依Boss4規格「鏡頭幾乎看得到整個競技場、Boss永遠在畫面內或邊緣」，目前較符合前者，但需家長確認。未獲新寫入範圍核准前不請Dot產生`loop.js`修改、不套用。
- 回件source為`bc7d8e4c16cae08d3ca8d5ff9e8efe359e9fc085`；當時PR HEAD為`d2c9d02fa38a368f939626f10d7ba6c387b94602`，兩者只差coord紀錄。HUD修正無patch；不代表HUD通過。1024×461固定候選實測request #6471339722仍獨立pending。


### 家長選擇縮小可見世界；HUD patch已續派（2026-10-29 04:25 UTC）

- 家長明確選擇「接受可見範圍縮小」：保留目前世界/角色比例，讓出HUD專區，stage背景仍填滿螢幕、無黑邊。此決定足以繼續既有Dot patch流程，我不再等待第二次確認。
- HUD上下文Dot回覆[#6486337797](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6486337797)表示CSS-only不足，viewport同步至少要動`engine/loop.js`。已基於當時PR HEAD `e44dfe7a351b5a3f86c0a319785159598e0db16d`送出具體patch提案request [#6487897220](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6487897220)，request `be51cf4ac090029082c58327dd8762d9a9ad502c179c77e571c57d14d1f7b841`，manifest `ff77953588a249d8149f4971a54d52249fabdb4d4a9bbe6651deb139dcf3e763`，bundle `7e894090e5b67a8c461899b2e186aae593117fd288b46d75659ec70b79ca9503`。patch提案可寫路徑僅`games/survivor/engine/loop.js`和`games/survivor/style.css`；Dot不寫repo、不執行測試。其他檔只讀，如證明需增加write path先列明再求核准。
- 此方案要求reserved HUD rectangle同步canvas backing、worldViewport/camera與pointer座標；world/object比例不變、視野可縮小，仍確保玩家、Boss與attack tell可見。Luna須獨立複審精確patch；Mac精確套用、跑完整`--layout`、升版並發新固定候選；之後Dot才做三尺寸HUD實測。
- 已補讀之前漏查的1024實測回覆 [#6471445903](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6471445903)，normalizer核對request #6471339722、source `09bfd3e`、manifest、bundle與作者通過。正常試煉只完成E→N；北向完成後下一預警仍為E，Dot即停下，因此連續E→N→W與靜止+90°比較仍未通過。結果為`changes / partial_evidence`，沒有hidden-state操作，也不據此宣稱遊戲缺陷。此固定候選結果保留作歷史；HUD patch產生的新候選仍須重做對應三尺寸遊戲/朝向驗收。
- 本次只改coord。HUD提案source是送件時HEAD `e44dfe7`；之後coord-only提交不改遊戲程式。PR105維持draft。


### 家長明確核准Dot提出HUD patch（2026-10-29 04:25 UTC）

- 家長明確同意Dot針對HUD提出patch。此核准對應已發出的[#6487897220](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6487897220)，範圍仍限`games/survivor/engine/loop.js`與`games/survivor/style.css`的patch proposal，base `e44dfe7a351b5a3f86c0a319785159598e0db16d`，設計採保留world/object比例、縮小可見世界區域、保留全螢幕背景無黑邊。
- Dot不得直接寫repo、push、開PR或merge；收到patch後交Luna獨立複審，再由Mac對精確base套用及測試。已有request在處理中，不重送。


### HUD幾何證據補件與patch request（2026-10-29 08:56 UTC）

- Dot的HUD patch result [#6487955801](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6487955801)已綁定驗證，狀態`changes / incomplete`、`patch:null`、`changed_files:[]`、沒有增加寫入路徑。它接受家長已選「保留world/object比例、縮小可見世界」；但沒有足夠固定幾何證據保證玩家、Boss和完整攻擊tell在三尺寸均可見，未提供可能降低該條件的patch。
- Dot點名唯讀缺口`games/survivor/render/gallery.js`、`games/survivor/engine/gallery-encounters.js`、`games/survivor/data/defaults.js`，用來算Boss/招式預警的實際世界邊界。本地無需新增寫權；原批准patch allowlist仍只含`games/survivor/engine/loop.js`與`games/survivor/style.css`。
- 已基於當時最新PR HEAD `13de2068f6e20f956157aa57259c52db7307dd7f`發出合併幾何補查與patch提案的新request [#6492318413](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6492318413)，request `6f027d3386923f61e1124b64cc807c3798750779793a3a6a465fc613b58900fb`、manifest `49095a2b696cf40f318077c69384f30b0bf62968641fe127d752668cbc154ae2`、bundle `3b30707e6a1711e3b8c36351908ad04e68ef4d83830954b45ba1bc14cd525d87`；公開readback核對request/hash與三個path。要求讀幾何、核bounds後若可行直接交loop.js+style.css patch，否則明列證據/幾何阻礙；不改repo、不執行測試。
- Rolling Eye 1024測試#6471445903已驗證為E→N，下一預警E，停止；E→N→W和靜止+90°仍未完成。該固定candidate證據維持partial；HUD patch如產生新SHA，須在新預覽重做三尺寸與Eye朝向功能檢查。


### Boss4 HUD 幾何補查：無 patch，等待預警可見性政策（2026-10-29 09:24 UTC）

- Dot 對固定 request [#6492318413](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6492318413) 的回覆已在 [#6492501348](https://github.com/stasischen/release-aggregator/pull/411#issuecomment-6492501348) 讀回，綁定 source `13de2068f6e20f956157aa57259c52db7307dd7f`、request `6f027d3386923f61e1124b64cc807c3798750779793a3a6a465fc613b58900fb`、manifest `49095a2b696cf40f318077c69384f30b0bf62968641fe127d752668cbc154ae2` 與 bundle `3b30707e6a1711e3b8c36351908ad04e68ef4d83830954b45ba1bc14cd525d87`。Dot 回報讀完新增三個幾何來源及四個直接依賴；沒有提供 patch、沒有寫 repo、沒有執行遊戲、測試或瀏覽器驗收。
- 正式本機 `exchange_result.py` 驗證 request ID、source SHA、manifest 與 bundle 後，因回覆的 `coverage` 是 object（接收器要求非空 list，列項還須有 `read_complete` 與 `hash_verified`）拒絕正規化；因此這份原始留言尚未正式採納，不把自述資料當已獨立核驗的審查結果。未改寫或補造 Dot 的回覆。
- 靜態幾何指出政策衝突：1024×461 原 zoom 約 `1.21458`，可視世界高度約 `379.56`；nova 活躍末段的完整垂直外緣接近 `384`（progress 0.99 時 `380.4`），故即使 HUD 高度為零也放不下完整圖形；預留 HUD 會更小。Mac 另用固定來源程式與算式核對此單一反例；這是靜態界限，不是實測回歸或遊戲測試結果。
- 原先已選保留 world/object 比例、縮小可視世界、背景無黑邊；仍需家長明確決定大型預警超出可視區時可否被裁，以及是否要求每個完整 tell 留在視窗內。未得到決定前不向 Dot 要求新邏輯、不套用程式 patch。PR105 仍為 draft；遊戲程式和版本未變，舊候選測試不代表 HUD 已修。


### Dot 收件房間路徑核實（2026-10-29 09:24 UTC）

- Lingo 房間 PR [#1](https://github.com/stasischen/lingo-agent-exchange/pull/1) 有 Dot 回報獨立 webhook delivery 到達；但它也要求原 Lingo 來源端再確認是否收到／採用及自動或人工接續，現有留言未證明原 session 自動恢復。Erin 房間 [#2](https://github.com/stasischen/lingo-agent-exchange/pull/2) 尚無 Mac 來源 synthetic request；Dot 明確要求補做同房 request／receipt 和來源側接收方式核對。
- Source client [release-aggregator PR #431](https://github.com/stasischen/release-aggregator/pull/431) 已合併：可依 `exchangeRoom` 配置把新的 request、publish、find、receive 綁定到 Lingo／Erin 房間；其 task brief 明定要先完成各房間 live synthetic acceptance 才切新流，現有 frozen #411 work directory 不搬移，也沒有 source-session 自動喚醒／scheduler。故 PR105 目前固定在 PR #411 的請求仍留原房；在 Erin PR #2 acceptance 前，不把新房間描述成已完成切換。
- Invest 房間 [PR #3 receipt](https://github.com/stasischen/lingo-agent-exchange/pull/3#issuecomment-6467264007) 記載 Dot 收到獨立 webhook delivery，但 source receipt 明寫由人工沿原執行任務接續，沒有證明 Windows 原 session 自動喚醒。GB10/MSI 透過 Invest 的既有執行連線屬已提供的操作狀態；房間留言未證明它們自行監聽。
- Kit [PR #11](https://github.com/stasischen/agent-coord-kit/pull/11) 仍是 open draft，增加 offline continuation/replay ledger 與去重／恢復測試，但自身說明明列尚未接 coordinator、scheduler、webhooks、live rooms 或 production dispatch，亦未驗 Windows locking、live receipt/adoption 或端到端派工。直接送入既有 execution task 是另一條路由；房間 PR 不能替代它，也不證明它自動續接。
