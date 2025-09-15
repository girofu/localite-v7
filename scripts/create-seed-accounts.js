/**
 * Localite 種子數據腳本
 * 自動創建測試帳號 - 管理員和商家帳號
 *
 * 使用方式:
 * 1. cd scripts
 * 2. npm install firebase-admin
 * 3. 放置 Firebase Service Account Key JSON 檔案
 * 4. node create-seed-accounts.js
 */

const admin = require("firebase-admin");

// Firebase Service Account Key - 需要從 Firebase Console 下載
const serviceAccount = require("./service-account-key.json");

// 初始化 Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "localiteai-a3dc1",
});

const auth = admin.auth();
const db = admin.firestore();

// 種子數據配置
const SEED_DATA = {
  admin: {
    email: "admin@localite.com",
    password: "admin123456",
    profile: {
      isAdmin: true,
      role: "super_admin",
      displayName: "System Administrator",
      permissions: ["all"],
      createdAt: new Date(),
      lastLogin: null,
    },
  },
  merchant: {
    email: "merchant@localite.com",
    password: "merchant123456",
    profile: {
      businessName: "測試商家",
      contactPerson: "張老闆",
      businessType: "restaurant",
      phone: "+886-2-1234-5678",
      address: "台北市信義區測試路123號",
      status: "approved",
      description: "這是一個測試商家帳號，用於開發和測試目的",
      createdAt: new Date(),
      approvedAt: new Date(),
      lastLogin: null,
    },
  },
};

/**
 * 創建 Firebase Auth 用戶
 */
async function createAuthUser(email, password, displayName) {
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true,
    });

    console.log(`✅ 成功創建 Auth 用戶: ${email} (UID: ${userRecord.uid})`);
    return userRecord.uid;
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log(`⚠️  用戶 ${email} 已存在，獲取 UID...`);
      const existingUser = await auth.getUserByEmail(email);
      return existingUser.uid;
    }
    throw error;
  }
}

/**
 * 創建管理員數據
 */
async function createAdminData(uid, profile) {
  const adminData = {
    uid: uid,
    email: profile.email || SEED_DATA.admin.email,
    ...profile,
  };

  await db.collection("admins").doc(uid).set(adminData);

  // 同時在 users collection 中標記為管理員
  await db.collection("users").doc(uid).set({
    uid: uid,
    email: adminData.email,
    isAdmin: true,
    role: "super_admin",
    createdAt: adminData.createdAt,
  });

  console.log(`✅ 成功創建管理員資料: ${adminData.email}`);
}

/**
 * 創建商家數據
 */
async function createMerchantData(uid, profile) {
  const merchantData = {
    uid: uid,
    email: profile.email || SEED_DATA.merchant.email,
    ...profile,
  };

  await db.collection("merchants").doc(uid).set(merchantData);

  // 同時在 users collection 中標記為商家
  await db.collection("users").doc(uid).set({
    uid: uid,
    email: merchantData.email,
    isMerchant: true,
    merchantId: uid,
    createdAt: merchantData.createdAt,
  });

  console.log(
    `✅ 成功創建商家資料: ${merchantData.businessName} (${merchantData.email})`
  );
}

/**
 * 主執行函數
 */
async function createSeedData() {
  console.log("🚀 開始創建 Localite 種子數據...\n");

  try {
    // 1. 創建管理員帳號
    console.log("👨‍💼 創建管理員帳號...");
    const adminUid = await createAuthUser(
      SEED_DATA.admin.email,
      SEED_DATA.admin.password,
      SEED_DATA.admin.profile.displayName
    );

    await createAdminData(adminUid, SEED_DATA.admin.profile);

    // 2. 創建商家帳號
    console.log("\n🏪 創建商家帳號...");
    const merchantUid = await createAuthUser(
      SEED_DATA.merchant.email,
      SEED_DATA.merchant.password,
      SEED_DATA.merchant.profile.contactPerson
    );

    await createMerchantData(merchantUid, SEED_DATA.merchant.profile);

    // 3. 顯示結果
    console.log("\n🎉 種子數據創建完成！\n");
    console.log("📋 登入資訊：");
    console.log("==========================================");
    console.log("🔐 管理員系統 (http://localhost:3001)");
    console.log(`   Email: ${SEED_DATA.admin.email}`);
    console.log(`   Password: ${SEED_DATA.admin.password}`);
    console.log("");
    console.log("🏪 商家系統 (http://localhost:3002)");
    console.log(`   Email: ${SEED_DATA.merchant.email}`);
    console.log(`   Password: ${SEED_DATA.merchant.password}`);
    console.log("==========================================\n");
  } catch (error) {
    console.error("❌ 創建種子數據失敗:", error);
    process.exit(1);
  }
}

// 檢查必要檔案
const fs = require("fs");
if (!fs.existsSync("./service-account-key.json")) {
  console.error("❌ 找不到 service-account-key.json 檔案！");
  console.error(
    "請從 Firebase Console 下載 Service Account Key 並放在此目錄下。"
  );
  console.error("詳細步驟請參考 FIREBASE_SETUP_GUIDE.md");
  process.exit(1);
}

// 執行
createSeedData()
  .then(() => {
    console.log("✨ 所有操作完成，可以開始測試登入！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 執行失敗:", error);
    process.exit(1);
  });
