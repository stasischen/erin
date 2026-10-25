verdict: approve
0d15c0fa9a0719859f8cd012500a4f295cf42fa8

# Grok review: survivor-skill-vfx

## Files checked
- games/survivor/game.js (VFX pool, lightning/gust/splash/discharge/card visuals, slow/stun status, fields, ultimates, render order)
- games/survivor/index.html (?v= bumped to 20261025l)
- sw.js (cache erin-games-v16)
- games/survivor/tests/skill-vfx.cjs, games/survivor/tests/clean-hud.cjs
- docs/survivor-skill-vfx-validation.md, card and inbox brief

## §6 checklist
- iPad/phone: only arc/ellipse/lineTo/rect/fillText used; no roundRect, Array.at, structuredClone, optional chaining or ?? in new code. Touch/pointer handling untouched.
- Logic: visuals tick with dt inside tick() (frozen while paused); resetGame returns all VFX to the pool; new VFX capped at 48 with object reuse, existing 90 particle cap kept (damage numbers may replace sparks).
- All effect positions are world coordinates under the camera transform; tsunami now sweeps world bounds, thunder cloud anchored to target.
- Conventions: VFX_TUNING added in Erin tuning area with kid-readable comment; ?v= and sw.js cache bumped; no external assets.
- Scope: matches brief (chain lightning bolts + sparks, stun stars, slow tint/drips, knockback gusts, counter discharge ring, puddles/whirlwinds/electric trails, three ultimates, fusion cards show two elements, damage numbers drawn last). No damage/cooldown/balance changes.

## Tests (run locally on reviewed SHA)
balance, build-variety, camera-map, clean-hud, dash-skill, enemy-shoot, skill-vfx all PASS; node --check OK.

## Notes (non-blocking)
- Not verified on a real phone/iPad: visibility and 60fps with a full screen still need Erin's playtest.
- Tsunami crosses the whole world map in 1.2s, so it is on-screen only briefly on a large map; tune if Erin finds it too fast.
