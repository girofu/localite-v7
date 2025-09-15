import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import BadgeDetailScreen from '../../screens/BadgeDetailScreen';
import { Badge } from '../../src/types/badge.types';

// 簡化的 mock，只關注核心功能
jest.mock('react-native-view-shot', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    return React.createElement('View', props, props.children);
  });
});

jest.mock('../../src/config/firebase', () => ({
  firestore: {},
  storage: {},
}));

describe('BadgeDetailScreen - Core Functionality', () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();
  
  const mockBadge: Badge = {
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
  };

  const defaultProps = {
    onClose: mockOnClose,
    onNavigate: mockOnNavigate,
    badge: mockBadge,
    isLoggedIn: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本渲染 - 已登入用戶', () => {
    it('應該顯示徽章圖片', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const badgeImage = screen.getByTestId('badge-image');
      expect(badgeImage).toBeTruthy();
    });

    it('應該顯示徽章名稱', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      // 使用 getAllByText 來處理重複文字
      const badgeNames = screen.getAllByText('綠芽初登場');
      expect(badgeNames.length).toBeGreaterThan(0);
    });

    it('應該顯示徽章描述', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      // 使用 getAllByText 來處理重複文字
      const descriptions = screen.getAllByText(mockBadge.description);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('應該顯示分享徽章按鈕', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      expect(shareButton).toBeTruthy();
    });

    it('應該顯示更多選項按鈕', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const moreButton = screen.getByTestId('more-options-button');
      expect(moreButton).toBeTruthy();
    });

    it('應該顯示關閉按鈕', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('未登入用戶狀態', () => {
    const unloggedProps = {
      ...defaultProps,
      isLoggedIn: false,
    };

    it('應該顯示登入提示訊息', () => {
      render(<BadgeDetailScreen {...unloggedProps} />);
      
      expect(screen.getByText('登入 Localite 帳號查看徽章詳情')).toBeTruthy();
    });

    it('應該顯示登入按鈕', () => {
      render(<BadgeDetailScreen {...unloggedProps} />);
      
      const loginButton = screen.getByText('登入');
      expect(loginButton).toBeTruthy();
    });

    it('點擊登入按鈕應該導航到登入頁面', () => {
      render(<BadgeDetailScreen {...unloggedProps} />);
      
      const loginButton = screen.getByText('登入');
      fireEvent.press(loginButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('login');
    });

    it('應該顯示探索更多地點按鈕', () => {
      render(<BadgeDetailScreen {...unloggedProps} />);
      
      const exploreButton = screen.getByText('探索更多地點');
      expect(exploreButton).toBeTruthy();
    });
  });

  describe('基本互動', () => {
    it('點擊關閉按鈕應該觸發 onClose', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      fireEvent.press(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('點擊分享按鈕應該打開分享模態', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      // 檢查分享模態是否顯示
      expect(screen.getByTestId('share-modal')).toBeTruthy();
    });

    it('點擊更多選項按鈕應該顯示選項選單', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const moreButton = screen.getByTestId('more-options-button');
      fireEvent.press(moreButton);
      
      expect(screen.getByTestId('more-options-menu')).toBeTruthy();
    });
  });

  describe('分享卡片內容', () => {
    it('分享卡片應該包含徽章內容', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      // 檢查分享卡片是否存在
      expect(screen.getByTestId('share-card')).toBeTruthy();
      
      // 檢查 Logo
      expect(screen.getByTestId('share-card-logo')).toBeTruthy();
    });
  });
});
