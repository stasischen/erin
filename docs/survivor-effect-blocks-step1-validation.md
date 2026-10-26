# 效果積木第一步：靜電與王冠

家長要求：以後改技能方便，先保留玩法，遷移 `thunder-static` 與 `item-crown`。遊戲版本 `20261026p`。欄位仍只分類，Maker 格式及編輯器未改。

## 實作與資料契約

`engine/effect-blocks.js` 的 `recipes` 是可 JSON 序列化的資料，沒有函式或可執行字串。純函式 `step(input, definitions)` 回傳新 timers 和事件，不修改輸入；`modify(stat, base, levels, data, definitions)` 回傳數值。definitions 可省略，使用 recipes。版本為 1，尚未成為外部作品格式；不接受直接匯入 Maker。運算與引用為白名單，不使用 eval。

- 觸發：`onTimer`；interval 為秒。未初始化先等一個完整間隔；每次更新至多一跳，負的剩餘時間繼續累加，不補跑迴圈。規則 id 是 timer key，須唯一；目前每 feature 一個角色實例，不支援區域實例。
- 條件：`touching`，以 `hypot(dx,dy) < player.r + target.r + padding` 判斷。dx/dy 由外層傳環繞世界最短距離；目標合法性、視野及 Boss 入場保護由 `combatTargets` 保留。
- 動作：依每個目標、陣列順序輸出 `cue/lightning` 和 `damage`；amount 是基礎傷害。事件含 source 規則 id 及 targetId；接合層以 WeakMap 配發同一實體跨幀穩定的 id，並在本次同步批次建立物件對照表；事件只同步消費。
- 修飾：stat 為 `neutralDamageMultiplier`、`maxHealth`；運算為 multiply/subtract。數值運算式支援有限數值、add 及四個設定引用：`schoolRules.staticSeconds/staticDamage`、`neutralRules.crownDamage/crownHealth`。其他設定路徑需另加白名單。
- 等級仍由 `effectLevel` 加總卡等級 × power，封頂 5；存在就掛一次。靜電傷害不隨等級倍增，王冠不重複扣血。

`school-combat.js` 接合事件與既有 `lightning/hitBuildTarget`。每次傷害後仍檢查勝敗，停止後續事件；傷害入口仍處理濕潤、金庫、王冠與死亡獎勵。王冠在金庫倍率後乘算；最大血量在泡泡護盾之後扣王冠、最後至少 1。取得卡片仍沿用 `applyUpgrade` 的目前血量壓上限，不回血、不重複扣目前血量。未遷移效果使用原分支，不會再跑一份積木。

## 只改資料做新卡的例子

以下是開發者修改內建資料的示範，**本次沒有新增這張卡或決定其玩法**。名稱與數值僅用來示範；正式加入仍由 Erin 決定。

1. 在 `data/defaults.js` 複製靜電卡，改成新 id/name/icon，保持完整欄位，例如 id `example-pulse`，effects 改成 `[{"type":"chain","feature":"example-pulse","power":1}]`。選用已存在的 icon。內建卡集合會成為 schema 的合法 id 集合；舊 Maker 作品仍由現有遷移補齊預設卡。
2. 在 `engine/effect-blocks.js` 的 recipes 加入以下物件：

```json
{
  "feature": "example-pulse",
  "rules": [{
    "id": "example-pulse",
    "trigger": "onTimer",
    "interval": 2,
    "conditions": [{"type": "touching", "padding": 8}],
    "actions": [
      {"type": "cue", "cue": "lightning"},
      {"type": "damage", "amount": 7}
    ]
  }]
}
```

這樣就是每 2 秒對接觸範圍加 8 的合法目標造成 7 基礎傷害，不需改執行器或接合層。接合層會查所有 recipe 的 feature 合併等級；規則 id 不要與其他卡共用。要調速度、傷害或拿掉閃電提示，只改此物件。兩把武器都適用，不依賴武器事件。

目前新增「獨立卡 id」需修改內建預設資料，不能透過 Maker 任意新增 id。Maker 已可在現有合法卡上改名並重組靜電 feature，這會與其他靜電卡合併成同一效果，並非獨立計時新卡。常駐修飾目前只接兩個指定 stat，新增其他 stat 或傷害來源需新接合位置。

## 其餘 47 個 feature 盤點

以下「需新積木」也包括新的事件或接合位置；不能因為有定時傷害就宣稱整張卡已能遷移。**完整等價只靠目前積木可完成：0 個**。只支援靜電型定時接觸傷害、閃電提示及王冠兩種修飾；下面均未遷移。

| feature（逐一列出） | 尚缺的積木／接合 |
|---|---|
| big-water、rapid-water、multi-water、piercing-water | 武器數值 stat／上限、投射物旗標、近戰角度對應及攻擊時接合 |
| onion-dash | 衝刺加速、持續時間與充能 stat |
| bubble-shield | 最大血量加算、取得時回血、既有護盾成長公式 |
| gem-magnet | 拾取半徑 stat 與拾取接合 |
| splash-water、water-attack | 命中事件、排除主目標、範圍選取、濺射基礎傷害公式 |
| auto-heal | 定時器可重用；缺回血動作與滿血上限 |
| water-skill、water-dash、fusion-puddle、fusion-storm、fusion-dash | 命中／技能／衝刺階段、區域生命與 tick、狀態／區域來源、共享生成去重與順序 |
| water-ultimate、wind-ultimate、thunder-ultimate | 終極啟動／結束與獨立時鐘、多目標選取、各系動作及特效接合 |
| wind-attack、wind-blade | 命中後衍生投射物／近戰追斬、來源鏈與去重 |
| wind-dash、wind-speed | 武器／移動／衝刺 stat、移動比例條件 |
| thunder-attack、thunder-skill、thunder-counter、thunder-super | 命中／受擊、連鎖選取與次數、全額連鎖與範圍公式 |
| water-drop、thunder-charge | 攻擊／殺敵計數、下一發消耗、大小／擊退／蓄電修飾 |
| water-fountain、wind-gust | 定時器可重用；缺圓形範圍、擊退，噴泉另缺濕潤與提示 |
| water-bubble、wind-refund、thunder-step | 衝刺結束／穿越、護盾消耗、半格退款、路徑選取／暈眩 |
| water-wet | 命中附狀態、濕潤條件、傷害接合乘算 |
| water-rain | 定時器可重用；缺持續全場狀態、畫面外狀態與畫面內傷害分界 |
| wind-light | 移速、拾取半徑、穿身規則 |
| wind-eye | 站定累積條件、持續推開、擋敵彈 |
| thunder-rod | 定時器概念可重用；缺區域 instance／壽命／初始 tick／容量與範圍選取 |
| item-wall（浪花水球） | 擊退、掃掠碰撞、雙目標共用冷卻、防遞迴與武器對應 |
| item-candy | 殺敵事件／機率抽樣、延遲炸彈區域、容量與連鎖延後 |
| item-bird | 環繞位置、最近目標選取、攻擊成功才消耗冷卻 |
| item-bank、item-cookie | 撿寶石／殺敵計數、門檻／上限；金庫乘算順序、餅乾回血 |
| item-split、item-rear | 生成投射物、共享命中名單、分裂一次、後方近戰去重 |
| item-magnet | 拾取半徑乘算的 stat 接合與牽引 |
| item-clover | 取得事件、一次重抽額度、抽卡權重 |

## 輸入 → 輸出驗證與移植

`tests/effect-blocks-legacy.json` 保存修改前的三個函式作為獨立比較基準，只供測試，遊戲不載入。`tests/effect-blocks.cjs` 在兩個獨立遊戲 VM 裡輸入相同狀態、操作、dt 與固定亂數，對照新舊血量、敵人／Boss、計時、事件順序、擊殺／掉落、畫面提示與倍率。另直接驗證純規則輸出及不修改輸入。

- 靜電：半徑 10，目標半徑 10，距離 20／23，dt=1 → 只對第一個輸出閃電與 20 傷害；等號排除。包含未到時、長 dt 一跳、負 timer、Lv1／5、共享 feature power、無敵狀態、自訂間隔／傷害、環繞座標、畫面外、Boss 保護與死亡停止。
- 王冠：90 最大／目前血量，無其他增益取得 → 89／89；20 目前血量取得 → 仍 20；倍率 1.3。包含有無王冠、Lv5 不重複、自訂代價／增傷、泡泡護盾、最大至少 1、金庫封頂與濕潤順序、反覆重算。
- 新資料範例：測試不改執行器，提供新 feature、timer id 與固定傷害 recipe，得到 7 傷害。

驗證結果：`node games/survivor/tools/test.cjs` 全部通過（含新增等價測試、Maker 自訂數值預覽、所有既有回歸與資源快取檢查）。版面 `--layout` 交 Grok 審查，這不是 Codex 自我審查紀錄。

Godot §11：本次抽出可序列化內建資料、純函式與事件，保留固定輸入／輸出及秒／世界座標。素材／音訊未變。尚未抽外部 JSON、建立可跨存檔還原的實體 id、區域 instance、完整來源鏈、Resource 轉換或 Maker 編輯器，後續另卡；目前事件只同步消費，沒有衍生攻擊重入。其他 47 個效果維持既有程式，沒有全面純化。
