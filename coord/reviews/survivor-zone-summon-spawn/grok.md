verdict: approve
124970b39ebf86e6759a69bed28281f045bad534

# Grok review: survivor-zone-summon-spawn

## Files checked
- games/survivor/engine/spawn.js (offscreenSpawn wrapped re-check, fallback, null return; spawnEnemy null guard)
- games/survivor/engine/boss.js (bossZoneSpawn now delegates to offscreenSpawn; summonTeacher null guard, retried by loop.js:211)
- games/survivor/tests/zone-summon-spawn.cjs, tests/boss-zone.cjs
- games/survivor/index.html, preview.html, preview.js, version.json, sw.js (20261026e everywhere)
- coord/tasks/survivor-zone-summon-spawn.json, docs/survivor-zone-summon-spawn-validation.md, inbox record

## Findings
- Matches the parent request: every enemy spawn during the teacher fight (waves, teacher summon move, enemy summon attack) goes through offscreenSpawn, checked with wrapped distance against the camera rect plus r+16 margin, and kept >= player.r + r + 160 from the hero. Spawning in the fog is allowed; fog does not hurt or slow enemies (tested).
- Wrapped re-check fixes the seam case where a point could wrap back onto the visible side; oversized viewports fall back to far-side points or skip spawning, and both callers handle null safely.
- Minor note (not blocking): in the fallback path spawns cluster on a few fixed points; only reachable with near-whole-map viewports.
- §6: dt-based logic unchanged; caps (ENEMY_LIMIT) still enforced and tested; restart unaffected; ?v= and SW cache bumped; no external assets; scope stays within the card.
- Tests: `node games/survivor/tools/test.cjs --layout` exit 0 on Mac Studio, including real-Chrome levelup-layout at all six sizes (Codex's Chrome SIGABRT not reproduced here). `git diff --check` clean.
