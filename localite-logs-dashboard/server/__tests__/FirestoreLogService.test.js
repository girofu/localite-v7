/**
 * FirestoreLogService 測試
 * 測試日誌與 Firestore 的同步功能
 */

const FirestoreLogService = require("../services/FirestoreLogService");

// Mock Firebase
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
      })),
    })),
  })),
  credential: {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  },
  apps: [], // Mock apps 陣列
}));

describe("FirestoreLogService", () => {
  let firestoreLogService;
  let mockFirestore;
  let mockCollection;

  beforeEach(() => {
    // 重置 mocks
    jest.clearAllMocks();

    // 設置 mock Firestore
    mockCollection = {
      add: jest.fn(),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
      })),
    };

    mockFirestore = {
      collection: jest.fn(() => mockCollection),
    };

    firestoreLogService = new FirestoreLogService(mockFirestore);
  });

  describe("saveLog", () => {
    it("should save log entry to Firestore with timestamp", async () => {
      // Arrange
      const logEntry = {
        level: "info",
        message: "Test message",
        service: "test-service",
        metadata: { userId: "123" },
      };

      mockCollection.add.mockResolvedValue({ id: "mock-doc-id" });

      // Act
      const result = await firestoreLogService.saveLog(logEntry);

      // Assert
      expect(mockFirestore.collection).toHaveBeenCalledWith("logs");
      expect(mockCollection.add).toHaveBeenCalledWith({
        ...logEntry,
        timestamp: expect.any(Date),
        createdAt: expect.any(Date),
      });
      expect(result).toHaveProperty("id", "mock-doc-id");
    });

    it("should throw error when Firestore save fails", async () => {
      // Arrange
      const logEntry = {
        level: "error",
        message: "Error message",
        service: "test-service",
      };

      const error = new Error("Firestore save failed");
      mockCollection.add.mockRejectedValue(error);

      // Act & Assert
      await expect(firestoreLogService.saveLog(logEntry)).rejects.toThrow(
        "Firestore save failed"
      );
    });
  });

  describe("getLogs", () => {
    it("should retrieve logs with default limit", async () => {
      // Arrange
      const mockDocs = [
        {
          id: "1",
          data: () => ({
            level: "info",
            message: "Log 1",
            timestamp: new Date(),
          }),
        },
        {
          id: "2",
          data: () => ({
            level: "error",
            message: "Log 2",
            timestamp: new Date(),
          }),
        },
      ];

      const mockSnapshot = { docs: mockDocs };
      const mockGet = jest.fn().mockResolvedValue(mockSnapshot);
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockOrderBy = jest.fn(() => ({ limit: mockLimit }));

      mockCollection.orderBy.mockReturnValue({ limit: mockLimit });

      // Act
      const logs = await firestoreLogService.getLogs();

      // Assert
      expect(mockFirestore.collection).toHaveBeenCalledWith("logs");
      expect(mockCollection.orderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(mockLimit).toHaveBeenCalledWith(100); // 預設限制
      expect(logs).toHaveLength(2);
      expect(logs[0]).toHaveProperty("id", "1");
      expect(logs[1]).toHaveProperty("id", "2");
    });

    it("should filter logs by level", async () => {
      // Arrange
      const level = "error";
      const mockDocs = [
        {
          id: "1",
          data: () => ({
            level: "error",
            message: "Error log",
            timestamp: new Date(),
          }),
        },
      ];

      const mockSnapshot = { docs: mockDocs };
      const mockGet = jest.fn().mockResolvedValue(mockSnapshot);
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockOrderBy = jest.fn(() => ({ limit: mockLimit }));
      const mockWhere = jest.fn(() => ({ orderBy: mockOrderBy }));

      mockCollection.where.mockReturnValue({ orderBy: mockOrderBy });

      // Act
      const logs = await firestoreLogService.getLogs({ level });

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith("level", "==", "error");
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe("error");
    });

    it("should filter logs by service", async () => {
      // Arrange
      const service = "auth-service";
      const mockDocs = [
        {
          id: "1",
          data: () => ({
            service: "auth-service",
            message: "Auth log",
            timestamp: new Date(),
          }),
        },
      ];

      const mockSnapshot = { docs: mockDocs };
      const mockGet = jest.fn().mockResolvedValue(mockSnapshot);
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockOrderBy = jest.fn(() => ({ limit: mockLimit }));

      mockCollection.where.mockReturnValue({ orderBy: mockOrderBy });

      // Act
      const logs = await firestoreLogService.getLogs({ service });

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith(
        "service",
        "==",
        "auth-service"
      );
    });
  });

  describe("initialization", () => {
    it("should initialize Firebase Admin SDK correctly", () => {
      // Act
      const service = new FirestoreLogService();

      // Assert - 驗證初始化過程不會拋出錯誤
      expect(service).toBeDefined();
    });
  });
});
