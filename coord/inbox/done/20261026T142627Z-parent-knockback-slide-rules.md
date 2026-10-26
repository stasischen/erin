kind: feedback
lane: none
ref: survivor-knockback-slide
---
「照你建議 之後移到godot上整合美術要夠方便」

（Grok 轉述：擊退規則補充，延續上一則家長決定：怪物身體會擋住滑動，紫霧圈不擋。）

- 擊退是短而有上限的推力，方向是遠離命中點；速度用 ease-out 減速。
- 被擊退期間目標短暫失去控制（不能自己移動或出招），結束後恢復。
- 用固定物理步長積分，配合掃掠檢查，避免穿牆或穿過怪物。
- 補純函式測試；升版本號；只跑 `node games/survivor/tools/test.cjs`。
