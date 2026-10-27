verdict: changes
06ec4fc8b2a31b0150a710fb1e72782d5552193f

獨立審查工作階段（非本卡作者）；PR #103，本輪僅程式與 Mac 自動測試，尚未進行 UI 驗收。

## [P2] 保留撞牆與架勢崩潰的獨立事件來源

位置：`games/survivor/engine/weakpoint.js:94`，以及 `engine/gallery.js` 的撞牆處理。

`posture-break` 目前只判斷 `body.posture.stun > 0`，但守門人撞牆也將同一個 `posture.stun` 設成撞牆暈眩時間。因此只撞牆、架勢完全沒有累積，也會同時成立 `wall-stun` 與 `posture-break`。Maker 選「全部成立」會失去意義；僅選「架勢崩潰」的自訂弱點也會被撞牆誤開。請由真正的架勢崩潰事件保留可區別的訊號，不要由共用暈眩狀態推定原因，並補上實際引擎的回歸測試。

獨立重現（repo 根目錄執行）：

```js
const run = require('./games/survivor/tests/maker-support.cjs')();
run(`startTrial('gatekeeper');state.trial.entry=0;state.bossIntro=0;
state.player.damageDisabled=true;
const cfg=state.trial.definition.weakpoint;
cfg.parts=[{...cfg.parts[1],mode:'all',
  conditions:[{type:'wall-stun'},{type:'posture-break'}]}];
const b=state.boss;b.posture={value:0,stun:0};
b.x=state.trial.arena.x+state.trial.arena.radius-b.r-1;
b.y=state.trial.arena.y;
state.bossMoves=[{id:'charge',kind:'charge',
  ai:{phase:'active',left:1},angle:0,origin:{x:b.x,y:b.y},
  target:{x:b.x+70,y:b.y}}];
updateTrial(.05);updateBossWeakpoints(.15);`);
console.log(run('JSON.stringify({posture:state.boss.posture,weakpoints:state.boss.weakpoints})'));
```

實際：`posture={value:0,stun:2}`、`core.phase="open"`、`core.matches=[true,true]`。預期：只成立撞牆，這個 AND 部位應保持關閉；僅選破架勢也應保持關閉，真正破架勢仍須能開啟。

## 檢查範圍與結果

- 核對任務卡、PR、弱點規格與驗證文件；檢查 defaults/schema/Maker、美術錨點與提示、三條 Boss 扣血路徑、來源方向、架勢倍率、觸發與計時接合、既有測試調整與版本號。
- 在上述完整 SHA 的 Mac 工作目錄獨立執行 `node games/survivor/tools/test.cjs --layout`：exit 0，113 個 PASS。既有測試沒有覆蓋撞牆／破架勢來源分離；通過不抵銷上面的實際重現。
- 本輪沒有修改實作、卡片或測試；沒有 UI 驗收、最終 approve 或合併。修正後需針對新完整 SHA 重審，UI 驗收另依主控安排進行。
