import { FirestoreService } from './FirestoreService';
import LoggingService from './LoggingService';
import { Badge, BadgeTriggerType, BadgeTriggerMetadata } from '../types/badge.types';
import { getBadgeById, BADGE_CONDITIONS } from '../data/badges';

/**
 * 徽章服務自定義錯誤
 */
export class BadgeServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'BadgeServiceError';
  }
}

/**
 * 徽章管理服務
 * 
 * 負責管理用戶徽章的獲得、查詢和條件檢查
 * 整合 FirestoreService 進行資料持久化
 * 整合 LoggingService 進行操作日誌記錄
 */
export class BadgeService {
  constructor(
    private firestoreService: FirestoreService,
    private loggingService: LoggingService
  ) {}

  /**
   * 獲取用戶的所有徽章
   * 
   * @param userId 用戶ID
   * @returns 用戶擁有的徽章列表
   * @throws {BadgeServiceError} 當用戶ID為空或獲取失敗時
   */
  async getUserBadges(userId: string): Promise<Badge[]> {
    this.validateUserId(userId);

    try {
      return await this.firestoreService.getUserBadges(userId);
    } catch (error) {
      this.loggingService.error('Failed to get user badges', { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new BadgeServiceError('無法獲取用戶徽章', error);
    }
  }

  /**
   * 授予用戶特定徽章
   * 
   * @param userId 用戶ID
   * @param badgeId 徽章ID
   * @throws {BadgeServiceError} 當參數無效或授予失敗時
   */
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    this.validateUserId(userId);
    this.validateBadgeId(badgeId);

    try {
      // Check if user already has this badge
      const hasTheBadge = await this.firestoreService.hasUserBadge(userId, badgeId);
      
      if (hasTheBadge) {
        this.loggingService.info('Badge already owned', { userId, badgeId });
        return;
      }

      // Award the badge
      await this.firestoreService.awardBadgeToUser(userId, badgeId);

      // Log the achievement
      this.loggingService.info('Badge awarded', {
        userId,
        badgeId,
        timestamp: new Date()
      });
    } catch (error) {
      this.loggingService.error('Failed to award badge', {
        userId,
        badgeId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new BadgeServiceError('無法授予徽章', error);
    }
  }

  /**
   * 檢查並授予符合條件的徽章
   * 
   * @param userId 用戶ID
   * @param triggerType 觸發類型
   * @param metadata 額外的條件檢查數據
   * @returns 新授予的徽章列表
   */
  async checkBadgeConditions(
    userId: string, 
    triggerType: BadgeTriggerType, 
    metadata?: BadgeTriggerMetadata
  ): Promise<Badge[]> {
    const awardedBadges: Badge[] = [];

    switch (triggerType) {
      case 'first_login':
        const firstLoginBadge = await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.FIRST_LOGIN);
        if (firstLoginBadge) {
          awardedBadges.push(firstLoginBadge);
        }
        break;

      case 'tour_completed':
        const toursCount = metadata?.completedToursCount || 0;
        const explorationBadge = await this.checkExplorationBadges(userId, toursCount);
        if (explorationBadge) {
          awardedBadges.push(explorationBadge);
        }
        break;

      case 'quiz_completed':
        // 檢查任務成就徽章
        const quizBadge = await this.checkQuizBadges(userId, metadata);
        if (quizBadge) {
          awardedBadges.push(quizBadge);
        }
        break;

      case 'location_specific':
        // 檢查地點特定徽章
        const locationBadge = await this.checkLocationBadges(userId, metadata);
        if (locationBadge) {
          awardedBadges.push(locationBadge);
        }
        break;
    }

    return awardedBadges;
  }

  /**
   * 檢查並授予單一徽章
   * 
   * @param userId 用戶ID
   * @param badgeId 徽章ID
   * @returns 授予的徽章或null
   */
  private async checkAndAwardBadge(userId: string, badgeId: string): Promise<Badge | null> {
    const hasUserBadge = await this.firestoreService.hasUserBadge(userId, badgeId);
    if (!hasUserBadge) {
      await this.firestoreService.awardBadgeToUser(userId, badgeId);
      const badge = getBadgeById(badgeId);
      if (badge) {
        this.loggingService.info('Badge auto-awarded', {
          userId,
          badgeId,
          badgeName: badge.name,
          timestamp: new Date()
        });
        return badge;
      }
    }
    return null;
  }

  /**
   * 檢查探索相關徽章
   * 
   * @param userId 用戶ID
   * @param toursCount 完成的導覽次數
   * @returns 授予的徽章或null
   */
  private async checkExplorationBadges(userId: string, toursCount: number): Promise<Badge | null> {
    if (toursCount >= 10) {
      return await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.TOURS_COMPLETED_10);
    }
    if (toursCount >= 5) {
      return await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.TOURS_COMPLETED_5);
    }
    if (toursCount >= 3) {
      return await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.TOURS_COMPLETED_3);
    }
    return null;
  }

  /**
   * 檢查問答任務徽章
   * 
   * @param userId 用戶ID
   * @param metadata 包含問答相關資訊
   * @returns 授予的徽章或null
   */
  private async checkQuizBadges(userId: string, metadata?: BadgeTriggerMetadata): Promise<Badge | null> {
    const quizCount = metadata?.quizCorrectAnswers || 1;

    // 檢查問答徽章
    if (quizCount >= 1) {
      const badge = await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.QUIZ_COMPLETED_1);
      if (badge) return badge;
    }

    if (quizCount >= 5) {
      const badge = await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.QUIZ_COMPLETED_5);
      if (badge) return badge;
    }

    if (quizCount >= 10) {
      const badge = await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.QUIZ_COMPLETED_10);
      if (badge) return badge;
    }

    return null;
  }

  /**
   * 檢查地點特定徽章
   * 
   * @param userId 用戶ID
   * @param metadata 包含地點相關資訊
   * @returns 授予的徽章或null
   */
  private async checkLocationBadges(userId: string, metadata?: BadgeTriggerMetadata): Promise<Badge | null> {
    const placeName = metadata?.placeName || '';
    const placeId = metadata?.placeId || '';

    // 檢查忠寮地區特殊徽章 (B7-1 忠忠初登場)
    if (placeName.includes('忠寮') || placeId.includes('zhongliao') || placeName.includes('Zhongliao')) {
      const badge = await this.checkAndAwardBadge(userId, BADGE_CONDITIONS.LOCATION_ZHONGLIAO);
      if (badge) {
        this.loggingService.info('Location-specific badge awarded', {
          userId,
          badgeId: BADGE_CONDITIONS.LOCATION_ZHONGLIAO,
          placeName,
          placeId,
          metadata
        });
        return badge;
      }
    }

    return null;
  }

  /**
   * 驗證用戶ID是否有效
   * 
   * @param userId 用戶ID
   * @throws {BadgeServiceError} 當用戶ID無效時
   */
  private validateUserId(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new BadgeServiceError('User ID cannot be empty');
    }
  }

  /**
   * 驗證徽章ID是否有效
   * 
   * @param badgeId 徽章ID
   * @throws {BadgeServiceError} 當徽章ID無效時
   */
  private validateBadgeId(badgeId: string): void {
    if (!badgeId || badgeId.trim() === '') {
      throw new BadgeServiceError('Badge ID cannot be empty');
    }
  }
}
