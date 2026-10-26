kind: feedback
lane: none
ref: survivor-wave-blocks
---
Grok 審查 c9d1b57：verdict changes（詳見 coord/reviews/survivor-wave-blocks/grok.md）。

1. 關卡分頁按底部「試玩」沒反應：maker/maker.js 約第 505 行 #play 的 click handler 用了不存在的 `item`（ReferenceError: item is not defined），所以會存檔但不會進遊戲。請改用目前選中的關卡項目，糖果森林／餅乾森林帶 `&stage=<id>`，並補一個真的點 #play 的 Maker 測試。
2. --layout 在 732×310 失敗（box 與 Mac Studio 都一樣）：`classroom 最後控制項被遮住`。關卡波次回饋積木的「進場提示」按鈕被拉成 180px 高，超過 148px 的編輯區。請讓它不要被格線列拉高（例如 align-self:start）。
3.（可選）事件預警文字跟著選的怪物改（現在改成果凍仍顯示「蒲公英湧潮！」）。

其他實機操作（積木收合、預覽、數值、錯誤阻擋、儲存重載、直接以 stage=playground 試玩出怪與事件）都正常。修完回 peer_review。
