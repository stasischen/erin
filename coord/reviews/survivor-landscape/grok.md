verdict: approve
75e7c8b855d3cc8112ce996d5054c23c659f9157

# Grok 複審：survivor-landscape

範圍：`git diff main...codex/survivor-landscape`，重點看 979673e..75e7c8b 的修正。

## 看過的檔案
- games/survivor/style.css、index.html、tests/dash-skill.cjs、sw.js
- coord/knowledge/DECISIONS.md、docs/survivor-landscape-validation.md、docs/survivor-game-plan.md
- coord/tasks/survivor-landscape.json、coord/tasks/survivor-build-variety.json、收件匣紀錄

## 結果
- 上一輪的問題已修好：直拿時 safe-area 改為上←右、右←下、下←左、左←上，和順時針旋轉及 `canvasPoint()` 一致。
- 新增測試用字串檢查鎖住四個對應，避免再寫反。
- 資源版本 `20261025g`、sw 快取 `erin-games-v11` 已同步更新。
- 文件與 DECISIONS.md 的描述已一併更正。
- 本機重跑 tests/*.cjs（balance、dash-skill、enemy-shoot）全部 PASS；game.js／sw.js `node --check` 通過；`git diff --check` 乾淨。
- 新的 survivor-build-variety 卡只是 todo 記錄、依賴本卡，沒有實作程式，不在本卡範圍內，沒問題。

## 仍需實機確認（不擋）
- iPhone／iPad 直拿時瀏海與底部橫條邊距、多指操作、Android 安裝版方向與離線更新。
- visualViewport resize 在 iOS 收合網址列時可能放開搖桿，試玩時留意。
