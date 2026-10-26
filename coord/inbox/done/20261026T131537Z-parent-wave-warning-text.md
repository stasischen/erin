kind: request
lane: none
ref: survivor-wave-warning-text
---
「預警文字可以拿掉 看起來很怪」

（Grok 轉述：請建立卡片 coord/tasks/survivor-wave-warning-text.json（todo）。小卡。）

## 規格
1. 完全拿掉波次事件的預警「文字橫幅」，例如 engine/pacing.js 第 63 行 enemyNotice 顯示的「小怪包圍！找空隙衝出去」「蒲公英湧潮！」「精英小隊靠近了！」「跳跳糖來了！」。
2. 保留非文字的預警（畫面邊緣箭頭／閃光、地面標記、音效等），事件仍然要有預警；如果目前只有文字，補一個簡單的非文字視覺預警（例如來向的畫面邊緣紅色脈動）＋音效。
3. 不影響老師戰或其他畫面的必要文字。
4. 補測試：事件發生時不再顯示文字，但仍會觸發預警。
5. 升版本號；Codex 只跑 `node games/survivor/tools/test.cjs`（不加 --layout）。
6. 審查者在 740×360、1024×461、1180×820 實際玩到事件，確認沒有文字、仍看得出預警。
