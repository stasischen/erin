verdict: approve
77b6e973543f31b7fbb664dd4f950ecdbe347e6e

# Grok review: survivor-effect-blocks-step1

Tests: full suite incl. --layout run on Grok's cloud computer (box) via /workspace/erin-ci/run-review-tests.sh — RESULT: PASS (65 PASS lines, layout 6/6).

## Files checked
- games/survivor/engine/effect-blocks.js (new: data recipes, pure step/modify, whitelisted refs, no eval)
- games/survivor/engine/school-combat.js (static pulse replaced by applyEffectBlockTimer adapter; WeakMap target ids; win/lose stop kept)
- games/survivor/engine/combat.js (maxPlayerHealth via modify; crown subtracted after shield, min 1 kept)
- games/survivor/engine/neutral.js (crown multiplier via modify, after bank)
- games/survivor/engine/state.js, manifest.js, index.html, preview.html, preview.js, version.json, sw.js (load order, 20261026p, precache)
- games/survivor/tests/effect-blocks.cjs + effect-blocks-legacy.json (frozen legacy oracle, two-VM input→output equivalence)
- docs/survivor-effect-blocks.md, docs/survivor-effect-blocks-step1-validation.md
- coord/tasks/survivor-effect-blocks-step1.json, inbox brief

## Findings (§6 checklist)
- Scope matches brief: only 靜電 and 王冠 migrated, old hard-coded branches removed only with equivalence tests; other features untouched; no Maker block editor; field rules unchanged.
- Equivalence: frozen pre-migration functions compared against new code over weapons, levels 0/1/5, dt incl. long dt, pending/negative timers, shared power, custom tuning, wrap, boss intro protection, boss death stop, crown cost/damage, shield, bank, acquisition without healing. Order of operations preserved (crown after bank; health clamp min 1).
- Pure rules don't mutate input (tested); unsupported trigger/condition/action/ref throw; `__proto__` ref rejected.
- Handoff doc shows a data-only new card example (also tested end to end) and lists all 47 remaining features with missing blocks. 浪花水球 doc error fixed.
- Version bumped and effect-blocks.js added to manifest and SW precache. Godot §11: logic/data separated, seconds and world coords.
- Minor (non-blocking): adding a brand-new card id still needs a defaults.js edit (documented); applyEffectBlockTimer assumes every event targetId maps to a live target, which holds today because events are consumed synchronously.
