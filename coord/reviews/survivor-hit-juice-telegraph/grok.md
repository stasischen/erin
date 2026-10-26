verdict: approve
b4512786b318fc39ce274e821dbf62f2a7452759

# Grok review: survivor-hit-juice-telegraph (version 20261026x)

## Files checked
git diff main...codex/survivor-hit-juice-telegraph: engine/weapons.js (heavy flag, meleeImpact after real HP loss), engine/loop.js (hitStop freezes sim on real dt, shake on separate juiceClock, reset clears), engine/combat.js (meleeFlash cleared by non-melee hits), data/defaults.js + schema.js (hitJuice enabled/intensity 0-2, validated), render/weapons.js (crescent trail / thrust streak, hitbox only when practice + toggle), render/world.js (tinted white silhouette cache, windup red/squash/jitter + "!", recovery grey + star, ground fill by windup progress, old 準備！/反擊機會 text removed), maker/maker.js (打擊手感 panel), practice-engine.js / practice.html (chase in ready/cooldown, round starts only when in range, 顯示判定框 toggle default off), tests/hit-juice-telegraph.cjs, validation doc, backlog doc.

## §6 checklist
- Damage/collision rules unchanged; effects read events only and never feed hit detection. OK.
- Data-driven, migration for old saves (hitJuice defaults) and invalid data rejected. OK.
- Version bumped consistently (20261026x in html, practice-host, sw.js). OK.
- No new external assets; particle cap reused. OK.
- Backlog items (dash thrust vs charged thrust, 740×360 practice tab) recorded only in docs. OK.

## Tests
Machine: Grok box (cloud computer), `/workspace/erin-ci/run-review-tests.sh b4512786…` → RESULT: PASS, 80 PASS lines, all layout sizes passed (incl. --layout).

## Hands-on (box, headless Chrome 156, touch emulation, 1024×461 and 740×360)
- Main game, candy greatsword: joystick drag moved hero (+112 px). With enemies close, meleeImpact fired on every real hit: normal hits hitStop 0.05 s, shake 2 px, squash 0.14, impactFlash; 3rd combo / charged heavy=true gives 0.075 s and 3 px. Intensity 2 doubles (0.10 / 0.15 s, 4–6 px, squash 0.28); intensity 0 leaves hitStop and shake at 0. Screenshot shows crescent trail and sparks, no hitbox fan in normal play.
- Maker 怪物 tab: tapped 打擊回饋 toggle (開→關→開), dragged 打擊強度 slider by touch 1→1.9 / 2.
- Practice room (Maker 練習場 tab): move list has 9 moves. 布丁: walked hero ~280 px away, pudding chased from 1556 to 1422 in cooldown and started the next round when in range (dodge counter went 0→1). 棉花糖仙子: windup → active → recovery → cooldown then chased. Pause menu 顯示判定框 checkbox tapped → checked and state.practiceHitboxes true. No exceptions at either size.

## Notes (non-blocking)
- Practice room now sets gameSettings.vibration=true so hit shake shows there; player damage is disabled in practice so no phone buzz is triggered.
- Whether the effect strength and telegraph timing feel right is for Erin's playtest.
