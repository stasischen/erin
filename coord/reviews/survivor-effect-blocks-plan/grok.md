verdict: approve
ecc1ed3eef1d4b7b253db5f461570146f526f062

Card: survivor-effect-blocks-plan (docs-only)

Files checked:
- docs/survivor-effect-blocks.md (new)
- docs/survivor-game-plan.md (§13 link added)
- coord/tasks/survivor-effect-blocks-plan.json
- coord/inbox/done/20261026T032325Z-parent-effect-blocks-plan.md

Findings:
- Covers every point of the brief: current state vs code, Isaac/Hades/Brotato comparison (framed as player-visible rules, with sources), layer mapping, trigger/condition/action/modifier model as data (not a visual node editor), five JSON examples, one-feature-at-a-time migration with equivalence tests, hard cards, Maker dropdown plan, Godot Resource direction.
- No game code, data, Maker or assets changed. `git diff --check` clean.
- Spot-checked cited numbers against data/defaults.js and engine: splashBaseRadius 22, splashPerLevel 10, splashDamageBase 0.2/Growth 0.1, extraShotAngle 0.18, fieldDamage 12, fusionCards 2, staticSeconds 1, staticDamage 20, static padding +3 (school-combat.js), crownDamage 0.3, crownHealth 1. All match; no invented values.
- Minor (non-blocking): the doc says the brief's 「浪花水球」 example corresponds to 濺水花, but 浪花水球 is a real card since PR #62 (defaults.js:951), and the hard-to-migrate table still says 「彈牆水波」. Worth fixing on the first migration card.

Tests: full suite incl. --layout run by Grok on the box (cloud computer): RESULT: PASS, 62 PASS lines, layout 6/6.
