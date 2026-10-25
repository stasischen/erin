verdict: approve
5d4c79f0d583993c27d1265370bc55c272580951

# Grok review: survivor-music-polish

Files checked: games/survivor/engine/music.js (new), games/survivor/engine/audio.js, games/survivor/manifest.js, games/survivor/index.html, preview.html, preview.js, version.json, sw.js, games/survivor/tests/audio.cjs, docs/survivor-audio.md, assets/CREDITS.md, coord/knowledge/DECISIONS.md.

Findings (§6 checklist):
- Scope matches the parent brief: three original, data-driven songs (calm 75 s, biscuit ~70.6 s, boss ~66.7 s), each 40 bars with intro/A/B/A'/bridge/outro, lead/harmony/arp/bass/kick/snare/hat. No external audio files, CDN, or new dependencies; CREDITS updated.
- Engine: per-note ADSR with filter, nodes disconnected on end; one shared tanh soft limiter (<0.95) for music + effects; music volume unchanged at 0.035. Scheduler stays at 80 ms / 0.2 s lookahead, skips missed beats instead of bursting, single timer.
- Transitions: 1 s crossfade between calm/biscuit/boss, at most two layers (older outgoing layer disposed on rapid switches); outgoing layer stops scheduling at its end and is disposed.
- Pause/levelup/hidden/music-off stop all layers and timers immediately and keep the playhead; game over/victory clears it. AudioContext still only created on user gesture; PREVIEW_MODE and SURVIVOR_AUDIO_MUTED still silence previews/tests; unsupported devices still play.
- PWA: version 20261026b synced in both pages, preview URL, CACHE_NAME; engine/music.js added to manifest (before audio.js) and precache.
- Tests: Codex's sandbox hit a Chrome SIGABRT, so I re-ran `node games/survivor/tools/test.cjs --layout` on Mac Studio at this SHA: exit 0, all logic/audio tests pass and real-Chrome level-up layout passes at all six sizes (412x915, 384x832, 915x412, 800x360, 732x310, 1024x768).
- No blocking issues. Taste (melody, tempo, loudness, drum clarity) and real iPad/Safari playback remain for Erin and the parent to judge.
