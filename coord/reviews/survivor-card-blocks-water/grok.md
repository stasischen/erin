verdict: approve
97acf6ed9922649808f478173db39c4cf8417093

# Grok review: survivor-card-blocks-water (unified-plan card 6, water 2/5)

## Files checked
- games/survivor/engine/effect-blocks.js (10 water recipes, new conditions positiveDamage/bubbleActive/wetTarget/shotMultiple, drop(), dt input)
- games/survivor/engine/combat.js (schoolEffect splash, addField/updateFields water block, dash-trail spacing, water ultimate via block)
- games/survivor/engine/school-combat.js (schoolDamage wet, absorbSchoolHit bubble, dash end, shot-hit wet, fountain, rain; applyCardTargetActions wet/slow)
- games/survivor/engine/schools.js (big drop through SurvivorEffectBlocks.drop)
- games/survivor/maker/maker.js, preview.js (water/fusion-puddle stacks, trigger/condition/action labels, captions)
- tests/effect-blocks-water.cjs + legacy json, tests/maker-ui.cjs, version bumps (index.html, practice/preview, sw.js, version.json -> 20261026ag)

## §6 checklist
- dt-based timers kept (rain tick slow = dt*2, pulses unchanged); field pool/limit reuse unchanged.
- ?v= bumped everywhere; no external assets; Traditional Chinese short labels; scope limited to the 10 water cards (other schools untouched).
- Formulas reviewed line by line against main: splash radius/damage, field radius/growth/seconds/interval/limit, field tick damage fieldDamage*max(1,level) with level=max(water-skill,water-dash,fusion-storm), fusion-puddle extra fieldDamage*level, ultimate damage/interval, big drop size/damage/push, fountain radius(<=)/push/wet, bubble absorb only when damage>0, wet multiplier 1+wetDamage, rain slow/wet. All equivalent.

## Tests
- Box (Grok's cloud computer, no machineId): /workspace/erin-ci/run-review-tests.sh 97acf6e… -> RESULT: PASS, 82 PASS lines, layout 9 sizes OK, 124s.

## Hands-on (box, headless Chrome, touch emulation, 1024×461 and 740×360)
- Maker 技能卡: tapped each of the 10 water cards; each shows 積木堆 stacks (e.g. water-skill: 水攻擊命中時／泡泡炸開時／普攻命中時／水窪傷害計時到時), 共用數值 folds open, 看這個積木的效果 opens the preview iframe with the right caption. Tapped ＋ on 水花基本範圍 22→23, saved, reload into play: game reads the saved values.
- Play: joystick drag moved the hero right; water-attack attack taps wet/splash enemies; water-dash dash left 4 water fields with wet+slow; fusion-puddle fields + extra lightning (8 bolts); water-ultimate wave fired (timer reset to 9.3s); water-drop big shot on the counted shot (size 20.4, dmg 56 vs 12/35); fountain wet+pushed close enemies only; bubble set on dash end, absorbed one hit (0) then next hit 5; water-wet 10→11.5; rain gave all enemies wet 3s + slow. No exceptions.
- Ran the same play script on main (c7bc69d): all values on the test enemies identical; only differences were randomly spawned background enemies and timing jitter.
- Minor, pre-existing (same as thunder card): when the preview pane is open it covers the right-side ＋ buttons of 共用數值; closing the preview makes them tappable. Not blocking.
