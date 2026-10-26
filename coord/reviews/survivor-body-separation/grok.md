verdict: approve
28ae8a4659d19ab6a6c409a8ce5602d6ca6357ef

# Grok review: survivor-body-separation

Tests: full suite including --layout on Grok's cloud computer (box) via /workspace/erin-ci/run-review-tests.sh — RESULT: PASS (67 PASS lines, layout 6/6, Chrome 156, node v24).

## Files checked
- games/survivor/engine/body-separation.js (pure SurvivorBodies.solve + glue separateEnemyBodies)
- games/survivor/engine/loop.js, engine/combat.js (dashBodyPass, ordering, reset)
- games/survivor/data/defaults.js, data/schema.js (bodySeparation defaults, migration, validation)
- games/survivor/maker/maker.js (toggle + 3 sliders)
- games/survivor/manifest.js, index.html, preview.html, preview.js, version.json, sw.js (20261026q, precache)
- games/survivor/tests/body-separation.cjs, maker-ui.cjs, maker-data.cjs, maker-traces.cjs, wrap-map.cjs, teacher-offscreen.cjs, enemy-attack-phases.cjs
- docs/survivor-body-separation-validation.md, coord/tasks card, brief

## Findings (brief items)
1. Hero/enemy soft separation: overlap resolved gradually (alpha = dt*60), hero share = mass/(40+mass) with a shared 12 u/s crowd budget, so a crowd cannot shove the hero. OK.
2. Enemy/enemy: wrap-aware spatial grid, 9 neighbouring cells, ≤32 candidates per body, per-frame move cap min(0.45r, 720·dt). Cheap enough for old iPad; real-device check still pending. OK.
3. Dash pass-through: dashTimer or dashBodyPass (max(dashSeconds, dashInvincible), extended by perfect shield); normal hurt invincibility still separates. Countdown after separation, reset in resetGame. OK.
4. Heavy bodies: tank/miniboss mass 8, teacher 40 and pinned (keeps telegraphed charge paths); hero's own movement into heavy bodies is backtracked to first contact along the segment. OK.
5. Maker: toggle, radiusScale 0.5–1.5, playerForce/enemyForce 0–1; old saves get defaults, invalid values rejected; save/reopen tested. OK.
6. Not broken: offscreen bodies cannot be pushed into view; spawn/encirclement/jelly split entry points untouched; phaseAttack data unchanged by separation (tested). Contact damage is still checked before separation. OK.
7. Pure function, deterministic, no input mutation; regression tests added; version bumped incl. ?v= and sw cache. OK.

## §6 checklist
- dt-based, no new unsupported APIs (Map/Set/Math.hypot/spread only), no external assets, Traditional Chinese Maker text, restart resets new state, scope matches the card.

## Minor notes (non-blocking)
- Legacy 153-trace baseline now runs with separation off; Maker-vs-normal equivalence compares live traces instead. Reasonable, documented.
- With separation on, the old pushEnemyBodies/"push only" path is skipped; push-only now just means "no contact damage" + new separation. Fine.
- Feel values (12 u/s budget, enemyForce 0.25) are engineering defaults; Erin to playtest crowd passage, big-monster blocking, and post-dash contact.
