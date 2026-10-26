verdict: approve
632a44b6d61de16c43c93eb331ac0e47d0c3fbee

# Grok review: survivor-enemy-pacing-build

Reviewed `git diff main...codex/survivor-enemy-pacing-build` (28 files) against docs/survivor-game-plan.md §6 and the parent brief (coord/inbox/done/20261026T014019Z-parent-enemy-pacing-build.md).

## Files checked
- games/survivor/engine/pacing.js (new): pure plan/candidates/density with caller-supplied samples; event queue, behaviours, jelly split, pacingHurtPlayer
- games/survivor/engine/spawn.js, encounters.js, loop.js: type selection via pacing, alive-only enemy cap, elite cap on events, side-forced offscreen spawn, jelly queue drained at tick boundary, fairy shield before elite shield, warnings for all shots, visibility cancels prepared shots
- games/survivor/data/defaults.js, schema.js, maker/maker.js: pacing data + PACING_BOUNDS, themes/event pool locked to data file, migration of old works
- render/world.js, render/monsters.js: warning drawing, 3 new 24×24 procedural sprites
- index.html, version.json, sw.js: all `?v=` bumped to 20261026i, CACHE_NAME bumped, pacing.js added to cache list
- tests/enemy-pacing.cjs (new) + updated older tests; docs/survivor-enemy-pacing-build-validation.md

## Tests
I ran `node games/survivor/tools/test.cjs --layout` myself on the Mac Studio at this SHA: EXIT 0. All suites passed, including enemy-pacing (incl. seeded full 120 s run) and the real-Chrome levelup-layout at 6 viewports (Codex's own Chrome had SIGABRT; mine worked).

## §6 checklist
- dt-based timers/movement: yes (countdown/dt everywhere in pacing).
- Invincibility: pacingHurtPlayer respects dash, invincible and damageDisabled; collision order unchanged.
- Restart: resetEncounters clears jellyQueue and pacing; stage change re-plans.
- Caps: enemies 26 (alive count; dead are filtered each tick), elites keep limit, jelly queue ≤18, event ≤10.
- No new-iPad-only APIs (.at, structuredClone, roundRect) and no external URLs in added code; sprites are original procedural art.
- Version strings bumped; Traditional Chinese, short, kid-friendly notices.
- Scope matches brief: 8 behaviours, theme + 2 random, 45/90 s events from pool, alternating waves, offscreen spawn (jelly children at death spot as allowed), every attack warned, sandbag (jaben) always present (≥1 in 3), Maker-tunable density/pattern/HP/speed.

## Findings (non-blocking, for playtest)
1. Bomber blast cancels if the bomber leaves view during the fuse (by design); it stops moving while fusing, so it should be dodgeable — Erin to confirm the 2 s red flash reads clearly.
2. `plan()` assumes every stage id has a themes entry; fine today because themes/stages are locked by schema, but adding a new stage later must add a theme row.
3. Events stay on absolute 45/90 s; if Maker shortens the teacher time the later event simply doesn't happen — acceptable for v1, documented.
4. Density, event count and shield fairness are engineering defaults; tune in Maker after Erin plays.
