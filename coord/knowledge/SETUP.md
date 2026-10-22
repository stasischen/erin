# 開發環境

## 本機工具

- Repo：`~/Dev/projects/erin`（目前工作目錄實際位置由使用者環境決定）。
- Codex：ChatGPT 桌面版 Codex；計畫記載終端機可用 `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`。不要使用已知有問題的 npm Codex 0.128。
- Grok：Grok Bot.app；新對話先請它讀 repo 的 `AGENTS.md`，再看卡片。
- Claude：Claude 桌面版或 Claude Code，在 erin repo 開 session；`CLAUDE.md` 會載入 `AGENTS.md`。

## 家長安全設定待辦

- [ ] AI 工具由家長操作；Erin 在旁口述，不自行開 AI 對話。
- [ ] Codex 專用對話設為只能改工作資料夾、其他動作先詢問；不使用雲端任務或額外工作副本。
- [ ] Grok 本機工具設為每次執行前詢問。
- [ ] Agent 不 push；上線由家長執行或當場指定。
- [ ] 考慮用只 clone 此 repo、未登入家長 GitHub 的標準 macOS 帳號隔離工作環境。
- [ ] 公開紀錄不含 Erin 的全名、學校、年齡、照片或住址。

詳細說明見 `docs/survivor-game-plan.md` §4。上述狀態需家長確認，不由 agent 假設已完成。

## 試玩

在 repo 根目錄執行 `python3 -m http.server 8000`。電腦開 `http://localhost:8000/games/survivor/`；同 Wi-Fi 的 iPad／手機開 `http://<Mac 的 IP>:8000/games/survivor/`。IP 可用 `ipconfig getifaddr en0` 查；首次 macOS 連入提示由家長核准。
