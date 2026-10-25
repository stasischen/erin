verdict: approve
a50a49ccfe2d2945d852489af63dc20156a943fb

# Grok review: survivor-dash-skill（衝刺與泡泡炸彈）

## Files checked
- games/survivor/game.js, index.html, style.css, sw.js
- games/survivor/tests/dash-skill.cjs（並跑 balance.cjs、enemy-shoot.cjs）
- coord/tasks/survivor-dash-skill.json, coord/knowledge/DECISIONS.md, docs/survivor-game-plan.md, docs/survivor-dash-skill-validation.md

## Checks
- `node --check games/survivor/game.js` OK；三組測試全部 PASS。
- 規格符合：💨 衝刺（0.15 秒、3 倍速、無敵、冷卻 2.5 秒、往搖桿／面向方向）、🌀 泡泡炸彈（0.6 秒後爆、範圍傷害＋擊退、冷卻 8 秒、可打老師）、空白鍵／E、冷卻光圈（conic-gradient）、safe-area 右下角、直向縮小與一次性「橫著拿更好玩喔」提示。
- iPad：按鈕 `touch-action: none`、用 pointerdown；搖桿仍只追蹤第一根手指 pointerId，按按鈕不搶搖桿（有多指測試）；沒用 roundRect / .at / structuredClone；沒用 hover media query 藏觸控 UI。
- 邏輯：移動與計時用 dt；衝刺無敵在碰撞後才扣（最後一幀不受傷有測）；暫停／選卡／設定時不施放也不倒數；resetGame 清掉炸彈與冷卻；Esc 仍可暫停（空白鍵改為衝刺）。
- 慣例：數值在 ✏️ 設定區且設定頁可調、註解易懂；`?v=20261025e` 與 sw `erin-games-v9` 已更新；無外部網址；繁中、沒有嚇人畫面；後續黑帝斯式升級路線只記錄未實作，未超出卡片範圍。

## Minor (non-blocking)
- `updateActionControls()` 每幀重寫 `style.cssText` 與按鈕背景，之後可只在數值變化時更新。
- 暫停畫面焦點在按鈕上時，Esc 會被略過（可按「繼續遊戲」），之後可順手調整。
- 實機待驗：iPad 多指手感、旋轉、按鈕大小，請 Erin 試玩後再調設定。
