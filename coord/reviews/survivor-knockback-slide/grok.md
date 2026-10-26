verdict: changes
56f153dab540b77bdc86ff261e300ab6ec1de27a

# Grok review: survivor-knockback-slide (PR #94, version 20261026ar)

## Files checked
`git diff main...codex/survivor-knockback-slide` (37 files). Read closely: engine/body-separation.js (SurvivorSlide impulse/sweep/step, slideObstacles, slidePrediction, updateTargetSlide), engine/combat.js (shiftTarget, damageEnemy, updateBomb), engine/loop.js, engine/boss.js (leap push), engine/neutral.js (wave collision), engine/debug-tools.js (arrows), data/defaults.js + data/schema.js (slideSeconds), maker/maker.js, tests/knockback-slide.cjs, tests/slide-legacy.cjs, tests/weight-knockback.cjs, docs/survivor-knockback-slide-validation.md, version bumps (index.html ?v=, version.json, sw.js).

§6 checklist: dt-based exact integration (same distance at 30/60/120 fps); restart clears slide; no new DOM/touch code; no Array.at/structuredClone/roundRect in game code; ?v= bumped to 20261026ar; Traditional Chinese; no external assets. OK.

## Tests
Box: `/workspace/erin-ci/run-review-tests.sh 56f153d…` → RESULT: PASS (97 PASS lines, layout 9/6, 241 s; node 24.22.1, Chrome 156).

## Hands-on (box, headless Chrome, touch emulation, 1024×461 / 740×360 / 1180×820)
- Joystick drag moves the hero; attack button taps hit.
- Water ball (no hit-stop by design for ranged): enemy stays put, then slides 45 units over ~0.18 s, per-frame steps 7.2 → 6.5 → … → 0.3 (decelerating, no jump). Charged shot same.
- Candy hammer (melee): ~30 ms hit-stop, then the slide starts (9.6 → 8.8 → … decreasing), total 60. Same on all three sizes. Pause-then-slide feel is right.
- Bomb: 55 units over ~0.2 s, decelerating.
- Teacher barrier wall: a 100 push stopped exactly at the wall face (no tunnelling).
- Pushing into another body 40 units away: stops on contact; the blocker is not moved.

## Findings (blocking)
1. **Crowd knockback mostly disappears, so the game gets harder.** Every other enemy body is a hard stop for the slide, and an already-overlapping body stops it at t=0. With 30 jaben around the hero and 14 hammer taps (1024×461 and 740×360), about 350 knockback impulses gave 0 movement for 62 % (220/356); only about 1/3 landed in full; total realised distance was **33 %** of requested. On main every hit enemy moved the full distance. Survivor play is mostly crowds, so this breaks "total distance about the same / difficulty unchanged". Suggestion: only real walls (teacher barriers, future bounded arena) stop a slide. Leave enemy-vs-enemy overlap to body separation as before. If bodies must block, at least ignore bodies the target already overlaps and only stop on big blockers. Keep the wave-ball contact damage as a contact check that doesn't need to stop the slide.
2. **The purple fog circle (bossZone) acts as a wall.** bossZone is a soft damage zone that hero and enemies walk through freely, but `slideObstacles` passes it as a hard boundary for every target. During the teacher fight, an enemy just outside the circle hit outward moved **0** (on main: full 45). Enemies inside slide only up to the fog line. At the final radius of 180, most incoming minions are outside, so knockback is gone in the teacher's late phase. The hero is also stopped at the fog by the leap push. Suggestion: don't use bossZone as a slide boundary. Keep the circle-arena sweep for the future 王的試煉 bounded arena.

Non-blocking: the arrow, Maker slideSeconds field, hit-stop/pause handling, the stacking cap and frame-rate independence look good. Tests cover them.
