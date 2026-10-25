verdict: approve
dfbfc7fe11ba4b163ac52b6e4ee525a886cfc808

## Files checked
- games/survivor/game.js, style.css, index.html, sw.js
- games/survivor/tests/camera-map.cjs, viewport.html, balance/build-variety/dash-skill/enemy-shoot.cjs
- coord/tasks/survivor-camera-map.json, coord/knowledge/DECISIONS.md, docs/survivor-camera-map-validation.md

## Verification run by Grok
- node tests: camera-map, dash-skill, build-variety, enemy-shoot, balance all pass; node --check game.js ok.
- Browser test executed (headless Chrome on Mac Studio, local http server): tests/viewport.html → PASS, 0 failures across 7 phone/tablet sizes (portrait-rotated and landscape, shrunk visualViewport) × 72/88/104px buttons. Skill/dash/back/pause/HUD/build slots/boss HUD all inside visible safe area, no overlaps.

## §6 checklist
- iPad/phone: touch-action/contextmenu unchanged; joystick still Pointer Events + setPointerCapture, single pointerId, now only starts on left half; no hover media query; no roundRect/.at/structuredClone; resize resets imageSmoothingEnabled; JS rotation matches existing portrait CSS (rotate(90deg) translateY(-100%)), visualViewport resize+scroll handled with innerWidth fallback; dt cap unchanged.
- Logic: movement in dt; invincibility order unchanged; resetGame rebuilds map and recenters; pools unchanged; enemies/boss/knockback clamped to map; shots culled by world bounds.
- Conventions: ✏️ settings label updated in kid wording; ?v=20261025j; sw erin-games-v14; no external assets; scope matches card.

## Non-blocking notes for a later card
1. Spawn ring radius is 0.65×min(w,h); on landscape phones (e.g. 844×390) that is ~250px while half the screen width is ~420px, so enemies can pop in on-screen left/right. Consider spawning just outside the camera rectangle.
2. Thunder ultimate bolt uses v.y*.5 / v.y*.6 in world coords, so when the camera has scrolled down the zigzag points sit off-screen above; cosmetic only.
3. Real-device check (iPhone Safari toolbar/notch, iPad) still recommended.
