verdict: approve
6458c0ff508dfd15276a8f64185242689a56222e

# Grok review: survivor-weapon-picker-melee

## Files checked
- games/survivor/engine/weapons.js, render/weapons.js (new: pure swing/intersects/receivedDamage rules + glue/draw split)
- engine/combat.js, loop.js, boss.js, school-combat.js, schools.js
- data/defaults.js, data/schema.js, maker/maker.js
- ui/levelup.js, style.css, render/world.js, index.html, version.json, sw.js
- tests/weapons.cjs, levelup-layout.cjs, maker-ui.cjs, school-redesign.cjs
- docs/survivor-weapon-picker-melee-validation.md, coord/knowledge/DECISIONS.md

## Tests (Mac Studio)
- `node games/survivor/tools/test.cjs --layout`: all PASS, exit 0, including levelup-layout on all six viewports (412×915, 384×832, 915×412, 800×360, 732×310, 1024×768) and the new weapons.cjs cases.

## §6 checklist / findings
- Starter spirit picker removed; first school card sets the starter school; no school choice at start. Matches brief.
- Weapon picker: two round, icon-only pixel buttons (no emoji), no reroll, game time stopped while picking (mode levelup).
- Hammer: data-defined in defaults (`weapons` registry, stable ids), Maker-tunable with schema bounds, old saves get defaults. Auto-aim at nearest, 0.7s / 120° / 70 / 1.6x / push 15 / spin every 4th / 15% damage reduction applied through the shared damage layer and fog DoT.
- No whiff consumption of spin count, charge or dash boost; dash boost now boosts next hitting swing.
- Card mappings sensible; wall/split explicitly documented as projectile-only (not invented).
- Colours follow main school, dual-colour with fusion; default stays blue before any school card (schools.js appearance fix).
- Swing loop returns early if the run ends mid-swing (`state.mode !== 'playing'`), avoiding stale state after a boss kill.
- Stage transition keeps weapon and swing count; restart resets them.
- No roundRect / .at / structuredClone / external URLs added; dt-based timers; vfx bounded.
- Version bumped to 20261026k across index.html ?v=, manifest, sw.js cache name and precache list.
- Scope matches the card. Hero recolouring is a separate queued card, correctly not included.

No blocking issues. Balance (range, speed, close-combat risk) left for Erin's playtest.
