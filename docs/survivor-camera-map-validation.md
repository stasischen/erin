# 小怪獸：鏡頭、地圖與可見操作區

來源：`coord/inbox/done/20261025T092439Z-parent-camera-map.md`。

- 每局開始以當時畫面建立 3×3 個畫面大的地圖，角色從地圖中央開始；同一局中旋轉或瀏覽器工具列伸縮不改地圖大小、不重設角色位置或進度。
- 一般區域鏡頭讓角色置中；靠四邊時鏡頭停在地圖邊緣，角色可離開畫面中央直到碰牆。這是收件匣「置中」與「邊緣停止捲動」的實作解讀，請家長／Erin 試玩確認。
- 地圖四邊有牆、地磚花紋固定在世界座標；角色、怪物和老師及擊退受到地圖限制。怪物在主角周圍生成，靠牆時朝地圖內側生成；老師在主角附近的地圖內聚集登場。子彈與特效使用世界座標；小兵只有進入鏡頭後才丟字；搖桿使用畫面座標。
- `visualViewport` 寬高、offsetLeft／offsetTop 決定整個容器大小與原點；resize／scroll 都重新排版並釋放舊輸入，舊瀏覽器回退 innerWidth／innerHeight。保留順時針旋轉及安全邊距映射。
- 技能／衝刺改成右下並排、相同固定尺寸（沿用設定 72～104px，預設 88px），搖桿只從左半部開始；血條、經驗、計時維持上方精簡一列，四欄與老師血條固定列高，返回完整文字顯示在右上。
- 資源 `20261025j`，Service Worker `erin-games-v14`。

## 作者工程驗證（不是獨立審查）

執行 `node games/survivor/tests/camera-map.cjs`、`dash-skill.cjs`、`build-variety.cjs`、`enemy-shoot.cjs`、`balance.cjs`，全部通過。新增測試涵蓋置中移動、四角鏡頭停止、衝刺碰牆、角落生成距離／地圖限制、老師與擊退限制、舊畫面外子彈仍能命中、鏡頭內才丟字、視覺視窗尺寸／原點／旋轉、同局 resize 保留世界與重開重設。既有戰鬥測試明確將測試主角放到原本的 (400,300)，保留原有戰鬥距離與預期傷害。

`node --check games/survivor/game.js`、`node --check sw.js` 與 `git diff --check` 通過。

## 尚待執行的瀏覽器與實機驗證

本輪 HTTP 伺服器遭沙盒拒絕（`PermissionError: Operation not permitted`）；瀏覽器工具也因安全政策禁止 `file:` URL，未繞過限制。因此未執行 DOM 版面測試或實機試玩，不能宣稱按鈕的實際渲染已驗收。

Grok／家長啟動根目錄試玩伺服器後開啟 `http://localhost:8000/games/survivor/tests/viewport.html`：測試頁會載入真實遊戲 iframe，測 7 種手機／平板直橫向尺寸、模擬 visualViewport 工具列縮小與非零原點、安全區，以及 72／88／104px 三種按鈕大小。使用 `getBoundingClientRect()` 檢查技能、衝刺、返回、暫停、HUD、四欄與老師血條都在可見安全範圍，並檢查按鈕不互相或與 HUD／返回重疊。這是可執行的瀏覽器測試，尚未取得本輪執行結果；iframe 模擬也不能代替 iPhone Safari 真實工具列及瀏海行為。

實機請確認：手機直拿旋轉、橫拿、iPad；工具列展開／縮起後所有按鈕完整、左手搖桿加右手技能可同時使用，地圖四邊正常、老師能出場和擊倒、暫停／重開、網路與離線快取更新。地圖大小及右手並排按鈕手感留給 Erin 試玩決定。

Grok 請審查 erin-watch 提交後的 SHA；commit、push、PR 由 erin-watch 代辦，未修改 main。
