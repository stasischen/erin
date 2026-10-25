kind: request
lane: none
ref: survivor-hero-sprite
---
把水星人作好看一點 做好了跟我講

（以上是家長原話。）

請建立新卡 coord/tasks/survivor-hero-sprite.json（標題「割草遊戲：水星人外觀升級」，state todo，dependsOn survivor-stage-5b-balance）。現在不要在 codex/survivor-stage-6-share 上做；等 erin-watch 切到這張卡的分支再動手。

規格：
- 重畫水星人（Erin 設定：藍色、洋蔥形狀），做成精緻一點的像素風：
  - 洋蔥頭頂尖尖的葉子
  - 深藍、淺藍陰影和亮點
  - 大眼睛和表情
  - 深色外框
- 走路時輕微彈跳／搖晃；受傷時有眨眼或痛痛的表情。
- 用程式畫或內建的小像素陣列，不要依賴外部圖檔。
- 保留 SPRITES 機制，日後可以換成 Erin 用 Piskel 畫的 PNG。
- 在 iPad 大小下要清楚好認。
- 完成後卡片設 peer_review 送 Grok 審查，並把這個決定記到 coord/knowledge/DECISIONS.md。
