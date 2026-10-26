verdict: approve
524fb2aee327f1634915d3651fd75c437a580b21

# Grok 審查：survivor-card-blocks-thunder（雷流派共用積木，版本 20261026af）

## 看過的檔案
- engine/effect-blocks.js、engine/combat.js、engine/school-combat.js、engine/schools.js
- maker/maker.js（drawCardBlocks、cardRecipe、cardBlocksOpen）、preview.js、practice-host.js、practice.html、preview.html、index.html、version.json、sw.js
- tests/effect-blocks-thunder.cjs、tests/effect-blocks-thunder-legacy.json、tests/maker-ui.cjs、tests/levelup-reroll.cjs
- docs/survivor-card-blocks-thunder-validation.md、coord/tasks/survivor-card-blocks-thunder.json

## 測試（在 Grok 的雲端電腦 box 上跑）
- `/workspace/erin-ci/run-review-tests.sh 524fb2a…` → `RESULT: PASS`，PASS 80 行，含 --layout 全部尺寸，103 秒。
- Codex 沒跑 --layout，照家長規則由 Grok 補跑，不扣分。

## 親手操作（box 無頭 Chrome、觸控模擬，1024×461 與 740×360 都做）
- Maker → 技能卡：十張雷卡（跳電、電泡泡、放電反擊、雷雲、閃電衝刺、蓄電、避雷針、雷步、靜電、超導體）都在清單；選擇效果顯示「積木堆：…」，不再是「原本組合」。
- 每張卡點開積木堆：觸發／條件／動作文字正確（例如電泡泡＝泡泡炸開時→範圍內的怪物→暈眩→傷害）。
- 「調整這堆積木的共用數值」可展開；按＋（跳電範圍 100→101、電泡泡暈眩 0.5→0.51）數值與預覽說明同步更新；拖滑桿跳電範圍 100→220。
- 按「看這個積木的效果」十張都出現預覽 iframe，說明文字帶到新數值（「跳電到 101 格內」）；預覽裡怪物在動（mode playing）。
- 收合狀態：按＋、開預覽、切到別張卡再切回來，積木堆仍保持展開。
- 儲存後 localStorage 有 chainRadius 220；`?maker=1&play=1` 試玩時 BUILD_TUNING.chainRadius 也是 220。
- 試玩（水球）：拖左搖桿主角移動（x 1536→1748）；普攻按鈕連按 4 下有 4 道跳電、怪物掉血；加超導體後 8 道跳電；泡泡技能按下有閃電；衝刺（閃電衝刺＋雷步）留下 4 段電痕、路線上兩隻怪暈眩約 0.13 秒、電痕持續跳電；雷雲會劈怪並重設計時；靜電碰到主角的怪會被電。全程沒有 JS 例外。

## 發現
- 無阻擋問題。程式只在雷卡分支改讀共用積木，其他流派仍走 BUILD_TUNING；142 組 frozen legacy 對照有涵蓋。
- 小提醒（非本卡造成）：預覽面板打開時會蓋住內容右側，共用數值那排的「＋」在預覽開著時按不到（水流派卡在 740×360 也一樣）；滑桿左半與收起預覽後都能操作。之後整理 Maker 版面時可以順便處理。
- levelup-reroll 測試對幸運草的預期修正合理，沒改遊戲規則。
- §6：版本號 ?v= 全部同步 20261026af；沒有新外部網址；文字繁中；沒超出卡片範圍。
