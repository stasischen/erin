verdict: approve
fe339a606782bc39b113e127e687f6068324874e

## Files checked
- games/survivor/game.js (data-short flag from visualViewport height < 440, per-card double-tap within 350ms, native dblclick, confirm button aria-label/title)
- games/survivor/index.html (upgrade-workspace wrapper, round icon-only confirm button, ?v=20261025s everywhere)
- games/survivor/style.css (upgrade panel grid sized to visible height, preview beside cards, short-screen fallback hides preview and skill tree, pan-x/pan-y on panel ancestors, canvas keeps touch-action none)
- sw.js (cache erin-games-v23)
- tests: levelup-layout.cjs/.html (new real-Chrome layout test), skill-preview.cjs (double-tap cases)

## Tests run on this SHA (Mac Studio, Google Chrome headless works here)
- node tests: skill-preview, preview-host, clean-hud, maker-ui, maker-traces, pixel-icons all pass; node --check game.js ok.
- levelup-layout.cjs: 499 checks PASS, 1 FAIL. All 7 viewports (incl. 640x300, toolbar offset, safe areas, rotated portrait, iPad) keep the 3 cards, card text, and the round confirm button fully inside the visible area and tappable; single tap previews, confirm applies, double tap applies once, keys work, settings and all Maker tabs scroll to the end, shrinking the viewport mid-pick still leaves confirm reachable.
- The one FAIL is "完整展示圖 可以點到" at 1024x768: elementFromPoint returns #upgradePreview because the preview iframe has `pointer-events: none` by design (style.css line 211, since PR #24). The iframe is fully inside the visible area (the bounds check passes). This is a test assertion bug, not a layout bug.

## Findings
- Fix matches the request: cards side by side, preview beside them or hidden on short screens, big always-visible round ✓ button, double-tap fallback, scrolling only as last resort with touch panning enabled.
- Minor follow-up (non-blocking): drop the clickability assertion for the non-interactive preview iframe in levelup-layout.html so the test can go fully green.
- Still needs a real phone/iPad landscape check by the parent/Erin.
