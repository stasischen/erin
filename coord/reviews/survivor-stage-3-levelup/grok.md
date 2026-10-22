verdict: changes
1dcf135853e460c00b31fac273c669ddd2c51e93

看了什麼：
- `git diff main...codex/survivor-stage-3-levelup`：`games/survivor/game.js`、`index.html`、`style.css`、任務卡、`DECISIONS.md`、`coord/inbox/done/20261022T070615Z-parent-stage3.md`。
- `node --check games/survivor/game.js` 語法通過；沒有 `roundRect`、`.at()`、`structuredClone`。
- 對照 §6 清單與收件匣的階段 3 規格。

做得好的：
- 三選一暫停、卡片不重複、Lv 顯示、鍵盤 1／2／3、全部滿級給回血卡、Erin 專屬卡空位都有。
- 升級時暫停、Esc／空白鍵在選卡時不會誤觸暫停；切 App 只在 playing 時暫停，不會蓋掉選卡畫面。
- `?v=` 已升到 `20261022f`；物件仍走物件池；重新開始會清掉 `upgrades`、`pendingChoices`。
- 打擊閃白 0.08 秒、擊退、傷害數字、寶石磁鐵都依規格。
- DECISIONS.md 有記階段 4／5 路線與勝利條件待定。

必須修：
1. 水球不見了：`render()` 裡畫水球的那一行（`for (const shot of state.projectiles) { ... }`）在這次 diff 被刪掉，現在水球完全不會畫出來。請加回來（大小用 `shot.r`，加大升級才看得出來）。
2. 穿透水球會重複打同一隻：水球打中後若 `pierce > 0` 會繼續飛，但下一幀還和同一隻甲本重疊，又會再打一次並再扣 `pierce`，等於同一隻被連打多次、穿透數被浪費。請讓每顆水球記住已經打過哪些敵人（例如 `shot.hitList` 陣列，從物件池拿出來時要清空），同一隻只打一次。水花四濺的範圍傷害也只在第一次命中該敵人時觸發。
3. ✏️ Erin 設定區：`UPGRADE_TUNING` 一整行塞了很多數字但沒有註解，下面 `PLAYER_SPEED` 等的註解還在，但 Erin 改那幾行已經不會生效（要改物件裡的值）。請把設定物件拆成一行一個值、每行附小學生看得懂的註解（改大會怎樣），舊的常數註解移到物件裡或註明「請改上面的數字」；`maxDt`、`hitFlashSeconds` 這類不給 Erin 調的值移出設定區。

小建議（可一起做）：
- 升級跳出時 `tick()` 直接 return，那一幀沒 `render()`；選卡回來沒差，但可在 `showUpgradeChoices()` 前呼叫一次 `render()`，讓背景停在最新畫面。
- `UPGRADES` 裡加一欄註解說明每張卡的效果數字在 `UPGRADE_TUNING` 哪個欄位，Erin 比較好找。
- 泡泡護盾說明「最大血量 +1」因為是血條，可改成「血條變長一點，並回一點血」。
