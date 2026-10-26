verdict: approve
99013df4699018d05d200adfe0f0f3beac71af5a

# Grok review: survivor-maker-shell (round 2)

## Files checked
- `git diff a259afc 99013df`: only `games/survivor/tests/levelup-layout.cjs`, `docs/survivor-maker-shell-validation.md`, the card JSON, and the earlier Grok review/feedback records changed.
- `games/survivor/tests/levelup-layout.cjs` lines 92–100 and 121: the three screen-rect comparisons (tabs above editor, item list left of content, settings controls above bottom button bar) now compare `offsetTop/offsetHeight` and `offsetLeft/offsetWidth` within a shared `offsetParent`, so they hold in rotated portrait. Screen visibility and `elementFromPoint` occlusion checks are kept. This is exactly the requested fix.
- Game code, assets and version (`20261026ab`) are identical to a259afc, which was already hands-on checked.

## Tests
- Box (Grok's cloud computer): `/workspace/erin-ci/run-review-tests.sh 99013df4699018d05d200adfe0f0f3beac71af5a` → `RESULT: PASS`, full suite including `--layout` on all 9 sizes, 0 failures.
- Codex's local `--layout` Chrome SIGABRT is not counted against the card.

## Hands-on
- No game/UI code changed since a259afc. Round-1 hands-on at 1024×461 and 740×360 (6 tabs, item list + single-item editor, collapsible preview, per-item 試玩, 預設設定 stays open, settings bottom bar) all worked and still applies.

## §6 checklist
- Scope limited to the requested test fix; no gameplay, data or asset changes; no Lingo/invest files touched; no pending decisions for Erin.
