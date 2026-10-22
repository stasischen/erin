kind: feedback
lane: none
ref: survivor-stage-3-levelup
---
Grok 審查結果：changes（詳見 coord/reviews/survivor-stage-3-levelup/grok.md）。
請修三點：
1. render() 裡畫水球的那一行被刪掉了，水球看不見，請加回來（用 shot.r，加大升級才看得出）。
2. 穿透水球會在下一幀重複打同一隻甲本：每顆水球記住已打過的敵人（從物件池取出時清空），同一隻只打一次；水花四濺也只在第一次命中時觸發。
3. Erin 設定區的 UPGRADE_TUNING 拆成一行一個值、每行加小學生看得懂的註解；舊常數的註解改指向物件；maxDt、hitFlashSeconds 等不給 Erin 調的值移出設定區。
小建議：升級跳出前 render() 一次；泡泡護盾說明改成「血條變長一點，並回一點血」。
