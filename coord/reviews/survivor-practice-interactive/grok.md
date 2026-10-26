verdict: changes
4d2d45dc74fa976e6968f766ed155aa74239886e

# Grok 審查：survivor-practice-interactive（20261026v）

## 看過的檔案
- `git diff main...codex/survivor-practice-interactive`：practice.html／practice.css／practice-engine.js／practice-host.js／practice-rules.js、maker/maker.js、maker/style.css、engine/combat.js、loop.js、pacing.js、index.html、preview.*、version.json、sw.js、tests/levelup-layout.cjs、tests/move-practice.cjs、docs/survivor-skill-backlog.md、docs/survivor-practice-interactive-validation.md
- 需求：coord/inbox/done/20261026T054927Z-parent-practice-interactive.md；§6 清單

## 測試
- Box（Grok 雲端電腦）`run-review-tests.sh 4d2d45d…`：**RESULT: FAIL**。標準測試 67 PASS，`levelup-layout.cjs` 只跑完 412×915 一個尺寸就「Chrome 測試逾時」（layout 1/9）。
- Mac Studio `node games/survivor/tools/test.cjs --layout`：同樣 67 PASS、`levelup-layout.cjs` 在第一個尺寸後「Chrome 測試逾時」。兩台都重現，不是字型或機器差異。
- 診斷（box，把 45 秒上限改成 400 秒本機副本，不提交）：仍然卡住。加 log 後確認：第一個尺寸 PASS 後，第二輪迴圈的 `Emulation.setDeviceMetricsOverride`、`setTouchEmulationEnabled` 有回應，`await call('Page.enable')` 永遠不回；此時頁面本身仍可 `Runtime.evaluate`。補上 `e` 的 keyUp 也沒用。推測（請 Codex 自行驗證）：新加的多指觸控／鍵盤或練習 iframe 流程讓同一 session 第二次 `Page.enable` 卡住；main 上同一迴圈原本 9/9 通過。

## 實際操作（box headless Chrome、觸控模擬、1024×461 與 740×360，CDP 真實觸控）
- Maker「練習場」分頁：練習 iframe 填滿 1024×461／740×360 全畫面；左上招式鍵、右上暫停鍵、上方中央統計、上緣四色時間軸，右下衝刺／技能圓鍵，互不重疊。
- 左側拖曳搖桿：主角確實移動（x 1456→1656）；第一指按住時第二指按衝刺：dashTimer>0、衝刺冷卻開始；抬起第二指後第一指往左拖，主角往左走（1717→1530）。
- 技能鍵：技能冷卻開始 7.77 秒。武器練習時兩個木樁持續朝主角走過來。
- 招式鍵：暫停（mode paused），八招圖示、標記說明、加速勾選、重設／繼續／離開都看得到；點蘑菇切換成功並回到遊戲。
- 閃避計分：布丁、蘑菇、棉花糖仙子、甜甜圈、跳跳糖各練約 12 秒，看到「躲開了！」「被打到了」，統計會變（例：跳跳糖 躲開 5・連續 5・挑戰 5/10；蘑菇 躲開 1・被打 1・連續 0）。
- 暫停→離開：回到 Maker 先前分頁。
- 怪物頁：8 個「即時預覽」開關、8 個「試這隻」。打開第一隻（jaben）預覽：小競技場 855×160（740 寬時 571×160）出招中；用觸控把「移動速度」拉桿從 75 拉到 170，同一個 iframe 的 practiceEnemy 速度立刻變 170，不用重開。
- 「試這隻」：開全螢幕練習，對手 jaben、速度 170；搖桿可移動，被打會計數。
- 結論：卡片承諾的互動在兩個手機尺寸都實際有效。

## §6 清單
- 練習層 touch-action none／user-select none／touch-callout none ✓；dt 上限 0.05 ✓；切 App（blur）暫停 ✓；沒有 roundRect／structuredClone／.at（.at 只在測試）✓；版本 ?v=20261026v、sw.js 已升 ✓；無外部網址 ✓；繁中、不嚇人 ✓；未超出卡片範圍（C 只改文件）✓。

## 需要修改
1. `tests/levelup-layout.cjs` 在第二個尺寸卡在 `Page.enable`，整個 --layout 無法完成（box 與 Mac Studio 都重現）。請修好讓 9 個尺寸都跑完（例如每個尺寸用新 target／session，或只在開頭 enable 一次、或在離開練習場後確實釋放觸控／按鍵）；不要只把逾時拉長。遊戲本身的操作看起來沒問題，修好測試後 Grok 會再跑一次 --layout 並複驗。

測試執行機器：box（主要）＋ Mac Studio（交叉確認）。
