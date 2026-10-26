verdict: approve
2869a3bc084e79c549906d8eac1c7de257e36b8c

# Grok 審查：survivor-wave-ball-weapon-text

## 檢查的檔案
- games/survivor/data/defaults.js（49 張卡全部有 descriptionMelee、item-wall 改名浪花水球、neutralRules wavePush/waveDamage/waveCooldown）
- games/survivor/data/schema.js（NEUTRAL_BOUNDS 新欄位、舊作品補預設、近戰說明 120 字與安全驗證、彈牆水球名稱遷移）
- games/survivor/engine/neutral.js（掃過碰撞純函式、waveNeutralHit：每次最多撞一隻、不遞迴、不跳目標、兩隻各自冷卻、老師只推不互撞、走正式傷害入口）
- games/survivor/engine/loop.js、school-combat.js、weapons.js（移除邊緣反彈；水球命中與錘子揮擊都接上浪花；cardNote 改讀資料）
- games/survivor/ui/levelup.js、preview.js、preview-engine.js、maker/maker.js、icons.js（選卡、技能樹、看效果、Maker 遠程／近戰兩欄、新 8×8 圓形像素圖示）
- tests/wave-ball-text.cjs、tests/neutral-items.cjs、version.json、sw.js、index.html、preview.html（版本 20261026m 全部同步）

## §6 檢查
- 符合需求：浪花取代彈牆、保留 item-wall id 和道具池位置；與雷的跳電不同（測試確認看效果沒有閃電）；兩把武器都適用；每張卡依武器顯示說明，分裂水球保留註記；數值可在 Maker 調整。
- 沒動到其他遊戲、Lingo 或 invest；沒有 emoji 或外部素材。
- 安全：近戰說明走既有長度與 HTML 驗證，測試含 `<script>` 拒絕。

## 小提醒（不擋合併）
- 拿棒棒糖錘時，看效果的說明改成直接顯示 descriptionMelee，所以衝刺卡少了原本「有 N 格衝刺、結束後第一次攻擊強化」那句，數值型說明也變成通用文字。之後可考慮在近戰說明後補回衝刺次數。
- 浪花數值是初版，等 Erin 試玩再調。

## 測試
- 在 Grok 的雲端電腦（box）跑 `/workspace/erin-ci/run-review-tests.sh 2869a3b…`，含 --layout：60 PASS、layout 6/6，RESULT: PASS。
