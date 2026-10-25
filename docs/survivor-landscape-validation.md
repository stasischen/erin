# 固定橫向工程驗證

卡片：`survivor-landscape`；分支：`codex/survivor-landscape`。
來源：`coord/inbox/done/20261025T083857Z-parent-landscape.md`。

## 變更

- 移除橫拿提示、關閉按鈕、讀寫提示記憶的程式與直向縮小動作按鈕樣式。
- 橫拿時填滿可用畫面；直拿時整個容器順時針旋轉 90 度，寬高互換，包含選單、設定、升級卡與動作按鈕。短邊較小時使用同一套緊湊橫向版面，選單可捲動以保留所有操作。
- safe-area 在容器座標映射為上←左、右←上、下←右、左←下；按鈕保留在遊戲視角右下角。字體依長邊縮放，HUD 依容器寬度配置。
- Canvas 改用未旋轉的內容尺寸（排除邊框）；觸控由螢幕座標轉回遊戲座標，保留縮放比例。旋轉／調整視窗／可視區高度變更清掉舊搖桿與按鍵，保留遊戲進度、暫停模式與冷卻；重設繪圖縮放及像素平滑設定。
- 共用 `manifest.webmanifest` 加入 `orientation: landscape`，支援的 Android 安裝版會使用橫向偏好；這是整個遊戲樂園共用 manifest，其他遊戲的安裝版方向也受影響，請家長驗收時一併確認。一般網頁與 iOS 由本遊戲 CSS 處理橫向。
- JS/CSS 資源版本 `20261025f`，Service Worker 快取 `erin-games-v10`。

## 已完成工程檢查

- `node --check games/survivor/game.js`、`node --check sw.js`。
- `node games/survivor/tests/dash-skill.cjs`：保留衝刺／炸彈／冷卻／設定相容與多指回歸；新增橫向與旋轉後搖桿座標、非零原點、縮放、旋轉後兩指按技能與衝刺、Canvas 內容尺寸、縮小時玩家邊界、resize 清除輸入與保留進度／暫停／冷卻、移除舊提示邏輯。修正測試 Canvas stub 的 Proxy，讓 false 屬性可被正確讀取。
- `node games/survivor/tests/balance.cjs`、`node games/survivor/tests/enemy-shoot.cjs` 通過。
- manifest JSON 可解析，`git diff --check` 通過。

這些是作者工程檢查；獨立程式審查由 Grok 對 erin-watch 提交後的實質 SHA 執行。

## 待實機驗證

嘗試 `python3 -m http.server 8000 --bind 127.0.0.1`，沙盒回報 `PermissionError: Operation not permitted`。本輪無法啟動試玩伺服器；自動測試為 DOM／Canvas stub，未驗證瀏覽器渲染、瀏海／底部橫條、多點觸控或實際離線更新。

Grok 審查後，請家長啟動 repo 根目錄的 `python3 -m http.server 8000`，讓 Erin 確認：

1. iPad Safari、iPhone 直拿時畫面為橫向且填滿可用區域；橫拿恢復正常方向，反覆旋轉不裁切、不捲動整頁。收合／展開網址列後大小正確。
2. 瀏海與底部橫條不遮住返回、暫停或動作按鈕；開始、暫停、設定與升級三選一都能操作。小手機的選單能捲到全部按鈕。
3. 直拿與橫拿都能左手搖桿、右手衝刺／技能；拖曳方向與角色移動一致，第二根手指不接管搖桿；旋轉後需重新按下搖桿，進度及冷卻保留。
4. 不再出現橫拿提示，動作按鈕不再因直拿而縮小；請 Erin 確認橫向操作是否舒服。
5. Android 安裝版的方向、共用 manifest 對其他遊戲的影響，以及線上重整／離線重新開啟均使用新版。
