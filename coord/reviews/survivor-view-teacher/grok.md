verdict: approve
7ff5d568e779b5d01207b8f12dee2a0a6f2ed762

# Grok review: survivor-view-teacher（固定面積視野與老師追擊戰）

## Files checked
engine/loop.js（worldViewport/applyWorldViewport、固定地圖跨度）、input.js（canvasScreenPoint/canvasPoint 換算）、render/world.js（留邊、HUD 螢幕座標、箭頭與提示文字反縮放、新招式繪圖）、engine/boss.js（teacherHealth、teacherChoices、追擊、五種新招）、engine/combat.js、data/defaults.js、data/schema.js（新欄位界限與舊作品遷移）、maker/maker.js（階段移速、追擊規則、安全圈欄位）、practice-engine.js、preview*.js、tests/view-teacher.cjs 與調整過的既有測試、version.json／index.html／sw.js 版本號。

## §6 checklist
- iPad／手機：觸控與搖桿沿用 Pointer Events；搖桿與按鈕用 CSS 像素（screenWidth/Height），世界換算只用在瞄準。resize 後 applyWorldViewport 重設 imageSmoothingEnabled=false。新增程式沒有 roundRect、Array.at、structuredClone、外部網址。
- 遊戲邏輯：追擊、招式計時都用 dt；老師預警時站定；招式有上限（hazardLimit）並用物件池。
- 專案慣例：版本 20261026al 已更新（index.html、practice/preview iframe、sw.js）；文字繁中；沒超出卡片範圍。

## Tests
Box（Grok 雲端電腦）：`/workspace/erin-ci/run-review-tests.sh 7ff5d56…` → RESULT: PASS（90 PASS lines，layout 9/6，228s）。

## Hands-on（box headless Chrome，觸控模擬，DPR 2）
三種大小 1024×461、740×360、1180×820：
- 視野：三台可見世界面積都是 320000（843×380 zoom 1／811×395 zoom 0.75／679×472 zoom 1.5），四周有深色留邊；地圖固定 12432×12348，不隨螢幕變。HUD 與按鈕仍是螢幕大小。
- 搖桿拖右：主角往右移動（約 +238）。攻擊鈕拖上 angle −1.571、拖左 3.142，放開後 lastAttackInput angle 3.14：手動瞄準方向正確。
- 老師（level 6 → 血量 3750）：持續往右跑 12 秒放風箏，距離超過 800 時進入快走（藍汗＋「快走追上」），遠距離／畫面外只出跳上講台與粉筆狙擊；跳躍把距離從 ~900 拉回 ~260–430。距離從未拉開超過 ~930。站定後老師走近並改用近距招（點名、圈、跳）。畫面外箭頭有出現。實際看到的新招：跳上講台（紅圈＋星星）、粉筆狙擊、黑板封路、點名追蹤（第三階段）。黑板擦連衝在這次取樣中沒抽到，由 view-teacher.cjs 測試覆蓋。
- 第三階段安全圈：600 → 320 → 目標 180，有預告文字。
- Maker 老師分頁：16 個項目（含五個新招）；第一階段移速 70→80、快走倍率 2→2.1、最終半徑 180 顯示正確；儲存後 ?play=1 的 GAME_DATA 生效（80／2.1）。三種大小都沒有頁面例外。

## Findings / notes（不擋）
- 手機 740×360 zoom 0.75，左右各約 66px、上下 32px 是深色留邊，畫面看起來比之前小一圈；這是規格「多出部分留邊」的結果，請家長看手機上是否能接受。
- 45～60 秒戰鬥時間尚未實測，需要試玩調整。
- 我沒有測直拿旋轉與舊作品匯入（測試有覆蓋遷移）。
