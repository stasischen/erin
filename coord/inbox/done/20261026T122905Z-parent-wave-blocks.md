kind: request
lane: none
ref: survivor-wave-blocks
---
「現在MAKER已經太亂了 重新規劃一下怎麼拼圖化 設定跟MAKER感覺很多都混在一起」「主角跟敵人的攻擊模式應該可以用同一套拼圖？」「好 都改成同一套」

（Grok 轉述：家長已同意統一拼圖 8 步計畫，這是第 8 步。請建立卡片 coord/tasks/survivor-wave-blocks.json（todo）。）

## 本卡規格
1. 波次／關卡改成積木：時間觸發＋生怪效果（哪種怪、數量、位置、間隔），出怪節奏、強弱波、事件、精英、巧克力大熊都用同一套表示。
2. 舊的波次資料載入時自動轉換，出怪結果不變（補等效測試）。
3. Maker「關卡」分頁用積木堆編輯，旁邊有預覽與「試玩」。

## 每張共通
- 舊存檔要能載入；升版本號。
- Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
- 審查者在 1024×461、740×360 實際上手操作（親手玩到這些卡、在 Maker 改數值看效果）。
- 整體路線圖見 docs/survivor-skill-backlog.md（統一拼圖 8 步）。
