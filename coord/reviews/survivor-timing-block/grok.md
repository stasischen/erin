verdict: approve
fb1414caaf5b7d393d29ba5cf90c05b01fe6cabe

# survivor-timing-block — Grok 審查（統一拼圖第 3 步）

## 檢查的檔案
engine/timing.js（新）、engine/pacing.js、engine/loop.js、engine/combat.js、manual-attack.js、data/defaults.js、data/schema.js、maker/maker.js、maker/style.css、practice-engine.js、practice-rules.js、practice-host.js、practice.html、preview.html、preview.js、render/world.js、manifest.js、index.html、version.json、sw.js、tests/timing.cjs、tests/maker-ui.cjs、tests/manual-attack.cjs、docs/survivor-timing-block-validation.md、卡片與收件匣。

## 測試
- 跑測試的機器：Grok 雲端電腦（box），`/workspace/erin-ci/run-review-tests.sh fb1414c…`：完整套件含 `--layout`，RESULT: PASS（75 PASS，layout 9 種尺寸全過）。
- Codex 沒跑 `--layout`，依規定不計入。

## 規格對照
1. 共用時機積木：`SurvivorTiming.start/advance/cancelRecovery/segments` 為純函式（不讀 DOM／時鐘／亂數），敵人 `advanceAttack` 與主角手動普攻都走它。✅
2. Maker 時間軸：武器、怪物頁都有「時機積木」四段時間軸，拉滑桿即時更新比例與秒數。✅
3. 敵人 phaseAttack 讀 timing；舊存檔（沒有 timing、平面 windup=1.4）載入後自動轉成 timing 1.4，遊戲 GAME_DATA 同步。✅
4. 主角手動普攻有起手／收招，收招可被衝刺取消、冷卻保留；只在手動模式生效，Maker 可調。✅

## 實際操作（headless Chrome，觸控模擬，1024×461 與 740×360 都做）
- Maker 武器頁：三把武器各自顯示時間軸；觸控拖「起手」0.1→0.8、「收招」0.12→1.55，時間軸文字與寬度即時變；儲存→重新整理後仍是 0.8/1.55，另兩把武器維持預設（各自獨立）。
- Maker 怪物頁：布丁時間軸 0.9/0.25/0.65/3；拖起手到 1.85（740 為 1.8）→ 時間軸更新 → 「試這隻」練習場量到 windup 約 1.86 秒、active 0.25、recovery 0.65、cooldown 3，與設定一致；存檔含 timing 與同步的平面欄位。
- 舊作品：刪掉所有 timing 再重新載入 → 不報錯，武器回預設 0.1/0.05/0.12/0，布丁用舊值 1.4 轉成 timing。
- 三把武器（水球、棒棒糖錘、糖果大劍）手動：點按後先進 windup、按鈕變灰，約 0.1 秒後在 active 才出招一次；忙碌時連點 5 下只出 1～2 次（只有回到 ready 後的那下才算，沒有排隊）；長按 1.6 秒期間不出招，放開後保留蓄力（charged=true）並只出一次；拖曳瞄準角度 -2.45 與出招角度相同；搖桿照常移動主角。
- 起手 0.5／收招 1.2／冷卻 0.6：起手中按衝刺不會提早出招（仍在 windup 結束才出）；收招中按衝刺 → 直接進冷卻（剩約 0.48 秒），冷卻中點攻擊不出招；冷卻結束後點攻擊正常出招。
- 連段：糖果大劍第 3 下收招 0.1+0.35=0.45（finisherRecovery 保留），第 1、2 下 0.1。
- 暫停：起手中按 Esc，1.2 秒內 windup 剩餘時間不變、不出招；繼續後出招一次。`resetGame()` 清除待出招（manualTiming=null）。
- 自動模式：齒輪設定切到自動後開始，2 秒內自動出招 3 次，manualTiming 保持 null，攻擊按鈕隱藏，不受時機積木影響。
- 兩種尺寸都沒有 JS 例外。

## §6 清單
- iPad／手機：沒有新增觸控元素以外的 media query、沒有 roundRect／at()／structuredClone；新增的是 Maker 內 span 時間軸。✅
- 遊戲邏輯：時間都用 dt 秒；暫停凍結；重開清除。✅
- 專案慣例：defaults.js 有 ✏️ Erin 可以改 註解；index.html、practice/preview 的 ?v= 與 sw.js 快取名都升到 20261026ac，timing.js 加進 precache 與 manifest。✅
- 無外部素材、繁中短字、範圍未超出卡片。✅

## 小備註（不擋）
- 預設手動普攻起手 0.1／收招 0.12，比之前討論的大劍 0.18／0.3 輕，等 Erin 試玩後在 Maker 調。
