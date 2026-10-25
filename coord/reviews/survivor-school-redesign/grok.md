verdict: approve
02e5c1993957431b10e8955f108f83ffa4f7a8a4

# Grok review: survivor-school-redesign

Files checked: engine/schools.js, engine/school-combat.js, engine/loop.js, ui/levelup.js, data/defaults.js, data/schema.js, maker/maker.js, render/world.js, index.html, sw.js, version.json, tests/school-redesign.cjs, docs/survivor-school-redesign-validation.md, card + brief.

Tests: re-ran `node games/survivor/tools/test.cjs --layout` on Mac Studio at this SHA: exit 0, all scripts pass, including levelup-layout at all six sizes (412×915, 384×832, 915×412, 800×360, 732×310, 1024×768) with the spirit picker. This closes the gap Codex reported (Chrome SIGABRT in its sandbox).

§6 checklist:
- iPad/phone: no roundRect / .at / structuredClone / external URLs added; spirit picker reuses the existing round icon-only touch/confirm UI; touch handling unchanged.
- Logic: new timers use dt seconds; bubble shield absorbs via absorbSchoolHit before the existing invincibility flow, so invincibility is still decremented after collision; wind wall removes enemy shots into the pool; rods/fields bounded and pooled; dash thunder-step uses full-segment distance.
- Restart: resetGame recreates schoolRun and schoolCombat and ultimate timers; stage change carries schoolRun/schoolCombat without re-picking the spirit.
- Conventions: ?v= and sw.js cache bumped to 20261026g, new engine files added to sw.js precache; text Traditional Chinese, kid-friendly; scope matches the brief (N-school registry, 3 per run, 5 per school pool, legendary extra chance, 3-card transform, 5-card ultimate, 2+2 fusion, owned/starter weighting, bullet colour by main school, gradient for fusion, aura on transform, all values in schoolRules with Maker sliders and SCHOOL_BOUNDS).
- Godot §11: sampling/eligibility/weights/appearance/growth events are pure functions with RNG injected; honest about remaining gaps.

Findings (non-blocking, for Erin's playtest / later cards):
1. Ultimates now stack (several can be active at once) — intended per brief, but may be strong late game; watch balance.
2. schoolCombat (incl. placed lightning rods) carries into stage 2; rods expire on their own lifetime, so harmless but worth noting.
3. Legendary 2.5% per offer per card is an engineering default; Erin may want it a bit higher so she actually sees the gold glow.
4. Main-school colour with multiple fusion cards uses the first one in data order — fine for now.
