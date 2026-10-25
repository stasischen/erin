verdict: approve
b66cac8ccbee9472208c3b35800c6a88486364ba

# Grok review: survivor-preview-spacing

## Files checked
- games/survivor/preview-engine.js (1.35x composition, targetDistances 125/165/200, minDistance 120, spacePreviewTargets, damageDisabled, thunder-counter one-hit demo)
- games/survivor/engine/loop.js, combat.js, boss.js (damageDisabled guards on contact, enemy shots, Maker hazards, boss moves, dash invincibility)
- games/survivor/preview.js, preview.html, index.html, version.json, sw.js (version 20261025y everywhere)
- games/survivor/tests/skill-preview.cjs, preview-stages.cjs

## Findings
- Root cause of the "always hurt" look addressed: preview used to force `invincible = 999`, which kept the player in the blinking/hurt state. Now a separate `damageDisabled` flag blocks all four damage paths without touching invincible/hitFlash, and dash no longer sets invincibility in preview.
- `damageDisabled` is only set in preview reset; test confirms `resetGame()` clears it, so real games are unaffected.
- Counter card (thunder-counter) shows exactly one hurt per loop then recovers (health floored at 1, preview-only).
- Scale 1.35 (within 1.3–1.4), dummies keep >=120px (3 player widths) every step; knockback/pull still visible and returns smoothly.
- Boss-move previews keep their own framing (no originX offset, spacing skipped).
- Checklist: dt-based, invincibility decrement order unchanged, pools bounded, `?v=` bumped via single version source, no external assets, scope matches the card.

## Tests (Mac Studio)
- `node tools/version.cjs` PASS
- `node tools/test.cjs --layout` exit 0, all suites PASS, including real-Chrome level-up layout at 5 sizes (preview 26.5–31.1%, blank 9.7–12.6%). The Chrome SIGABRT Codex hit did not reproduce.

## For Erin to try
- Is the smaller 小水球 and the gap to the dummies comfortable to watch?
