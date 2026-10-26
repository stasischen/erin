kind: request
lane: none
ref: survivor-godot-art-prep
---
「照你建議 之後移到godot上整合美術要夠方便」

（Grok 轉述：家長之後想把遊戲移到 Godot 並換上正式美術，這張先把美術和邏輯拆開。請建立卡片 coord/tasks/survivor-godot-art-prep.json（todo）。遊戲玩法不變。）

## 1. 美術清單（asset manifest）
- 新增一個資料檔，用角色／招式／特效 id 對應：sprite sheet 路徑、單格大小、動畫名稱、fps、錨點（pivot）、命中框錨點。
- 所有繪圖都透過一個美術查詢函式；現在的像素圖是預設值，之後換圖只改清單、換掉佔位圖即可。

## 2. 命名與資料夾
- 資料夾結構仿照 Godot（對應 res://art/...），命名一致。
- 動畫名稱可直接當 SpriteFrames 用：idle / run / windup / active / recovery / hurt / stun。

## 3. 動畫事件
- 命中幀之類的事件由時機積木決定，不由美術決定；換圖不影響手感。

## 4. docs/godot-mapping.md
- 對照表：每種積木 → Godot Custom Resource；事件 → signal；Maker 資料 → .tres；測試 → headless GdUnit／godot --headless。

## 5. 等價測試
- 改用美術查詢前後畫面邏輯與遊戲行為一致（純函式等價測試）。

## 共同規則
- 所有攻擊都要有預警；HUD 按鈕圓形、只放像素圖示，不用 emoji；固定橫向、全螢幕。
- 寫法要方便之後移到 Godot：資料與邏輯分開、純函式可測。
- 測試：純函式測試；升版本號（version.json、?v=、sw.js）；Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。Grok 的審查會在 740×360、1024×461、1180×820 實際操作檢查，也會跑 layout 測試。
- 不放 Erin 個人資料、不放截圖到 repo。
