verdict: approve
5ad864ec604263ec4451c73604ad73b62e327acf

Card: survivor-weight-knockback (PR #70), version 20261026r.

Tests: full suite including --layout ran on Grok's cloud box (/workspace/erin-ci/run-review-tests.sh 5ad864e): 69 PASS lines, layout 6/6, RESULT: PASS.

Files checked: games/survivor/engine/body-separation.js, engine/combat.js, engine/loop.js, data/defaults.js, data/schema.js, maker/maker.js, tests/weight-knockback.cjs, tests/maker-ui.cjs, tests/maker-data.cjs, tests/maker-traces.cjs, index.html/preview/version.json/sw.js version bumps, docs/survivor-weight-knockback-validation.md, coord/tasks card, brief.

Findings (§6 checklist):
- Pure functions SurvivorBodies.mass / displacement (signed distance * multiplier / (1+(mass-1)*k)); data-driven per-enemy mass (normal 1, pudding tank 8), miniboss/boss masses and k in data with Maker controls and validation ranges; legacy saves migrate (tank 8, else 1). Body separation now uses the same targetMass. Good.
- All instant push/pull routes through shiftTarget (Maker block, school shots, melee, wind/gust, bomb pull and blast via centerFallback, wave ball); hit knockback in loop scaled per frame while the decay stays the same, so total travel scales correctly.
- Teacher pinned by bossMultiplier 0 (toggle off restores old behaviour); displacementMultiplier hook for elite super armor, independent of the toggle.
- Offscreen / spawn-protected targets are no longer moved (canAttackTarget guard), gust VFX shows the scaled distance, wave two-monster collision still damages both, seam wrap covered. 153-trace legacy snapshot kept with both new systems off; 靜電/王冠 equivalence tests unchanged and passing.
- Regression tests cover scaler, each path per kind (normal/tank/miniboss/boss), migration, rejection, and saved custom mass at runtime.
- Godot §11 notes present.

Minor (non-blocking): the bomb blast gust VFX used to always draw 40 px; it now draws the real push distance, which is the intended change. Playtest feel with Erin.
