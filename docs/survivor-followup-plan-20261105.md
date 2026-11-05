# Survivor 後續規劃（2026-11-05，Claude）

家長指示：Dot 雲端額度只剩約 4 美元，**本文件只做規劃、不實作**。所有更新都放在 GitHub，不留在雲端 session。

基準：PR 113，分支 `codex/survivor-upgrade-balance`。遊戲來源 `5607ab95ef2a1fb6bdda9528dc6713b58654c4c9`，版本 `20261104g`；之後 `d538c70` 以前的提交只動了 `coord/` 文件。

## 1. 目前狀態

| 項目 | 結果 | 來源 |
|---|---|---|
| Maker／預設資料拆分（`43979f8..5768808`） | Claude 增量審查無阻擋。預設資料逐項相同，只有頂層欄位順序不同；舊作品驗證結果相同；設定 → 自己設計 → 關閉的流程正常；暫停時間不前進 | 本文件 §5 |
| 可讀性修正（`abf769b..5607ab9`，Claude 實作，家長指示直接併入 PR 113） | Dot 判定 `approve_fixed_increment`／雲端遊玩 `partial_pass`，沒有必改項；有一項 P3 | [Dot 結果](https://github.com/stasischen/lingo-agent-exchange/pull/2#issuecomment-6638519797)、`coord/reviews/survivor-upgrade-balance/dot-readability-result.md` |
| Mac 全套 | Claude 在雲端 Linux 跑過：exit 0、136 行 PASS（含 `--layout`）。**Mac Studio 尚未重跑 g 版** | — |
| 合併 | PR 113 仍是草稿，未合併，正式站不變 | — |

## 2. P3：暫停或選卡後，計時器文字會延遲恢復（待修，不阻擋）

**現象**：`engine/loop.js:273–276` 用「整秒＋魔王倒數」當快取 key，key 沒變就不重寫 `statusEl`。但 `ui/levelup.js:35`（`已暫停`）和 `:109`（`選一張升級卡`）會直接改寫 `statusEl.textContent`，卻沒有清掉這個 key。在同一秒內暫停或選卡後續玩，畫面會繼續顯示「已暫停／選一張升級卡」，最多約 1 秒才恢復成秒數。Dot 雲端有看到這個現象，不會中斷遊戲，也不會影響存檔。

**建議修法（一處，約一行）**：在 `loop.js` 判斷時，除了比對 key，也確認畫面上的文字確實是以本秒開頭；不是就重寫。這樣以後其他程式改寫 `statusEl` 也不會再出現同樣問題，不必去改 `levelup.js`。

```js
const sec=Math.floor(state.elapsed), statusKey=sec+'|'+bossLeft;
if(statusEl.dataset.key!==statusKey || !statusEl.textContent.startsWith(sec+' 秒')){ ... }
```

**測試**：在 `tests/player-readability.cjs` 加一條：`statusEl.textContent='已暫停'` 後，同一秒內 `tick(.016)`，預期文字恢復成 `N 秒`。

**流程**：這屬於遊戲邏輯，依 `AGENTS.md` 由 Dot 出 patch、Luna 套用、Mac 全套。為了節省 Dot 額度，建議由家長決定是否比照 `5607ab9`，直接授權一個 session 實作，再交 Mac 全套和非作者審查。**這一項不需要 Dot 雲端再測**，Node 測試就能完整覆蓋。

## 3. Dot 未測項目：改用 Mac 覆蓋，不花雲端額度

| Dot 未測 | 建議驗法（Mac Studio，免雲端） |
|---|---|
| 老師自然登場後倒數消失 | Node：`summonTeacher()` 後 `tick`，斷言 `statusEl` 沒有 `.boss-eta`。現有測試只用 `state.boss` stub，補一條走真路徑的 |
| 自然回血跨回 30% 以上後紅框解除 | Node：已有 50% 案例；補「29%→31% 經由回血函式」 |
| 系統「減少動態效果」時的實際畫面 | Mac Playwright：`page.emulateMedia({reducedMotion:'reduce'})`，截圖確認紅框靜止 |
| 傷害數字合併／魔王分筆／特效池重用在瀏覽器中的表現 | Node 已覆蓋規則。瀏覽器只需一張「一群小怪同時被打」的截圖給家長看 |
| 試煉／Maker 手動戰鬥 | 這輪沒有改手動戰鬥邏輯，沿用既有 Mac 測試；不需要重驗 |

Dot 剩下的額度，建議只留給**一定要真人在觸控裝置上操作**的驗收。

## 4. 等 Erin 決定（設計題，不由 agent 代決）

### 4.1 升級節奏

現況：升一級所需經驗 = `xpToLevel 5 + (等級-1) × xpGrowthPerLevel 1`（`data/defaults.js:72–73`）。實玩約 2.5 分鐘就到 Lv.24，高峰時每 5～7 秒跳一次選卡。假設撿寶石的速度不變，同樣的經驗量大約能升到：

| 選項 | xpGrowthPerLevel | 同樣經驗約可升到 | 感覺 |
|---|---|---|---|
| A 不變 | 1 | Lv.24 | 選卡很多，節奏常被打斷 |
| B | 2 | 約 Lv.18 | 後段明顯放慢，前 5 級幾乎一樣快 |
| C | 3 | 約 Lv.15 | 每次選卡更有份量 |

只要在 Maker「規則 → 基本玩法」改一個數字，不必改程式。建議 Erin 先試 B。

### 4.2 卡片文字

現況：卡面直接列出數值，例如「基礎威力 0 → 1.3 倍；出手 2.5 秒；數量 0 → 1；持續秒數 0 → 0.1」，對小學生太密。方向是卡面只留一句話加圖示，數值放進「詳細」。要請 Erin 先挑 3 張卡，試寫她自己會怎麼說，再決定要不要全面改。

### 4.3 其他玩家建議（排序供參考）

1. 解鎖與收藏圖鑑（路線圖 §12.3 (e)），提高回頭再玩的動機。
2. 怪物疊成一大團時，加強彼此推開（`bodySeparation` 數值），可以在 Maker 裡試調。

## 5. Maker／預設資料拆分審查紀錄（2026-11-05，增量，非整張 PR 合併授權）

鎖定 `5768808d3aa6c4454132f352be1ac1811b60ebc2`，比較起點 `43979f8`。

- 載入舊 `defaults.js` 與新 14 檔，逐項比對：數值、null、陣列順序全部相同；49 張卡 id 與順序相同。只有頂層欄位順序不同，程式中沒有依賴這個順序的比對。
- 舊驗證與新驗證對 5 種作品（完整、改數值、缺欄位、版本不支援、亂資料）結果完全相同。
- Maker 5 個模組：沒有缺少的 ctx 成員、沒有漏改的裸引用；只有外殼可改寫狀態，且都有 setter。
- 真瀏覽器（1024×461、740×360、1180×820）：開始畫面沒有 Maker；設定 → 自己設計 → 關閉會回到設定；暫停 → Maker → 關閉仍是暫停，`elapsed` 變化為 0；六個分頁、儲存、重載、恢復預設、`?editor=1` 都正常；預覽／練習 iframe 載入完整資料。
- 小事（可之後處理）：`levelup-layout.cjs` 原本是整支 45 秒上限，已在 `5607ab9` 改成每個尺寸各 45 秒。

## 6. Godot 移植規劃（不排時程）

延續 `docs/survivor-game-plan.md` §11 和 `docs/godot-mapping.md`（美術清單對照已完成）。

**先在 JS 版準備**，每張新卡順手做：
1. 把 `data/` 的 14 個資料檔從 JS 賦值改成真正的 `.json`；網頁版用同一份檔案。
2. 把規則測試整理成「輸入 → 預期」的 JSON fixture。`tests/effect-blocks-*-legacy.json` 已經是這種形式，Godot 可以用 GUT／gdUnit4 重跑同一批案例。
3. 寫 Playwright 工具，把程式畫的角色、怪物、特效逐幀輸出成 PNG sprite sheet，填進 `art-manifest.js` 的 `sheet`。
4. 用 OfflineAudioContext 把 ZzFX 音效和音樂錄成 WAV／OGG，放在 `assets/audio/`。

**Godot 4 的結構**：
- 用 Autoload 讀 JSON，用事件中心（signal）連接規則和畫面（對應 §11.3）。
- 幾百隻怪**不要每隻都做成物理節點**：照現有 `body-separation.js`，由一個管理器用陣列統一更新，畫面用 MultiMeshInstance2D 批次畫。
- 像素圖的 texture filter 設成 nearest；stretch 用 `canvas_items` + `expand`，維持橫向全螢幕。
- Erin 的「✏️ 設定區」改成 `@export` 變數，可以在檢查器直接拉數值。

**發布注意**：
- GitHub Pages 無法設定 COOP/COEP 標頭，要用 **Godot 4.3 以後的單執行緒網頁匯出**，並實測 iPad Safari。
- 上 App Store 需要 Mac、Xcode 和 Apple 開發者帳號。

**步驟**：
1. 先做縱切版：1 關、水球、3 種怪、10 張卡、1 個王，與 JS 版共用 JSON。
2. Erin 兩版並排試玩比較手感。
3. 共用測試案例結果一致後，再搬其他內容。
4. **Maker 最後才搬**：先保留網頁 Maker，輸出 JSON 給 Godot 用。

**建議時機**：等玩法設計比較穩定再開始；在那之前不動 Godot。

## 7. 下一步（需要家長點頭）

1. 是否授權修 §2 的 P3（一行加一條測試；Mac 全套即可，不需要 Dot 雲端）。
2. Mac Studio 對 `5607ab9` 以後的 HEAD 跑一次 `node games/survivor/tools/test.cjs --layout`，補上 g 版的 Mac 證據。
3. Erin 試 §4.1 的選項 B，並挑 3 張卡試寫卡面文字。
4. 以上完成後，再決定 PR 113 是否由非作者審查員合併。
