verdict: approve
41d8e88d50d6bf3144cb502eacaabcbbed422723

# Grok review: survivor-wave-warning-text

## Files checked
- games/survivor/engine/pacing.js (banner text and bookNoticeTimer removed; one warning sound kept)
- games/survivor/render/world.js (new drawWaveEventWarning, screen-space edge pulse, skipped in preview/boss/boss intro)
- games/survivor/tests/wave-warning-text.cjs
- version bump 20261026ap: index.html, practice.html, practice-host.js, preview.html, preview.js, version.json, sw.js
- docs/survivor-wave-warning-text-validation.md, coord/knowledge/DECISIONS.md, card

## §6 checklist
- No new APIs (fillRect only, no roundRect/at/structuredClone); timing uses the existing dt countdown; reset clears the warning.
- ?v= bumped everywhere and SW cache renamed. No external assets. Scope matches the card (only the four wave-event banners removed; other notices untouched).

## Tests
- Box (my cloud computer): `/workspace/erin-ci/run-review-tests.sh 41d8e88` -> RESULT: PASS, 94 PASS lines, --layout included.

## Hands-on (box, headless Chrome, touch emulation, DPR 2) at 740x360, 1024x461, 1180x820
- Joystick drag right moves the hero (~+216 world units) at all three sizes.
- Triggered each of ring / tide / elite-squad / candy-rain through the real pacing entry while the game loop ran:
  enemyNotice stays hidden and empty, warning sound plays exactly once, 0.9 s countdown runs down,
  pink edge strips pulse (sampled canvas pixels): tide lights only the left edge; ring, elite-squad and candy-rain light all four edges.
  Pulse disappears when the countdown ends and event enemies start spawning afterwards. Screenshot checked: no text banner, edges clearly visible.
- Teacher: intro and fight still show the boss HUD with name 老師; no edge pulse during the fight.
- No page exceptions.

## Findings
- None blocking. Minor: during candy-rain a regular (non-event) spawn can appear inside the 0.9 s warning; that is the normal background spawner, not the event queue.
