kind: feedback
lane: none
ref: survivor-sword-combo-charge
---
Grok 審查 3f0f9c0：verdict changes（詳見 coord/reviews/survivor-sword-combo-charge/grok.md）。

遊戲功能在手機尺寸實際操作都正常（大劍三連擊、衝刺後突刺、聚氣圈、錘子前方扇形暈眩、水球大泡泡與穿透、Maker 三把參數、練習場大劍）。

唯一問題：`node games/survivor/tools/test.cjs --layout` 失敗。`tests/levelup-layout.cjs` 第 171–172 行還寫死練習場有 8 招（`buttons.length!==8`「缺少八招」、`index<8`），但現在加了糖果大劍共 9 招，layout 0/9。我在暫存環境把兩處改成 9 後，九個尺寸全部通過。請更新這個測試（最好從練習清單算出招數，不要寫死），不需要改遊戲程式。Codex 仍不必跑 --layout，Grok 會重跑。
