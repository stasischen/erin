verdict: changes
a43470d6b4d34776b92d8e2cb5d55b1649207e81

本紀錄是對該 base 加上精確 patch 的獨立審查；不代表 base 已包含新程式碼，也不是整張 Boss4 卡、整個 PR 或 UI 驗收批准。

## 被審來源與範圍

- Dot patch SHA-256：`6b18ab254381569325be1556019d90215e6632ec1f0fe4fb7f059c9a5fac692f`，53,709 bytes；提案列出 15 個變更路徑，符合當時 18 路徑 allowlist。
- 在 repo 外以 base `a43470d6b4d34776b92d8e2cb5d55b1649207e81` 建立唯讀來源副本，套用該精確 patch 與提案 PNG；15/15 postimage 的長度及 SHA-256 均符合提案。正式 repo 沒有套用這份 patch。
- 相對前一版 menu 提案 `ed09579c…`，新提案唯一不同 postimage 是 `games/survivor/tests/boss-gallery-4.cjs`；menu／production 內容維持原樣。原始 48×16 三格素材的 frame-0 裁切、pending/error placeholder、onload 換成 manifest frame、已載入後重開選單等路徑靜態上接對了既有 manifest 與 `data-survivor-art` loader；這不是瀏覽器驗收。
- 對 13 個 JS/CJS 檔執行 `node --check` 均成功；`gallery4-art.py` 僅做 Python AST parse 成功，沒有執行生成器。

## 必須修正

新選單 placeholder 透過 `canvas.toDataURL()` 建立 `<img>` source，但共用測試 fixture `games/survivor/tests/maker-support.cjs` 的 `element()` canvas stub 只有 `getContext()`，沒有 `toDataURL()`。這使得新功能所經過的既有試煉結束／重開選單測試無法執行。應由 Dot 在獲准範圍中補足這個 canvas stub（或提出等效且不弱化裁切斷言的測試 fixture 修正）；目前 allowlist 未包含 `maker-support.cjs`，需要先更新作者 patch 範圍。不要以移除 manifest frame 裁切或跳過相關回歸測試處理。

## 定向驗證

在私有副本執行 10 個定向測試，6 項通過、4 項因上述相同 `TypeError: canvas.toDataURL is not a function` 失敗：

- 失敗：`boss-gallery-4.cjs`、`boss-gallery-2.cjs`、`boss-gallery-3.cjs`、`weakpoint-combat.cjs`。新 Boss4 測試已越過原先 hit-stop 時序斷言；之後在 `boss-gallery-4.cjs:129` 經 `trialMenu` 失敗。Boss2/3 分別由 `trialBossDefeated`／`finishRun` 進入 `trialMenu`；weakpoint-combat 由 `updateBomb → trialBossDefeated → finishRun → trialMenu` 進入同一失敗點。各 stack、命令與 exit code 私存於 `~/.local/share/erin/history/boss4-dot-stone-hands-v4/r3-targeted-logs/`。
- 通過：`weakpoint.cjs`、`weakpoint-event-sources.cjs`、`art-manifest.cjs`、`art-manifest-v2.cjs`、`art-telegraph-geometry.cjs`、`maker-ui.cjs`。
- 測試失敗在 Node canvas stub 相容性，不是已證實的瀏覽器 canvas 產品缺陷；但會阻止指定回歸套件完成，故本 patch 不能核准套用。

尚未套用正式 repo、未跑完整 `--layout`、未做 Mac 全套測試、真實 Chrome／三尺寸試玩、Dot 雲端驗收或整 PR 最終 gate。此 slice 尚未完成，Eye／Mask 及其餘卡片路徑也不在本次批准範圍。
