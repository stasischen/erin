kind: feedback
lane: none
ref: survivor-stage-5b-balance
---
太簡單完全沒有難度 而且水球本來就有穿透 沒有多打一下的效果啊

（以上是家長試玩階段 5 後的原話。）

請先建立新卡 coord/tasks/survivor-stage-5b-balance.json（標題「割草遊戲階段 5b：穿透修正與難度平衡」，dependsOn survivor-stage-5-polish），這張比階段 6 優先做。

一、穿透
- Grok 讀 games/survivor/game.js：程式上 pierce 預設是 0，打到第一隻就 shot.alive = false，看起來是對的，但家長實際玩起來覺得水球「本來就穿透」。請在 iPad／電腦實際重現並找出原因（例如：水球打中後是否同一幀還畫出來、擊退讓敵人看起來被穿過、水花或多顆水球造成誤會、物件池重用時 alive/hitList/pierce 沒重設等），修好後在回報說明原因。
- 規則：水球預設打到一隻就消失（要有小水花「啪」的消失效果，讓人看得出來）。
- 🫧 穿透卡每級多穿 1 隻；有穿透的水球外觀要不同（例如外圈白色泡泡、尾巴），每穿過一隻時閃一下或出現小「穿！」字，讓玩家看得出多打了一下。

二、難度（目前太簡單）
所有數值都留在 Erin 設定區（UPGRADE_TUNING／WAVES），並同步更新設定頁預設值。建議新值（Grok 先設計一版，試玩再微調）：
- 水星人血量 playerHealth：100 → 80；受傷保護 invincibleSeconds：1.15 → 0.8
- 甲本：速度 62 → 75、血量 100 → 120、撞擊傷害 12 → 18
- 乙本：速度 88 → 105、血量 60 → 70、撞擊傷害 14（新增 secondEnemyDamage，現在共用甲本的 12）
- 同時最多敵人 enemyLimit：18 → 32
- WAVES 出怪間隔：2.1/1.8/1.5/1.2/0.95 秒 → 1.6/1.3/1.0/0.75/0.55 秒，並加一列 105 秒 every 0.45；敵人速度隨時間微微變快（例如每 30 秒 +8%，數值 enemySpeedGrowth）
- 老師：血量 1400 → 2400；文字發射間隔 1.35 → 0.8 秒，每次 3 個字扇形散開；文字彈傷害 20（新增 teacherShotDamage，現在用甲本的 12）；老師出場時小兵不要全部消失，之後每 4 秒叫 1～2 隻小兵
- 升級變慢：xpToLevel 5 → 起始 5，每升一級多需要 2 顆（新增 xpGrowthPerLevel: 2）
- 自動補血變慢：autoHealSeconds 8 → 12
- 可選：設定頁加「簡單／普通／困難」三檔（倍率套在敵人血量、速度、傷害、出怪速度；普通 = 上面的新值，簡單約 0.7 倍，困難約 1.3 倍）

三、舊設定
- 設定頁目前存在 localStorage 的 erin-survivor-settings-v1，老玩家會一直讀到舊數值。請加設定版本號（例如改成 v2 或存 version 欄位），版本不同時改用新預設值。
- service worker 快取版本也要加一號，讓大家裝置更新。

做完把卡設成 peer_review 給 Grok 審查，並把「水球預設不穿透」和新難度記到 coord/knowledge/DECISIONS.md。
