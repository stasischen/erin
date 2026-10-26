kind: request
lane: none
ref: survivor-knockback-slide
---
「現在擊退都像是瞬移很怪」

（Grok 轉述：請建立卡片 coord/tasks/survivor-knockback-slide.json（todo）。）

## 現況（Grok 讀 main）
- engine/combat.js 的 shiftTarget() 直接把位置一次改掉（瞬間位移）；效果積木 knockback、風流派、炸彈、中立道具、school-combat 的 shot.push、老師被炸彈推開都走這裡，所以看起來像瞬移。
- 武器命中的基本擊退（combat.js 第 118 行 enemy.knockback＋loop.js 第 279 行）已是每秒 90 的等速移動，但沒有減速，看起來很硬。

## 規格
1. 擊退改成「速度衝量」：在現有頓幀之後開始，約 0.15～0.25 秒內由快到慢（ease-out）滑開。
2. 會被牆、競技場邊界、碰撞擋住，不可穿牆；多次擊退要合理疊加（不爆衝）；重擊滑得更遠。
3. 主角、小怪、老師與各 Boss 都適用，統一走共用效果積木（取代 shiftTarget 的瞬移與舊的等速擊退）。
4. Maker 可調（距離、持續時間）；練習場的擊退箭頭工具仍要準確顯示最終位置。
5. 總位移與現在大致相同，平衡不變（補等效測試）。
6. 可選：滑動時腳下小煙塵，不用 emoji。
7. 純函式測試（衰減曲線、總距離、撞牆停止、疊加上限）；升版本號；Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
8. 審查者在 740×360、1024×461、1180×820 實際操作，確認擊退是滑開而不是瞬移。
