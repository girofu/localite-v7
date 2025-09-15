/**
 * Localite 清理種子數據腳本
 * 刪除測試帳號和相關數據
 *
 * 使用方式:
 * 1. cd scripts
 * 2. node clean-seed-data.js
 */

const admin = require("firebase-admin");

// Firebase Service Account Key
const serviceAccount = require("./service-account-key.json");

// 初始化 Firebase Admin SDK (如果尚未初始化)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "localiteai-a3dc1",
  });
}

const auth = admin.auth();
const db = admin.firestore();

// 種子數據帳號
const SEED_EMAILS = ["admin@localite.com", "merchant@localite.com"];

/**
 * 刪除 Firebase Auth 用戶
 */
async function deleteAuthUser(email) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.deleteUser(user.uid);
    console.log(`✅ 已刪除 Auth 用戶: ${email}`);
    return user.uid;
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.log(`⚠️  用戶 ${email} 不存在`);
      return null;
    }
    throw error;
  }
}

/**
 * 刪除 Firestore 數據
 */
async function deleteFirestoreData(uid, email) {
  if (!uid) return;

  try {
    // 刪除相關 collections 中的數據
    const collections = ["admins", "merchants", "users"];

    for (const collectionName of collections) {
      const doc = db.collection(collectionName).doc(uid);
      const docSnap = await doc.get();

      if (docSnap.exists) {
        await doc.delete();
        console.log(`✅ 已刪除 ${collectionName} 中的數據: ${email}`);
      }
    }
  } catch (error) {
    console.error(`❌ 刪除 Firestore 數據失敗 (${email}):`, error);
  }
}

/**
 * 主清理函數
 */
async function cleanSeedData() {
  console.log("🧹 開始清理 Localite 種子數據...\n");

  try {
    for (const email of SEED_EMAILS) {
      console.log(`🔄 處理帳號: ${email}`);

      // 先獲取 UID，然後刪除 Auth 用戶和 Firestore 數據
      let uid = null;
      try {
        const user = await auth.getUserByEmail(email);
        uid = user.uid;
      } catch (error) {
        if (error.code !== "auth/user-not-found") {
          throw error;
        }
      }

      // 刪除 Firestore 數據
      await deleteFirestoreData(uid, email);

      // 刪除 Auth 用戶
      await deleteAuthUser(email);

      console.log("");
    }

    console.log("🎉 種子數據清理完成！");
    console.log(
      "現在可以重新執行 create-seed-accounts.js 來創建新的種子數據。\n"
    );
  } catch (error) {
    console.error("❌ 清理種子數據失敗:", error);
    process.exit(1);
  }
}

// 確認操作
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("⚠️  確定要刪除所有種子數據嗎？這將無法恢復。(y/N): ", (answer) => {
  if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
    cleanSeedData()
      .then(() => {
        console.log("✨ 清理完成！");
        process.exit(0);
      })
      .catch((error) => {
        console.error("💥 清理失敗:", error);
        process.exit(1);
      })
      .finally(() => {
        rl.close();
      });
  } else {
    console.log("❌ 已取消清理操作");
    rl.close();
    process.exit(0);
  }
});
