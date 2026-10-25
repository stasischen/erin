verdict: approve
bd98e23695149b8fe9e12331cb154b7edb1c42b3

## Files checked
- games/survivor/preview.js, preview-engine.js, preview.html (new sandbox preview)
- games/survivor/game.js (PREVIEW_MODE guard, upgrade pick-then-confirm, owned-card previews, stop on start/close/apply)
- games/survivor/maker/maker.js (card/effect/boss-move previews, debounced refresh, stop on render/close)
- games/survivor/index.html, style.css, sw.js (?v=20261025r everywhere, SW cache erin-games-v22 precaches the three preview files)
- tests: all 15 node tests in games/survivor/tests pass locally on this SHA (incl. new skill-preview 66 scenes, preview-host)

## Findings
- Preview runs the real engine in one same-origin iframe with a deep-copied payload; game.js skips resize/overlay/render loop/record load in PREVIEW_MODE, so the main game state and saves are isolated. Only one iframe lives at a time; stopped on startGame, applyUpgrade, closeSettings, Maker render/close.
- Animation capped at 30fps, dt <= 0.05 per step, paused when off-screen (IntersectionObserver, guarded) or tab hidden. Fixed 4 dummy monsters + boss phase 3 demos; no spawns, no level-up, no settlement.
- Upgrade flow: tap/hover/focus previews, "選這張" confirms; keys 1/2/3 still apply directly. First card previews by default.
- Descriptions are generated from current data, Traditional Chinese, short and kid-readable.
- iPad: no roundRect/structuredClone/.at; aspect-ratio has min-height fallback; panels use touch-action pan-y (no double-tap zoom), game area unchanged.
- Minor (no change required): the confirm button is a text button inside the panel, unlike the round icon-only HUD buttons; long-warning boss moves are sped up in the demo (caption says so). Real-device check of phone/iPad scrolling, preview size, and offline reopen still pending, per Codex's notes.
