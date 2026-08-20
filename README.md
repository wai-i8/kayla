# KAYLA

私人家庭 BB 照顧指南及日常記錄網站。手機優先，亦支援電腦版。

## 已完成

- Firebase Email/Password 私人登入，未登入前不讀取 BB 資料
- Firebase Realtime Database `/kayla` 資料讀寫
- BB Profile、日齡及疫苗參考日期
- 餵奶、尿片、體溫、睡眠、藥物、體重及備註紀錄
- 記錄欄位會自動學習常用數值，兩個家庭帳戶可共用及管理快捷選項
- 今日摘要及家庭紀錄時間線
- 私人家庭相簿：瀏覽器先壓縮成 JPEG，再以 Firebase Storage 儲存原圖及縮圖
- 結構化英格蘭 BB 照顧指南：按主題搜尋、分段官方來源、真人情境圖片及官方示範連結；`raw.pdf` 只保留作歷史參考
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

App 已連接現有 Firebase project `elegant-moment-284814`，私人資料固定寫入 `/kayla`，不會觸碰 pronunciation 使用的 `/e`。相片檔案使用私人 Firebase Storage bucket `elegant-moment-284814.firebasestorage.app`；Realtime Database 只保存相片 metadata 同 Storage path，唔保存圖片本身或永久下載網址。

兩個家庭登入 ID 只保存於被 Git 忽略嘅本機設定，唔會公開到 repository。正式使用前必須閱讀 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)，填入本機 ID，將 `/kayla`（包括新版 `/kayla/photos`）合併到現有 Realtime Database Rules，亦要合併及發布私人 Storage Rules 同設定 CORS。不要直接部署整份範本規則，否則可能令舊 `/e` App 失去權限。

密碼、service-account JSON 及管理員金鑰不可放入 GitHub。

指南內嘅本地真人相片只採用可重新發布嘅 Public Domain／Creative Commons 素材；完整作者、原始連結、授權同使用限制記錄於 [GUIDE_MEDIA_CREDITS.md](./GUIDE_MEDIA_CREDITS.md)。NHS、UNICEF UK 同 RCUK 等受限制示範只提供官方連結，唔會下載再發布。

## 檢查與建置

```powershell
npm run typecheck
npm run validate:guides
npm run build
npm audit
```

## GitHub Pages

推送到新 repository `wai-i8/kayla` 的 `main` branch 後，GitHub Actions 會建立並部署 `dist`。首次使用需在 repository Settings → Pages 將 Source 設為 GitHub Actions。
