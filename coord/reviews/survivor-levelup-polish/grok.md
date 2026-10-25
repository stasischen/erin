verdict: changes
6023880e72f4f15a4567850d4f556fa07dd69e82

# Grok review: survivor-levelup-polish

Reviewed `git diff main...codex/survivor-levelup-polish` against the §6 Grok checklist and the parent brief (coord/inbox/done/20261025T120807Z-parent-levelup-polish.md).

## Files checked
- games/survivor/index.html (new .upgrade-demo / .upgrade-actions wrapper: confirm + skill-tree link together under the preview; ?v=20261025u)
- games/survivor/style.css (three cards in one row filling the left column; preview + 64px action row on the right; tree opens as an overlay over the right column; removed the <200px "hide preview" rule)
- games/survivor/preview-engine.js (2.5x close camera sized from the iframe, wide framing for ultimate/dash/fusion-storm/boss moves and big radii, fixed camera, three still targets placed at t=0 and pinned to home each step, no initial walk, HP bar only for heal/shield)
- games/survivor/preview.html, preview.js, tests/preview-host.cjs (version bump), sw.js (erin-games-v25)
- games/survivor/tests/levelup-layout.cjs / .html (new 40% preview area, equal card row, 18% blank, iframe fills box), tests/skill-preview.cjs (t=0 / hit / loop positions, fixed camera, 2.5x, wide ultimate)

## Verification (Mac Studio, real Google Chrome via CDP, DPR 3, mobile + touch emulation)
- Chrome runs fine here (no SIGABRT). Unit tests pass: skill-preview (incl. new close-up checks), preview-host, clean-hud.
- `node games/survivor/tests/levelup-layout.cjs` as committed FAILS. First at 412×915 on the old rotated "Maker 未分兩欄" false failure (raised in the previous review, still not fixed). With only that assertion neutralised (temp copy, deleted afterwards), it then fails at 384×832 with "面板空白超過18%".
- Measured with the blank check turned into a log (blank ratio / preview share of panel):
  - 412×915: 0.173 / 0.445 PASS
  - 384×832: 0.187 / 0.425 FAIL blank
  - 915×412: 0.173 / 0.445 PASS
  - 800×360: 0.198 / 0.406 FAIL blank (a size the brief explicitly requires)
  - 732×310: 0.226 / 0.357 FAIL blank (preview <40% exempt by min side <360)
  All other geometry (three cards, 64px confirm hit-testable, tap/double-tap/keyboard, Maker list + editor) passes at every size.

## Findings
1. BLOCKING: the committed layout test fails at required sizes (800×360, plus 384×832 and 732×310) on the card's own 18% blank threshold. The parent's main complaint was empty space, so tighten the short-landscape layout (gaps/padding, title+hint row, card height, action row) until the committed test passes at all 5 sizes; do not just raise the threshold.
2. BLOCKING (test): fix the rotated Maker two-column check (compare in shell coordinates, or accept differing top when innerHeight > innerWidth) so the committed test can actually run through all sizes.
3. Non-blocking: the test's finally cleanup still crashes with ENOTEMPTY while Chrome writes its profile; wait for Chrome exit before rmSync.
4. Non-blocking: preview targets are re-pinned to home every step, so knockback/pull cards no longer show the targets being pushed. Consider letting targets move during the hit and easing back before the loop resets, so knockback stays visible (parent wants every effect clearly visible).
5. Close camera, t=0 placement, fixed camera, HP bar removal and sw v25 look correct.
