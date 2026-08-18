# KAYLA Firebase 設定

呢個專案會沿用現有 Firebase project，但將 KAYLA 私人資料只放喺 Realtime Database 嘅 `/kayla`。原本 pronunciation 使用嘅 `/e` 唔屬於 KAYLA，唔應該由新網站讀寫。

## 安全重點

- 網站唔提供註冊功能，兩個帳戶由你喺 Firebase Console 手動建立。
- 密碼只可以喺 Firebase Authentication 或網站登入畫面輸入；唔好放入任何程式碼、`.env`、JSON、GitHub commit 或對話。
- `firebaseConfig` 係前端 Firebase project 設定，唔係管理員密碼；但 service-account JSON、private key 同密碼絕對唔可以放入 repository。
- 未登入或唔係白名單內嘅帳戶，唔可以讀取或寫入 `/kayla`。
- 只係 React 畫面隱藏資料並不足夠，真正權限由 `database.rules.json` 強制執行。

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
| `/kayla/records/{id}` | 讀寫全部紀錄 | 新增及修改／刪除自己建立嘅紀錄 |
| `/kayla/appointments/{id}` | 讀寫 | 讀寫 |
| `/kayla/vaccinations/{id}` | 讀寫 | 讀寫 |
| `/kayla/checklists/{id}` | 讀寫 | 讀寫 |

Owner 第一次登入時，網站會嘗試喺自己 UID 下建立 `role: "owner"`。Firebase Rules 只容許白名單 Owner 完成呢個寫入；Family 會被拒絕並保持家庭成員介面。呢個安排令公開網站程式唔需要包含完整登入 ID 或由登入 ID 衍生嘅值。

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
- `details` 會按紀錄種類檢查必要欄位同合理範圍，例如體溫 30–45°C、奶量 1–1000 ml；藥物劑量只作記錄，網站唔會計算或建議劑量。
- Owner 可以管理任何紀錄；Family 只可以管理自己建立嘅紀錄。
- 刪除紀錄係容許嘅，因此刪除時唔會要求上述欄位仍然存在。

React 程式建立紀錄時必須跟呢個格式，否則 Firebase 會回覆 `PERMISSION_DENIED`。

## 4. 部署前一定要合併原有規則

**重要：部署 Realtime Database rules 係更換成個 database instance 嘅根規則，唔係只追加 `/kayla`。**

呢份 `database.rules.json` 採用安全預設：根目錄 `.read` 同 `.write` 都係 `false`，只明確開放 `/kayla`。如果直接部署，現有 `/e`、`/clothes`、`/orders`、`/users` 等路徑會繼續受到保護，但原本 App 即使係合法使用者亦會失去存取權。

正式部署前：

1. 到 `Firebase Console → Realtime Database → Rules`。
2. 複製並安全保存目前完整 rules。
3. 保留目前 `/e` 等仍然需要使用嘅受保護規則。
4. 將呢份檔案內嘅 `"kayla": { ... }` 節點合併入現有根 `"rules"` 物件。
5. 確認根目錄冇使用 `".read": true` 或 `".write": true`。
6. 喺 Rules Playground 分別測試 Owner、Family、其他已登入帳戶及未登入狀態。
7. 測試 `/e` 原有 App 正常後，先正式 Publish。

唔好估計或重寫 `/e` 嘅規則；應以 Firebase Console 目前真正運作緊嗰份規則為準。例如現有 `/e` 只有一個指定登入 ID 可以使用，就應該保留同一條件。

## 5. 建議測試清單

部署前至少確認：

- 未登入讀 `/kayla`：拒絕。
- 未登入寫 `/kayla/records/test`：拒絕。
- 其他 Firebase 帳戶讀／寫 `/kayla`：拒絕。
- Owner 讀寫 `/kayla/baby`：成功。
- Family 讀 `/kayla/baby`：成功；寫入：拒絕。
- Owner 同 Family 新增合規 record：成功。
- Family 修改另一位使用者嘅 record：拒絕。
- Owner 修改或刪除任何 record：成功。
- `/e` 原有指定帳戶仍然可以正常讀寫。

## 6. Firebase CLI／本機 Emulator（可選）

`firebase.json` 只設定 Realtime Database rules 同本機 emulator，刻意冇 Firebase Hosting 設定，因為網站會部署到 GitHub Pages。

已安裝 Firebase CLI 後，可以喺專案目錄登入及選擇現有 project：

```powershell
firebase login
firebase use --add
firebase emulators:start --only database
```

Emulator UI 預設係 `http://127.0.0.1:4000`，Realtime Database emulator 預設係 port `9000`。

`firebase login` 係你自己喺瀏覽器登入 Google／Firebase 管理員帳戶；唔需要亦唔應該將 Google 密碼交畀開發者或寫入專案。

當你已經手動合併現有 rules、用本機設定換好兩個 placeholder 及完成測試後，先部署：

```powershell
firebase deploy --only database
```

如果你選擇直接喺 Firebase Console 編輯及 Publish 合併後嘅規則，就唔需要用 CLI 部署。

## 7. GitHub Pages 唔會儲存私人紀錄

GitHub Pages 只提供 React 編譯後嘅 HTML、CSS、JavaScript 同公開育兒指南。BB 真實紀錄由登入後嘅 Firebase SDK讀取，唔可以把以下內容放入 `public`、`src` 靜態資料或 GitHub：

- 真實 BB 個人資料或日常紀錄
- 登入密碼
- Firebase service-account JSON／private key
- Database 匯出備份
- 私人圖片或無權限保護嘅下載網址

日後如果加入圖片，圖片應存入 Firebase Storage，並另外設定 Storage Security Rules；Realtime Database Rules 唔會自動保護 Storage。
