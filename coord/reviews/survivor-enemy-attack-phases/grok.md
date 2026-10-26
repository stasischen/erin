verdict: approve
502241ef30135a8a6ac86d0ecf59ab7f5b66801f

# Grok review: survivor-enemy-attack-phases

Tests: full suite incl. --layout on Grok's cloud computer (box) via /workspace/erin-ci/run-review-tests.sh: RESULT PASS (64 PASS lines, layout 6/6, Chrome 156, node 24). Codex ran non-layout suite only, per rule.

## Files checked
- games/survivor/engine/pacing.js (advanceAttack / attackAngles / inShape pure rules, updatePhasedAttack glue, bodyContactDamage, pushEnemyBodies)
- games/survivor/engine/loop.js (phase shot lifetime, body contact scale + pushOnly, offscreen cancel)
- games/survivor/engine/spawn.js, boss.js (old shooting path skipped when phaseAttack enabled; phaseShot:false on pooled shots)
- games/survivor/render/world.js (drawPhasedAttacks uses same locked origin/angle/config as hit test; pudding lift)
- games/survivor/data/defaults.js, data/schema.js (phaseAttack + bodyContact defaults, bounds, validation, old-save migration, ring inner<outer)
- games/survivor/maker/maker.js (phase fieldset, toggles, ranges)
- tests/enemy-attack-phases.cjs + updated tests; docs/survivor-enemy-attack-phases-validation.md
- index.html / preview.html / preview.js / sw.js / version.json bumped to 20261026o

## §6 checklist
- iPad: no new touch handling; no roundRect / .at / structuredClone (canvas uses rect/arc). OK
- Logic: phases driven by dt, max one phase change per tick; damage goes through pacingHurtPlayer (respects invincible/dash/damageDisabled); body contact still checked before invincible countdown; restart/stage change clears enemies & shots; projectiles pooled and capped by enemyShotLimit. OK
- Conventions: data in defaults + Maker; version ?v= bumped; no external assets; Traditional Chinese, kid-friendly text (準備！ / 反擊機會！). Scope matches the brief (three monsters, body contact settings; donut/pop-candy unchanged; no super armor/combos). OK

## Findings (non-blocking)
- If the player is invincible/dashing on the frame a melee shape becomes active, the attack is marked hit and won't hit later in the same active window. Lenient, kid-friendly; fine.
- Fairy gap is centred on the locked player direction, so standing still is safe; intended, playtest whether it's too easy.
- pushOnly also removes the gummy bear / dandelion light damage (global toggle) — matches the brief's wording.
- Initial numbers are playtest defaults; Erin to check warning readability and pudding dodge time.
