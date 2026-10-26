kind: request
lane: none
ref: survivor-hero-school-tint
---
小水球本身會隨著選的系變色

（Grok 轉述：這是小的遊戲程式修改，要實作。接續最新的 main。請建立卡片 coord/tasks/survivor-hero-school-tint.json（todo）。）

- 主角小水球本身會隨著主流派變色，使用和 PR #53 子彈相同的色盤：水是藍色、風是薄荷綠、雷是紫色帶火花。
- 還沒選任何流派之前，保持預設顏色。
- 拿了雙流派卡時主角變成雙色；現有的變身光環照樣疊在上面。
- 在兩個關卡的背景上都要清楚，兩把武器都要正常。
- 用色盤替換或染色來做，不要畫新圖；顏色放在資料裡。
- 升級版本號。加測試，只跑一般測試：`node games/survivor/tools/test.cjs`（不要加 --layout）。
- 不要跑真實 Chrome 的 --layout 版面測試，也不要重試；版面測試由 Grok 審查時在 Mac Studio 上跑。（家長原話：「codex那邊版面測試有問題就不用一直浪費 token  你跑就好」）
