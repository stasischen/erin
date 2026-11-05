# 遊戲引擎模組維護入口

這次拆分只搬運既有完整函式與快取常數，不改名稱、數值、呼叫順序或資料格式。腳本仍依 `games/survivor/manifest.js` 順序載入，沿用原全域函式；既有 `Survivor.render.world` 介面保留原 getter，不要求 Maker、預覽或測試改呼叫方式。

## 渲染

路徑以 `games/survivor/` 為起點。

| 要修改的內容 | 檔案 |
| --- | --- |
| 世界繪圖順序、接縫可見副本、整個 render | `render/world.js` |
| 角色／老師／普通敵人、陰影、sprite染色及輪廓快取 | `render/actors.js` |
| 舊單武器背景貼片、背景光暈、場景背景入口 | `render/background.js` |
| Boss招式／高度、區域圈與方向提示 | `render/boss-effects.js` |
| 小怪分階段攻擊標記、敵群與波次預警 | `render/enemy-warnings.js` |
| 雙方投射物、寶石與傷害／命中粒子 | `render/projectiles.js` |
| 生存六主題地景 | `render/environment.js` |
| 共用元素材質、秘技、武器特效 | `render/materials.js`、`render/effects.js`、`render/abilities.js`、`render/weapons-survival.js` |

每個新模組提供同名 `Survivor.render[...]` 存取器，原有 world 存取器仍保持相容。不要在 Maker 或預覽另外複製一份渲染實作。背景快取與角色快取仍各只有一份，拆檔不會增加第二個狀態來源。

## 戰鬥

| 要修改的內容 | 檔案 |
| --- | --- |
| 可攻擊目標、基本射擊、水球命中、傷害／經驗／命中回饋 | `engine/combat-damage.js` |
| Maker事件、作者效果執行、作者場地更新 | `engine/maker-effects.js` |
| 水風雷附傷、元素場地、衝刺尾跡、舊學派終極 | `engine/element-combat.js` |
| 危險接近判斷、衝刺、按鍵技能、泡泡炸彈 | `engine/player-actions.js` |
| 舊 `Survivor.engine.combat` 介面 | `engine/combat.js` |

本輪沒有修改 Maker 積木規格或驗證資料；只是把其既有執行函式放在同一個責任檔案。新生存秘技／主動仍在原有 `abilities.js` 與 `ability-actions.js`，不另複製邏輯。所有搬出的全域函式與 combat getter 仍指向同一份函式。

## 每幀更新與本局生命週期

| 要修改的內容 | 檔案 |
| --- | --- |
| 環形座標、最短距離、邊界、鏡頭、世界尺寸及手機viewport | `engine/camera-viewport.js` |
| 重置、開始遊戲、換關／勝敗、保留本局配裝與路線 | `engine/run-lifecycle.js` |
| 每幀tick呼叫順序、時間步長、繪圖／邏輯frame排程與暫停 | `engine/loop.js` |

`tick`／`tickImpacts` 與 frame、pause 保持完整原文與順序，不因檔案行數繼續切成零碎步驟。原 `Survivor.engine.loop` getters 和全域函式保持相容；新的兩個責任模組也提供同名存取器。三步拆分使用同一次版本更新，Maker、schema、defaults 與所有測試基準不變。

## Maker 編輯器

Maker 控制項需要共同草稿，這部分以明確的 `ctx` 接合，不是函式原文逐字搬運。`maker/maker.js` 保有唯一的 draft、dirty、分頁與選取狀態；各模組讀寫同一份草稿，不另存副本。儲存仍由原 SurvivorData API 處理，作品格式與儲存鍵不變。

| 要修改的內容 | 檔案 |
| --- | --- |
| 草稿生命週期、分頁外殼、儲存／試玩、設定返回 | `maker/maker.js` |
| 共用輸入、選單、數值、回饋與時間軸 | `maker/widgets.js` |
| 武器、卡片與效果積木 | `maker/cards-weapons.js` |
| 敵人、Boss、弱點與攻擊積木 | `maker/actors.js` |
| 關卡、出怪節奏、波次與碰撞重量 | `maker/stages.js` |
| 玩家預設設定與共用數值編輯 | `maker/rules.js` |

`maker/manifest.js` 是編輯器腳本的唯一順序清單；瀏覽器由 `maker/load.js` 載入，版本工具與 VM 測試也讀同一清單。Maker 入口位於設定面板；一般遊戲關閉 Maker 後返回原準備／暫停狀態的設定，不自動繼續戰鬥。試玩作品的「回設計室」同樣從設定進入，試玩模式關閉設計室仍回遊戲首頁。

## 預設資料

`data/manifest.js` 是完整預設資料的唯一載入清單；三個瀏覽器入口先經 `data/load.js` 載入全部資料，再載入 schema。VM 使用同一清單，不可只讀 `data/defaults.js`。版本工具亦讀此清單檢查檔案、離線快取與入口順序。

| 要修改的預設值 | 檔案 |
| --- | --- |
| 玩家偏好、基本玩法、學派／中立規則、碰撞與重量 | `data/defaults.js` |
| 原三把武器、時間軸、特殊攻擊與回饋 | `data/weapons.js` |
| 共用支援與中立道具卡 | `data/cards-support.js` |
| 學派與既有合體卡 | `data/cards-water.js`、`data/cards-wind.js`、`data/cards-thunder.js` |
| 普通敵人 | `data/enemies.js` |
| 老師、弱點、區域與共用 Boss 數值 | `data/boss.js` |
| 試煉 Boss、AI、招式與弱點 | `data/gallery.js` 與 `data/gallery-<Boss id>.js` |
| 兩關、波次、出怪節奏與精英 | `data/stages.js` |

資料直接記載原本所有追加覆寫完成後的值，不再需要到檔案尾端找第二個設定。卡片保留原索引與陣列順序；所有卡片檔載入完成後才使用資料。最終仍是同一個 `SURVIVOR_DEFAULTS`，作品的獨立複製、驗證與儲存仍由未修改的 schema 負責，沒有新增存檔欄位或儲存鍵。
