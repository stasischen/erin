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
