verdict: approve
486959d19bea12c923272fb743adc79c40f93500

# Grok review: survivor-dash-upgrade

Reviewed `git diff main...codex/survivor-dash-upgrade` (23 files) against docs/survivor-game-plan.md §6 and the brief coord/inbox/done/20261025T162014Z-parent-dash-upgrade.md.

## Files checked
- games/survivor/engine/combat.js (activateDash, imminentDashThreat, boosted fireAtNearest)
- games/survivor/engine/loop.js (charges recharge, slow motion, ghosts, reset)
- games/survivor/engine/boss.js (wall / cage kinds, wallX, hit checks, narrow-screen guard)
- games/survivor/engine/state.js, spawn.js (new state fields, dodged flags)
- games/survivor/data/defaults.js, schema.js (new tuning + bounds, legacy migration of moves)
- games/survivor/render/hud.js, world.js (segmented dash ring, wall/cage drawing, ghosts, boosted shot ring)
- games/survivor/maker/maker.js, preview.js, preview-engine.js, preview.html (labels, captions)
- games/survivor/tests/dash-upgrade.cjs, dash-skill.cjs, maker-data.cjs, maker-baseline.json
- index.html / preview.html / sw.js / version.json (20261026c)

## Test run (Grok, Mac Studio)
`node games/survivor/tools/test.cjs --layout` exit 0: all suites PASS, including the real-Chrome levelup-layout at all sizes (Codex's SIGABRT did not reproduce here) and the new dash-upgrade.cjs.

## Checklist
- iPad: no new media queries, no roundRect/at/structuredClone; dash ring uses conic-gradient segments, icon only, no text/emoji. OK.
- Logic: all timers use dt; dash protection still extended after collision (existing pattern), dashInvincible covers whole dash; reset clears charges, dashAttack, slowMotion, ghosts. Slow motion scales dt only in playing mode. OK.
- Pools/limits: ghosts are short-lived (0.22 s) and only pushed while dashing; wall/cage respect hazardLimit and the <196px narrow-screen guard. OK.
- Data-driven: all new numbers in defaults + TUNING_BOUNDS + Maker labels; legacy saves get missing fields and the two new moves appended. OK.
- Version bumped everywhere; scope matches the card.

## Findings (non-blocking)
1. Perfect dodge counts any contact monster within r + speed*window, so in a crowd almost every dash will be "perfect" (+2 HP, 0.35 s shield, 0.3 s slow motion). Once per enemy limits it, but hordes are large. Worth watching in Erin's playtest; perfectHeal / perfectSlowSeconds are tunable in Maker if it feels too easy or too slow-mo heavy.
2. The new "衝刺縮圈" is a short dash-through boss move (shrinks to centre in 1.6 s, 12 damage), not the Brawl Stars-style three-stage battle zone with slow drain that the parent described earlier. That zone still needs its own card.
3. Codex's validation doc says "未上線" and Chrome layout pending; superseded by this review's real-Chrome run.
