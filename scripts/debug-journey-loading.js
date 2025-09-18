#!/usr/bin/env node

/**
 * 調試旅程載入過程
 * 模擬應用中的完整載入和轉換流程
 */

const admin = require("firebase-admin");
const path = require("path");

// 初始化 Firebase Admin
const serviceAccount = require(path.join(
  __dirname,
  "..",
  "localite-app-merged",
  "service-account-key.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "localiteai-a3dc1",
  });
}

const firestore = admin.firestore();

// 模擬應用中的轉換函數
function convertFirebaseToJourneyRecord(firebaseData) {
  console.log("🔄 開始轉換 Firebase 資料:", {
    id: firebaseData.id,
    hasTitle: !!firebaseData.title,
    hasPlaceName: !!firebaseData.placeName,
    hasSummary: !!firebaseData.summary,
    hasCreatedAt: !!firebaseData.createdAt,
    createdAtType: typeof firebaseData.createdAt,
  });

  // 安全的日期轉換函數 (簡化版)
  const getSafeDate = (timestamp) => {
    try {
      if (!timestamp) {
        console.warn("⚠️ No timestamp provided");
        return new Date().toISOString().split("T")[0];
      }

      let dateValue;
      let dateSource = "unknown";

      if (timestamp.seconds !== undefined) {
        // Firebase Timestamp 格式
        dateValue = timestamp.seconds * 1000;
        dateSource = "firebase-timestamp";
      } else if (typeof timestamp === "string" && timestamp.includes("T")) {
        // ISO 字符串格式
        dateValue = new Date(timestamp).getTime();
        dateSource = "iso-string";
      } else if (typeof timestamp === "number") {
        // Unix timestamp
        dateValue = timestamp > 9999999999 ? timestamp : timestamp * 1000;
        dateSource = "unix-timestamp";
      } else if (timestamp instanceof Date) {
        // Date 對象
        dateValue = timestamp.getTime();
        dateSource = "date-object";
      } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
        // Firebase Timestamp 對象
        dateValue = timestamp.toDate().getTime();
        dateSource = "firebase-timestamp-object";
      } else {
        // 嘗試直接解析
        dateValue = new Date(timestamp).getTime();
        dateSource = "direct-parse";
      }

      console.log("📅 日期轉換詳情:", {
        source: dateSource,
        originalValue: timestamp,
        convertedValue: dateValue,
        isValid: !isNaN(dateValue),
      });

      // 檢查日期有效性
      if (isNaN(dateValue) || dateValue < 0 || dateValue > 4102444800000) {
        console.warn("⚠️ Invalid timestamp:", timestamp);
        return new Date().toISOString().split("T")[0];
      }

      const result = new Date(dateValue).toISOString().split("T")[0];
      console.log("✅ 轉換結果:", result);
      return result;
    } catch (error) {
      console.error("❌ 日期轉換錯誤:", error);
      return new Date().toISOString().split("T")[0];
    }
  };

  const converted = {
    id: firebaseData.id,
    date: getSafeDate(firebaseData.createdAt),
    title: firebaseData.title || firebaseData.placeName || "Untitled Journey",
    placeName: firebaseData.placeName || firebaseData.title || "Unknown Place",
    photos: firebaseData.photos || [],
    weather: firebaseData.weather || "sun",
    generatedContent:
      firebaseData.summary || firebaseData.generatedContent || "",
    timeRange: {
      start: firebaseData.timeRange?.start || "09:00",
      end: firebaseData.timeRange?.end || "17:00",
    },
  };

  console.log("📋 轉換後的記錄:", {
    id: converted.id,
    title: converted.title,
    date: converted.date,
    placeName: converted.placeName,
    hasContent: !!converted.generatedContent,
    contentLength: converted.generatedContent.length,
  });

  return converted;
}

// 模擬應用的載入流程
async function simulateJourneyLoading() {
  const userId = "v3ht9zezJ1XPSPmsGQoKFFLf5j33";

  try {
    console.log("🔍 模擬應用載入流程...");
    console.log("==============================\n");

    // 1. 模擬 FirestoreService.getUserJourneyRecords 調用
    console.log("📊 步驟 1: 從子集合載入原始資料...");

    const journeysRef = firestore
      .collection("users")
      .doc(userId)
      .collection("journeys");

    const snapshot = await journeysRef.orderBy("createdAt", "desc").get();

    console.log(`📋 從子集合載入 ${snapshot.size} 筆記錄`);

    const firebaseJourneys = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const journey = {
        id: doc.id,
        userId: userId, // 添加回 userId 以保持兼容性
        ...data,
      };
      firebaseJourneys.push(journey);
    });

    console.log("📊 原始 Firebase 資料示例:");
    if (firebaseJourneys.length > 0) {
      const sample = firebaseJourneys[0];
      console.log("  ID:", sample.id);
      console.log("  Title:", sample.title);
      console.log("  PlaceName:", sample.placeName);
      console.log("  Summary 長度:", sample.summary?.length || 0);
      console.log("  CreatedAt 類型:", typeof sample.createdAt);
      console.log("  CreatedAt 值:", sample.createdAt);
    }

    // 2. 模擬轉換過程
    console.log("\n📊 步驟 2: 資料轉換過程...");

    const journeyRecords = firebaseJourneys.map((firebase, index) => {
      console.log(`\n🔄 轉換第 ${index + 1} 筆記錄:`);
      return convertFirebaseToJourneyRecord(firebase);
    });

    // 3. 模擬排序
    console.log("\n📊 步驟 3: 排序結果...");
    const sortedRecords = journeyRecords.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.timeRange.start.localeCompare(a.timeRange.start);
    });

    console.log(
      "✅ 最終結果:",
      sortedRecords.map((record) => ({
        id: record.id,
        title: record.title,
        date: record.date,
        placeName: record.placeName,
        hasContent: !!record.generatedContent,
      }))
    );

    // 4. 模擬按日期查詢
    const today = new Date().toISOString().split("T")[0];
    console.log(`\n📊 步驟 4: 模擬查詢 ${today} 的記錄...`);

    const todayJourneys = sortedRecords.filter(
      (record) => record.date === today
    );
    console.log(`📋 今日記錄數量: ${todayJourneys.length}`);

    // 查詢最近的記錄
    if (sortedRecords.length > 0) {
      const latestDate = sortedRecords[0].date;
      console.log(`\n📊 最新旅程記錄日期: ${latestDate}`);

      const latestJourneys = sortedRecords.filter(
        (record) => record.date === latestDate
      );
      console.log(`📋 ${latestDate} 的記錄數量: ${latestJourneys.length}`);

      latestJourneys.forEach((journey) => {
        console.log(`  📝 ${journey.title} (${journey.placeName})`);
      });
    }
  } catch (error) {
    console.error("❌ 模擬失敗:", error);
  } finally {
    admin.app().delete();
  }
}

simulateJourneyLoading();
