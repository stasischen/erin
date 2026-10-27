verdict: changes
e396d9ebcf6afbdd0acd7170bb120fdc1733b1b8

PR #104，20261027k；獨立審查工作階段（非作者）。本輪新增可重現的 Maker P2；原方向鍵 changes 全文保留於 grok-input-changes.md，該問題已在 k 版獨立重驗修正。

## [P2] 後半場連斬刀數誤用舊布林開關，無法編輯數值

位置：`games/survivor/maker/maker.js:44` 的 range 特例，以及同檔 sequence.phaseCount 的數值欄位呼叫。

range 只要看到 key 為 phaseCount 就建立 0／1 switch；本卡新增的 sequence.phaseCount 卻是 1～8 的整數刀數，預設為 5。兩種不同語意使用同名 key，導致後半場刀數被顯示為「後半場連斬刀數：開」，沒有數值滑桿或加減控制，不能編輯／保存合法的 7／8 連段作品。此問題來自本卡新增的 Maker 呼叫與舊 helper 的碰撞，與已修正的鍵盤問題不同。

### 實際證據與獨立重現

Dot 在正確 k 候選的真實雲端 Chrome、1024×461 frame，經「自己設計 → 老師 → 王的試煉 → 雙刃刺客 → 四拍雙刃連斬」讀到：

- 前半場：數值 slider，值 4。
- 後半場：button／role=switch，文字「後半場連斬刀數：開」，沒有數值 5 或增加／減少控制。
- 在基線即停止，沒有修改草稿或儲存，因此保存／重讀及清理測項未執行；不是授權缺件或使用者操作失敗。

審查員另在私有 VM 載入原始 Maker 程式，重用既有 DOM harness 的 setup，只以正常開啟設計室／切頁事件建立控件，沒有修改 source、test 或 draft。獨立渲染結果與上述真 DOM 一致：

```text
前半場：input type=range value=4 min=1 max=8 step=1
後半場數值控件數：0
後半場：button role=switch text=後半場連斬刀數：開 aria-checked=true
後半場增加／減少按鈕：無
舊「每個階段是否多一個目標」：仍為 switch
```

這不是只測 schema 的推論：已重現實際 Maker 渲染輸出，並核對到 helper 無條件以 key 名稱選布林分支。測試只跑此定點，沒有重跑相同全套或用 Mac 畫面代替 Dot 正式驗收。

### 修正與重審要求

請原作者同分支最小修正，區分舊 phaseCount 的 0／1 布林語意與 sequence.phaseCount 的 1～8 數值語意。須保留舊開關，讓新控件顯示 5，具備正確 range／加減行為；不要僅因 key 同名將新刀數轉布林。

補真 DOM／控件事件回歸：由基線 4／5，先把後半場設 8，再把前半場設 7，經 UI 儲存並重新載入確認 7／8，最後 UI 恢復預設、儲存重載確認 4／5；同時核對舊布林仍為 switch。不可直接寫 draft 或只以純 schema roundtrip 代替。修正後升版、Mac 完整含 --layout 通過，再交新完整 SHA 與固定候選重審。

## 前輪結果與目前 gate

原鍵盤 P2 在 e396 的事件路徑已修正；該 SHA 的獨立 Mac 完整 --layout 為 119 PASS、160 檔 hash 相符，屬前輪程式檢查證據，沒有覆蓋本次發現的後半場刀數控件。舊 j 的 Dot incomplete 與原 changes 歷史均保留。

本輪 Maker changes 是具體產品缺陷，不等同普通戰鬥已完成；Dot gameplay、半血／破架勢／勝利與其他未測項仍 pending，不使用舊版本、Mac smoke 或本次定點補成 PASS。審查員只寫自己的審查檔，不修改實作、測試、卡片或主控交接，不 approve／merge；交回原作者修正。
