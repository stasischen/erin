verdict: approve
dd9cbcdcc3c3218a02589607996b2823f40fa6ab

# Grok review: survivor-wave-blocks (PR #90, version 20261026an) — re-review after changes

## Files checked
- games/survivor/maker/maker.js (new playGame(itemId); footer #play now uses selected[tab]; trial() shares it)
- games/survivor/maker/style.css (`.weapon-block > .grid > button { align-self: start; }`)
- games/survivor/tests/maker-ui.cjs (new footer 試玩 click tests)
- docs/survivor-wave-blocks-validation.md, coord/tasks/survivor-wave-blocks.json, version bumps (index.html, practice/preview html+js, version.json, sw.js)
- Diff checked: `git diff 4edcb21 dd9cbcd` plus full `git diff main...codex/survivor-wave-blocks` re-read for the changed areas.

## Code review (§6 checklist)
- Both issues from the previous review are fixed with small, targeted changes: the undefined `item` in the footer #play handler is gone (shared playGame with the selected item id), and the toggle buttons no longer stretch with the grid row. Data / compile / spawn logic unchanged since the last review. OK.
- Minor (non-blocking, carried over): the event warning text still uses the original event name (e.g. 「蒲公英湧潮！」) even when the event's monster is changed.

## Tests
- Box (`/workspace/erin-ci/run-review-tests.sh dd9cbcd…`): RESULT: PASS, 93 PASS lines, full --layout included (the 732×310 classroom check that failed before now passes). Ran on the box; Mac Studio fallback not needed.

## Hands-on (box headless Chrome, touch emulation)
- 732×310, 1024×461, 740×360: footer 試玩 tapped on 關卡 tab for 糖果森林 → `?maker=1&play=1&stage=classroom`, 餅乾森林 → `&stage=playground`, 出怪節奏 / 巧克力大熊 → plain play URL (classroom); also from a non-關卡 tab. Game loads, no page errors (was ReferenceError before).
- 「啟用」/「進場提示」 toggles measured 44 px tall on 巧克力大熊 / 精英怪 / 糖果森林 both with menus closed and with every choice menu opened (was 180 px).
- Full previous flow repeated at 1024×461 and 740×360: block collapse/expand, 預覽 timeline updates (布丁 ×3, 1.79 s, 上方), validation errors block 試玩 and clear when fixed, save, pacing steady + events 6/12 s with 果凍, elites off → 已停用, 巧克力大熊 ratio + hint, footer 試玩 from 餅乾森林 starts that stage with 甜甜圈 ×2 alternating sides, events on time, restart stays in stage, reload keeps edits. No page errors. (Some EXC lines in my log came from a quoting bug in my own probe script reading menu labels, not the game; the preview text confirmed those choices applied.)
