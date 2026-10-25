verdict: changes
467d72c92f48f477d941c4b5d38441a434d11349

# Grok review: survivor-levelup-20mtd (round 2)

## Files checked
- games/survivor/ui/levelup.js (reroll disabled/guarded when no fresh card can be offered)
- games/survivor/tests/levelup-layout.cjs, levelup-reroll.cjs
- games/survivor/index.html, preview.html, preview.js, version.json, sw.js (version 20261025ae, no leftover 20261025ad)

## Test run (Mac Studio, real Chrome)
`node games/survivor/tools/test.cjs --layout` exits 1. Every suite passes except `levelup-layout.cjs`, which now passes 412×915, 384×832, 915×412 and 800×360 but fails at 732×310, line 67:

    await evaluate("openSettings();true");await touch('#buildSlots button');
    assert.equal(await evaluate("!!document.querySelector('#ownedPreview iframe')"),true);

Reproduced 3 times. Cause: at 732×310 `#settingsPanel` scrolls (overflow-y auto, scrollHeight 1378 / clientHeight 282) and the first build-slot button sits below the fold (top 280, bottom 324 > 310). The touch point lands on `#overlay`, not the button, so no preview mounts. The game itself is fine: a JS click mounts the preview, and in a temp copy (not committed) adding `scrollIntoView({block:'center'})` on the button before `touch()` makes all six sizes pass (22.4% / 13.3% at 732×310).

## Findings
1. (must fix) levelup-layout.cjs line 67: scroll the first `#buildSlots button` into view inside `#settingsPanel` (like a player scrolling) before touching it, then rerun the full suite with `--layout`. Do not change the game layout for this.
2. Round-1 optional item is done well: reroll is disabled and the direct call keeps the charge when only the heal fallback remains; test updated. OK.

## Checklist (§6)
- iPad/phone: no new media queries or unsupported APIs. OK.
- Logic: guard uses existing `canOffer`; xp/level/health untouched; per-run reset unchanged. OK.
- Conventions: version bumped everywhere incl. sw.js; Traditional Chinese comment; no external assets or emoji; scope matches card. OK.
