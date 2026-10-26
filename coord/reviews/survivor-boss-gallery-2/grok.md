verdict: approve
b3cdca60b70fa48b2c072908ad1c5dff86ee5341

# Grok 審查：survivor-boss-gallery-2（王的試煉：雙子霜火與羽翼古神）

## 看過的檔案
`git diff main...codex/survivor-boss-gallery-2`（32 檔）：engine/gallery-encounters.js（新）、engine/gallery.js、boss.js、combat.js、loop.js、posture.js、body-separation.js、school-combat.js、data/defaults.js、data/schema.js、maker/maker.js、render/gallery.js、render/world.js、art-manifest.js、art/characters/{frost-twin,fire-twin,winged}.png、tools/gallery-art.py、assets/CREDITS.md、tests/boss-gallery-2.cjs、tests/art-manifest.cjs、manifest.js、index.html／practice.html／preview.html／preview.js／practice-host.js（?v=）、version.json（20261027b）、sw.js、docs/survivor-boss-gallery-2.md、卡片與收件匣。對照卡片 brief（coord/inbox/done/20261026T170631Z-parent-boss-gallery-2.md）與 §6 清單。

## 測試
- Box：`run-review-tests.sh b3cdca6` → Chrome 測試逾時（ECONNRESET，box 環境老問題），104 PASS 後中斷。
- Mac Studio：`node games/survivor/tools/test.cjs --layout` 於 b3cdca6 → exit 0，105 PASS（含 boss-gallery-2.cjs 與 levelup-layout 全尺寸）。以 Mac 結果為準。

## 實際操作（box headless Chrome、觸控模擬，1024×461、740×360、1180×820 皆跑）
- 開始畫面「王的試煉」→ 三個選項（守門人／雙子霜火／羽翼古神，16×16 圖都載入）。
- 雙子：上方兩入口同時出現，入口期間不可攻擊，畫面外兩個箭頭。搖桿可移動。自然 AI 順序：霜＝十字/霜之衝刺，火＝火環/十字，無連續同招。
- 火環：站在缺口方向不受傷；移到環上受 1 次傷。十字：細線預告→實心旋轉，軸上受傷。
- 霜之衝刺：留下冰面（0.6 秒預警、短暫存在、緩速）；衝撞圓牆 → wall-stun 暈眩 2 秒、弱點加成 3 倍，該隻殘留冰面被清除。
- 霜暈眩時，對火的十字完美閃避：只有火的架勢上升（27→42→58→73→88→暈眩 2 秒），霜維持 0。
- 普攻同時打到兩隻；泡泡炸彈同時打到兩隻；水球投射物打到最近的一隻。
- 霜半血 → phase 2、天降冰錐落點鎖定（主角移開後不受傷）。擊倒霜 → 不結算，火進第二階段（隕石解鎖、追擊加速），全倒才「挑戰成功！」。
- 暫停時招式計時凍結，繼續正常。勝利／失敗回選單、再次挑戰狀態重設、返回開始畫面皆正常。
- 古神：俯衝落點在預警期間不追蹤，本體滑到落點；羽毛從本體發出（距本體約 40）；龍捲 0.6–0.8 秒地面預警後慢速追蹤，5 秒後消失；羽毛扇形完美閃避 5 次 → 暈眩、弱點 3 倍；半血 → 360° 螺旋羽毛（有缺口）。圓牆邊緣主角不出界。
- Maker「老師 → 王的試煉」：三王與所有新招式欄位出現（安全缺口角度、環／光束半寬、壽命、生成間隔、羽毛數量、冰面剩餘速度、旋轉）；古神血量 +3 → 2500、火環缺口 → 100，經練習場「王的試煉」進入後遊戲內數值一致，返回後回到 Maker。
- 全程無 JS 例外。

## §6 檢查
- 新程式未用 roundRect／Array.at／structuredClone；無外部網址；新圖為原創並記入 CREDITS；?v= 與 sw 快取版本已更新；文字繁中、無血腥。移動與計時皆用 dt。範圍符合卡片。

## 發現（不擋 merge，留給 Erin 試玩回饋）
1. 火環缺口朝向「出招時主角的位置」，所以站著不動一定安全；想更有挑戰可讓缺口隨機或固定方向。
2. 上方大血條只顯示目前主要那隻（state.boss）的血量；兩隻各自的血量看身體下方小血條。
3. 霜之衝刺距離固定（440×0.7 秒≈300），離牆太遠時不會撞牆暈眩，這是設計上的機會招。
4. Boss 半身在畫面邊緣時，畫面外箭頭仍會畫在它身上（沿用舊行為）。
