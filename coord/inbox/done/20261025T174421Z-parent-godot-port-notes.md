kind: request
lane: none
ref: survivor-godot-port-notes
---
好

（Grok 轉述：這是回答「要不要在設計文件加一節『移植 Godot 的注意事項』，之後每張卡都對照檢查」。這張只改文件和指引，Codex 不要改任何遊戲程式。接續最新的 main。請建立卡片 coord/tasks/survivor-godot-port-notes.json（todo）。）

- 在 docs/survivor-game-plan.md 加一節「移植 Godot 的注意事項」。
- 在 repo 用來指引貢獻者或 Codex 的文件（例如 AGENTS.md 或卡片範本）加一行簡短的檢查項目，讓之後每張卡都會對照這一節。

要點：
1. 內容和數值都放在 games/survivor/data 的資料檔（JSON）。
2. 遊戲邏輯寫成純函式，不直接碰 canvas 或 DOM。
3. 用事件溝通（選了卡、敵人死亡、衝刺結束），對應 Godot 的 signal。
4. 像素圖保持為固定尺寸的 PNG 或 sprite sheet；程式畫的圖之後再匯出成圖檔。
5. 保留音訊原始檔，匯出 WAV／OGG，並保留 BeepBox 的歌曲檔。
6. 測試寫成「輸入 → 預期輸出」的形式，之後可以在 Godot 重寫。
7. 遊戲規則不要依賴網頁版面或 CSS。

只改文件和指引。
