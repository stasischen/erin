verdict: approve
015895c7219355be56e56263b8229bced46b3ae6

# Grok review: survivor-teacher-posture (PR #93, version 20261026aq)

## Files checked
git diff main...codex/survivor-teacher-posture (29 files): engine/posture.js (new), engine/boss.js, engine/combat.js, engine/effect-blocks.js, engine/loop.js, engine/weapons.js, engine/school-combat.js, engine/audio.js, manual-attack.js, data/defaults.js, data/schema.js, maker/maker.js, render/hud.js, render/world.js, index.html, style.css, icons.js, tests/teacher-posture.cjs, tests/maker-ui.cjs, docs/survivor-teacher-posture-validation.md, card + brief, version.json, sw.js.

## §6 checklist
- Scope matches brief items 1-7; no unrelated refactors. Card state peer_review, waitingFor null.
- Data-driven: boss.posture defaults + POSTURE_BOUNDS whitelist in schema; legacy saves get defaults; Maker exposes all 10 values.
- Shared blocks: posture recipe uses existing trigger/conditions/actions (onPerfectDodge/onRecoveryHit/onInterrupt/onPostureBreak, posture/stun/heal); SurvivorPosture is pure (no DOM/clock/random), serialisable posture-broken event. Godot-friendly.
- All stuns go through stunTarget; interrupts clear warnings so nothing lands after the stun. Charged attacks forced forward (spin→sector, rear-shot excluded for charged in both modes) per brief item 4.
- HUD: round segmented ring with pixel icon only, no emoji (checked textContent).
- Version bumped (20261026aq), sw.js updated.
- Note (not blocking): the "recovery" window counts the whole rest between moves, so most hits while the teacher is idle add posture. Feels fine in testing (+12 per hit, decay 6/s); tune in Maker if Erin finds it too easy.

## Tests
Box (Grok cloud computer): /workspace/erin-ci/run-review-tests.sh 015895c → full suite with --layout, 96 PASS lines, RESULT: PASS (015895c7219355be56e56263b8229bced46b3ae6).

## Hands-on (box, headless Chrome, touch emulation, 1024×461, 740×360, 1180×820)
- Teacher HUD: posture ring (34px) sits left of the 老師 health bar, no overlap with health bar or the four right-side round buttons at all three sizes; icon switches posture → weakpoint.
- Early dash (real tap on 衝刺 while a sniper/move warning was still 0.7-0.8s away): no flash, no ding, posture stayed 0.
- Perfect dodge (dash fired through the button's real pointerdown handler at the moment a teacher threat entered the 0.2s window): 740×360 got shot 0→30, leap 17→47, call 25→55, each with hero gold flash and a "perfect" sound; 1180×820 rain 0→30. Same object flagged dodged is not offered again.
- Decay: 60 → 48 in 2s (6/s).
- Recovery hits (real taps on attack button, teacher adjacent): +12 (minus decay) during rest/recovery, no gain while a move was mid-warning.
- Break at full: player HP 84→88 (+4, once), stun 2.5s, posture sound, gauge shows weakpoint + title「弱點！聚氣加快，蓄力重擊」, teacher stops moves (bossMoves 0).
- Charge during stun (real touch hold + drag aim on attack button, 1.0s): hold 1.92s vs 1.28s normal (×1.5); charged water ball dmg 263 vs 88 normal (×3); normal tap 35 in both (no multiplier). Aiming away from a teacher behind the hero: 0 dmg (forward only).
- Pause during stun: stun 2.00 → 2.00 after 1.2s paused. After stun ends bonuses return to ×1/×1.
- Maker 老師 → 魔王與三個階段: 架勢與完美閃避 panel present; ＋ on 時間窗 0.2→0.21, 暈眩秒數 2.5→2.6, 蓄力倍率 3→3.1, saved, ?play=1 game data shows the new values.
- No page exceptions. Audio not audibly checked (headless, muted); sound calls verified by name. Screenshots kept on the box only.
- Erin still needs to try the feel.
