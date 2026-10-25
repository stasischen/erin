# 選卡版面與效果展示調整驗證

依據 `coord/inbox/done/20261025T120807Z-parent-levelup-polish.md`。任務 `survivor-levelup-polish`，目前分支 `codex/survivor-levelup-polish`。

## 修改

- 三張卡平均並排，填滿左欄高度；右欄分成效果展示及 64px 操作列。「選這張」與技能樹放在同一操作列。打開技能樹時在右欄顯示可捲動內容，點摘要即可收回。
- 標題與操作提示共用一列，移除舊版靠上對齊與展示 480px 寬度限制。展示隨框比例調整鏡頭，避免留白或拉伸。短面板仍有展示，卡片長說明保留於展示說明與技能樹。
- 普攻展示按 iframe 實際大小使用 2.5 倍鏡頭。三隻假怪從第零格即已定位，停用追蹤移動、固定每幀顯示位置與鏡頭；命中閃白、子彈、傷害效果仍使用實際遊戲引擎。移除先向下走路的示範。每三秒重設時回到相同位置。
- 大海嘯、衝刺及老師招式使用較寬鏡頭；範圍效果依設定半徑預留空間。血條僅在回血或護盾示範顯示，減少遮住發射和命中。
- 資源版本 `20261025v`，Service Worker `erin-games-v26`。

## 已執行

- `node games/survivor/tests/skill-preview.cjs`：66 個卡片／積木／老師場景及既有選卡操作通過；新增普攻在 t=0、命中後及三次循環的假怪座標相同、固定鏡頭、水球真實命中、普攻 2.5 倍及巨浪放寬取景檢查通過。
- `node games/survivor/tests/preview-host.cjs`：單一 iframe、資料隔離、版本網址、停止與重新載入通過。
- `node games/survivor/tests/clean-hud.cjs` 通過。
- JS 語法檢查與 `git diff --check` 通過。

## Grok 必須補做

`node games/survivor/tests/levelup-layout.cjs` 在本機 Chrome 啟動時 **SIGABRT**，未產生任何排版通過結果。另嘗試用瀏覽器工具開啟本機 HTML，被工具的 URL 安全政策拒絕（不允許 file 協定），未繞過限制。這些限制不影響本機邏輯測試，但目前不能宣稱手機畫面驗證通過。

排版測試涵蓋 412×915 直拿旋轉、915×412、800×360，另保留 384×832 與 732×310，DPR3 與實際觸控事件。新增：前三個要求尺寸展示框至少佔面板 40%、三卡同列同高、面板未被卡片／展示／操作列／標題提示占用的區域不超過 18%、iframe 填滿展示區。18% 為本次實作採用的可量測留白門檻，原要求未指定數字；此數字不代表畫布內背景的像素占比。畫布內構圖需配合實機目視確認。iframe 隨框取景，不再要求 iframe 固定為 16:9。

請 Grok 以 erin-watch 提交的完整 SHA 獨立審查並在可執行 Chrome 的環境補跑；家長與 Erin 實機確認三卡、發射命中構圖、順暢循環、技能樹展開收回與確認鍵。沒有新增需要 Erin 決定的遊戲設計。commit、push、PR 由 erin-watch 代辦；未操作 main。


## 2026-10-25 Grok changes 修正

依據 `coord/inbox/done/20261025T121514Z-grok-levelup-polish-feedback.md`，針對 Grok 在 SHA `6023880e72f4f15a4567850d4f556fa07dd69e82` 提出的問題：

- 面板 padding 由 8px 縮至 4px；移除工作區重複的 4px padding；標題列、兩欄、卡片與操作列間距統一為 4px。保留 64px 確認按鈕、字級、18% 空白門檻及原有展示面積要求。縮減邊距騰出空間給卡片及展示。
- Maker 測試依 shell 的橫向排列方向比較：一般橫拿比較螢幕 x 軸，直拿順時針旋轉比較螢幕 y 軸；確認清單結尾不超過編輯欄起點，避免相同 left 導致誤判，也保留兩欄不得重疊的檢查。
- 排版測試在每個尺寸輸出展示與空白比例；失敗仍直接報錯，未放寬驗收門檻。
- Chrome 清理先等子程序 exit，再刪暫存 profile；短暫檔案競爭使用有限次重試。
- 非必要建議的擊退／拉回移動本輪未更動，仍依原始要求保留假怪固定位置；其視覺表現可由 Erin 試玩後回饋。

本輪重新執行 `skill-preview.cjs`（66 場景與選卡、固定定位／鏡頭）、`preview-host.cjs`、`clean-hud.cjs` 全部通過；`node --check games/survivor/tests/levelup-layout.cjs` 與 `git diff --check` 通過。

重新執行 `node games/survivor/tests/levelup-layout.cjs` 仍在 Chrome 啟動時收到 `SIGABRT`，退出碼 1，未進入尺寸迴圈；本輪不能宣稱五種尺寸的空白比例與展示面積已通過。Grok 曾在沙盒外成功啟動 Chrome，請對 erin-watch 本輪提交的 SHA 重跑五種尺寸（412×915、384×832、915×412、800×360、732×310），並確認不再出現旋轉 Maker 誤判及清理錯誤。家長與 Erin 再實機確認構圖與循環。
