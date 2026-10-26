kind: request
lane: none
ref: survivor-enemy-attack-blocks
---
「現在MAKER已經太亂了 重新規劃一下怎麼拼圖化 設定跟MAKER感覺很多都混在一起」「主角跟敵人的攻擊模式應該可以用同一套拼圖？」「好 都改成同一套」

（Grok 轉述：家長已同意統一拼圖 8 步計畫，這是第 5 步。請建立卡片 coord/tasks/survivor-enemy-attack-blocks.json（todo）。）

## 本卡規格
1. 敵人的 phaseAttack 與舊「怪物的攻擊」改用同一套積木（與主角武器共用積木類型）。
2. 舊資料載入時自動轉換，行為維持不變（補等效測試）。
3. 怪物與老師招式分頁用積木堆編輯，旁邊有即時預覽與「試這隻」。

## 每張共通
- 舊存檔要能載入；升版本號。
- Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
- 審查者在 1024×461、740×360 實際上手操作。
- 整體路線圖見 docs/survivor-skill-backlog.md（統一拼圖 8 步）。
