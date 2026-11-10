verdict: approve
cf14bc06f25fcb3cd8b93bd6842950b9b8749350

非作者第一輪審查通過。已核對相對 de8034ecd6f88e26f45bd7076991f0c694da43c3 的完整差異：一行計時文字快取判斷、14行精準回歸測試、版本機械同步與本卡文件。未發現需修改的問題，不擴及整張PR的玩法平衡或合併授權。

實際驗證：

- 已查看 loop 中的快取判斷及所有 statusEl 文字寫入處。當暫停／選卡等覆寫文字時，即使秒數與ETA key相同，下一個正常tick也會恢復；正常秒數前綴與key都相同時，仍保留原倒數DOM。
- 審查員自行執行真正Mac Chrome，740×360、DPR2、獨立profile。使用原DOM開始／暫停／續玩／選卡與確認按鈕，取消動畫排程並以固定小步tick鎖定同秒邊界。暫停與選卡均恢復「0 秒魔王 150 秒後來」，key仍0|150，正常eta DOM身份不變。
- 在同一Chrome以受控時間接近150秒後真正tick生成Boss，倒數消失；Boss在場暫停續玩後顯示「0 秒」，無錯誤倒數。已親看實際截圖。
- Chrome日誌 timer-status-independent.log，exit0；圖片位於私人 timer-status-independent 目錄。這是實際瀏覽器中的受控時間邊界診斷，不是自然長局或觸控硬體驗收。
- 審查員本人在Mac執行 `node games/survivor/tools/test.cjs --layout`，exit0，完整日誌 timer-status-full.log 共136行PASS；包含十尺寸Chrome版面／操作、Maker及新增同秒文字回歸。
- `node games/survivor/tools/version.cjs` 與 `git diff --check` 通過。七個版本／快取檔逐一比對，皆僅20261104g→20261105a字串替換。最終HEAD未漂移，工作目錄乾淨。

沒有修改產品、測試或Git；審查原文存私人檔供主控收錄。此次不再花Dot雲端額度，不聲稱新的Dot或手機硬體驗收；前輪未測範圍仍保留。
