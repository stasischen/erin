verdict: changes
cd1d2a46c264b1712e1b6e47399dd9397f3001fd

PR #104，20261027j；獨立審查工作階段（非作者）。本次 changes 包含已定點重現的既有鍵盤問題，以及仍未完成的 Dot UI 驗收；兩者分開判定。

## [P2] 方向鍵放開後沒有移除按鍵狀態

位置：`games/survivor/input.js:39`，對照同檔 keydown 與 movementInput。

keydown 保留多字元鍵名，例如 `ArrowLeft`；keyup 卻一律呼叫 `toLowerCase()`，變成 `arrowleft` 後才 delete，因此刪不到集合內的原值。四個方向鍵放開後都會繼續移動；反向方向鍵可能互相抵銷，影響本卡鍵盤試玩與雲端正常輸入驗收。請讓兩條事件路徑使用一致的鍵名正規化，並保留大小寫 WASD 及 J／K 放開攻擊的既有行為。

這是 **baseline bug，並非刺客新增的回歸**：本卡 HEAD 與基底 main `2652f7603294068631b068223bc770c23d33a61a` 的 input.js blob 均為 `bd28aeb0ae61341337bb8e775b24940632f576fe`。家長已授權本卡相關小修，故交原作者在同一分支修正，不另開卡或擴大重構。

### 獨立重現與對照

定點測試只在私有 VM harness 增加 window 事件 callback 的記錄器，遊戲原始碼原樣載入，沒有改 repo 程式或測試，也沒有偽造 movementInput 結果。起始為 playing、設定頁關閉、BODY 焦點、沒有搖桿輸入，向實際註冊的 handlers 送入 keydown／keyup：

| 事件配對 | 放開後實際 movementInput | 放開後預期 |
| --- | --- | --- |
| ArrowLeft down → up | `{x:-1,y:0}`，keys 仍有 ArrowLeft | `{x:0,y:0}` |
| ArrowRight down → up | `{x:1,y:0}`，keys 仍有 ArrowRight | `{x:0,y:0}` |
| ArrowUp down → up | `{x:0,y:-1}`，keys 仍有 ArrowUp | `{x:0,y:0}` |
| ArrowDown down → up | `{x:0,y:1}`，keys 仍有 ArrowDown | `{x:0,y:0}` |

- WASD 四鍵及大寫 A 對照均可正確清除並回到零輸入。
- 每個方向鍵按住 → 真正 Escape 暫停 → 放開 → 恢復，均回到零輸入；這是暫停清鍵的效果，不能當成 keyup 正常。
- ArrowLeft 按下、放開後再執行真 `tick(.05)`，玩家 x 仍減少 9.5 世界單位，確認影響實際移動而非只有集合殘值。
- 瀏覽器可依相同步驟定點複驗：進入遊戲，按一下方向鍵後放開，不按其他方向；應立即停下。修正需覆蓋四箭頭、重複 keydown、大小寫字母與暫停／失焦清鍵。

## 已完成的程式檢查與未完成的 UI

- 前輪對上述 SHA 的獨立 Mac `node games/survivor/tools/test.cjs --layout` exit 0、118 PASS，159 檔 hash 一致，diff check 通過。既有全套未捕捉這次事件配對問題；本次只跑定點重現，沒有無故重跑相同來源全套。
- Dot 本候選結果為 changes／incomplete_evidence：有三尺寸真 iframe 幾何、選單、進場及基本輸入紀錄，但未取得完整連斬、逐刀完美閃避、破架勢紅弱點、半血、勝利／紀錄與 Maker 等必要證據。這份結果本身沒有證明產品機制故障。
- 不將 Dot 三次陣亡歸因於方向鍵 bug；修正此 bug 也不會自動補完 UI 驗收。舊候選的 pause-first probe 只能驗操作能力，不能當新修版通過。
- 審查員不代寫實作、測試或卡片。請原作者在原分支小修、補事件路徑回歸、升版並完成 Mac 全套後交新完整 SHA 重審；Dot 對新固定候選的正式驗收仍 pending，不 approve／merge。
