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
