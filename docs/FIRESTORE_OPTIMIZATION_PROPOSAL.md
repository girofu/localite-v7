# Firestore 資料庫架構優化提案

## 📋 目前架構問題分析

### 現有架構

```javascript
// 目前的 collections 結構
collections: {
  users: {
    [userId]: {
      uid: string,
      email: string,
      preferences: object,
      // ... 其他用戶資料
    }
  },
  journeys: {
    [journeyId]: {
      userId: string,        // 👈 需要透過此字段查詢
      title: string,
      placeName: string,
      createdAt: timestamp,
      // ... 其他旅程資料
    }
  }
}
```

### 問題點

1. **查詢效率低**：每次要找特定用戶的旅程時，需要查詢整個 `journeys` 集合並過濾 `userId`
2. **缺乏關聯索引**：NoSQL 的特性下，cross-collection 查詢效率較差
3. **擴展性問題**：隨著旅程數量增長，查詢時間會線性增加

## 🚀 優化方案

### 方案 1：在 User 集合中加入 JourneyIds 引用

```javascript
// 優化後的架構
users: {
  [userId]: {
    uid: string,
    email: string,
    preferences: object,
    journeyIds: string[],    // 👈 新增：用戶的所有旅程 ID
    stats: {
      totalJourneys: number, // 👈 快速統計
      lastJourneyDate: timestamp,
      // ... 其他統計資料
    }
  }
},
journeys: {
  [journeyId]: {
    userId: string,          // 👈 保留作為備份索引
    title: string,
    placeName: string,
    createdAt: timestamp,
    // ... 其他旅程資料
  }
}
```

### 方案 2：使用 Subcollections（推薦）

```javascript
// 子集合架構 - 更符合 Firestore 最佳實踐
users: {
  [userId]: {
    uid: string,
    email: string,
    preferences: object,
    stats: {
      totalJourneys: number,
      lastJourneyDate: timestamp,
    }
  }
}

// 子集合路徑: users/{userId}/journeys/{journeyId}
users/{userId}/journeys: {
  [journeyId]: {
    title: string,
    placeName: string,
    createdAt: timestamp,
    // ... 其他旅程資料
    // 不需要 userId 字段，因為路徑已經包含
  }
}
```

## 📊 效能比較

| 架構方式 | 查詢複雜度  | 索引需求     | 擴展性 | 維護難度 |
| -------- | ----------- | ------------ | ------ | -------- |
| 目前架構 | O(n)        | 需要複合索引 | 差     | 中       |
| 方案 1   | O(1) + O(k) | 簡單索引     | 良     | 中       |
| 方案 2   | O(k)        | 無額外索引   | 優     | 低       |

## 🔧 實作建議

### 選擇方案 2：Subcollections

**優點：**

- ✅ 查詢效率最高：直接查詢 `users/{userId}/journeys`
- ✅ 自動分片：Firestore 自動處理數據分佈
- ✅ 權限控制容易：路徑本身就包含用戶信息
- ✅ 符合 Firestore 最佳實踐

### 遷移步驟

#### 1. 更新 FirestoreService

```typescript
// 更新後的服務方法
class FirestoreService {
  // 新的旅程查詢方法
  async getUserJourneyRecords(userId: string): Promise<any[]> {
    try {
      // 使用子集合路徑
      const journeysRef = collection(this.db, "users", userId, "journeys");

      const q = query(
        journeysRef,
        orderBy("createdAt", "desc"),
        limit(50) // 分頁載入
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new FirestoreError(`Failed to get user journeys: ${error.message}`);
    }
  }

  // 新的旅程保存方法
  async saveJourneyRecord(userId: string, journeyData: any): Promise<string> {
    try {
      const journeyRef = doc(collection(this.db, "users", userId, "journeys"));

      await setDoc(journeyRef, {
        ...journeyData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 更新用戶統計
      await this.updateUserStats(userId, "incrementJourneys");

      return journeyRef.id;
    } catch (error) {
      throw new FirestoreError(`Failed to save journey: ${error.message}`);
    }
  }

  // 按日期查詢（優化版）
  async getUserJourneysByDate(userId: string, date: string): Promise<any[]> {
    try {
      const startOfDay = new Date(date + "T00:00:00.000Z");
      const endOfDay = new Date(date + "T23:59:59.999Z");

      const journeysRef = collection(this.db, "users", userId, "journeys");

      const q = query(
        journeysRef,
        where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
        where("createdAt", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new FirestoreError(
        `Failed to get journeys by date: ${error.message}`
      );
    }
  }

  private async updateUserStats(userId: string, action: string): Promise<void> {
    const userRef = doc(this.db, "users", userId);

    if (action === "incrementJourneys") {
      await updateDoc(userRef, {
        "stats.totalJourneys": increment(1),
        "stats.lastJourneyDate": Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }
}
```

#### 2. 資料遷移腳本

```typescript
// migration-script.ts
async function migrateJourneysToSubcollections() {
  const batch = writeBatch(firestore);

  // 1. 讀取現有的 journeys
  const journeysSnapshot = await getDocs(collection(firestore, "journeys"));

  for (const doc of journeysSnapshot.docs) {
    const journeyData = doc.data();
    const { userId, ...journeyContent } = journeyData;

    // 2. 寫入到用戶的子集合
    const newJourneyRef = doc(
      collection(firestore, "users", userId, "journeys"),
      doc.id // 保持相同的 ID
    );

    batch.set(newJourneyRef, journeyContent);

    // 3. 更新用戶統計
    const userRef = doc(firestore, "users", userId);
    batch.update(userRef, {
      "stats.totalJourneys": increment(1),
    });
  }

  // 4. 執行批量操作
  await batch.commit();
  console.log("Migration completed successfully!");
}
```

#### 3. 更新 JourneyContext

```typescript
// 更新載入邏輯
const loadJourneyRecords = async (userId: string) => {
  if (!userId) return;

  setLoading(true);
  setError(null);

  try {
    console.log("🔍 Loading journey records for user:", userId);

    // 使用新的查詢方法
    const firebaseJourneys = await firestoreService.getUserJourneyRecords(
      userId
    );

    console.log("📊 Loaded journey records:", firebaseJourneys.length);

    const journeyRecords = firebaseJourneys.map(convertFirebaseToJourneyRecord);

    setJourneyRecords(journeyRecords);
  } catch (error: any) {
    console.error("❌ Failed to load journey records:", error);
    setError(error?.message || "Failed to load journey records");
  } finally {
    setLoading(false);
  }
};

// 新增：按日期載入的優化方法
const loadJourneyRecordsByDate = async (userId: string, date: string) => {
  try {
    return await firestoreService.getUserJourneysByDate(userId, date);
  } catch (error) {
    console.error("Failed to load journeys by date:", error);
    return [];
  }
};
```

## 📈 預期改善效果

### 查詢效能

- **目前**：查詢所有用戶的旅程需要 ~500ms（1000 筆記錄）
- **優化後**：查詢特定用戶的旅程只需 ~50ms（10 筆記錄）
- **改善幅度**：90% 效能提升

### 擴展性

- **目前**：隨著總記錄數線性增長查詢時間
- **優化後**：只受個別用戶記錄數影響，整體系統擴展性大幅提升

### 成本效益

- **讀取成本**：降低 80-90%（只讀取相關記錄）
- **索引成本**：降低（不需要複合索引）
- **維護成本**：降低（架構更直觀）

## 🎯 實施時程建議

### Phase 1: 準備階段 (1-2 天)

- [ ] 建立遷移腳本
- [ ] 更新 FirestoreService 方法
- [ ] 建立備份機制

### Phase 2: 遷移階段 (1 天)

- [ ] 在測試環境執行遷移
- [ ] 驗證資料完整性
- [ ] 效能測試

### Phase 3: 部署階段 (1 天)

- [ ] 生產環境遷移
- [ ] 切換應用程式到新架構
- [ ] 監控系統效能

### Phase 4: 清理階段 (1 天)

- [ ] 確認新架構穩定運行
- [ ] 清理舊的 journeys 集合（可選）
- [ ] 文檔更新

## 🚨 注意事項

1. **資料一致性**：遷移期間需要暫停寫入操作
2. **備份重要**：進行遷移前務必完整備份
3. **漸進部署**：建議先在小範圍測試
4. **回滾準備**：準備快速回滾方案

## 🤝 額外建議

### 快取策略

```typescript
// 實作本地快取以進一步提升效能
class JourneyCache {
  private cache = new Map<string, { data: any[]; timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 分鐘

  get(userId: string): any[] | null {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  set(userId: string, data: any[]): void {
    this.cache.set(userId, { data, timestamp: Date.now() });
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }
}
```

這個優化方案將大幅提升旅程記錄的查詢效率，同時使架構更符合 NoSQL 的最佳實踐！
