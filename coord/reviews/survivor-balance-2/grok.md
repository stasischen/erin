verdict: approve
57ffc562e109535c6f859f08be2150e96237cefa

# Grok review: survivor-balance-2

Files checked (git diff main...codex/survivor-balance-2): games/survivor/game.js, games/survivor/index.html, games/survivor/tests/balance.cjs, games/survivor/tests/enemy-shoot.cjs, sw.js, coord/knowledge/DECISIONS.md, docs/survivor-balance-2-validation.md, coord/tasks/survivor-balance-2.json, coord/inbox/done/20261025T080523Z-parent-easier.md.

## Findings
- Every value requested in the parent feedback matches: hero 90 HP, 1.0 s invincibility, 甲本 15 / 乙本 12 damage, 5% speed growth per 30 s, enemy cap 26, wave intervals +15% (1.84/1.495/1.15/0.8625/0.6325/0.5175), teacher 2000 HP, 1.0 s fan of 3, summon 1 every 6 s, XP growth +1, auto-heal Lv1 10 s, Lv8 word damage 6.
- All tuning stays in the ✏️ Erin settings block with kid-readable comments; SETTING_DEFAULTS reads from UPGRADE_TUNING so the settings page defaults stay in sync. New defaults sit inside every slider's min/max range.
- SETTINGS_KEY bumped v2→v3 (old saved settings no longer override new defaults); RECORD_KEY unchanged so best record is kept (covered by test).
- index.html ?v= bumped to 20261025d for game.js and style.css; sw.js cache bumped to erin-games-v8. No stale references left outside tests.
- No touch/iPad, dt, invincibility-order, restart, or pooling logic changed; only constants. No new external assets. Scope matches the card.
- Ran locally: node tests/balance.cjs PASS, node tests/enemy-shoot.cjs PASS, node --check game.js and sw.js OK.

## Not verified
- No real browser / iPad playtest; whether it now feels "just a little easier" is for Erin to judge.
