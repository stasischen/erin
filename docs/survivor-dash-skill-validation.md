# 衝刺與泡泡炸彈工程驗證

卡片：`survivor-dash-skill`；分支：`codex/survivor-dash-skill`。
來源：`coord/inbox/done/20261025T082112Z-parent-dash-skill.md`。

## 實作與初值

- 水球維持自動普攻。新增衝刺 0.15 秒、3 倍移動速度（預設約 85.5px）、短暫無敵，冷卻 2.5 秒；有移動輸入就往該方向，否則沿最後面向。距離由速度、倍速、持續時間共同決定，抵達邊界會停住。
- 泡泡炸彈留在施放座標，0.6 秒後爆炸；傷害 100、範圍半徑 110px、擊退 55px，冷卻 8 秒。可打小兵和老師，沿用擊殺掉寶及老師勝利流程；合體登場期間不傷老師。一次最多一顆炸彈及一個爆炸圈，不增加無限累積的物件。
- 衝刺按鈕 88px、技能按鈕約 77px，直向再縮為 85%，右下方保留 safe-area；冷卻光圈逐漸填滿並附秒數。暫停、升級和結算時隱藏按鈕。各項新增數值都在 Erin 設定區及設定頁；沿用設定 v3 補新預設，不抹除自訂設定。
- 空白鍵衝刺、E 技能、Esc 暫停；不接受按鍵自動重複觸發。右手 Pointer Events 不接管搖桿的 pointerId。暫停與升級時清掉操作輸入，避免恢復後仍朝舊方向走。
- 第一次直向遊玩顯示可關閉提示，以 localStorage 記住已顯示；儲存失敗時至少本次頁面不重播。不鎖方向。
- JS/CSS 資源版本 `20261025e`，Service Worker 快取 `erin-games-v9`。

## 已執行檢查

- `node --check games/survivor/game.js`、`node --check sw.js`。
- `node games/survivor/tests/dash-skill.cjs`：衝刺持續時間、對角距離、最後面向、邊界、無敵最後一幀；炸彈延遲、固定座標、範圍、擊退、單次傷害、擊殺掉寶與老師勝利；冷卻、暫停、設定頁、重開；左右手不同 pointerId、快捷鍵與長按；舊設定補欄位與直向提示。
- `node games/survivor/tests/balance.cjs`、`node games/survivor/tests/enemy-shoot.cjs`：原有水球穿透、難度、敵人國字、設定與重開回歸。
- `git diff --check`。

以上為作者的工程驗證，獨立程式審查交由 Grok 對 erin-watch 提交後的 SHA 執行。

## 尚待實機試玩

沙盒不允許綁定本機 port；嘗試 `python3 -m http.server 8000 --bind 127.0.0.1` 回報 `PermissionError: Operation not permitted`，無法啟動瀏覽器試玩。自動測試使用 DOM／Canvas stub，沒有驗證實際瀏覽器渲染、原生多點觸控或離線快取更新。

Grok 審查後請由家長在 repo 根目錄啟動 `python3 -m http.server 8000`，讓 Erin 試玩：

1. iPad 直向／橫向、旋轉與較小手機畫面：按鈕不被底部橫條遮住，兩顆不重疊；設定滑桿可捲動、可恢復預設。
2. 左手持續推搖桿，右手交替點衝刺／技能；角色不停走，按鈕不叫出搖桿。按暫停或切 App 後倒數與炸彈停住，恢復不瞬移。
3. 冷卻光圈看得懂；無輸入時向最後面向衝刺；空白鍵不再暫停、E 施放、Esc 暫停；開始按鈕保留焦點時仍能使用快捷鍵。
4. 泡泡留在原地，爆開會打退周圍敵人、能傷老師；確認距離、傷害與按鈕大小是否舒服。
5. 第一次直向顯示提示、關掉後重開不再顯示；新版線上重整、離線開啟都載入新按鈕與新版本。

後續流派名稱／主題仍待 Erin 決定，本卡只做紀錄，不需先決定才能試玩。
