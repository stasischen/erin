# 小怪獸音效與暫時音樂

依家長的 `coord/inbox/done/20261025T151216Z-parent-audio.md` 實作。

目前兩段背景旋律都是暫時版本，供 Erin 試玩：普通關卡使用平靜循環，老師出場與老師戰使用較緊張循環。暫停、升級選卡、換關、結算、Maker 與切到別的 App 時停止音樂；回到遊戲後從該段開頭播放。沒有背景自動播放，只有按下「開始遊戲／繼續遊戲」才建立或恢復 AudioContext。不支援音訊或恢復播放失敗時仍可玩遊戲。

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

`engine/audio.js` 的 `sounds` 是音效資料表，包含 ZzFX `params` 和每種音效的冷卻秒數 `cooldown`。`tuning` 包含音量、最多 8 個同時音效、單一音效最多 2 個。播放前先檢查上限與冷卻，首次產生樣本後快取；關音效會立即停掉現有音效。音樂使用獨立的低音量 GainNode，排程只預讀 0.2 秒，每拍一個旋律音、每四拍一個低音，不會逐幀建立音訊環境。停止或換曲會清除排程和音符。

ZzFX 本地改編與完整 MIT 授權見 `games/survivor/assets/CREDITS.md`。本地檔案由 manifest 載入並納入 Service Worker，沒有外部音檔、CDN 或網路音訊依賴。

## 之後換成 Erin 的 BeepBox 音樂

Erin 和家長完成 BeepBox 作品後，將兩段音樂匯出 WAV，放到：

- `games/survivor/assets/audio/erin-stage.wav`：普通關卡。
- `games/survivor/assets/audio/erin-boss.wav`：老師戰。

這兩個路徑是未來交接約定，目前尚無檔案，也不會嘗試載入。屆時另張卡把 `songs`／`pump` 替換為本地音檔循環，保留第一次點擊解鎖、獨立開關、暫停、展示靜音與音量限制；在 CREDITS 記錄作品來源，再將檔案加入 Service Worker 並更新版號。要用哪段曲子由 Erin 決定。

## 驗證與待試玩

執行：`node games/survivor/tools/test.cjs --layout`。

`tests/audio.cjs` 使用不發聲的模擬 AudioContext，檢查 15 組有限數值樣本、快取、冷卻、每種／全域播放上限、兩個開關互不影響、設定儲存與舊設定、儲存失敗、關卡／老師曲切換、暫停／升級／隱藏頁面，以及不支援音訊的裝置。技能展示在核心音訊入口以 PREVIEW_MODE 阻擋建立 context；Chrome 版面測試另在載入前設 `SURVIVOR_AUDIO_MUTED=true`。其他 VM 測試沒有 AudioContext，不會發聲。

本機完整測試中的邏輯測試已通過；真實 Chrome `--layout` 啟動時 SIGABRT，尚未取得版面測試結果。自動測試不代表真實裝置聽感或 Safari 播放政策驗證；Grok 審查後請家長與 Erin 在 Chrome／iPad 試玩，確認開始才出聲、音量舒服、兩種旋律能分辨、關開開關、暫停與切 App 後恢復正常，及 PWA 更新後離線可用。曲調、音量與音效喜好由 Erin 試玩決定。
