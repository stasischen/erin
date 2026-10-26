verdict: approve
a36b55e8c6331f6a91af03a3c814232f2439f263

# Grok review: survivor-feedback-block（統一拼圖第 7 步：共用回饋積木與觀察工具）

## Files checked
`git diff main...codex/survivor-feedback-block`: engine/feedback.js（新）、engine/debug-tools.js（新）、data/schema.js、engine/weapons.js、engine/boss.js、engine/combat.js、engine/loop.js、engine/pacing.js、engine/spawn.js、manual-attack.js、maker/maker.js、maker/style.css、preview.js、preview-engine.js、preview.html、practice-engine.js、practice-host.js、practice.html、render/weapons.js、render/world.js、index.html、manifest.js、version.json、sw.js、tests/feedback-block.cjs（新）、tests/boss-moves.cjs、docs/survivor-feedback-block-validation.md、coord/tasks/survivor-feedback-block.json、coord/inbox/done/*。

## Tests
- Box（Grok 雲端電腦，Chrome 156、Node 24.22.1、PingFang 替身字型）：`run-review-tests.sh a36b55e…` → `node games/survivor/tools/test.cjs --layout` **RESULT: PASS**（89 PASS，layout 全過）。未使用 Mac Studio 備援。

## Hands-on（box headless Chrome，觸控模擬，1024×461 與 740×360）
1. 追加要求 1（預覽不蓋按鈕）：六個分頁（武器、技能卡、怪物、老師、關卡、規則）各開預覽；預覽現在是並排的獨立欄（約 715–1020px），所有可見「＋」與右側開關逐一捲到畫面內用 elementFromPoint 檢查，覆蓋 0 個（big-water、rapid-water、item-candy、wind-gust、thunder-chain 等卡打開所有區塊後也是 0）。在預覽開著時按 item-candy 的「炸彈傷害 ＋」兩下，說明從 45 變 47。
2. 追加要求 2（專屬說明）：技能卡頁 50 項逐一開預覽，說明 50 種互不相同，沒有任何「使用原本的卡片組合」；10 個中立道具與 5 張風卡都是自己的內容與數值（只有「schools」總覽項目沒有說明，那不是卡片）。
3. 回饋積木：武器／小怪／老師三處都出現同一套欄位（預警樣式、音效、刀光、提示、頓幀倍率、震動倍率）。實際遊戲用糖果大劍打怪：預設 傷害 35、頓幀 0.05、震動 0.12，與 main 完全相同；在 Maker 把普攻頓幀 1→2、刀光關、音效改靜音、存檔後重新遊玩：傷害仍 35、頓幀 0.1、震動 0.12、不再播出招音。小怪改「閃動外框」與震動＋、老師粉筆震動 1→1.2，存檔重載後遊戲資料都帶到，招式預警／傷害（0.9/6、0.9/12）不變。
4. 玩家設定：在遊戲中按暫停→設定→關「打擊回饋」，打擊後頓幀與震動皆 0；強度 0 也皆 0；傷害不變。
5. 觀察工具（Maker 預覽與「試玩」練習場兩種沙盒都操作）：1×／0.25×（模擬時間每秒 1.00 → 0.25）、凍結（0.8 秒內 0 推進，仍可按工具）、恢復、判定框／身體／擊退箭頭／前後殘影開關都切換成功；生怪 5 → +5、生怪 1／20 → 練習場 26 隻全在畫面內；殘影「保留」後畫布上同時有橘色與綠色軌跡；改擊退數值重建預覽後工具狀態保留；清除殘影可按。
6. 舊存檔：用 main 版存一份（劍的回饋只有 cue／sound 兩欄）注入後載入、編輯、存檔、遊玩都正常，自動補齊新欄位。
- 全程無 JS 例外、無對話框。

## §6 checklist
觸控／Pointer 未改動；新程式沒用 roundRect、.at、structuredClone、外部網址；dt 仍由沙盒工具縮放、正式遊戲不受影響（工具只在 iframe 沙盒掛載，不寫入作品或玩家設定）；版本號 20261026ak 已在 index.html／preview.html／practice.html／sw.js 同步；文字繁中；未超出卡片範圍。

## Minor (not blocking)
- 預覽窗很小（740×360 約 200×158），打開「觀察工具」後面板幾乎蓋住整個小場景，生怪按鈕要在面板內往下捲才按得到（捲了可正常使用）。之後可考慮工具列改成兩欄小按鈕或放在預覽窗外。
