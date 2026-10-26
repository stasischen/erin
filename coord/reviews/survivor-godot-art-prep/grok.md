verdict: approve
a9ada6d97f67c5fd0f5ffa553a63570c61e76089

# Grok review: survivor-godot-art-prep (re-review)

Files checked (cdbf857..a9ada6d, non-coord): games/survivor/tests/art-manifest.cjs, games/survivor/tests/art-baseline.json, docs/godot-mapping.md. No game source or assets changed since the previous review (version stays 20261026aw).

Findings:
- Previous issue fixed: battle traces are now normalized with Number(x.toFixed(6)) before hashing (test-only); Canvas command hashes stay exact. Self-checks confirm the two Node 22/24 tail values hash equal while a 0.000002 difference is still detected. battleNumberDecimals: 6 is asserted.
- Baseline battle hash regenerated; the refactored code matches it on both Node 22 (Mac Studio) and Node 24 (box), so the trace equivalence holds across runtimes.
- docs/godot-mapping.md documents the tolerance rule for later Godot equivalence tests. Good.

Tests:
- Box (Node 24.22.1): art-manifest.cjs PASS (the previous failure is gone); overall run ended with the known box Chrome timeout (box infra), 101 PASS lines.
- Mac Studio (Node 22.22.3): `node games/survivor/tools/test.cjs --layout` rc=0, 102 PASS. Trusted as the full result.

Hands-on: player-facing code is unchanged since cdbf857, so the earlier hands-on checks at 1024×461, 740×360 and 1180×820 (game, Maker previews, PNG swap test) still apply.
