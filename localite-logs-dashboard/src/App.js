/**
 * 日誌管理 Dashboard 主應用
 */

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

// 動態檢測服務器地址
const getServerUrl = () => {
  // 如果是開發環境，優先使用環境變數或當前主機
  if (process.env.NODE_ENV === "development") {
    return (
      process.env.REACT_APP_SERVER_URL ||
      `http://${window.location.hostname}:5001`
    );
  }
  // 生產環境使用當前主機
  return `http://${window.location.hostname}:5001`;
};

const serverUrl = getServerUrl();
console.log("🔌 連接到日誌服務器:", serverUrl);
const socket = io(serverUrl);

function App() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({
    level: "",
    service: "",
    search: "",
  });
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warns: 0,
    infos: 0,
  });
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Socket 連接事件
    socket.on("connect", () => {
      console.log("已連接到日誌服務器");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("與日誌服務器斷開連接");
      setConnected(false);
    });

    // 接收初始日誌
    socket.on("initialLogs", (initialLogs) => {
      setLogs(initialLogs);
      updateStats(initialLogs);
    });

    // 接收新日誌
    socket.on("newLog", (newLog) => {
      setLogs((prev) => {
        const updated = [newLog, ...prev].slice(0, 1000); // 保持最多 1000 條
        updateStats(updated);
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("initialLogs");
      socket.off("newLog");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const updateStats = (logList) => {
    const stats = {
      total: logList.length,
      errors: logList.filter((log) => log.level === "error").length,
      warns: logList.filter((log) => log.level === "warn").length,
      infos: logList.filter((log) => log.level === "info").length,
    };
    setStats(stats);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredLogs = logs.filter((log) => {
    const levelMatch = !filter.level || log.level === filter.level;
    const serviceMatch =
      !filter.service || log.service.includes(filter.service);
    const searchMatch =
      !filter.search ||
      log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
      log.service.toLowerCase().includes(filter.search.toLowerCase());

    return levelMatch && serviceMatch && searchMatch;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return "#ff4757";
      case "warn":
        return "#ffa502";
      case "info":
        return "#2ed573";
      case "debug":
        return "#5352ed";
      default:
        return "#747d8c";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("zh-TW");
  };

  const testLog = (level) => {
    socket.emit("log", {
      level,
      message: `測試 ${level} 級別日誌 - ${new Date().toLocaleString()}`,
      service: "test-dashboard",
      metadata: {
        testId: Math.random().toString(36).substring(7),
        browser: navigator.userAgent,
      },
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🚀 Localite 日誌管理</h1>
          <div
            className={`connection-status ${
              connected ? "connected" : "disconnected"
            }`}
          >
            {connected ? "🟢 已連接" : "🔴 未連接"}
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">總計</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item error">
            <span className="stat-label">錯誤</span>
            <span className="stat-value">{stats.errors}</span>
          </div>
          <div className="stat-item warn">
            <span className="stat-label">警告</span>
            <span className="stat-value">{stats.warns}</span>
          </div>
          <div className="stat-item info">
            <span className="stat-label">資訊</span>
            <span className="stat-value">{stats.infos}</span>
          </div>
        </div>
      </header>

      <div className="filters">
        <div className="filter-group">
          <select
            value={filter.level}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, level: e.target.value }))
            }
          >
            <option value="">所有級別</option>
            <option value="error">錯誤</option>
            <option value="warn">警告</option>
            <option value="info">資訊</option>
            <option value="debug">調試</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="text"
            placeholder="搜尋服務名稱..."
            value={filter.service}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, service: e.target.value }))
            }
          />
        </div>

        <div className="filter-group">
          <input
            type="text"
            placeholder="搜尋日誌內容..."
            value={filter.search}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        <div className="test-buttons">
          <button onClick={() => testLog("info")} className="test-btn info">
            測試 INFO
          </button>
          <button onClick={() => testLog("warn")} className="test-btn warn">
            測試 WARN
          </button>
          <button onClick={() => testLog("error")} className="test-btn error">
            測試 ERROR
          </button>
        </div>

        <button onClick={() => setLogs([])} className="clear-btn">
          清空日誌
        </button>
      </div>

      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            <p>沒有匹配的日誌記錄</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={log.id || index} className="log-entry">
              <div className="log-header">
                <span
                  className="log-level"
                  style={{ backgroundColor: getLevelColor(log.level) }}
                >
                  {log.level.toUpperCase()}
                </span>
                <span className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className="log-service">{log.service}</span>
              </div>
              <div className="log-message">{log.message}</div>
              {log.details && (
                <div className="log-details">
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default App;
