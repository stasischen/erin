# Survivor 美術與 Godot 移植對照

本卡只準備美術接合，沒有開始移植或更改玩法。依據：`coord/inbox/done/20261026T154905Z-parent-godot-art-prep.md`。版本：20261026aw。

## 換一張圖

1. 把 PNG 放在 `games/survivor/art/characters/`、`moves/`、`effects/`、`backgrounds/` 或 `icons/`。Godot 專案以 `games/survivor/` 為根時即為 `res://art/...`。保留可編輯原稿，來源寫入 `assets/CREDITS.md`。
2. 在 `art-manifest.js` 找同一個穩定 id，將 `sheet: null` 改成例如 `art/characters/player.png`，修改 `frameSize`、動畫及錨點。所有其他欄位維持純資料；每個物件一行方便查找。清單用 classic JS 包裝以保留同步啟動、直接開檔與既有 Maker；裡面的物件可直接 JSON 序列化，沒有函式或 Canvas。
3. 用 `version.json` 升版，再以 `tools/version.cjs --write` 同步 HTML、展示／練習入口及離線快取。新圖片也會納入快取檢查。未載好、載入失敗或缺少影格時使用原圖。HTML 圖示載好後會更新原節點。
4. 交 Grok 檢查三個尺寸及實際操作；Erin 決定正式圖案與是否喜歡。這張卡未選擇新美術或引入外部素材。

清單是美術唯一的路徑入口。`SPRITES` 保留舊程式覆寫相容介面，已移除另一套圖片載入器；新素材不再填它。造型選單仍使用 `spriteId`，舊 Maker 作品不需改格式。

## 清單欄位與座標

| 欄位 | 意義／單位 | Godot |
|---|---|---|
| id | `character/player`、`character/gummy-bear`、`move/boss-dash`、`effect/gust`、`icon/dash` 等穩定字串 | Resource key／StringName |
| sheet | 相對遊戲根的本地 PNG；null 沿用程式佔位圖 | Texture2D，`res://art/...` |
| frameSize | 每格寬、高，原始像素；背景固定 336×252 | AtlasTexture.region.size |
| animations | 必備 idle / run / windup / active / recovery / hurt / stun | SpriteFrames animation 名稱 |
| frames | 從 0 起，從左到右再往下一列的格子索引 | SpriteFrames.add_frame(AtlasTexture) |
| fps | 每秒幀數；0 為固定第一格 | animation_speed；靜態圖停在第 0 幀 |
| loop | true 循環；false 停在末幀 | animation_loop |
| pivot | 0～1 的美術原點，左上為 [0,0] | Sprite2D.offset／AnimatedSprite2D.offset |
| hitboxAnchor | 0～1，圖的配置錨點；只用於對齊，不能改變命中框 | 視覺子節點與碰撞根節點的相對原點 |
| mode | sprite 可換 PNG；procedural 是保留幾何與複合畫面的查詢邊界，sheet 必須 null | 顯示腳本／預警繪圖節點 |

`lookup(id, animation, seconds, manifest)` 為純查詢，傳回複製的描述；不讀時鐘、不載圖、不動狀態。秒數由遊戲傳入，負值／非有限值當 0。非循環超時停在末幀，未知動畫用 idle，未知 id 傳回 null。`bounds` 算顯示矩形；位移是 `顯示尺寸 × (hitboxAnchor - pivot)`。主角原圖 20×24，顯示 40×48、左上 (-20,-30)，兩個錨點均為 [.5,.625]；老師 52×68；怪物 24×24。顯示尺寸及碰撞半徑維持舊值。

`render/art.js` 才負責圖片載入、切格快取、drawImage、HTML 圖示。人物切格後仍經既有外框／染色／彈跳變換。怪物查詢也供 Maker 預覽共用。預設所有 sheet 為 null，保持現有色盤、圖示、幾何與繪圖順序。

`layer/*` 是複合繪圖邊界（地面陰影、整群場地、HUD 輔助等），不是一張可覆蓋整群物件的 PNG。角色、水球／敵方彈、寶石、各種 VFX 是可替換的個別美術入口。`scene/world` 包含剩餘 inline UI、血條與幾何標記；這些仍由 procedural 層繪製，移植時重寫平台畫法。背景 PNG 必須維持固定地磚尺寸以保留拼接。

## 時機和美術的責任

`SurvivorTiming`、武器／敵人／Boss 規則決定 windup → active → recovery → cooldown 及傷害進入事件。美術只讀這些狀態。cooldown 的顯示可用 idle；美術沒有命中回呼，不能使用 animation_finished、frame_changed 或方法軌道造成傷害，也不能因播放完畢提早收招。

角色以走路、受傷、暈眩和既有攻擊狀態選動畫。`move/boss-<招式id>` 與 `move/enemy-<種類id>` 是附加在原本幾何上的招式裝飾，預警區／安全缺口／練習命中框仍依邏輯尺寸繪製，換圖不會刪除它們。顯示時計用遊戲秒數或 VFX 已過秒數；不影響時機積木。若希望新增完整逐階段演出，仍須由 Erin 決定表現，本卡不調整時長。

## 積木與 Godot Custom Resource

以下為建議映射名稱，尚未建立 `.gd`、`.tres`、Godot 專案或事件匯流排。

| 現有資料／積木 | 建議 Custom Resource | 執行責任 |
|---|---|---|
| trigger（onShot、onDeath、onTimer 等） | TriggerResource | 依邏輯事件啟動規則 |
| conditions（radius、touching、still、randomTarget 等） | ConditionResource | 純條件篩選，傳入抽樣值 |
| shape（line、sector、circle、ring、projectiles） | ShapeResource | 世界單位的命中幾何；不採圖片輪廓 |
| timing（windup、active、recovery、cooldown） | TimingResource | 秒、單次進入事件、緩衝／取消規則 |
| actions／effect（damage、slow、stun、knockback、summon、field、chain 等） | EffectResource | 依 type 建子資源／處理器，結算後產生事件 |
| feedback（提示、停頓、震動、音效等） | FeedbackResource | 消費事件，強度不能反過來算傷害 |
| modifiers（stat、op、value）／ref、input、算式 | ModifierResource／ExpressionResource | 純數值計算，依 id 查資料 |
| 武器普通／連段／蓄力／特殊／衝刺招 | WeaponResource + MoveResource | 組合以上積木，保留各段初值 |
| 小怪 attack／Boss moves | EnemyResource／BossMoveResource | 穩定 id、形狀、時機、效果、回饋 |
| Boss AI 選招條件、權重、階段、距離、角度 | BossAIResource + AIRuleResource | 純選招與狀態轉換，傳入亂數 |
| 波次時間軸／事件條件、位置、效果、回饋 | WaveResource + WaveEventResource | 保留生成與事件時序 |
| 卡片、流派、中立道具、關卡、生成／遭遇設定 | CardResource／SchoolResource／ItemResource／StageResource／SpawnResource | 以 id 連結共用規則與美術 |
| 美術清單每筆 | ArtResource + SpriteFrames | 原始圖、格子、錨點、動畫；不攜帶戰鬥規則 |

Maker 現存作品先經 `data/schema.js` 的驗證／舊作品遷移，再由將來的匯入器以 id 建立 `.tres`。JSON 的 enum 與 ref 要做白名單轉換；不能將作品字串當作腳本執行。localStorage、觸控、全螢幕、暫停與快取屬平台層，Godot 另行接合。

## 事件與 signal

| 現有規則事件／邊界 | 建議 signal 與資料 | 時機 |
|---|---|---|
| 時機進入 active／weapon-attack | move_phase_entered(actor_id, move_id, phase)、weapon_attacked(event) | 邏輯轉階段一次；在這裡安排命中 |
| damage／onHurt | damage_applied(target_id, amount, position) | 已完成結算後，畫受傷與播聲音 |
| onDeath | enemy_died(enemy_id, position) | 每個死亡只發一次；規則結算掉落 |
| onShot／onChain／onSkillBlast | projectile_created／chain_resolved／skill_blasted(event) | 保留現有順序、範圍與目標 id |
| onPickup／onAcquire／選卡 | pickup_collected／card_acquired(card_id, level) | 完成規則更新後 |
| onPerfectDodge／onRecoveryHit／onInterrupt／onPostureBreak | perfect_dodged／recovery_hit／move_interrupted／posture_broken(event) | 沿用既有規則的單次觸發條件 |
| 衝刺結束、VFX cue、Boss 階段 | dash_ended／visual_cued／boss_phase_changed(event) | 完成該邏輯轉換後 |

參數僅用可序列化 id、位置與數值。未來接收者從 ArtResource 選圖；目前仍沿用既有函式／VFX 資料邊界，不宣稱已全部改成 signals。

## 等價測試與 §11 交接

`tests/art-baseline.json` 記錄本卡改動前來源（分支起點 `6d28ed2838c3af7201305d8332d34faf72017b3c`）的六組 Canvas 指令 SHA-256 與既有 153 組固定亂數戰鬥 trace 的 SHA-256，沒有截圖或個資。六組包含主角／怪物／地面、移動受傷、閃電／旋風／影子、VFX、近戰、完整場景的水球／寶石／命中特效。測試比較重構後固定輸入的輸出；其他既有測試繼續覆蓋老師預警、積木、Maker、觸控等行為。

`tests/art-manifest.cjs` 另測純查詢、非法路徑、未知 id／動畫、負時間、循環／末幀、描述不洩漏可變參照、模擬圖片載入與裁格／錨點／快取／缺格回退，以及動畫 fps 不影響時機狀態。Godot 將相同輸入與預期數字移到 GdUnit 案例，以 `godot --headless --path <project> ...` 執行；GdUnit 的實際 runner 參數留待選定 Godot／GdUnit 版本，這次未執行 Godot 測試。

- §11.1／11.4：新增純美術資料與尺寸／幀／錨點，未全面轉換 defaults.js、未輸出正式 PNG 或原稿。
- §11.2／11.3／11.6：純查詢與等價案例；命中、事件順序與規則不變，未新增戰鬥事件架構。
- §11.5：本卡未改音訊；合成資料與將來 WAV／OGG 匯出仍沿用既有音訊交接。
- §11.7：美術只讀世界位置與時間；未改 CSS、全螢幕、橫向、控制或碰撞尺寸。

Codex 只執行 `node games/survivor/tools/test.cjs`（不加 --layout）。Grok 應補 740×360、1024×461、1180×820 操作與 layout：遊戲、Maker 造型、技能展示、招式練習、HUD 圓形像素按鈕，以及老師／小怪的預警是否與原先相同。

本卡驗證結果：`node games/survivor/tools/test.cjs` 全部通過（exit 0）；`git diff --check` 通過。未執行 --layout 或 Godot；實機與三尺寸操作交 Grok。提交、push、開 PR 由 erin-watch 執行。
