import { BadgeService } from '../src/services/BadgeService';
import { FirestoreService } from '../src/services/FirestoreService';
import LoggingService from '../src/services/LoggingService';
import { Badge } from '../src/types/badge.types';

// Mock dependencies
jest.mock('../src/services/FirestoreService');
jest.mock('../src/services/LoggingService');
jest.mock('../src/config/firebase', () => ({
  firestore: {},
  storage: {},
}));

describe('BadgeService', () => {
  let badgeService: BadgeService;
  let mockFirestoreService: jest.Mocked<FirestoreService>;
  let mockLoggingService: jest.Mocked<LoggingService>;

  beforeEach(() => {
    mockFirestoreService = new FirestoreService() as jest.Mocked<FirestoreService>;
    mockLoggingService = new LoggingService() as jest.Mocked<LoggingService>;
    badgeService = new BadgeService(mockFirestoreService, mockLoggingService);
  });

  describe('getUserBadges', () => {
    it('should return user badges from Firestore', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedBadges: Badge[] = [
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

      mockFirestoreService.getUserBadges = jest.fn().mockResolvedValue(expectedBadges);

      // Act
      const result = await badgeService.getUserBadges(userId);

      // Assert
      expect(result).toEqual(expectedBadges);
      expect(mockFirestoreService.getUserBadges).toHaveBeenCalledWith(userId);
    });

    it('should throw error when userId is empty', async () => {
      // Arrange
      const userId = '';

      // Act & Assert
      await expect(badgeService.getUserBadges(userId)).rejects.toThrow(
        'User ID cannot be empty'
      );
    });
  });

  describe('awardBadge', () => {
    it('should award badge to user and log the achievement', async () => {
      // Arrange
      const userId = 'user-123';
      const badgeId = 'B2-1';
      
      mockFirestoreService.awardBadgeToUser = jest.fn().mockResolvedValue(true);
      mockLoggingService.info = jest.fn();

      // Act
      await badgeService.awardBadge(userId, badgeId);

      // Assert
      expect(mockFirestoreService.awardBadgeToUser).toHaveBeenCalledWith(userId, badgeId);
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'Badge awarded',
        expect.objectContaining({
          userId,
          badgeId,
          timestamp: expect.any(Date)
        })
      );
    });

    it('should not award duplicate badges', async () => {
      // Arrange
      const userId = 'user-123';
      const badgeId = 'B2-1';
      
      mockFirestoreService.hasUserBadge = jest.fn().mockResolvedValue(true);
      mockFirestoreService.awardBadgeToUser = jest.fn();

      // Act
      await badgeService.awardBadge(userId, badgeId);

      // Assert
      expect(mockFirestoreService.awardBadgeToUser).not.toHaveBeenCalled();
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'Badge already owned',
        expect.objectContaining({ userId, badgeId })
      );
    });
  });

  describe('checkBadgeConditions', () => {
    it('should award first login badge on user registration', async () => {
      // Arrange
      const userId = 'user-123';
      const triggerType = 'first_login';
      
      mockFirestoreService.hasUserBadge = jest.fn().mockResolvedValue(false);
      mockFirestoreService.awardBadgeToUser = jest.fn().mockResolvedValue(true);

      // Act
      const awardedBadges = await badgeService.checkBadgeConditions(userId, triggerType);

      // Assert
      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].id).toBe('B2-1'); // 綠芽初登場
      expect(mockFirestoreService.awardBadgeToUser).toHaveBeenCalledWith(userId, 'B2-1');
    });

    it('should award exploration badges based on completed tours', async () => {
      // Arrange
      const userId = 'user-123';
      const triggerType = 'tour_completed';
      const metadata = { completedToursCount: 3 };
      
      mockFirestoreService.hasUserBadge = jest.fn().mockResolvedValue(false);
      mockFirestoreService.awardBadgeToUser = jest.fn().mockResolvedValue(true);

      // Act
      const awardedBadges = await badgeService.checkBadgeConditions(userId, triggerType, metadata);

      // Assert
      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].id).toBe('B2-2'); // 探索者1號
    });
  });
});
