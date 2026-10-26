verdict: changes
3f0f9c05a91de74f28a21c2a4b9de8a09ce733dc

Review of survivor-sword-combo-charge (PR #74, version 20261026w).

Files checked (git diff main...3f0f9c0): engine/effect-blocks.js (attackTick/attack pure rules), engine/weapons.js (swing shapes, line intersect, aim, cardNote, dash thrust, stun, step), engine/combat.js (water combo/charge, big-bubble splash, combo trigger), engine/loop.js (attack tick, dash-end thrust, recovery, bigBubble at range end, reset), engine/neutral.js, render/weapons.js (charge ring, combo counter, thrust/sword drawing), ui/levelup.js (weapon picker, item-split hidden for melee), data/defaults.js + schema.js (per-weapon fields, bounds, migration), maker/maker.js, practice-rules.js, practice-engine.js, practice-host.js, practice.html, index.html, preview.*, icons.js, version.json, sw.js, tests/*.

§6 checklist: dt-based timers (charge/combo/recovery use dt, pause freezes, reset clears weaponAttack/recovery); pools reused (projectiles via takeFromPool, bigBubble cleared on fragments); no new external assets, new 8×8 sword icon in icons.js; ?v= bumped to 20261026w everywhere incl. sw.js; no new browser APIs of concern; Traditional Chinese, kid-friendly text; scope matches the brief plus the 064215Z charge revision (charged attacks are forward only: sword line, hammer 120° sector capped at 180°, water piercing ball; no 360° charged shape accepted by schema).

Blocking finding:
- `node games/survivor/tools/test.cjs --layout` FAILS: tests/levelup-layout.cjs line 171 still asserts exactly 8 practice moves (`buttons.length!==8` → 「缺少八招」) and loops `index<8`, but the practice list now has 9 entries (水球, 糖果大劍, 棒棒糖錘, 浪花水球, 布丁, 蘑菇, 棉花糖仙子, 甜甜圈, 跳跳糖). Layout 0/9.
  Locally (scratch only, not committed) changing both to 9 makes all 9 layout sizes PASS on the box, so only the test needs updating (ideally derive the expected count from the practice move list rather than hardcoding).

Tests: box (Grok's cloud computer), /workspace/erin-ci/run-review-tests.sh at 3f0f9c0: RESULT: FAIL (68 PASS lines, layout 0/9, failure above). Non-layout suite `node games/survivor/tools/test.cjs` on the box: exit 0, 68 PASS.

Hands-on (box, headless Chrome, touch emulation, 1024×461 and 740×360, real CDP taps/drags):
- Weapon picker shows 3 round icons (水球, 棒棒糖錘, 糖果大劍); tapping the sword shows its full description; confirm starts the run with candy-sword.
- Standing still ~1.3 s fills charge (charge 1.0) and the charge ring is visible around 小水球; joystick drag moved the hero (+112 px) and charge dropped to 0.35 (moveRetention) once at move start.
- Sword: recorded swings 1 sector 100° → 2 sector (reverse) → 3 line thrust; charged swing is a forward line (length 136, ×2.5); combo counter "n / 3" drawn over the hero. Tapping the dash button produced exactly one dash-end line thrust (~0.35 s after tap); dash cooldown started.
- Hammer: normal 120° sector; charged = forward 120° sector, radius ×1.7, ×2.5, stun 0.8 s (no circle).
- Water ball: every 3rd shot is a big bubble (r 18 vs 12, bigBubble); charged shot r 20.4 with pierce 99.
- Maker 共用數值 shows separate 水球 / 棒棒糖錘 / 糖果大劍 「連段與聚氣」 panels; changing the sword 站定聚氣秒數 to 2.5 was picked up by the practice room (activeWeapon().chargeSeconds 2.5, description 「站定 2.5s 聚氣」).
- Practice room: move menu lists 9 moves incl. 糖果大劍; picked it, top stats show 連段 x/3 and 聚氣 % changing while standing / moving; dummies get hit; dash works. No page exceptions.
- Minor, not blocking (pre-existing from the tab bar): at 740×360 after opening the 共用數值 tab, the 練習場 tab sat at the bottom edge and a tap there did nothing until the tab bar was scrolled; worth a look later.

Notes for playtest (not blocking): dash thrust (boosted, length 180, ~157 dmg) is longer and stronger than the charged thrust (136, ~88), so the charged thrust may not feel like the "big" move; let Erin judge.
