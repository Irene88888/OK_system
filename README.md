# 集團經營管理儀表板 — 集團損益

以 React + Vite 打造的內部經營管理儀表板，目前已完成「三、集團損益」頁面（貿易損益／大漁損益／船務損益／合併總覽）。

> ⚠️ **資料機敏性提醒**：`src/App.jsx` 內含公司實際營收、成本、損益數字。建議建立 **Private repository**，並且**不要**用 GitHub Pages 免費方案公開發布（Public repo 的 GitHub Pages 網站任何人都能看到）。若要用 GitHub Pages，請改用 GitHub Enterprise / 企業版的私有 Pages，或改部署到公司內網、Vercel/Netlify 的密碼保護頁面。

## 本機開發

```bash
npm install
npm run dev
```

瀏覽器打開終端機顯示的網址（預設 http://localhost:5173）。

## 建置正式版

```bash
npm run build
```

輸出在 `dist/`，可以直接用任何靜態網站空間（公司內部伺服器、Nginx、Vercel 等）託管。

## 發布到 GitHub

1. 在 GitHub 建立一個新的 **Private** repository（例如 `group-pnl-dashboard`），先不要勾選「Add README」。
2. 在這個資料夾內執行：

   ```bash
   git init
   git add .
   git commit -m "Initial commit: 集團損益儀表板"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
   git push -u origin main
   ```

3. 之後只要修改資料、`git commit` + `git push`，就能保留版本紀錄。

## （選用）用 GitHub Pages 自動部署

已內建 `.github/workflows/deploy.yml`，每次 push 到 `main` 就會自動建置並發布。啟用方式：

1. GitHub repo 頁面 → **Settings → Pages**
2. **Source** 選擇 **GitHub Actions**
3. push 一次 `main` 分支後，Actions 分頁會自動跑建置流程，完成後網址會出現在 Pages 設定頁

再次提醒：這只適合**內部可公開瀏覽也無妨**的資料，或者確認你的 GitHub 方案支援私有 Pages。若資料機敏，建議改部署到公司內網或有密碼保護的平台。

## 專案結構

```
├── src/
│   ├── App.jsx        # 儀表板主體（含所有頁面元件與資料）
│   └── main.jsx        # React 進入點
├── index.html
├── vite.config.js
├── package.json
└── .github/workflows/deploy.yml   # GitHub Actions 自動部署
```

## 登入密碼

網站現在有一個簡易的登入畫面，設有 **3 組獨立密碼**，輸入任一組都能進入，方便個別管理／之後要停用某一組也不影響其他人。

> ⚠️ 這只是前端層級的簡易防護（防君子不防小人）。密碼不是明文寫在程式碼裡，而是存 SHA-256 雜湊值，但技術能力較強的人還是有辦法繞過，不是真正安全的後端驗證。如果之後需要更嚴謹的權限控管，可以比照「向 AI 提問」功能的做法，另外接一個後端驗證。

**目前預設的 3 組密碼：**

| 名稱 | 密碼 |
|---|---|
| 通行碼一 | `toro0210` |
| 通行碼二 | `ww2026` |
| 通行碼三 | `otr224` |

登入後這台裝置的瀏覽器會記住登入狀態（存在 `localStorage`），不用每次都重新輸入；要登出可以點畫面右下角的「登出」按鈕。

**怎麼更換／停用某一組密碼：**

1. 打開瀏覽器（在任何網頁上都可以），按 F12 打開開發者工具，切到 **Console** 分頁
2. 貼上以下程式碼，把 `你的新密碼` 換成想要的新密碼，按 Enter：
   ```js
   crypto.subtle.digest("SHA-256", new TextEncoder().encode("你的新密碼"))
     .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("")))
   ```
3. Console 會印出一串 64 位的英數字（雜湊值），複製起來
4. 到 GitHub → `src/App.jsx` → 搜尋 `PASSWORD_HASHES` → 把對應那一組的雜湊值換成新的（要停用某一組密碼，把該行刪掉即可）
5. Commit 存檔，等自動部署完成

## 更新資料

目前各事業群的數字是直接寫在 `src/App.jsx` 頂部的常數（`vessels`、`tradeCompanies`、`dayuCompanies` 等）。
下個月要更新時，把對應的數字改掉、`npm run build` 確認正常，再 commit / push 即可。若之後要串接真正的資料庫或 API，
建議把這些常數改成 `fetch` 動態載入。
