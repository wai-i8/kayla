# KAYLA

私人家庭 BB 照顧指南及日常記錄網站。手機優先，亦支援電腦版。

## 已完成

- Firebase Email/Password 私人登入，未登入前不讀取 BB 資料
- Firebase Realtime Database `/kayla` 資料讀寫
- BB Profile、日齡及疫苗參考日期
- 餵奶、尿片、體溫、睡眠、藥物、體重及備註紀錄
- 今日摘要及家庭紀錄時間線
- `raw.pdf` 46 頁全文搜尋及主題導覽
- 手機底部操作列及響應式電腦版
- 本機示範模式，不會接觸正式 Firebase

## 本機執行

需要 Node.js 18 或以上。

```powershell
npm install
npm run dev
```

開啟 `http://127.0.0.1:5173/`。

開發時可以使用以下網址查看示範資料：

```text
http://127.0.0.1:5173/?demo=1
```

示範模式只會在 Vite development build 啟用；正式 GitHub Pages build 不會接受 `?demo=1` 繞過登入。

## Firebase

App 已連接現有 Firebase project `elegant-moment-284814`，私人資料固定寫入 `/kayla`，不會觸碰 pronunciation 使用的 `/e`。

兩個家庭登入 ID 只保存於被 Git 忽略嘅本機設定，唔會公開到 repository。正式使用前必須閱讀 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)，填入本機 ID 並將 `/kayla` 節點合併到現有 Realtime Database Rules。不要直接部署整份範本規則，否則可能令舊 `/e` App 失去權限。

密碼、service-account JSON 及管理員金鑰不可放入 GitHub。

## 檢查與建置

```powershell
npm run typecheck
npm run build
npm audit
```

## GitHub Pages

推送到新 repository `wai-i8/kayla` 的 `main` branch 後，GitHub Actions 會建立並部署 `dist`。首次使用需在 repository Settings → Pages 將 Source 設為 GitHub Actions。
