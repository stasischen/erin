# Dot：PR113 可讀性修正審查與雲端實測

2026-11-05。沿 survivor-upgrade-balance 原卡，審查 Claude 已提交的改動；不是重啟舊 THREAD 的364bc0版升級實作。

## 固定來源

- PR：https://github.com/stasischen/erin/pull/113 （草稿，不合併）
- 分支：codex/survivor-upgrade-balance
- source：5607ab95ef2a1fb6bdda9528dc6713b58654c4c9
- base：abf769b58c8bae3546e8209f58505e37931c66ef
- 版本：20261104g
- canonical卡：coord/tasks/survivor-upgrade-balance.json；規格：coord/tasks/specs/survivor-upgrade-balance.md。送件留言另外綁定更新後metadata SHA。
- 測試頁：https://stasischen.github.io/erin-preview/pr-113/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/
- manifest：https://stasischen.github.io/erin-preview/pr-113/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/preview-manifest.json
- manifest SHA256：27cdef15e48e0155eadde91053d95a65877f675e8284ae9c9d68306acb08a52b

## 審查及實測

請核對來源與實際原生工具範圍，使用自己的雲端瀏覽器，不使用連接的Mac／Windows執行器。既有正常隔離遊玩及隔離Maker草稿授權沿用；不擴及正式站、原作品、repo寫入、安全設定或合併。實際平台拒絕請如實回報，不繞過，也不把本文件當作擴權。

1. 讀固定diff與下列來源，審查魔王倒數、低血量紅框、普通敵傷害字合併、物件池引用清理。不改碼，有問題附重現。
2. 在1024×461、740×360、1180×820實際試玩，記錄frame真innerWidth／innerHeight／DPR，另列外頁viewport及原生Fullscreen狀態；不用縮放代替尺寸。
3. 無query測試頁按「開始生存」：直接水球自動攻擊，抽到武器後最多三把。記錄實際URL與入口；Boss試煉及Maker舊「試玩」保留手動，不當成生存模式。
4. 倒數及HUD不重疊，倒數隨時間降低；暫停／續玩／重開正常，老師登場後倒數消失。未自然玩到登場就寫未測，不以短局冒稱通關。
5. 低於30%血量紅框、恢復及重開解除、操作不被擋；減少動態時靜態。普通同敵短時間命中合併傷害字，Boss／試煉Boss／精英／大熊仍分筆。不能可靠觸發或辨認就寫未測，區分自然操作與受控診斷。
6. 正常移動、自動攻擊、衝刺、大招、升級選卡、暫停續玩及必要重試。開始頁沒有Maker，設定內有「自己設計」。若改Maker，只用manifest綁定候選的隔離草稿，記錄並恢復預設；沒有改就說沒有改。

## 回覆

Mac非作者測試由主控送件留言列出，不是Dot證據。舊f版approve不覆蓋g版。最多兩輪；第二輪只阻擋正常流程中斷或資料損壞，其餘列FOLLOWUPS，不新增流程。

請回完整source SHA、URL、三尺寸、各項PASS／FAIL／未測、重現／截圖來源、儲存修改及清理、原生工具限制。程式審查與雲端試玩分開判定。有bundle附實際SHA256，沒有就明寫沒有。不合併、不另叫writer。回覆同一THREAD，最後NEXT: human，由主控收件。

## 固定改動檔案

- `games/survivor/engine/combat-damage.js` | 14397 bytes | SHA256 `162d248328217dcd4098b5464c17039750129b3cf0c2a0842d7af9fb27c2e5f9` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/engine/combat-damage.js
- `games/survivor/engine/loop.js` | 21810 bytes | SHA256 `2b77233a2d1b30f0f67b07085a0ca0eda65004a80a66bb7ab010d24a56794dff` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/engine/loop.js
- `games/survivor/engine/state.js` | 23099 bytes | SHA256 `3725ab8bc13f604887eb8ac870e4498961e4ee4e4e3011ef5857d6e78ea4c0b4` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/engine/state.js
- `games/survivor/index.html` | 11362 bytes | SHA256 `2b8bac5cb04237cb93f9467891a09c9713f97541e25339899841e02adf717d85` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/index.html
- `games/survivor/practice-host.js` | 2710 bytes | SHA256 `9f04c3dd05dc79e88595c6632c331ed958ca1a6bf8fdd83080cc0df0e4e57b40` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/practice-host.js
- `games/survivor/practice.html` | 4425 bytes | SHA256 `8e883c16d674119e667ac6e1d29a571ff6317608f2054d7f31e9b3129c9d1c81` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/practice.html
- `games/survivor/preview.html` | 2588 bytes | SHA256 `8795d072a82ff3b82ed43d7c574c7e4c4bdb7b252eec513645c61adeb3bcc3e7` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/preview.html
- `games/survivor/preview.js` | 13403 bytes | SHA256 `54a681fd4103565435ff64ab713705e0395c09b86c62977fbaa3317e9147acb4` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/preview.js
- `games/survivor/render/hud.js` | 11331 bytes | SHA256 `ce684d5c83760f0994066f0b2442ad650740b4d8a54e6c1f5e3d91ccdef95078` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/render/hud.js
- `games/survivor/style.css` | 31135 bytes | SHA256 `2476dc70d02293a2c8999de98bbee6fd9be4092dc618e5d0f70e6f871c7ad613` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/style.css
- `games/survivor/tests/levelup-layout.cjs` | 32172 bytes | SHA256 `9d7ca043cd12cfa7f155b449eeffa8d26bef12c24880bea3b97bde7159984aa2` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/tests/levelup-layout.cjs
- `games/survivor/tests/player-readability.cjs` | 3131 bytes | SHA256 `8c879f1279feb2d3e2b4a1c0fc0684477c20b734ef66b6afc79a06bf3a4f3cbd` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/tests/player-readability.cjs
- `games/survivor/version.json` | 29 bytes | SHA256 `464f2b456bddc18271ffcd55ab7e2fa1e8e00397e139d1516c06a76214af9786` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/games/survivor/version.json
- `sw.js` | 7212 bytes | SHA256 `09c8bac66230685a02c0c434530934511779e3aae4a90e001f25749b2f84ebce` | https://github.com/stasischen/erin/blob/5607ab95ef2a1fb6bdda9528dc6713b58654c4c9/sw.js

## 主控送件證據

非作者Mac首輪approve，本人完整套件exit0／136PASS；詳同目錄readability-review.md。候選本機125檔／920runtime請求與七key隔離通過。Pages41882567310成功，預覽提交5120378237c27743604b62a8f7ee553edea60e51，既有1858檔保持，新增122候選檔。公開Chrome740x360自然33秒／兩次升級／第二波／技能／暫停續玩exit0。公開全檔逐位元核對未完成：Python連線重設，另一次Chrome載入逾時，已停止重試；不能宣稱122公開檔全驗通過，請Dot先核雲端可達與manifest。
