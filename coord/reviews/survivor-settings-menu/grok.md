verdict: changes
c4a3fa0f020c2e3f14afc3bfa821143847918c72

## Re-check of c4a3fa0 (2026-10-26)
c4a3fa0 only touches coord/inbox, the card JSON and docs/survivor-settings-menu-validation.md (Codex handled the parent nudge). No game or test files changed versus 1a306bf, so the earlier findings stand unchanged: games/survivor/tests/levelup-layout.cjs line 88 still calls openSettings() before tapping #buildSlots button, which now lives in the pause card, so --layout fails 0/9. Fix: openSettings() -> togglePause(). The feedback record coord/inbox/20261026T084500Z-grok-feedback-settings-menu.md is still pending, so no new inbox record was added. Tests not re-run (identical code; previous box run: 0/9 as-is, 85 PASS with the one-line fix). Hands-on result from 1a306bf still applies (1024x461 and 740x360 OK).

## Earlier review of 1a306bf
verdict: changes
1a306bfd73572856fec0b2766ed91edb16ac31c8

# Grok review: survivor-settings-menu (PR #78)

Tests ran on: Grok's cloud box (`/workspace/erin-ci/run-review-tests.sh 1a306bf…`, Chrome 156, node 24).

## Blocking
1. `node games/survivor/tools/test.cjs --layout` FAILS: `tests/levelup-layout.cjs` line 88 (`false !== true`), layout 0/9.
   The test still calls `openSettings()` and then taps `#buildSlots button`, expecting `#ownedPreview iframe`.
   This card moved 本局四欄位／已取得卡片 out of the settings panel into the pause card (`#pauseBuild`), and
   `openSettings()` hides `messageCard`, so the owned-card button is never visible there.
   The game itself is fine: by hand, pausing and tapping the owned card in the pause card does open the preview iframe
   at 1024×461 and 740×360. Please update the test to reach the owned card through the pause card
   (e.g. `togglePause()` instead of `openSettings()` on line 88). Verified locally (not committed): with only that one
   change, the full suite with --layout passes on the box (85 PASS, all sizes).

## Hands-on (box headless Chrome, touch emulation, 1024×461 and 740×360) — all OK
- Old save `erin-survivor-settings-v3` {attackMode:'auto' without chosen flag, sound:false, vibration:false} migrates to the
  new key `erin-survivor-player-settings-v1`: attack = manual (manual-default rule kept), sound off, vibration off; old v3 key left untouched.
- Start screen fits with no scroll: 1024×461 開始遊戲 at y 240–288 (card 161–300); 740×360 at y 189–237 (card 111–249); page scrollHeight = innerHeight.
  The old start-screen 攻擊 toggle is gone; round icon-only gear (44×44) at top-right of the card.
- Gear from the home screen opens settings with four groups 操作／手感／聲音／顯示. Tapped every switch (攻擊 手動/自動, 搖桿跟隨, 打擊回饋, 畫面震動, 音樂, 音效, 低特效)
  and dragged every slider (搖桿大小 → 66, 死區 → 8, 打擊回饋強度 → 0.5, 音樂 0.3, 音效 0.6): each changed gameSettings and the live GAME_DATA.joystick / hitJuice.
  All values survived a reload. Note: when a control is scrolled only to the bottom edge, the sticky 重設／關閉 bar sits on top of it; scrolling a bit further makes it tappable (minor, not blocking).
- In play: joystick drag moved the hero (x 1536→1624 / 1110→1198); lowEffects caps burst sparks at 2; auto mode auto-fires, attack button hidden.
- Pause button opens the pause card: 本局四欄位 shows 普攻 = 水球 (fixed, no more 尚未取得), owned card tap opens preview; 740×360 開始/繼續 at y 295–343 fits.
  Gear on the pause card opens settings; switching to 手動 there and closing returns to the pause card; after 繼續遊戲 no auto fire, tapping attack fires (manual).
- Maker 數值 tab: old 攻擊操作／左搖桿／打擊手感 panels removed; a collapsible 預設設定 panel with mode select, six switches and five sliders.
  Toggled 低特效 and dragged 搖桿大小 → 68, saved: work.playerDefaults updated, personal key untouched; with no personal key, `?maker=1&play=1` uses lowEffects=true from the Maker default.
  Minor (not blocking): each switch tap in that panel re-renders and collapses the <details>, so you must reopen it after every toggle.
- No page exceptions at either size.

## §6 checklist
- Touch/pointer handling unchanged; no new media-query hiding; no new APIs (no roundRect/at/structuredClone).
- `?v=` bumped to 20261026aa in index/practice/preview/practice-host/preview.js, version.json and sw.js.
- Traditional Chinese, short labels; no external assets; scope matches the card (settings menu, migration, Maker default panel, start-screen fit, 普攻 slot fix, backlog doc).

Files checked: data/defaults.js, data/schema.js, engine/state.js, engine/audio.js, engine/combat.js, index.html, input.js, maker/maker.js,
render/hud.js, style.css, ui/levelup.js, ui/settings.js, practice*.html/js, preview*.html/js, version.json, sw.js, tests/settings-menu.cjs, tests/levelup-layout.cjs.
