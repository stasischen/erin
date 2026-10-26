# 效果積木架構（設計，不實作）

來源：[家長的原話與文件要求](../coord/inbox/done/20261026T032325Z-parent-effect-blocks-plan.md)。本文件只提出可討論的資料模型與遷移方式，沒有改遊戲程式、Maker、數值或作品格式，也沒有決定重構時程。

可以把技能想成食譜：武器選鍋子，流派選味道，中立道具加配料。已有配料可以重排；要做引擎還不認識的配料，仍然需要寫程式。這裡的「積木／node」是 JSON 裡的規則資料，不是視覺化節點編輯器，也不是每個效果都建立一個 Godot Node。

## 1. 目前程式實際能做什麼

本次對照目前分支的 `games/survivor/`，結果如下：

| 項目 | 程式依據 | 現況 |
|---|---|---|
| 卡片內容 | [data/defaults.js](../games/survivor/data/defaults.js)、[data/schema.js](../games/survivor/data/schema.js) | `name`、`school`、`slot`、`rarity`、`requires`、`effects` 的 `type/feature/power`、`descriptionMelee` 都是資料；雙系另有 `schools`。資料目前包在 JS，尚未獨立成 JSON。 |
| 固定配方 | [engine/combat.js](../games/survivor/engine/combat.js) 的 `effectLevel` | 預設有 **49 張卡、49 個不同 feature**。效果等級是所有已持有卡的「卡等級 × power」加總，上限 5；不是只查卡片 id。 |
| 效果實作 | `engine/combat.js`、`weapons.js`、`neutral.js`、`school-combat.js`、`loop.js` | 以固定 feature id 分支執行。另有動態組字的查詢，不能只數 `effectLevel('字串')` 次數。`schools.js` 管流派數量／解鎖，`ui/levelup.js` 也有取得卡片時的特殊處理。 |
| 現有通用積木 | `data/schema.js` 的 `TYPES`、`engine/combat.js` 的 `triggerMakerEffects/executeMakerEffect` | 已有投射物、範圍傷害、連鎖、痕跡、緩速、暈眩、擊退、召喚、缺口圈九種；觸發為 `hit/skill/dash/interval`。尚不是本文件提出的完整模型。 |
| Maker 邊界 | `data/schema.js` | 既有 feature 必須配合法定 type；每卡目前限制 1–3 個效果，card id 集合也受預設表限制。不能任意輸入新 id、新欄位或把以下範例直接匯入。 |

因此改名稱、前置條件、品質或重組已支援配方相對簡單；新增引擎尚不認識的效果需要程式、驗證及展示支援。`type: "chain"` 也不代表一定連鎖：例如靜電實際是定時近身傷害，導電水窪則是水窪每次跳傷害額外放電。

`slot` 目前是分類，不是黑帝斯「同欄只能一個核心祝福」的裝備限制。`descriptionMelee` 只改說明，實際近戰效果仍在程式中對應；多重水球變大揮擊角度，風刃變近距追斬，彈牆與分裂目前不適用錘子。不能只改文案就宣稱所有旗標已跨武器通用。

## 2. 三款遊戲可以借用的組合方式

以下以《以撒：Rebirth／Repentance》、《黑帝斯》第一代與《Brotato》說明**玩家可見的組合規則**。表中拆法是我們用來理解設計的整理，不是宣稱已取得三款遊戲的內部程式架構。

| 遊戲 | 基礎層次 | 我們可以借用什麼 |
|---|---|---|
| 以撒 | 道具改數值及眼淚行為；多種旗標可組合，但仍有相容例外。Guppy 等變身以收集指定套裝中的三件觸發，並非任何三件道具都變身。 | 把穿透、追蹤、分裂等行為與傷害／大小等數值分開；用套裝標籤計數做額外獎勵。 |
| 黑帝斯 | 起始武器＋武器面相（aspect）；攻擊、特殊攻擊、投彈、衝刺、求援五個核心欄位各放一個核心祝福，可來自不同神。其他祝福可以同時持有；雙神祝福要求雙方前置，鐵鎚改武器招式。 | 武器負責招式，欄位承接祝福；輔助卡深化狀態，雙流派卡連接兩套效果。 |
| Brotato | 多數角色最多六把自動武器；武器有近戰／遠程類型、類別標籤與同類套裝加成，傷害受對應數值成長影響。道具有增益與取捨，角色另有能力或限制；武器上限有角色例外。 | 把攻擊形狀、成長數值、類別獎勵及角色規則分層；不用把每把武器與每張道具寫成一個獨立特例。 |

以撒的旗標可查 [Lua API 的 TearFlags](https://wofsauge.github.io/IsaacDocs/rep/enums/TearFlags.html)，套裝例子見 [Guppy 條目](https://bindingofisaacrebirth.wiki.gg/wiki/Cat)。黑帝斯的五欄與雙神條件見 [Boons](https://hades.fandom.com/wiki/Boons)，武器面相、祝福與鐵鎚的區分也可對照 [Supergiant 官方更新紀錄](https://www.supergiantgames.com/blog/hades-updates/)。Brotato 的分類、成長與上限例外見 [Weapons](https://brotato.wiki.spellsandguns.com/Weapons)，角色及道具見 [Characters](https://brotato.wiki.spellsandguns.com/Characters)、[Items](https://brotato.wiki.spellsandguns.com/Items)。Wiki 用於玩法核對，沒有據此推定私有引擎實作。

「每個神有一種狀態」適合當簡化設計方向，但不是黑帝斯所有神都遵守的硬規則：例如酒神宿醉、冰神寒冷較接近此模型，其他神也有擊退、暴擊、反彈等特色，不全是基礎祝福直接附加同一狀態。

## 3. 我們怎麼重新排列

| 層 | 負責什麼 | 現況與設計邊界 |
|---|---|---|
| 武器 | 攻擊形狀、節奏、命中方式 | 現有水球是投射物、棒棒糖錘是扇形揮擊；遠程／近戰是大類，未來可再加武器標籤。沒有因此決定六武器制。 |
| 流派 × 欄位 | 攻擊／技能／衝刺／被動附加什麼行為 | 水以擊退／濕潤／水窪，風以速度／旋風，雷以連鎖為主；冰冰凍、火燃燒、糖黏住仍是既有備忘，尚未實作。四欄借用黑帝斯分工概念，是否互斥須另決定。 |
| 中立道具 | 可堆疊數值與攻擊修飾 | 目標讓共同修飾同時作用於子彈和揮擊；穿透／分裂／追蹤等需明列每種武器對應，沒有對應時顯示不適用，不能偷偷生出遠程水球。 |
| 組合規則 | 標籤計數、雙流派、詛咒取捨 | 保留目前同系不同卡計數：三張變身、五張解鎖終極、雙系各兩張才有合體資格；都引用 `schoolRules`，不在積木中另寫一份門檻。 |

## 4. 效果積木資料模型提案

一張卡仍保留名稱、圖示、抽卡條件與欄位。行為另外表達為「何時 → 是否符合條件 → 依序做什麼」；常駐修飾不必假造每幀觸發事件。

| 部分 | 提案內容 |
|---|---|
| 觸發 | `onHit`、`onKill`、`onDash`、`onPerfectDodge`、`onTimer`、`onPickup`、`onSchoolCount`。衝刺需區分開始／穿越／結束；定時器需指定卡片或區域的 instance。取得卡片以重算常駐修飾處理，不冒充撿寶石。 |
| 可選條件 | 目標具有某狀態、機率抽樣、冷卻是否完成；另外指定合法事件來源、武器種類、觸發階段。機率由外層傳固定抽樣，冷卻用遊戲秒數。 |
| 動作清單 | 傷害、施加狀態、推開、產生投射物、產生水窪／區域、回血、護盾、連鎖。每個動作有選取目標與來源，依陣列順序執行。 |
| 修飾 | 數值加減／乘算；子彈或揮擊旗標：穿透、分裂、追蹤、擊退、爆炸、大小。跨武器先建立對應表；資料宣告不等於已實作。 |
| 計數 | 殺敵、撿寶石、射擊／揮擊次數、不同流派卡數；分清卡片重複升級和不同卡計數。 |
| 輸出 | 新狀態與可序列化事件；畫面、聲音、HUD 由接合層處理。不要在 JSON 放函式、Canvas、DOM 或可執行字串。 |

### 執行語意與限制

- 每個事件帶穩定的來源／目標 id、位置、武器種類、基礎傷害、階段與來源鏈。`onHit` 要分命中前後；水球命中、錘子命中、區域傷害與衍生攻擊不可全部混成一種無來源事件。
- 保留目前傷害入口、可見範圍／攻擊距離、Boss 入場保護、環繞世界距離、死亡只結算一次及勝敗後停止結算。附加傷害不繞過這些規則。
- 同一 feature 先依舊公式合併等級再產生規則，避免幾張卡帶相同積木就重複掛載。布林能力仍是「有／沒有」，不能把王冠變成每等級都加一次。
- 修飾先加算再乘算只是可選方向；遷移必須保留各舊公式原有順序與上限。不同傷害來源是否吃王冠、濕潤加傷，依舊傷害入口對照，不一律套在最外層。
- 冷卻 key 至少辨識規則與 instance；區域有自己的生命與 tick。先複製原本累加、補 tick 或到期移除順序，不能順手更改掉幀行為。
- 衍生效果須有來源鏈與重入限制，保留分裂碎片不再分裂、彈牆碰撞不再遞迴／跳電、同一揮擊不重複打同一目標等邊界。既有投射物、區域與特效上限也保留。
- 格式、運算子與引用路徑採白名單；有版本與舊作品遷移，拒絕未知動作或循環引用。這些是未來格式要求，本卡不擴充現有 schema。

### 五張現有卡的 JSON 示意

**以下是設計片段，不是現行 Maker 匯入格式，也不是完整可執行規格。** 卡面其他資料沿用原卡，`rules/modifiers` 是提案欄位；`ref` 指設定或事件資料，`op/args` 是受限運算樹，未來不能用 `eval` 解讀。`featureLevel` 沿用目前加總並封頂的等級。帶 `selector` 或 `profile` 的語意在段落中定義，仍須後續實作。所有數值與公式取自目前程式。

#### 濺水花（`water-attack`，不是浪花水球）

更正：浪花水球是中立道具 `item-wall`，效果是推開敵人並在撞到另一敵人時傷害兩者；不是濺水花 `water-attack`，也不再叫「彈牆水波」。以下範例示範另一張卡「濺水花」，不能用來代表浪花水球。另有支援卡「水花四濺」，傷害公式也不同。

```json
{
  "id": "water-attack",
  "rules": [{
    "trigger": "onHit",
    "phase": "schoolEffect",
    "sources": ["primary-projectile", "primary-swing"],
    "actions": [{
      "type": "damage",
      "selector": "splash-other-targets",
      "radius": {"op": "add", "args": [{"ref": "tuning.splashBaseRadius"}, {"op": "multiply", "args": [{"ref": "featureLevel.water-attack"}, {"ref": "tuning.splashPerLevel"}]}]},
      "amount": {"op": "multiply", "args": [{"ref": "event.attackDamage"}, {"op": "add", "args": [{"ref": "build.splashDamageBase"}, {"op": "multiply", "args": [{"ref": "featureLevel.water-attack"}, {"ref": "build.splashDamageGrowth"}]}]}]}
    }]
  }]
}
```

來源 `combat.js: schoolEffect`：半徑 `22 + L×10`；傷害 `攻擊傷害×(0.2 + L×0.1)`。`splash-other-targets` 排除主命中者，以目標中心距離嚴格小於半徑判斷；不擅自加上目標碰撞半徑，也不額外排除其他揮擊命中者。水系命中附濕潤仍由共同命中規則負責，不能漏遷或每張卡重複附加。

#### 靜電（`thunder-static`）

```json
{
  "id": "thunder-static",
  "rules": [{
    "trigger": "onTimer",
    "clock": "card-instance",
    "interval": {"ref": "schoolRules.staticSeconds"},
    "firstTick": "after-interval",
    "actions": [{"type": "damage", "selector": "touching-player-with-padding", "padding": 3, "amount": {"ref": "schoolRules.staticDamage"}}]
  }]
}
```

來源 `school-combat.js: updateSchoolCombat`：每 1 秒對距離 `< 主角半徑＋敵人半徑＋3` 的合法目標造成 20 傷害，包含可被攻擊的 Boss；不是受到碰撞傷害才觸發，也不是每幀電擊。沿用 `pulse` 每次更新最多執行一次、剩餘時間累加的語意。

#### 導電水窪（`fusion-puddle`）

```json
{
  "id": "fusion-puddle",
  "schools": ["water", "thunder"],
  "offer": {"eachSchoolDistinctCards": {"ref": "schoolRules.fusionCards"}},
  "rules": [
    {"trigger": "onHit", "phase": "schoolEffect", "sources": ["primary-projectile", "primary-swing"], "actions": [{"type": "spawnArea", "profile": "existing-water-field", "position": {"ref": "event.targetPosition"}}]},
    {"trigger": "onTimer", "clock": "area-instance", "areaSchool": "water", "phase": "after-base-damage-and-status", "actions": [{"type": "damage", "selector": "current-area-target", "amount": {"op": "multiply", "args": [{"ref": "build.fieldDamage"}, {"ref": "featureLevel.fusion-puddle"}]}}]}
  ]
}
```

來源 `combat.js: schoolEffect/addField/updateFields` 與 `schools.js: eligible`。各系兩張不同卡取得抽選資格；取得合體卡後，主攻擊有水系處理，命中會生水窪。有水技能時沿用同一次生水窪判斷，不能兩張卡各生一灘。

`existing-water-field` 指沿用原本半徑成長、區域上限與移除規則：基本半徑 36、生命 2 秒、tick 0.4 秒、初始 timer 為 0，但更新時先扣生命，到期先移除。基本傷害是 `12×max(1, 水技能等級, 水衝刺等級, 融合風暴等級)`；先基本傷害，再濕潤 3 秒和緩速，最後額外 `12×合體效果等級` 傷害。增傷作用於所有現有水區域，不只新生水窪；不是以濕潤為前提的任意雷擊，也不新增跳電目標。

#### 王冠（`item-crown`，詛咒）

```json
{
  "id": "item-crown",
  "modifiers": [
    {"stat": "neutralDamageMultiplier", "op": "multiply", "value": {"op": "add", "args": [1, {"ref": "neutralRules.crownDamage"}]}, "stack": "presence"},
    {"stat": "maxHealth", "op": "subtract", "value": {"ref": "neutralRules.crownHealth"}, "stack": "presence"}
  ],
  "acquirePolicy": "clamp-current-health-to-new-max"
}
```

來源 `neutral.js: damage`、`combat.js: maxPlayerHealth`、`ui/levelup.js: applyUpgrade`：傷害倍率乘 `1+0.3`、最大血量減 1，最終上限至少 1；取得後目前血量壓回上限。與金庫、濕潤的乘算順序沿用原傷害入口，勿把攻擊預先放大後又在命中入口乘一次。

#### 多重水球（`multi-water`，近戰修飾）

```json
{
  "id": "multi-water",
  "modifiers": [
    {"weaponKind": "projectile", "stat": "shotCount", "op": "add", "value": {"ref": "featureLevel.multi-water"}},
    {"weaponKind": "melee", "stat": "extraArcRadians", "op": "add", "value": {"op": "multiply", "args": [{"ref": "featureLevel.multi-water"}, {"ref": "tuning.extraShotAngle"}]}}
  ]
}
```

來源 `combat.js: fireAtNearest`、`weapons.js: swingAtNearest/SurvivorWeapons.swing`：遠程為 `1+L` 顆，維持對稱散射、角距 0.18 弧度及投射物上限；近戰是基礎角度加 `L×0.18` 弧度，封頂全周。錘子每第四下原本就是全周，仍以武器設定為準；未命中不消耗次數。這不是多揮一次，更不是多發水球。

## 5. 逐項遷移與等價測試

以下是工程提案，不是新的開工順序授權。每次另開實作卡，只遷移一個 feature；沒有遷移的 feature 維持舊路徑。新規則與舊配方不得同時處理同一效果。先固定預設作品與 Maker 自訂值的輸入／輸出，再替換，最後才移除該舊分支。

1. 為該 feature 記錄所有入口、共享狀態、等級合併、武器對應、展示與取得卡片的副作用。
2. 在純規則層定義受限資料、運算與事件；接合層沿用既有傷害／死亡入口。只加這一張需要的積木，不先重寫整個引擎。
3. 同一組固定狀態、操作、dt、目標順序及亂數分別跑舊／新規則，比對血量、位置、計數、冷卻、區域／投射物和事件順序；再用相同案例做跨引擎測試。
4. 補上 Maker 舊作品載入、設定改值、升級展示與兩武器檢查。真正改遊戲時再更新資源版本號和快取，本卡沒有遊戲改版。

以下是必備案例輪廓，**尚未新增或執行這些等價測試**。隔離案例先關閉其他卡，組合案例再加入會交互作用的卡，避免錯把倍率重算兩遍。

| 卡片 | 固定輸入 → 應保留輸出 | 邊界與組合 |
|---|---|---|
| 濺水花 | Lv1、攻擊傷害 35、另一敵人在範圍內 → 半徑 32，另一敵人收到 10.5 的基礎濺射傷害；再經既有傷害入口處理 | 主目標排除、剛好在半徑外緣不打、近戰多目標、水球穿透、濕潤／王冠、畫面外不傷害。 |
| 靜電 | 初始未計時、經過 1 秒，合法敵人在接觸範圍 → 一次 20 基礎傷害 | 小於一個間隔不觸發、距離等號不命中、無敵狀態不阻止靜電計時、長 dt 仍依原 pulse 行為。 |
| 導電水窪 | 合體 Lv1，無其他水區增傷卡，合法目標在水窪內、未到期且 tick 到時 → 基本 12、附狀態、額外 12，順序不變 | 水窪到期不補最後一跳、既有水窪也導電、區域上限、Boss 死亡後停止、每系卡數門檻、與水技能不重複生成。 |
| 王冠 | 基礎最大血量 90／目前 90、無其他增益 → 最大／目前 89；中立傷害倍率 1.3 | 原本殘血不回血、最大血量至少 1、重算不重複扣、與金庫／濕潤順序、Maker 改 crownHealth。 |
| 多重水球 | Lv1 → 水球兩顆；錘子一般揮擊為 120 度轉弧度後加 0.18 弧度 | 第四下全周、空揮不加次數、最大角度、投射物容量不足、不同卡共用 feature 的封頂加總。 |

### 哪些比較難遷移

| 類別／卡片 | 難點 |
|---|---|
| 浪花水球、分裂、後射、風刃 | 命中順序、共享 hitList、碎片來源、近戰後方扇形去重、衍生攻擊不再觸發；彈牆與分裂目前無近戰對應，補新玩法需 Erin／家長決定。 |
| 導電水窪、融合風暴、融合衝刺 | 場上區域、生命與 tick、其他卡控制半徑／傷害、複合傷害順序及環繞地圖。 |
| 大水滴、蓄電、金庫、餅乾 | 跨攻擊／殺敵／拾取計數與消耗時機；卡片說明不等於真實門檻，應讀設定。 |
| 水泡護盾、衝刺退款、雷步、完美閃避相關組合 | 衝刺不同階段、半格回充、無敵／護盾先後、同一事件只消耗一次。 |
| 各系終極、變身、風眼／下雨 | 取得卡片就啟動、不同卡數門檻、站定／全場狀態與定時器、外觀與攻擊效果分離；下雨現況可影響畫面外狀態，但不造成畫面外傷害。 |

## 6. Maker 之後如何編輯

建議以「觸發時機」下拉選單開始，再選條件、動作及目標；動作依清單排序，數值用原本的設定控制方式，常駐修飾另有「適用武器」與「數值／旗標」選項。Erin 看到的應是「命中時 → 附近敵人 → 擊退」等文字，不必操作來源鏈或運算樹。

下拉選單只列引擎已支援並通過測試的積木；武器不適用時直接標示。沿用卡片展示預覽兩種武器，提供可讀的組合說明、單位、錯誤提示與恢復原配方。新增動作仍要先寫程式，不能讓 Maker 自動產生任意程式。

格式版本、舊作品遷移、效果數量限制、運算樹及參數範圍需另卡設計；目前每卡 1–3 積木的限制不在本文件解除。先保留舊 feature 配方可讀取，再逐項轉換，不能讓玩家存檔突然失效。

## 7. 對移植 Godot 的幫助與待決定事項

依遊戲計畫 §11：卡片與積木用穩定 id、JSON 值及明確單位；規則用固定輸入產生狀態／事件；dt 用秒、位置用世界單位。Godot 可把卡片／效果定義包成自訂 **Resource**，由共用規則解讀器處理；Node 負責場景生命週期、輸入與顯示，signal 接事件。[Godot 官方 Resource 文件](https://docs.godotengine.org/en/stable/tutorials/scripting/resources.html)說明 Resource 作為資料容器及序列化方式。

同一份 JSON 不會自動變成 Resource，也不會自動把 JavaScript 換成 GDScript；仍需格式轉換、驗證及解讀器。共享效果定義應保持不變，各角色／區域自己的冷卻、計數與狀態另存，避免 Resource 共用導致互相污染。上述輸入／輸出案例可在 Godot 重寫，驗證玩法一致；像素圖、音訊原稿沿用 §11，本卡未改素材。

本次不需要 Erin 做決定才能完成文件。若要開始實作，請 Erin 與家長決定是否採用此提案、先遷移哪個 feature，以及四欄是否要互斥；若要讓彈牆／分裂等支援近戰，也需先決定對應玩法。冰／火／糖仍依原備忘，不在這次定新效果或新平衡數值。


## 8. 已採用的第一步

家長已採用本提案並指定先遷移靜電與王冠；實作、可改資料範例及其餘 47 個 feature 的差距見[第一步交接](survivor-effect-blocks-step1-validation.md)。上文五段 JSON 仍屬完整架構示意，現行第一步僅支援交接列出的子集；四欄互斥尚未決定，維持現況。
