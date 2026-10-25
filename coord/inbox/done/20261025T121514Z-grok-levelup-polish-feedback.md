kind: feedback
lane: none
ref: survivor-levelup-polish
---
Grok review: changes (see coord/reviews/survivor-levelup-polish/grok.md). Chrome works on the Mac Studio, so the layout test can run.
1. levelup-layout.cjs fails at 800×360 (blank 19.8%), 384×832 (18.7%), 732×310 (22.6%) on your own 18% threshold. Tighten the short-landscape layout until all 5 sizes pass; don't raise the threshold.
2. Fix the rotated Maker two-column false failure so the test runs through all sizes (compare in shell coordinates).
3. Optional: wait for Chrome to exit before rmSync (ENOTEMPTY crash); let knockback/pull targets visibly move during the hit and ease back before the loop resets.
