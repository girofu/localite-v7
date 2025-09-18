#!/usr/bin/env node

/**
 * Firestore Journeys 遷移腳本
 *
 * 將現有的 journeys 集合遷移到 users/{userId}/journeys 子集合架構
 *
 * 使用方式:
 * node scripts/migrate-journeys-to-subcollections.js [--dry-run] [--rollback]
 *
 * 選項:
 * --dry-run: 只預覽遷移操作，不實際執行
 * --rollback: 回滾遷移（將子集合資料移回主集合）
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
  console.error("❌ Service account key not found at:", serviceAccountPath);
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

// 解析命令行參數
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isRollback = args.includes("--rollback");

console.log("\n🚀 Firestore Journeys 遷移腳本");
console.log("=====================================");
console.log(
  `模式: ${
    isDryRun
      ? "🔍 預覽模式 (Dry Run)"
      : isRollback
      ? "⏪ 回滾模式"
      : "✅ 執行模式"
  }`
);
console.log(`專案: localiteai-a3dc1\n`);

/**
 * 遷移 journeys 到 subcollections
 */
async function migrateJourneysToSubcollections() {
  try {
    console.log("📊 開始分析現有 journeys 集合...");

    // 1. 讀取現有的 journeys
    const journeysCollection = firestore.collection("journeys");
    const journeysSnapshot = await journeysCollection.get();

    console.log(`📋 找到 ${journeysSnapshot.size} 筆旅程記錄`);

    if (journeysSnapshot.empty) {
      console.log("✅ 沒有需要遷移的資料");
      return;
    }

    // 分析資料
    const userJourneyCount = {};
    const journeyData = [];

    journeysSnapshot.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;

      if (!userId) {
        console.warn(`⚠️ Journey ${doc.id} 缺少 userId，跳過`);
        return;
      }

      userJourneyCount[userId] = (userJourneyCount[userId] || 0) + 1;
      journeyData.push({
        id: doc.id,
        userId: userId,
        data: data,
      });
    });

    console.log("📊 分析結果:");
    Object.entries(userJourneyCount).forEach(([userId, count]) => {
      console.log(`  👤 用戶 ${userId}: ${count} 筆旅程`);
    });

    if (isDryRun) {
      console.log("\n🔍 預覽模式 - 不執行實際遷移");
      console.log("如要執行遷移，請移除 --dry-run 參數");
      return;
    }

    console.log("\n🔄 開始遷移程序...");

    // 2. 批量遷移操作
    const batch = firestore.batch();
    let operationCount = 0;

    for (const journey of journeyData) {
      const { id, userId, data } = journey;

      // 移除 userId 從資料中（因為現在在路徑中）
      const { userId: _, ...journeyContent } = data;

      // 寫入到用戶的子集合
      const newJourneyRef = firestore
        .collection("users")
        .doc(userId)
        .collection("journeys")
        .doc(id); // 保持相同的 ID

      batch.set(newJourneyRef, journeyContent);
      operationCount++;

      // 更新用戶統計
      const userRef = firestore.collection("users").doc(userId);
      batch.update(userRef, {
        "stats.totalJourneys": admin.firestore.FieldValue.increment(1),
        "stats.lastJourneyDate": admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      operationCount++;

      // Firestore 批量操作限制是 500，分批執行
      if (operationCount >= 450) {
        console.log(`🔄 執行批量操作 (${operationCount} 個操作)...`);
        await batch.commit();
        operationCount = 0;
      }
    }

    // 執行剩餘的操作
    if (operationCount > 0) {
      console.log(`🔄 執行最後批量操作 (${operationCount} 個操作)...`);
      await batch.commit();
    }

    console.log("✅ 遷移完成！");
    console.log("\n📋 遷移摘要:");
    console.log(`  📊 遷移的旅程: ${journeyData.length} 筆`);
    console.log(`  👥 涉及的用戶: ${Object.keys(userJourneyCount).length} 位`);
    console.log("\n⚠️ 注意: 舊的 journeys 集合仍然存在");
    console.log("   確認新架構運行正常後，可手動刪除舊集合");
  } catch (error) {
    console.error("❌ 遷移失敗:", error);
    throw error;
  }
}

/**
 * 回滾遷移（將子集合資料移回主集合）
 */
async function rollbackMigration() {
  try {
    console.log("⏪ 開始回滾遷移...");

    // 獲取所有用戶
    const usersSnapshot = await firestore.collection("users").get();

    let totalJourneys = 0;
    const batch = firestore.batch();
    let operationCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // 獲取用戶的所有旅程子集合
      const userJourneysSnapshot = await firestore
        .collection("users")
        .doc(userId)
        .collection("journeys")
        .get();

      if (userJourneysSnapshot.empty) continue;

      console.log(
        `🔄 回滾用戶 ${userId} 的 ${userJourneysSnapshot.size} 筆旅程...`
      );

      userJourneysSnapshot.forEach((journeyDoc) => {
        const journeyData = journeyDoc.data();

        // 添加回 userId 並寫入主集合
        const journeyRef = firestore.collection("journeys").doc(journeyDoc.id);
        batch.set(journeyRef, {
          ...journeyData,
          userId: userId,
        });

        // 刪除子集合中的文檔
        batch.delete(journeyDoc.ref);

        operationCount += 2;
        totalJourneys++;

        // 分批執行
        if (operationCount >= 450) {
          console.log(`🔄 執行批量回滾操作...`);
          batch.commit();
          operationCount = 0;
        }
      });
    }

    // 執行剩餘操作
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`✅ 回滾完成！共回滾 ${totalJourneys} 筆旅程記錄`);
  } catch (error) {
    console.error("❌ 回滾失敗:", error);
    throw error;
  }
}

/**
 * 驗證遷移結果
 */
async function verifyMigration() {
  console.log("\n🔍 驗證遷移結果...");

  try {
    // 檢查舊集合
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

    // 驗證資料一致性
    if (oldJourneysSnapshot.size === totalSubcollectionJourneys) {
      console.log("✅ 資料遷移一致性驗證通過");
    } else {
      console.warn("⚠️ 資料數量不一致，請檢查遷移結果");
    }
  } catch (error) {
    console.error("❌ 驗證失敗:", error);
  }
}

// 主執行函數
async function main() {
  try {
    if (isRollback) {
      if (isDryRun) {
        console.log("🔍 預覽回滾操作...");
        await verifyMigration();
      } else {
        await rollbackMigration();
      }
    } else {
      await migrateJourneysToSubcollections();
    }

    // 執行驗證
    await verifyMigration();

    console.log("\n🎉 操作完成！");
  } catch (error) {
    console.error("❌ 操作失敗:", error);
    process.exit(1);
  } finally {
    // 清理 Firebase 連接
    admin.app().delete();
  }
}

// 執行腳本
main().catch(console.error);
