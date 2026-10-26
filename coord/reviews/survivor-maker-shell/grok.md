verdict: changes
a259afcfe47fc687dd1b0d51519b6bac5121b3f6

# Grok 審查：survivor-maker-shell（統一拼圖第 2 步：Maker 六分頁外殼）

## 檢查的檔案
- games/survivor/maker/maker.js、maker/style.css、index.html、style.css（設定面板底部列）
- practice-host.js、preview.js、practice.html、preview.html、version.json、sw.js（版本 20261026ab）
- tests/levelup-layout.cjs、tests/maker-ui.cjs
- docs/survivor-maker-shell-validation.md、coord/tasks/survivor-maker-shell.json

## 測試（在 Grok 的 box 執行，headless Chrome 156）
- `run-review-tests.sh a259afc`：一般測試全過，但 `levelup-layout.cjs` 在第一個尺寸 412×915 就失敗：`分類未放在上方`（layout 0/9）。
- 原因（測試問題，不是遊戲問題）：直向螢幕時 `.game-shell` 被旋轉 90°（transform `matrix(0,1,-1,0,…)`），新加的三個幾何檢查用 `getBoundingClientRect()` 的螢幕座標比上下左右，旋轉後「上方」變成螢幕右邊，所以判錯：
  1. 第 95 行 `nav.bottom > editor.top`（分類未放在上方）
  2. 第 97 行 `list.right > content.left`（左列重疊編輯區）
  3. 第 118 行設定面板 `controls.bottom <= actions.top`
- Grok 在 box 上只把這三處改成用未旋轉的版面座標（`offsetTop/offsetHeight`、`offsetLeft/offsetWidth`，設定面板同 offsetParent 比較），`levelup-layout.cjs --layout` 9/9 尺寸全部 PASS（含 412×915、461×1024 直向、732×310）。改法只是提示，Codex 可選自己的方式，只要直向旋轉時判斷正確。
- 直向 412×915 截圖目測：旋轉後分頁在上、左列在左、編輯在中間，版面本身正確。

## 親手操作（box，headless Chrome，觸控模擬，1024×461 與 740×360）
- 六分頁都在上方（y 52–96），逐一點擊可切換、aria-pressed 正確；每頁只有一個編輯面板。
- 每頁左列點到最後一項（糖果大劍／回力餅乾／棉花糖仙子／衝刺縮圈／巧克力大熊／魔王共用）都可點到；內容捲到底最後一個控制項可觸及、未被遮住。
- 規則頁 7 項（預設設定、碰撞與重量、中立道具、流派數值、基本玩法、流派共用、魔王共用）所有數值標籤都是中文，沒有原始欄位名或 undefined。
- 怪物：按「預覽」開啟右側預覽，即時小場景自動載入；1024×461 觸控拖移動速度滑桿 60→165，同一個 iframe 內仙子速度 58→165，立即更新。740×360 預覽是右側浮層，會蓋住右欄的移動速度滑桿；按「收起預覽」可收起再編輯（符合「小螢幕可收成開關」）。
- 切換怪物項目後只剩 1 個新的即時預覽 iframe，沒有殘留舊的。
- 「試這隻」開啟全螢幕練習場；武器「試玩」帶入糖果大劍練習場，拖搖桿主角移動（x 1454→1668），暫停→離開回到 Maker，練習場 iframe 移除。
- 技能卡「試玩」開啟單招展示浮層，「返回編輯」回到同一張卡；老師單招「試玩」同樣可開展示並返回。
- 「看這個積木的效果」會自動打開預覽並顯示展示。
- 規則→預設設定：展開後連按音樂、搖桿跟隨、改攻擊模式，<details> 一直保持展開（小修正 a 完成）。儲存後重新載入，playerDefaults 保留。
- 齒輪設定捲到底：最後的音效音量滑桿完整可見，「恢復預設／完成」在獨立底列、不遮擋（小修正 b 完成）；直向旋轉後按鈕仍在畫面內。
- 兩種尺寸都沒有 JS 例外。

## §6 清單
- iPad／手機：touch-action、Pointer 搖桿未改；沒有新 media query 隱藏觸控；沒用 roundRect/at/structuredClone；直橫向版面正確（見上，只有測試判錯）。
- 遊戲邏輯：戰鬥與資料格式未改，舊存檔載入測試通過。
- 專案慣例：所有 ?v= 與 SW 快取升到 20261026ab；無外部素材；繁中、字大。
- 範圍：只動 Maker 外殼、設定底部列與測試，未超出卡片。

## 結論
遊戲本身親手檢查全部 OK，不需改遊戲程式。只需修 levelup-layout.cjs 三個在直向旋轉時判錯的幾何檢查，讓 --layout 9/9 通過即可 approve。
