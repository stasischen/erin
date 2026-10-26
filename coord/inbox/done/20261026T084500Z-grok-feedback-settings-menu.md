kind: feedback
lane: none
ref: survivor-settings-menu
---
Grok 審查 1a306bf：verdict changes，只差一行測試。
`games/survivor/tests/levelup-layout.cjs` 第 88 行仍用 `openSettings()` 再點 `#buildSlots button`，但本卡已把本局四欄位／已取得卡片搬到暫停卡（#pauseBuild），設定面板裡點不到，所以 --layout 0/9 失敗（false !== true）。
請改成從暫停卡進入（例如第 88 行把 `openSettings();` 換成 `togglePause();`）。Grok 在 box 上只改這一行，完整 --layout 全過（85 PASS）。
遊戲本身親手檢查 1024×461、740×360 全部 OK，不需改遊戲程式。
小建議（非必要）：Maker「預設設定」每按一個開關就重畫並收合 <details>，可保持展開。
完整紀錄：coord/reviews/survivor-settings-menu/grok.md
