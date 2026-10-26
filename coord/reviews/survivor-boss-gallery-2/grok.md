verdict: approve
798e38d8f8247df9401179891122927096cc9e56

# Grok 審查（第二輪）：survivor-boss-gallery-2（小場地回饋追加）

上一輪已於 b3cdca6 核准全卡內容（雙子霜火、羽翼古神、三尺寸實戰、架勢、Maker）。本輪只審 b3cdca6..798e38d 針對家長回饋（coord/inbox/done/20261026T173002Z-parent-boss-gallery-2-arena.md）的修改，並在最終 SHA 重跑測試與實際操作。

## 看過的檔案
data/defaults.js（每招 `ai` 距離帶：近戰 0–200、移動／遠程 0–480）、data/schema.js（ai 驗證、舊作品補預設、最近>最遠拒絕）、engine/gallery.js（choose 改用每招 ai 規則，不再寫死 0–10000）、engine/gallery-encounters.js（傳入實際距離、入口壓回牆內、冷卻期間 d>140 追近）、maker/maker.js（每招「AI 最近／最遠距離」滑桿）、tests/boss-gallery-2.cjs（距離界線、遷移、直徑 400／600 小場地 × 三視野、每招結束且不越牆、休息／冷卻追近、超出距離帶等待）、?v=／version.json（20261027c）／sw.js、docs/survivor-boss-gallery-2.md、卡片。

## 測試
- Box：`run-review-tests.sh 798e38d` → Chrome 測試逾時（ECONNRESET，box 環境老問題），105 PASS 後中斷。
- Mac Studio：`node games/survivor/tools/test.cjs --layout` 於 798e38d → exit 0，106 PASS。以 Mac 結果為準。

## 實際操作（box headless Chrome、觸控模擬，1024×461、740×360、1180×820）
- 開始畫面「王的試煉」→ 雙子／古神：入口位置都在圓牆內；搖桿右拖主角移動約 170–190；攻擊鍵可按，無 JS 例外。
- 選招距離：霜之衝刺在約 463 開始預警（≤480）、十字約 166–196、火環約 183–194（皆 ≤200）；古神俯衝／龍捲／羽毛都在 ≤480 起手。距離太遠時 Boss 先走近再出招，沒有全場距離出招。
- 休息時把主角移到牆邊：1 秒內雙子距離 286/440 → 221/375、古神 370 → 295，確實追近；冷卻期間（cooldown 階段）也會靠近（古神序列中 cooldown 時距離持續縮短）。
- 全程 Boss 不越牆、沒有一般波次。
- Maker「老師 → 王的試煉 → 羽毛扇形噴射」：出現「AI 最近距離／AI 最遠距離」；按最遠 −3 次、最近 +2 次 → 20–450；從練習場進王的試煉選古神，遊戲內 feathers.ai = 20–450，返回後回到 Maker。

## §6 檢查
無新 API 相容問題、無外部網址、無新素材；版本與快取已更新；文字繁中；移動用 dt；範圍符合回饋（不縮場地，留給 survivor-trial-hotfix）。

## 發現（不擋 merge）
1. 守門人也改用每招距離帶（傳入實際距離），但守門人的「冷卻時追近」沒有加；hotfix 縮場地後可順便統一。
2. Maker 允許把最近距離調到大於最遠距離，此時作品驗證會拒絕（有錯誤訊息）；之後可讓滑桿互相夾住。
3. 本輪小場地只在 VM 測試的圓形直徑 400／600 驗證，正式縮場地後需再實際試玩。
