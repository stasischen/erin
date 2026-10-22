# Erin 的新遊戲企劃：像素割草生存遊戲（類 Vampire Survivors / Brotato）

Erin 當遊戲總監，Codex、Grok、Claude 分工協作，家長把關上線。

> **怎麼讀這份文件**
> - **家長**：先看 §0 總覽、§4 安全設定、§5 的階段 0。
> - **Erin**：和家長一起看 §2「Erin 的遊戲工作室」，以及 §5 每個階段的「Erin 先決定」「Erin 試玩」「Erin 自己改」。
> - **Codex／Grok／Claude**：先讀 `GAMES.md`、`GAME_WORKFLOW.md`、`ASSETS.md`，再讀完整份文件，照 §3 協作（階段 0 之後以根目錄 `AGENTS.md` 為準）。§3 改編自 `stasischen/agent-coord-kit` 的 `templates/RULES.md`、`templates/AGENTS.md`，卡片和收件匣格式照 `coord/cards.py`、`coord/inbox.py`。

## 0. 總覽

| 項目 | 內容 |
|---|---|
| 做什麼 | iPad、手機、電腦都能玩的像素風「割草」生存遊戲，放在 `games/survivor/` |
| 誰決定 | **Erin 是遊戲總監**：遊戲叫什麼、主角和敵人長怎樣、好不好玩，都由她決定 |
| 誰寫程式 | Codex 寫、Grok 審查；兩個都解決不了才找 Claude；家長核准才上線 |
| 怎麼協作 | 照 agent-coord-kit 的任務卡、審查紀錄、收件匣格式，放在本 repo 的 `coord/`。先用**輕量模式**：不裝自動協調器、不排程，由 Erin 或家長說「看卡片」叫 agent 接手 |
| 節奏 | 一次只做一個階段（0～6）；每個階段結束都能玩，Erin 試玩、自己動手改一點，再進下一階段 |

每個階段都照這個循環走：

```text
Erin 說想法 → Codex 寫程式 → Grok 檢查 → Erin 試玩 ─→ 家長說 OK → 上線
     ↑                                       │
     └──────── 想改的地方（Erin 的回饋）←────┘
```

`GAME_WORKFLOW.md` 的 Gem 這次這樣用：遊戲規劃師 → 階段 0 的設計單；範圍裁切 → 已切成 §5 的階段；遊戲程式設計師 → 由 Codex 直接在 repo 裡做；除錯教練 → Erin 說回饋的方式（§2）；遊戲美術素材 → 階段 5 畫圖前找靈感；作品分享 → 階段 6。

## 1. 遊戲規格

### 目標
做一個 iPad、手機、電腦都能玩的簡單「割草」生存遊戲：角色**自動攻擊**，玩家只負責**移動和閃避**，打倒敵人收集經驗、升級時三選一強化。給小朋友玩，好上手、馬上有成就感。遊戲名稱、主角、敵人、武器的名字和樣子由 Erin 決定（本文先用暫定名稱）。

### 技術要求
- 純 HTML5 Canvas + 原生 JavaScript，不用框架、不用建置工具（跟 repo 其他遊戲一致）。
- 放在 `games/survivor/`（`index.html`、`game.js`、`style.css`，需要時才加 `assets/`）。
- 在根目錄 `index.html` 的 `game-grid` 加入遊戲卡片（階段 1 就加，說明先寫「製作中」，Erin 才能從首頁點進去試玩）。
- 畫面自適應螢幕大小，支援直向與橫向；iPad Safari 要順（禁止雙擊縮放、捲動、長按選取）。
- 目標 60fps，敵人數量多時也不卡（敵人上限、物件重複使用）。
- 移動和計時用「每秒」計算（`dt`，單位秒），不要用「每幀」計數：120Hz 的平板和 60Hz 的電腦速度才會一樣，而且「每秒走 150 像素」對 Erin 也比「每幀走 2.5」好懂。
- `index.html` 引用 `game.js`、`style.css` 時加版本號（例如 `game.js?v=20261022a`），每次改版都更新，避免 iPad 讀到舊快取。

### 讓 Erin 改得動的程式結構
- `game.js` 最上面放「✏️ Erin 設定區」（沿用 `games/racing/game.js` 的 `// ✏️` 註解風格）：一個數字一行，用小學生看得懂的中文寫「改大會怎樣、改小會怎樣」。
- 會越做越多的東西用**資料表**，不寫死在程式裡：`ENEMY_TYPES`（敵人種類）、`UPGRADES`（升級卡）、`WAVES`（第幾秒出什麼敵人、出多快）、`SPRITES`（每個角色用色塊還是圖片）。Erin 要加一種新敵人或新升級卡，只要照著表格多加一筆。
- 繪圖集中在少數幾個 `draw…` 函式。`SPRITES` 裡填 `null` 就畫色塊，填圖片路徑就畫 Erin 的像素圖，換圖不用動遊戲邏輯。

### 操作
- **手機／平板**：虛擬搖桿。手指在畫面任意處按下即出現搖桿底座，拖動方向控制移動，放開消失（浮動式搖桿）。
- **電腦**：方向鍵 + WASD。
- 不需要攻擊按鍵，攻擊全自動。暫停按鈕放角落，按鈕要夠大好按。
- 搖桿只認第一根按下的手指；按在暫停按鈕上不會叫出搖桿。
- 切到別的 App 或螢幕關掉時自動暫停。

### 美術風格
- 像素風，第一版**不用圖片**，用程式畫的色塊，但要**做精緻一點**：
  - 角色和敵人有外框、陰影、簡單的眼睛，移動時有輕微彈跳或縮放動畫。
  - 受擊閃白、敵人死亡有小粒子爆開、經驗寶石會閃爍並被吸過來。
  - 傷害數字飄出、升級時有光圈特效、畫面輕微震動（可關）。
  - 地面用格子或簡單花紋，讓移動有方向感。
  - Canvas 關閉圖片平滑（`imageSmoothingEnabled = false`）保持像素感。
- 階段 5 換成 Erin 用 Piskel（https://www.piskelapp.com/）畫的像素角色。

### 難度與兒童友善
- 一開始很簡單，前 30 秒幾乎不會死。
- 受傷後短暫無敵（閃爍），避免一下就被圍死。
- 介面文字用繁體中文，字大、少字。
- 沒有血腥畫面，敵人用可愛的史萊姆、小怪物造型。

## 2. Erin 的遊戲工作室

這是 **Erin 的作品**。AI 幫忙寫程式，但想法、決定和試玩都是 Erin 的工作。跟 `GAME_WORKFLOW.md` 說的一樣：重點不是讓 AI 一次做完，而是讓 Erin 先說清楚想法，再一步一步測試、修改、分享。

### 工作室成員

| 誰 | 工作室裡的角色 | 負責 |
|---|---|---|
| Erin | 🎬 遊戲總監 | 決定遊戲長怎樣；試玩；說哪裡好玩、哪裡要改；自己改數字、畫角色 |
| Codex | 🛠️ 程式工程師 | 照 Erin 的想法寫程式，把她說的話整理成任務 |
| Grok | 🔍 測試審查員 | 檢查 Codex 寫的程式有沒有問題、在 iPad 上會不會壞 |
| Claude | 🧭 顧問 | Codex 和 Grok 意見不合、或都不會的時候才出場 |
| 家長 | 🎟️ 製作人 | 管安全；決定什麼時候可以上線（放到網站上給大家玩） |

### Erin 每個階段做的四件事
1. **先決定**：回答這個階段的設計問題（§5 每個階段都有），例如「敵人叫什麼？什麼顏色？」
2. **叫隊友**：對 Codex 說「看卡片」，它就會開工；它說做好了，再對 Grok 說「看卡片」請它檢查（Grok 開新對話時要先請它讀 `AGENTS.md`，見 §3.1）。
3. **試玩**：在 iPad 和電腦上玩，說出好玩和想改的地方。
4. **自己改**：用 VS Code 打開 `games/survivor/game.js`，在最上面的 ✏️ 設定區改一個數字，重新整理看看變怎樣。

### 怎麼說出想改的地方
用 `GAME_WORKFLOW.md`「遊戲除錯教練」的四個問題，一次只講一件事：
1. 我按了什麼、做了什麼？
2. 畫面發生什麼？
3. 我原本希望發生什麼？
4. 是在開始前、遊玩中、結束時，還是重新開始時？

> 例：「我一直往右跑，史萊姆一下就追到我，我希望跑得掉。大概玩到一分鐘的時候。」

### Erin 的小規則
- 一次講一件事；講清楚比講很多重要。
- 聽不懂 AI 說的話，就請它「用小學生聽得懂的話再說一次」。
- 不跟 AI 說自己的全名、學校、住址，也不傳自己的照片。
- 自己在改檔案的時候，先不要叫 agent 做事；改完請 Codex 幫忙存檔（commit）。
- 要放到網站上（上線），一定要家長說 OK。
- 每次坐下來只完成一個小目標，做完就休息。

## 3. Agent 協作規則（給 Codex、Grok、Claude）

改編自 `stasischen/agent-coord-kit`：照 kit 的格式記錄任務卡、審查和收件匣，讓不同廠牌、不同電腦上的 agent 都看同一份紀錄接手。先用**輕量模式**：不安裝自動協調器、不設排程。階段 0 會把這一節整理成 repo 根目錄的 `AGENTS.md`，之後以 `AGENTS.md` 為準。

### 3.1 這台 MacBook 上的工具

| 卡片裡的名稱 | 工具 | 怎麼開 |
|---|---|---|
| `codex` | ChatGPT 桌面版裡的 Codex | 在 ChatGPT.app 開 Codex，打開 `~/Dev/projects/erin`。終端機用 `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`；PATH 上 npm 裝的 `codex`（0.128 版）目前壞掉，不要用 |
| `grok` | Grok Bot.app | 開新對話先說：「先讀 `~/Dev/projects/erin/AGENTS.md`，然後看卡片」 |
| `claude` | Claude 桌面版／Claude Code | 家長在 erin 資料夾另開 session |

卡片和審查都存在 repo 裡，所以別台電腦（macOS 或 Windows）上的 agent 也能接手：clone 後照同一份 `AGENTS.md` 做。工作分支要先由家長 push，別台才看得到。

### 3.2 角色與權限

| 名稱 | 做什麼 | 不做什麼 |
|---|---|---|
| `codex` | 協調與實作：讀卡片和收件匣、開卡、寫程式、開分支、commit、更新自己的卡、開試玩伺服器 | 不審自己的程式；不 push；不 merge 到 `main` |
| `grok` | 照 §6 審查 `codex` 的分支；需要時幫 Erin 找靈感、照 `ASSETS.md` 查素材授權 | 不改 `codex` 的程式和卡片；不審自己寫的東西；不 merge |
| `claude` | 只處理 `codex`、`grok` 解決不了或意見衝突的問題，以及架構類決定 | 不做日常工作 |
| `erin` | 遊戲總監：設計、試玩、決定好不好玩；可以是 `waitingFor` 的對象 | 不當審查者（kit 規定審查者必須是非人類 agent） |
| `user`（家長） | 最後審查者（kit 的 `finalReviewer`）；決定 `risk`；核准上線；管安全設定 | — |

- 作者和審查者必須不同：`codex` 寫的給 `grok` 審；`grok` 寫的（例如素材建議）給 `codex` 核對。
- 同一時間只有一個人改檔案（包括 Erin）：`codex` 做完並 commit 後才叫 `grok`；`grok` 只寫自己的審查檔。
- commit 只加指名的檔案，不用 `git add .`／`git commit -a`（別人可能有還沒存的東西）。
- Erin 在這個階段範圍內的修改要求，`codex` 直接做；超出企劃的新點子先記到收件匣，等 Erin 和家長決定後才開卡。
- 不確定能不能做、或缺資訊時不要猜：卡片改 `blocked`，`waitingFor` 寫要問誰。

### 3.3 檔案放哪裡

```text
coord/                          # kit 預設的 coordRoot
├── tasks/<卡片id>.json          # 任務卡，一張卡一個檔
├── reviews/<卡片id>/<審查者>.md  # 審查紀錄
├── inbox/                      # Erin 和家長的原話
│   └── done/                   # 已處理的
└── knowledge/
    ├── DECISIONS.md            # Erin 和家長做過的決定，一條一行，附日期
    ├── PITFALLS.md             # 踩過的坑（先放 §6 標了 commit 的舊坑）
    └── SETUP.md                # 這台電腦的工具與啟動方式
```

kit 的 `lanes/`、`requests/`、`results/`、`approvals/` 要裝協調器才用得到，現在不建。

`erin` repo 是公開的（GitHub Pages），`coord/` 也會公開：只寫遊戲相關內容，不寫 Erin 的全名、學校、年齡、照片或住址。如果家長希望卡片不公開，可以改放在另一個 private repo，其他規則不變。

### 3.4 任務卡

格式照 kit 的 `coord/cards.py`：欄位不能多也不能少（`dependsOn` 可省略）。

```json
{
 "schemaVersion": 1,
 "id": "survivor-stage-1-move",
 "title": "割草遊戲階段 1：移動與敵人",
 "owner": "codex",
 "state": "todo",
 "repo": "erin",
 "branch": null,
 "pr": null,
 "brief": "docs/survivor-game-plan.md",
 "next": "階段 0 完成後開工：搖桿、WASD、敵人追逐與碰撞",
 "reviewers": ["grok"],
 "waitingFor": null,
 "risk": "low",
 "updated": "2026-10-22T00:00:00Z",
 "updatedBy": "codex",
 "dependsOn": ["survivor-stage-0-setup"]
}
```

| `state` | 意思 | 跟 Erin 怎麼說 |
|---|---|---|
| `todo` | 可以開始了 | 排隊中 |
| `doing` | owner 正在做 | 製作中 |
| `peer_review` | 做完了，等 `grok` 審查 | Grok 檢查中 |
| `review` | 審查通過，等 Erin 試玩和家長最後確認 | 換你試玩了！ |
| `blocked` | 卡住了；`waitingFor` 寫在等誰，`next` 寫需要什麼 | 在等某人回答 |
| `done` | 已 merge 到 `main` 並 push | 上線了 🎉 |

- `id` 用小寫英數和 `-`；`title` 最多 60 字；沒完成的卡 `next` 要寫（最多 120 字）；`updated` 用 UTC，例如 `2026-10-22T08:30:00Z`。
- `pr` 填 PR 編號（數字）或 `null`，不要填網址。
- 要等另一張卡：用 `dependsOn`，維持 `todo`，不要用 `blocked`。要等 Erin 決定或畫圖：`blocked`、`waitingFor: "erin"`。
- `risk` 由家長決定。只改 `games/survivor/`、首頁卡片和文件的卡預設 `low`；改 `AGENTS.md` 或協作規則屬 kit 的 B 級，要家長決定。**不管 risk 多少，merge 到 `main` 和 push 都要家長明確說 OK**（比 kit 預設嚴，沿用本 repo「推送前先讓使用者確認」的規則）。
- 只改自己的卡；每次交接更新 `state`、`next`、`updated`、`updatedBy`。

### 3.5 審查紀錄

`coord/reviews/<卡片id>/grok.md`：

```text
verdict: approve
sha: <被審 commit 的完整 40 碼 SHA>

看了什麼：（approve 也要寫看了哪些檔案、試了什麼）
問題與建議：（changes 時逐條寫）
```

- 第 1 行只能是 `verdict: approve` 或 `verdict: changes`；第 2 行是完整 40 碼 SHA；第 3 行之後一定要有內容。
- approve 只對那個 SHA 有效，之後有新 commit 就要重審。唯一例外：新 commit 只新增審查檔、收件匣檔，或只改卡片的流程欄位（`state`、`branch`、`pr`、`updated`、`updatedBy`、`waitingFor`），而且看過完整 diff 確認。
- Erin 自己改了設定數字也是新 commit，一樣請 `grok` 再看一次（通常很快）。
- 意見不合：各自改 3 次還收斂不了，卡片改 `blocked`、`waitingFor: "claude"`，`next` 寫清楚要 Claude 決定什麼、已經試過什麼。
- 審查時發現的範圍外問題寫在審查檔裡，由家長決定要不要開新卡，不順手改。

### 3.6 收件匣：記下 Erin 和家長的原話

Erin 的想法和試玩回饋、家長的核准，由正在跟他們對話的 agent 寫成 `coord/inbox/<UTC時間>-<短名>.md`（例：`coord/inbox/20261022T083000Z-erin-slime-speed.md`），格式照 kit 的 `coord/inbox.py`，**原話照抄、不改寫**：

```text
kind: feedback
lane: none
ref: survivor-stage-1-move
---
史萊姆太快了，我都跑不掉。可以慢一點嗎？
```

- `kind`：`request`（想法、新點子）、`feedback`（試玩回饋）、`approve`（家長核准上線，要在 `ref` 下面多一行 `sha: <40 碼>`，就是 `grok` approve 的那個 commit）。
- 只有家長能核准。Erin 說「好玩！可以了」記成 `feedback`。
- `codex` 把收件匣的內容做成卡片或程式修改後，把檔案移到 `coord/inbox/done/`。
- 這些原話到階段 6 會變成 Erin 介紹作品的材料。

### 3.7 Git 流程
1. `codex` 從最新的 `main` 開分支 `codex/<卡片id>`（例：`codex/survivor-stage-1-move`），卡片改 `doing`、填 `branch`。
2. 做完並 commit，卡片改 `peer_review`，告訴 Erin「可以請 Grok 檢查了」。
3. `grok` 在本機看 `git diff main...codex/<卡片id>`，照 §6 審查，把審查檔 commit 到同一個分支。
4. 通過後 `codex` 把卡片改 `review`，開試玩伺服器（§3.8）讓 Erin 試玩。Erin 想改就回到 `doing`。
5. Erin 滿意、家長說 OK：agent 把家長的話寫成 `approve` 收件匣檔，`codex` 把卡片改 `done`；家長（或家長當場指定的 agent）merge 到 `main` 並 push。GitHub Pages 約 1～3 分鐘後更新。

- commit 訊息：卡片用 `task: <卡片id> <state>`、審查用 `review: <卡片id> grok <approve|changes>`（kit 的寫法）；Erin 自己改的用 `erin:` 開頭（例：`erin: 主角速度改成 200`），讓 git 紀錄看得到她的貢獻；其他照 repo 現有的 `feat:`、`fix:`。
- agent 不 force-push、不做破壞性刪除；push 到 `main` 只在家長當場說可以時才做（kit 預設禁止 agent 做這三件事）。
- `GAMES.md` 第 3 步的 `git add .`、`git push` 是家長手動流程；agent 照這一節做。
- 需要在 GitHub 上看（例如別台電腦的 agent 要審）時，由家長 push 工作分支並開 PR，卡片 `pr` 填 PR 編號。

### 3.8 試玩方式
- **電腦**：在 repo 根目錄執行 `python3 -m http.server 8000`，打開 `http://localhost:8000/games/survivor/`。
- **iPad／手機**（和 Mac 連同一個 Wi-Fi）：打開 `http://<Mac 的 IP>:8000/games/survivor/`，IP 用 `ipconfig getifaddr en0` 查。第一次 macOS 可能會問要不要允許連入，由家長按允許。
- 改版後更新 `?v=` 版本號；iPad 還是舊畫面就重新整理。

### 3.9 叫醒方式：「看卡片」
沒有排程、不輪詢。Erin 或家長對 agent 說「看卡片」：
- `codex`：先處理 `coord/inbox/` 還沒處理的原話；再看自己 `doing` 的卡（有審查意見先修）；都沒有，就照 `dependsOn` 開下一張 `todo`。
- `grok`：找 `reviewers` 有 `grok`、狀態 `peer_review` 的卡，審分支目前的 head。
- `claude`：找 `blocked` 且 `waitingFor` 是 `claude` 的卡。
- 做完用 Erin 聽得懂的話回報：做了什麼、她現在可以做什麼。

### 3.10 什麼時候才裝自動協調器
現在不裝。出現這些需求再評估：同時進行的卡約 5 張以上、要照 `dependsOn` 自動派工、要無人值守、要控制模型額度，或想在手機收到「可以試玩了」的通知（只要通知的話，先評估 kit 的 `notifyOnly` 模式）。到時設定檔放 `~/.config/agent-coord/erin.json`（不進 repo），角色對應大致如下，安裝前再照 kit README 補齊 `stateDir`、`coordClone` 等：

```json
{
 "github": {"owner": "stasischen"},
 "coordRepo": "erin", "coordBranch": "main", "coordRoot": "coord",
 "repos": ["erin"],
 "agents": {
  "user": {"kind": "human"}, "erin": {"kind": "human"},
  "codex": {"kind": "local-session", "provider": "codex", "thread": "<Codex 對話名稱>"},
  "grok": {"kind": "cloud"}, "claude": {"kind": "cloud"}
 },
 "messages": {"language": "zh-Hant", "rules": "AGENTS.md"},
 "finalReviewer": "user",
 "executables": {"codex": "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"}
}
```

kit 目前沒有 Grok 的介接，`grok` 只能設成 `cloud`：協調器不會自動叫它，還是要有人去叫 Grok 看卡片。

## 4. 安全設定（家長在階段 0 完成）

Erin 會自己跟 agent 對話，而這台電腦上有家長的 GitHub 登入和其他專案，所以：
1. **Codex 權限**：Erin 使用時選「只能改工作資料夾、其他動作先詢問」，不要用完整權限。終端機版用 `codex -s workspace-write -a on-request -C ~/Dev/projects/erin`，或建立 `~/.codex/erin.config.toml`（內容 `sandbox_mode = "workspace-write"`、`approval_policy = "on-request"`），再用 `codex -p erin` 開。
2. **Grok Bot 權限**：本機工具改成每次執行前詢問，家長在旁邊時才按允許。
3. **上線權限**：agent 不 push；上線由家長做，或家長當場指示。
4. **陪伴**：Erin 跟 agent 對話時，家長在旁邊，或事後看一下對話紀錄。
5. **建議再多一層**：幫 Erin 開一個 macOS「標準」使用者帳號，只 clone `erin` repo、不登入家長的 GitHub。agent 在她的帳號裡碰不到家長的其他專案和憑證；要上線時家長再用自己的帳號 push。
6. **隱私**：照 §2「Erin 的小規則」與 §3.3，不把 Erin 的個人資料給 AI 或寫進公開 repo。

## 5. 分階段計畫

一次只做一個階段，每個階段都要能玩。每個階段一張卡（owner `codex`、reviewers `["grok"]`，用 `dependsOn` 串起來）。「Grok 特別檢查」是除了 §6 通用清單以外，這個階段要多看的地方。

### 階段 0：開工準備（`survivor-stage-0-setup`）
- **開始方式**：家長在 Codex 打開 erin 資料夾，說「讀 `docs/survivor-game-plan.md`，做階段 0」。`AGENTS.md` 建好以前，這份文件就是規則。
- **Erin 先決定**（「我的遊戲設計單」，參考 `GAME_WORKFLOW.md` 遊戲規劃師的格式）：
  - 遊戲叫什麼名字？
  - 主角是誰？什麼顏色、什麼形狀？
  - 第一種敵人叫什麼？長什麼樣子？（要可愛，不要可怕）
  - 遊戲發生在哪裡？（草地、雪地、糖果王國……）
  - 主角一開始用什麼攻擊？（星星、泡泡、音符……）
  - 要撐幾分鐘才算贏？
  - 你最想看到的一個畫面是什麼？

  答案由 agent 記成收件匣 `kind: request`，原話照抄。
- **家長**：完成 §4 安全設定；確認 §3 的分工。
- **Codex 做**：建立 `AGENTS.md`（整理 §3）、`CLAUDE.md`（只寫一行 `@AGENTS.md`，讓 Claude Code 讀同一份規則）、`coord/` 目錄和 `knowledge/` 三個檔、階段 0～6 的任務卡；把 Erin 的設計單整理進 `DECISIONS.md`。這個階段不寫遊戲程式。
- **Grok 特別檢查**：卡片、審查、收件匣格式符合 §3；`AGENTS.md` 沒有和 kit 的 `RULES.md` 衝突。
- **完成條件**：家長確認規則（改協作規則屬 kit 的 B 級）並 merge。

### 階段 1：移動與敵人（`survivor-stage-1-move`）
- **Erin 先決定**：主角有幾顆心？敵人走得快還是慢？
- **Codex 做**：
  - 照 Erin 設計單畫主角和第一種敵人（色塊版）；地面格子、外框、陰影、眼睛、走路彈跳。
  - 角色跟著浮動搖桿／方向鍵／WASD 移動。
  - 敵人從畫面外生成、朝玩家走；碰到扣血，受傷後短暫無敵（閃爍）。
  - 血量歸零 → 結束畫面 → 重新開始（不用重新整理網頁）；暫停按鈕。
  - ✏️ Erin 設定區，以及 `ENEMY_TYPES`、`SPRITES` 資料表的骨架。
  - 首頁加遊戲卡片（說明先寫「製作中」）。
- **Grok 特別檢查**：搖桿和暫停按鈕不互相干擾；無敵計時在碰撞判定之後才扣。
- **Erin 試玩**：搖桿好不好按？主角太快還是太慢？被撞到會不會太痛？
- **Erin 自己改**：主角速度、主角血量、敵人速度、主角顏色。
- **學到什麼**：座標（x, y）、速度＝每秒走多遠、遊戲迴圈（畫面一秒更新很多次）、碰撞＝兩個圓靠得太近。
- **完成條件**：iPad 和電腦都能順順玩一局、輸了能重來；Erin 覺得「控制起來很舒服」。

### 階段 2：自動攻擊與經驗（`survivor-stage-2-attack`）
- **Erin 先決定**：她在設計單選的攻擊是什麼顏色、多大？經驗寶石什麼顏色？敵人被打倒時要怎麼消失？
- **Codex 做**：自動朝最近的敵人發射子彈；敵人有血量；受擊閃白、死亡粒子、傷害數字；死亡掉經驗寶石，靠近自動吸取；經驗條。
- **Grok 特別檢查**：「最近的敵人」算得對；子彈、粒子、寶石都有上限並重複使用；飛出畫面的子彈會回收。
- **Erin 試玩**：打怪爽不爽？寶石被吸過來的感覺好不好？
- **Erin 自己改**：射速、子彈傷害、子彈速度、吸寶石的範圍。
- **學到什麼**：陣列（一群敵人、一堆子彈）、找最近的（一個一個比距離）。
- **完成條件**：可以一邊跑一邊自動打倒敵人、收集寶石。

### 階段 3：升級三選一（`survivor-stage-3-levelup`）
- **Erin 先決定**：自己設計一張升級卡（名字、emoji 圖示、效果），例如「彩虹鞋：跑更快」。
- **Codex 做**：經驗滿就暫停，跳出 3 張大卡片（手指好按）選一個；`UPGRADES` 資料表，包含：
  - 移動速度提升、最大血量／回血
  - 子彈數 +1、攻速提升、傷害提升
  - 新武器：環繞角色旋轉的劍、朝隨機方向的閃電、周圍範圍傷害光環
  - Erin 設計的那張卡
- **Grok 特別檢查**：三張不重複；選完正確回到遊戲；同一種升級疊加多次也正確。
- **Erin 試玩**：哪張卡最好用？有沒有太強或沒用的卡？
- **Erin 自己改（挑戰）**：照著表格裡的例子，自己在 `UPGRADES` 加一張卡，或改一張卡的數字。
- **學到什麼**：資料表（每張卡是一筆資料）、隨機抽 3 張不重複。
- **完成條件**：可以連續升級好幾次，Erin 設計的卡真的出現在遊戲裡。

### 階段 4：時間、難度和 Boss（`survivor-stage-4-waves`）
- **Erin 先決定**：設計一種新敵人（名字、顏色、快或慢、幾滴血）；Boss 叫什麼、長什麼樣子？撐幾分鐘算贏（例如 5 分鐘）？
- **Codex 做**：計時；`WAVES` 資料表（第幾秒開始出哪種敵人、出多快）；快速小隻、慢速大隻和 Erin 設計的敵人；最後出現 Boss；勝利畫面。前 30 秒幾乎不會死。
- **Grok 特別檢查**：敵人多的時候手機也不卡；難度照 `WAVES` 表走；打倒 Boss 或撐到時間都會正確結束。
- **Erin 試玩**：玩 3 次，每次記下「第幾分鐘開始變太難或太簡單」。
- **Erin 自己改**：調 `WAVES` 表的數字，找到「有點難但贏得了」的感覺。遊戲設計師叫這個「平衡」。
- **學到什麼**：計時器、難度曲線、用表格設計關卡。
- **完成條件**：一局有開始、變難、Boss、勝利或失敗；Erin 覺得難度剛好。

### 階段 5：打磨和 Erin 的美術（`survivor-stage-5-polish`）
- **Erin 先決定／動手做**：用 Piskel 畫主角和 1～2 種敵人（建議 16×16 或 32×32、背景透明），匯出 PNG；想不出來可以先用 `GAME_WORKFLOW.md` 的「遊戲美術素材 Gem」找靈感。選音效：程式合成，或照 `ASSETS.md` 用 Kenney 音效。
- **Codex 做**：
  - 把 Erin 的圖放進 `games/survivor/assets/`，在 `SPRITES` 表換上（還沒畫的繼續用色塊）。
  - 音效（Web Audio 簡單合成即可；iPad 要等第一次點擊後才能出聲）。
  - 最佳紀錄存在 `localStorage`（讀寫包 try/catch）。
  - 開始畫面、結算畫面；設定：音效開關、畫面震動開關。
  - 首頁卡片說明改成正式介紹；`GAMES_IDEAS.md` 的「已完成」表加一行。
- **Grok 特別檢查**：圖片、音效都在本地；用了外部素材就有 `assets/CREDITS.md`；圖片放大後保持像素感；聲音不會一打開就很吵。
- **Erin 試玩**：自己畫的角色放進遊戲裡看起來怎麼樣？要不要再修圖？
- **Erin 自己改**：音量、震動強度，或回 Piskel 修圖再換上。
- **學到什麼**：圖片也是用座標畫上去的、存檔（localStorage）、音效。
- **完成條件**：Erin 畫的角色出現在遊戲裡；首頁卡片點得進來。

### 階段 6：發表會（`survivor-stage-6-share`）
- **Erin**：用 `GAME_WORKFLOW.md` 的「作品分享 Gem」準備介紹，講給家人或同學聽：原本想做什麼、做出了什麼、遇到什麼問題、怎麼跟 AI 說明問題、最喜歡哪一段、下次想改什麼。
- **Codex 做**：把 `coord/inbox/done/` 裡 Erin 每個階段說過的話整理成時間軸給她參考（只整理，不替她寫講稿）。
- **完成條件**：Erin 發表完；她「下次想改什麼」記進收件匣（`kind: request`），之後再決定要不要做。

## 6. Grok 審查清單（每個階段都要看）

標了 commit 的是這個 repo 以前真的踩過的坑，階段 0 要抄進 `coord/knowledge/PITFALLS.md`。

**iPad／手機**
- [ ] 遊戲區 `touch-action: none`；頁面不捲動、雙擊不縮放、長按不選字也不跳選單（擋 `contextmenu`、`user-select: none`、`-webkit-touch-callout: none`）。（`b30f128`）
- [ ] 搖桿用 Pointer Events + `setPointerCapture`，只追蹤第一根手指的 `pointerId`；按暫停按鈕不會叫出搖桿。（`9b627ad`：按鈕和滑動互相干擾）
- [ ] 沒有用 media query（例如 `(hover: hover) and (pointer: fine)`）把觸控介面藏起來。（`9f5980b`：賽車觸控按鈕在平板消失）
- [ ] 沒用舊 iPad 不支援的 API：`ctx.roundRect` 曾讓賽車在舊平板壞掉，改用 `rect` 或自己畫路徑（`4bf7502`）；`Array.prototype.at`、`structuredClone` 這類較新的 API 也先不用。
- [ ] 直橫向切換、改視窗大小後畫面正確；canvas 改大小會重置繪圖設定，要重設 `imageSmoothingEnabled = false`。
- [ ] 切到別的 App 會自動暫停；回來時角色不會瞬移（`dt` 有上限，例如 0.05 秒）。

**遊戲邏輯**
- [ ] 移動和計時用 `dt`（秒），不是每幀固定值。
- [ ] 無敵計時在碰撞判定之後才扣。（`612cbd8`：賽車無敵最後一幀被撞）
- [ ] 重新開始會重設所有狀態，不用重新整理網頁。
- [ ] 敵人、子彈、粒子、寶石有上限並重複使用物件；一般遊玩維持 60fps。

**專案慣例**
- [ ] `game.js` 最上面有 ✏️ Erin 設定區，註解小學生看得懂；新東西加在資料表。
- [ ] `index.html` 的 `game.js`、`style.css` 有更新 `?v=` 版本號。（`df627e2`：iPad 讀到舊快取）
- [ ] 沒有外部圖片／音效網址；外部素材照 `ASSETS.md`，並有 `assets/CREDITS.md`。
- [ ] 文字是繁體中文、字大、少字；沒有血腥或嚇人的畫面。
- [ ] 改動沒有超出卡片範圍。

## 7. 驗收標準

**遊戲**
- 在 iPad Safari 用虛擬搖桿順暢遊玩，不會捲動或縮放頁面。
- 電腦用方向鍵／WASD 可以玩。
- 至少完成階段 1～3，並在入口頁面有卡片連結。

**Erin 的參與**
- 遊戲名稱、主角、至少一種敵人和一張升級卡是 Erin 設計的。
- 每個階段 Erin 都在 iPad 上試玩過，並自己改過至少一個數字。
- Erin 的設計決定和試玩回饋都有原話紀錄（收件匣）並整理進 `DECISIONS.md`。

**協作流程**
- 每張卡都有 `grok` 對最後一個實質 commit 的 approve 審查檔。
- 每次上線都有家長的 `approve` 收件匣檔；沒有 agent 自己 push（推送前一定先讓家長確認）。
