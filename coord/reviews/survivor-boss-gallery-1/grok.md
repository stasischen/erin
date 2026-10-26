verdict: approve
ec5c7f102d276390eb7c8ac9bb44009a93aa2dc1

# Grok review: survivor-boss-gallery-1（王的試煉入口、共用積木與巨斧守門人，版本 20261027a）

## Files checked
`git diff main...codex/survivor-boss-gallery-1` (32 files): engine/gallery.js (new), render/gallery.js (new), engine/loop.js, engine/boss.js, engine/combat.js, engine/posture.js, input.js, index.html, style.css, sw.js, render/world.js, render/hud.js, ui/levelup.js, data/defaults.js, data/schema.js, maker/maker.js, practice-engine.js, practice.html, practice-host.js, art-manifest.js, art/characters/gatekeeper.png, tools/gatekeeper-art.py, assets/CREDITS.md, tests/boss-gallery.cjs, tests/art-manifest.cjs, version.json, docs/survivor-boss-gallery-1.md.

## Tests
- Box (`/workspace/erin-ci/run-review-tests.sh ec5c7f1…`): the usual box Chrome timeout (`FAIL: Chrome 測試逾時`, ECONNRESET) after 102 PASS lines; box infra issue seen on previous cards.
- Mac Studio fallback: `node games/survivor/tools/test.cjs --layout` at this SHA, rc=0, 103 PASS lines. Trusted per rule.

## §6 checklist
- iPad/phone: new trial panel and buttons are plain buttons inside the existing overlay; no hover media queries, no roundRect/at/structuredClone in new code; joystick unchanged and works in the arena.
- Logic: movement/timers use dt; restart (retry from menu) resets the boss to full HP; trial runs spawn no waves/elites/bear/events (enemies 0 throughout).
- Conventions: all `?v=` bumped to 20261027a, sw cache bumped and new files precached; gatekeeper PNG is original (generator script + CREDITS); Traditional Chinese, icon-only round buttons, no text banners for moves.
- Scope: matches the card (entry points, arena, shared blocks, gatekeeper 5 moves + half-HP phase, Maker settings, art manifest entry).

## Hands-on (box headless Chrome, touch emulation, 1024×461, 740×360, 1180×820)
- Start screen 王的試煉 round button: tap opens the menu (1 boss portrait + name, home button). Tap portrait starts the fight.
- Entry: boss appears at the top entrance with a pulsing red ring, 2 s warning, cannot be attacked (canAttackTarget false), no moves during entry; edge arrow shows when the boss is off-screen.
- Joystick drag moves the hero; attack button damaged the boss (1800 → 1608).
- Phase 1 moves seen naturally: shield, axe, leap; no immediate repeats. Axe does two sweeps (windup/active twice, second angle shifted). Leap target stays locked during windup.
- Perfect dodge: tapping the dash button ~0.1 s before shield strikes raised posture; posture filled and the boss was stunned with weakness (damage bonus ×3) after 4–7 dodges.
- Phase 2 at 49% HP: phase-changed event, spin appears; forced charge into the wall gave wall-stun 1.98 s with weakness (bonus ×3), ended at ~2 s.
- Arena wall and camera: at the bottom wall the hero stays on screen, camera stops near the wall, stone floor outside; full screen, no black bars.
- Real damage hits the player (leap 18, shield 12, axe 15); death → 「再試一次！」 menu; win → 「挑戰成功！」 menu; retry restarts at full HP; home button returns to the start screen (mode ready, trial cleared).
- Pause/resume during a trial works (mode paused → playing, trial kept).
- Maker 老師 → 王的試煉 panel: 62 sliders; arena radius + ×5 → 720. Maker weapon 試玩 → practice room → pause → 王的試煉 button closes practice and opens the menu with the draft (arena radius 720 in game, not saved); home returns to the Maker.
- No page exceptions at any size.

## Notes (non-blocking)
- The 王的試煉 button is also visible in the normal pause menu, so tapping it leaves the current run without asking (same as the existing 自己設計 button).
- HUD still shows 「1關 · Lv.1」 and a timer during the trial.
- Natural phase-2 sampling in ~9 s didn't pick charge; forced charge works. Difficulty/feel left to Erin's play-test.
