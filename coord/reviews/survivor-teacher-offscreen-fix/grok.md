verdict: approve
be64f6e676436fb3b35888338318c4e7f464cd8d

# Grok review: survivor-teacher-offscreen-fix

Files checked: games/survivor/engine/boss.js, games/survivor/engine/spawn.js, games/survivor/tests/teacher-offscreen.cjs, games/survivor/index.html, games/survivor/preview.html, games/survivor/preview.js, games/survivor/version.json, sw.js, docs/survivor-teacher-offscreen-validation.md, coord/tasks/survivor-teacher-offscreen-fix.json.

Findings:
- Root cause is plausible and reproduced: summonTeacher used the minion minimum distance (player.r + r + 160); on narrow viewports the near-edge candidate fails and the fallback puts the teacher about half a world away (~6000 units at speed 24). Fix passes player.r + boss radius as the teacher-only minimum distance.
- offscreenSpawn: new optional minimumDistance defaults to the old formula, so minion, chocobear (encounters.js) and boss summon (boss.js:245) callers are unchanged. Placement gap r+17 vs check r+16 adds a 1-unit float margin; still strictly offscreen.
- Regression test covers 216 cases (6 viewports incl. 120x100, 3 positions incl. seams, 4 sides, 3 samples): starts offscreen, near viewport, same boss, visible and damageable within 7.5s/15s, stays visible 20s in combat.
- ?v= / version.json / sw.js cache bumped to 20261026j consistently.
- No iPad/touch API changes, no external assets, scope matches the card.
- My run on Mac Studio: `node games/survivor/tools/test.cjs --layout` exit 0, all layout cases PASS (Codex's Chrome SIGABRT gap now covered).
- Note: player faster than teacher can still outrun it; out of scope, documented.
