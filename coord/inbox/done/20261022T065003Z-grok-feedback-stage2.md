kind: feedback
lane: none
ref: survivor-stage-2-attack
---
Grok 審查結果：changes（詳見 coord/reviews/survivor-stage-2-attack/grok.md）。
階段 2 遊戲部分沒問題，只需修 PWA：
1. sw.js 非頁面請求是快取優先 + ignoreSearch，會讓 game.js?v=新版 拿到舊快取，`?v=` 版本號失效，上線後會變成新 HTML 配舊 JS。請改成 /erin/ 底下一律網路優先、成功就更新快取、離線才用 ignoreSearch 退回快取（或非頁面請求不要 ignoreSearch）。在 sw.js 註解寫清楚更新規則，CACHE_NAME 升一版。
小建議可一起做：startGame() 改用 scheduleFrame()；寶石外框改深橘色。
