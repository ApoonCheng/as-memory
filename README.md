# 🎴 美秀集團 翻牌配對

給美秀集團粉絲社群玩的記憶翻牌配對遊戲。開場秀出 4 位團員的卡片（各 2 張），幾秒後翻面，憑記憶把同一位團員配成對，全部配完計時最快！純前端，**不需要資料庫**。

## 玩法

1. 按「開始遊戲」→ 8 張卡片正面朝上 3 秒
2. 卡片翻面，點兩張：同一位團員就消失，配錯則翻回去
3. 全部配完顯示花費時間與步數，最佳成績會記在這台裝置上

## 換成真實團員照片（選用）

把照片放進 `public/members/`，檔名對應：

| 檔名 | 團員 |
|------|------|
| `gobo.jpg` | 狗柏（主唱／吉他） |
| `guanyou.jpg` | 冠佑（鍵盤） |
| `zhongqi.jpg` | 鍾錡（鼓） |
| `tingwen.jpg` | 婷文（貝斯） |

放好重新整理即可自動套用；沒放照片時會顯示「名字＋樂器」角色卡。請使用你有權使用的照片。
（要改團員或顏色：編輯 `src/members.js`。）

## 本機執行

```powershell
npm install
npm run dev
```

## 部署（Vercel，免費）

```powershell
git init
git add .
git commit -m "美秀翻牌配對"
git branch -M main
git remote add origin https://github.com/你的帳號/as-memory.git
git push -u origin main
```

再到 [vercel.com](https://vercel.com) → Add New → Project → 選這個 repo → Deploy（無環境變數要設）。

## 技術

Vue 3 + Vite，純靜態，CSS 3D 翻牌動畫。
