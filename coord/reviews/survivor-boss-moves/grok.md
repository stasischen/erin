verdict: approve
625164b3c2fa3f21e1240a468c26b4bd29f5616d

## Files checked
- games/survivor/game.js (BOSS_TUNING / BOSS_MOVES, beginBossMove, fireBossFan, ringPoints, updateBoss, drawBossMoves, tick, render)
- games/survivor/index.html (?v=20261025n), sw.js (erin-games-v18)
- games/survivor/tests/boss-moves.cjs, balance.cjs, enemy-shoot.cjs
- coord/tasks/survivor-boss-moves.json, coord/knowledge/DECISIONS.md, docs/survivor-boss-moves-validation.md

## Findings
- Scope matches the brief: words kept, plus chalk fan, eraser dash, test-paper rain, roll-call circle, summon (spawns via existing off-screen spawnEnemy), shrinking ring with a gap. Every move gets a 0.9 s warning; the first warning frame does not count down, and hits only start a frame after activation.
- Phases at 66% / 33% step one at a time (double-cross plays both), clear previous moves/teacher shots, shout 安靜！, flash, 1 s pause, shake gated by the vibration setting. Rests 1.7/1.2/0.8 s; combos only rain/call + words/chalk; no immediate repeat.
- Off-screen fairness: bossHurtPlayer and teacher shots require the teacher visible; shots outside the camera are recycled; moves cancel when the teacher leaves the camera; dash end and rain/call points are clamped to the visible area; contact damage disabled during dash and phase pause.
- Ring gap faces the map centre and the end radius stays ≥ 50, so there is always an exit; skipped on very narrow views.
- Caps/pools: 8 hazards pooled, 36 teacher shots, shots have a 4 s life; reset/finishRun clear moves. dt-based timing; invincibility still shared with existing protection.
- Conventions: tuning block at top of game.js with kid-readable ✏️ comments; ?v= and sw cache bumped; no new external assets; no roundRect/.at/structuredClone added.
- Tests: node --check passes and all 9 games/survivor/tests/*.cjs pass on the Mac Studio.
- Minor (non-blocking): new boss-move hits in bossHurtPlayer don't call navigator.vibrate like other hits do; can be aligned later. Balance (12 damage, pacing) still needs Erin's playtest.
