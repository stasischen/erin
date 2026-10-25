verdict: approve
22615c4ddbd429a99fded12b38198218ebd9f8b1

# Grok review: survivor-boss-zone

Reviewed `git diff main...codex/survivor-boss-zone` at the SHA above against §6 of docs/survivor-game-plan.md and the parent request in coord/inbox/done/20261025T162916Z-parent-boss-zone.md.

## Files checked
engine/boss.js, engine/loop.js, engine/spawn.js, engine/state.js, render/world.js, data/defaults.js, data/schema.js, maker/maker.js, index.html, preview.html, preview.js, version.json, sw.js, tests/boss-zone.cjs, tests/clean-hud.cjs, tests/maker-ui.cjs, docs/survivor-boss-zone-validation.md, coord/knowledge/DECISIONS.md.

## Tests
`node games/survivor/tools/test.cjs --layout` on Mac Studio: exit 0. All non-layout suites pass incl. new boss-zone.cjs, and real-Chrome levelup-layout.cjs passes at all six sizes (covers Codex's SIGABRT gap).

## Findings
- Spec met: zone fixed at teacher-arrival position, wrapped distance everywhere (geometry, fog, damage, guide, spawn); diameters 3 → 2.5 → 2 → 1.5 screens with steps=3; 4 s dashed-outline warning + countdown before each shrink; phases skipped quickly still play each warning in order.
- Penalty is gentle: 2 HP/s via dt (capped by MAX_DT), 80% move speed, no instant death; dash invincibility and preview damageDisabled respected; no hurt sound/flash spam.
- Pause/levelup freeze the zone; resetGame/finishRun clear it; resize only grows the circle. Preview scenes isolated (PREVIEW_MODE → null).
- Fog uses rect + 9 arc copies with evenodd: fine on torus (world ≈12k ≫ max radius), no roundRect or newer APIs; setLineDash and fill("evenodd") are fine on old iPad Safari.
- Maker: toggle (role=switch), steps 0–3, speed 10–160, damage 0–4; schema validates and old saves migrate to defaults. Erin comment added in defaults.js.
- ?v= / version.json / sw.js CACHE_NAME all bumped to 20261026d.
- Scope matches the card.

## Non-blocking notes (for a later card / playtest)
- bossZoneSpawn picks a uniform point anywhere in the safe circle, so teacher summons (and enemy "summon" attacks during the boss fight) can appear on-screen right next to the hero. Consider a minimum distance from the player (e.g. outside the camera or ≥200 px) if Erin finds it unfair.
- The text says "4 秒" for the warning but it is hard-coded; fine for now, could be data-driven later.
- Balance (speed 40/s, 2 HP/s) still needs Erin's playtest.
