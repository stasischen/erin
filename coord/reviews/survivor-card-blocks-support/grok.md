verdict: approve
9cfa1e4d33462030b7752db5762fc1ec8c5883ef

# Grok review: survivor-card-blocks-support (PR #86)

## Files checked
`git diff main...codex/survivor-card-blocks-support`: engine/effect-blocks.js (9 support recipes, ceil/divide/power ops, healthMissing condition, new triggers onHealth/onUpgrade/onHealTick), engine/combat.js, engine/weapons.js, engine/loop.js, engine/neutral.js, ui/levelup.js, maker/maker.js (cardRecipe list + Chinese trigger/condition/action labels), practice-host.js, preview.js, index.html, practice.html, preview.html, version.json, sw.js (20261026ai), tests/effect-blocks-support.cjs + legacy JSON, tests/maker-ui.cjs, docs/survivor-card-blocks-support-validation.md, coord task + brief.

## Findings (§6 checklist)
- Spec 1: all nine support cards (big-water, rapid-water, multi-water, onion-dash, bubble-shield, gem-magnet, piercing-water, splash-water, auto-heal) are recipes with trigger/condition/action and {ref:...} shared values. Formulas match the old code line by line: size/damage multipliers, interval 1-level*reduction with 0.12 floor kept, spread count 1+level and melee extraArc, move multiplier, shield ceil(hp/divisor)*level and one-off pick heal, magnet multiplier (also synced to the neutral magnet ring), pierce count + melee 0.1 size factor, splash strict center-distance radius (no target radius, same as old) and damage*supportSplashDamage, auto-heal interval power(multiplier, level-1) with while-loop and full-HP timer consumption.
- Spec 2: legacy equivalence tests added (612 cases against frozen a299671 formulas).
- Spec 3: Maker 技能卡 shows each card as 積木堆 (not 原本組合) with collapsible blocks, shared values and preview. The recipe dropdown still lists other non-migrated cards as 原本組合, which is expected.
- Spec 4: other schools untouched; level 0 resolves to neutral values (count 1, multipliers 1).
- Old saves: feature/power save format unchanged; Maker save + reload works.
- No Lingo/invest files touched; no main/.git operations by Codex.
- Minor (pre-existing, not counted): the open preview pane covers the right-side ＋ buttons of shared values on most cards at both sizes (same as noted on PR #83); piercing-water has no shared-value slider because its values are fixed constants.

## Tests
Ran on Grok's cloud box (not Mac Studio): `/workspace/erin-ci/run-review-tests.sh 9cfa1e4d...` full suite incl. --layout: RESULT PASS, 86 PASS lines, layout 9 sizes, 0 fails.

## Hands-on (box headless Chrome, touch emulation, 1024×461 and 740×360)
- Maker 技能卡: selected each of the nine cards; each shows a block stack with Chinese trigger (發動普攻時 / 計算移動速度時 / 計算血條上限時 + 選到這張卡時 / 吸取寶石時 / 普攻命中時 / 回血計時到時); folded/unfolded 共用數值; pressed 「看這個積木的效果」 and a live preview iframe appeared with a card-specific caption for all nine. Tapped ＋ on big-water size: 0.20 → 0.21, caption updated to 21%; saved, reloaded, and in play the saved value applied (size ×1.21).
- Play (?maker=1&play=1), side by side with main a299671: joystick moved the hero (onion-dash ≈ ×1.12 distance in both); attack button fired shots with identical radius/damage/pierce: none [12,35,0], big-water [14.4,43.75,0], multi-water 2 shots, piercing-water pierce 1; interval 0.72 → 0.612 with rapid-water; max HP 90 → 108 with bubble-shield; gem-magnet pulled and collected a gem; auto-heal healed 1 HP after 10 s and kept full HP capped; splash hit results identical to main. No exceptions.
