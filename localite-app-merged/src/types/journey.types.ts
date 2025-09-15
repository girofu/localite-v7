/**
 * 旅程記錄相關的類型定義
 */

export interface JourneyRecord {
  title: string;
  summary: string;
  highlights: string[];
  placeName: string;
  guideName: string;
  conversationCount: number;
  generatedAt: Date;
}

export interface SavedJourneyRecord extends JourneyRecord {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: number;
  from: 'ai' | 'user';
  text?: string;
  guideId?: string;
  timestamp?: Date;
}

export interface JourneySummaryResult {
  journeyId: string;
  summary: JourneyRecord;
}

export interface JourneySummaryOptions {
  language?: string;
  style?: 'brief' | 'detailed' | 'highlight';
  includeConversationCount?: boolean;
}
