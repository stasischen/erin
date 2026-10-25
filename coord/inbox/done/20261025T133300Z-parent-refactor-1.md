kind: request
lane: none
ref: survivor-refactor-1
---
好，做完這輪就排重構

（Grok 轉述：請建立卡片 coord/tasks/survivor-refactor-1.json（todo）。這是重構第 1 步，遊戲行為完全不能改變。）

Grok 檢查 main 的結果：
- game.js 有 1,681 行，約 101 個全域函式，全部擠在同一個檔案。
- style.css 有 22 個 .upgrade-panel 規則區塊，@media 規則互相衝突（同一個條件重複出現、數值不同），版面問題一直反覆。
- preview.html 會在 iframe 裡把整個 game.js 再載入一次。
- ?v= 版號和 sw.js 的 CACHE_NAME 都是手動改。
- vm 測試依賴 game.js 的全域函式。

第 1 步規格（零行為變更）：
(a) 把 game.js 拆成一般（非 module）腳本，放在 window.Survivor 命名空間底下，依固定順序從同一份共用清單（manifest）載入：
- engine：state／loop、combat、spawn、boss
- stages
- render：world、hud
- ui：levelup、settings
- input
測試需要的地方保留相容的全域名稱。
(b) 測試載入器改成讀同一份清單；所有現有測試和 maker-baseline.json 都要原樣通過。
(c) 加一個單一版號來源和檢查腳本：一次更新 index.html／preview.html 的 ?v= 和 CACHE_NAME；清單裡的檔案有任何一個沒列進 sw.js 預先快取就失敗。
(d) 整理 style.css：每個畫面一個區塊（HUD、升級選卡、設定、Maker），只用一組由 data-short 和安全區變數驅動的斷點。用無頭版面測試鎖住 412×915 直拿旋轉、384×832、915×412、800×360、732×310。

展示沙盒的入口留到之後的步驟。全部維持 iPad Safari 相容。
