/**
 * Firestore 日誌服務
 * 處理日誌與 Firestore 的同步
 */

const admin = require("firebase-admin");
const path = require("path");

class FirestoreLogService {
  constructor(firestore = null) {
    // 允許依賴注入用於測試
    if (firestore) {
      this.firestore = firestore;
    } else {
      this.initializeFirebase();
    }
  }

  /**
   * 初始化 Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      // 檢查是否已經初始化
      if (admin.apps.length === 0) {
        // 嘗試使用服務帳戶密鑰
        const serviceKeyPath = path.join(
          process.cwd(),
          "service-account-key.json"
        );

        try {
          admin.initializeApp({
            credential: admin.credential.cert(serviceKeyPath),
          });
        } catch (error) {
          // 如果沒有服務帳戶密鑰文件，嘗試使用預設憑證
          console.warn("服務帳戶密鑰文件未找到，使用預設憑證:", error.message);
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
        }
      }

      this.firestore = admin.firestore();
    } catch (error) {
      console.error("Firebase 初始化失敗:", error);
      throw error;
    }
  }

  /**
   * 保存日誌到 Firestore
   * @param {Object} logEntry - 日誌項目
   * @returns {Promise<Object>} - 保存結果，包含文檔 ID
   */
  async saveLog(logEntry) {
    try {
      const logWithTimestamp = {
        ...logEntry,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      const docRef = await this.firestore
        .collection("logs")
        .add(logWithTimestamp);

      return { id: docRef.id };
    } catch (error) {
      console.error("儲存日誌到 Firestore 失敗:", error);
      throw error;
    }
  }

  /**
   * 從 Firestore 獲取日誌
   * @param {Object} options - 查詢選項
   * @param {string} options.level - 日誌級別過濾
   * @param {string} options.service - 服務名稱過濾
   * @param {number} options.limit - 結果數量限制
   * @returns {Promise<Array>} - 日誌陣列
   */
  async getLogs(options = {}) {
    try {
      const { level, service, limit = 100 } = options;

      let query = this.firestore.collection("logs");

      // 添加過濾條件
      if (level) {
        query = query.where("level", "==", level);
      }

      if (service) {
        query = query.where("service", "==", service);
      }

      // 按時間排序並限制結果數量
      query = query.orderBy("timestamp", "desc").limit(limit);

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("從 Firestore 獲取日誌失敗:", error);
      throw error;
    }
  }
}

module.exports = FirestoreLogService;
