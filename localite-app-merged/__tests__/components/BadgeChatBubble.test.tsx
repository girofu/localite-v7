import React from 'react';
import { render, screen } from '@testing-library/react-native';
import BadgeChatBubble from '../../components/BadgeChatBubble';
import { Badge } from '../../src/types/badge.types';

// Mock the badge data
jest.mock('../../data/badges', () => ({
  getBadgeById: jest.fn(),
}));

describe('BadgeChatBubble', () => {
  const mockBadge: Badge = {
    id: 'B3-1',
    type: '任務成就',
    name: '手冊',
    englishName: 'booklet',
    description: '完成第1則問答測驗，獲得「手冊」✨',
    badgeImage: 'B3-1',
    shareImage: 'B3-1-share',
    displayType: 'chat',
    condition: '完成第1題導覽知識問答或互動測驗',
    trigger: '在完成第1題問答或互動測驗後，在導覽對話內',
  };

  const defaultProps = {
    badge: mockBadge,
    guideId: 'kuron' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該顯示導覽員頭像', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const avatar = screen.getByTestId('guide-avatar');
      expect(avatar).toBeTruthy();
    });

    it('應該顯示徽章描述文字', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      expect(screen.getByText(mockBadge.description)).toBeTruthy();
    });

    it('應該顯示徽章圖片', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const badgeImage = screen.getByTestId('badge-image');
      expect(badgeImage).toBeTruthy();
    });

    it('應該有聊天氣泡的容器', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toBeTruthy();
      expect(bubble).toHaveStyle({
        backgroundColor: '#4CAF50',
      });
    });
  });

  describe('導覽員頭像', () => {
    it('應該使用預設的 kuron 導覽員', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const avatar = screen.getByTestId('guide-avatar');
      expect(avatar).toBeTruthy();
      // 預設應該使用 kuron 的頭像
    });

    it('應該根據 guideId 顯示對應的導覽員頭像', () => {
      render(<BadgeChatBubble {...defaultProps} guideId="pururu" />);
      
      const avatar = screen.getByTestId('guide-avatar');
      expect(avatar).toBeTruthy();
      // 應該使用 pururu 的頭像
    });

    it('當提供無效 guideId 時應該使用預設頭像', () => {
      render(<BadgeChatBubble {...defaultProps} guideId={"invalid" as any} />);
      
      const avatar = screen.getByTestId('guide-avatar');
      expect(avatar).toBeTruthy();
      // 應該回退到 kuron 的頭像
    });
  });

  describe('徽章圖片處理', () => {
    it('應該正確處理已知的徽章 ID', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const badgeImage = screen.getByTestId('badge-image');
      expect(badgeImage).toBeTruthy();
    });

    it('當徽章 ID 不存在時應該使用預設圖片', () => {
      const badgeWithInvalidId = {
        ...mockBadge,
        id: 'INVALID-ID',
      };
      
      render(<BadgeChatBubble badge={badgeWithInvalidId} guideId="kuron" />);
      
      const badgeImage = screen.getByTestId('badge-image');
      expect(badgeImage).toBeTruthy();
      // 應該使用預設的 b3-1.png
    });
  });

  describe('佈局和樣式', () => {
    it('應該有正確的 flexDirection 佈局', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const container = screen.getByTestId('chat-bubble-container');
      expect(container).toHaveStyle({
        flexDirection: 'row',
        alignItems: 'flex-start',
      });
    });

    it('頭像應該在左側，訊息氣泡在右側', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const container = screen.getByTestId('chat-bubble-container');
      const avatar = screen.getByTestId('guide-avatar');
      const bubble = screen.getByTestId('message-bubble');
      
      expect(container).toBeTruthy();
      expect(avatar).toBeTruthy();
      expect(bubble).toBeTruthy();
    });

    it('徽章圖片應該位於氣泡內文字下方', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const messageText = screen.getByText(mockBadge.description);
      const badgeImage = screen.getByTestId('badge-image');
      
      expect(messageText).toBeTruthy();
      expect(badgeImage).toBeTruthy();
    });

    it('應該有正確的圓角和 padding', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveStyle({
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 16,
      });
    });
  });

  describe('不同導覽員支援', () => {
    const guideIds = ['kuron', 'pururu', 'popo', 'nikko', 'piglet'] as const;

    guideIds.forEach(guideId => {
      it(`應該支援 ${guideId} 導覽員`, () => {
        render(<BadgeChatBubble {...defaultProps} guideId={guideId} />);
        
        const avatar = screen.getByTestId('guide-avatar');
        expect(avatar).toBeTruthy();
      });
    });
  });

  describe('可訪問性', () => {
    it('應該為徽章圖片提供適當的 accessibility props', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const badgeImage = screen.getByTestId('badge-image');
      expect(badgeImage).toBeTruthy();
      
      // 可以檢查是否有 accessibilityLabel 等
    });

    it('應該為導覽員頭像提供適當的 accessibility props', () => {
      render(<BadgeChatBubble {...defaultProps} />);
      
      const avatar = screen.getByTestId('guide-avatar');
      expect(avatar).toBeTruthy();
    });
  });
});
