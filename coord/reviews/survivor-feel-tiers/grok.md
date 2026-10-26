verdict: approve
cd7449d7e4ad35c98d9ab662ebb89685df338008

# Grok re-review: survivor-feel-tiers (version 20261026au)

## Files checked
- games/survivor/engine/feedback.js (mergeImpact pure function, withImpactBatch/queueImpact/damageHitSound glue, feedbackImpact, bossFeedbackShake)
- games/survivor/engine/loop.js (tick wrapped in one impact batch), engine/weapons.js (swing batch, swing sound queued at lowest priority), manual-attack.js (special batch), engine/combat.js (hit/water sounds queued)
- games/survivor/tests/feel-tiers.cjs (1/12/100 merge, mixed tiers, real hammer 1/12, leap, 12-target projectile, nested batch, none mute, next swing)
- docs/survivor-feel-tiers-validation.md, version bumps (index/practice/preview/sw.js/version.json)

## Findings
- Previous changes request fixed: trauma within one tick/swing is max-merged, not summed per target; hit sound plays once per batch with the strongest tier winning. Batch is closed in `finally`, nothing leaks into the next frame. Per-target damage, hitstop, flash, squash and particles unchanged.
- §11 Godot checklist: merge logic is a pure data function (`SurvivorFeedback.mergeImpact`); audio/camera stay in the glue layer. OK.
- Minor, not blocking: a crowd swing can still give a second `hit` sound ~4 frames later (knockback bump on a neighbour in a later tick); peak trauma stays 0.21–0.24, far below the large tier 0.65.

## Tests
- Box `/workspace/erin-ci/run-review-tests.sh`: 98 PASS then `FAIL: Chrome 測試逾時` + ECONNRESET (box Chrome infra, ran concurrently with hands-on Chrome), not a code failure.
- Fallback: Mac Studio `node games/survivor/tools/test.cjs --layout` at this SHA: exit 0, 99 PASS. Trusted.

## Hands-on (box headless Chrome, touch emulation, 1024×461, 740×360, 1180×820)
- Tapped the attack button into 1 and 12 enemies with hammer, sword and water ball: one swing into 12 now gives 1 hit sound (plus at most one later bump), was 6–8 stacked; peak trauma 0.18 single / 0.21–0.24 crowd (was pinned at 1.0).
- Repeated earlier checks: local hitstop, dash buffering in hitstop and expiry, blocked-slide bump with blocker not moving, vibration off gives zero camera offset, charged = medium, posture break = large, teacher death OK, Maker feedback block tier select/slider/particle +/save/reload all OK, no exceptions.
