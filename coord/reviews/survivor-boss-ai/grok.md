verdict: approve
afb4a1a7456f73706b6114fc03396cdb83dba4f5

# Grok review: survivor-boss-ai

## Files checked
- games/survivor/engine/boss-ai.js (new pure rules: phase / scores / choose / start / advance)
- games/survivor/engine/boss.js (teacher wired to shared AI; strict no-repeat; recovery/cooldown)
- games/survivor/data/schema.js, data/defaults.js (boss.ai.rules, recovery/cooldown timing blocks, legacy migration, validation)
- games/survivor/maker/maker.js (Boss tab "AI 規則" item, recovery/cooldown labels)
- games/survivor/render/world.js (recovery pixel highlight, danger zone removed during recovery)
- tests/boss-ai.cjs, tests/maker-ui.cjs, manifest.js, sw.js, index.html / practice / preview ?v=, version.json (20261026av)
- docs/survivor-boss-ai-validation.md

## Tests
- Box `/workspace/erin-ci/run-review-tests.sh afb4a1a` hit the recurring box Chrome timeout (ECONNRESET; 100 PASS lines before it). Box infra, not the card.
- Fallback on the Mac Studio: `node games/survivor/tools/test.cjs --layout` at afb4a1a, rc=0, 101 PASS. Trusted.

## Hands-on (box headless Chrome, touch emulation, 1024×461, 740×360, 1180×820)
- Start game, drag joystick: hero moves right (+164 world units).
- Summoned teacher and let it fight ~15s while moving: AI state cycles cooldown → select → windup → active (→ recovery for leap) → cooldown; every new move started in windup (warning shown first); sequence e.g. podium-leap > call > rain > call > podium-leap, no move picked twice in a row (0 consecutive repeats at both sizes tested).
- Data check: words recovery 1.0 / cooldown 3.0 with other weights 0 → warning 0.9s, active 0.3s + 1.0s recovery, then rest 3.0s (cooldown above phase rest 1.7 applied). Pause freezes AI state; resume continues. HP to 60% → phase 2 with shout.
- Maker → 老師 → AI 規則: panel opens, 14 move fieldsets; tapped + on 權重 / 最近距離 / 朝向加權 / 後期階段加權 (values changed 1→2, 200→210, 0→0.1, 0→0.1), phase-2 threshold + (0.66→0.67), 移出招式清單 (14→13, "加入 發射國字" appeared), 加入 brought it back (14). Move "發射國字" timing block: 收招停頓秒數 + and 招後冷卻秒數 + work. Save → localStorage has the rules/threshold/recovery/cooldown, and ?maker=1&play=1 loads them into GAME_DATA. No exceptions at any size.
- Panel fits at 740×360 with pixel icons, no emoji.

## Findings
- Matches the brief: select → windup → active → recovery → cooldown driven by timing data; weighted scoring by distance/angle/phase/previous; strict no-repeat; Maker AI rules block with weights, distances, phase thresholds; teacher keeps old near/mid/far grouping and default weights 1 so behaviour stays equivalent; legacy saves migrate (recovery/cooldown default 0, rules derived).
- Note (not blocking): teacherChoices no longer falls back to repeating the previous move; with the default data every distance band has ≥2 moves so the teacher never stalls, but a Maker edit that leaves only one usable move in a band will make the teacher just wait in that band. That's what the brief asked for.
- Note: the old 0.5s retry when no move fits is now the phase rest (1.2–1.7s); small pacing change only when nothing fits.
- §6 checklist: dt-based timing, pause/restart ok, ?v= and sw.js cache bumped, Traditional Chinese, no external assets, scope stays within the card.
