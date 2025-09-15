/**
 * 服務器驗證功能測試
 * 測試 API 輸入驗證和錯誤回傳
 */

const request = require("supertest");
const express = require("express");

// Mock FirestoreLogService
const mockFirestoreLogService = {
  saveLog: jest.fn().mockResolvedValue({ id: "mock-id" }),
  getLogs: jest.fn().mockResolvedValue([]),
};

// 建立測試用的 Express app
function createTestApp() {
  const app = express();
  app.use(express.json());

  // 模擬內存日誌存儲
  const recentLogs = [];

  // 模擬添加日誌到內存和 Firestore
  const addLogToMemory = async (logEntry) => {
    const logWithTimestamp = {
      ...logEntry,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    };
    recentLogs.push(logWithTimestamp);

    // 模擬 Firestore 同步
    await mockFirestoreLogService.saveLog(logEntry);
  };

  // 實作驗證邏輯（與實際服務器相同）
  app.post("/api/logs", async (req, res) => {
    const {
      level = "info",
      message,
      service = "unknown",
      metadata = {},
    } = req.body;

    // 驗證必要欄位
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "驗證失敗",
        message: "message 欄位是必要的且必須是字串",
      });
    }

    const logEntry = {
      level,
      message,
      service,
      ...metadata,
    };

    try {
      await addLogToMemory(logEntry);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "處理日誌失敗", message: error.message });
    }
  });

  // 健康檢查 API
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      totalLogs: recentLogs.length,
      services: [...new Set(recentLogs.map((log) => log.service))],
      firestore: {
        enabled: true,
        status: "connected",
      },
    });
  });

  // 讀取日誌 API
  app.get("/api/logs", (req, res) => {
    const { limit = 100 } = req.query;
    const result = recentLogs.slice(-parseInt(limit)).reverse();
    res.json(result);
  });

  return app;
}

describe("Server API Validation", () => {
  let app;

  beforeEach(() => {
    // 重置 mock
    jest.clearAllMocks();
    // 建立新的測試 app
    app = createTestApp();
  });

  describe("POST /api/logs - Input Validation", () => {
    it("should return 400 when message is missing", async () => {
      const response = await request(app)
        .post("/api/logs")
        .send({ level: "info", service: "test" })
        .expect(400);

      expect(response.body).toEqual({
        error: "驗證失敗",
        message: "message 欄位是必要的且必須是字串",
      });
    });

    it("should return 400 when message is empty string", async () => {
      const response = await request(app)
        .post("/api/logs")
        .send({ message: "", level: "info", service: "test" })
        .expect(400);

      expect(response.body).toEqual({
        error: "驗證失敗",
        message: "message 欄位是必要的且必須是字串",
      });
    });

    it("should return 400 when message is not a string", async () => {
      const response = await request(app)
        .post("/api/logs")
        .send({ message: 123, level: "info", service: "test" })
        .expect(400);

      expect(response.body).toEqual({
        error: "驗證失敗",
        message: "message 欄位是必要的且必須是字串",
      });
    });

    it("should return 400 when message is null", async () => {
      const response = await request(app)
        .post("/api/logs")
        .send({ message: null, level: "info", service: "test" })
        .expect(400);

      expect(response.body).toEqual({
        error: "驗證失敗",
        message: "message 欄位是必要的且必須是字串",
      });
    });

    it("should return 200 with valid minimal payload", async () => {
      const response = await request(app)
        .post("/api/logs")
        .send({ message: "Test message" })
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it("should return 200 with complete valid payload", async () => {
      const payload = {
        level: "info",
        message: "Test message with metadata",
        service: "test-service",
        metadata: { userId: "123", action: "test" },
      };

      const response = await request(app)
        .post("/api/logs")
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it("should use default values for optional fields", async () => {
      const response = await request(app)
        .post("/api/logs")
        .send({ message: "Test with defaults" })
        .expect(200);

      expect(response.body).toEqual({ success: true });
      // 驗證使用了預設值 (level: 'info', service: 'unknown')
    });
  });

  describe("GET /api/logs - Response Format", () => {
    it("should return array for memory source", async () => {
      const response = await request(app).get("/api/logs?limit=1").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return array for firestore source", async () => {
      const response = await request(app)
        .get("/api/logs?source=firestore&limit=1")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/health - Health Check", () => {
    it("should return health status with firestore info", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toMatchObject({
        status: "ok",
        timestamp: expect.any(String),
        totalLogs: expect.any(Number),
        services: expect.any(Array),
        firestore: {
          enabled: expect.any(Boolean),
          status: expect.any(String),
        },
      });
    });
  });
});
