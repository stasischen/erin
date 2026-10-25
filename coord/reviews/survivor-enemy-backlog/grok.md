verdict: approve
899a85742c319ea28586ae7589a7f19990e0f97a

# Grok review: survivor-enemy-backlog

Files checked:
- docs/survivor-skill-backlog.md (new section「未來可以加的敵人（備忘，不實作）」)
- coord/tasks/survivor-enemy-backlog.json
- coord/inbox/done/20261025T142120Z-parent-enemy-backlog.md

Findings:
- Docs-only: `git diff --name-only main...HEAD` touches no game code, data, index.html or service worker; no version bump needed. Scope matches the brief.
- All 18 items from the parent's brief are recorded (6 behaviour, 4 support, 4 field, 4 school-theme) plus the Hades-style mini direction; ⭐ marks match the brief (衝鋒、自爆、分裂、護盾).
- Overlap notes verified against code: Boss moves 黑板擦衝撞／叫小怪／寫黑板罰站 exist in data/defaults.js; Maker enemy behaviour 'retreat' exists in data/schema.js and engine/loop.js, so 遠程怪 is correctly noted as reusing existing ability.
- Relative links (defaults.js, loop.js, spawn.js, boss.js, schema.js, inbox record) all resolve.
- Sources are not invented: un-named items are labelled as parent ideas without guessing a game.
- §6 checklist: iPad/game-logic items N/A (no code change); text is Traditional Chinese, kid-safe; no external assets.
- Non-blocking: card `pr` is null; fine for a docs card.
