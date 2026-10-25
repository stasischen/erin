# 共用效果展示與兩關場景驗證

任務：`survivor-preview-stages`。需求來自 `coord/inbox/done/20261025T124024Z-parent-preview-stages.md`，另處理同卡的續做通知。

## 實作內容

- 升級選卡、Maker 卡片／效果積木／老師招式及暫停已取得卡片，都沿用單一 `preview.js` → `preview.html` → `preview-engine.js`。共用 `PREVIEW_COMPOSITION` 設定基準倍率 1.65、留邊、假怪位置與固定鏡頭；依實際範圍、衝刺／擊退距離與老師招式需要拉遠，沒有獨立的 2.5 倍特寫分支。
- 選卡工作區改成卡片與展示操作欄 5:4；扣掉標題及 64px 操作列後，展示框目標為整個面板 28～38%。保留三卡同列、64px 確認與可展開技能樹。
- 假怪不再每幀強制回原位；保留真實命中、擊退與拉近，循環最後 0.7 秒回位。Maker 的擊退積木距離可使用 -300～300，正數推開、負數拉近，說明同步顯示方向；老師衝撞距離仍維持原本非負安全界線。
- `data/defaults.js` 新增 `stages`：第一關教室、第二關操場，各有背景、波次與強度倍率。第二關怪血量／老師血量 1.12 倍、怪速度 1.06 倍、出怪間隔 0.92 倍，都是本次「稍微加強」的試玩初值。
- 教室使用像素地磚、課桌、椅子與外牆黑板；操場使用草地、跑道線及沙坑。裝飾無碰撞，不擋路。336×252 小圖塊首次繪製後快取，每幀只貼鏡頭內的圖塊，不建立巨大世界畫布。
- 第一關老師被打倒後顯示兩秒「第2關：操場」，轉場期間不戰鬥、不倒數本局秒數；保留血量、等級、經驗與卡片，清除上一關怪物、彈幕、場地效果、冷卻與輸入。第二關重新計算波次與老師出場時間，打倒第二關老師才結算勝利。重開回第一關。Maker 試玩也走兩關，最後結算仍回設計室。
- 舊 Maker 作品沒有 `stages` 時補預設兩關；本次仍不開放關卡編輯介面。資源版本 `20261025w`、Service Worker `erin-games-v27`。

## 已執行驗證

- `node games/survivor/tests/preview-stages.cjs`：透過真實老師受傷函式觸發轉場，驗證第二關／最終勝利、血量與成長保留、上一關攻擊與輸入清除、轉場凍結、各關波次與老師血量、重開、兩種背景快取、擊退與負距離拉近及回位、舊 Maker 作品補關卡資料。
- `skill-preview.cjs`：66 個卡片／積木／老師展示、真實特效、重播、資料隔離、選卡操作與共用 1.65 倍基準取景通過。
- 其他可執行的 `.cjs` 邏輯測試全部通過：balance、boss-moves、boss-range、build-variety、camera-map、clean-hud、dash-skill、enemy-shoot、maker-data、maker-traces、maker-ui、pixel-icons、preview-host、skill-vfx。舊測試的波次時間改為設定關內時間；原勝利測試改成打最後一關老師，保留原有傷害與結算斷言。
- JavaScript 語法檢查及 `git diff --check` 通過。

## 待 Grok 與實機確認

`node games/survivor/tests/levelup-layout.cjs` 在 Chrome 啟動時收到 `SIGABRT`，沒有進入畫面測試。嘗試啟動只綁定 127.0.0.1 的試玩伺服器也收到沙盒 `PermissionError: Operation not permitted`，本輪未能啟動試玩伺服器。不能宣稱展示面積或目視構圖已驗證通過。

排版測試已改成依本次要求檢查展示面積 28～38%；請 Grok 在可啟動 Chrome 的環境補跑 412×915 直拿旋轉、915×412、800×360，並保留 384×832、732×310 的操作回歸。請獨立審查 erin-watch 提交的完整 SHA，並目視檢查各入口的倍率、子彈命中、推拉完整位移和回位，以及兩關背景與轉場。家長與 Erin 再試玩確認角色大小與第二關強度是否舒服；目前無新增必須先決定的設計問題。

本輪只改目前分支的工作檔；未操作 `.git`、commit、push、PR 或 main，交 erin-watch 代辦提交與交接。
