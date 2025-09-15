import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import BadgeDetailScreen from '../../screens/BadgeDetailScreen';
import { Badge } from '../../src/types/badge.types';

// Mock dependencies
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Share: {
      share: jest.fn(),
      sharedAction: 'sharedAction',
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

jest.mock('react-native-view-shot', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    // 模擬 ViewShot 組件
    React.useImperativeHandle(ref, () => ({
      capture: jest.fn(() => Promise.resolve('mock-image-uri')),
    }));
    return React.createElement('View', props, props.children);
  });
});

jest.mock('../../src/config/firebase', () => ({
  firestore: {},
  storage: {},
}));

describe('BadgeDetailScreen', () => {
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

  const { Share, Alert } = require('react-native');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('當用戶已登入時', () => {
    it('應該顯示徽章圖片', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const badgeImage = screen.getByTestId('badge-image');
      expect(badgeImage).toBeTruthy();
    });

    it('應該顯示徽章名稱', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      expect(screen.getByText('綠芽初登場')).toBeTruthy();
    });

    it('應該顯示徽章描述', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      expect(screen.getByText(mockBadge.description)).toBeTruthy();
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

  describe('當用戶未登入時', () => {
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

  describe('分享功能', () => {
    it('點擊分享按鈕應該打開分享模態', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      // 檢查分享模態是否顯示
      expect(screen.getByTestId('share-modal')).toBeTruthy();
    });

    it('在分享模態中點擊分享應該調用 Share API', async () => {
      Share.share.mockResolvedValue({ action: Share.sharedAction });

      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      const modalShareButton = screen.getByText('分享');
      fireEvent.press(modalShareButton);
      
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          url: 'mock-image-uri',
          message: `我獲得了「${mockBadge.name}」徽章！`,
          title: '徽章分享'
        });
      });
    });

    it('點擊分享模態的取消按鈕應該關閉模態', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      const cancelButton = screen.getByText('取消');
      fireEvent.press(cancelButton);
      
      // 檢查模態是否關閉
      expect(screen.queryByTestId('share-modal')).toBeFalsy();
    });

    it('分享失敗時應該顯示錯誤提示', async () => {
      Share.share.mockRejectedValue(new Error('Share failed'));

      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      const modalShareButton = screen.getByText('分享');
      fireEvent.press(modalShareButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('分享失敗', '無法分享徽章，請稍後再試');
      });
    });
  });

  describe('更多選項功能', () => {
    it('點擊更多選項按鈕應該顯示選項選單', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const moreButton = screen.getByTestId('more-options-button');
      fireEvent.press(moreButton);
      
      expect(screen.getByTestId('more-options-menu')).toBeTruthy();
    });

    it('應該顯示列印徽章選項', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const moreButton = screen.getByTestId('more-options-button');
      fireEvent.press(moreButton);
      
      expect(screen.getByText('列印徽章')).toBeTruthy();
    });

    it('點擊列印徽章應該顯示開發中提示', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const moreButton = screen.getByTestId('more-options-button');
      fireEvent.press(moreButton);
      
      const printButton = screen.getByText('列印徽章');
      fireEvent.press(printButton);
      
      expect(Alert.alert).toHaveBeenCalledWith('列印功能', '列印徽章功能開發中');
    });
  });

  describe('互動功能', () => {
    it('點擊關閉按鈕應該觸發 onClose', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      fireEvent.press(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('點擊模態背景應該關閉更多選項選單', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const moreButton = screen.getByTestId('more-options-button');
      fireEvent.press(moreButton);
      
      const modalOverlay = screen.getByTestId('more-options-overlay');
      fireEvent.press(modalOverlay);
      
      expect(screen.queryByTestId('more-options-menu')).toBeFalsy();
    });
  });

  describe('分享卡片生成', () => {
    it('應該包含徽章名稱和描述在分享卡片中', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      // 檢查分享卡片內容
      expect(screen.getByTestId('share-card')).toBeTruthy();
      expect(screen.getByText(mockBadge.name)).toBeTruthy();
      expect(screen.getByText(mockBadge.description)).toBeTruthy();
    });

    it('應該包含 Localite Logo 在分享卡片中', () => {
      render(<BadgeDetailScreen {...defaultProps} />);
      
      const shareButton = screen.getByText('分享徽章');
      fireEvent.press(shareButton);
      
      const logo = screen.getByTestId('share-card-logo');
      expect(logo).toBeTruthy();
    });
  });
});
