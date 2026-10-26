verdict: changes
cdbf857806398a31b85e4e658b948c670b7c48bc

# Grok 審查：survivor-godot-art-prep（版本 20261026aw）

## 看過的檔案
`git diff main...codex/survivor-godot-art-prep`：art-manifest.js、render/art.js、render/world.js、render/monsters.js、render/weapons.js、icons.js、engine/state.js／encounters.js／neutral.js、manual-attack.js、practice-host.js、index.html／practice.html／preview.html／preview.js、manifest.js、tests/art-manifest.cjs、tests/art-baseline.json、tools/version.cjs、version.json、sw.js、docs/godot-mapping.md、art/README.md、卡片與 inbox 原話。

## 測試
- Box（我的雲端電腦，node v24.22.1，Chrome 156）：`run-review-tests.sh cdbf857…` → **RESULT: FAIL**。101 PASS，layout 9 個尺寸全過；唯一失敗是 `tests/art-manifest.cjs:59` 的戰鬥紀錄 hash（實際 785e8dbd…，基準 ec2997f5…）。
- Mac Studio（node v22.22.3）：`node tests/art-manifest.cjs` PASS。
- 我查了原因：不是行為改變。在 box 上 main（6d28ed2）和本分支跑 `maker-traces.cjs` 得到完全相同的 153 筆紀錄；跟 Mac 相比只有第 74–77 筆不同，差在浮點數最後一位（例如 `-110.82700212995589` vs `-110.8270021299559`，扇形彈的 cos/sin）。Canvas 六個快照 hash 在 box 上與基準完全一致，也與 main 一致。所以等價本身成立，但這個測試依賴機器的數學函式，在別台電腦會失敗。

## 實際操作（box headless Chrome、觸控模擬，1024×461、740×360、1180×820）
- 開始選單與 HUD 圖示：`img.pixel-icon` 全部載入，0 張壞圖；普攻／特殊／泡泡／衝刺／暫停五顆按鈕都是像素圖示。
- 拖搖桿：主角往右移動約 164；按衝刺再前進約 85；按普攻出現 1 顆水球。
- 加滿怪群（26 隻上限）時 rAF 約 61fps（headless 無 GPU 參考值）；召喚老師正常出招（podium-leap），無例外。
- Maker → 武器 → 試玩：練習場 iframe 開啟，普攻產生特效，搖桿往上移動約 171；結果與 main 完全相同。
- Maker 敵人分頁的怪物預覽畫布都有畫出內容。
- 換圖實測：在暫存副本（不在 repo）放一張 20×24 純洋紅 `art/characters/player.png`，清單改 `sheet` 後主角確實換成洋紅方塊、帶原外框，位置與碰撞半徑（18）不變；其他角色仍用原圖。
- 直接開 `practice.html`／`preview.html` 會丟 TypeError，但 main 一樣，非本卡造成。

## §6 清單
觸控、Pointer、舊 API（沒用 roundRect／at／structuredClone）、dt、重新開始、版本號與 sw 快取、無外部網址、繁中、範圍：都 OK。美術查詢是純函式（不讀時鐘、回傳複本、`__proto__` 防護、路徑白名單），命中時機不受動畫影響，符合卡片 §1–§5。

## 要修
1. `tests/art-manifest.cjs` 的戰鬥紀錄比對要跨機器穩定：hash 前把紀錄裡的數字四捨五入（例如到 1e-6），或改存紀錄並用容差比對，然後重新產生 `art-baseline.json`。在 node 22（Mac）和 node 24（box）都要過。其他不用改。
