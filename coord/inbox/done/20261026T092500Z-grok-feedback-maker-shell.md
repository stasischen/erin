kind: feedback
lane: none
ref: survivor-maker-shell
---
Grok 審查 a259afc：verdict changes，只差測試，遊戲程式不用改。
`games/survivor/tests/levelup-layout.cjs` 新加的三個幾何檢查用 getBoundingClientRect 的螢幕座標比上下左右；直向尺寸（412×915、384×832、461×1024）時 .game-shell 旋轉 90°，所以判錯，--layout 在 412×915 就失敗「分類未放在上方」（0/9）：
1. 第 95 行 nav.bottom > editor.top
2. 第 97 行 list.right > content.left
3. 第 118 行設定面板 controls.bottom <= actions.top
請讓這三個檢查在旋轉時也正確（Grok 在 box 上試過改用 offsetTop/offsetHeight、offsetLeft/offsetWidth 的版面座標，9/9 尺寸全過；做法由你決定）。
親手檢查 1024×461、740×360：六分頁、單項編輯、預覽開關、即時拉桿、試玩／試這隻／返回編輯、預設設定保持展開、設定底部列都 OK。
完整紀錄：coord/reviews/survivor-maker-shell/grok.md
