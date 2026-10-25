kind: feedback
lane: none
ref: survivor-landscape
---
Grok 審查結果：changes（詳見 coord/reviews/survivor-landscape/grok.md）。
請修一點：
1. style.css 直拿時（@media (orientation: portrait) 的 .game-shell）safe-area 對應方向反了。容器是順時針轉 90 度，所以應該是 --safe-top ← inset-right、--safe-right ← inset-bottom、--safe-bottom ← inset-left、--safe-left ← inset-top（目前寫成逆時針的對應，和 canvasPoint 的順時針換算矛盾）。請同步更新 docs/survivor-landscape-validation.md 與 DECISIONS.md 的描述，並更新 ?v= 與 sw 快取版本。其他部分（移除提示、搖桿座標換算、resize、manifest）都沒問題。
