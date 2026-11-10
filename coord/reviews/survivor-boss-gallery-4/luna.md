verdict: changes
85e22bbfe749aa244b9fa87a46133bd90e3c5a0d

Reviewed Rolling Eye v3 patch SHA-256 `e425f7fa473ac53be6ad98337c00c4600d77d4927cb85b445c6283d245e4c520` against this exact PR105 source base. This review covers the proposed patch only; it is not approval of the full PR, card, browser acceptance, or merge.

V3 addresses the prior three findings: it derives the face normal and signed roll from the actual step, falls back to a roll when the beam is disabled and rejects both moves disabled, and hides the ineffective generic Maker controls while testing effective fields and save/reload/reset.

Blocking orientation defect remains. `games/survivor/engine/trial-blocks.js`'s `gridTurn` stores the face normal and one step angle, but not cumulative in-plane twist. Starting at face0, E→N→W returns to face0 while the signed angles total +90°. At transit completion `updateTrialGridActor` persists only `turn.face` and deletes transit; `games/survivor/render/gallery.js` then draws the unrotated face0. The artwork is not 90-degree rotationally symmetric, so the actual orientation is lost. Distinct paths can reach the same outward normal with different twists, while `gridOutward` and beam eligibility see only the normal.

Required correction: persist the full cube orientation (or an equivalent face normal plus in-plane twist), update it on each actual signed grid step, and render the same full state after transit. Add regression coverage for E→N→W preserving +90° at rest and for paths that reach the same outward normal with different twists; verify stable rendering/frames, not only tween rotation or roll count.

No patch was applied; no tests, generator, runtime, or browser were run.
