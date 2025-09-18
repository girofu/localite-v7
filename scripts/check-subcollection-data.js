#!/usr/bin/env node

/**
 * 檢查 Subcollection 資料內容
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

async function checkSubcollectionData() {
  try {
    console.log("🔍 檢查用戶 v3ht9zezJ1XPSPmsGQoKFFLf5j33 的子集合資料...\n");

    const userJourneysRef = firestore
      .collection("users")
      .doc("v3ht9zezJ1XPSPmsGQoKFFLf5j33")
      .collection("journeys");

    const snapshot = await userJourneysRef
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();

    console.log(`📊 子集合中找到 ${snapshot.size} 筆記錄\n`);

    if (snapshot.empty) {
      console.log("❌ 子集合為空，檢查舊集合...");

      // 檢查舊集合
      const oldSnapshot = await firestore
        .collection("journeys")
        .where("userId", "==", "v3ht9zezJ1XPSPmsGQoKFFLf5j33")
        .limit(3)
        .get();

      console.log(`📊 舊集合中找到 ${oldSnapshot.size} 筆記錄`);

      oldSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📝 舊記錄 ${doc.id}:`);
        console.log("  Title:", data.title || "缺少 title");
        console.log("  PlaceName:", data.placeName || "缺少 placeName");
        console.log("  UserId:", data.userId);
        console.log("  CreatedAt:", data.createdAt);
        console.log("---");
      });

      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📝 Journey ${doc.id}:`);
      console.log("  Title:", data.title || "❌ 缺少 title");
      console.log("  PlaceName:", data.placeName || "❌ 缺少 placeName");
      console.log("  GuideName:", data.guideName || "❌ 缺少 guideName");
      console.log(
        "  Summary:",
        data.summary
          ? `✅ ${data.summary.substring(0, 50)}...`
          : "❌ 缺少 summary"
      );
      console.log(
        "  CreatedAt:",
        data.createdAt?.toDate?.() || data.createdAt || "❌ 缺少 createdAt"
      );
      console.log(
        "  Highlights:",
        data.highlights
          ? `✅ ${Object.keys(data.highlights).length} 個亮點`
          : "❌ 缺少 highlights"
      );
      console.log(
        "  ConversationCount:",
        data.conversationCount || "❌ 缺少 conversationCount"
      );
      console.log("---");
    });

    // 檢查用戶統計
    console.log("\n👤 檢查用戶統計資料...");
    const userRef = firestore
      .collection("users")
      .doc("v3ht9zezJ1XPSPmsGQoKFFLf5j33");
    const userSnap = await userRef.get();

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("📊 用戶統計:", {
        totalJourneys: userData.stats?.totalJourneys || 0,
        lastJourneyDate: userData.stats?.lastJourneyDate?.toDate?.() || "無",
      });
    } else {
      console.log("❌ 用戶資料不存在");
    }
  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  } finally {
    admin.app().delete();
  }
}

checkSubcollectionData();
