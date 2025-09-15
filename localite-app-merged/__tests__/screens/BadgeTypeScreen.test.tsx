import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import BadgeTypeScreen from '../../screens/BadgeTypeScreen';
import { Badge } from '../../src/types/badge.types';

// Mock dependencies
jest.mock('../../src/services/BadgeService');
jest.mock('../../src/config/firebase', () => ({
  firestore: {},
  storage: {},
}));

describe('BadgeTypeScreen', () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();
  const badgeType = '成長里程碑';
  
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
    badgeType,
    isLoggedIn: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('當用戶已登入時', () => {
    it('應該顯示徽章類型標題', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      expect(screen.getByText('成長里程碑')).toBeTruthy();
    });

    it('應該顯示用戶已獲得的徽章', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      // 應該顯示已解鎖的徽章
      expect(screen.getByText('綠芽初登場')).toBeTruthy();
    });

    it('應該顯示鎖定狀態的未獲得徽章', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      // 應該有鎖定圖示表示未獲得的徽章
      const lockIcons = screen.getAllByTestId('lock-icon');
      expect(lockIcons.length).toBeGreaterThan(0); // 確保有鎖定圖示
    });

    it('點擊已獲得徽章時應該導航到徽章詳情', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      const badgeItem = screen.getByText('綠芽初登場');
      fireEvent.press(badgeItem);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('badgeDetail', undefined, expect.any(Object));
    });

    it('點擊未獲得徽章時不應該有任何反應', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      const lockIcon = screen.getAllByTestId('lock-icon')[0];
      fireEvent.press(lockIcon);
      
      expect(mockOnNavigate).not.toHaveBeenCalled();
    });
  });

  describe('當用戶未登入時', () => {
    const unloggedProps = {
      ...defaultProps,
      isLoggedIn: false,
    };

    it('應該顯示登入提示訊息', () => {
      render(<BadgeTypeScreen {...unloggedProps} />);
      
      expect(screen.getByText('登入 Localite 帳號查看你的徽章')).toBeTruthy();
    });

    it('應該顯示登入按鈕', () => {
      render(<BadgeTypeScreen {...unloggedProps} />);
      
      const loginButton = screen.getByText('登入');
      expect(loginButton).toBeTruthy();
    });

    it('點擊登入按鈕應該導航到登入頁面', () => {
      render(<BadgeTypeScreen {...unloggedProps} />);
      
      const loginButton = screen.getByText('登入');
      fireEvent.press(loginButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('login');
    });

    it('應該顯示探索更多地點按鈕', () => {
      render(<BadgeTypeScreen {...unloggedProps} />);
      
      const exploreButton = screen.getByText('探索更多地點');
      expect(exploreButton).toBeTruthy();
    });

    it('點擊探索按鈕應該導航到導覽頁面', () => {
      render(<BadgeTypeScreen {...unloggedProps} />);
      
      const exploreButton = screen.getByText('探索更多地點');
      fireEvent.press(exploreButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('guide');
    });
  });

  describe('互動功能', () => {
    it('點擊關閉按鈕應該觸發 onClose', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      fireEvent.press(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('點擊選單按鈕應該打開抽屜導航', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      const menuButton = screen.getByTestId('menu-button');
      fireEvent.press(menuButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('drawerNavigation');
    });
  });

  describe('徽章網格佈局', () => {
    it('應該以2列網格顯示徽章', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      const badgeGrid = screen.getByTestId('badge-grid');
      expect(badgeGrid).toBeTruthy();
      
      // 檢查是否有適當的網格佈局樣式
      expect(badgeGrid).toHaveStyle({
        flexDirection: 'row',
        flexWrap: 'wrap',
      });
    });

    it('空的徽章插槽應該顯示鎖定圖示', () => {
      render(<BadgeTypeScreen {...defaultProps} />);
      
      // 檢查是否有空的徽章插槽
      const lockIcons = screen.getAllByTestId('lock-icon');
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });
});
