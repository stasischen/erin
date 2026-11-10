verdict: approve
529078cea6200ced9d9382073e403db5dca3bef0

本紀錄是對該 base 加上精確 patch 的獨立程式碼審查，不代表 base 原本已包含新程式碼，也不是 Boss4 整卡、整 PR 或瀏覽器／雲端驗收批准。

## 被審來源

- Dot patch SHA-256：`fc665a8ff81640dba645d2c6c7d39e6802369b82ec3a561980f814a7e476d4e3`，47,577 bytes；16 個變更路徑為 15 個文字檔及 `games/survivor/art/characters/stone-hands.png`，均在此版 19 路徑 allowlist 內。
- 依精確 base `529078cea6200ced9d9382073e403db5dca3bef0` 核對全部 preimage 後，在正式 worktree `git apply --check` 並套用精確 patch，再複製已核 hash 的 PNG。套用後 16/16 檔案長度與 SHA-256 均符合提案 postimage。
- 前版 r3 的 15 個 postimage 與本 patch 相同；本次唯一新增路徑是已明確授權的 `games/survivor/tests/maker-support.cjs`。先前記錄的石像雙手、選單單格素材、命中凍結與測試時序審查沿用於這些 byte-identical 檔案。

## 測試 fixture 審查與驗證

`maker-support.cjs` 為測試 canvas 增加 `toDataURL()`，既有 `getContext()` proxy 與 draw-call 記錄沒有改變。mock 只序列化尺寸正確的全透明 PNG，不假裝記錄的 drawing 已被 rasterize；它沒有吞掉壓縮或編碼錯誤。獨立解碼 16×16 輸出並驗證 PNG chunk CRC、RGBA 全透明與 data URI MIME。新 Boss4 測試及原 Boss2／Boss3／weakpoint-combat 回歸隨後均可走過選單 fallback；生產 manifest frame 裁切與 freeze 邏輯未改動。

在 Mac source worktree 執行以下 10 項定向測試，全部 exit 0：

- `node games/survivor/tests/boss-gallery-4.cjs`
- `node games/survivor/tests/boss-gallery-2.cjs`
- `node games/survivor/tests/boss-gallery-3.cjs`
- `node games/survivor/tests/weakpoint.cjs`
- `node games/survivor/tests/weakpoint-combat.cjs`
- `node games/survivor/tests/weakpoint-event-sources.cjs`
- `node games/survivor/tests/art-manifest.cjs`
- `node games/survivor/tests/art-manifest-v2.cjs`
- `node games/survivor/tests/art-telegraph-geometry.cjs`
- `node games/survivor/tests/maker-ui.cjs`

14 個變更 JS/CJS 檔 `node --check` 通過，`gallery4-art.py` 的 Python AST parse 通過，`git diff --check` 通過；套用後再次核對 16/16 postimage。完整輸出及檔案 hash 保存在 Mac 本機 history，不放入 repo。

## 範圍限制

本次未跑完整 `node games/survivor/tools/test.cjs --layout`、未升版、未做真實 Chrome 或 740×360／1024×461／1180×820 試玩，也未做 Dot 雲端驗收。翻滾眼、面具石像、整卡及整 PR 最終 gate 仍待完成。此審查只批准本次精確程式碼增量供主控後續測試與 review 流程使用。
