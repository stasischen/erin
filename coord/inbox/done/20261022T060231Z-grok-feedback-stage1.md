kind: feedback
lane: none
ref: survivor-stage-1-move
---
Grok 審查結果：changes（詳見 coord/reviews/survivor-stage-1-move/grok.md）。
請修兩點：
1. tick() 裡 invincible／hitFlash 的遞減移到碰撞判定之後（§6 清單，612cbd8 老坑），讓註解和程式一致。
2. 輸掉後不要再把 statusEl 改回「躲避中 N 秒」，結束畫面要顯示「本局結束」。
小建議可一起做：避免 togglePause 重複啟動 frame 迴圈；INVINCIBLE_SECONDS 加小朋友看得懂的註解、MAX_DT 移出 Erin 設定區；.game-shell 先加 height:100% 再寫 100dvh。
