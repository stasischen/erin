verdict: approve
d159ef6a28815eab1f721b09dc8f5bfb3182016e

# Grok review: survivor-shadows

Reviewed `git diff main...codex/survivor-shadows` at the SHA above against docs/survivor-game-plan.md §6.

## Files checked
- games/survivor/render/world.js (drawGroundShadow, drawLandingShadow, bossAirHeight, drawHero, drawBlob, boss render)
- games/survivor/data/schema.js, data/defaults.js, engine/spawn.js, maker/maker.js
- games/survivor/preview.js, preview.html, index.html, version.json, sw.js
- games/survivor/tests/shadows.cjs, docs/survivor-shadows-validation.md, coord/tasks/survivor-shadows.json

## Findings
- Brief covered: hero, enemies and teacher all get a semi-transparent ground ellipse drawn before the body; airborne height lifts the body while the shadow stays on the ground and shrinks/fades. Shared landing-shadow helper grows toward landing and is wired to the teacher dash (new visual arc) and falling exam papers, alongside the existing red warnings.
- Rendering only: collision, damage areas, timing and invincibility are untouched; 153 trace snapshots in normal and Maker modes unchanged.
- Data-driven: optional `shadowSize` (default 0.9, range 0.3–1.8); legacy saves without the field validate and get the default; invalid values rejected; Maker slider added; spawned enemies carry it.
- Previews (skill iframe, Maker moves, portraits) reuse the same render code.
- No emoji, no new external URLs, no roundRect/.at/structuredClone; animation uses game time, so pause freezes it and reset clears boss air height.
- Version bumped to 20261025z across both pages, preview URL and CACHE_NAME.
- Tests: I reran `node games/survivor/tools/test.cjs --layout` on the Mac Studio at this SHA: all pass, including real-Chrome levelup-layout at 5 sizes (preview 26.5–31.1%, blank 9.7–12.6%). The Chrome SIGABRT in Codex's sandbox does not reproduce here.
- Non-blocking: the walk bob for enemies/teacher changed from sin (up and down) to |sin| (up only); barely visible. The teacher name label does not lift during the dash, which is fine.

## For Erin to try
Shadow size and darkness, and whether the teacher dash and exam-paper landing spots are easy to read.
