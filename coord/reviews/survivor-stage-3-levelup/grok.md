verdict: approve
ed55aab12f2d691e3a25bc130988be47428ed2bc

看了什麼：
- `git diff main...codex/survivor-stage-3-levelup`（重審，重點看 ed55aab 對上次三點的修正）：`games/survivor/game.js`、`index.html`、任務卡、收件匣回饋歸檔。
- `node --check games/survivor/game.js` 語法通過；沒有 `roundRect`、`.at()`、`structuredClone`。
- 對照 §6 清單與上一輪 grok.md 的必須修項目。

上次三點都修好了：
1. 水球畫回來了：`render()` 開頭依 `shot.r` 畫水球，加大升級看得出來。
2. 穿透不再重複打同一隻：每顆水球有 `hitList`（`takeFromPool` 用 `Object.assign` 每次發射給新陣列，等於清空），同一隻只打一次；水花四濺只在首次命中時觸發，被濺到的也記進清單。
3. Erin 設定區一行一個值、每行有小學生看得懂的註解；舊常數改成「請改上面的 xxx」；`MAX_DT`、`HIT_FLASH_SECONDS`、`KNOCKBACK_SPEED` 移出設定物件。

小建議也做了：`render()` 不再自己排程，改由 `renderLoop()` 驅動，所以 `showUpgradeChoices()` 前呼叫 `render()` 不會多開一條動畫迴圈；`UPGRADES` 每張卡有註解指向調整欄位；泡泡護盾說明已改。`?v=` 升到 `20261022g`。

可之後再看（不擋）：
- 被水花濺到的敵人會進 `hitList`，之後這顆穿透水球不會再直接打它；目前可接受。
- 敵人物件會回收再用，理論上同一顆水球飛行中遇到「重生」的甲本會略過它，極少發生、影響很小。
- `MAX_DT` 等三個常數緊貼在 Erin 設定區下方，可加一行註解「這幾個不用改」讓 Erin 分得清楚。
