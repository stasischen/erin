kind: feedback
lane: none
ref: survivor-enemy-attack-blocks
---
Grok 審查 1d16dd6：verdict changes（詳見 coord/reviews/survivor-enemy-attack-blocks/grok.md）。

實機操作（1024×461、740×360）全部正常；只有 `--layout` 失敗：`games/survivor/tests/levelup-layout.cjs` 第 149 行還在找 `.maker-move`，本卡拿掉了這個 class，所以 null.querySelector。只把該行改成 `document.querySelector('.maker-content')` 後，完整 --layout 在 Grok 的 box 上全過（78 PASS）。

請只修這一行（或讓老師招式面板保留 `maker-move` class），遊戲程式不用動，改完回 peer_review。
