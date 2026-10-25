kind: request
lane: none
ref: survivor-zone-summon-spawn
---
好從圈外

（Grok 轉述：這是小修正，要實作。Review 發現老師召喚的小怪會在縮小中的安全圈內隨機生成，可能直接出現在主角旁邊。規則是：敵人絕對不能在看得到的畫面內冒出來。接續最新的 main。請建立卡片 coord/tasks/survivor-zone-summon-spawn.json（todo）。）

- 老師召喚的小怪，以及老師戰縮圈期間其他所有敵人的生成，都必須在畫面外：用鏡頭視野加一段邊距，以 wrapped 距離判斷。可以在圈外的霧裡生成，再朝主角或圈內走進來。
- 敵人不會被霧扣血或減速。
- 生成點和主角保持最小距離。
- 加測試：老師戰期間，在幾種圈的大小下（包含最小的圈），沒有任何生成點落在鏡頭視野內。
- 升級 version.json。跑完整測試，包含真實 Chrome 的 --layout。
