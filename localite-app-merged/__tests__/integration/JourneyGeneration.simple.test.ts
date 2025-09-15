import { JourneySummaryService } from '../../src/services/JourneySummaryService';
import { GoogleAIService } from '../../src/services/GoogleAIService';
import { FirestoreService } from '../../src/services/FirestoreService';

// Mock dependencies
jest.mock('../../src/services/GoogleAIService');
jest.mock('../../src/services/FirestoreService');

describe('Journey Generation Service Integration', () => {
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

  it('should successfully integrate AI generation and Firestore saving', async () => {
    // Arrange
    const conversationMessages = [
      { id: 1, from: 'ai' as const, text: '歡迎來到大稻埕！我是你的導覽員 Kuron。', guideId: 'kuron' },
      { id: 2, from: 'user' as const, text: '這裡有什麼特色建築嗎？' },
      { id: 3, from: 'ai' as const, text: '大稻埕有許多日治時期的巴洛克式建築...', guideId: 'kuron' }
    ];

    const mockAISummaryResponse = JSON.stringify({
      title: '大稻埕歷史建築探索之旅',
      summary: '今天您在導覽員 Kuron 的帶領下，探索了大稻埕的歷史建築...',
      highlights: ['巴洛克式建築特色', '日治時期歷史']
    });

    mockGoogleAI.sendMessage.mockResolvedValue({
      content: mockAISummaryResponse,
      role: 'assistant',
      timestamp: new Date()
    });

    mockFirestore.saveJourneyRecord.mockResolvedValue('journey123');

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
      summary: expect.objectContaining({
        title: '大稻埕歷史建築探索之旅',
        placeName: '大稻埕',
        guideName: 'Kuron',
        conversationCount: 3
      })
    });

    expect(mockGoogleAI.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('總結這次導覽對話'),
        role: 'user'
      }),
      expect.any(Object)
    );

    expect(mockFirestore.saveJourneyRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user123',
        title: '大稻埕歷史建築探索之旅',
        placeName: '大稻埕',
        guideName: 'Kuron'
      })
    );
  });

  it('should handle AI service failure gracefully', async () => {
    // Arrange
    const conversationMessages = [
      { id: 1, from: 'ai' as const, text: '歡迎！', guideId: 'kuron' }
    ];

    mockGoogleAI.sendMessage.mockRejectedValue(new Error('AI service unavailable'));

    // Act & Assert
    await expect(journeySummaryService.generateAndSaveJourney(
      conversationMessages,
      '大稻埕',
      'Kuron',
      'user123'
    )).rejects.toThrow('生成旅程總結失敗: AI service unavailable');
  });

  it('should handle Firestore saving failure gracefully', async () => {
    // Arrange
    const conversationMessages = [
      { id: 1, from: 'ai' as const, text: '歡迎！', guideId: 'kuron' }
    ];

    mockGoogleAI.sendMessage.mockResolvedValue({
      content: '{"title": "測試旅程", "summary": "測試摘要", "highlights": []}',
      role: 'assistant',
      timestamp: new Date()
    });

    mockFirestore.saveJourneyRecord.mockRejectedValue(new Error('Database connection failed'));

    // Act & Assert
    await expect(journeySummaryService.generateAndSaveJourney(
      conversationMessages,
      '大稻埕',
      'Kuron',
      'user123'
    )).rejects.toThrow('儲存旅程記錄失敗: Database connection failed');
  });
});
