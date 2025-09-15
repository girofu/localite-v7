import { FirestoreService } from '../../src/services/FirestoreService';
import { SavedJourneyRecord } from '../../src/types/journey.types';

describe('FirestoreService - Journey Records', () => {
  let firestoreService: FirestoreService;

  beforeEach(() => {
    firestoreService = new FirestoreService();
  });

  afterEach(async () => {
    await firestoreService.cleanup();
  });

  describe('saveJourneyRecord', () => {
    it('should save journey record and return journey ID', async () => {
      // Arrange
      const journeyData: Omit<SavedJourneyRecord, 'id'> = {
        title: '大稻埕歷史建築探索之旅',
        summary: '今天您在導覽員 Kuron 的帶領下，探索了大稻埕的歷史建築...',
        highlights: ['巴洛克式建築特色', '日治時期歷史'],
        placeName: '大稻埕',
        guideName: 'Kuron',
        conversationCount: 5,
        generatedAt: new Date(),
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      const journeyId = await firestoreService.saveJourneyRecord(journeyData);

      // Assert
      expect(journeyId).toBeDefined();
      expect(typeof journeyId).toBe('string');
      expect(journeyId).toMatch(/^journey-/);
    });

    it('should throw error when user ID is missing', async () => {
      // Arrange
      const invalidJourneyData = {
        title: '測試旅程',
        summary: '測試摘要',
        highlights: ['亮點1'],
        placeName: '測試地點',
        guideName: '測試導覽員',
        conversationCount: 1,
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as any; // 故意遺漏 userId

      // Act & Assert
      await expect(firestoreService.saveJourneyRecord(invalidJourneyData))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('getUserJourneyRecords', () => {
    it('should return empty array for user with no journey records', async () => {
      // Act
      const journeys = await firestoreService.getUserJourneyRecords('user999');

      // Assert
      expect(journeys).toEqual([]);
    });

    it('should return user journey records in descending order by creation date', async () => {
      // Arrange
      const userId = 'user123';
      const baseDate1 = new Date('2025-01-01T10:00:00Z');
      const baseDate2 = new Date('2025-01-02T10:00:00Z');

      const journey1 = {
        title: '第一次旅程',
        summary: '第一次旅程摘要',
        highlights: ['亮點1'],
        placeName: '地點1',
        guideName: '導覽員1',
        conversationCount: 3,
        generatedAt: baseDate1,
        userId,
        createdAt: baseDate1,
        updatedAt: baseDate1
      };

      const journey2 = {
        title: '第二次旅程',
        summary: '第二次旅程摘要', 
        highlights: ['亮點2'],
        placeName: '地點2',
        guideName: '導覽員2',
        conversationCount: 5,
        generatedAt: baseDate2,
        userId,
        createdAt: baseDate2,
        updatedAt: baseDate2
      };

      // 先儲存兩個旅程
      await firestoreService.saveJourneyRecord(journey1);
      await firestoreService.saveJourneyRecord(journey2);

      // Act
      const journeys = await firestoreService.getUserJourneyRecords(userId);

      // Assert
      expect(journeys).toHaveLength(2);
      expect(journeys[0].title).toBe('第二次旅程'); // 較新的在前
      expect(journeys[1].title).toBe('第一次旅程');
    });

    it('should apply limit when specified', async () => {
      // Arrange
      const userId = 'user123';
      
      // 建立3個旅程記錄
      for (let i = 1; i <= 3; i++) {
        await firestoreService.saveJourneyRecord({
          title: `旅程${i}`,
          summary: `旅程${i}摘要`,
          highlights: [`亮點${i}`],
          placeName: `地點${i}`,
          guideName: `導覽員${i}`,
          conversationCount: i,
          generatedAt: new Date(),
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Act
      const journeys = await firestoreService.getUserJourneyRecords(userId, { limit: 2 });

      // Assert
      expect(journeys).toHaveLength(2);
    });
  });

  describe('getJourneyRecordById', () => {
    it('should return journey record when found', async () => {
      // Arrange
      const journeyData = {
        title: '測試旅程',
        summary: '測試摘要',
        highlights: ['亮點1'],
        placeName: '測試地點',
        guideName: '測試導覽員',
        conversationCount: 1,
        generatedAt: new Date(),
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const journeyId = await firestoreService.saveJourneyRecord(journeyData);

      // Act
      const foundJourney = await firestoreService.getJourneyRecordById(journeyId);

      // Assert
      expect(foundJourney).toBeTruthy();
      expect(foundJourney!.title).toBe('測試旅程');
      expect(foundJourney!.userId).toBe('user123');
    });

    it('should return null when journey not found', async () => {
      // Act
      const journey = await firestoreService.getJourneyRecordById('non-existent-id');

      // Assert
      expect(journey).toBeNull();
    });
  });

  describe('updateJourneyRecord', () => {
    it('should update journey record successfully', async () => {
      // Arrange
      const originalJourney = {
        title: '原始標題',
        summary: '原始摘要',
        highlights: ['原始亮點'],
        placeName: '原始地點',
        guideName: '原始導覽員',
        conversationCount: 1,
        generatedAt: new Date(),
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const journeyId = await firestoreService.saveJourneyRecord(originalJourney);

      const updates = {
        title: '更新後標題',
        summary: '更新後摘要'
      };

      // Act
      await firestoreService.updateJourneyRecord(journeyId, 'user123', updates);

      // Assert
      const updatedJourney = await firestoreService.getJourneyRecordById(journeyId);
      expect(updatedJourney!.title).toBe('更新後標題');
      expect(updatedJourney!.summary).toBe('更新後摘要');
      expect(updatedJourney!.placeName).toBe('原始地點'); // 未更新的欄位保持原值
    });

    it('should throw error when user tries to update journey they do not own', async () => {
      // Arrange
      const journeyData = {
        title: '測試旅程',
        summary: '測試摘要',
        highlights: ['亮點1'],
        placeName: '測試地點',
        guideName: '測試導覽員',
        conversationCount: 1,
        generatedAt: new Date(),
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const journeyId = await firestoreService.saveJourneyRecord(journeyData);

      // Act & Assert
      await expect(firestoreService.updateJourneyRecord(
        journeyId, 
        'different-user', 
        { title: '試圖更新' }
      )).rejects.toThrow('Unauthorized: Journey does not belong to this user');
    });
  });

  describe('deleteJourneyRecord', () => {
    it('should delete journey record successfully', async () => {
      // Arrange
      const journeyData = {
        title: '待刪除旅程',
        summary: '待刪除摘要',
        highlights: ['亮點1'],
        placeName: '測試地點',
        guideName: '測試導覽員',
        conversationCount: 1,
        generatedAt: new Date(),
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const journeyId = await firestoreService.saveJourneyRecord(journeyData);

      // Act
      await firestoreService.deleteJourneyRecord(journeyId, 'user123');

      // Assert
      const deletedJourney = await firestoreService.getJourneyRecordById(journeyId);
      expect(deletedJourney).toBeNull();
    });

    it('should throw error when user tries to delete journey they do not own', async () => {
      // Arrange
      const journeyData = {
        title: '測試旅程',
        summary: '測試摘要',
        highlights: ['亮點1'],
        placeName: '測試地點',
        guideName: '測試導覽員',
        conversationCount: 1,
        generatedAt: new Date(),
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const journeyId = await firestoreService.saveJourneyRecord(journeyData);

      // Act & Assert
      await expect(firestoreService.deleteJourneyRecord(journeyId, 'different-user'))
        .rejects.toThrow('Unauthorized: Journey does not belong to this user');
    });
  });
});
