kind: request
lane: none
ref: survivor-feedback-block
---
「現在MAKER已經太亂了 重新規劃一下怎麼拼圖化 設定跟MAKER感覺很多都混在一起」「主角跟敵人的攻擊模式應該可以用同一套拼圖？」「好 都改成同一套」

（Grok 轉述：家長已同意統一拼圖 8 步計畫，這是第 7 步。請建立卡片 coord/tasks/survivor-feedback-block.json（todo）。）

## 本卡規格
1. 新增共用回饋積木：預警樣式、刀光、頓幀／震動強度、音效與提示，主角與敵人招式都可掛上。
2. 現有打擊回饋與敵人預警改由這個積木驅動，行為不變；玩家「設定」裡的強度／震動開關仍然套用。
3. 工具（Maker 預覽與練習場用）：0.25 倍慢動作／凍結、判定框／身體／擊退箭頭顯示開關、調整前後殘影對照、生怪工具（1／5／20 隻）。

## 每張共通
- 舊存檔要能載入；升版本號。
- Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
- 審查者在 1024×461、740×360 實際上手操作（親手玩到這些卡、在 Maker 改數值看效果）。
- 整體路線圖見 docs/survivor-skill-backlog.md（統一拼圖 8 步）。
