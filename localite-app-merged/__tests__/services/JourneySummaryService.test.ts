import { JourneySummaryService } from '../../src/services/JourneySummaryService';
import { GoogleAIService } from '../../src/services/GoogleAIService';
import { FirestoreService } from '../../src/services/FirestoreService';

// Mock dependencies
jest.mock('../../src/services/GoogleAIService');
jest.mock('../../src/services/FirestoreService');

describe('JourneySummaryService', () => {
  let journeySummaryService: JourneySummaryService;
  let mockGoogleAI: jest.Mocked<GoogleAIService>;
  let mockFirestore: jest.Mocked<FirestoreService>;

  beforeEach(() => {
    mockGoogleAI = new GoogleAIService() as jest.Mocked<GoogleAIService>;
    mockFirestore = new FirestoreService() as jest.Mocked<FirestoreService>;
    journeySummaryService = new JourneySummaryService(mockGoogleAI, mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJourneySummary', () => {
    it('should generate journey summary from conversation messages', async () => {
      // Arrange
      const conversationMessages = [
        { id: 1, from: 'ai' as const, text: '歡迎來到大稻埕！我是你的導覽員 Kuron。', guideId: 'kuron' },
        { id: 2, from: 'user' as const, text: '這裡有什麼特色建築嗎？' },
        { id: 3, from: 'ai' as const, text: '大稻埕有許多日治時期的巴洛克式建築...', guideId: 'kuron' }
      ];

      const expectedSummary = {
        title: '大稻埕歷史建築探索之旅',
        summary: '今天您在導覽員 Kuron 的帶領下，探索了大稻埕的歷史建築...',
        highlights: ['巴洛克式建築特色', '日治時期歷史'],
        placeName: '大稻埕',
        guideName: 'Kuron',
        conversationCount: 3,
        generatedAt: expect.any(Date)
      };

      mockGoogleAI.sendMessage.mockResolvedValue({
        content: JSON.stringify({
          title: '大稻埕歷史建築探索之旅',
          summary: '今天您在導覽員 Kuron 的帶領下，探索了大稻埕的歷史建築...',
          highlights: ['巴洛克式建築特色', '日治時期歷史']
        }),
        role: 'assistant',
        timestamp: new Date()
      });

      // Act
      const result = await journeySummaryService.generateJourneySummary(
        conversationMessages, 
        '大稻埕', 
        'Kuron',
        'user123'
      );

      // Assert
      expect(result).toEqual(expectedSummary);
      expect(mockGoogleAI.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('總結這次導覽對話'),
          role: 'user'
        }),
        expect.any(Object)
      );
    });

    it('should throw error when conversation messages are empty', async () => {
      // Arrange
      const emptyMessages: any[] = [];

      // Act & Assert
      await expect(journeySummaryService.generateJourneySummary(
        emptyMessages, 
        '大稻埕', 
        'Kuron',
        'user123'
      )).rejects.toThrow('對話記錄不能為空');
    });

    it('should throw error when AI service fails', async () => {
      // Arrange
      const conversationMessages = [
        { id: 1, from: 'ai' as const, text: '歡迎來到大稻埕！', guideId: 'kuron' }
      ];

      mockGoogleAI.sendMessage.mockRejectedValue(new Error('AI服務暫時不可用'));

      // Act & Assert
      await expect(journeySummaryService.generateJourneySummary(
        conversationMessages, 
        '大稻埕', 
        'Kuron',
        'user123'
      )).rejects.toThrow('生成旅程總結失敗: AI服務暫時不可用');
    });
  });

  describe('saveJourneyRecord', () => {
    it('should save journey record to Firestore', async () => {
      // Arrange
      const journeyRecord = {
        title: '大稻埕歷史建築探索之旅',
        summary: '今天您在導覽員 Kuron 的帶領下...',
        highlights: ['巴洛克式建築特色'],
        placeName: '大稻埕',
        guideName: 'Kuron',
        conversationCount: 3,
        generatedAt: new Date()
      };

      // Mock Firestore save operation
      mockFirestore.saveJourneyRecord = jest.fn().mockResolvedValue('journey123');

      // Act
      const result = await journeySummaryService.saveJourneyRecord(journeyRecord, 'user123');

      // Assert
      expect(result).toBe('journey123');
    });

    it('should throw error when save to Firestore fails', async () => {
      // Arrange
      const journeyRecord = {
        title: '大稻埕歷史建築探索之旅',
        summary: '今天您在導覽員 Kuron 的帶領下...',
        highlights: ['巴洛克式建築特色'],
        placeName: '大稻埕',
        guideName: 'Kuron',
        conversationCount: 3,
        generatedAt: new Date()
      };

      // Mock Firestore save operation failure
      mockFirestore.saveJourneyRecord = jest.fn().mockRejectedValue(new Error('網路連線失敗'));

      // Act & Assert
      await expect(journeySummaryService.saveJourneyRecord(
        journeyRecord, 
        'user123'
      )).rejects.toThrow('儲存旅程記錄失敗: 網路連線失敗');
    });
  });

  describe('generateAndSaveJourney', () => {
    it('should generate summary and save to Firestore, return journey ID', async () => {
      // Arrange
      const conversationMessages = [
        { id: 1, from: 'ai' as const, text: '歡迎來到大稻埕！', guideId: 'kuron' },
        { id: 2, from: 'user' as const, text: '這裡有什麼特色建築嗎？' }
      ];

      const mockSummary = {
        title: '大稻埕歷史建築探索之旅',
        summary: '今天您在導覽員 Kuron 的帶領下...',
        highlights: ['巴洛克式建築特色'],
        placeName: '大稻埕',
        guideName: 'Kuron',
        conversationCount: 2,
        generatedAt: expect.any(Date)
      };

      jest.spyOn(journeySummaryService, 'generateJourneySummary').mockResolvedValue(mockSummary);
      jest.spyOn(journeySummaryService, 'saveJourneyRecord').mockResolvedValue('journey123');

      // Act
      const result = await journeySummaryService.generateAndSaveJourney(
        conversationMessages,
        '大稻埕',
        'Kuron',
        'user123'
      );

      // Assert
      expect(result).toEqual({
        journeyId: 'journey123',
        summary: mockSummary
      });
    });
  });
});
