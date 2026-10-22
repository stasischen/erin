verdict: changes
9a44d3131b7cf3ddb1c5dd5ac2be34bc80b00d07

看了什麼：
- `git diff main...codex/survivor-stage-2-attack`（`c596a42`、`9a44d31`）：`games/survivor/game.js`、`index.html`、`style.css`；PWA 相關的 `sw.js`、`register-sw.js`、`manifest.webmanifest`、`assets/icon-*.png`、首頁與 8 個舊遊戲的 `index.html`；任務卡、`DECISIONS.md`、inbox/done 兩筆紀錄。
- 依 docs/survivor-game-plan.md §6 清單與階段 2「Grok 特別檢查」複查；`node --check` 檢查 `game.js`、`sw.js` 語法通過；確認 `sw.js` 預先快取的 43 個檔案都存在（任何一個 404 都會讓整個 service worker 裝不起來）。

階段 2 遊戲部分（沒問題）：
- 「最近的敵人」：`closestEnemy()` 一個一個比距離平方、跳過已死亡的，算法正確。
- 子彈、寶石、粒子都有上限（24／24／90），用 `takeFromPool` 重複使用，死掉的會放回池子；`resetGame()` 也會把三種物件收回池子並重設 xp、level、shotTimer。
- 飛出畫面（邊界外 12px）的水球會回收。
- Erin 的決定都照做：水球藍色、半徑是角色的 2/3（小三分之一）；寶石橘色；甲本打倒會「蒸發」（變扁變寬再淡出）。已記入 DECISIONS.md。
- 受擊閃白、傷害數字、敵人血條、經驗條、Lv 顯示都有；移動和計時用 `dt`；沒用 `roundRect`／`.at()`／`structuredClone`。
- 設定區新增射速、傷害、子彈速度、吸寶石範圍、顏色，註解 Erin 看得懂。`?v=` 已更新為 `20261022d`。

擋合併（PWA，家長要求「更新版本號時要能換新快取，不能讓玩家一直卡在舊版」）：
1. `sw.js` 對非頁面請求是「快取優先」而且 `ignoreSearch: true`。這會讓 `game.js?v=新版` 直接拿到快取裡的舊 `game.js`，等於把 §6 的 `?v=` 版本號機制（`df627e2` 老坑）整個廢掉。網頁本身是網路優先會拿到新版，結果變成「新 HTML 配舊 JS」，下一階段上線時很可能直接壞掉（例如新 HTML 少了舊 JS 要的元素，或新 JS 沒載入）。其他 8 個舊遊戲的 `game.js`／`style.css` 沒有 `?v=`，只要沒人記得改 `CACHE_NAME` 就永遠不會更新。
   建議修法（擇一）：
   - 最簡單：同源 `/erin/` 底下的請求一律「網路優先」，成功就更新快取，離線失敗才用 `caches.match(request, { ignoreSearch: true })` 當備案。
   - 或：非頁面請求不要用 `ignoreSearch`（帶 `?v=` 的新網址自然會去網路抓），只有離線失敗時才 `ignoreSearch` 退回。
   修完請在 `sw.js` 註解寫清楚更新規則，並把 `CACHE_NAME` 升一版。

小建議（不擋）：
- `startGame()` 第 82 行仍直接呼叫 `requestAnimationFrame(frame)`，沒經過 `scheduleFrame()`（階段 1 審查留下的建議）。
- 寶石外框是綠色 `#268b64`，配 Erin 指定的橘色有點怪，可改成深橘。
- 寶石數量到上限時打倒敵人就不掉寶石（經驗會少拿）；目前上限 24 應該很少碰到，之後敵人變多可考慮把新寶石併到最近的寶石上。
- 舊遊戲 `index.html` 新增的 meta 縮排不一致，只是排版。
- 經驗條是紫色；Erin 只指定了寶石顏色，可以問她經驗條要不要也改橘色。

結論：階段 2 遊戲本身可以玩，但 service worker 的快取規則要先修，不然上線後玩家會卡舊版。
