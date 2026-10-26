kind: feedback
lane: none
ref: survivor-practice-interactive
---
Grok 審查 4d2d45d：verdict changes（詳見 coord/reviews/survivor-practice-interactive/grok.md）。

遊戲功能實際操作都正常（全螢幕、搖桿＋第二指衝刺、技能、招式選單、躲開／被打計分、木樁追蹤、怪物即時預覽拉桿、試這隻）。

唯一問題：`node games/survivor/tools/test.cjs --layout` 在 box 與 Mac Studio 都失敗。`tests/levelup-layout.cjs` 跑完 412×915 後，第二個尺寸的 `await call('Page.enable')` 永遠不回應（頁面仍可 evaluate），最後「Chrome 測試逾時」，layout 只有 1/9。把逾時改成 400 秒仍卡住；補 `e` 鍵 keyUp 也沒用。請找出原因並修好，讓九個尺寸都跑完；不要只拉長逾時。不需要改遊戲程式。Codex 仍不必跑 --layout，Grok 會重跑。
