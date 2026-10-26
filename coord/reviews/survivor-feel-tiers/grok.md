verdict: changes
1cf18ec38818a249174e40dc3da99540460c4837

Files checked: games/survivor/data/defaults.js, data/schema.js, engine/feedback.js, engine/loop.js, engine/body-separation.js, engine/combat.js, engine/boss.js, engine/posture.js, engine/pacing.js, engine/spawn.js, engine/state.js, engine/timing.js, engine/weapons.js, manual-attack.js, render/world.js, maker/maker.js, tests/feel-tiers.cjs and the updated tests, version bumps (index.html, practice.html, preview.html, preview.js, practice-host.js, version.json, sw.js), docs/survivor-feel-tiers-validation.md, coord/tasks/survivor-feel-tiers.json.

§6 checklist: dt-based timers, pooled objects reset (takeFromPool clears hitStop/feedbackFrozen), restart clears trauma and input buffer, blur/visibility clears the buffer, ?v= bumped, no external assets, no emoji (dust is pixel particles), Traditional Chinese labels. No new risky APIs. Scope matches the card.

Findings:
1. (blocking) Trauma is summed per hit target, so a normal (small) swing into a crowd jumps to the cap. feedbackImpact() adds tier trauma once per target; candy-hammer tap into 12 enemies gave 11-13 small impacts and trauma 1.0 (above the large tier 0.65), with trauma > 0.5 for ~21 frames (~0.35 s) after every swing. In a 3 s joystick + attack crowd fight trauma stayed pinned at 1 (max 6-unit shake plus rotation). The three tiers stop being distinguishable in the most common situation (normal attack into a crowd), and constant max shake is uncomfortable for a young player. Please make one attack event (one swing / one projectile hit frame / one posture event) add its tier's trauma once, e.g. take the max of the tiers hit that frame instead of summing per target, and add a pure test: one small swing hitting N targets adds the same trauma as hitting one.
2. (minor, please fix with 1) Impact sound stacks per target: one single-target hammer hit now plays "hit" twice (damage sound plus the new feedbackSound), and one crowd swing played 12 "hit" sounds in one frame. Suggest playing the tier sound once per attack event, not per target.

Tests:
- Box: /workspace/erin-ci/run-review-tests.sh 1cf18ec → RESULT: PASS (99 PASS lines, layout 9/6, 248 s). Mac Studio not needed.

Hands-on (box, headless Chrome, touch emulation, 740×360, 1024×461, 1180×820; real attack/dash button taps and joystick drags):
- Hammer single hit: hero and target freeze ~4 frames (0.05 s small) while a far enemy keeps walking (moved 3.5 units during the freeze); trauma 0.18 then decays to 0; camera offset small.
- Water-ball shot: small tier, projectile is the attacker, hero not frozen.
- Knockback into another enemy (water-ball): exactly one extra small impact on the blocked enemy, squash 0.14, blocker moved 0. No blocker: no extra event.
- Vibration off with trauma 1: camera x/y/rotation all 0.
- Dash pressed during a 0.1 s hero stop: dash starts on the first free frame (dashTimer 0.15 then counts down), once. Dash pressed during a 0.3 s stop: expires, no dash.
- Two quick hammer taps (second during recovery): exactly 2 swings, buffer empty afterwards.
- Charged hammer release: medium (0.09 s). Perfect dodge vs teacher: medium. Posture break: large, trauma 0.62-0.65. Teacher defeat: large, game moves to transition.
- Joystick crowd fight: hero still moves (dx ~550-590 in 3 s), frozen 12% of frames.
- Maker 武器 → 糖果劍 → 回饋積木: 回饋等級 小 → 大 applies particles 20, trauma 0.65, number 1.7, stop 0.15; then 粒子數 ＋ gives 21 while level stays 大; 輸入緩衝秒數 slider 0.12 → 0.14; saved and stored correctly. No covered ＋ buttons, no page exceptions at any size.
