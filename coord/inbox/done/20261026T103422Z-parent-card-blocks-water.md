kind: request
lane: none
ref: survivor-card-blocks-water
---
「現在MAKER已經太亂了 重新規劃一下怎麼拼圖化 設定跟MAKER感覺很多都混在一起」「主角跟敵人的攻擊模式應該可以用同一套拼圖？」「好 都改成同一套」

（Grok 轉述：家長已同意統一拼圖 8 步計畫，這是第 6（水流派，第 2/5 張） 步。請建立卡片 coord/tasks/survivor-card-blocks-water.json（todo）。）

## 本卡規格
1. 把「水流派」的 feature 卡片搬進共用積木系統（engine/effect-blocks.js 規則；照「靜電」「王冠」的做法：觸發＋條件＋動作，數值用 {ref:...} 參照共用數值）：
   water-attack、water-skill、water-dash、water-ultimate、fusion-puddle（合體）、water-drop、water-fountain、water-bubble、water-wet、water-rain
2. 每張卡都補「舊新等效測試」（同樣輸入下傷害、範圍、次數、時機與舊版一致），放進 tests/effect-blocks*.cjs／legacy 對照資料。
3. 搬完後卡片在 Maker「技能卡」分頁用積木堆顯示、可收合、可預覽；不再顯示成「原本組合」。
4. 遊戲行為與手感不變；其他流派的卡這次不動。

## 每張共通
- 舊存檔要能載入；升版本號。
- Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
- 審查者在 1024×461、740×360 實際上手操作（親手玩到這些卡、在 Maker 改數值看效果）。
- 整體路線圖見 docs/survivor-skill-backlog.md（統一拼圖 8 步）。
