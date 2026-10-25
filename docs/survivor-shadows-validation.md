# Survivor 影子：實作與驗證紀錄

來源：`coord/inbox/done/20261025T143659Z-parent-shadows.md`。本文件是 Codex 的工程執行紀錄，不是獨立審查。

## 實作

- `render/world.js` 共用 `drawGroundShadow` 與 `drawLandingShadow`，並在 `Survivor.render.world` 公開。影子使用半透明深色橢圓，先於角色本體繪製；圖片角色與程式色塊都走同一工具。影子位置使用世界地面座標，不跟著身體上下移動。
- 主角、小怪與老師的走路小跳會讓身體上移，影子依高度縮小、變淡。主角及小怪預留內部 `airHeight` 繪圖高度，並未新增跳躍操作、碰撞高度或技能。
- 現有老師沒有跳躍或重擊招式；本次把既有直線衝撞畫成輕微飛撲，依招式剩餘時間呈現弧形高度，終點有逐漸變大的落點影子；落下考卷也在固定落點逐漸擴大影子。紅色傷害預警仍保留，傷害範圍、時間、移動路徑及免傷判定皆沿用原本引擎。
- 老師身體與影子隨半徑縮放。影子使用遊戲計時，不用牆上時鐘；暫停不推進動畫，招式取消或重開後不保留飛撲高度。
- 敵人資料的選用 `shadowSize` 為影子寬度相對身體半徑的倍率，預設 `0.9`，允許 `0.3～1.8`。舊作品省略欄位會補預設；不合法數值由既有格式驗證拒絕。生成敵人攜帶此欄位，Maker 怪物頁可調整，角色預覽使用目前草稿值。
- 技能 iframe、Maker 招式展示及怪物肖像共用正式繪圖，沒有另外複製影子實作。
- 版號 `20261025z`；透過 `tools/version.cjs --write` 同步遊戲頁、展示頁、iframe URL 及 Service Worker 快取。

## 執行結果

執行 `node games/survivor/tools/test.cjs --layout`：

- 17 支非瀏覽器測試全部通過，包括新 `shadows.cjs`；版號與快取完整性檢查通過。
- 新測試涵蓋固定地面座標、離地縮小與透明度、落點漸大、圖片與色塊都先畫影子、不同 Canvas context、主角高度、舊資料相容、安全數值及儲存往返、生成敵人、老師飛撲及取消、實際展示引擎反覆播放的有限座標。
- 原本一般／Maker 模式各 153 組軌跡快照未變，66 種技能展示及老師招式測試通過。
- **真實 Chrome `--layout` 未通過：Chrome 在啟動時以 `SIGABRT` 結束，尚未載入頁面。完整測試指令回傳失敗，不能視為版面驗證完成。** 同一環境在先前重構卡也有此問題，見 `docs/survivor-refactor-1-validation.md`。沒有略過、修改或降低 Chrome 測試要求。
- `git diff --check` 通過。

## 交接

請 Grok 審查 erin-watch 提交後的完整 SHA，並在可啟動 Chrome 的環境補跑 `node games/survivor/tools/test.cjs --layout`。之後請 Erin 在實機看看影子的大小、深淺，以及老師飛撲／考卷落點是否容易看懂；目前沒有需要她先決定才能繼續的設計問題。

只在 `codex/survivor-shadows` 改檔；commit、push、PR 由 erin-watch 代辦，未寫入 `.git`、切換分支或操作 main。
