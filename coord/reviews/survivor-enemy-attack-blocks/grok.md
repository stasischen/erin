verdict: changes
1d16dd663fe229d8e0112d3c4d567be5e161d512

# Grok review: survivor-enemy-attack-blocks（統一拼圖第 5 步）

## Files checked
`git diff main...codex/survivor-enemy-attack-blocks`：games/survivor/data/schema.js、maker/maker.js、index.html、practice-host.js、practice.html、preview.html、preview.js、version.json、sw.js、tests/enemy-attack-blocks.cjs、tests/maker-ui.cjs、tests/timing.cjs、docs/survivor-enemy-attack-blocks-validation.md、card + brief。

## Code
- 怪物 `phase`／`legacy` 與老師 `move` 共用 `BLOCK_PARTS` 五類積木與 Maker `blockPanel` 外殼；武器頁也改用同一外殼。編譯只搬資料回原欄位，引擎沒有同時跑兩套攻擊。OK。
- validate 載入舊作品自動產生積木；未知版本／欄位／觸發／回饋會在 try 內被拒絕。OK。
- 版本號 20261026ae 全部更新（index/practice/preview/sw）。沒有新 API、沒有外部素材、繁中、範圍沒有超出卡片。§6 其他項目沿用前卡，無變動。

## Tests（Grok 的 box 雲端電腦，/workspace/erin-ci/run-review-tests.sh，Chrome 156、Node 24）
- `RESULT: FAIL`：69 PASS，`--layout` 0/6；`tests/levelup-layout.cjs` 第 149 行仍找 `document.querySelector('.maker-move')`，但本卡把老師招式面板的 `maker-move` class 拿掉了，所以 `box` 是 null → `Cannot read properties of null (reading 'querySelector')`。
- 本機只把第 149 行改成 `document.querySelector('.maker-content')`（其他不動）後，完整 `node games/survivor/tools/test.cjs --layout` 在 box 上 rc=0、78 PASS、0 FAIL。

## Hands-on（box headless Chrome，觸控模擬，1024×461 與 740×360）
- 怪物頁 → 蘑菇：兩個招式堆「分階段攻擊」「等級攻擊（分階段關閉時）」，共 10 個積木（觸發／形狀／時機／效果／回饋 ×2）。點「形狀積木」可收合，拉其他拉桿後仍保持收合。
- 拖曳分階段「傷害」6→24、「起手預警秒數」0.9→2.4：狀態列顯示「作品已修改」，即時預覽 iframe 內 ENEMY_TYPES 蘑菇立即變成 [24, 2.4]（不用存檔）。
- 按「試這隻」：開練習場，帶的是草稿值 [24, 2.4]；離開正常。
- 關掉「使用分階段攻擊」、拉等級攻擊「間隔秒數」3→5，儲存 → 重開 Maker 開關仍是「關」、數值保留；`?maker=1&play=1` 遊戲內蘑菇 phaseAttack.enabled=false、attack=projectile interval 5（兩種攻擊優先順序正確）。
- 老師頁 → 粉筆連射：5 個積木；拉「預警秒數」0.9→2.1、「傷害」12→89，收合效果積木；預覽 iframe 立即顯示 [2.1, 89]。「試這隻」打開單招展示（看得到 2.1 秒提示與粉筆扇形），「返回編輯」回來後收合狀態保留；儲存後 localStorage 積木與相容欄位一致。
- 兩種尺寸都沒有 JS 例外。
- 附註（非本卡退件理由，CSS 未改）：740×360 小螢幕時預覽是蓋在右側的浮動窗，會擋住「使用分階段攻擊」開關；按「收起預覽」後即可操作。

## Needed change
- 修正 `games/survivor/tests/levelup-layout.cjs` 第 149 行的過時選擇器（例如改成 `.maker-content`，或老師招式面板保留 `maker-move` class）。遊戲程式本身不需改。
