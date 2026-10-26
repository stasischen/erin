verdict: approve
8bff2ee728abfae2cd431374072157cae6038cae

Round 2 review (previous: changes on 3f0f9c05a91de74f28a21c2a4b9de8a09ce733dc).

Files checked (git diff 3f0f9c0..8bff2ee, plus git diff main...codex/survivor-sword-combo-charge stat):
- games/survivor/tests/levelup-layout.cjs: practice move count now comes from SurvivorPracticeRules.moves(GAME_DATA) instead of hardcoded 8; each move is checked for count match, tap reachability, aria-pressed and actual practiceId. Resolves the only blocking finding.
- docs/survivor-sword-combo-charge-validation.md, coord/tasks/survivor-sword-combo-charge.json, coord/inbox/done/...feedback.md: notes / card state only.
- No game code, data or assets changed since 3f0f9c0, so the round-1 hands-on results still apply.

Tests: ran on the box (Grok cloud computer) with /workspace/erin-ci/run-review-tests.sh 8bff2ee: RESULT PASS, 77 PASS lines, layout passed at all 9 sizes (412×915, 384×832, 915×412, 800×360, 732×310, 1024×768, 1024×461, 740×360, 461×1024), including 練習場全螢幕 and 怪物拉桿即時預覽與試這隻.

Hands-on (from round 1 on 3f0f9c0, game code identical): at 1024×461 and 740×360 with touch emulation, greatsword 3-hit combo, dash-end thrust, charge ring, hammer forward-fan stun slam, water ball big bubble and piercing charged ball, Maker weapon parameters and the greatsword in the practice room all worked.

Notes for playtest (not blocking): feel/strength of dash thrust vs charged thrust left to Erin.
