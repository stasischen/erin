verdict: changes
df5670d54209985633aa6ba254e29974090cfea3

本紀錄是對該 base 上精確 patch 的獨立審查，不代表 base 已包含本次程式碼，也不是整卡、整 PR 或 UI 驗收批准。

## 被審來源

- Patch SHA-256：`a0104291930d2364f7d63bbbadeefbaeaa9a3bc9b8874b009b5a277ffc8c3839`，48,097 bytes；來源提案列出 13 個文字檔及 1 個 PNG。
- 已對照正式 boss4 規格，檢查本次資料、schema、共用 trial/weakpoint 路徑、renderer、art manifest、Maker、遷移與 Boss/素材測試。
- 本次修正加入非攻擊手移出核心範圍、攻擊手落在 torso 下層，以及兩側各階段的 renderer／命中狀態與中心像素斷言；靜態上處理了前一版的胸口遮擋問題。

## 必須修正

1. **Boss 選單圖示會載入整張三格貼圖，沒有選取身體單格。** 新 manifest 將 `character/stone-hands` 設為 `frameSize: [16,16]`、frame 0，並共用 48×16 的 `art/characters/stone-hands.png`（身體、左手、右手各一格）。但 `games/survivor/engine/gallery.js` 的 `trialMenu` 仍以 `image.src=SurvivorArt.lookup(b.artId).sheet` 指向原始整張貼圖；選單 CSS 將 `<img>` 設成 84×84，瀏覽器會把 48×16 的整條三格圖縮放成正方形。選單因此顯示／扭曲身體與兩隻手的合併條圖，而不是 Boss 身體圖示。此檔雖在本次 allowlist，patch 未修改它；新增測試也未檢查 trial menu 的 image source 或實際裁切。請讓選單使用 manifest 選出的 frame（或等效單格圖像），並增加能檢查選單顯示單格身體而非原始 spritesheet 的回歸測試。

## 判定與限制

此為本 slice 的可重現 UI 資料路徑缺陷，本輪不執行 `git apply --check`、不套用、不改作者程式、不跑測試或生成器。請 Dot 以同一授權範圍提交修正版精確 patch 後再重審。Mac targeted/full tests、三尺寸瀏覽器驗收、版本同步與整 PR gate 均未執行。

## Replacement patch 其餘靜態檢查

- **第五 Boss 與攻擊路徑：** defaults 新增唯一 `stone-hands`，沒有加入 Eye／Mask 假王。左右 move 透過 `limbChoice` 排除上次已實際命中的手；只有 strike 時更新 `lastLimb`，取消或暈眩不消耗交替。選招後固定一次 `m.target`；ground warning/shadow、strike 判定及 `encounterDodgeThreat` 都讀同一 target，風險／命中不會另追玩家位置。中斷後共用 weakpoint path 依條件消失進入 closing；一般 Boss 沒設 `requiresMatch`，此分支不改變舊行為。
- **數值與 Maker：** schema 對肢體 side 鎖定原始左右資料，reach 限 60–300、lift 限 20–120；Maker 透過既有 range helper 編輯 reach/lift、既有 timing 控制編輯預警，弱點條件開關也可操作。新測試文字涵蓋改值、save/load/reset；未執行測試。
- **遷移與既有測試：** defaults 的舊四 Boss ID 保留並增加第五項；2/3 測試將固定數量改成 defaults 數量／ID，新的 4 測試保留 1/3/4 項遷移與編輯值檢查。未見刪掉舊 asset/canvas/battle golden 斷言；future 7 的兩個 clone 僅在測試 fixture 內，沒有產品 Boss 定義。未執行任何測試。
- **素材與 runtime fallback：** 私有原 PNG 只讀檢視／解碼確認為 48×16 RGBA、3 個 16×16 cell；frame 0 anchor 像素為不透明核心色，三格角落透明。manifest 將身體／左右手分別選 frame 0/1/2，hitboxAnchor/pivot 均為中心；Canvas 載入前 body/hand fallback 以不透明畫面繪製，不能只靠弱點提示假裝有身體。新增測試把 exposure 判定對到共享 `resolveBossWeakpoint`，檢查兩側、windup、active/closing、interrupt/stun 的 draw order、bounds 與 core circle，並驗原 PNG 中心像素。
- **未發現其他靜態阻擋：** 上述程式路徑與資料檢查是閱讀 patch/base 及唯讀檢視素材的結果，不是測試通過、UI 驗收或整卡批准。尚未在正式工作樹 apply，也未執行 patch 新增程式、測試、generator、Node harness、Mac suite、Chrome 或雲端試玩。唯一已確認的阻擋仍是 Boss 選單使用整張 48×16 raw spritesheet，見上節第 1 項。
