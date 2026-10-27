verdict: approve
15b7b4b420de212d5589e2adfc06bbf133137df3

PR #104，版本 20261028b；不同工作階段的非作者 Mac 整張 PR 最終審查。此判定不是 Dot 對自己 patch 的批准，也不以 Luna 的局部 patch 審查取代整 PR 審查。

## 來源與完整程式審查

實際受測／公開候選 source 為 13851b6fd7c9f7683231b36c9e2613c30f050909。至本次被審 HEAD 只有 coord/handoff/latest.md 與正式任務卡的狀態／證據彙整，已看完整差異；161 個 source/test/cache 檔 SHA-256 逐 byte 相同，工作樹原先乾淨。已重看相對 main 2652f7603294068631b068223bc770c23d33a61a 的累積差異，包含 defaults/schema/migration、trial-blocks、gallery/encounters、loop/state/posture/combat/weakpoint、render/art-manifest/assets、input、Maker、HUD/CSS、manifest/cache/version 與測試／文件。沒有待修的阻擋問題。

四／五刀由共用狀態機鎖定開招刀數並逐刀產生預警／傷害；半血嚴格小於 50%，既有連段不因中途跨半血加刀。逐刀閃避信用、預設兩格衝刺回充與第四次完美閃避破架勢取消後續刀均有實際引擎回歸。背後換位限制在實牆內、消失不可被攻擊、白閃在刺擊前、苦無發射與側滑的事件順序已核對。真正 posture-break 訊號且紅弱點命中的 charged 才額外乘 1.5，與 critical3 合計輸入傷害 4.5，不再重乘老師3。紀錄只接受有效成功且更快的值，逐王與 normal/Maker 分流；入口／暫停不計時、慢動作不縮短活動秒數。

方向鍵釋放的鍵名修正已核對真註冊事件回歸。Maker 舊0／1 phaseCount switch與新1～8刀數 slider已分開，數值／增減／保存／重讀／恢復的實際控件證據與舊開關回歸通過。HUD保留 normal armor 公式，試煉逐actor血條與存活者身份分開，保留身體架勢／弱點預警；normal結算刷新走真正 showOverlay 接點。

HUD首patch綁 base9ae7e85ef8aadd33dab6458746e596c3cafa2ead、12960 bytes、SHA256 55fa253feb96798966e3daf1eb0bef8c0b737b13f1daf76ff410112058c8d777。normal結算補件綁 base842f021183223a7b7b961bd61d9c81b6a975fb82、3495 bytes、SHA256 380960603244a4c541b9ad9be79f30b81350cfc9ce05bc82cffc675dc4226508。已獨立核對精確patch、pre/postimage及機械升版；Luna獨審／套用紀錄與before-fail/after-pass證據一致。主控沒有另補邏輯後自批。Maker專用finishRun分支未改，本補件不冒稱該分支已實測。

## Mac 獨立測試

本審查工作階段已在受測 source 執行 node games/survivor/tools/test.cjs --layout，exit0，73個測試檔／123行PASS，含真Chrome layout及production finishRun/showOverlay回歸；161檔測前後hash一致，git diff --check通過。完整日誌留Mac私有目錄。先前j/k/a各輪結果保留為歷史，不拿來冒充b；本次後續僅coord／審查metadata變動且hash相同，沒有無意義重跑整套。沒有新增GitHub CI測試。

## Dot 確切候選功能證據與判定

已讀取並核實13851b6／20261028b綁定的正式結果、來源／request／manifest／bundle與收件紀錄，保留原始失敗／未完成／格式隔離歷史。公開候選固定PR/SHA，所有草稿操作皆在隔離namespace；不接觸正式站、原作品或安全設定。

- 初輪b：真實1024×461、740×360、1180×820 iframe的HUD幾何、canvas滿框及控制分離有直接證據；雙子HUD bottom106。Maker五值先後半8再前半7、armor.25／critical4／charge1.8，真UI保存／reload／reset／reload恢復通過。當輪兩次刺客未通關，維持incomplete，沒有追溯改PASS。
- normal完整一局：UI auto、固定糖果大劍、pause-assisted，未改Maker或戰鬥數值，真刺客勝利；最佳52.56秒，reload保留，其餘王為—。不是default-manual或不中斷難度測試；較早主動退出probe不是死亡。
- Fixture A：CUSTOM僅共用recoveryGain12→100，從真正Maker Play載入全稿。四個Boss encounter×三真實尺寸共12格操作／真正架勢暈眩。1024刺客真紅窗，切manual後新按J750ms充放並實際命中。雙子1024兩actor各自受傷／暈眩，Fire死亡後只留Ice93%；740及1180只證明Ice暈眩，不宣稱Fire也測過。Maker真勝利13.01／reload，正常仍52.56／reload。原結果enum不合法隔離，Dot格式重發後正式收件；實質欄位完全相同，不在本機改raw。這是fixture_a_only，whole_pr=false。
- Fixture B：真1024×461，CUSTOM只連斬windup2／active.5及三招damage1；HP1600、count4/5、架勢、位移與選招未改。HP100時四組、HP47時五組各自red→orange→整組收招，停止攻擊／Space、posture0，不把玩家1/3當刀數。開放場地背後重現→白閃→橙刺直接觀察；近牆另捕消失→場內重現→白閃→受擊，該次橙刺未拍，不冒稱全捕。苦無有扇形預警、五枚彈體及後續側滑；不聲稱肉眼證明同幀微序。這是fixture_b_visual_only，whole_pr=false。
- A/B均UI Reset→Save→reload逐項核對恢復，manual1、normal52.56與Maker13.01保留；沒有pending edits／live run，自己的測試tab已關閉。

正式卡要求三尺寸實際打過每個Boss並觸發架勢暈眩，沒有要求每格default-manual通關。上述真normal勝利與紀錄、CUSTOM完整12格／紅窗／招式可見鏈路，加上獨立Mac預設規則與真引擎回歸，共同滿足本卡功能gate。沒有把CUSTOM調值宣稱預設節奏／平衡已驗收，也沒有以作者局部scope結果自行批准整PR。精確4.5×、嚴格半血與跨半血鎖定、精準暫停計時及較快才覆寫由Mac對應測試證明，不以浮字／肉眼補造數學證據。

## 限制與非阻擋小毛病

1180×820為真iframe；外層1180×757須捲動看上下，不是原生fullscreen，也不冒稱全尺寸同時可見。雲端以暫停輔助操作，未證明不中斷default-manual難度或Erin的平衡感受。近牆橙刺單幀未捕、發射先於滑動的同幀微序及clamp精確算術由既有Mac測試補足。normal老師／熊結算用production-path回歸與三尺寸Chrome工程證據，不冒稱Dot實打普通波次。Godot未實機執行。

影步active旁文顯示.12，range可及性值.1；此generic滑桿步進.05的表示差異在起始與清理相同，該值未被編輯，無資料被改的證據。作為非阻擋可用性觀察保留，不擅改來源。沒有已確認且待修的產品缺陷。

## 歷史與合併條件

前輪Maker changes原件保留於grok-maker-changes.md；方向鍵changes在grok-input-changes.md。新結果解除目前功能缺證，不抹除舊j/k與各輪限制。AGENTS／workflow的本輪家長授權與非作者角色分工已核實；不擴張安全設定或後續卡範圍。

此approve綁上述完整HEAD。接下來只可提交本審查／歷史存檔，重新核對新HEAD僅review metadata且161檔不變，再依既有家長六卡授權match-head merge。共用作者帳號拒絕GitHub正式approval時須誠實以獨立session PR留言記錄；不冒充GitHub approval。合併後等確切mergeSHA的既有Pages成功，實際開正式首頁／遊戲確認20261028b；未完成部署核對前不得宣稱已上線，不開下一卡。
