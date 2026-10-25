verdict: approve
59cd3db34e1cf88637c1a75573397aeea3b1d675

# Grok review: survivor-audio

Reviewed `git diff main...codex/survivor-audio` at the SHA above against §6 of docs/survivor-game-plan.md and the parent brief (coord/inbox/done/20261025T151216Z-parent-audio.md).

## Files checked
engine/audio.js, engine/zzfx.js, engine/boss.js, engine/combat.js, engine/loop.js, engine/state.js, ui/settings.js, ui/levelup.js, input.js, render/hud.js, icons.js, index.html, preview.html, preview.js, preview-engine.js, manifest.js, style.css, sw.js, version.json, assets/CREDITS.md, assets/audio/ZzFX-LICENSE.txt, tests/audio.cjs, tests/levelup-layout.cjs, docs/survivor-audio.md, coord/knowledge/DECISIONS.md, card.

## Tests
Ran `node games/survivor/tools/test.cjs --layout` myself on the Mac Studio: exit 0, all suites PASS including audio.cjs, version.cjs and the real-Chrome levelup-layout at 384×832, 915×412, 800×360, 732×310 (the SIGABRT Codex saw did not reproduce here).

## Findings
- Brief coverage: all 15 sound ids present as a data table (`sounds` with params + cooldown), two placeholder loops (calm / boss, boss also during bossIntro), separate music/sound toggles saved in settings with legacy `sound` preserved and `music` defaulting on, BeepBox hand-off paths documented. In scope.
- Licensing: ZzFX Micro is MIT, full license text kept locally, CREDITS.md updated; no external audio URLs, CDN, or audio files. Both new scripts are in manifest and SW precache; version bumped to 20261025ac everywhere.
- Autoplay: AudioContext is created/resumed only from the start/continue button via `startAudio()`; pausing, level-up, transitions, Maker, game over and `document.hidden` stop music through `sync()`; voices stop when sound is turned off. Missing AudioContext or failures are swallowed so the game still plays.
- Throttling: per-id cooldown, max 2 of the same id, max 8 voices total; ZzFX buffers cached after first generation. Music scheduler looks ahead only 0.2 s with an 80 ms timer and cleans up nodes; `sync()` per frame is a cheap comparison.
- Previews/tests silent: `PREVIEW_MODE` blocks context creation; preview-engine also forces music/sound off; Chrome layout test sets `SURVIVOR_AUDIO_MUTED`.
- iPad: no `roundRect`, `.at`, or `structuredClone`; uses `webkitAudioContext` fallback. `**` and default params are fine on supported iPads.
- UI: round 56px pixel-icon toggles with no text/emoji, aria-label/title/aria-pressed in Traditional Chinese; dimmed when off.

## Non-blocking notes (no change needed now)
- A water-ball hit triggers both `hit` and `water`; throttling keeps it bounded, but if Erin finds it busy, drop one later.
- On iOS, after switching apps the context may be suspended/interrupted; resuming via the 繼續遊戲 button calls `unlock()` again, so it should recover. Resuming with Esc does not re-unlock; worth a real-iPad check.
- Volumes and melodies are placeholders for Erin to judge on Chrome/iPad.
