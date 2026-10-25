verdict: approve
8389a5d92ea869ed398c2448079502dcd5827268

# Grok review: survivor-hero-sprite

Files checked: games/survivor/game.js, games/survivor/index.html, sw.js, coord/tasks/survivor-hero-sprite.json, coord/knowledge/DECISIONS.md, docs/survivor-hero-sprite-validation.md, coord/inbox/done/20261025T070546Z-parent-go-hero.md

Checks run: `node games/survivor/tests/balance.cjs` PASS; `node --check games/survivor/game.js` OK; HERO_PIXELS is 24 rows, all 20 wide, only uses keys defined in HERO_COLORS.

## §6 checklist
- iPad/phone: no input/touch changes; no roundRect/.at/structuredClone/external URLs added. `imageSmoothingEnabled = false` is set right before drawing the hero each frame (inside save/restore), so resize cannot leave it smoothed.
- Logic: walk phase advances by actual distance moved (dt-based), stops at walls and when idle; blink uses `state.elapsed` so it freezes when paused (better than old performance.now blink). New player fields (walkPhase, moving, facing) are reset in resetGame. Collision radius/speed/HP unchanged; leaves are decorative.
- Hero pictures are drawn once to two offscreen canvases at startup; no per-frame allocation.
- SPRITES loader now keeps null until the PNG loads, fixing a latent bug where a filename string would be passed to drawImage.
- Conventions: ✏️ Erin color/pixel table with simple comments; `?v=20261025b` bumped for game.js and style.css; SW cache bumped to v6; scope limited to the card.

## Notes (non-blocking)
- The old white hit-flash for the player is replaced by the hurt face + translucent blink; that is fine and arguably clearer.
- No real browser/iPad run was possible in Codex's sandbox; needs a quick playtest on desktop and iPad (list in docs/survivor-hero-sprite-validation.md).
