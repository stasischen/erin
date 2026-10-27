# 美術清單 v2：方向、動畫、顯示與特效

任務：`survivor-art-manifest-v2`。由既有 artv2.md 整理為可公開規格；本檔與對應 JSON 是正式來源，舊 /tmp 副本不再驅動開工。

實作者與獨立審查員均在 Mac Studio 跑完整 `node games/survivor/tools/test.cjs --layout`；不新增 GitHub CI。一次一張，開 PR 後交獨立 session 審查，合併上線後回報並等家長決定下一步。

視覺方向：Q 版大頭、清楚外框、明亮配色；主角佔位試作用 64×64 單格，正式美術由家長轉達。

## 新增的「選填」清單欄位（舊資料不變）
1. 方向：directions（1／4／8）、directionOrder、mirror（例如 W 鏡像 E）。第一個試作用 S／E／N，W＝鏡像 E。
2. 排版：layout {cols, rows, margin, spacing}；每個方向的格子用 {方向:[格子...]} 或「一個方向一列」。
3. 顯示大小：displaySize／scale，縮放用 nearest（像素不模糊）；顯示大小和碰撞完全分開，碰撞仍由邏輯資料決定。找出並修正寫死的顯示大小。
4. 動畫：每個動畫可以有自己的 sheet、frameDurations、syncToPhase（windup／active／recovery 預設 true，拉長或縮短到邏輯秒數；idle／run 用 fps）。
5. 新動畫名稱：death、spawn、phase2、dodge，以及變體如 active_2。
6. 換圖時只有 idle／run／hurt 必填；缺的動畫退回 idle 或最接近的動畫，不可報錯。
7. 預警／特效可換皮：用 id 對應，vfx {fitTo, rotateWithAim, zLayer, blend, alpha, progressMode}；現在程式畫的預警仍是預設值。
8. palette、source、outline 欄位；受擊閃白與外框仍然套用在圖片上。
9. 補上缺少的 effect／gust 等特效條目。

## 測試圖檔與測試
- 加一張程式產生的佔位測試 PNG（3 方向＋鏡像的 64×64 sheet，不含任何 Erin 資料），證明 S／E／N 與鏡像 W 都能正確畫出。
- 純函式測試：欄位預設值、方向選擇與鏡像、格子座標、syncToPhase 時間換算、缺動畫退回、舊清單等價（畫面邏輯與玩法一致）。
- 更新 docs/godot-mapping.md：方向／鏡像 → AnimatedSprite2D flip_h、SpriteFrames 動畫命名、syncToPhase → speed_scale、vfx 欄位對應。
- 升版本號（version.json、?v=、sw.js）；實作者與審查員都在 Mac Studio 跑 `node games/survivor/tools/test.cjs --layout`，全部 PASS。Grok 審查會在 740×360、1024×461、1180×820 實際操作檢查。

## 共同規則
- 所有攻擊有預警；HUD 圓形、只有像素圖示，不用 emoji；固定橫向、全螢幕。
- 不放 Erin 個人資料、不放截圖到 repo。
