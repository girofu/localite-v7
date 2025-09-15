import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBadgeService } from '../../src/hooks/useBadgeService';
import { Badge } from '../../src/types/badge.types';

// Mock dependencies
jest.mock('../../src/services/BadgeService');
jest.mock('../../src/services/FirestoreService');
jest.mock('../../src/services/LoggingService');
jest.mock('../../src/config/firebase', () => ({
  firestore: {},
  storage: {},
}));

describe('useBadgeService', () => {
  const mockUserId = 'user-123';
  const mockBadges: Badge[] = [
    {
      id: 'B2-1',
      type: '成長里程碑',
      name: '綠芽初登場',
      englishName: 'babyron',
      description: '首次成功登入，你已解鎖「綠芽」限定導覽員，獲得「綠芽初登場」徽章',
      badgeImage: 'B2-1',
      shareImage: 'B2-1-share',
      displayType: 'modal',
      condition: '首次註冊成功',
      trigger: '首次登入/註冊後',
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初始狀態', () => {
    it('應該有正確的初始狀態', () => {
      const { result } = renderHook(() => useBadgeService());
      
      expect(result.current.userBadges).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('應該提供所有必要的方法', () => {
      const { result } = renderHook(() => useBadgeService());
      
      expect(typeof result.current.loadUserBadges).toBe('function');
      expect(typeof result.current.checkBadgeConditions).toBe('function');
      expect(typeof result.current.awardBadge).toBe('function');
      expect(typeof result.current.hasUserBadge).toBe('function');
      expect(typeof result.current.getUserBadgeIds).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('用戶徽章載入', () => {
    it('當 userId 存在時應該自動載入徽章', async () => {
      const { BadgeService } = require('../../src/services/BadgeService');
      const mockGetUserBadges = jest.fn().mockResolvedValue(mockBadges);
      BadgeService.prototype.getUserBadges = mockGetUserBadges;

      const { result } = renderHook(() => useBadgeService(mockUserId));

      // 等待載入完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userBadges).toEqual(mockBadges);
      expect(mockGetUserBadges).toHaveBeenCalledWith(mockUserId);
    });

    it('當 userId 為空時不應該載入徽章', () => {
      const { result } = renderHook(() => useBadgeService());
      
      expect(result.current.userBadges).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('載入失敗時應該設置錯誤狀態', async () => {
      const { BadgeService } = require('../../src/services/BadgeService');
      const mockGetUserBadges = jest.fn().mockRejectedValue(new Error('載入失敗'));
      BadgeService.prototype.getUserBadges = mockGetUserBadges;

      const { result } = renderHook(() => useBadgeService(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('載入失敗');
      expect(result.current.userBadges).toEqual([]);
    });
  });

  describe('徽章條件檢查', () => {
    it('應該檢查並返回新獲得的徽章', async () => {
      const { BadgeService } = require('../../src/services/BadgeService');
      const mockCheckBadgeConditions = jest.fn().mockResolvedValue(mockBadges);
      const mockGetUserBadges = jest.fn().mockResolvedValue([]);
      
      BadgeService.prototype.checkBadgeConditions = mockCheckBadgeConditions;
      BadgeService.prototype.getUserBadges = mockGetUserBadges;

      const { result } = renderHook(() => useBadgeService(mockUserId));

      let newBadges: Badge[] = [];
      await act(async () => {
        newBadges = await result.current.checkBadgeConditions('first_login');
      });

      expect(newBadges).toEqual(mockBadges);
      expect(mockCheckBadgeConditions).toHaveBeenCalledWith(mockUserId, 'first_login', undefined);
    });

    it('當沒有 userId 時應該返回空陣列', async () => {
      const { result } = renderHook(() => useBadgeService());

      let newBadges: Badge[] = [];
      await act(async () => {
        newBadges = await result.current.checkBadgeConditions('first_login');
      });

      expect(newBadges).toEqual([]);
    });
  });

  describe('徽章授予', () => {
    it('應該成功授予徽章', async () => {
      const { BadgeService } = require('../../src/services/BadgeService');
      const mockAwardBadge = jest.fn().mockResolvedValue(undefined);
      const mockGetUserBadges = jest.fn().mockResolvedValue(mockBadges);
      
      BadgeService.prototype.awardBadge = mockAwardBadge;
      BadgeService.prototype.getUserBadges = mockGetUserBadges;

      const { result } = renderHook(() => useBadgeService(mockUserId));

      let success = false;
      await act(async () => {
        success = await result.current.awardBadge('B2-1');
      });

      expect(success).toBe(true);
      expect(mockAwardBadge).toHaveBeenCalledWith(mockUserId, 'B2-1');
    });

    it('當沒有 userId 時應該返回 false', async () => {
      const { result } = renderHook(() => useBadgeService());

      let success = false;
      await act(async () => {
        success = await result.current.awardBadge('B2-1');
      });

      expect(success).toBe(false);
    });
  });

  describe('實用方法', () => {
    it('hasUserBadge 應該正確檢查徽章擁有狀態', () => {
      const { result } = renderHook(() => useBadgeService(mockUserId));

      // 手動設置 userBadges 來測試 hasUserBadge
      act(() => {
        result.current.userBadges.push(...mockBadges);
      });

      expect(result.current.hasUserBadge('B2-1')).toBe(true);
      expect(result.current.hasUserBadge('B2-2')).toBe(false);
    });

    it('getUserBadgeIds 應該返回徽章 ID 陣列', () => {
      const { result } = renderHook(() => useBadgeService(mockUserId));

      act(() => {
        result.current.userBadges.push(...mockBadges);
      });

      expect(result.current.getUserBadgeIds()).toEqual(['B2-1']);
    });

    it('clearError 應該清除錯誤狀態', async () => {
      const { BadgeService } = require('../../src/services/BadgeService');
      const mockGetUserBadges = jest.fn().mockRejectedValue(new Error('測試錯誤'));
      
      BadgeService.prototype.getUserBadges = mockGetUserBadges;

      const { result } = renderHook(() => useBadgeService(mockUserId));

      // 等待載入失敗，產生錯誤狀態
      await waitFor(() => {
        expect(result.current.error).toBe('測試錯誤');
      });

      // 清除錯誤
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });
});
