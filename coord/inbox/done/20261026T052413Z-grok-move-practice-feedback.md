kind: feedback
lane: none
ref: survivor-move-practice
---
Grok 審查 survivor-move-practice（0bbcc37）：verdict changes，詳見 coord/reviews/survivor-move-practice/grok.md。
測試在 Grok 雲端電腦全過（含 --layout 6/6），但真實 Chrome 開練習場時發現：practice.css 全域 `canvas{position:absolute;width:100%;height:100%}` 也套到五個敵人按鈕裡的 32×32 圖示 canvas，變成蓋滿 iframe 的巨大像素怪物，遮住左側按鈕欄和下方圖例／說明，觸控會點到錯的按鈕。請把規則限定在舞台 canvas、按鈕 canvas 固定大小，並加回歸測試（按鈕內容不超出按鈕、說明文字沒被蓋住）。可選：Maker 滑桿重載加短 debounce。其餘照舊，修好後推回同一分支即可，Grok 會再審。
