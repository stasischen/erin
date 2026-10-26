# 重量、擊退與吸引交接

來源：`coord/inbox/done/20261026T050440Z-parent-weight-knockback.md`。版本 `20261026r`。

## 規則與 Maker

- `enemies[].mass`：相對質量，有限數字 1～100；一般怪 1、坦克 8。舊作品依其 behavior 補預設。畫面大小與重量分開，改外觀大小不會暗中改重量。
- `knockback.enabled`：布林，預設 true；關閉恢復原推拉倍率（身體分離仍使用質量）。
- `knockback.strength`：0～5，預設 1。距離或速度乘上 `1 / (1 + (mass - 1) * strength)`。正負方向保留，0 不移動；預設重量 8 的怪移動 1/8。
- `knockback.minibossMass`、`bossMass`：1～100，預設 8、40。Boss／小頭目優先於沿用的小怪 typeId，身體分離也走同一質量函式。
- `knockback.bossMultiplier`：0～1，預設 0，老師免疫外力推拉，自己的移動、衝撞與攻擊照舊。此額外倍率隨 enabled 開關生效。
- 以上均可在 Maker「怪物」頁儲存、重開、試玩；每種怪物可獨立改重量。
- 執行期 `target.displacementMultiplier` 留給精英霸體，預設 1；0 免疫，獨立於重量開關。目前未新增精英能力或 UI。

`SurvivorBodies.mass(target, config)` 與 `displacement(distance, mass, config, multiplier)` 是純函式。接合層 `targetMass` 讀取種類資料；`targetDisplacement` 套用 Boss／霸體倍率。

所有即時推拉經過 `shiftTarget`：Maker 積木、流派水球、近戰、風場、旋風、風牆、炸彈吸引／爆炸及浪花水球。命中後的持續擊退於 loop 每幀套用倍率，保留既有普通怪方向／衰減算法。畫面外或尚在出場保護的目標不受外力影響；炸彈中心重疊保留向右推開的原本處理。gust 終點使用縮放後的世界距離，跨接縫仍以短向量繪製。浪花互撞依實際位移掃描，不以原始距離判定。

## 驗證與交接

只執行 `node games/survivor/tools/test.cjs`，不跑 `--layout`；全部通過（含版本／快取、Maker 操作、重量回歸及靜電／王冠等價測試）。Grok 應對 erin-watch 提交後的實質 SHA 獨立審查並執行版面檢查。

新回歸案例 `tests/weight-knockback.cjs` 固定輸入檢查：±80 與質量 1／8／40／100、開關／零強度／霸體；一般怪／坦克／小頭目／老師的推拉、炸彈、Maker、浪花、命中擊退、水球與定時風；視覺終點、互撞傷害、畫面外、環形接縫、資料邊界、舊作品遷移與儲存後套用。舊 153 組快照明確關閉新身體分離與重量，以檢查相容模式；新預設另外比對 Maker 與普通模式。靜電與王冠的效果積木等價測試維持原測試。

Erin 試玩：普通怪是否和原來一樣、大怪推拉是否只動一點、老師是否固定招式起點，以及 Maker 開關。舊 iPad 流暢度與版面留待實機／Grok 檢查。

## Godot §11 對照

適用 11.1／11.2／11.6／11.7：新增設定都是可序列化資料，具範圍驗證與遷移；質量／縮放純函式只傳數字與資料，不依賴 DOM、儲存、亂數或時鐘，沿用世界單位與 dt 秒；上述固定案例可重寫為 Godot 測試。11.3：先算距離再更新座標與 VFX，不新增事件匯流排。11.4／11.5 不適用，本卡沒有新增圖片或聲音。

保留差距：預設資料仍在 defaults.js，尚未抽 JSON；可見性／傷害／位移與 VFX 接合仍讀取遊戲狀態；沒有進行全面重構或 Godot 移植。
