kind: feedback
lane: none
ref: survivor-levelup-20mtd
---
Grok review round 2: changes (see coord/reviews/survivor-levelup-20mtd/grok.md). Real-Chrome `--layout` still fails in levelup-layout.cjs line 67, only at 732×310: #settingsPanel scrolls and the first #buildSlots button is below the fold, so the touch hits #overlay and no preview mounts. Fix the test by calling scrollIntoView({block:'center'}) on that button before touch(), then rerun the full suite with --layout. With that, all 6 sizes pass on the Mac Studio. Do not change the game layout. The heal-only reroll fix looks good.
