verdict: changes
85e22bbfe749aa244b9fa87a46133bd90e3c5a0d

Reviewed Dot Rolling Eye patch proposal SHA-256 `6599003ea89f6336942ef4fd218ee5214fd584a3ba86979f7ca659fa3f64d012` against this exact PR105 source base. Mechanical transport, allowlist and postimage hashes were separately checked by the coordinator; this review is limited to the proposed code patch, not the full PR/card.

1. `games/survivor/engine/trial-blocks.js` and `games/survivor/render/gallery.js`: `gridTarget` selects a neighbor from the player's current position, while `gridFace` and sprite rotation advance a fixed +1/+90 degrees for every roll. Beam selection and the `beam-active` weakpoint also key off `gridFace===3`, so displayed facing and exposure depend on roll count instead of actual direction. Reproduce by changing player side between successive rolls; the target direction changes while facing/frame progression and beam timing do not. Derive facing/rotation from the actual grid-step vector and test at least two different step directions before beam exposure.

2. `games/survivor/engine/trial-blocks.js`: Maker accepts move weight 0. When `gridFace===3`, a zero-weight beam returns early without changing facing or resetting the sequence, leaving the encounter idle at that orientation. Add deterministic recovery/fallback and test zero beam weight; also cover both moves disabled if schema permits it.

3. `games/survivor/maker/maker.js`: generic shape-radius and move-speed controls are visible for grid-roll/beam, but the custom geometry derives from body radius, grid cell/timing, and beam width/range. These controls do not affect the attacks. Wire each displayed field to bounded live behavior or hide inapplicable controls; add Maker/UI assertions.

The patch was not applied. Luna performed static review only; no tests or browser were run. A corrected proposal must be re-reviewed.
