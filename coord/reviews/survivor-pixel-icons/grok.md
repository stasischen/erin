verdict: approve
34106c3810fc6c3e8018215c0001a9b578bdbf0f

# Grok review: survivor-pixel-icons

## Files checked
- games/survivor/icons.js (new shared 8x8-grid / 16x16 pixel atlas, DOM SVG + Canvas draw)
- games/survivor/index.html, game.js, maker/maker.js, data/schema.js, data/defaults.js, style.css
- sw.js (erin-games-v21, icons.js precached)
- games/survivor/tests/*.cjs (pixel-icons.cjs new; maker-ui.cjs updated)
- docs/survivor-pixel-icons-validation.md, coord/knowledge/DECISIONS.md

## Findings
- Brief covered: emoji removed from game + Maker UI, cards, school badges, action/settings/pause/home buttons, boss locator (canvas draw "boss"), Maker effect blocks, rarity/fusion badges, HUD. 24 default cards have distinct icon ids and patterns (tested).
- Maker uses an icon picker instead of free-text emoji; legacy saved emoji (with/without FE0F) map to close icons; unknown icons fall back to the card default; schemaVersion and storage key unchanged.
- Safety: icon ids go through normalize() against own-property lookup tables before being put into innerHTML, so saved data cannot inject markup; names still reject HTML characters. No external image/font URLs (only the SVG xmlns string).
- aria-label kept on icon buttons; decorative imgs use alt="" + aria-hidden; pointer-events: none on icons so touch hits the button.
- Cache busting: ?v=20261025q on all CSS/JS, sw.js bumped to v21 with icons.js precached; icons.js loads before data/game/maker.
- No roundRect / Array.prototype.at / structuredClone. Unicode property escapes and Object.fromEntries need iOS 12.2+, acceptable.
- Scope matches the card. All 14 runnable test files pass locally on this SHA.
- Minor (non-blocking): some alias choices are loose (e.g. "stun" uses the "over" icon, "gem" uses "common"); Erin can judge recognisability in play-testing. Real-device visual check (iPad landscape, icon picker touch, PWA offline) still to be done by playing.
