verdict: approve
ee84c4633e6538387b3af90ce4da6e1f2504f58f

## Files checked
- games/survivor/data/defaults.js, data/schema.js (data + shared validation/storage)
- games/survivor/game.js (data loading, MAKER_MODE isolation), games/survivor/index.html
- games/survivor/maker/index.html, maker.js, style.css
- sw.js, tests (all 13 .cjs run locally on Node: all pass), docs/survivor-maker-data-validation.md, DECISIONS.md

## Findings
- Scope matches the brief: all cards/tree/enemies/boss moves/phases moved to data; nine generic blocks (projectile, aoe, chain, dash-trail, slow, stun, knockback, summon, ring-with-gap); wave table reserved; no level editor, accounts, server, or art.
- Regression: normal mode and Maker defaults both match 153 pre-refactor snapshots (baseline from ef0f1d1); existing nine suites unchanged except loading the two data scripts.
- Safety: schema rejects unknown ids/blocks, non-finite or out-of-range numbers, prerequisite cycles, and HTML characters in names/descriptions/icons (important because game.js still renders tree/cards via innerHTML); warning >= 0.6s; pool limits kept.
- Isolation: Maker data only applies with ?maker=1; settings are not written and best record uses a separate key in Maker mode; corrupt saves fall back to defaults with a message.
- Maker UI uses textContent only; no external URLs; no roundRect/.at/structuredClone added.
- Cache busting: ?v=20261025o on all game and Maker assets; sw cache v19 precaches data scripts and Maker.
- Minor (non-blocking): the commented ✏️ Erin 設定區 in game.js is now uncommented JSON in defaults.js; the Maker page itself is now the kid-facing way to tweak numbers. The new 🧩 自己設計 menu link is a text button like the existing settings one.
- Not verified here: real browser/iPad layout, localStorage, PWA offline. Needs Erin/parent playtest.
