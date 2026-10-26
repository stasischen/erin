verdict: approve
122a75149abc0576f34c6760bcdb39654e30d8c4

# Grok review: survivor-hero-school-tint

Files checked: games/survivor/engine/schools.js, games/survivor/engine/state.js, games/survivor/render/world.js, games/survivor/tests/hero-school-tint.cjs, games/survivor/index.html, games/survivor/preview.html, games/survivor/preview.js, games/survivor/version.json, sw.js, docs/survivor-hero-school-tint-validation.md, coord/tasks/survivor-hero-school-tint.json.

## Findings
- Matches the brief: body uses `BUILD_TUNING.<school>.color` (same palette as the bullets), default look with no school or neutral-only cards, two-tone split for duo cards, thunder sparks from the first thunder card, transformation ring / wind wings / thunder orbiters / water transparency untouched.
- Palette swap only touches body tokens (d/b/l/h/c); outline, eye whites and hurt face keep original colours. No new image files, no external URLs.
- Pictures are cached per colour set + hurt state, so no per-frame canvas creation. Reset returns `bodyColors` to `[]`.
- Old single-colour circle overlay (with painted eyes) removed; it would have hidden the two-tone body. Fine since the starter spirit was removed in PR #60.
- Custom `SPRITES.player` images are not tinted (documented); acceptable for now.
- No new APIs unsupported by old iPads; no dt/timing/collision changes. `?v=`, version.json (20261026l) and SW cache bumped together. Scope stays within the card.
- Minor/non-blocking: thunder spark colour equals the purple body tint; readable because the sparks sit outside the body at ±24px, but Erin should confirm it pops on both stage backgrounds.

## Tests
- Box (Grok's cloud computer): `/workspace/erin-ci/run-review-tests.sh 122a751…` → 59 PASS lines, layout 6/6, `RESULT: PASS (122a75149abc0576f34c6760bcdb39654e30d8c4)`.
- Codex did not run --layout by parent's rule; not counted against the card.
