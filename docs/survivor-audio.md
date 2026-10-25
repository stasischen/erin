# 小怪獸音效與背景音樂

依家長的 `coord/inbox/done/20261025T151216Z-parent-audio.md` 與 `coord/inbox/done/20261025T160825Z-parent-music-polish.md` 實作。全程 Web Audio 本地合成，沒有外部音檔。

| 曲子 | 調性／速度 | 循環長度 | 播放時機 |
| --- | --- | --- | --- |
| 糖果森林 | C 大調，128 BPM，跳拍旋律 | 75 秒 | 第一關 |
| 餅乾森林 | D 小調，136 BPM，切分低音與八分踩鈸 | 約 70.6 秒 | 第二關 |
| 老師戰 | A 和聲小調，144 BPM，推進低音 | 約 66.7 秒 | 老師出場和戰鬥 |

每首 40 小節：前奏 4、A 8、B 8、A' 8、橋段 4、尾奏 8。前奏／橋段減少鼓與和聲，B 段換旋律，A'／尾奏有旋律轉折和八度變化，段落末加小鼓過門。`engine/music.js` 的 `songs`、`motifs`、`rhythm`、`chords` 與 `form` 定義曲子，編譯為每格含樂器、MIDI 音高、長度與力度的事件資料；新增曲子可沿用相同引擎。

暫停、升級選卡、關閉音樂、Maker 與切到別的 App 時立即停止音樂排程及已排程音符，保留曲中位置；恢復後接著播放，避免每次升級都重聽前奏。結算清除位置，下一局從頭播放。換關倒數仍播放音樂，普通關卡與老師戰／下一關切換採一秒交叉淡入淡出，每次最多兩首曲子。沒有背景自動播放，只有按下「開始遊戲／繼續遊戲」才建立或恢復 AudioContext。不支援音訊或恢復播放失敗時仍可玩遊戲。

設定內有分開的圓形像素音樂／音效按鈕，以圖案、淡化與 aria-pressed 表示開關，並提供繁體中文 aria-label/title。兩個開關沿用裝置設定的 localStorage；讀寫失敗不會中斷遊戲。舊版音效偏好保留，新音樂預設開啟。Maker 試玩的設定沿用原有隔離規則，不寫入一般遊戲偏好。

## 音效 id 與調整

一般腳本共用 `window.Survivor.audio.play(id)`，Maker 的未來音效欄位可引用這些 id，本次沒有新增 Maker 編輯欄位或更動作品 schema。

| id | 使用時機 |
| --- | --- |
| shoot / water | 發射水球／水花與泡泡技能 |
| hit / death | 命中／敵人消失 |
| xp / levelup / select | 撿經驗／升級／選定卡片 |
| dash / lightning / explosion | 衝刺／閃電／泡泡爆炸 |
| warning / hurt | 老師出場與招式預警／主角受傷 |
| win / over / click | 最終過關／遊戲結束／介面按鈕 |

`engine/audio.js` 的 `sounds` 是音效資料表，包含 ZzFX `params` 和每種音效的冷卻秒數 `cooldown`。`tuning` 包含音量、最多 8 個同時音效、單一音效最多 2 個。播放前先檢查上限與冷卻，首次產生樣本後快取；關音效會立即停掉現有音效。音樂獨立音量維持 0.035，音效維持 0.35；主旋律／和聲／低音用三角波，琶音用低通方波，鼓組由同一份固定噪音經不同濾波產生。每個音符都有起音、衰減、延音和釋音包絡，音符結束斷開節點。兩組音量匯入共用 WaveShaper 軟限幅器，曲線絕對值小於 0.95，保護交叉淡入期間及密集音效的總輸出；實際音量舒適度仍待 Erin 試聽。

排程每 80ms 預讀 0.2 秒，不逐幀建立音訊環境；主執行緒延遲時跳過錯過的拍子，不瞬間補播。交叉淡出完成後清除舊曲節點；隱藏、暫停、關閉音樂會立即清掉所有曲子和 timer。遊戲結束／過關短音效繼續走獨立音效通道。

ZzFX 本地改編與完整 MIT 授權見 `games/survivor/assets/CREDITS.md`。本地檔案由 manifest 載入並納入 Service Worker，沒有外部音檔、CDN 或網路音訊依賴。

## 之後換成 Erin 的 BeepBox 音樂

Erin 和家長完成 BeepBox 作品後，將音樂匯出 WAV，放到：

- `games/survivor/assets/audio/erin-stage.wav`：普通關卡（原有約定路徑保留；兩關若要使用不同音檔，另由 Erin 決定）。
- `games/survivor/assets/audio/erin-boss.wav`：老師戰。

這兩個路徑是未來交接約定，目前尚無檔案，也不會嘗試載入。屆時另張卡把 `songs`／`pump` 替換為本地音檔循環，保留第一次點擊解鎖、獨立開關、暫停、展示靜音與音量限制；在 CREDITS 記錄作品來源，再將檔案加入 Service Worker 並更新版號。要用哪段曲子由 Erin 決定。

## 驗證與待試玩

執行：`node games/survivor/tools/test.cjs --layout`。

`tests/audio.cjs` 使用不發聲的模擬 AudioContext，檢查 15 組有限數值樣本、快取、冷卻、每種／全域播放上限、獨立開關、設定遷移、儲存失敗、三首曲子時長與完整曲式、七種配器、A' 變化、每首超過一輪的排程、96 秒連續排程的節點上限、ADSR 有限數值、限幅曲線、關卡一秒轉場、結算音效、升級暫停 17 秒後續播，以及不支援音訊的裝置。技能展示以 PREVIEW_MODE 阻擋建立 context；Chrome 版面測試另在載入前設 `SURVIVOR_AUDIO_MUTED=true`。其他 VM 測試沒有 AudioContext，不會發聲。

本次已執行完整 `--layout`：版本與所有邏輯／音訊測試通過；真實 Chrome 啟動時 SIGABRT，版面測試未完成，因此整體命令退出碼為 1。這個結果不能當作版面或真實裝置聽感通過。Grok 獨立審查後，仍需家長與 Erin 在可啟動的 Chrome／iPad 試聽三首完整曲子、轉場、音效清晰度、開關、暫停／升級／切 App 續播及 PWA 更新後離線；曲調、節奏、音量喜好由 Erin 決定。
