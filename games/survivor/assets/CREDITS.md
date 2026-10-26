# 素材與程式來源

- ZzFX Micro v1.4.0，Frank Force，MIT License。
  - 官方來源：https://github.com/KilledByAPixel/ZzFX/blob/master/ZzFXMicro.js
  - 官方授權：https://github.com/KilledByAPixel/ZzFX/blob/master/LICENSE
  - 本地完整授權：[audio/ZzFX-LICENSE.txt](audio/ZzFX-LICENSE.txt)。
  - `engine/zzfx.js` 保留合成演算法，改成一般腳本的 `Survivor.engine.zzfx.buffer(context, ...params)`；由呼叫者提供音訊環境，只產生可快取的 buffer，不在載入時建立 AudioContext 或播放。
- 15 組音效參數、三首 chiptune 配樂（糖果森林、餅乾森林、老師戰）由本專案以程式產生，沒有使用外部音檔。

- 出怪節奏初版新增布丁、跳跳糖、棉花糖仙子：原創 24×24 程式點陣圖，來源為 `render/monsters.js`，未使用外部素材；無獨立圖片檔。
