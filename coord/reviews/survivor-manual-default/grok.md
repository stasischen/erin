verdict: approve
fe918fa1465abce311d2b6664e9c7c1e49ea99fb

# Grok review: survivor-manual-default

Tests ran on: Grok's cloud box (`/workspace/erin-ci/run-review-tests.sh fe918fa…`): full suite including `--layout`, RESULT: PASS (83 PASS lines, 9 layout sizes passed).

## Files checked
data/defaults.js, data/schema.js (legacy auto without attackModeChosen migrates to manual on load; validate keeps the flag), engine/state.js (player settings only keep attackMode when attackModeChosen is true), ui/settings.js (setAttackMode cancels manual holds/charge and J/K keys, saves the player setting outside Maker, updates buttons and controls), input.js (reset goes back to manual), ui/levelup.js, manual-attack.js (attack icon follows activeWeapon().icon, only re-rendered on change), maker/maker.js (round pixel switch at the top of 數值, with a note that it applies to the creation/practice room), index.html, style.css, version bump to 20261026z across pages plus sw.js cache name, the new tests/manual-default.cjs and the adjusted older tests (auto cases now set auto explicitly).

## §6 checklist
Scope matches the card; data stays serializable (string + boolean); no new assets; no Lingo/invest files touched; version synced; tests cover migration, persistence, button visibility, icon mapping and cancelled input.

## Hands-on (headless Chrome, touch emulation, 1024×461 and 740×360)
- Old settings `{attackMode:'auto'}` with no chosen flag: home page opened in manual (start switch reads 攻擊：手動, aria-checked true). Tapped the start-screen switch: auto; reloaded: still auto; tapped back: manual, survived reload.
- Started three games, one per weapon (water ball, lollipop hammer, candy greatsword): all four buttons visible; attack button icon matched the weapon each time (big-water / candy-hammer / candy-sword, visually confirmed in screenshots). Tap fired a normal attack, a 1.5s hold released a charged attack, dragging up aimed at −90°, special fired (water-fan / leap / sword-wave, 6s cooldown started), skill fired, and the left joystick moved the hero ~110px.
- While holding the attack button, paused with Esc: the hold was cancelled and releasing the finger while paused fired nothing. Opened 遊戲設定, tapped the pause switch to 自動, 完成, 繼續遊戲: only dash and skill remained, auto attack fired 3–4 times in 1.5s, joystick not started by the taps. Switched back to manual the same way: four buttons back, no attacks without input, a tap fired once. Player setting saved with attackModeChosen true.
- Maker 數值: switch at the top, tapped to 自動, saved, reloaded and reopened: still 自動; `?maker=1&play=1` and the practice room iframe both ran in auto; the home page kept the player's own manual choice.
- At 740×360 the start card scrolls to reach 開始遊戲 (the extra switch adds height); it is reachable and worked, and the pause settings 完成 button was in view.
- No page exceptions at either size.

## Notes (not blocking)
- The settings 本局四欄位 still shows 普攻「尚未取得」after picking a weapon; this predates this card.
- Real-device check by Erin still recommended, especially the start-screen scroll on small phones.
