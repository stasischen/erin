kind: request
lane: none
ref: survivor-weapon-blocks
---
「現在MAKER已經太亂了 重新規劃一下怎麼拼圖化 設定跟MAKER感覺很多都混在一起」「主角跟敵人的攻擊模式應該可以用同一套拼圖？」「好 都改成同一套」

（Grok 轉述：家長已同意統一拼圖 8 步計畫，這是第 4 步。請建立卡片 coord/tasks/survivor-weapon-blocks.json（todo）。）

## 本卡規格
1. 武器的普攻連段、蓄力、特殊招、衝刺斬改成積木堆（觸發＋形狀＋時機＋效果＋回饋）。
2. 舊的連段／蓄力欄位在載入時自動轉換；手感與數值維持不變（補等效測試）。
3. 武器分頁用積木堆編輯，每塊可收合，旁邊有預覽與「試玩」。
4. 蓄力只放大朝前方的形狀，不做 360°。

## 每張共通
- 舊存檔要能載入；升版本號。
- Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
- 審查者在 1024×461、740×360 實際上手操作。
- 整體路線圖見 docs/survivor-skill-backlog.md（統一拼圖 8 步）。
