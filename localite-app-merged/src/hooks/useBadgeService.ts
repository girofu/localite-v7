import { useState, useEffect, useCallback, useMemo } from 'react';
import { BadgeService } from '../services/BadgeService';
import { FirestoreService } from '../services/FirestoreService';
import LoggingService, { logger } from '../services/LoggingService';
import { Badge, BadgeTriggerType, BadgeTriggerMetadata } from '../types/badge.types';

/**
 * 徽章服務 Hook
 * 
 * 提供徽章相關的狀態管理和操作方法
 */
export const useBadgeService = (userId?: string) => {
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用 useMemo 確保服務實例穩定
  const badgeService = useMemo(() => {
    const firestoreService = new FirestoreService();
    return new BadgeService(firestoreService, logger);
  }, []); // 空依賴陣列，只創建一次

  /**
   * 載入用戶徽章
   */
  const loadUserBadges = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const badges = await badgeService.getUserBadges(userId);
      setUserBadges(badges);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '載入徽章失敗';
      setError(errorMessage);
      setUserBadges([]);
    } finally {
      setLoading(false);
    }
  }, [userId, badgeService]);

  /**
   * 檢查徽章條件並自動授予
   */
  const checkBadgeConditions = useCallback(async (
    triggerType: BadgeTriggerType,
    metadata?: BadgeTriggerMetadata
  ): Promise<Badge[]> => {
    if (!userId) return [];

    try {
      const newBadges = await badgeService.checkBadgeConditions(userId, triggerType, metadata);
      
      if (newBadges.length > 0) {
        // 重新載入用戶徽章
        try {
          const badges = await badgeService.getUserBadges(userId);
          setUserBadges(badges);
        } catch (err) {
          // 載入失敗時保持原有徽章列表
          console.warn('Failed to reload badges after awarding new badges');
        }
      }
      
      return newBadges;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '檢查徽章條件失敗';
      setError(errorMessage);
      return [];
    }
  }, [userId, badgeService]);

  /**
   * 手動授予徽章
   */
  const awardBadge = useCallback(async (badgeId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      await badgeService.awardBadge(userId, badgeId);
      
      // 重新載入徽章
      try {
        const badges = await badgeService.getUserBadges(userId);
        setUserBadges(badges);
      } catch (err) {
        console.warn('Failed to reload badges after manual award');
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '授予徽章失敗';
      setError(errorMessage);
      return false;
    }
  }, [userId, badgeService]);

  /**
   * 檢查用戶是否擁有特定徽章
   */
  const hasUserBadge = useCallback((badgeId: string): boolean => {
    return userBadges.some(badge => badge.id === badgeId);
  }, [userBadges]);

  /**
   * 取得用戶擁有的徽章ID列表
   */
  const getUserBadgeIds = useCallback((): string[] => {
    return userBadges.map(badge => badge.id);
  }, [userBadges]);

  // 當 userId 變化時自動載入徽章
  useEffect(() => {
    if (userId) {
      const loadBadges = async () => {
        setLoading(true);
        setError(null);

        try {
          const badges = await badgeService.getUserBadges(userId);
          setUserBadges(badges);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : '載入徽章失敗';
          setError(errorMessage);
          setUserBadges([]);
        } finally {
          setLoading(false);
        }
      };

      loadBadges();
    } else {
      setUserBadges([]);
      setError(null);
    }
  }, [userId, badgeService]); // 只依賴 userId 和 badgeService

  return {
    // 狀態
    userBadges,
    loading,
    error,
    
    // 方法
    loadUserBadges,
    checkBadgeConditions,
    awardBadge,
    hasUserBadge,
    getUserBadgeIds,
    
    // 清理錯誤
    clearError: () => setError(null),
  };
};
