verdict: approve
e5773ee6060d29a3fc51ccbd530e632fb8b0f20a

# Grok review: survivor-card-blocks-neutral (PR #87)

## Files checked
`git diff main...codex/survivor-card-blocks-neutral`: engine/effect-blocks.js (10 neutral recipes item-wall/candy/bird/bank/split/magnet/crown/clover/rear/cookie, new min/floor ops, gems input, chance/countMultiple/splitEligible/firstClover/volleyPresent/waveEligible conditions, new triggers), engine/neutral.js, engine/loop.js, ui/levelup.js, maker/maker.js (item-* card stacks, NEUTRAL_BOUNDS + shared NEUTRAL_NAMES), practice-host.js, preview.js, index.html, practice.html, preview.html, version.json, sw.js (20261026aj), tests/effect-blocks-neutral.cjs + frozen legacy JSON (4e4e055), tests/maker-ui.cjs, docs/survivor-card-blocks-neutral-validation.md, coord task + brief.

## Findings (§6 checklist)
- All ten neutral cards are block stacks reading `{ref:'neutralRules.…'}`; formulas match the old code line by line: wave push/collision damage/shared cooldown and boss/alive/attackable/non-zero-length gate; candy strict `draw < bombChance`, limit 12, delay, `<=` radius incl. target radius, remove-then-damage order kept; bird 2.5 rad/s orbit, `<=` reach+r, nearest target, timer only reset on hit; bank +1 per pickup, min(cap, floor(gems/every)*step); split once, two symmetric fragments, fragments/maker shots excluded; magnet multiplier also used for the drawn ring; crown reuses existing modifier; clover first-acquire reroll + rare weight; rear copies first non-maker shot at +π; cookie counts then heals every N.
- Old feature/power save format unchanged; Maker save and reload works.
- No Lingo/invest files touched; no main/.git operations by Codex.
- Minor (pre-existing, not counted): the open preview pane covers the right-side ＋ buttons of shared values (same as PR #83/#86); all ten preview captions are the generic 「使用原本的卡片組合。」 (same kind of note as PR #85); item-rear has no shared-value slider (no tunable values, as the handoff says).

## Tests
Ran on Grok's cloud box (not Mac Studio): `/workspace/erin-ci/run-review-tests.sh e5773ee6…` full suite incl. --layout: RESULT PASS, 88 PASS lines, layout 9 sizes, 0 fails.

## Hands-on (box headless Chrome, touch emulation, 1024×461 and 740×360)
- Maker 技能卡: selected each of the ten item cards; each shows a block stack (not 原本組合) with Chinese triggers (浪花命中時 / 擊倒怪物時 + 糖果炸彈倒數到時 / 小鳥準備啄擊時 / 吸取寶石時 + 計算傷害時 / 普攻命中時 / 計算傷害時 + 計算血條上限時 / 取得卡片時 + 抽升級卡時 / 發動普攻時); folded/unfolded stacks and 共用數值; pressed 「看這個積木的效果」 and a live preview iframe appeared for all ten. Tapped ＋ on 浪花額外擊退距離: 55 → 56; saved, reloaded, and in play GAME_DATA.neutralRules.wavePush was 56.
- Play (?maker=1&play=1, water ball), side by side with main 4e4e055 — every result identical: joystick moved hero 212 px; attack button fired 1 shot (35 dmg), item-rear added a 35-dmg shot at π; item-split on a kill made two ±0.5 rad 17.5-dmg fragments that hit the two side enemies; crown max HP 90 → 89 and hit 35 → 45.5; bank after 40 pickups hit 36.4; bird pecked nearest enemy for 40 in 2.5 s; candy bomb (draw 0) dropped with 0.6 s timer, exploded and damaged only the near enemy (45); cookie healed 1 after 20 kills; wave push moved target the same; clover acquire gave +1 reroll first time only (2 → 3 → 3); magnet gem pickup same. No exceptions.
