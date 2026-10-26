verdict: approve
e0e66a26967a48b006db301adf7d4ab08607f508

# Grok review: survivor-card-blocks-wind

Reviewed `git diff main...codex/survivor-card-blocks-wind` (base bff9028) against the §6 Grok checklist in docs/survivor-game-plan.md.

## Files checked
- games/survivor/engine/effect-blocks.js (10 wind recipes, new conditions still/bladeEligible, `moving` input, strict radius now honours includeTargetRadius)
- games/survivor/engine/combat.js, loop.js, school-combat.js, weapons.js, neutral.js, render/world.js (call sites switched to cardBlock / cardBlockMatches)
- games/survivor/maker/maker.js (wind + fusion-storm recipes shown as block stacks, new trigger/condition/action labels)
- tests/effect-blocks-wind.cjs + effect-blocks-wind-legacy.json, tests/maker-ui.cjs
- version bump 20261026ah in index.html, practice-host.js, preview.js, practice.html, preview.html, version.json, sw.js
- coord/tasks card, docs/survivor-card-blocks-wind-validation.md

## Findings
- Formulas match the old code one-for-one (wind-attack speed/range/melee size, wind-speed moveRate, wind-dash field damage/push and bubble pull, fusion-storm water+wind trail, tornado orbit/tick/strict hit, wind-blade pierce and chase, gust, refund, light move/pickup and magnet ring, eye wall push/bullet block/ring radius).
- The strict-radius change only affects rules with both strict and includeTargetRadius; on main the two existing strict rules (thunder-counter, water-attack) don't set includeTargetRadius, so their behaviour is unchanged.
- No balance, card pool or save-format changes; shared values still write back to the original fields.
- Note (pre-existing, not counted): the open preview pane covers the right-side ＋ buttons in the shared-values block, same as on the water/thunder cards.
- Note (minor): five cards' preview caption reads 「使用原本的卡片組合。」 rather than a card-specific sentence; the preview itself shows the right effect.

## Tests
- Ran on Grok's box (cloud computer): `/workspace/erin-ci/run-review-tests.sh e0e66a2…` → full suite incl. --layout, 84 PASS, layout 9 sizes OK, RESULT: PASS.

## Hands-on (box, headless Chrome, touch emulation, 1024×461 and 740×360)
- Maker → 技能卡: selected all ten wind cards; each shows its block stack, folds/unfolds, opens the preview iframe (e.g. 風之眼 ring around the hero). Raised 風入門 speed 0.18→0.19 and the preview caption changed to 19%; saved, reloaded, value kept.
- Play (tap attack/dash buttons, drag joystick), with values compared side by side against main: joystick moves the hero (212 px, 233 px with wind-light); water ball speed/range 390/623 → 460/735 with wind-attack; attack interval 0.720 → 0.643 while moving with wind-speed; dash leaves wind fields that hurt and push; fusion-storm leaves water and wind fields; tornado orbits and hits on its tick; wind-blade fires a small chase blade; gust pushes nearby monsters; refund restores dash charge; wind-eye wall appears after standing still, pushes monsters and blocks an enemy bullet. All numbers identical to main; no page errors.
