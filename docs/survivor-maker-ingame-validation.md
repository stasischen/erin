# 遊戲內設計室驗證

來源：`coord/inbox/done/20261025T105623Z-parent-maker-ingame.md`。

## 本次行為

- 開始選單的「🧩 自己設計」開啟同一個遊戲容器內的設計室，沿用固定橫向、visualViewport 與旋轉後安全區。
- 深色像素面板、圖示分頁、流派卡片樹、前置卡標示；點卡片捲到編輯面板。可改名稱、圖示、說明、欄位、階段、前置及效果積木。
- 數值使用像素滑桿、圓形加減按鈕；前置使用選擇按鈕，老師每階段增加目標使用開關。名稱輸入框自訂樣式並保留系統鍵盤。
- 怪物預覽共用遊戲的 `drawBlob` 繪圖函式；老師招式使用橫向招式卡列，點選後顯示該招參數。
- 保留原 schema、驗證及本機儲存 key；一般遊戲與作品試玩維持隔離。儲存後繼續改作品仍可保存。關閉設計室會先儲存修改，失敗則留在設計室並提示。
- 「試玩」驗證並保存作品後，載入同一遊戲頁的 `?maker=1&play=1`，確保所有開局參數套用最新作品。勝敗立即回到遊戲內設計室並顯示結果；關閉回一般遊戲選單。普通遊戲保留原結算。
- 舊 `/maker/` 以 replace／meta refresh 導向 `../?editor=1`，保留可點的備援連結。
- 資源版本 `20261025p`，Service Worker 快取 `erin-games-v20`。

## 已執行的工程驗證

11 組 Node 測試全部通過：`balance`、`enemy-shoot`、`dash-skill`、`build-variety`、`skill-vfx`、`camera-map`、`boss-range`、`boss-moves`、`clean-hud`、`maker-data`、`maker-ui`（檔案在 `games/survivor/tests/`，執行 `node games/survivor/tests/<名稱>.cjs`）。

`maker-data` 包含一般／作品預設各 153 組原玩法快照、資料驗證、前置循環、九種積木與儲存隔離。更新的 `maker-ui` 包含五個分頁、改名／圖示／效果／觸發、加減按鈕、連續儲存後再編輯、錯誤阻擋試玩、恢復預設、選單進出及實際 `finishRun` 勝敗返回事件。JS 語法與 `git diff --check` 通過。

以上為 DOM／Canvas stub 工程測試，不能代表瀏覽器版面已通過。

## Grok 與實機待確認

本次沙盒禁止本機 HTTP server 綁定連接埠（PermissionError），瀏覽器工具禁止 `file:` 協定，故未完成真瀏覽器、iPad／手機、安全區與 PWA 離線實測；未繞過限制。

1. 家長在 repo 根目錄開 `python3 -m http.server 8000`，開 `/games/survivor/`，從選單進入設計室；測試關閉與舊 `/games/survivor/maker/` 連結。
2. 在技能樹點卡，改名、圖示、積木與數值；儲存後再改一次並重開確認。試著讓前置形成循環，應顯示錯誤且不能開始試玩；恢復預設後可正常試玩。
3. 試玩應使用新設定，死亡／過關回設計室；關閉設計室後普通遊戲維持原設定。
4. 用手機小尺寸橫拿、直拿旋轉、iPad、鍵盤開合及瀏覽器工具列伸縮操作所有分頁；確認頂部分頁和底部試玩按鈕在安全區，內容可捲到底。`/games/survivor/tests/viewport.html` 已加入設計室各分頁的真實 DOM 安全區、橫向溢位與捲到底檢查，待瀏覽器執行。
5. 檢查像素滑桿拖曳、長按／多指操作、選擇卡、開關、音效及重新整理／PWA 離線。讓 Erin 試用卡片樹與編輯面板，決定手感是否合適。

沒有必須先決定的新遊戲設計；介面是否好用仍由 Erin 試玩決定。請 Grok 對 erin-watch 提交後的完整 SHA 審查；此文件不代替獨立審查。
