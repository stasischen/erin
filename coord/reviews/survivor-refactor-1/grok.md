verdict: approve
fc78cb8db68c251407086283cd5a8cd17f12a15d

# Grok review: survivor-refactor-1 (zero-behavior refactor, step 1)

## Files checked
- games/survivor/manifest.js, game.js (parser-time classic loader), engine/{state,loop,combat,spawn,boss}.js, stages.js, render/{world,hud}.js, ui/{levelup,settings}.js, input.js
- index.html, preview.html, preview.js, sw.js, version.json, tools/version.cjs, tools/test.cjs
- style.css, maker/style.css
- tests/load-game.cjs, tests/refactor.cjs and the loader changes in existing tests
- docs/survivor-refactor-1-validation.md, coord/tasks/survivor-refactor-1.json

## Verification (run by Grok on the Mac Studio, real Chrome available)
- `node games/survivor/tools/test.cjs --layout`: every test passes, including version.cjs, refactor.cjs, maker-data (153 baseline traces in normal and Maker modes, maker-baseline.json unchanged) and levelup-layout.cjs in real headless Chrome at 412x915 rotated, 384x832, 915x412, 800x360 and 732x310 (DPR3, touch, three cards, 64px confirm, double-tap, keyboard, Maker lists and edit). Preview share 26.5-31.1% and blank space 9.7-12.6%, in line with the previous approved layout (PR #27/#28), so no visible layout regression.
- Codex's sandbox could not launch Chrome; this run closes that open item.

## Checklist (§6)
- iPad/phone: no new APIs (`.at`, `structuredClone`, `roundRect`, `replaceAll` absent from browser code); classic scripts only, no modules or fetch loader; document.write at parse time keeps maker.js/preview-engine.js ordering. Touch/pointer code moved unchanged (dash-skill, clean-hud tests pass).
- Game logic: unchanged; deterministic trace snapshots identical.
- Conventions: single version source; ?v= synced in index.html, preview.html, preview.js; CACHE_NAME derived from version; every manifest script precached, and the checker fails on missing entries or a stale CACHE_NAME. No external assets. Scope matches the card (no showcase sandbox, no new rules).

## Notes (non-blocking)
- The ✏️ Erin settings block now lives at the top of engine/state.js instead of game.js; the plan's checklist still says game.js. Worth updating the doc or adding a pointer comment in game.js in a later step so Erin knows where to look.
- iPad Safari real-device check still recommended after deploy (document.write loader + sw cache name change).
