verdict: approve
a70be52e4381f98a37217969019e9da48cf2a833

Re-review after parent decision 20261026T140917Z (keep enemy-body blocking, remove fog blocking).

Files checked: games/survivor/engine/body-separation.js, games/survivor/tests/knockback-slide.cjs, version bumps (index.html, practice.html, preview.html, preview.js, practice-host.js, version.json, sw.js), docs/survivor-knockback-slide-validation.md, coord/tasks/survivor-knockback-slide.json.

Findings:
- slideObstacles() no longer passes state.bossZone as bounds; the purple fog is crossable. Teacher barrier walls and enemy bodies still block, as the parent wants.
- New regression tests cover enemies inside/outside the fog rim, the hero pushed across the rim, and the real barrier with arrow endpoint matching the landing point.
- Optional bump/dust effect on enemy-on-enemy stop (decision item 3) not added; it was optional, not blocking.

Tests:
- Box (/workspace/erin-ci/run-review-tests.sh) ran twice and both times hit "FAIL: Chrome 測試逾時" (box Chrome timeout) after the 740×360 layout pass; all non-layout tests passed. Treated as a box infra issue.
- Mac Studio: node games/survivor/tools/test.cjs --layout at a70be52, 97 PASS, no FAIL. Trusted this result.

Hands-on (box, headless Chrome, touch emulation, 1024×461, 740×360, 1180×820), real attack-button taps with candy-hammer:
- Open field: enemy pauses briefly then slides 45 units, decelerating over ~12 frames to a stop.
- Second enemy right behind: slide stops on contact (~1 unit), body blocking kept.
- Fog rim just beyond the enemy, and enemy already outside the fog: full 45-unit slide in both cases, fog no longer blocks.
- Joystick drag moves the hero at all three sizes; no page exceptions.
