import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BADGES } from '../data/badges';

export interface UpdateState {
  hasNewBadges: boolean;
  hasNewNews: boolean;
  hasNewPrivacy: boolean;
  lastBadgeCheckTime: Date | null;
  lastNewsCheckTime: Date | null;
  lastPrivacyCheckTime: Date | null;
}

interface UpdateContextType {
  updateState: UpdateState;
  markBadgesAsRead: () => void;
  markNewsAsRead: () => void;
  markPrivacyAsRead: () => void;
  checkForBadgeUpdates: () => void;
  checkForNewsUpdates: () => void;
  checkForPrivacyUpdates: () => void;
  setHasNewBadges: (hasNew: boolean) => void;
  setHasNewNews: (hasNew: boolean) => void;
  setHasNewPrivacy: (hasNew: boolean) => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
};

interface UpdateProviderProps {
  children: ReactNode;
}

export const UpdateProvider: React.FC<UpdateProviderProps> = ({ children }) => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    hasNewBadges: false,
    hasNewNews: false,
    hasNewPrivacy: false,
    lastBadgeCheckTime: null,
    lastNewsCheckTime: null,
    lastPrivacyCheckTime: null,
  });

  // 檢查徽章更新
  const checkForBadgeUpdates = () => {
    // 檢查用戶是否獲得了新徽章
    // 在實際應用中，這裡會檢查：
    // 1. 用戶已獲得的徽章與所有可用徽章的比較
    // 2. 本地存儲的徽章獲得記錄
    // 3. 從 API 獲取最新徽章狀態
    
    // 目前使用簡單的邏輯：如果有徽章數據，就顯示通知
    // 在實際應用中，這裡會檢查是否有新的徽章
    const hasNewBadges = true; // 暫時設為 true 來測試通知功能
    
    setUpdateState(prev => ({
      ...prev,
      hasNewBadges,
      lastBadgeCheckTime: new Date(),
    }));
  };

  // 檢查消息更新
  const checkForNewsUpdates = () => {
    // 檢查是否有新的消息或公告
    // 這裡可以根據實際需求調整邏輯，例如：
    // 1. 檢查本地存儲的最後檢查時間
    // 2. 與服務器比較消息更新時間
    // 3. 檢查是否有未讀的消息
    
    // 目前使用簡單的邏輯：如果有消息數據，就顯示通知
    // 在實際應用中，這裡會檢查是否有新的消息
    const hasNewNews = true; // 暫時設為 true 來測試通知功能
    
    setUpdateState(prev => ({
      ...prev,
      hasNewNews,
      lastNewsCheckTime: new Date(),
    }));
  };

  // 檢查隱私權政策更新
  const checkForPrivacyUpdates = () => {
    // 檢查隱私權政策是否有更新
    // 在實際應用中，這裡會檢查：
    // 1. 隱私權政策的版本號
    // 2. 最後更新時間
    // 3. 用戶是否已閱讀最新版本
    
    // 目前使用簡單的邏輯：如果有隱私權政策數據，就顯示通知
    // 在實際應用中，這裡會檢查是否有新的隱私權政策
    const hasNewPrivacy = true; // 暫時設為 true 來測試通知功能
    
    setUpdateState(prev => ({
      ...prev,
      hasNewPrivacy,
      lastPrivacyCheckTime: new Date(),
    }));
  };

  // 標記徽章為已讀
  const markBadgesAsRead = () => {
    setUpdateState(prev => ({
      ...prev,
      hasNewBadges: false,
    }));
  };

  // 標記消息為已讀
  const markNewsAsRead = () => {
    setUpdateState(prev => ({
      ...prev,
      hasNewNews: false,
    }));
  };

  // 標記隱私權政策為已讀
  const markPrivacyAsRead = () => {
    setUpdateState(prev => ({
      ...prev,
      hasNewPrivacy: false,
    }));
  };

  // 直接設定徽章更新狀態
  const setHasNewBadges = (hasNew: boolean) => {
    setUpdateState(prev => ({
      ...prev,
      hasNewBadges: hasNew,
    }));
  };

  // 直接設定消息更新狀態
  const setHasNewNews = (hasNew: boolean) => {
    setUpdateState(prev => ({
      ...prev,
      hasNewNews: hasNew,
    }));
  };

  // 直接設定隱私權政策更新狀態
  const setHasNewPrivacy = (hasNew: boolean) => {
    setUpdateState(prev => ({
      ...prev,
      hasNewPrivacy: hasNew,
    }));
  };

  // 定期檢查更新（可選）
  useEffect(() => {
    // 應用啟動時檢查一次
    checkForBadgeUpdates();
    checkForNewsUpdates();
    checkForPrivacyUpdates();

    // 可以設定定期檢查，例如每5分鐘檢查一次
    // const interval = setInterval(() => {
    //   checkForBadgeUpdates();
    //   checkForNewsUpdates();
    // }, 5 * 60 * 1000);

    // return () => clearInterval(interval);
  }, []);

  // 開發測試用：手動觸發更新狀態
  useEffect(() => {
    // 在開發模式下，可以通過控制台手動觸發更新
    if (__DEV__) {
      // @ts-ignore
      global.testUpdateBadges = () => setHasNewBadges(true);
      // @ts-ignore
      global.testUpdateNews = () => setHasNewNews(true);
      // @ts-ignore
      global.testUpdatePrivacy = () => setHasNewPrivacy(true);
      // @ts-ignore
      global.clearUpdates = () => {
        setHasNewBadges(false);
        setHasNewNews(false);
        setHasNewPrivacy(false);
      };
      // @ts-ignore
      global.toggleBadgeNotification = () => setHasNewBadges(!updateState.hasNewBadges);
      // @ts-ignore
      global.toggleNewsNotification = () => setHasNewNews(!updateState.hasNewNews);
      // @ts-ignore
      global.togglePrivacyNotification = () => setHasNewPrivacy(!updateState.hasNewPrivacy);
    }
  }, [updateState.hasNewBadges, updateState.hasNewNews, updateState.hasNewPrivacy]);

  const value: UpdateContextType = {
    updateState,
    markBadgesAsRead,
    markNewsAsRead,
    markPrivacyAsRead,
    checkForBadgeUpdates,
    checkForNewsUpdates,
    checkForPrivacyUpdates,
    setHasNewBadges,
    setHasNewNews,
    setHasNewPrivacy,
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};
