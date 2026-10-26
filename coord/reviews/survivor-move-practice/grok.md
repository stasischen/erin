verdict: approve
4f4f9cb5bbb9910f7a55fdd157a20f0c14cf1cae

# Grok review — survivor-move-practice (round 2)

Files checked: games/survivor/practice.css, games/survivor/tests/levelup-layout.cjs, docs/survivor-move-practice-validation.md, version bumps (index.html, practice.html, practice-host.js, preview.html, preview.js, version.json, sw.js), coord/tasks/survivor-move-practice.json; earlier round reviewed 0bbcc37 (whole feature, §6 checklist).

Findings:
- Round-1 blocker fixed: the global `canvas` rule is now scoped to `#practiceStage > canvas`; button sprite canvases get `position:static; 26×26; pointer-events:none`, so they stay inside the round buttons and taps go to the button. Source sprites unchanged (32×32).
- New real-iframe regression in levelup-layout.cjs at all six sizes: every move button's children stay inside the button, centre hit test belongs to the button, selection updates, description and legend have content, fit in the iframe and pass 3-point elementFromPoint occlusion checks, and the dock closes. This directly covers the bug I reported.
- Version 20261026t synced across cache-busting query strings and sw.js. No gameplay data, pure functions, or events changed (§11 notes in validation doc are accurate).
- Optional slider debounce not added; fine, live update was the requested behaviour.

Tests: full suite incl. --layout run by Grok on the box (cloud computer) via /workspace/erin-ci/run-review-tests.sh at 4f4f9cb: RESULT PASS, 70 PASS lines, layout 6/6 (includes the new practice-room check).
