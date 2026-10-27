# 美術清單 v2 驗證與交接

卡片：coord/tasks/survivor-art-manifest-v2.json；規格：coord/tasks/specs/survivor-art-manifest-v2.md。版本 20261027g；既有清單不必補欄位，查詢器接受 schema 1／2。沒有修改戰鬥規則、碰撞、生成或 Maker 作品 schema；沒有替換正式主角美術。

## 實作

- 純美術查詢新增 1／4／8 方向、方向順序、水平鏡像與循環檢查；單方向保留舊行為，多方向角色不疊加舊左右翻轉。
- layout 的 cols／rows／margin／spacing；支援每方向一列與方向 → 絕對格子索引。每動畫可獨立 sheet、逐幀秒數與 syncToPhase；動畫回退只要求 idle/run/hurt，支援 spawn/death/phase2/dodge/active_2 等名稱。
- 角色、怪物、老師及試煉角色讀方向與階段時間；displaySize／scale 取代顯示端固定尺寸，舊尺寸只作未設定時的初值，碰撞半徑不動。palette/source 深複製，outline 可選顏色與寬度；原全域外框開關仍優先。PNG 受擊閃白仍有效。
- VFX 的 fitTo／rotateWithAim／zLayer／blend／alpha／progressMode；一般技能特效分 ground/actor/overlay，預設 actor 保持舊順序。招式皮膚仍呼叫原地面範圍／缺口／武器蓄力繪圖。補齊 gust 等缺少的 effect 條目，預設仍使用原圖。
- 原創 sample/player-directions：64×64 格子、三列 S/E/N、W 鏡像 E、三欄 idle/run/hurt，1px margin 與 2px spacing；每動畫自己的 sheet 路徑供離線快取驗證。這張圖只供測試，不是玩家照片或遊戲截圖，未預設套到正式角色。產生器 player-directions-art.py --check 不寫檔。
- 版本工具使用同一個純 sheetPaths 查詢，動畫獨立 PNG 也入 precache，不只掃資產頂層 sheet。?v=、版本與 sw 已同步。

## 驗證

首輪 20261027f 的 Mac Studio `node games/survivor/tools/test.cjs --layout` 全部通過，exit 0、109 則 PASS；`git diff --check` 通過。完整日誌僅留本機 ~/.local/share/erin/logs/artv2-full-tests.log；沒有 GitHub CI。另單獨跑過 art-manifest、art-manifest-v2、boss-gallery-2 與真實 layout。

- 原 art-manifest 測試的六組改動前 Canvas SHA-256 與 153 組固定戰鬥 trace 全部相同；未重新產生基準。既有條目的舊 fps、圖片裁格與失敗回退仍受測試覆蓋。
- 新純函式案例：預設值、schema1、4/8 向、鏡像／循環拒絕、不同方向格子、margin／spacing、逐幀時間與精確邊界、階段拉伸／停用、名稱回退、獨立 sheet、顯示錨點／倍率、來源深複製、非法資料／路徑、VFX 路徑／混色設定、保留原警示、玩家不雙重翻轉、碰撞不變。
- 圖片接合：模擬載入時的裁格／鏡像／快取／白閃；Python 只讀檢查程式圖可重現，PNG 尺寸 198×198。
- 真實 Chrome layout 在十個 DPR3 觸控尺寸（含 740×360、1024×461、1180×820），讀實際 PNG 的 S/E/N 像素、W 鏡像、圖片白閃與 draw 輸出；原有全螢幕、HUD／卡片／Maker／練習場多指操作亦全過。沒有儲存截圖至 repo。

## 獨立審查員

請核對最終 HEAD 與完整 diff，自行重跑 Mac Studio 全套含 --layout；在三個指定尺寸實際操作主遊戲、試煉、Maker、預覽及練習，確認原外觀／預警／手感、HUD 與全螢幕未退步。新清單功能另在隔離瀏覽器暫時用 sample 條目覆蓋 character/player，走向 S/E/N/W，確認 W 只有一次鏡像、64×64 顯示不改碰撞，受擊白閃／外框正常；測完還原，不把暫時示範當正式美術或持久作品。

再以隔離資料改一個動畫 sheet／frameDurations／syncToPhase 及一個 effect/gust 的 vfx 設定，確認換圖、階段時長、方向／顯示尺寸、圖層與 alpha 確實反映。招式換皮的原警示與安全缺口必須保留；不能只看純函式輸出冒稱實際驗收。正式美術與 Maker 的美術專用編輯 UI 不在本卡，本輪透過清單設定。

根目錄 AGENTS 為現行流程；公開 coord 進 Git。此 PR 另帶 PR #101 合併後的流程狀態／交接快照，只有 done 與完成證據，沒有更動協作規則。主控開 PR 後停手派審；下一張 weakpoint 仍等家長決定。

## Godot §11

- §11.1／11.4：清單欄位是可 JSON 序列化的數據；每格尺寸、方向／鏡像、原稿、色票、來源、顯示與碰撞分離。仍是 classic JS 包裝，未全面轉 JSON。
- §11.2／11.6：lookup／direction／frameRect／phaseContext／shapeOptions／vfxPlan／sheetPaths 為純查詢，固定秒數與方向輸入，有邊界／舊等價案例。圖片載入、裁圖、外框與 draw 屬平台層。
- §11.3：只讀既有階段，沒有用播放結束觸發傷害；未新增事件匯流排。
- §11.5：音訊未變，沿用既有原稿與匯出待辦。
- §11.7：displaySize／scale 不寫回碰撞或輸入；幀速率不改邏輯秒數。Godot flip_h／SpriteFrames 命名／speed_scale 與 VFX 對照見 docs/godot-mapping.md；本輪未執行 Godot。

## 首輪獨立審查 changes 與修正（20261027g）

審查員在三尺寸實際確認 move/icefall 的圖在 Boss 身上，原警示卻在鎖定落點；gatekeeper leap 同樣由兩處不同原點產生。首輪 tests 雖通過，不能代表換皮已正確，PR #102 未合併；原 changes 紀錄與 PR 留言保留。

- 修正共用 shapeOptions：皮膚與原警示使用同一 origin／shape。冰錐、隕石、俯衝及守門人跳砸都用 m.target；nova 等施法者中心招式維持 body；衝鋒使用實際射線長度。正常老師的跳砸／追蹤／落點群也讀實際 points，其餘招式依原警示的圈、線或牆提供皮膚幾何。沒有改動命中／傷害／生成規則。
- 圖片只裁在原警示範圍內，環形缺口不被不透明圖填滿；spiral 亦共用原彈幕射線列表，逐條裁圖保留缺口，警示固定最後畫。alpha／blend 與一般特效的圖層設定仍有效；shapeOptions／clip 只影響繪圖。
- 新 art-telegraph-geometry 案例：Boss=(315,305)、落點=(500,480)，兩軸明顯不同，驗證 icefall／meteor／dive／leap 的 windup／active 都對齊原警示；nova 仍以施法者為中心，普通老師落點亦覆蓋。
- 十尺寸真實 Chrome 另讀不透明圖的環形缺口像素：缺口為透明、危險環仍有圖，避免只測原警示函式有執行。獨立的 layout 與新／舊 art 測試已通過；最後修正版 Mac Studio 全套含 --layout exit 0、110 PASS；`git diff --check` 通過，日誌 ~/.local/share/erin/logs/artv2-revision-final-tests.log。新被審 SHA 以同 PR 的修正回覆與 HEAD 核對。
- 版本、?v=、sw 同步升為 20261027g；同一分支與 PR 修正，再交原獨立 session 重審。
