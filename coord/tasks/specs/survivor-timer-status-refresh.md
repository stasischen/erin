# P3：續玩後立即恢復計時文字

2026-11-05 家長明確授權開卡、派 subagent 修復。這是 PR113 的後續小修，沿現有工作目錄與分支，不另開 PR。此授權由 subagent 實作、另一個非作者 subagent 審查；不另派 Dot 雲端或擴充玩法。

固定起點 de8034ecd6f88e26f45bd7076991f0c694da43c3，遊戲版本20261104g。普通暫停／選卡會覆寫 statusEl 文字，但同秒恢復時舊 dataset.key 讓更新略過。修正須讓第一個正常更新立即恢復秒數與魔王倒數，且同秒正常畫面仍可使用快取。

允許檔案：games/survivor/engine/loop.js、games/survivor/tests/player-readability.cjs；主控另外處理version.json、版本工具產生的查詢字串／sw快取與本卡紀錄。預估產品及回歸案例合計不到30行，超過300行先說明。

先用真Chrome重現與修後驗證暫停／選卡返回，再補精準回歸測試；至少驗同一秒覆寫「已暫停」及「選一張升級卡」後恢復、正常文字不重建、Boss在場不出現倒數。不要因測試fixture的DOM差異放寬產品判斷。主控完整Mac test.cjs --layout，非作者審查最多兩輪。沒有改數值、存檔、升級節奏或模式；不合併main。

Godot §11：只修既有HUD文字快取失效判斷，不新增模組或資料格式。沿用既有Chrome工具，私人日誌與截圖不提交。
