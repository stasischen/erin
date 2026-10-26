kind: request
lane: none
ref: survivor-effect-blocks-plan
---
我們現在的架構技能重新設計是不是相對簡單？

我想知道ISSAC 黑帝斯 BROTATO各技能 武器 的基礎架構是什麼 看怎麼重新排列組合

好 變成一堆NODE?

（Grok 轉述：這張只寫文件，Codex 不要實作任何東西、不要改任何遊戲程式。接續最新的 main。請建立卡片 coord/tasks/survivor-effect-blocks-plan.json（todo）。）

在 docs/survivor-game-plan.md 加一節「效果積木架構（設計，不實作）」，或新增 docs/survivor-effect-blocks.md 並從遊戲計畫連過去。內容：

1. 目前狀況（請對照程式碼確認）：
   - 卡片的 name、school、slot、rarity、requires、effects（type／feature／power）、descriptionMelee 都是資料。
   - 但大約 49 個 feature 是在 engine/combat.js、weapons.js、neutral.js、school-combat.js、loop.js 裡用 effectLevel('<id>') 依 id 判斷的。
   - 所以重新排列卡片很簡單，但新的效果需要寫程式。
2. 三個參考遊戲的架構：
   - 以撒：道具數值，加上可以疊加的子彈旗標，集滿 3 件套裝道具會變身。
   - 黑帝斯：固定的武器加上武器面相（aspect）；5 個欄位各放一個神的祝福；每個神有一種狀態，祂的其他祝福會加強這個狀態；雙神祝福；鐵鎚會改變武器。
   - Brotato：最多 6 把自動武器，有類別標籤和套裝加成；數值成長；有取捨的道具；角色限制。
3. 我們的重新組合：
   - 武器決定攻擊的形狀（像 Brotato 的類別：遠程、近戰，之後再加）。
   - 流派決定每個欄位的狀態；我們的攻擊／技能／衝刺／被動欄位就像黑帝斯的欄位（水擊退、風速度、雷連鎖、冰冰凍、火燃燒、糖黏住）。
   - 中立道具像以撒可疊加的旗標和數值，同時套用到子彈和揮擊。
4. 效果積木模型（用資料表示，不是視覺化的節點編輯器）：
   - 觸發：onHit、onKill、onDash、onPerfectDodge、onTimer、onPickup、onSchoolCount
   - 條件（可選）：目標有某個狀態、機率、冷卻
   - 動作清單：傷害、施加狀態、推開、產生投射物、產生水窪或區域、回血、護盾、連鎖
   - 修飾：數值增減，子彈或揮擊旗標（穿透、分裂、追蹤、擊退、爆炸、大小）
   - 用 4–5 張現有的卡改寫成 JSON 範例，例如浪花水球、靜電、導電水窪（雙流派）、王冠（詛咒）、一張近戰揮擊修飾卡。
5. 遷移計畫：
   - 一次只遷移一個 feature，並用測試保護：每張遷移的卡都有「輸入 → 輸出」的等價測試。
   - 列出哪些卡比較難遷移。
   - 之後 Maker 怎麼用下拉選單編輯積木。
   - 為什麼這樣對移植 Godot 有幫助（Godot 的 Resource）。

除了程式裡已經有的數字，不要自己編新的數值。只改文件。
