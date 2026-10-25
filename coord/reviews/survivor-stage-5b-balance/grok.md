verdict: approve
7a2c86e3c56a419a326351b7eea72d504113804e

# Grok review: survivor-stage-5b-balance

Reviewed `git diff main...codex/survivor-stage-5b-balance` against docs/survivor-game-plan.md §6.

## Files checked
- games/survivor/game.js
- games/survivor/index.html
- games/survivor/tests/balance.cjs
- sw.js
- coord/knowledge/DECISIONS.md, coord/tasks/survivor-stage-5b-balance.json
- docs/survivor-stage-5b-validation.md

## Findings
- Pierce bug fix is correct: boss hit now checks `shot.alive`, so a spent water ball can no longer also damage the teacher in the same frame. `resolveWaterHit` centralizes pierce countdown and the 啪／穿！ feedback; pooled shots reset `alive`, `hitList`, `pierce`, `piercing`.
- Balance values match the parent brief; all new numbers live in the ✏️ `UPGRADE_TUNING` / `WAVES` tables with kid-readable comments.
- Per-type enemy damage, teacher shot damage, XP growth (`experienceNeeded`) and HUD bar all consistent.
- Caps kept: enemies (`spawnEnemy` checks ENEMY_LIMIT, so teacher summons respect it), projectiles, teacher shots (36), effects (90; water-hit recycles oldest).
- Timers use dt; boss shot/summon timers use `+=` interval; reset clears `bossSummonTimer`. Invincibility still decremented after collision check.
- No old-iPad-unsafe APIs (no roundRect/.at/structuredClone), no external URLs. `?v=20261025a` bumped for JS/CSS, SW cache v5, settings key v2.
- Ran `node games/survivor/tests/balance.cjs` (PASS) and `node --check games/survivor/game.js`.
- Scope stays within the card.

## Not verified (needs real play)
- Browser / iPad visual feel of 啪／穿！, performance with 32 enemies + effects, and whether the difficulty is right for Erin.
