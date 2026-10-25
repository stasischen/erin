verdict: approve
a8f3daeb18864aa3bcebf42780b1b6ab4594a693

# Grok review: survivor-elite-chocobear

Reviewed `git diff main...codex/survivor-elite-chocobear` (24 files) against §6.

## Files checked
- engine/encounters.js (new), engine/spawn.js, engine/combat.js, engine/loop.js
- ui/levelup.js, render/hud.js, render/world.js
- data/defaults.js, data/schema.js, maker/maker.js, maker/style.css
- index.html, version.json, sw.js, manifest.js, preview.*
- tests/elite-chocobear.cjs, tests/maker-ui.cjs, tests/balance.cjs
- docs/survivor-elite-chocobear-validation.md, coord/tasks card, inbox request

## Tests
- Re-ran `node games/survivor/tools/test.cjs --layout` on Mac Studio: EXIT=0, all suites PASS
  including levelup-layout.cjs at all six sizes (the Chrome SIGABRT Codex hit did not reproduce).

## §6 checklist
- iPad/phone: no new touch handling; no roundRect/structuredClone/.at(); level-up heading uses existing overlay. OK
- Logic: all new timers use dt/countdown; slam hazard damage checked after warning, respects dash + invincibility; restart and stage change go through resetGame -> resetEncounters. OK
- Pools/limits: elites limit 3, syrup cap 48, split queue cap 18, hazards cap 8, ENEMY_LIMIT respected. OK
- Conventions: data in data/defaults.js with ✏️ Erin comments, schema bounds + ability whitelist, Maker toggles; ?v= bumped to 20261026f everywhere; no external URLs; Traditional Chinese, nothing scary. OK
- Scope matches the inbox request.

## Spec check
- Elites and bear spawn off-screen via bossZoneSpawn/offscreenSpawn (wrapped check); split minions queue and walk in. OK
- Every attack telegraphed: slam shadow circle 1.2s, teleport blinking destination 1.2s (cancels if player is near), elite shots get 0.8s 準備出招 tag. OK
- Armor first (breaking hit does not pierce), HP bar + name banner with 糖衣盔甲 suffix, pick-two reward without duplicates and stale-event guard. OK

## Notes (non-blocking)
- Elite reward is +5 XP sparkle instead of a chest drop; fine as an initial value, Erin can judge.
- Whole dash duration (dashTimer>0) now ignores ground hazards, including teacher hazards; intentional for dodging the slam, but makes dash a bit stronger.
- If the stage ends in the same tick the bear dies, the pending two-card reward is dropped by resetGame; very unlikely edge case.
