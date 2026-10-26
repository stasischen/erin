verdict: changes
0bbcc3792b96b8028aab513c7e2a0882e956dd8e

# Grok review: survivor-move-practice

Files checked: games/survivor/practice-engine.js, practice-host.js, practice-rules.js, practice.css, practice.html, maker/maker.js, maker/style.css, index.html, preview.html, preview.js, tests/move-practice.cjs, tools/version.cjs, version.json, sw.js, docs/survivor-move-practice-validation.md, coord/knowledge/DECISIONS.md.

Tests: ran on Grok's box (cloud computer), `/workspace/erin-ci/run-review-tests.sh 0bbcc37…` → RESULT: PASS, 70 PASS lines, layout 6/6. The existing --layout suite does not open the practice room, so I also opened it in real headless Chrome (served over http, Maker → practiceOpen) at 732×310, 1024×768, 1366×768 (landscape) and 390×844 (portrait, rotated shell). No console errors; 8 move buttons; dock/close/iframe sizes sane; picking 布丁 then 15 rapid slider inputs kept the selection and reloaded cleanly; closing the dock restores `maker-room`.

## Must fix

1. **Enemy move buttons render as giant sprites over the practice UI.** `practice.css` has a global `canvas{position:absolute;width:100%;height:100%;...}` meant for the stage canvas, but the five enemy buttons also contain a `<canvas>` (32×32 sprite from `SurvivorMonsters.picture`). Those button canvases become absolutely positioned at 100% of the iframe (no positioned ancestor), so huge pixel monster blocks cover the left button column and the legend/description footer at every size I tried (clearly visible at 732×310 and 390×844). Because they paint above the non-positioned buttons and footer, the 預警/生效/反擊機會/冷卻 legend and the one-line summary are mostly unreadable, and touches on the button column land on the topmost sprite canvas (i.e. an enemy button) instead of the button under the finger, so a kid can't reliably pick 水球/錘子 by touch. Fix: scope the rule to the stage canvas (e.g. `#practiceStage canvas` / `#gameCanvas`) and give button canvases a fixed size (like `.pixel-icon`, ~26–32px, `image-rendering:pixelated`). Please add a regression check that every `#practiceMoves button` child stays inside its button's rect (and that the description element is not covered, e.g. via `elementFromPoint`).

## Notes (not blocking)

- §6 checklist otherwise OK: `touch-action:none` on the stage canvas, `user-select`/`-webkit-touch-callout` off, dt capped at 0.05, pauses on visibilitychange, `imageSmoothingEnabled=false` re-set in `practiceSize()` after resize, `?v=20261026s` bumped everywhere incl. practice.html/practice-host.js, new files precached in sw.js, no external assets, no newer APIs (no roundRect/at/structuredClone).
- Every Maker `input` event reloads the whole iframe. Works (latest value wins), but continuous slider drags will flash/restart a lot; a short debounce (~150–250 ms) in `SurvivorPractice.refresh` would feel calmer. Optional.
- `window.blur` sets `state.mode='playing'` (sandbox keeps animating when unfocused) — fine for practice, just noting it's intentional.
- Optional teacher moves / 10-dodge challenge skipped as documented; donut/pop-candy honestly shown as legacy with zero recovery — good.
