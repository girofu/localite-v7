/**
 * 獨立的日誌管理服務器
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const winston = require("winston");
const path = require("path");
const fs = require("fs");
const FirestoreLogService = require("./services/FirestoreLogService");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Winston logger 設置
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "localite-logs" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// 確保 logs 目錄存在
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 中間件
app.use(cors());
app.use(express.json());

// 提供靜態文件
app.use(express.static("public"));

// 內存存儲最近的日誌 (最多保留 1000 條)
const recentLogs = [];
const MAX_RECENT_LOGS = 1000;

// 初始化 Firestore 日誌服務
let firestoreLogService;
try {
  firestoreLogService = new FirestoreLogService();
  console.log("✅ Firestore 日誌服務已初始化");
} catch (error) {
  console.warn(
    "⚠️  Firestore 日誌服務初始化失敗，僅使用內存存儲:",
    error.message
  );
  firestoreLogService = null;
}

// 添加日誌到內存和 Firestore
const addLogToMemory = async (logEntry) => {
  const logWithTimestamp = {
    ...logEntry,
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
  };

  // 添加到內存存儲
  recentLogs.push(logWithTimestamp);

  // 保持最多 1000 條記錄
  if (recentLogs.length > MAX_RECENT_LOGS) {
    recentLogs.shift();
  }

  // 同步到 Firestore（非阻塞）
  if (firestoreLogService) {
    try {
      await firestoreLogService.saveLog(logEntry);
    } catch (error) {
      logger.error("同步日誌到 Firestore 失敗", {
        error: error.message,
        logEntry: logEntry,
      });
    }
  }
};

// API 路由
app.get("/api/logs", async (req, res) => {
  const { level, service, limit = 100, source = "memory" } = req.query;

  try {
    if (source === "firestore" && firestoreLogService) {
      // 從 Firestore 獲取日誌
      const logs = await firestoreLogService.getLogs({
        level,
        service,
        limit: parseInt(limit),
      });
      res.json(logs);
    } else {
      // 從內存獲取日誌 (預設行為)
      let filteredLogs = recentLogs;

      if (level) {
        filteredLogs = filteredLogs.filter((log) => log.level === level);
      }

      if (service) {
        filteredLogs = filteredLogs.filter((log) => log.service === service);
      }

      // 返回最新的 limit 條記錄
      const result = filteredLogs.slice(-parseInt(limit)).reverse();
      res.json(result);
    }
  } catch (error) {
    logger.error("獲取日誌失敗", { error: error.message });
    res.status(500).json({ error: "獲取日誌失敗", message: error.message });
  }
});

// 接收日誌的 API
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
    // 記錄到 Winston
    logger.log(level, message, { service, ...metadata });

    // 添加到內存和 Firestore
    await addLogToMemory(logEntry);

    // 廣播給所有連接的客戶端
    io.emit("newLog", {
      ...logEntry,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("處理日誌失敗", { error: error.message, logEntry });
    res.status(500).json({ error: "處理日誌失敗", message: error.message });
  }
});

// 健康檢查
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    totalLogs: recentLogs.length,
    services: [...new Set(recentLogs.map((log) => log.service))],
    firestore: {
      enabled: !!firestoreLogService,
      status: firestoreLogService ? "connected" : "disabled",
    },
  });
});

// Socket.IO 連接處理
io.on("connection", (socket) => {
  console.log("日誌客戶端已連接:", socket.id);

  // 發送最近的日誌給新連接的客戶端
  socket.emit("initialLogs", recentLogs.slice(-50).reverse());

  // 接收來自應用的日誌
  socket.on("log", async (logData) => {
    // 驗證必要欄位
    if (!logData.message || typeof logData.message !== "string") {
      logger.error("Socket 日誌驗證失敗", {
        error: "message 欄位是必要的且必須是字串",
        receivedData: logData,
      });
      return;
    }

    const logEntry = {
      level: logData.level || "info",
      message: logData.message,
      service: logData.service || "app",
      ...logData.metadata,
    };

    try {
      logger.log(logEntry.level, logEntry.message, {
        service: logEntry.service,
        ...logData.metadata,
      });

      await addLogToMemory(logEntry);

      // 廣播給所有客戶端
      io.emit("newLog", {
        ...logEntry,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Socket 日誌處理失敗", { error: error.message, logEntry });
    }
  });

  socket.on("disconnect", () => {
    console.log("日誌客戶端已斷開:", socket.id);
  });
});

// 模擬一些初始日誌用於測試
setTimeout(async () => {
  try {
    await addLogToMemory({
      level: "info",
      message: "日誌服務已啟動",
      service: "logs-dashboard",
    });

    await addLogToMemory({
      level: "warn",
      message: "註冊功能檢測到問題：使用錯誤的 SignupScreen 元件",
      service: "localite-app",
      details: {
        file: "app/index.tsx",
        line: 307,
        issue: "Should use RegisterScreen instead of SignupScreen",
      },
    });
  } catch (error) {
    logger.error("初始化測試日誌失敗", { error: error.message });
  }
}, 1000);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 日誌管理服務器運行在 http://localhost:${PORT}`);
  logger.info("日誌管理服務器已啟動", { port: PORT });
});
