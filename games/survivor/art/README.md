# 美術放這裡

PNG 路徑慣例：`characters/<id>.png`、`moves/<id>.png`、`effects/<id>.png`、`backgrounds/<id>.png`、`icons/<id>.png`。

對應 Godot `res://art/...`，請以遊戲目錄作為未來 Godot 專案根目錄。現在所有圖仍使用原有程式像素圖，沒有額外素材下載。加入新 PNG 時再建立對應子目錄；不要放螢幕截圖。

在 `../art-manifest.js` 以穩定 id 填入路徑、每格尺寸、動畫 fps／幀順序與錨點。保留可編輯原稿並在 `../assets/CREDITS.md` 記錄來源；升版本後執行 `../tools/version.cjs --write`，素材會加入離線快取。

完整欄位及積木／事件／Maker／測試移植對照見 [Godot 對照](../../../docs/godot-mapping.md)。
