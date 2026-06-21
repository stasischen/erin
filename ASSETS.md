# 遊戲素材使用規則

這份文件用來決定 Erin 遊戲樂園可以使用哪些外部素材，以及素材要怎麼放進 repo。原則是：第一版先做可玩，遊戲能玩之後再換美術和音效。

## 基本規則

- 預設使用可商用、免署名或授權清楚的素材。
- 素材下載後放進該遊戲自己的 `assets/` 資料夾。
- 不直接引用外部圖片或音效網址。
- 不使用來源不明的圖片、音效或音樂。
- 不使用含有人物肖像、品牌 Logo、卡通角色、電影角色、遊戲角色的素材。
- 如果素材需要署名，必須在該遊戲的 `assets/CREDITS.md` 記錄。
- 如果授權看不懂，就先不要用。

## 推薦素材庫

### 1. Kenney

網址：https://kenney.nl/assets

建議等級：預設首選。

適合用途：

- 2D 角色
- UI 按鈕和面板
- 圖示
- 音效
- 簡單 3D 素材
- 快速 prototype

使用規則：

- 優先使用 Kenney。
- 下載素材後放到 `games/遊戲資料夾/assets/`。
- Kenney 的 asset pages 通常是 CC0，可商用、不需署名。
- 雖然不必署名，仍建議在 `assets/CREDITS.md` 記錄來源，方便以後查。

適合 Erin 的原因：

- 授權最單純。
- 風格一致。
- 檔案容易整理。
- 很適合小遊戲和教學流程。

### 2. Google Material Icons

網址：https://fonts.google.com/icons

建議等級：可用於功能 icon。

適合用途：

- 返回
- 開始
- 暫停
- 重新開始
- 設定
- 音量

使用規則：

- 只用於 UI 功能圖示，不拿來當遊戲主角。
- 可以下載 SVG 或 PNG 放進 `assets/`。
- 授權是 Apache 2.0，建議在 `assets/CREDITS.md` 記錄來源。
- 如果只是簡單小遊戲，也可以繼續用文字或 emoji，不一定要加 icon。

### 3. Kenney Audio

網址：https://kenney.nl/assets/category:Audio

建議等級：音效首選。

適合用途：

- 按鈕點擊
- 得分音效
- 撞到障礙物
- 過關
- 遊戲結束

使用規則：

- 音效優先從 Kenney 找。
- 檔案放進 `games/遊戲資料夾/assets/audio/`。
- 音量要小一點，不要讓遊戲一打開就很吵。
- 背景音樂不是第一版必要功能。

## 備選素材庫

這些素材庫可以用，但不當作 Erin 的預設來源。使用前要先檢查授權。

### 4. OpenGameArt

網址：https://opengameart.org

建議等級：大人協助挑選。

適合用途：

- 特殊角色
- 背景
- 音樂
- 比 Kenney 更有風格的素材

使用規則：

- 優先只使用 CC0。
- CC-BY 可以用，但一定要署名。
- 先不要使用 CC-BY-SA、GPL、OGA-BY 等比較複雜的授權。
- 每次使用都要建立或更新 `assets/CREDITS.md`。

### 5. itch.io Free Game Assets

網址：https://itch.io/game-assets/free

建議等級：大人協助挑選。

適合用途：

- 像素風角色
- 橫向捲軸地圖
- RPG tileset
- 特定主題素材包

使用規則：

- 每個素材包授權都不同，不能只看它是免費就直接用。
- 下載前要確認能不能用在公開網站。
- 若需要署名，要寫進 `assets/CREDITS.md`。
- 不建議讓 Erin 自己自由搜尋和下載。

### 6. Sonniss GDC Audio Bundle

網址：https://sonniss.com/gameaudiogdc/

建議等級：進階音效備選。

適合用途：

- 高品質環境音
- 動作音效
- 特殊效果音

使用規則：

- 可商用、通常不需署名，但素材包很大。
- 不適合第一版小遊戲流程。
- 只在真的需要專業音效時再用。
- 使用時仍建議在 `assets/CREDITS.md` 記錄來源。

### 7. Freesound

網址：https://freesound.org

建議等級：最後備選。

適合用途：

- 找非常特定的單一音效。

使用規則：

- 只使用 CC0。
- 不使用需要署名或有額外限制的音效，除非大人已確認。
- 下載後放進 `assets/audio/`。
- 在 `assets/CREDITS.md` 記錄來源頁面。

### 8. Eagle 免費遊戲素材整理

網址：https://tw.eagle.cool/blog/post/free-game-assets

建議等級：先找素材來源的索引站。

適合用途：

- 快速整理可用的 2D、3D、像素風、角色與音效來源
- 找靈感
- 當作素材搜尋清單的入口

使用規則：

- 這是整理型文章，不是單一素材包；實際使用前還是要點進每個素材站確認授權。
- 適合拿來做資料蒐集，不建議直接當成素材下載終點。
- 如果最後採用的是文章裡提到的某個素材站，要回到那個素材頁面記錄到 `assets/CREDITS.md`。

### 9. hacked.design Pixel Characters

網址：https://hackeddesign.itch.io/pixel-characters

建議等級：可直接使用的像素角色備選。

適合用途：

- 16x16 像素角色
- 頭身拆件混搭
- 小型 2D 遊戲的主角或 NPC

使用規則：

- 可以放進遊戲中使用，通常不需要署名，但有署名也可以。
- 不要把原始素材或改過的素材再當成獨立素材包販售或重新上架。
- 不要用於 NFT 或 AI 生成相關用途。
- 下載後放進對應遊戲的 `assets/`，需要時再寫進 `assets/CREDITS.md`。

## 素材放置方式

建議結構：

```text
games/
└── 遊戲資料夾/
    ├── index.html
    ├── style.css
    ├── game.js
    └── assets/
        ├── CREDITS.md
        ├── player.png
        ├── enemy.png
        └── audio/
            ├── score.wav
            └── game-over.wav
```

在程式裡引用：

```js
const playerImage = new Image();
playerImage.src = "assets/player.png";
```

音效引用：

```js
const scoreSound = new Audio("assets/audio/score.wav");
scoreSound.volume = 0.35;
```

## CREDITS 範本

每個有外部素材的遊戲，都可以在 `assets/CREDITS.md` 放這個格式：

```md
# 素材來源

## player.png

- Source: Kenney
- URL: https://kenney.nl/assets/...
- License: CC0
- Notes: 用作玩家角色

## score.wav

- Source: Kenney Audio
- URL: https://kenney.nl/assets/...
- License: CC0
- Notes: 得分音效
```

## 使用前檢查

- [ ] 素材來源清楚。
- [ ] 授權允許公開網站使用。
- [ ] 若需要署名，已寫進 `assets/CREDITS.md`。
- [ ] 素材已下載到本地 `assets/`。
- [ ] 程式沒有直接引用外部圖片或音效網址。
- [ ] 檔案大小合理，沒有把超大的素材包整包放進 repo。
- [ ] 素材內容適合兒童遊戲。
