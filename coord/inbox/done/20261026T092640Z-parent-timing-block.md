kind: request
lane: none
ref: survivor-timing-block
---
「現在MAKER已經太亂了 重新規劃一下怎麼拼圖化 設定跟MAKER感覺很多都混在一起」「主角跟敵人的攻擊模式應該可以用同一套拼圖？」「好 都改成同一套」

（Grok 轉述：家長已同意統一拼圖 8 步計畫，這是第 3 步。請建立卡片 coord/tasks/survivor-timing-block.json（todo）。）

## 本卡規格
1. 新增共用時機積木：前搖（起手）→ 生效 → 後搖（收招）→ 冷卻，資料驅動的純函式＋測試，主角與敵人共用。
2. 共用時間軸元件，在 Maker 編輯時顯示。
3. 敵人 phaseAttack 改讀這個時機積木（行為不變，舊存檔自動轉換）。
4. 主角攻擊加前後搖，後搖可被衝刺取消；先只在手動模式生效，數值可在 Maker 調整。

## 每張共通
- 舊存檔要能載入；升版本號。
- Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
- 審查者在 1024×461、740×360 實際上手操作。
- 整體路線圖見 docs/survivor-skill-backlog.md（統一拼圖 8 步）。
