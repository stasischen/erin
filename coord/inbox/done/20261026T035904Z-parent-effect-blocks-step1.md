kind: request
lane: none
ref: survivor-effect-blocks-step1
---
採用 重點是以後改技能方便

（Grok 轉述：這是回覆 PR #64 docs/survivor-effect-blocks.md 的效果積木設計。這張要實作遊戲程式。接續最新的 main。請建立卡片 coord/tasks/survivor-effect-blocks-step1.json（todo）。）

- 照那份文件做出效果積木引擎第一個可以運作的部分：
  - 觸發、條件、動作、修飾都用資料表示。
  - 邏輯和繪圖分開，方便移植。
  - 和現有的 effectLevel('<id>') 查詢並存，還沒遷移的卡要和現在完全一樣。
- 先只遷移兩個：靜電（thunder-static）和王冠（詛咒道具）。
  - 每個都要用「輸入 → 輸出」的等價測試證明結果完全相同。
  - 等價測試通過後，才拿掉它們舊的寫死分支。
- 家長的目標是以後改技能很方便，所以交接文件要：
  - 清楚示範怎麼只改資料就做出一張新卡。
  - 列出其他 47 個 feature 中，哪些用現有積木就能做、哪些需要新的積木類型。
- 修正文件錯誤：浪花水球的範例被寫成「濺水花／彈牆水波」。
- 欄位規則維持不變（還沒決定）。
- 這次還不做 Maker 的積木編輯器。
- 升級版本號。
- 只跑 `node games/survivor/tools/test.cjs`。不要加 --layout；--layout 由 Grok 審查時跑。
