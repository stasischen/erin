# 如何新增遊戲

## 步驟

### 1. 在 `games/` 下建立遊戲資料夾

```
games/
├── ice-cream-stacker/      ← 第一個遊戲（參考範例）
└── 你的遊戲名稱/
    ├── index.html           ← 遊戲本體
    ├── game.js              ← 遊戲程式
    └── style.css            ← 遊戲樣式
```

### 2. 在入口頁面加入卡片

編輯根目錄的 `index.html`，在 `<section class="game-grid">` 裡加入：

```html
<a href="games/你的遊戲名稱/" class="game-card" style="--card-color: #ff8eb2">
  <span class="game-icon">🎮</span>
  <span class="game-title">遊戲中文名稱</span>
  <span class="game-desc">一句話介紹這個遊戲</span>
</a>
```

- `--card-color` 可以改成任何喜歡的顏色
- `game-icon` 放一個 emoji 代表遊戲

### 3. Commit 並 Push

```bash
git add .
git commit -m "新增遊戲：你的遊戲名稱"
git push
```

GitHub Pages 會自動更新，大約 1-3 分鐘後上線。

---

## 平板測試

打開 https://stasischen.github.io/erin/ 就可以玩了。
