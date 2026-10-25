verdict: approve
54dac2c49b6245f8f5c166ed5f8b209124fb6b6b

## Files checked
- games/survivor/game.js, index.html, style.css
- games/survivor/tests/{balance,build-variety,dash-skill,enemy-shoot}.cjs
- sw.js, coord/tasks/survivor-skill-tree.json, docs/survivor-skill-tree-validation.md

## Findings
- Skill trees for water/wind/thunder (entry → A/B → ultimate requiring A+B) and the three fusion cards match the parent request; cards show prerequisites; canOffer() enforces prerequisites, Lv5 cap, one ultimate per run, one entry per slot; general cards kept; attacks stay automatic.
- All upgrade icons now unique (rapid-water ⏩, multi-water 🎯); fallback heal 🥤.
- Frame removed: .stage absolute inset 0, no border/shadow; title/help hidden; back/pause float top-right with safe-area insets; fixed landscape kept, no rotate hint (dash-skill test covers it).
- Build HUD is a fixed 4-column single row (height 30px, nowrap, latest icon + count); boss bar placed below at a fixed offset, so it no longer gets pushed/overlapped.
- Pixel-style dark panels, rarity backgrounds and school top border on cards.
- No ctx.roundRect, Array.at, structuredClone, ?? or ?. added; no external asset URLs.
- resetGame clears new ultimate/moveRate state; stunned enemies don't throw.
- ?v= bumped to 20261025i; sw cache erin-games-v13.
- node --check passes; all four test files PASS on this SHA (re-run by Grok).

## Not verified (needs real-device playtest)
- Visual layout on smallest phone / iPad, readability of the skill tree, ultimate/fusion balance and performance with many effects.
- Slot interpretation (water entry=普攻, wind entry=衝刺, thunder entry=技能) is Codex's reading so fusions are reachable; ask Erin if she likes it.
