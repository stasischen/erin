# 已知踩坑

以下問題曾在本 repo 發生；後續審查需特別留意。

- `b30f128`：觸控遊戲需停用頁面捲動、雙擊縮放、長按選取與系統選單；設定 `touch-action: none`、`user-select: none`、`-webkit-touch-callout: none`，並處理 `contextmenu`。
- `9b627ad`：搖桿與按鈕滑動會互相干擾；用 Pointer Events、`setPointerCapture`，只追蹤第一個 `pointerId`，暫停按鈕不可啟動搖桿。
- `9f5980b`：不要用 `(hover: hover) and (pointer: fine)` 等 media query 把平板觸控介面藏起來。
- `4bf7502`：舊 iPad 不支援 `ctx.roundRect`；改用 `rect` 或自畫路徑，也避免 `Array.prototype.at`、`structuredClone` 等較新 API。
- `612cbd8`：無敵計時需在碰撞判定之後扣除，否則最後一幀仍可能受傷。
- `df627e2`：HTML 引用的遊戲 JS/CSS 要更新 `?v=`，避免 iPad 使用舊快取。


## 輸入事件與 Maker 控件語意（2026-10-28）

- 鍵盤回歸需送真實註冊的 keydown／keyup，並在放開後以 movementInput／實際 tick 或瀏覽器位置確認停步；直接操作 Set 不能覆蓋鍵名配對。
- 新數字欄位可能和舊布林共用 key 名；UI 類型應依實際 bounds／語意。真 Chrome 的控件角色、數值／加減、保存／重載／恢復預設需另驗；API 構造作品→保存→VM載入只能稱資料/API接合檢查，不能稱實際 Maker UI smoke。
