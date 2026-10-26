verdict: approve
c37f43002f6e8dcd86fcad95784197fca90018b8

# Grok review: survivor-view-fullscreen (version 20261026ao)

## Files checked
- games/survivor/engine/loop.js (worldViewport: continuous zoom = sqrt(w*h/320000), offsets 0)
- games/survivor/render/world.js (removed letterbox fill and inner clip)
- games/survivor/tests/view-teacher.cjs, games/survivor/tests/boss-range.cjs
- version bumps: index.html, practice.html, practice-host.js, preview.html, preview.js, version.json, sw.js
- docs/survivor-view-fullscreen-validation.md, coord/tasks/survivor-view-fullscreen.json, brief

## Spec vs result
1. No letterbox: viewLeft/viewTop = 0, world*zoom == screen exactly; old background fill/clip removed. OK
2. Equal area 320000 at every size (0% difference, within ±25-30%). OK
3. Non-integer zoom with imageSmoothingEnabled=false; no shrink-to-round. OK
4. 740×360 phone sees ~811×395 (larger than pre-#89 740×360); tablets zoom in (1180×820 zoom 1.739 → 679×472). OK
5. HUD stays in CSS px; aim inverse-scaled; zone/spawn in world units. OK
6. Pure tests cover 740×360, 844×390, 1024×768, 1180×820 incl. no margins, phone minimum, corner aim. OK
7. Version bumped to ao everywhere incl. sw.js cache. OK

## Tests
Machine: Grok box (cloud computer), /workspace/erin-ci/run-review-tests.sh c37f430…
Full suite incl. --layout: RESULT: PASS (93 PASS lines, layout 9/6, 236s).

## Hands-on (box, headless Chrome, touch emulation, DPR 2) at 740×360, 1024×461, 1180×820
- Canvas CSS rect equals the window at every size; sampled all 4 edges/corners and full edge rows/columns of the canvas: 0% letterbox colour (#142331), both in normal play and during the teacher fight. Screenshots confirm the map fills the screen.
- World seen: 740×360 → 811×395, 1024×461 → 843×380, 1180×820 → 679×472; smoothing off.
- Joystick drag moves the hero (e.g. 1024×461: x 1265→1500).
- Manual aim drag on the attack button up/down/left/right/up-right/down-left gives -1.57/1.57/3.14/0/-0.79/2.36 at all three sizes; release fires the attack with that angle. canvasPoint maps screen corners exactly to world corners.
- Teacher: kited continuously for 12 s; it fell to ~800–900 away (off-screen, arrow guide shown), then pursuit/leap brought it back to ~300, and when standing it reached the player at all sizes. Moves used: leap, sniper, ring/call. Safe zone radius 600 world units.
- Practice room (Maker 武器 → 試玩): frame/canvas fill the screen with zero margins and the same world view; aim up/left/down-right correct (-1.57/3.14/0.79), joystick moves the hero.
- No page exceptions.

## Findings
None blocking. Minor (not required): non-integer zoom may give slightly uneven pixel widths on sprites; looked fine in screenshots, Erin can judge on the real device.
