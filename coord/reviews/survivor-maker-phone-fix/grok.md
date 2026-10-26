verdict: approve
687075fdc37574ac2567a83273da29c8f7f1327b

# Grok review: survivor-maker-phone-fix

Tests: full suite including `--layout` run on Grok's box (cloud computer) via `/workspace/erin-ci/run-review-tests.sh 687075f…` — RESULT: PASS, 73 PASS lines, all 9 layout sizes PASS (412×915, 384×832, 915×412, 800×360, 732×310, 1024×768, 1024×461, 740×360, 461×1024). Real Android device scrolling/keyboard not tested (no device); left for parent/Erin playtest.

## Files checked
- games/survivor/index.html — 練習場 now a labeled tab (icon + text) in the tab nav; toolbar play-icon button removed; all ?v= bumped to 20261026u.
- games/survivor/maker/maker.js — practice as a tab (`drawPractice`), previousTab restore on X, render() closes practice/preview before redraw, scrollTop reset on tab switch.
- games/survivor/maker/style.css — two-column grid (116px tabs | minmax(0,1fr) content), tabs and editor scroll independently with pan-y, name inputs capped at 28ch, old 38%/62% squeeze dock CSS removed.
- games/survivor/practice-host.js — open(data, container, onClose) mounts into editor with header + X.
- games/survivor/practice.css / practice.html — main scrolls vertically, stage keeps ≥120px.
- preview.html, preview.js, version.json, sw.js — version sync.
- tests/levelup-layout.cjs / .html — 3 new sizes, per-tab end-reachable + last-control hit test, name-input width, practice tab selected state, scroll-to-end, X returns to previous tab.
- docs/survivor-move-practice-validation.md — handoff section.

## §6 checklist
- Touch: game area unchanged; Maker editor/tabs use pan-y; no media query hiding touch UI. OK
- Old iPad APIs: no roundRect/at/structuredClone added. OK
- Rotation/resize: covered by 461×1024 and landscape cases. OK
- Version ?v= bumped everywhere incl. sw cache. OK
- No external assets; Traditional Chinese, short labels. OK
- Scope: matches the parent's phone-scroll + 練習場 tab brief. OK

## Notes (non-blocking)
- `.maker-editor:has(.practice-dock)` needs Safari 15.4+. On older iPads the editor just keeps its padding/overflow:auto around the dock; the dock is still height:100% so it remains usable. Fine for now.
- Android real-device scroll/keyboard check still recommended during playtest.
