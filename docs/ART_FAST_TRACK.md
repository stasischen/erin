# 美術快車道（Art Fast Track）

目的：讓 Survivor 從「程式畫的小色塊」變成照 `erin-art/STYLE_GUIDE.md` 的 Q 版像素風。只換畫面，不動玩法。

## 為什麼要另開這條路

- `art-manifest.js` 約 200 項只有 1 項有真圖，其他都是 `sheet: null`（程式即時畫）。
- 現行遊戲卡要經過 主控 → Dot 出 patch → Luna 審查套用 → Mac 測試 → Dot 雲端三尺寸實測 → 非作者 gate，一個 CSS 小修也要五個角色。boss-gallery-4 已連續十幾個 commit 停在 blocked。
- 美術改動只要「看截圖」就能判斷好壞，不需要整套邏輯審查。

## 角色（只有三個）

| 角色 | 做什麼 |
|---|---|
| Codex（單一 session） | 實作、跑測試、截圖、自評，完成一張卡就停下回報 |
| 家長 | 唯一驗收：看截圖或直接玩，說「過」或「改哪裡」 |
| Erin | 對角色長相、顏色給意見（可選） |

不經 Dot、Luna、Grok，不用 agent-coord-kit，不需要自動派工。家長手動把下一張卡交給 Codex。

## 安全邊界（這是可以省掉審查的前提）

允許改的檔案：
- `games/survivor/art/**`（新增 PNG）
- `games/survivor/art-manifest.js`
- `games/survivor/render/**`
- `games/survivor/style.css`
- `games/survivor/assets/CREDITS.md`
- `games/survivor/tools/shots.cjs`（截圖工具，A0 建立）
- `version.json`（用 `tools/version.cjs --write` 機械升版）

禁止改：`engine/**`、`data/**`、`stages.js`、`game.js` 的遊戲邏輯、`maker/**`、任何 hitbox／傷害／速度數值。需要動到這些就停下，寫明原因交給家長。

## 每張卡的固定循環

1. 從 `main` 開分支 `art/<卡號>`，一張卡一個分支、一個 draft PR。
2. 實作。
3. `node games/survivor/tools/test.cjs --layout` 全過。
4. `node games/survivor/tools/shots.cjs` 產生 1024×461、740×360、1180×820 三尺寸截圖，各含「開場」「戰鬥中」「升級畫面」，存到 `~/.local/share/erin/art-review/<卡號>/`（不進 repo）。
5. 對照 STYLE_GUIDE 自評：列出 3 個最醜的地方，能修就修，回到第 3 步，最多 3 輪。
6. 停下回報家長：改了什麼、截圖路徑、還剩哪些不滿意。
7. 家長說過 → 合併 → 開下一張；說改 → 同分支修。

## 卡片順序

| 卡號 | 內容 | 完成標準 |
|---|---|---|
| A0 | 截圖工具 `tools/shots.cjs`（headless Chrome，固定種子進入戰鬥） | 一個指令產出 9 張截圖 |
| A1 | 主角換成 `erin-art/pilot3d/hero_mercury_3d_sheet.png`，8 方向 idle／run | 主角走路有動畫、方向正確、腳底不飄 |
| A2 | 最常出現的 3 種怪換真圖（3D 轉 2D 流程或 CC0 素材包） | 與主角同風格、同外框色、64×64 |
| A3 | 地面與場景：拼貼地板、裝飾物、角色腳底陰影 | 背景不再是純色 |
| A4 | 打擊感：受擊閃白、命中粒子、畫面輕震、傷害數字彈出 | 打中東西「有感覺」 |
| A5 | UI 皮：HUD、升級卡片、按鈕換成一致像素框 | HUD 與世界風格一致 |
| A6+ | 其餘怪物、Boss、技能特效 | 逐批進行 |

## 與舊流程的關係

- 依 `AGENTS.md` 最新的「依改動分流」規則，不因卡片建立時間而套用舊流程例外：純美術／CSS／文案等可回復視覺改動走本快車道；遊戲邏輯、資料、數值或權限改動仍依技術流程並經非作者獨立程式審查。
- 美術卡如果發現 bug，記下來交回舊流程，不在美術分支修邏輯。
- 建議在 `AGENTS.md` 加一行：「美術快車道卡（A 系列）依 docs/ART_FAST_TRACK.md，由家長直接驗收，不走 Dot patch 流程。」
