# 已知踩坑

以下問題曾在本 repo 發生；後續審查需特別留意。

- `b30f128`：觸控遊戲需停用頁面捲動、雙擊縮放、長按選取與系統選單；設定 `touch-action: none`、`user-select: none`、`-webkit-touch-callout: none`，並處理 `contextmenu`。
- `9b627ad`：搖桿與按鈕滑動會互相干擾；用 Pointer Events、`setPointerCapture`，只追蹤第一個 `pointerId`，暫停按鈕不可啟動搖桿。
- `9f5980b`：不要用 `(hover: hover) and (pointer: fine)` 等 media query 把平板觸控介面藏起來。
- `4bf7502`：舊 iPad 不支援 `ctx.roundRect`；改用 `rect` 或自畫路徑，也避免 `Array.prototype.at`、`structuredClone` 等較新 API。
- `612cbd8`：無敵計時需在碰撞判定之後扣除，否則最後一幀仍可能受傷。
- `df627e2`：HTML 引用的遊戲 JS/CSS 要更新 `?v=`，避免 iPad 使用舊快取。
