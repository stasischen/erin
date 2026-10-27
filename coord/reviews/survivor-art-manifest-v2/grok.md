verdict: changes
1786e84dc1368c61fd7c02519f48d6dd38aba581

PR #102 由不同於實作方的獨立 session 審查，暫代 grok；未修改作者程式。以下問題須回原分支修正再重審，不合併、不開始 weakpoint。

## [P2] 落點型招式皮膚仍以 Boss 為中心，與實際預警／命中位置分離

檔案：games/survivor/render/gallery.js，drawTrialEncounter 的 SurvivorArt.paint 呼叫（本 SHA 第 82 行）；同樣的原點問題也出現在 drawTrialMoves 的 leap 換皮入口（第 33 行）。

重現：在隔離瀏覽器將 move/icefall 暫設為合法 sprite 條目，使用可見本地 PNG、bounds 顯示及 ground 圖層；開始雙子試煉，讓冰錐 windup 的 m.target 與施法者 b 的位置不同。獨立審查以 repo 外測試控制頁固定該真實繪圖狀態：b=(315,305)，m.target=(500,480)，沒有更改碰撞／傷害或作者程式；SurvivorArt.validate 回 true。740×360、1024×461、1180×820 均可重現。

實際：原地面紅圈與陰影出現在 m.target，但新圖片畫在施法 Boss 周圍（b.x/b.y），兩者相隔一大段距離。原因是 paint 的 x/y 一律由 b 推算，只有 fallback 裡才為 dive/icefall/meteor 選 m.target；因此原警示雖仍執行，換皮所示的招式位置仍錯誤。leap 的 fallback 亦用 m.target、皮膚卻用 b，有相同模式。

預期：落點型招式的皮膚與其原警示／實際落點共用原點；追隨施法者的招式才以 b 為中心。請修正兩個接合入口，補落點不等於 Boss 座標的實際 draw/paint 位置案例，保留原範圍與安全缺口，再跑完整測試與三尺寸重驗。

## 已完成的驗證與限制

- 已讀 PR、AGENTS、正式卡／規格、兩份驗證／Godot 文件與完整差異；沒有引入 CI、個資或截圖，測試 PNG 為程式原創素材；遊戲引擎規則未修改，版本為 20261027f。
- 在 Mac Studio 對上述 SHA 獨立跑 node games/survivor/tools/test.cjs --layout：exit 0、109 PASS；git diff --check 通過。完整日誌與截圖只保留本機固定目錄，沒有提交。
- 實際暫換 sample 到 player，操作 S/E/N/W 看見正確方向與 W 單次鏡像；三格 windup 在 0／0.5／1.5 秒顯示不同幀，獨立動畫 sheet 可換成另一張本地圖。displaySize 64→96 時可見放大、玩家半徑仍為 18；effect/gust 的 ground/overlay、旋轉、alpha／混色可見反映。
- 落點換皮問題在三尺寸實際畫面確認，因此按流程停止並退回。主遊戲／Maker／預覽／練習的完整三尺寸人工回歸、所有 VFX 與白閃情境尚未完成；不將本機自動測試或局部檢查冒稱全數人工驗收。
- Godot 僅核對官方 SpriteFrames／AnimatedSprite2D 文件中的 duration、flip_h、speed_scale 契約，未執行 Godot。

修正後以新實質 SHA 重新審查。若正式 GitHub request-changes 因共用作者帳號被拒絕，須以 PR 留言如實保留這份 changes 判定，不冒稱正式 review 成功。
