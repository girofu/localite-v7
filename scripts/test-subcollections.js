#!/usr/bin/env node

/**
 * Subcollections 架構測試腳本
 *
 * 測試新的 users/{userId}/journeys 子集合架構是否正常工作
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// 初始化 Firebase Admin
const serviceAccountPath = path.join(
  __dirname,
  "..",
  "localite-app-merged",
  "service-account-key.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Service account key not found");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "localiteai-a3dc1",
  });
}

const firestore = admin.firestore();

/**
 * 測試 Subcollections 架構功能
 */
async function testSubcollections() {
  console.log("🧪 開始測試 Subcollections 架構");
  console.log("=====================================\n");

  const testUserId = "test-user-" + Date.now();

  try {
    // 測試 1: 創建測試用戶
    console.log("📋 測試 1: 創建測試用戶");
    const userRef = firestore.collection("users").doc(testUserId);
    await userRef.set({
      email: "test@example.com",
      displayName: "Test User",
      stats: {
        totalJourneys: 0,
        totalPhotosUploaded: 0,
        placesVisited: 0,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ 測試用戶創建成功");

    // 測試 2: 在子集合中創建旅程記錄
    console.log("\n📋 測試 2: 在子集合中創建旅程記錄");
    const journeyRef = userRef.collection("journeys").doc();
    const journeyData = {
      title: "測試旅程 - Subcollection",
      placeName: "測試地點",
      guideName: "測試導覽員",
      summary: "這是一個測試旅程，用於驗證 subcollections 架構",
      highlights: {
        0: "測試亮點 1",
        1: "測試亮點 2",
      },
      conversationCount: 5,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await journeyRef.set(journeyData);
    console.log(`✅ 旅程記錄創建成功，ID: ${journeyRef.id}`);

    // 測試 3: 更新用戶統計
    console.log("\n📋 測試 3: 更新用戶統計");
    await userRef.update({
      "stats.totalJourneys": admin.firestore.FieldValue.increment(1),
      "stats.lastJourneyDate": admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ 用戶統計更新成功");

    // 測試 4: 查詢子集合
    console.log("\n📋 測試 4: 查詢用戶的旅程子集合");
    const userJourneysSnapshot = await userRef
      .collection("journeys")
      .orderBy("createdAt", "desc")
      .get();

    console.log(`✅ 查詢成功，找到 ${userJourneysSnapshot.size} 筆旅程`);

    userJourneysSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  📝 ${doc.id}: ${data.title}`);
    });

    // 測試 5: 按日期範圍查詢
    console.log("\n📋 測試 5: 按日期範圍查詢");
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const dateRangeSnapshot = await userRef
      .collection("journeys")
      .where("createdAt", ">=", startOfDay)
      .where("createdAt", "<", endOfDay)
      .orderBy("createdAt", "desc")
      .get();

    console.log(
      `✅ 日期範圍查詢成功，找到 ${dateRangeSnapshot.size} 筆今日旅程`
    );

    // 測試 6: 驗證用戶統計
    console.log("\n📋 測試 6: 驗證用戶統計");
    const updatedUser = await userRef.get();
    const userStats = updatedUser.data()?.stats;

    console.log("✅ 用戶統計驗證:", {
      totalJourneys: userStats?.totalJourneys,
      hasLastJourneyDate: !!userStats?.lastJourneyDate,
    });

    // 清理測試資料
    console.log("\n🧹 清理測試資料...");

    // 刪除測試旅程
    await journeyRef.delete();

    // 刪除測試用戶
    await userRef.delete();

    console.log("✅ 測試資料清理完成");

    console.log("\n🎉 所有測試通過！Subcollections 架構運作正常。");
  } catch (error) {
    console.error("❌ 測試失敗:", error);

    // 嘗試清理測試資料
    try {
      const userRef = firestore.collection("users").doc(testUserId);
      const userJourneysSnapshot = await userRef.collection("journeys").get();

      const batch = firestore.batch();
      userJourneysSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      batch.delete(userRef);

      await batch.commit();
      console.log("🧹 測試資料已清理");
    } catch (cleanupError) {
      console.warn("⚠️ 測試資料清理失敗:", cleanupError);
    }

    throw error;
  }
}

/**
 * 檢查現有資料狀況
 */
async function checkDataStatus() {
  console.log("📊 檢查現有資料狀況");
  console.log("=====================================\n");

  try {
    // 檢查舊 journeys 集合
    const oldJourneysSnapshot = await firestore.collection("journeys").get();
    console.log(`📊 舊 journeys 集合: ${oldJourneysSnapshot.size} 筆記錄`);

    // 檢查新子集合
    const usersSnapshot = await firestore.collection("users").get();
    let totalSubcollectionJourneys = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userJourneysSnapshot = await userDoc.ref
        .collection("journeys")
        .get();
      if (!userJourneysSnapshot.empty) {
        console.log(
          `  👤 用戶 ${userDoc.id}: ${userJourneysSnapshot.size} 筆旅程 (子集合)`
        );
        totalSubcollectionJourneys += userJourneysSnapshot.size;
      }
    }

    console.log(`📊 新子集合總計: ${totalSubcollectionJourneys} 筆記錄`);

    console.log("\n📋 建議:");
    if (oldJourneysSnapshot.size > 0 && totalSubcollectionJourneys === 0) {
      console.log(
        "  🔄 執行遷移: node scripts/migrate-journeys-to-subcollections.js"
      );
    } else if (totalSubcollectionJourneys > 0) {
      console.log("  ✅ 子集合架構已就緒");
    }
  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  }
}

// 主執行函數
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "test":
        await testSubcollections();
        break;
      case "check":
        await checkDataStatus();
        break;
      default:
        console.log("📖 使用方式:");
        console.log("  node scripts/test-subcollections.js test   # 測試架構");
        console.log("  node scripts/test-subcollections.js check  # 檢查現狀");
    }
  } catch (error) {
    console.error("❌ 執行失敗:", error);
    process.exit(1);
  } finally {
    admin.app().delete();
  }
}

main().catch(console.error);
