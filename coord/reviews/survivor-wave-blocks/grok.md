verdict: changes
c9d1b5787166545d266222ea097695e0d3a2c68e

# Grok review: survivor-wave-blocks (PR #90, version 20261026am)

## Files checked
- games/survivor/data/schema.js (waveDefinitions / waveStacks / compileWaves, validate stage + legacy migration)
- games/survivor/engine/loop.js, pacing.js, encounters.js, spawn.js
- games/survivor/maker/maker.js (wave block editor, preview, play button)
- games/survivor/tests/wave-blocks.cjs, wave-blocks-legacy.json, maker-ui.cjs
- docs/survivor-wave-blocks-validation.md, coord/tasks/survivor-wave-blocks.json, index.html / practice / preview version bumps, sw.js

## Code review (§6 checklist)
- Data stays whitelisted and serialisable; compile is pure (no clock / DOM / random). Legacy saves convert via waveStacks with typeId 'pacing', count 1, position 'zone' (and tide keeps side 0 = left), so default spawns go through the same bossZoneSpawn / offscreenSpawn paths as before. Chocobear default 'random' maps to side undefined = old behaviour. OK.
- Bounds are enforced (count 1-10, every 0.3-5, start 0-300, event times increasing, first wave at 0). OK.
- Minor: the event warning text is still the old fixed name (e.g. 「蒲公英湧潮！」) even after the tide event's monster is changed to 果凍 in Maker. Not blocking, but nicer if the notice follows the chosen monster.

## Tests
- Box (`/workspace/erin-ci/run-review-tests.sh c9d1b57…`): FAIL rc=1, 87 PASS, layout 4/6. Failure at 732×310: `classroom 最後控制項被遮住` (levelup-layout.cjs:112).
- Re-ran on the Mac Studio (`node games/survivor/tools/test.cjs --layout`) because 732×310 is the known borderline size: same FAIL (`classroom 最後控制項被遮住`), 87 PASS. So it is real, not the box font.
- Diagnosis at 732×310 (box headless Chrome): on 關卡 → 糖果森林 / 餅乾森林 with all blocks open, the last control is the wave feedback block's 「進場提示：關」 button and it is 180 px tall (top 100 → bottom 280) while the editor area is only 148 px tall (100 → 248). It looks like the toggle is being stretched by the grid row next to the open 「進場音效」 choice. 出怪節奏、精英怪、巧克力大熊 pass.

## Hands-on (box headless Chrome, touch emulation, 1024×461 and 740×360)
Worked:
- 關卡 tab lists 出怪節奏 / 糖果森林 / 餅乾森林 / 精英怪 / 巧克力大熊. Each stage shows 6 wave stacks × 5 blocks (觸發/形狀/時機/效果/回饋); collapsing and re-opening a block by tap works.
- 「預覽」 opens the side timeline; changing wave 1 to 布丁 ×3, every 1.79 s, 上方 updates it immediately. No right-side ＋ button covered.
- Setting wave 2 start to 0 shows 「波次時間需從 0 秒遞增」, the preview says to fix first, and 試玩 is blocked; setting it back to 20 clears the error and 儲存 works. Event 1 = event 2 shows 「事件時間需遞增」 and clears when fixed.
- 出怪節奏: switch to 穩定出怪, events at 6 / 12 s, all four events set to 果凍: preview updates. 精英怪 enable switch off → preview 「已停用」. 巧克力大熊 time ratio and 進場提示 toggle work. Reloading Maker keeps all edits.
- Game side (loaded the saved build directly with `?maker=1&play=1&stage=playground`): starts in 餅乾森林, spawns 甜甜圈 ×2 per batch from alternating sides, event warning at 6 s then 果凍 enter from off-screen, steady pattern, zero elites while disabled, restart stays in 餅乾森林. No page errors.

Broken (blocking):
- **The footer 「試玩」 button does nothing on the 關卡 tab.** Tapping it throws `ReferenceError: item is not defined` at maker/maker.js line ~505 (`draft.stages.some(s=>s.id===item.id)` inside the #play click handler, where `item` is not in scope). The save happens but the page stays in Maker, so spec point 3 (「試玩」 from the 關卡 tab, including 從餅乾森林試玩) does not work at either size. Other tabs are unaffected because `tab==='stages'` short-circuits.

## What to fix
1. Make the 關卡 tab's 試玩 button work (use the currently selected stage item, e.g. the same selection the editor uses) and navigate to `?maker=1&play=1&stage=<id>` for 糖果森林 / 餅乾森林, plain play for the other items. Please add a Maker UI test that actually clicks #play on the 關卡 tab.
2. Fix the 732×310 layout: the wave feedback 「進場提示」 toggle must not stretch taller than the editor area (e.g. align-self:start / don't let it share a stretched grid row with the open choice). Grok will re-run --layout.
3. (Optional) make the event warning text follow the chosen monster.
