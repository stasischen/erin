# 貼給 Codex 的開場指令

（在 ~/Dev/projects/erin 開 Codex，把下面整段貼上；每張卡把「本次卡號」改掉）

---

本次卡號：A0

你這次只做「美術快車道」，規則以 docs/ART_FAST_TRACK.md 為準。這是家長授權的例外：A 系列卡不走 Dot patch／Luna／Grok 流程，由家長看截圖直接驗收。AGENTS.md 其他規則（Git 安全、不自動接卡、私人資料不進 repo）照常。

請依序：
1. 讀 docs/ART_FAST_TRACK.md、../erin-art/STYLE_GUIDE.md、games/survivor/art/README.md、games/survivor/art-manifest.js。
2. 從 main 開分支 art/<卡號 小寫>，只改文件列出的允許檔案。需要碰禁止檔案就停下說明。
3. 完成本卡內容後跑 node games/survivor/tools/test.cjs --layout，必須全過。
4. 跑截圖（A0 之後用 tools/shots.cjs），存到 ~/.local/share/erin/art-review/<卡號>/。
5. 自己看截圖，對照 STYLE_GUIDE 列出最醜的 3 點並修正，重複最多 3 輪。
6. 推送並開 draft PR，然後停下，用繁中 3～5 句回報：改了什麼、截圖在哪、剩下哪些不滿意。不要自己開下一張卡。
