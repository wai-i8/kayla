# KAYLA Firebase 設定

呢個專案會沿用現有 Firebase project，但將 KAYLA 私人資料只放喺 Realtime Database 嘅 `/kayla`。原本 pronunciation 使用嘅 `/e` 唔屬於 KAYLA，唔應該由新網站讀寫。

## 安全重點

- 網站唔提供註冊功能，兩個帳戶由你喺 Firebase Console 手動建立。
- 密碼只可以喺 Firebase Authentication 或網站登入畫面輸入；唔好放入任何程式碼、`.env`、JSON、GitHub commit 或對話。
- `firebaseConfig` 係前端 Firebase project 設定，唔係管理員密碼；但 service-account JSON、private key 同密碼絕對唔可以放入 repository。
- 未登入或唔係白名單內嘅帳戶，唔可以讀取或寫入 `/kayla`。
- 只係 React 畫面隱藏資料並不足夠，真正權限由 Firebase Console 已發布嘅 Realtime Database Rules（CLI 使用本機 `database.rules.local.json`）強制執行。
- 相片檔案由 Firebase Storage Rules 獨立保護；發布 Realtime Database Rules 唔會自動更新 Storage Rules，反之亦然。

## 1. 建立兩個登入帳戶

喺 Firebase Console 開啟：

`Authentication → Sign-in method → Email/Password`

只需啟用 `Email/Password`，唔需要啟用 Email link。然後到：

`Authentication → Users → Add user`

手動建立：

1. Owner：你自己使用，可以修改全部 KAYLA 資料。
2. Family：屋企人使用，可以睇全部 KAYLA 資料、加入日常紀錄、預約、疫苗及 checklist，但唔可以修改 BB 基本資料、網站設定或指南覆寫內容。

兩個人應該用唔同帳戶及唔同密碼。登入 ID 可以係 Firebase 接受嘅 email 格式字串，唔一定係真實收信地址；但假 email 無法使用一般「忘記密碼」電郵流程。

## 2. 套用本機家庭帳戶白名單

為免公開 GitHub repository 洩露登入 ID，`database.rules.json` 只保留安全 placeholder；兩個真實 ID 只存放喺已被 `.gitignore` 排除嘅 `firebase-access.local.json`。

合併 Rules 前，按本機檔案內容將以下兩個 placeholder 換成完整登入 ID：

```text
REPLACE_OWNER_LOGIN_ID@example.invalid
REPLACE_FAMILY_LOGIN_ID@example.invalid
```

規則只會比較登入 ID，任何密碼都唔應該寫入程式碼或規則。日後如果更改帳戶，必須同步更新本機設定同 Firebase Authentication；字串大小寫要完全一致。

## 3. `/kayla` 權限安排

目前規則如下：

| 路徑 | Owner | Family |
| --- | --- | --- |
| `/kayla` 全部內容 | 讀取 | 讀取 |
| `/kayla/baby` | 讀寫 | 只讀 |
| `/kayla/settings` | 讀寫 | 只讀 |
| `/kayla/contentOverrides` | 讀寫 | 只讀 |
| `/kayla/members/{uid}` | 自動建立自己嘅 Owner UI 標記 | 不可建立 Owner 標記 |
| `/kayla/quickOptions/{field}/{id}` | 讀寫 | 讀寫 |
| `/kayla/photos/{id}` | 讀寫 metadata | 讀寫 metadata |
| `/kayla/records/{id}` | 讀寫全部紀錄 | 新增及修改／刪除自己建立嘅紀錄 |
| `/kayla/appointments/{id}` | 讀寫 | 讀寫 |
| `/kayla/vaccinations/{id}` | 讀寫 | 讀寫 |
| `/kayla/checklists/{id}` | 讀寫 | 讀寫 |

Owner 第一次登入時，網站會嘗試喺自己 UID 下建立 `role: "owner"`。Firebase Rules 只容許白名單 Owner 完成呢個寫入；Family 會被拒絕並保持家庭成員介面。呢個安排令公開網站程式唔需要包含完整登入 ID 或由登入 ID 衍生嘅值。

記錄表格會將成功儲存過嘅輸入同步到 `/kayla/quickOptions`，下次可以一撳填入。快捷選項係兩個家庭帳戶共用，刪除快捷選項只會移除常用答案，唔會刪除或修改舊紀錄。數字會以標準格式去重，例如 `20`、`20.0` 同 `020` 只會保留一個；藥物會將藥名、濃度、服用份量同單位整組保存，避免將獨立份量配到另一種藥。一般輸入每欄最多顯示最近六項，進入「管理」仍可檢視及刪除其餘項目。

每個新日常紀錄必須包含：

```json
{
  "type": "feed",
  "occurredAt": 1787076000000,
  "createdAt": 1787076000000,
  "createdBy": "目前登入者的 Firebase UID"
}
```

- `type` 必須係 `feed`、`nappy`、`temperature`、`sleep`、`medicine`、`weight` 或 `note`。
- `occurredAt` 及 `createdAt` 必須係數字 timestamp（毫秒）。
- `createdBy` 必須等於目前登入者 `auth.uid`，唔可以由瀏覽器冒認另一個人。
- `details` 會按紀錄種類檢查必要欄位同合理範圍，例如體溫 30–45°C、奶量 1–1000 ml；藥物只會按你輸入嘅濃度同服用份量作數學換算，唔會建議服用份量。
- Owner 可以管理任何紀錄；Family 只可以管理自己建立嘅紀錄。
- 刪除紀錄係容許嘅，因此刪除時唔會要求上述欄位仍然存在。

React 程式建立紀錄時必須跟呢個格式，否則 Firebase 會回覆 `PERMISSION_DENIED`。

## 4. 部署前一定要合併原有規則

**重要：部署 Realtime Database rules 係更換成個 database instance 嘅根規則，唔係只追加 `/kayla`。**

呢份 `database.rules.json` 只係公開範本：根目錄 `.read` 同 `.write` 都係 `false`，只明確開放 `/kayla`。如果將範本當成完整 Rules 部署，現有 `/e`、`/clothes`、`/orders`、`/users` 等路徑嘅合法使用者會失去存取權。

正式部署前：

1. 到 `Firebase Console → Realtime Database → Rules`。
2. 複製並安全保存目前完整 rules；如果使用 CLI，就將完整內容存成已被 Git 忽略嘅 `database.rules.local.json`。
3. 保留目前 `/e` 等仍然需要使用嘅受保護規則。
4. 將公開範本 `database.rules.json` 內嘅 `"kayla": { ... }` 節點合併入完整 Rules 根 `"rules"` 物件，並只喺本機完整檔案換入兩個登入 ID。
5. 確認根目錄冇使用 `".read": true` 或 `".write": true`，亦確認 `database.rules.local.json` 繼續被 Git 忽略。
6. 喺 Rules Playground 分別測試 Owner、Family、其他已登入帳戶及未登入狀態。
7. 測試 `/e` 原有 App 正常後，先正式 Publish。

唔好估計或重寫 `/e` 嘅規則；應以 Firebase Console 目前真正運作緊嗰份規則為準。例如現有 `/e` 只有一個指定登入 ID 可以使用，就應該保留同一條件。

### 相簿 metadata 亦要合併及發布

新版 `database.rules.json` 嘅 `"kayla"` 節點已包括 `"photos"`。如果 Firebase Console 仲係較早版本嘅 `/kayla` Rules，必須將呢個 `"photos": { ... }` block 一併合併入現有 `/kayla` 節點再 Publish；只更新 Storage Rules 並不足夠，否則相片檔案可能上傳成功，但網站會因為無權寫 `/kayla/photos/{id}` 而清理剛上傳嘅檔案並顯示錯誤。

每張相只會喺 Realtime Database 儲存 metadata，例如：

```json
{
  "kayla": {
    "photos": {
      "RANDOM_PHOTO_ID": {
        "storagePath": "kayla/photos/bb_RANDOM_PHOTO_ID.jpg",
        "thumbnailPath": "kayla/photos/bb_RANDOM_PHOTO_ID_thumb.jpg",
        "capturedAt": 1787076000000,
        "createdAt": 1787076000000,
        "createdBy": "目前登入者的 Firebase UID",
        "createdByLabel": "家庭成員",
        "caption": "可選說明",
        "width": 1920,
        "height": 1280
      }
    }
  }
}
```

- `RANDOM_PHOTO_ID` 係每張相獨立產生、不可預測嘅 ID。
- `storagePath` 同 `thumbnailPath` 必須完全對應該 ID；資料庫唔會接受任意路徑。
- `createdBy` 必須係目前登入者 `auth.uid`；日期、尺寸、文字長度同額外欄位亦由 Rules 驗證。
- 相簿 metadata 唔係日常照顧紀錄，唔會混入 `/kayla/records`。

## 5. 設定私人 Firebase Storage 相簿

### 5.1 確認 bucket 名稱

呢個 project 新建立嘅 default bucket 正確名稱係：

```text
elegant-moment-284814.firebasestorage.app
```

`.env` 亦應該使用：

```text
VITE_FIREBASE_STORAGE_BUCKET=elegant-moment-284814.firebasestorage.app
```

唔好改成舊式 `elegant-moment-284814.appspot.com`；新 default bucket 名稱唔會因為加入 Blaze plan 而改變。

### 5.2 合併並發布 Storage Rules

`storage.rules.example` 係可以提交到 GitHub 嘅 placeholder 範本。佢只針對 `/kayla/photos/{fileName}`，規則效果如下：

- 只有兩個白名單 Firebase Authentication 帳戶先可以 `get`、`create` 同 `delete`。
- 禁止列出成個 folder（`list`）同覆寫現有 object（`update`）。網站只會經受保護嘅 Realtime Database metadata 得知準確 path，再逐張 `get`。
- 只接受 `bb_*.jpg`、MIME type `image/jpeg`、每個 object 最多 `2 MiB`。
- 原圖同縮圖都係獨立 JPEG object；兩者使用同一組限制。

正式發布前：

1. 到 `Firebase Console → Storage → Rules`，先複製並安全保存現有完整 Storage Rules。
2. 將 `storage.rules.example` 嘅 `match /kayla/photos/{fileName}` 同 `isKaylaFamily()` 合併入現有 rules，唔好刪走其他仍然使用緊嘅 `match`。
3. 喺本機副本 `storage.rules.local` 將兩個 `REPLACE_...` placeholder 換成完整登入 ID；呢個檔案已被 `.gitignore` 排除。
4. 喺 Rules Playground 測試兩個家庭帳戶、其他帳戶同未登入狀態，再 Publish。

唔好將兩個真實登入 ID、密碼或 service account key 寫入 `storage.rules.example` 或 commit。隨機檔名只係減少猜測風險，真正私隱保障仍然係 Authentication 加 Storage Rules。

如果目前仍有 `match /{allPaths=**}` 並對家庭帳戶 `allow read, write` 嘅舊規則，必須移除或收窄；Firebase Storage 多條符合嘅 `allow` 係「任何一條成功就放行」，所以另外加一條 `allow list, update: if false` 唔會抵消舊嘅廣泛放行規則。

### 5.3 設定及驗證 CORS

網站用 Firebase SDK `getBlob()` 直接讀取私人 JPEG，再建立短暫嘅 browser object URL；呢個方法每次讀取都會經 Storage Rules。由 GitHub Pages 或本機開發／預覽網址直接讀 blob 前，bucket 要容許指定 origin 嘅 `GET` CORS。`storage.cors.example.json` 只包括正式網站、Vite dev (`5173`) 同 preview (`4173`) 嘅本機 origin，冇使用 `"*"`。

安裝及登入 Google Cloud CLI 後套用：

```powershell
gcloud storage buckets update gs://elegant-moment-284814.firebasestorage.app --cors-file=storage.cors.example.json
```

再讀回設定確認：

```powershell
gcloud storage buckets describe gs://elegant-moment-284814.firebasestorage.app --format="default(cors_config)"
```

如果日後正式網站搬去另一個 domain，必須先將準確 origin 加入 CORS，再重新套用。CORS 唔係登入授權，亦唔應該用 `"*"` 代替 Storage Rules；佢只係容許指定網頁 origin 喺瀏覽器發出跨來源讀取。

### 5.4 相片下載私隱

KAYLA 唔會呼叫 `getDownloadURL()`，亦唔會將帶長期 download token 嘅 URL 存入 Realtime Database。網站只保存 Storage path，登入後以 `getBlob()` 讀取，並喺離開畫面或登出時撤銷短暫 object URL。唔好手動將 Firebase Console 產生嘅下載連結貼入 database、GitHub、訊息或公開頁面。

### 5.5 Blaze、Always Free 同預算

由 2026 年 2 月 3 日開始，Cloud Storage for Firebase project 必須使用按量付費 Blaze plan 先可以維持 bucket 存取；Blaze 仍然可以享用無費用額度，但唔等於設定咗硬性「永遠零收費」。呢個 bucket 位於 `us-east1`，符合 Google Cloud Storage Always Free 指定地區，目前包括每月 `5 GB-month` Standard storage，另有操作及 data transfer 免費限額；超額、其他服務或日後價格變更仍可能產生費用。

建議喺 Google Cloud Billing 設定細額 budget alerts，並定期查看 Firebase Storage Usage／Google Cloud Billing。Budget alert 係通知，唔係自動停機上限。詳情以 [Firebase Storage billing FAQ](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) 同 [Google Cloud Storage pricing](https://cloud.google.com/storage/pricing) 最新內容為準。

## 6. 建議測試清單

部署前至少確認：

- 未登入讀 `/kayla`：拒絕。
- 未登入寫 `/kayla/records/test`：拒絕。
- 其他 Firebase 帳戶讀／寫 `/kayla`：拒絕。
- Owner 讀寫 `/kayla/baby`：成功。
- Family 讀 `/kayla/baby`：成功；寫入：拒絕。
- Owner 同 Family 新增合規 record：成功。
- Owner 同 Family 新增及刪除自己需要嘅 `/kayla/quickOptions`：成功；其他帳戶：拒絕。
- 新增紀錄後，相應快捷選項出現；刪除快捷選項後，舊紀錄仍然存在。
- Family 修改另一位使用者嘅 record：拒絕。
- Owner 修改或刪除任何 record：成功。
- Owner 同 Family 新增合規 `/kayla/photos/{id}` metadata：成功；其他帳戶及未登入：拒絕。
- metadata path 唔符合 `bb_<相同 ID>.jpg`，或嘗試加入未知欄位：拒絕。
- Owner 同 Family 上傳／讀取／刪除合規 JPEG：成功。
- 上傳非 JPEG、超過 2 MiB、錯誤檔名、覆寫現有 object 或列出 `/kayla/photos`：拒絕。
- 登出後，已載入相片唔會繼續顯示；直接嘗試取得私人 object：拒絕。
- GitHub Pages 同列入 CORS 嘅本機 dev／preview origin 可以載入相片；未加入 CORS 嘅其他 origin 唔可以由 browser script 直接讀 blob。
- `/e` 原有指定帳戶仍然可以正常讀寫。

## 7. Firebase CLI／本機 Emulator（可選）

`firebase.json` 只設定 Realtime Database rules 同本機 emulator，刻意冇 Firebase Hosting 設定，因為網站會部署到 GitHub Pages。佢只會讀取被 Git 忽略嘅 `database.rules.local.json`，唔會直接部署公開 placeholder 範本；本機完整檔案未準備好時，CLI 會安全地停止。

已安裝 Firebase CLI 後，可以喺專案目錄登入及選擇現有 project：

```powershell
firebase login
firebase use --add
firebase emulators:start --only database
```

Emulator UI 預設係 `http://127.0.0.1:4000`，Realtime Database emulator 預設係 port `9000`。

`firebase login` 係你自己喺瀏覽器登入 Google／Firebase 管理員帳戶；唔需要亦唔應該將 Google 密碼交畀開發者或寫入專案。

當你已經喺 `database.rules.local.json` 合併現有完整 rules、換好兩個 placeholder 及完成測試後，先部署：

```powershell
firebase deploy --only database
```

如果你選擇直接喺 Firebase Console 編輯及 Publish 合併後嘅規則，就唔需要建立 `database.rules.local.json` 或使用 CLI。

Storage Rules 目前以 `storage.rules.example` 提供，正式帳戶 ID 只應放入被忽略嘅 `storage.rules.local`。如使用 Firebase CLI 部署 Storage Rules，必須先喺自己本機 Firebase 設定將 `storage.rules.local` 指定為 Storage rules file；否則請直接喺 Firebase Console 合併及 Publish，唔好部署仍有 placeholder 嘅 example。

## 8. GitHub Pages 唔會儲存私人紀錄

GitHub Pages 只提供 React 編譯後嘅 HTML、CSS、JavaScript 同公開育兒指南。BB 真實紀錄由登入後嘅 Firebase SDK讀取，唔可以把以下內容放入 `public`、`src` 靜態資料或 GitHub：

- 真實 BB 個人資料或日常紀錄
- 登入密碼
- Firebase service-account JSON／private key
- Database 匯出備份
- 私人圖片、相片 metadata 或無權限保護嘅下載網址

相片只應存入上述私人 Firebase Storage path，並同時由 Storage Security Rules、Realtime Database Rules 及登入狀態保護。GitHub Pages 內嘅相簿 icon 等公開介面素材唔屬於 BB 私人相片。
