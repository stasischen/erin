verdict: changes
d4542b73968cc1940bcd60e8ecaa7518307a2f5a

本紀錄是對該 base 上精確 patch 的獨立審查，不代表 base 已包含本次程式碼，也不是整卡、整 PR 或 UI 驗收批准。

## 被審來源

- Patch SHA-256：`ce777cee22c215cfe1ad69f14d2095a102257b35da5d1ab178c1380b0646cf0b`，41,696 bytes。
- 預定變更為 13 個文字檔及 `games/survivor/art/characters/stone-hands.png`；來源回件標示為垂直切片提案，非整卡完成。
- 已檢查正式 boss4 規格、相關 defaults/schema、trial block、weakpoint、gallery renderer、Maker、art manifest/render adapter 及新增測試。Patch 尚未套用；未執行測試、生成器、瀏覽器或完整驗收。

## 必須修正

1. **舉起一手時，另一手仍遮住胸口弱點。** `games/survivor/render/gallery.js` 的 `drawTrialLimbs` 會持續繪製左右兩手；非當前攻擊手使用 `limbPose` 的 home 座標，約在身體中心左右各 `body.r * .35`、垂直偏移 `body.r * .2`，並以 `shape.radius * 1.2` 繪成約 66 世界單位的方形。Boss 身體同樣以約 64 世界單位畫出。因而舉起一手後，另一隻 home 手仍覆蓋身體中心；同時 `weakpoint.js` 在 `windup` 期間打開 core，`render/weakpoint.js` 仍會把弱點提示畫在上層。這與規格「胸口平時被手護住；一隻手舉起時胸口露出弱點」不符：實際可見提示會出現在仍被另一隻巨手遮住的胸口。新增測試驗證 weakpoint 的傷害倍率與 limb pose 高度，但沒有驗證渲染時胸口是否露出。請讓另一隻手在攻擊手舉起期間移出胸口守位，或採取能在畫面上清楚露出核心的姿勢，並加入針對兩手位置／核心曝光狀態的回歸斷言。

## 目前判定與範圍

此問題可由 patch 靜態路徑重現，因此本輪不做 `git apply --check`、不套用、不修改作者程式，也不執行測試。需由 Dot 重提修正後的完整精確 patch，再依新 base 與 patch hash 獨立重審。三尺寸瀏覽器試玩、Mac 完整 `--layout`、版本同步及整 PR gate 均未執行。
