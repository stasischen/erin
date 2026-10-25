verdict: approve
c03c09645827744d13cd5566cc77c49d9d44e9ee

# Grok review: survivor-maker-ingame

Files checked: games/survivor/index.html, games/survivor/game.js, games/survivor/maker/{index.html,maker.js,style.css}, games/survivor/tests/{maker-ui.cjs,viewport.html}, sw.js, docs/survivor-maker-ingame-validation.md, coord/knowledge/DECISIONS.md, card + brief.

Tests: all 12 node tests in games/survivor/tests pass on the Mac Studio (balance, boss-moves, boss-range, build-variety, camera-map, clean-hud, dash-skill, enemy-shoot, maker-data, maker-traces, maker-ui, skill-vfx).

## §6 checklist
- iPad/phone: maker room lives inside the stage, uses the existing safe-area vars; body keeps touch-action none / user-select none / callout none; the editor is its own scroll container with pan-y so scrolling works; slider touch-action none; contextmenu still blocked. Joystick pointerdown is on the canvas, which the room covers, so no stray joystick. No hover/pointer media query hiding touch UI. No roundRect/at/structuredClone; CSS min() and Object.fromEntries were already in use.
- Keyboard handler ignores input while state.mode === "maker"; blur/visibility pause only affects "playing".
- Restart: test play reloads `?maker=1&play=1`, so all start parameters reset from saved data; finishRun returns to Maker only in MAKER_MODE, normal game keeps its result overlay.
- Versions: ?v=20261025p on all css/js including maker files; sw cache erin-games-v20.
- No external assets; Traditional Chinese, kid-friendly text. Scope matches the brief (old /maker/ redirects to ../?editor=1, schema/validation/storage/reset kept).

## Notes (non-blocking)
- Tabs and the toolbar still use emoji + text labels ("🌊 流派", "恢復預設"); the parent prefers round icon-only buttons and pixel icons instead of emoji. Fold into the pixel-icon card.
- Real-device layout (small phone landscape, iPad, keyboard open) and PWA offline still need a hands-on check; tests/viewport.html has the new Maker checks ready.
- Opening Maker from the pause menu abandons the current run (closing returns to the start menu). Acceptable, but worth knowing.
