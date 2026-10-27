# Survivor 美術與 Godot 移植對照

本卡只準備美術接合，沒有開始移植或更改玩法。依據：`coord/inbox/done/20261026T154905Z-parent-godot-art-prep.md`。初版：20261026aw；美術清單 v2：20261027f。

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
| animations | 必備 idle / run / hurt；其他動畫選填，依下節規則回退 | SpriteFrames animation 名稱 |
| frames | 從 0 起，從左到右再往下一列的格子索引 | SpriteFrames.add_frame(AtlasTexture) |
| fps | 每秒幀數；0 為固定第一格 | animation_speed；靜態圖停在第 0 幀 |
| loop | true 循環；false 停在末幀 | animation_loop |
| pivot | 0～1 的美術原點，左上為 [0,0] | Sprite2D.offset／AnimatedSprite2D.offset |
| hitboxAnchor | 0～1，圖的配置錨點；只用於對齊，不能改變命中框 | 視覺子節點與碰撞根節點的相對原點 |
| mode | sprite 可換 PNG；procedural 是保留幾何與複合畫面的查詢邊界，sheet 必須 null | 顯示腳本／預警繪圖節點 |

`lookup(id, animation, seconds, manifest)` 為純查詢，傳回複製的描述；不讀時鐘、不載圖、不動狀態。秒數由遊戲傳入，負值／非有限值當 0。非循環超時停在末幀，未知動畫依下節回退，未知 id 傳回 null。`bounds` 算顯示矩形；沒有覆寫大小時，位移是 `顯示尺寸 × (hitboxAnchor - pivot)`；有 displaySize 時保留舊 hitboxAnchor 世界錨點，再依新尺寸與 pivot 放圖。主角原圖 20×24，顯示 40×48、左上 (-20,-30)，兩個錨點均為 [.5,.625]；老師 52×68；怪物 24×24。顯示尺寸及碰撞半徑維持舊值。

`render/art.js` 才負責圖片載入、切格快取、drawImage、HTML 圖示。人物切格後仍經既有外框／染色／彈跳變換。怪物查詢也供 Maker 預覽共用。現有角色／特效維持原清單與程式佔位圖；四個試煉 Boss 沿用既有 PNG。新增的 sample/player-directions 只供驗證，不預設替換主角；原色盤、幾何與繪圖順序保留。

`layer/*` 是複合繪圖邊界（地面陰影、整群場地、HUD 輔助等），不是一張可覆蓋整群物件的 PNG。角色、水球／敵方彈、寶石、各種 VFX 是可替換的個別美術入口。`scene/world` 包含剩餘 inline UI、血條與幾何標記；這些仍由 procedural 層繪製，移植時重寫平台畫法。背景 PNG 必須維持固定地磚尺寸以保留拼接。

## v2 選填欄位與換圖契約（20261027f）

查詢器接受 schemaVersion 1／2；既有條目不必補新欄位。`lookup(id, animation, seconds, manifest, context)` 是純函式；`picture(id, animation, seconds, context)` 才載圖。context 可傳 direction（S/E/N/W 等）、aim {x,y} 或 angle（世界弧度），以及 phaseElapsed／phaseDuration（秒）。沒有新增欄位或 phaseDuration 時，舊 fps 裁格行為不變。

| 選填欄位 | 預設／行為 |
|---|---|
| directions | 1；可用 1／4／8；世界 +x 向 E、+y 向 S，零向量回 S |
| directionOrder | 實體方向列順序；四向預設 S/E/N/W，八向預設 S/SE/E/NE/N/NW/W/SW |
| mirror | 如 {W: 'E'}，W 使用 E 的格子並水平鏡像；拒絕循環，不再疊加角色原本的左右翻轉 |
| layout | cols／rows 為格數；margin／spacing 為原圖像素、預設 0；未指定時依圖寬高推算 |
| animations.*.frames | 陣列：多方向時每方向一列，索引是該列的欄位；物件 {S:[...],E:[...]}：各方向使用整張圖的絕對索引 |
| displaySize／scale | 顯示世界寬高／正數倍率；未填沿用呼叫端舊大小。保留原世界錨點，碰撞仍用原邏輯半徑；角色、怪物、Boss 與共用 draw 接口都讀清單，舊寫死尺寸只作未設定時的相容初值 |
| animations.*.sheet | 覆寫該動畫的 PNG；省略用資產 sheet，明確 null 回程式圖。所有動畫 sheet 都由同一個 sheetPaths 查詢加入離線快取 |
| frameDurations | 每幀秒數，正數陣列，長度須等於該動畫每方向格數；省略時使用 fps（預設 0）。idle/run 預設循環，其他預設不循環，loop 可覆寫 |
| syncToPhase | windup／active／recovery（含 active_2 等變體）預設 true；傳入邏輯階段總秒數與已過秒數，按比例選視覺幀。未提供總時長時用原秒數／fps，不反向觸發傷害 |
| palette／source | 選填色票及來源資訊，查詢回傳深複製；palette 為十六進位色票陣列／物件，source 為字串／純字串物件。只作美術中繼資料，不改流派／傷害 |
| outline | 省略沿用全域一像素外框；false 取消此資產外框，或 {color:'#26313c',width:1}；全域關閉仍優先。圖片也套用既有受擊白閃 |

支援 death、spawn、phase2、dodge 及 active_2 等合法名稱。缺變體先找基本動畫；death/stun → hurt、dodge → run、spawn/phase2/windup/active/recovery → idle，最後用 idle。載入失敗、格子超出圖片時回程式佔位圖。沒有新增死亡延遲、碰撞框或動畫完成時的戰鬥事件。

### 預警與特效換皮

move/* 若要放圖，須將 mode 改為 sprite；layer/* 複合邊界仍保留原程式繪圖。vfx 選填：

- fitTo：bounds（預設呼叫端矩形）、radius（半徑直徑）、path（origin 到 target 的長條）、native（原生格子 × scale）。
- rotateWithAim：預設 false，true 使用 angle 或 path 方向；所有角度只旋轉美術。
- zLayer：ground／actor／overlay；預設 actor，保持既有順序。一般技能特效可放在角色前後；招式 paint 以 ground 決定在原警示前畫，其餘在原警示後畫，但原地面範圍／缺口函式都仍執行。
- blend：source-over（預設）、lighter、multiply、screen；alpha 為 0–1，預設 1，與既有淡出相乘。
- progressMode：time（預設秒數）、phase（依提供的階段比例選幀）、grow（依比例長大）、fade（依比例淡出）。

補齊 effect/gust、lightning、sparkle、discharge、hammer-swing、maker-ring、burst、impact、perfect-dodge；預設 sheet 仍 null。命中形狀與預警幾何沒有改成圖片輪廓。每動畫獨立圖片、外框、混色與裁格快取只在美術層處理。

### 64×64 方向試作

sample/player-directions 的檔案是 art/samples/player-directions.png：每格 64×64，三列 S/E/N、三欄 idle/run/hurt，W 鏡像 E；含 1px margin 與 2px spacing，整張 198×198。這是原創程式佔位圖，不是正式角色或截圖。`python3 games/survivor/tools/player-directions-art.py` 重產，帶 --check 只比對不寫檔。

### Godot 匯入建議

方向可命名為 idle_S、run_E、active_2_N 等 SpriteFrames 動畫；W 共用 E 並設 AnimatedSprite2D.flip_h。不要再在父節點套第二次水平鏡像。每個動畫的 sheet/layout 對應自己的 AtlasTexture region；displaySize／scale 與 offset 放視覺子節點，CollisionShape2D 保持邏輯尺寸。flip_h、offset、speed_scale 的行為依 [AnimatedSprite2D 官方文件](https://docs.godotengine.org/en/stable/classes/class_animatedsprite2d.html)。

frameDurations 為秒；可設 SpriteFrames animation_speed=1，逐幀相對 duration 使用同一秒值，再以 speed_scale = 視覺總秒數／邏輯階段秒數 對齊階段；idle/run 保持自己的 fps。這是依 [SpriteFrames 官方秒數公式](https://docs.godotengine.org/en/stable/classes/class_spriteframes.html) 推導的匯入方式，尚未實際匯入 Godot。vfx 的 fitTo／rotateWithAim／zLayer／blend／alpha／progressMode 建議對應視覺子節點縮放／旋轉／繪圖層／材質／透明度／階段進度；不建立傷害回呼。

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

`tests/art-baseline.json` 記錄本卡改動前來源（分支起點 `6d28ed2838c3af7201305d8332d34faf72017b3c`）的六組 Canvas 指令 SHA-256 與既有 153 組固定亂數戰鬥 trace 的 SHA-256，沒有截圖或個資。六組包含主角／怪物／地面、移動受傷、閃電／旋風／影子、VFX、近戰、完整場景的水球／寶石／命中特效。戰鬥紀錄在 hash 前將所有數字四捨五入到小數六位（`Number(value.toFixed(6))`），容許不同執行環境的三角函式尾差；Canvas 指令 hash 仍逐值精確比較。`battleNumberDecimals: 6` 記錄此比較規則。修正後的戰鬥基準仍從上述改動前 SHA 的原始碼重新產生，並非採用重構後結果。測試也確認 Grok 提供的兩個尾差值 hash 相同，而相差 0.000002 的值仍可辨識。這只是測試正規化，不改遊戲數值；日後 Godot 等價測試也應明確約定浮點容差。測試比較重構後固定輸入的輸出；其他既有測試繼續覆蓋老師預警、積木、Maker、觸控等行為。

`tests/art-manifest.cjs` 另測純查詢、非法路徑、未知 id／動畫、負時間、循環／末幀、描述不洩漏可變參照、模擬圖片載入與裁格／錨點／快取／缺格回退，以及動畫 fps 不影響時機狀態。Godot 將相同輸入與預期數字移到 GdUnit 案例，以 `godot --headless --path <project> ...` 執行；GdUnit 的實際 runner 參數留待選定 Godot／GdUnit 版本，這次未執行 Godot 測試。

- §11.1／11.4：新增純美術資料與尺寸／幀／錨點，未全面轉換 defaults.js、未輸出正式 PNG 或原稿。
- §11.2／11.3／11.6：純查詢與等價案例；命中、事件順序與規則不變，未新增戰鬥事件架構。
- §11.5：本卡未改音訊；合成資料與將來 WAV／OGG 匯出仍沿用既有音訊交接。
- §11.7：美術只讀世界位置與時間；未改 CSS、全螢幕、橫向、控制或碰撞尺寸。

Codex 只執行 `node games/survivor/tools/test.cjs`（不加 --layout）。Grok 應補 740×360、1024×461、1180×820 操作與 layout：遊戲、Maker 造型、技能展示、招式練習、HUD 圓形像素按鈕，以及老師／小怪的預警是否與原先相同。

本卡驗證結果：`node games/survivor/tools/test.cjs` 全部通過（exit 0）；`git diff --check` 通過。未執行 --layout 或 Godot；實機與三尺寸操作交 Grok。提交、push、開 PR 由 erin-watch 執行。

Grok 浮點尾差回饋修正：本輪僅調整測試、基準與交接文件，沒有更改遊戲資源，資源版本維持 20261026aw。Node 22 本機一般測試結果及 Node 24 待複驗項目見任務卡；Grok 先前的畫面與操作檢查見原審查紀錄，本輪未自行審查或執行 layout。
