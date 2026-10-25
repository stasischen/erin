verdict: changes
979673edcaf5978eac53610fdc5dd043eb8d8136

# Grok 審查：survivor-landscape

範圍：`git diff main...codex/survivor-landscape`

## 看過的檔案
- games/survivor/game.js、index.html、style.css、tests/dash-skill.cjs
- manifest.webmanifest、sw.js
- coord/knowledge/DECISIONS.md、docs/survivor-landscape-validation.md、卡片與收件匣紀錄

## 已確認沒問題
- 橫拿提示、關閉按鈕、localStorage 記憶與直向縮小按鈕樣式都已移除，搜尋不到殘留。
- 旋轉方式 `rotate(90deg) translateY(-100%)`（transform-origin 左上）會讓容器剛好填滿直拿的螢幕，方向是順時針。
- `canvasPoint()` 的換算和順時針旋轉一致：遊戲 x = clientY − top、遊戲 y = right − clientX，並依比例縮放；pointerdown／pointermove 都改用它。仍只追蹤第一根手指的 pointerId，按鈕 pointerdown 有 stopPropagation。
- resize 用 canvas 的 clientWidth/clientHeight（不受 transform 影響），重設 imageSmoothingEnabled，放開舊搖桿與按鍵，保留進度、暫停與冷卻；也監聽 visualViewport resize。
- `?v=20261025f`、sw 快取 `erin-games-v10` 已更新；manifest 加 `orientation: landscape` 符合家長規格，JSON 可解析。
- 本機重跑：4 組 tests/*.cjs 全部 PASS，`node --check` game.js／sw.js 通過。
- 沒有新 API、沒有外部素材，文字繁中，沒超出卡片範圍。

## 需要修改
1. **直拿時 safe-area 對應方向反了**（style.css 的 `@media (orientation: portrait) .game-shell`）。
   容器是順時針轉 90 度，所以容器的「上邊」在螢幕右邊、「右邊」在螢幕下面、「下邊」在螢幕左邊、「左邊」在螢幕上面。
   正確對應應為：
   - `--safe-top: env(safe-area-inset-right)`
   - `--safe-right: env(safe-area-inset-bottom)`
   - `--safe-bottom: env(safe-area-inset-left)`
   - `--safe-left: env(safe-area-inset-top)`
   目前寫成上←左、右←上、下←右、左←下（這是逆時針的對應），和 `canvasPoint()` 的順時針換算互相矛盾。iPhone 直拿時，瀏海那一側（螢幕上方）會拿到底部橫條的邊距，動作按鈕所在的螢幕下方會拿到瀏海的邊距。請一併更新 docs/survivor-landscape-validation.md 與 DECISIONS.md 裡的對應描述；若方便，在測試裡加一行字串檢查鎖住這四個對應。

## 小建議（不擋）
- visualViewport resize 在 iOS 收合網址列時也會觸發，會放開正在按的搖桿；目前可接受，請在實機試玩時留意是否太常發生。
