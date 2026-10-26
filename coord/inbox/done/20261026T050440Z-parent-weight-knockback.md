kind: request
lane: none
ref: survivor-weight-knockback
---
擊退跟吸引效果會因為怪大小有差嗎？

好

（Grok 轉述：「好」是同意這個做法。這張要實作遊戲程式。接續最新的 main。請建立卡片 coord/tasks/survivor-weight-knockback.json（todo）。）

目前的發現：下面這些都讓每隻敵人移動固定的距離，不管怪物大小，連老師 Boss 也會被推動：
- shiftTarget（engine/combat.js:145）
- 炸彈的 pushAway（combat.js:409）
- 炸彈的吸引（-pullDistance，combat.js:399）
- 浪花水球的 shiftTarget（neutral.js:63，wavePush 55）
- Maker 的擊退積木
- 命中擊退（combat.js:98／loop.js:250 KNOCKBACK_SPEED）

body-separation.js 已經有分配質量：一般 1、坦克／小頭目 8、Boss 40。

要做的：
- 一個共用的質量函式：沿用 body-separation 的質量，依敵人種類用資料決定，讓 Maker 做的敵人也能設定。
- 所有擊退和吸引效果的距離，都用質量的純函式來縮放，例如 distance * 1/(1+(mass-1)*k)。
  - k（重量影響多少）可以在 Maker 調整，並有開關。
- 一般敵人不變；坦克只移動一點點；老師幾乎不動或完全不動（讓她固定住，有預警的衝撞和攻擊才會正確）。
- 風的視覺線要顯示實際縮放後的距離。
- 不能破壞的東西：
  - 不能讓畫面外生成的敵人被奇怪地推進畫面。
  - 浪花水球的碰撞傷害（兩隻怪互撞）要繼續有效。
  - 效果積木的等價測試（靜電、王冠）要繼續通過。
- 留一個 hook，給之後精英怪的霸體使用。
- 加回歸測試：縮放函式，以及每一條效果路徑。
- 升級版本號。方便移植 Godot。
- 只跑 `node games/survivor/tools/test.cjs`。不要加 --layout；--layout 由 Grok 審查時跑。
