verdict: approve
2060b53a0cf62a78d499cda64acf5ae7ec7f3d83

# survivor-manual-attack-controls — Grok 審查

## 檢查的檔案
`git diff main...codex/survivor-manual-attack-controls`：manual-attack.js（新）、tests/manual-attack.cjs（新）、engine/combat.js、engine/loop.js、engine/weapons.js、input.js、render/hud.js、render/weapons.js、data/defaults.js、data/schema.js、maker/maker.js、manifest.js、index.html、practice.html、practice.css、practice-engine.js、practice-host.js、preview.html、preview.js、style.css、version.json、sw.js、docs/survivor-manual-attack-controls-validation.md、卡片與 inbox/done 原話。

## §6 檢查
- 規格對照（inbox 20261026T071532Z）：左搖桿只負責移動；右側大普攻鍵（點按、連點連段、按住聚氣、拖曳瞄準＋地面箭頭、無拖曳自動瞄準）；左上特殊鍵（劍氣／跳錘／水球五連扇形，按住拖曳放開、6 秒冷卻）；下方衝刺鍵，衝刺中按普攻出衝刺斬並取代手動模式的衝刺結束自動突刺；上方小鍵泡泡炸彈；圓形像素圖示、無 emoji。全部有做。
- 蓄力只朝前方：手動蓄力仍走既有前向蓄力，水球多發夾在前半面（±90°）；跳錘落地是前方 144° 扇形。沒有 360°。
- Maker「攻擊模式 自動／手動」，預設與舊作品補 `auto`，未知值拒絕；自動模式的舊路徑（attackTick、自動突刺、fireAtNearest 計時）只在非手動時執行，保留舊行為。
- 輸入規則 `SurvivorAttackInput` 為純函式（秒數／角度進、可序列化事件出），符合 §11；特殊招常數暫放規則內，文件已列為日後抽資料。
- 版本 20261026y，正式頁、預覽、練習場、sw.js 快取（含新檔 manual-attack.js）同步。
- 小建議（不擋）：普攻鍵圖示固定為糖果大劍，拿錘子或水球時也是劍；之後可改成跟著目前武器換圖示。

## 測試（Grok 的雲端電腦 box 執行）
`/workspace/erin-ci/run-review-tests.sh 2060b53…` → `RESULT: PASS`，81 PASS，--layout 9/9 尺寸通過。

## 實際操作（box 無頭 Chrome，觸控模擬，1024×461 與 740×360 各跑一次）
- Maker「數值」分頁點「攻擊模式」→「手動」，按儲存；`?maker=1&play=1` 重開後 GAME_DATA.attackMode = manual（儲存重開 OK）。主頁仍用預設資料（自動），與既有設計一致。
- 四顆圓鍵＋暫停鍵都在畫面內、互不重疊（1024×461：普攻 87px、特殊/衝刺 76px、炸彈 61px；740×360：70/61/49px）。
- 手動模式站著不動 1.5 秒：沒有自動出招、聚氣維持 0。
- 連點普攻 3 下：連段 1→3，事件 attack-released 自動瞄準最近敵人。
- 按住 1.6 秒：聚氣 100%，放開出 charged:true 的蓄力招。
- 按住往上拖：箭頭朝上（角度 −π/2，截圖可見地面黃色箭頭）；拖回死區角度變回 null（自動瞄準）；再往左拖放開，出招角度 π。
- 左手搖桿往右走＋右手按住普攻：角色移動約 205 單位，同時聚氣到 100%。
- 按住普攻時第二指按衝刺：衝刺啟動；衝刺中放開普攻 → 出招 dash:true、charged:true。
- 衝刺後按普攻：按下瞬間就出衝刺斬（dash:true），同一次衝刺再點不會再出；衝刺結束不再自動突刺（每次衝刺只多 1 次出招）。
- 特殊鍵往右拖放開：大劍 → 1 顆穿透劍氣；棒棒糖錘 → 角色往前跳約 80 單位後落地重擊；水球 → 5 顆扇形水球；三者冷卻 6 秒，冷卻中點擊不會再出。
- 泡泡炸彈鍵：放出炸彈、冷卻開始。
- 按住普攻中途暫停：按住狀態與聚氣被清除，放開後不會出招。
- 練習場（Maker 練習場分頁，手動模式）：普攻/特殊鍵出現；點 3 下連段 3/3，長按聚氣 100%，放開為 charged:true；說明文字顯示「點按連段／長按聚氣／拖曳瞄準（J 普攻、K 特殊、空白衝刺）」。
- 全程沒有 JS 例外。截圖只留在 box，未加入 repo。
