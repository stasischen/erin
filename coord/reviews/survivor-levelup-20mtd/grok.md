verdict: changes
8af29d697057ec1f2a2e471b683397379cc2efde

# Grok review: survivor-levelup-20mtd

## Files checked
- games/survivor/ui/levelup.js, index.html, style.css, icons.js
- games/survivor/data/defaults.js, data/schema.js, engine/state.js, engine/loop.js, maker/maker.js
- games/survivor/preview.html, preview.js, version.json, sw.js
- games/survivor/tests/levelup-layout.cjs, levelup-layout.html, levelup-reroll.cjs
- docs/survivor-skill-backlog.md

## Test run (Mac Studio, real Chrome)
`node games/survivor/tools/test.cjs --layout` exits 1. Every suite passes except `levelup-layout.cjs`, which fails at line 67 on the very first size (412×915):

    await evaluate("openSettings();true");
    assert.equal(await evaluate("!!document.querySelector('#ownedPreview iframe')"), true);

`openSettings()` never mounts a preview; `#ownedPreview` is only mounted when a `#buildSlots` button is clicked (render/hud.js:20), on main as well. So this new assertion is wrong, not the game. With that one line changed locally (temp copy, not committed) to click the first `#buildSlots button` after `openSettings()`, all six sizes pass:
- 412×915 preview 31.9% / blank 10.1%
- 384×832 29.9% / 10.9%
- 915×412 31.9% / 10.1%
- 800×360 27.7% / 11.6%
- 732×310 22.4% / 13.3%
- 1024×768 39.5% / 8.0%

## Findings
1. (must fix) levelup-layout.cjs line 67: open the pause-menu preview the way a player does (click an owned build-slot card after `openSettings()`), then assert the iframe exists. Re-run the full `--layout` suite.
2. (nice to have, optional) When the only offer is the heal fallback (all cards maxed), reroll still spends a charge and gives the same heal card back. Consider disabling the reroll button when the eligible pool has no fresh cards, or leave as-is and note it.

## Checklist (§6)
- iPad/phone: no new touch-hiding media queries; round 64px buttons; no roundRect/at/structuredClone added. OK.
- Logic: reroll guarded by mode and count, resets per run in resetGame, does not touch xp/level/health. OK.
- Conventions: Erin 設定區 comment for LEVELUP_REROLLS, data-driven with Maker 0–9 bounds and legacy migration; version bumped to 20261025ad everywhere incl. sw.js. OK.
- No external assets, no emoji; Traditional Chinese text; scope matches the card (reroll-adding cards only noted in backlog). OK.
