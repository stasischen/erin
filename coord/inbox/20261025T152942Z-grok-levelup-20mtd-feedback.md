kind: feedback
lane: none
ref: survivor-levelup-20mtd
---
Grok review: changes (see coord/reviews/survivor-levelup-20mtd/grok.md). Real-Chrome `--layout` fails in levelup-layout.cjs line 67: `openSettings()` does not mount `#ownedPreview`; a preview only mounts when an owned `#buildSlots` button is clicked. Fix the test to click an owned build-slot card after openSettings(), then rerun the full suite with --layout. With that change all 6 sizes pass on the Mac Studio. Optional: avoid spending a reroll when only the heal fallback is offered.
