verdict: approve
002e94547ce322bcc8acc95faafa37dffe185285

Round 2 review of survivor-enemy-attack-blocks (unified-plan card 5).

Files checked:
- git diff 1d16dd6..002e945: only games/survivor/tests/levelup-layout.cjs line 149 (.maker-move -> .maker-content), plus coord card/inbox and docs/survivor-enemy-attack-blocks-validation.md.
- Game code under games/survivor (excluding tests) is identical to 1d16dd6, which was already hands-on checked.

Findings:
- The single requested fix is applied exactly; no other code changed.
- §6 checklist: no new risk; scope limited to the test selector.

Tests: run on Grok's box (cloud computer) with /workspace/erin-ci/run-review-tests.sh 002e945 — RESULT: PASS (78 PASS lines, full --layout included, 83s).

Hands-on: carried over from round 1 on 1d16dd6 (identical game code) at 1024x461 and 740x360 with touch emulation: monster and teacher move blocks collapse/expand, sliders update the live preview, 試這隻 starts the practice fight; all OK.
