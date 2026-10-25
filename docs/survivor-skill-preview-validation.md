# 技能效果展示驗證

任務：`survivor-skill-preview`。實作分支：`codex/survivor-skill-preview`。

## 實作範圍

- 升級選卡預設展示第一張；滑鼠移入、鍵盤焦點或手指點卡會切換展示與高亮。點「選這張」才套用，鍵盤 1／2／3 保留直接選取。
- Maker 點選卡片／老師招式自動展示；每個效果積木另有「看這個積木的效果」。滑桿與加減鍵修改後 120ms 更新目前展示與依資料產生的繁體中文說明。
- 暫停／設定的已取得卡片有「看效果」，使用本局取得的等級。
- `preview.html` 在獨立 iframe 執行同一份 `game.js` 與目前作品的深拷貝。`preview-engine.js` 建立固定假怪，呼叫正式引擎的攻擊、技能、衝刺、積木、Boss 招式、更新及繪圖函式。原配方與合體卡保留真實效果；合體卡帶入前置卡以呈現組合。
- 小場景每 3 秒重播，最高 30fps，單步最多 .05 秒。老師以第 3 階段展示；長預警加速，說明標示原秒數與加速示範。固定假怪高血量，避免過早清場；不隨機出一般波次、不升級、不結算。
- 同時只保留一個 iframe；切換展示會銷毀舊 iframe。IntersectionObserver 取消不可見展示的動畫排程，頁籤隱藏時取消排程；選卡、關閉設定／設計室也會移除展示。聲音、震動關閉，預覽不讀寫設定／紀錄／作品儲存。
- 主頁資源版號 `20261025r`；SW 快取 `erin-games-v22`，預快取三個展示檔案及原引擎依賴。

## 自動驗證

執行 `node games/survivor/tests/<檔名>.cjs`，以下 14 組全部通過：

`balance`、`boss-moves`、`boss-range`、`build-variety`、`camera-map`、`clean-hud`、`dash-skill`、`enemy-shoot`、`maker-data`、`maker-ui`、`pixel-icons`、`preview-host`、`skill-preview`、`skill-vfx`。

新測試：

- `skill-preview.cjs`：66 個場景，包括 24 張卡、每張原配方積木、9 種通用積木、7 個老師招式、回血與第二積木單獨展示；每個執行超過兩輪，確認可產生說明與有限數值的繪圖指令、合體雙元素、閃電／放電特效、物件上限、靜音、無儲存寫入與主遊戲狀態／亂數隔離。另驗證點卡只預覽、確認才套用，以及已取得卡片展示等級。
- `preview-host.cjs`：單一 iframe、作品深拷貝、相對部署網址、不可見通知、移除觀察器、延遲更新說明、共用引擎所需 DOM 與 SW 展示檔案。
- 舊 `maker-data` 的 153 組固定亂數玩法軌跡仍通過。
- JavaScript 語法與 `git diff --check` 通過。

這些是功能驗證，並非 Grok 的獨立程式審查。

## 待實機驗證

沙盒拒絕 `python3 -m http.server 8000 --bind 127.0.0.1`，錯誤為 `PermissionError: Operation not permitted`，本輪未完成真瀏覽器畫面驗證。

請 Grok 審查 erin-watch 提交後的完整 SHA。審查後請 Erin 與家長在電腦、手機、iPad 試用：升級先預覽再確認、短螢幕面板捲動、Maker 拖動數值／第二積木、合體卡效果辨識、暫停已取得卡、切換頁籤與離線重新開啟。

Erin 可試玩後回報效果是否看得懂、預覽大小與選卡操作是否順手；目前無需先決定新玩法。commit、push、PR 由 erin-watch 代辦；本輪未寫入 .git 或操作 main。
