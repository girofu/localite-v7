# Localite Firebase Firestore 資料庫結構文件

**專案 ID:** localiteai-a3dc1
**生成時間:** 2025/9/18 下午3:56:49

## 概要

共發現 6 個集合:

- **admins** (1 個文件)
- **journeys** (5 個文件)
- **logs** (5 個文件)
- **merchants** (1 個文件)
- **userBadges** (5 個文件)
- **users** (5 個文件)

---

## 集合: admins

**文件數量:** 1

### 欄位結構

| 欄位名稱 | 資料類型 | 範例值 |
|---------|----------|--------|
| uid | string | DXdMqKLJige0t3nSppNwLIhjmOE3 |
| email | string | admin@localite.com |
| isAdmin | boolean | true |
| role | string | super_admin |
| displayName | string | System Administrator |
| permissions | array | ["all"] |
| createdAt | timestamp | 2025-09-08T10:32:59.368Z |
| lastLogin | null | null |

### 範例文件

#### 範例 1 (ID: DXdMqKLJige0t3nSppNwLIhjmOE3)

```json
{
  "uid": "DXdMqKLJige0t3nSppNwLIhjmOE3",
  "email": "admin@localite.com",
  "isAdmin": true,
  "role": "super_admin",
  "displayName": "System Administrator",
  "permissions": [
    "all"
  ],
  "createdAt": "2025-09-08T10:32:59.368Z",
  "lastLogin": null
}
```

---

## 集合: journeys

**文件數量:** 5

### 欄位結構

| 欄位名稱 | 資料類型 | 範例值 |
|---------|----------|--------|
| highlights | object | {"0":"了解忠寮李舉人宅的歷史背景和文化意義","1":"欣賞閩南式三合院建築的精湛工藝","2":"感受淡水地區的歷史氛圍","3":"學習如何尊重和保護歷史建築","4":"與友善的導覽員小豬... |
| conversationCount | number | 10 |
| userId | string | v3ht9zezJ1XPSPmsGQoKFFLf5j33 |
| id | string | journey-1757836177639-btsfjoc2s |
| generatedAt | timestamp | 2025-09-14T07:49:37.638Z |
| updatedAt | timestamp | 2025-09-14T07:49:37.639Z |
| title | string | 淡水忠寮李舉人宅：時光迴廊的古厝巡禮 |
| placeName | string | 忠寮李舉人宅 |
| guideName | string | 小豬忠忠 |
| createdAt | timestamp | 2025-09-14T07:49:37.639Z |
| summary | string | 這次的忠寮李舉人宅之旅，跟著小豬忠忠的腳步，彷彿穿越時光隧道，回到了清光緒年間。這座被稱為「旗杆厝」的古厝，不僅是李氏宗族的四柱公厝，更是淡水地區珍貴的歷史建築瑰寶。透過小豬忠忠的生動介紹，我們了解到... |

### 範例文件

#### 範例 1 (ID: journey-1757836177639-btsfjoc2s)

```json
{
  "highlights": {
    "0": "了解忠寮李舉人宅的歷史背景和文化意義",
    "1": "欣賞閩南式三合院建築的精湛工藝",
    "2": "感受淡水地區的歷史氛圍",
    "3": "學習如何尊重和保護歷史建築",
    "4": "與友善的導覽員小豬忠忠互動，增添旅程樂趣"
  },
  "conversationCount": 10,
  "userId": "v3ht9zezJ1XPSPmsGQoKFFLf5j33",
  "id": "journey-1757836177639-btsfjoc2s",
  "generatedAt": "2025-09-14T07:49:37.638Z",
  "updatedAt": "2025-09-14T07:49:37.639Z",
  "title": "淡水忠寮李舉人宅：時光迴廊的古厝巡禮",
  "placeName": "忠寮李舉人宅",
  "guideName": "小豬忠忠",
  "createdAt": "2025-09-14T07:49:37.639Z",
  "summary": "這次的忠寮李舉人宅之旅，跟著小豬忠忠的腳步，彷彿穿越時光隧道，回到了清光緒年間。這座被稱為「旗杆厝」的古厝，不僅是李氏宗族的四柱公厝，更是淡水地區珍貴的歷史建築瑰寶。透過小豬忠忠的生動介紹，我們了解到李舉人宅的興建年代、建築風格，以及其在地方上的歷史意義。這座閩南式三合院建築，以紅磚、瓦片等傳統建材，展現了當時的建築工藝和美學，屋脊上的燕尾和門楣上的雕刻都令人讚嘆。此外，我們也了解到李家先人曾中舉人，宅邸也成為了地方的文化中心。小豬忠忠也提醒我們，在欣賞古厝之美的同時，也要尊重當地居民、注意自身安全，並保持環境整潔，共同維護這份珍貴的文化資產。這次旅程不僅是一趟視覺的饗宴，更是一趟心靈的洗滌，讓我們更加了解淡水的歷史文化，也更加珍惜這片土地。"
}
```

#### 範例 2 (ID: journey-1757857485153-hbssj7hbz)

```json
{
  "generatedAt": "2025-09-14T13:44:45.152Z",
  "conversationCount": 9,
  "createdAt": "2025-09-14T13:44:45.152Z",
  "summary": "這次的忠寮李舉人宅之旅，在小豬忠忠的專業導覽下，不僅欣賞了古色古香的閩南建築，更深入了解了李家對於淡水地區的深遠影響。李舉人宅，又稱忠寮竹圍仔八號宅，是李家四柱公厝，建於清光緒年間，獨自隱居在翠綠的山林間，宛如桃花源。我們了解到李騰芳先生的科舉之路，他不僅通過自身努力考取功名，更積極參與地方事務，熱心公益，為地方建設貢獻良多。李家對於教育的重視、對於地方經濟的貢獻，以及對於文化傳承的努力，都令人敬佩。透過這次旅程，深刻體會到科舉文化在台灣社會的影響，以及家族歷史與地方發展密不可分的關係。這不僅是一次簡單的觀光，更是一場充滿人文關懷和歷史意義的文化之旅，讓我們更加珍惜台灣的歷史文化資產。",
  "title": "淡水忠寮李舉人宅：一場穿越時空的文化之旅",
  "placeName": "忠寮李舉人宅",
  "highlights": {
    "0": "深入了解清朝科舉制度下的文化和教育",
    "1": "欣賞閩南式三合院建築的精美細節",
    "2": "學習李騰芳先生的生平和對於地方的貢獻",
    "3": "感受忠寮地區純樸的農村風貌",
    "4": "探索李家對於地方發展的深遠影響"
  },
  "id": "journey-1757857485153-hbssj7hbz",
  "guideName": "小豬忠忠",
  "userId": "v3ht9zezJ1XPSPmsGQoKFFLf5j33",
  "updatedAt": "2025-09-14T13:44:45.153Z"
}
```

---

## 集合: logs

**文件數量:** 5

### 欄位結構

| 欄位名稱 | 資料類型 | 範例值 |
|---------|----------|--------|
| level | string | info |
| message | string | 應用啟動完成 |
| service | string | localite-app |
| timestamp | timestamp | 2025-09-16T04:07:37.063Z |
| platform | string | react-native |
| screen | string | App |
| loggingConnected | boolean | true |
| createdAt | timestamp | 2025-09-16T04:07:37.063Z |
| healthCheck | object | {"status":"ok","timestamp":"2025-09-14T13:46:13.577Z","totalLogs":18,"services":["logs-dashboard","l... |

### 範例文件

#### 範例 1 (ID: 069qgD46U1l9fh4SYflN)

```json
{
  "level": "info",
  "message": "應用啟動完成",
  "service": "localite-app",
  "timestamp": "2025-09-16T04:07:37.063Z",
  "platform": "react-native",
  "screen": "App",
  "loggingConnected": true,
  "createdAt": "2025-09-16T04:07:37.063Z"
}
```

#### 範例 2 (ID: 0HAzlK1T9iCQTUUlJGs7)

```json
{
  "level": "info",
  "message": "網路連接測試成功",
  "service": "localite-app",
  "timestamp": "2025-09-14T13:46:22.814Z",
  "platform": "react-native",
  "healthCheck": {
    "status": "ok",
    "timestamp": "2025-09-14T13:46:13.577Z",
    "totalLogs": 18,
    "services": [
      "logs-dashboard",
      "localite-app",
      "restart-script",
      "setup-script"
    ],
    "firestore": {
      "enabled": true,
      "status": "connected"
    }
  },
  "createdAt": "2025-09-14T13:46:22.814Z"
}
```

---

## 集合: merchants

**文件數量:** 1

### 欄位結構

| 欄位名稱 | 資料類型 | 範例值 |
|---------|----------|--------|
| uid | string | 1lJyzD5CyxfxFMZ47r1SaJIfb2G3 |
| email | string | merchant@localite.com |
| businessName | string | 測試商家 |
| contactPerson | string | 張老闆 |
| businessType | string | restaurant |
| phone | string | +886-2-1234-5678 |
| address | string | 台北市信義區測試路123號 |
| status | string | approved |
| description | string | 這是一個測試商家帳號，用於開發和測試目的 |
| createdAt | timestamp | 2025-09-08T10:32:59.368Z |
| approvedAt | timestamp | 2025-09-08T10:32:59.368Z |
| lastLogin | null | null |

### 範例文件

#### 範例 1 (ID: 1lJyzD5CyxfxFMZ47r1SaJIfb2G3)

```json
{
  "uid": "1lJyzD5CyxfxFMZ47r1SaJIfb2G3",
  "email": "merchant@localite.com",
  "businessName": "測試商家",
  "contactPerson": "張老闆",
  "businessType": "restaurant",
  "phone": "+886-2-1234-5678",
  "address": "台北市信義區測試路123號",
  "status": "approved",
  "description": "這是一個測試商家帳號，用於開發和測試目的",
  "createdAt": "2025-09-08T10:32:59.368Z",
  "approvedAt": "2025-09-08T10:32:59.368Z",
  "lastLogin": null
}
```

---

## 集合: userBadges

**文件數量:** 5

### 欄位結構

| 欄位名稱 | 資料類型 | 範例值 |
|---------|----------|--------|
| userId | string | JD7HlRELuThdXyFfKdEKMW2MVv82 |
| badgeId | string | B2-1 |
| isShared | boolean | false |
| awardedAt | timestamp | 2025-09-15T09:48:09.094Z |

### 範例文件

#### 範例 1 (ID: 2qba1k6gnkKGQ4h1mW1E)

```json
{
  "userId": "JD7HlRELuThdXyFfKdEKMW2MVv82",
  "badgeId": "B2-1",
  "isShared": false,
  "awardedAt": "2025-09-15T09:48:09.094Z"
}
```

#### 範例 2 (ID: 2ytJDDkdmm6bmvjMYG80)

```json
{
  "isShared": false,
  "awardedAt": "2025-09-15T15:58:24.050Z",
  "userId": "v3ht9zezJ1XPSPmsGQoKFFLf5j33",
  "badgeId": "B7-1"
}
```

---

## 集合: users

**文件數量:** 5

### 欄位結構

| 欄位名稱 | 資料類型 | 範例值 |
|---------|----------|--------|
| uid | string | 1lJyzD5CyxfxFMZ47r1SaJIfb2G3 |
| email | string | merchant@localite.com |
| isMerchant | boolean | true |
| merchantId | string | 1lJyzD5CyxfxFMZ47r1SaJIfb2G3 |
| createdAt | timestamp | 2025-09-08T10:32:59.368Z |
| isAdmin | boolean | true |
| role | string | super_admin |
| isActive | boolean | true |
| updatedAt | timestamp | 2025-09-09T05:39:54.073Z |
| displayName | string | Admin User |
| lastLogin | null | null |
| profile | object | {"photoURL":null,"phoneNumber":null} |
| adminClaims | object | {"role":"super_admin","assignedBy":"system","assignedAt":{"_seconds":1757166997,"_nanoseconds":52400... |
| id | string | JD7HlRELuThdXyFfKdEKMW2MVv82 |
| preferredLanguage | string | zh-TW |
| isEmailVerified | boolean | false |
| stats | object | {"totalConversations":0,"totalPhotosUploaded":0,"placesVisited":0} |
| preferences | object | {"language":"zh-TW","theme":"light","notifications":{"push":true,"email":true,"aiRecommendations":tr... |

### 範例文件

#### 範例 1 (ID: 1lJyzD5CyxfxFMZ47r1SaJIfb2G3)

```json
{
  "uid": "1lJyzD5CyxfxFMZ47r1SaJIfb2G3",
  "email": "merchant@localite.com",
  "isMerchant": true,
  "merchantId": "1lJyzD5CyxfxFMZ47r1SaJIfb2G3",
  "createdAt": "2025-09-08T10:32:59.368Z"
}
```

#### 範例 2 (ID: DXdMqKLJige0t3nSppNwLIhjmOE3)

```json
{
  "uid": "DXdMqKLJige0t3nSppNwLIhjmOE3",
  "email": "admin@localite.com",
  "isAdmin": true,
  "role": "super_admin",
  "createdAt": "2025-09-08T10:32:59.368Z",
  "isActive": true,
  "updatedAt": "2025-09-09T05:39:54.073Z"
}
```

---

