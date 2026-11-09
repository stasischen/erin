# PR113 整體驗收證據總表（2026-11-09）

## 2026-11-09 指定續驗

先檢查相同候選驗收進程，沒有並行工作。其後在固定公開頁嘗試由開始鍵進入自然戰鬥；頁面已載入，但按鈕只取得焦點、無法啟動，AX仍顯示「準備開始」。CUA原生桌面檢查的原始錯誤為 `The Mac is locked and automatic unlock could not unlock it. Ask the user to unlock the Mac manually before continuing.` 截圖面積為960×820，不是指定尺寸，內部viewport亦未能讀取，因此三尺寸矩陣未開始；自然完整局也未開始。這是工具／桌面互動阻礙，不能推論為產品缺陷。具體本機操作記錄：`~/.local/share/erin/logs/pr113-residual-matrix-20261109.md`。

完成的技術交叉核對：公開候選 SHA 為 `cf14bc06f25fcb3cd8b93bd6842950b9b8749350`、版本 `20261105a`；該候選到本 PR HEAD 只新增 `coord/` 與 `docs/`，遊戲程式及 `sw.js` 未變。此來源已有 Mac `node games/survivor/tools/test.cjs --layout` 136 PASS、非作者 approve，以及各輪審查檔；本次不重跑已通過套件。此項靜態一致性核對沒有替代三尺寸、完整自然局或家長最終驗收。下一步待 Mac Chrome 能互動後，沿原候選完成三尺寸與一局自然遊玩；不部署、合併或重派 Dot。

本表先由原主控彙整既有證據；2026-11-09後續補上一次固定公開候選全檔唯讀核對與Chrome UI操作紀錄。這不是新自動化測試、新獨立審查或使用者整版驗收；沒有重派Dot、重跑136/P3、自行改玩法、合併或部署。

## 固定範圍

- 原卡：survivor-upgrade-balance；P3子卡：survivor-timer-status-refresh。owner均為原主控codex，沿原對話、worktree、codex/survivor-upgrade-balance分支與PR113。
- 整理前HEAD：`7b6167e1c56225b4b89e6018c69bef96a4067e7b`，PR仍OPEN／草稿。
- 最新遊戲／候選來源：`cf14bc06f25fcb3cd8b93bd6842950b9b8749350`，20261105a。來源至上述HEAD只含7個coord／docs檔；games/survivor與sw.js無差異。本次也只整理文件。
- P3已修且非作者通過。各輪增量批准不能自動合成整張PR批准；最新公開候選未驗完成，整體驗收未結案。

## Mac與瀏覽器證據的界線

下方各輪表的完整套件均指Mac `node games/survivor/tools/test.cjs --layout`，既有紀錄exit0。PASS數是日誌行數，不代表所有配裝均驗完；受控診斷與自然遊玩不混算，桌面手機尺寸不當手機硬體驗收。

本次只讀回既有日誌：upgrade-balance-review-full 124、abilities-full-final 132、waves-full-final 133、routes-full 134、refactor-full 134、maker-data-full 134、readability-5607-full 136、readability-g-mac-rerun-20261105 136、timer-status-full 136，均仍存在且PASS行數與紀錄相符。退出碼依當時執行紀錄，不單憑PASS數推定；完整.log與原圖留本機。

`2ed68f29e8256cceb89d432b4498586103293d60`的g版Mac重跑與`5607ab9`遊戲相同；P3 a版有自己的完整套件與非作者審查，不拿g版結果代替。舊Maker作品、存檔鍵與隔離已有多輪證據，本次不新增遷移或存檔結論。

## Dot與公開候選

| 項目 | 固定來源／證據 | 結果與限制 |
|---|---|---|
| Dot雲端 | `5607ab95ef2a1fb6bdda9528dc6713b58654c4c9`；[原回覆](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6638519797) | 增量碼審通過、雲端partial_pass。真frame1024×461／740×360／1180×820、DPR1；正常自動生存、自然升級／三槽、倒數／HUD、低血及重開。最大自然局97秒死亡，未到老師150秒登場 |
| g版Mac公開試玩 | 同g版；[收件摘要](../reviews/survivor-upgrade-balance/dot-readability-result.md) | 自然33秒／兩次升級／第二波／技能／暫停續玩通過，不延伸為a版公開通過 |
| a版候選準備 | `cf14bc06f25fcb3cd8b93bd6842950b9b8749350`；[P3原卡](../tasks/specs/survivor-timer-status-refresh.md) | 本機125檔／920執行請求及七key隔離通過，不是公開HTTP全檔驗證 |
| a版部署 | 預覽提交`cd42279a40ce4ee0bb7ecb5b057e652fc44fed1c`；Pages41967715588 | 部署成功，1980既有檔保持、增加122候選檔，不等於公開遊玩驗收 |
| a版公開驗證 | [固定候選](https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/) | 版本檔、公開manifest/digest及123/123 payload bytes/SHA均HTTP200且吻合。Chrome實際載入、暫停續玩、自然升級並確認卡片後恢復計時通過。不是整PR／三尺寸／完整局驗收 |

Dot request與manifest雜湊已在收件時核對；14個改動來源檔hash相符是Dot回報，不是主控本次重算。六張截圖只有名稱及hash，沒有可開啟附件，主控未親眼核圖；沒有bundle。Dot只驗g版，不冒稱a版雲端驗收。

2026-11-09 04:44:01–04:44:02 UTC，主控對固定候選 `https://stasischen.github.io/erin-preview/pr-113/cf14bc06f25fcb3cd8b93bd6842950b9b8749350/games/survivor/version.json` 做一次 `curl` GET（connect timeout 5秒、總上限15秒、無retry）：原始結果 `HTTP/2 200`、exit 0、29 bytes，body `{"version":"20261105a"}`，edge IP `185.199.111.153`，request ID `52C4:0BC3:8CA8A:908BE:6AF14F91`。這只證明版本檔當時可達；不代表全部候選檔或遊戲已驗收。下一步由原主控沿同一固定候選完成既有公開檔案核對與公開操作核驗；不重跑136／P3、不重派Dot、不部署。

2026-11-09使用固定發布manifest（SHA256 `ef2c10e26b8338a9d9b3209ca2e8228eb41f2f059e047fab26ca11ff67886e8f`，123項）及部署repo `stasischen/erin-preview` commit `cd42279a40ce4ee0bb7ecb5b057e652fc44fed1c`。本機確認123/123 manifest paths皆對上部署commit bytes/SHA；manifest path是repo-root-relative，所以公開URL為`https://stasischen.github.io/erin-preview/`加path。第一版檢查器錯把candidate_path再加一次，舊404／錯誤對比全部保留於私人檢查紀錄並標`invalid_url_mapping`，不當產品缺陷。正確映射的完整公開GET檢查在2026-11-09 05:02:07–05:03:11 UTC完成，123/123 payload HTTP200且完整bytes/SHA吻合；manifest 62995 bytes及detached digest 88 bytes也符合固定產物。

同日Chrome實際操作公開遊戲頁：開始生存→第1波Lv.1、0秒／魔王150秒；暫停→已暫停；續玩→3秒／魔王147秒；正常移動收集經驗自然到Lv.2，選取並確認「水球加大」後回戰鬥→21秒／魔王129秒。證明本候選頁可載入並完成這些操作；未測三尺寸矩陣、完整局或整體PR。原始全檔核對紀錄及逐步操作留在本機`~/.local/share/erin/logs/pr113-public-bytes-cf14bc06-20261109.json`與`pr113-public-candidate-interaction-20261109.md`。不重跑136／P3、不重派Dot、不部署或合併。

## 剩餘範圍、owner與下一步

| 類別 | 尚缺／界線 | owner與具體下一步 |
|---|---|---|
| 技術缺口 | 本候選公開123/123 payload bytes/SHA、頁面載入、暫停續玩及自然選卡後恢復已核驗 | 本次指定公開候選補驗已交付；PR113總體審查及原Dot partial／完整局限制仍依原表保留，不把本次子範圍結果擴大為整PR通過，不merge/deploy |
| 雲端限制 | 自然老師登場、自然回血跨30%、減少動態、精確傷害窗與池重用、試煉／Maker手動戰鬥未在Dot測齊 | 原主控codex保留限制；對照既有Mac受控Boss、低血恢復、減少動態、合併與池清理證據，不重做、不冒稱自然或Dot通過 |
| 實機／長局 | 真手機硬體、自然完整兩關、所有配裝平衡無完整證據 | 保留已知未驗範圍，不虛報通關、不重開已通過的增量審查 |
| 設計選擇 | 升級節奏、卡片文案、美術體感與後續玩法提案 | Erin／家長決定；不阻擋本次P3技術收尾，不自行選方案實作 |
| 正式交付 | 整體驗收及合併尚未批准 | 原主控交付本總表，不代替使用者驗收、不merge/deploy；彙整完成不等於整PR批准 |

沒有新增卡片、角色、排程或流程關卡。技術待補由codex持有，不能誤寫成「等待家長決定」。各輪其他歷史FOLLOWUPS保留在原紀錄，不推定全部已修；P3已由最新來源修復，不再列待修。

## 各輪固定證據索引

以下依原審查檔列來源、執行者與已驗範圍，方便逐份核對。

- 初版平衡：三武器自然升級續玩，補血／王冠受控診斷，抽卡資格、去重、補位及舊作品。
- 近戰／武器成長：手動攻速與三武器實際命中、升級比較／追加命中、三局正常手動操作；不外推所有配裝平衡。
- 十二武器：三尺寸正常操作、Lv1/3/5受控傷害、三槽與試煉手動分離、Maker雙入口。
- 能力：護盾承傷、精英／Boss只緩速、狂歡三武器追加、重開清理；首輪`45fd23e8d526d8dc654ea43b15865ef601b7c657`精英硬凍changes，已由第二輪6ef9cd0修正通過，不隱藏歷史失敗。
- 世界／路線：波次敵數與特殊敵限制、重型畫外出生、三尺寸五隊形、64上限、受控換關、六主題快取。
- 核心拆分：101原函式一致、97存取器相容、Maker／試煉與真正preview／practice iframe載入及時間前進。
- Maker／資料：完整資料值與49卡順序、草稿共用、深層編輯儲存重載、六分頁與設定入口、兩種試玩。
- 可讀性：Mac受控低血／減少動態、真命中合併／池清理、受控Boss登場後倒數消失；不等於自然長局。
- P3：真Chrome同秒暫停／選卡後第一tick恢復、正常倒數DOM不重建、Boss在場無倒數。

純視覺輪依美術快車道，沒有偽列獨立程式批准：[原卡](../tasks/specs/survivor-upgrade-balance.md)記錄地板／黏土武器來源`aec5edeedc3e5ff2aacc5434a6eb01d8a5e80e82`的三尺寸移動／蓄力與截圖；80圖示／角色縮小來源`862522b4b42ecf147a16e4f54041e3246377cb03`的全部圖示解碼、三尺寸操作與四試煉頭像。家長審美驗收與實機觀感不由工程紀錄代替。

| 範圍 | 固定來源SHA | 完整Mac套件 | 原始審查 |
|---|---|---|---|
| 初版平衡 | `3f6e0d7eb14f555ba3deec8a9645db32e408195c` | 124 PASS；非作者本人 | [approve](../reviews/survivor-upgrade-balance/luna.md) |
| 近戰手動攻速 | `3a97f05dbf5eb047785306afee0249bc26fa642f` | 126 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/melee-review.md) |
| 武器成長及比較 | `e10fbe2d7c0397ba579e96da7a1ef862d26db839` | 127 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/weapon-routes-review.md) |
| 十二武器三槽 | `dd90dcf3c446c011b1f1aec798165b85bd04230e` | 130 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/survival-arsenal-review.md) |
| 秘技與主動大招 | `6ef9cd0e472259ab4c600450f6f55378d42cfef4` | 132 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/abilities-review.md) |
| 波次重量地景 | `2c2cfa62a067e7c111dbbed913c1f48c94fc2574` | 133 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/world-review.md) |
| 路線與隊形 | `4cf8a2e55098b242e96f7de3b0c881f2e90a009c` | 134 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/routes-review.md) |
| 核心模組拆分 | `fb8df5c38956cbd5b3790c4e443103d7455858c2` | 134 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/modules-review.md) |
| Maker與資料拆分 | `5768808d3aa6c4454132f352be1ac1811b60ebc2` | 134 PASS；主控；非作者核日誌 | [approve](../reviews/survivor-upgrade-balance/maker-data-review.md) |
| 可讀性修正 | `5607ab95ef2a1fb6bdda9528dc6713b58654c4c9` | 136 PASS；非作者本人 | [approve](../reviews/survivor-upgrade-balance/readability-review.md) |
| P3計時文字 | `cf14bc06f25fcb3cd8b93bd6842950b9b8749350` | 136 PASS；非作者本人 | [approve](../reviews/survivor-timer-status-refresh/independent.md) |
