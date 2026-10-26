kind: request
lane: none
ref: survivor-manual-default
---
「預設改手動吧」「我看不到哪裡可以切自動手動」

（Grok 轉述：家長希望手動攻擊成為預設，而且要容易切換。請建立卡片 coord/tasks/survivor-manual-default.json（todo）。）

## Grok 診斷（20261026y，PR #76）
- 首頁正式遊戲只用預設資料：engine/state.js 第 11 行 `GAME_DATA = MAKER_MODE ? MAKER_LOAD.data : SurvivorData.defaults()`，而 data/defaults.js 的 attackMode 是 "auto"。所以在 Maker 改成手動也不會影響首頁遊戲，首頁永遠只有兩顆鍵（衝刺、技能）。
- 「攻擊模式」只在 Maker「數值」分頁第一個面板「攻擊操作」裡的下拉選單，標籤不明顯；家長在手機上找不到。
- 遊戲沒有 service worker，不是快取問題（各頁面已帶 ?v= 版本號）。

## 規格
1. 「手動」成為新玩家與首頁遊戲的預設攻擊模式；Maker 仍可選「自動」。
2. 舊版存下的設定不能默默停在自動，除非使用者自己選過自動（例如舊存檔沒有明確選擇紀錄時一律改成手動）。
3. 修正上述診斷：首頁遊戲要讀得到攻擊模式設定（玩家自己的設定），手動模式下要顯示普攻、特殊、衝刺、技能按鍵。
4. 容易切換：在遊戲暫停選單和首頁／開始畫面各放一個「自動／手動」切換，圓形像素開關加文字標籤（不用 emoji）。Maker 裡也保留，放在所屬區塊頂端並清楚標示。
5. 「普攻」鍵圖示跟著目前武器改變。
6. 升版本號；Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
7. 審查者在 1024×461、740×360 實際上手操作，親手點這個切換，並確認手動按鍵出現且可用。
