kind: request
lane: none
ref: survivor-landscape
---
那個提醒橫置很礙眼 遊戲固定橫置好了

（Grok 轉述：家長要求。請建立卡片 coord/tasks/survivor-landscape.json（todo），做完送審。）

規格：
- 拿掉「橫著拿更好玩喔」提示與相關設定。
- 遊戲固定橫向：manifest.webmanifest 加 "orientation": "landscape"（Android 安裝版會鎖定）；iOS 網頁無法鎖方向，所以裝置直拿時，把整個遊戲容器旋轉 90 度、填滿螢幕，畫面仍是橫向版面；觸控與搖桿座標要跟著轉換，按鈕仍在玩家看到的右下角、safe-area 正確。
- 移除直向專用的縮小按鈕版面，只保留橫向版面。
- 更新版本號與 sw 快取；記入 DECISIONS.md。
