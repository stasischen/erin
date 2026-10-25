verdict: approve
8e604e5c78afe15e64605a7b9a22c6198613715d

# Grok review: survivor-preview-stages

Files checked: games/survivor/game.js, data/defaults.js, data/schema.js, preview-engine.js, preview.js, preview.html, style.css, index.html, maker/maker.js, tests/*.cjs, sw.js, docs/survivor-preview-stages-validation.md.

## Tests (run on Mac Studio)
- All 17 node logic tests pass (incl. preview-stages, skill-preview, preview-host, maker-ui, balance, boss-moves).
- levelup-layout.cjs in real Chrome DPR3 (the run Codex could not do): all 5 sizes PASS. Preview share 412x915 31.1%, 915x412 31.1%, 800x360 29.0% (target 28-38%); 384x832 30.0%, 732x310 26.5% regression sizes also pass layout/touch/confirm checks. Blank space 9.7-12.6%.

## Findings
- Previews: one shared PREVIEW_COMPOSITION (1.65x base, zoom out only to fit radius/dash/knockback distance); the old 2.5x / previewWide branch is gone, so all entry points match.
- Knockback/pull: enemies no longer snapped home each frame; engine displacement kept, smooth return after 2.3s. Negative distance = pull, schema/Maker/description updated consistently. Resolves the PR #27 open note.
- Stages in data (stages[] with background, waves, scales); schema backfills old Maker works and still rejects stage edits. Stage 2 = 1.12x HP, 1.06x speed, 0.92x spawn interval.
- Backgrounds: 336x252 tiles cached once, only on-camera tiles drawn, decorations have no collision. Uses rect/fillRect only.
- Transition: 2s 「第2關：操場」 overlay, combat frozen, progress kept, previous stage hazards/inputs cleared, restart returns to stage 1, final win only after stage 2 boss.
- Checklist: dt-based, no new old-iPad-unsafe APIs, no external URLs, ?v= bumped to 20261025w, sw cache v27, Traditional Chinese, scope matches card.

## Non-blocking notes
- Settings/pause is ignored during the 2s transition and switching apps mid-transition does not pause it; harmless at 2s.
- Stage-2 difficulty and character size need Erin's playtest; I did not visually inspect the backgrounds in a browser.
