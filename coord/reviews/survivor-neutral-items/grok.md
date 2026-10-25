verdict: approve
e87bee44b717aa682349b95c49f97dd4429f089c

# Grok review: survivor-neutral-items

Files checked: data/defaults.js (10 item-* cards, neutralRules), data/schema.js (NEUTRAL_BOUNDS, neutral identity, migration), engine/neutral.js (pure reward/damage/bounce + glue), engine/combat.js, engine/loop.js, engine/schools.js (neutralPool), engine/school-combat.js (single damage multiplier), engine/state.js, ui/levelup.js, maker/maker.js, render/world.js, icons.js, index.html, manifest.js, sw.js, version.json, tests/neutral-items.cjs, tests/school-redesign.cjs, docs/survivor-neutral-items-validation.md.

Tests: `node games/survivor/tools/test.cjs --layout` re-run by Grok on Mac Studio: exit 0, all suites PASS including levelup-layout (6 real-Chrome viewports) and neutral-items.

## Checklist (§6)
- iPad/phone: no touch/input changes; no roundRect/.at/structuredClone in new code; canvas uses arc/fillText only. OK.
- Logic: all neutral timers use dt; bombs capped at 12, shots stay under PROJECTILE_LIMIT, split once per shot, fragments don't split; pause freezes; resetGame clears neutral state; stage transition keeps counters/pool/rerolls. OK.
- Damage multiplier applied once via schoolDamage (shared entry for damageEnemy/hitBuildTarget); crown clamps HP on pickup, max HP floor 1. OK.
- Conventions: ?v= and CACHE_NAME bumped to 20261026h, neutral.js in manifest and precache; data-driven with Maker bounds and Chinese labels; Traditional Chinese, kid-friendly text; no external assets. Scope matches the brief. OK.

## Notes (non-blocking)
- Bounce uses the visible screen rectangle, so shots bounce at screen edges, not the wrapped world; matches brief.
- Rerolls now carry across stages (previously recomputed?); consistent with per-run quota test.
- 5 items per run and other numbers are engineering defaults awaiting Erin's playtest.
