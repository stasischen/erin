verdict: approve
73158061164f2f3ff3fb204cb813b967e2ced032

# Grok review: survivor-levelup-layout-fix-2

Reviewed `git diff main...codex/survivor-levelup-layout-fix-2` against the §6 Grok checklist and the parent brief (coord/inbox/done/20261025T115156Z-parent-levelup-layout-fix-2.md).

## Files checked
- games/survivor/game.js (data-short removed; confirm disabled until a card is previewed; description span class)
- games/survivor/style.css (container-query layout, 3:2 two columns, cards align start, 16:9 preview sized from container height, 64px confirm bottom-right, preview hidden only below 200px panel content height)
- games/survivor/icons.js (new pixel `confirm` icon), games/survivor/index.html (pixel icon + 選這張 label, ?v=20261025t)
- games/survivor/maker/maker.js, maker/style.css (cards tab two columns: scrollable tree left, editor right; list scroll kept; fixed toolbar/tabs/footer rows)
- games/survivor/preview.html, preview.js, tests/preview-host.cjs (version bump), sw.js (erin-games-v24)
- games/survivor/tests/levelup-layout.cjs / .html (no longer accept "hidden preview" as pass)

## Verification (Mac Studio, real Google Chrome via CDP, DPR 3, mobile + touch emulation)
- Unit tests pass: skill-preview, preview-host, maker-ui, maker-traces, clean-hud, pixel-icons.
- `node games/survivor/tests/levelup-layout.cjs` as committed: level-up geometry passes at 412×915, then fails at the Maker check "Maker 未分兩欄". This is a test bug: in the rotated (portrait-held) path the shell is rotated 90°, so side-by-side columns share the same screen `left` and differ in `top`.
- With only that assertion made rotation-aware (copy in /tmp, repo untouched), all 5 sizes PASS: 412×915, 384×832, 915×412, 800×360, 732×310 (preview visible and fully on screen, three cards, 64px confirm hit-testable, tap/confirm/double-tap/keyboard, Maker list + editor).
- Measured: 412×915 rotated preview 315×177 (16:9), confirm 132×64; 732×310 preview 133×75. Maker columns are truly side by side in shell coordinates at every size.

## Findings (non-blocking)
1. levelup-layout.cjs Maker two-column check gives a false failure on rotated sizes; compare in shell coordinates (or accept a differing top when innerHeight > innerWidth).
2. The test's `finally` cleanup can crash with ENOTEMPTY when Chrome is still writing its profile; kill and wait for exit before rmSync.
3. On short panels (<400px) card descriptions are hidden and rely on the preview caption; acceptable per brief ("精簡卡片"), worth Erin's real-device check.

Real-device check by the parent/Erin still needed (portrait-locked phone held landscape).
