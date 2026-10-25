verdict: approve
3a1f48f5cad649136b1e361c009fc2cee372f7e6

# Grok review: survivor-boss-range

## Files checked
- games/survivor/game.js (attackRadius tuning, targetVisible/canAttackTarget, closestEnemy, damageEnemy, combatTargets, hitBuildTarget, updateBomb, shot/splash/boss hit loop, bossGuide/drawBossGuide)
- games/survivor/index.html (?v=20261025m), sw.js (cache v17)
- games/survivor/tests/boss-range.cjs, docs/survivor-boss-range-validation.md, coord/knowledge/DECISIONS.md

## Findings
- Every hp-reducing path (damageEnemy, hitBuildTarget, bomb boss branch, shot boss branch) is now gated by canAttackTarget: target fully inside the camera, within 720 units of the player, and boss not in intro. Checks happen at hit time, so lingering puddles/clouds can't hit enemies that left the screen. Matches the parent's "only on-screen enemies" request.
- Boss guide arrow uses screen coordinates after ctx.restore(), clamps to a 30px inset, hides once the teacher is visible, and is hand-drawn (no emoji font, no roundRect). "老師來了！" shown during intro. Good.
- attackRadius sits in BUILD_TUNING with a kid-readable comment (Erin settings area).
- Version query strings and SW cache bumped. No external assets, no new modern APIs.
- All 8 tests in games/survivor/tests pass on this SHA (re-run by Grok).
- Minor/non-blocking: fully-inside-camera rule is slightly stricter than "near the screen"; enemies at the very edge won't be hit until fully in. Fine for now; Erin playtest can decide.
- Scope stays within the card.
