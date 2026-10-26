verdict: approve
c0d86de333f5a1f9965836469396aa62e8e193d5

# Grok review: survivor-weapon-blocks (統一拼圖第 4 步)

## Files checked
- games/survivor/data/schema.js (WEAPON_STACKS / weaponStacks / compileWeapon / validate 編譯與白名單)
- games/survivor/data/defaults.js (特殊招初值)
- games/survivor/manual-attack.js (特殊招改由武器資料驅動)
- games/survivor/maker/maker.js, maker/style.css (積木堆編輯、收合保存、changed() 先編譯)
- games/survivor/tests/weapon-blocks.cjs, tests/maker-ui.cjs
- practice-host.js / practice.html / preview.* / index.html / version.json / sw.js（版本 20261026ad）
- coord/tasks/survivor-weapon-blocks.json, docs/survivor-weapon-blocks-validation.md, coord/knowledge/DECISIONS.md

## §6 checklist
- 規格 1–4 都有：五招（普攻／連段重招／蓄力／特殊招／衝刺斬）× 五積木（觸發／形狀／時機／效果／回饋）；舊欄位載入自動轉換，等效測試覆蓋三武器連段、蓄力、移動、衝刺、揮擊；武器分頁積木可收合並有預覽與試玩；蓄力形狀只有前方扇形／直線，spin 被拒絕。
- 資料邊界：積木白名單、未知版本／觸發／回饋／欄位、越界與非有限值都會被 validate 拒絕；特殊招數值有界。舊作品不改輸入、存讀冪等。
- 無外部資源、無 eval 新用法、素材音訊未改；Lingo／invest 未碰。

## Tests
- Box (Grok cloud computer): `/workspace/erin-ci/run-review-tests.sh c0d86de…` → RESULT: PASS（76 PASS 行，--layout 全部尺寸通過）。

## Hands-on (box, headless Chrome, touch emulation, 1024×461 與 740×360 皆同)
- Maker 武器分頁：水球／錘子各 4 招 20 塊、大劍 5 招 25 塊（衝刺斬只在大劍）。點 summary 收合第一塊 → 關閉；改「最後一段招式」為旋轉一圈後收合狀態仍保留。蓄力招式選項只有前方扇形／前方直線。
- 拖滑桿：特殊招冷卻 6→4、最後一段傷害倍率 2.5→4.8、特殊招傷害倍率 2→3.2，狀態列顯示已修改；開預覽，預覽 iframe 立即讀到新值（含旋轉一圈、冷卻 4、傷害 3.2）；按試玩，練習場武器值一致。儲存 → 重開 Maker 數值保留；?maker=1&play=1 遊戲資料一致。
- 遊戲（預設資料，手動模式）：三武器連點連段正確（水球／大劍 3 下末段、錘子 4 下末段，停手後重置為 0）；按住 1.7 秒放開 → 蓄力攻擊（錘子前方扇形、大劍前方直線突刺）；特殊鍵：水球 5 顆扇射、大劍劍波、錘子跳躍，冷卻 6 秒，冷卻中再按不觸發；大劍衝刺後攻擊帶 dash；搖桿移動正常。
- 舊作品（移除 blocks 與特殊招欄位、錘子連段倍率 2.7）：Maker 正常載入、自動長出 20 塊並保留 2.7；遊戲資料特殊招回到原值。
- 設定切自動：2 秒內自動出招 3 次；Esc 暫停、resetGame 重新開始正常；無 JS 例外。

## Findings
- 無阻擋問題。小註：回饋積木目前只是說明文字（參數編輯屬第 7 步），符合卡片說明。
