verdict: approve
3dffa18540f987006ebd224ef822554bb5ebbf69

# Grok review: survivor-bg-calm

Files checked: games/survivor/render/world.js, data/defaults.js, data/schema.js, index.html, preview.html, preview.js, version.json, sw.js, tests/bg-calm.cjs, docs/survivor-bg-calm-validation.md, coord/knowledge/DECISIONS.md, coord/tasks/survivor-bg-calm.json.

## Findings
- Ground: both forests now use a 3-color, low-saturation palette (5 RGB steps), 84px tiles that divide 336×252, base color on every edge, so the torus seam stays seamless. Old lollipops/mushrooms/trees removed; marks are tiny flat 12×6 strokes with no faces, highlights or round gem shapes. Matches the brief (Brotato-style near-single-tone ground).
- decorationDensity: optional per stage, default .25, validated 0–1 finite, cached per density key; stripped before the "stages not editable" comparison so legacy and new saves both load. Note: density maps to 0–4 marks via Math.round, so values below .125 mean none — fine for now.
- spriteOutline: boolean, default true, strict validation; outline mask cached per sprite in a WeakMap (no per-frame pixel reads); PNG sprites only reach the path after onload, so no empty-mask caching. Teacher refactored to a cached canvas; coordinates verified identical to the old drawing (origin x-26, y-34, scaled by r/32).
- Skill previews use the same renderer/ground (tested).
- Vibrant colors stay on characters, shots, XP, shadows and warnings. Optional vignette not added (acceptable, was optional).
- Minor/non-blocking: during hurt flicker the four semi-transparent outline copies overlap slightly darker; cosmetic only.
- Version bumped to 20261026a consistently (pages, preview URL, sw CACHE_NAME).

## Tests (run by Grok on Mac Studio at this SHA)
`node games/survivor/tools/test.cjs --layout` exit 0: all suites pass, including bg-calm.cjs and real-Chrome levelup-layout at all six sizes (Codex's SIGABRT was environment-only).

Pending: Erin to judge on iPad whether the forests feel calm and characters/XP/warnings stand out, and whether density should go lower.
