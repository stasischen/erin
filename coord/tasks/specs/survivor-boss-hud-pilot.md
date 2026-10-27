# PR104 Boss 血條位置修正：新流程試接契約

狀態：已補齊輸入，待 Dot 重新評估；不是已採用、已修改或已驗收。這是 survivor-boss-gallery-3／PR104 的同分支修正，非並行新卡。

## 固定來源與可改範圍

repo stasischen/erin，branch codex/survivor-boss3，現有來源基線54564e6a4a2308b6718fa24b8f1a1331a05fa4f3／20261027l。實際patch完整base以本次凍結送件的source_commit為準；本文件後續提交僅改coord，送件附每個原檔的完整raw URL、byte數與SHA256，新增檔必須不存在。Luna套用前branch HEAD必須等於該base，不靠模糊匹配或靜默rebase。

只允許Dot提出以下檔案的patch：

- games/survivor/render/hud.js
- games/survivor/render/gallery.js
- games/survivor/style.css
- games/survivor/index.html
- 新增 games/survivor/tests/boss-hud.cjs（由現有測試runner自動發現）

其他引擎、資料、Maker、輸入、儲存與玩法不改；若確實需要擴大範圍，先回具體原因，不自行擴檔。版本同步由Mac另外執行既有version工具並標示產生差異，Dot不要順手改版本。共用HUD實作應讀現有trialBodies／actors，不硬寫另一套戰鬥資料或每個Boss獨立renderer。

## 驗收

1. 移除Boss身體下方隨世界座標移動的HP長條；保留身體弱點標記、預警、美術與原有架勢回饋。不改傷害、血量、護甲、架勢、難度或鏡頭。
2. 固定上方HUD可辨識每個存活Boss的HP。單體正確顯示；冰火雙子同時可分辨兩個角色及各自血量，不以第一隻／合計HP冒充兩隻。減血、單隻死亡後剩餘角色、全數死亡與離場均無殘留／錯配；不要修改戰鬥狀態來讓顯示通過。
3. 1024×461、740×360、1180×820皆實測：HP區塊留在上方（safe-top=0時底緣<=110px）、不碰玩家血條、右上回家／暫停、動作按鈕；名稱與血條不互壓、不超出viewport、不攔截遊戲指標輸入，畫布仍填滿原可視遊戲區，無新增黑邊或縮放。其他safe-area遵循現有env inset。
4. 刺客、冰火雙子、既有老師／守門人與糖衣熊顯示回歸；一般模式既有護甲計算不變。暫停／繼續、死亡重試、離開回選單、切換Boss後不殘留前一場名稱／HP；沿用既有選單與遊戲操作，不加測試作弊入口。
5. 新測試針對角色血量／身份映射與離場清理等實際風險，不只比對函式字串。Mac完整node games/survivor/tools/test.cjs --layout全PASS，另以實際DOM幾何確認三尺寸；Dot用自己的雲端電腦驗公開固定候選，誠實記錄frame／外頁／原生fullscreen差別與未測。

## 角色與停損

家長已指定Dot出patch、Luna審查後Mac套用、Dot驗測試版、Mac合併。主控已實際安排獨立Luna並完成只讀就緒檢查：正確repo／分支／完整基線、Node／Python／Git／Chrome存在；未套用不存在的patch或聲稱已測新功能。主控已能push此工作分支，既有preview工具與部署流程可用；既有非作者Mac審查員已確認Maker專項收斂，等待最終組合SHA，保留整PR104審查／合併gate。配置的模型角色與實際工具檢查分開記錄，不宣稱證明隱藏後端身份。

Dot提供UTF8／LF unified diff（含final LF）、原檔hash、patch byte數／SHA256、改檔清單、預期postimage hash與真實自查／未測清單。Luna先對base與patch hash獨立判定，再git apply --check與精確套用，不能自創邏輯後自批；有錯退回Dot同卡修。Mac保留版本／完整測試／Git／PR／發布權限，Dot不需repo寫入權。新增實質修改重新綁定SHA；Dot自身瀏覽器測試不算獨立code approval。非作者Mac在完整證據後match-head merge、等Pages成功與正式版本確認。角色失聯、base漂移、套用／測試／QA失敗均停在同卡交接，不跳門、不加CI、排程或模型輪詢。

Dot已確認原生常設範圍含後續隔離候選的完整實際測試；仍不碰正式站、原作品、repo寫入或安全設定，平台實際拒絕照實回報。早期Maker-only拒絕與未完成遊戲證據保留；新授權不是舊測試PASS。
