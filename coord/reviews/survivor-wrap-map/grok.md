verdict: approve
264c2ab074e422003b3cb35c2f626fbb4482396e

# Grok review: survivor-wrap-map

## Files checked
- engine/loop.js (wrapCoordinate / wrapDelta / deltaX / deltaY, clampToMap now wraps, camera follows player, resetMap sizing, shot/gem/effect wrap, enemy-shot 8 s life)
- engine/combat.js (targetVisible via shortest delta to camera centre, canAttackTarget, nearest/chain/push-pull)
- engine/boss.js (moves use a camera-local copy of the teacher, dash end clamped to screen then wrapped, ring gap now faces player)
- engine/spawn.js (four-side off-screen spawn, then wrapped; book shooters use targetVisible)
- engine/state.js (takeFromPool wraps finite x/y)
- render/world.js (seamless 336x252 tiles, candy/cookie forest, neighbour-world offsets for bodies, shadows, hazards, shots, particles)
- data/defaults.js, data/schema.js (stage names/backgrounds, legacy classroom/playground migration only)
- index.html / preview / version.json / sw.js (version 20261025ab everywhere), tests incl. new tests/wrap-map.cjs

## Test run (Mac Studio, this SHA)
- `node games/survivor/tools/test.cjs --layout` EXIT 0, all suites PASS, including real-Chrome levelup-layout.cjs at 412x915, 384x832, 915x412, 800x360, 732x310 (DPR3). The SIGABRT Codex saw did not reproduce here.

## §6 checklist
- iPad/phone: no input or CSS changes; resize still resets imageSmoothingEnabled; no roundRect / .at / structuredClone / external URLs added.
- Logic: movement still dt-based; contact check still before invincibility countdown; pools and caps kept (book shots get an 8 s life so they cannot pile up forever on a torus).
- Conventions: version bumped and ?v= updated; original Canvas pixel art only, no emoji, no screenshots; Traditional Chinese names; scope matches the brief.

## Notes (non-blocking)
- World is ~12k px per side (4096 x 3, tile-aligned), far above the 2.5x minimum, so kids will rarely actually reach the seam by walking. If Erin wants to "feel" the wrap more, a smaller reserve (e.g. 2.5-3x the real screen) is a later tweak.
- resize() can call resetMap() mid-run only if the viewport exceeds 2.5x the reserve, which is practically unreachable.
- Needs Erin's real-device playtest of the seam and the forest look.
