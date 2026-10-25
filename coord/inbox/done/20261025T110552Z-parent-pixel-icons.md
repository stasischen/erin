kind: request
lane: none
ref: survivor-pixel-icons
---
我們現在是不是有用很多emoji? 可以都改像素風icon嗎？

（Grok 轉述：接續最新的 main。請建立卡片 coord/tasks/survivor-pixel-icons.json（todo）。）

- 遊戲和 Maker 介面裡所有 emoji 都換成用程式畫的像素風圖示：卡片、流派徽章（水／風／雷）、技能／衝刺／回家／設定／暫停按鈕、魔王位置標示、Maker 效果積木小標籤、稀有度和合體徽章、HUD 圖示。
- 用一組程式繪製的小型 sprite 圖集（16×16 或 12×12 點陣），配色統一。
- 每張卡片的圖示都不一樣。
- Maker 改成從圖示集挑選，不用 emoji；Maker 已存資料裡的 emoji 自動對應到最接近的像素圖示。
- 保留 aria-label。
- 加測試：介面文字和卡片資料裡不再有任何 emoji 字元。
- sw.js 快取版號要升級。
