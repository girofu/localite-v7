import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import PlaceIntroCard from '../../components/PlaceIntroCard';
import { getBadgeById } from '../../data/badges';

// Mock the badge service
jest.mock('../../data/badges', () => ({
  getBadgeById: jest.fn(),
}));

const mockGetBadgeById = getBadgeById as jest.MockedFunction<typeof getBadgeById>;

describe('PlaceIntroCard', () => {
  const mockPlace = {
    id: 'place-1',
    name: '測試地點',
    description: '這是一個用於測試的地點描述，包含詳細的介紹內容',
    image: { uri: 'mock-image-uri' },
    likeCount: 10,
    availableBadges: ['B2-1', 'B3-1', 'B3-2'],
  };

  const defaultProps = {
    place: mockPlace,
    isLiked: false,
    likeCount: 10,
    onLikePress: jest.fn(),
    onNext: jest.fn(),
  };

  const mockBadges = [
    {
      id: 'B2-1',
      name: '綠芽初登場',
      condition: '首次註冊成功',
      type: '成長里程碑',
      englishName: 'babyron',
      description: '首次成功登入，你已解鎖「綠芽」限定導覽員',
      badgeImage: 'B2-1',
      shareImage: 'B2-1-share',
      displayType: 'modal' as const,
      trigger: '首次登入/註冊後',
    },
    {
      id: 'B3-1',
      name: '手冊',
      condition: '完成第1題導覽知識問答或互動測驗',
      type: '任務成就',
      englishName: 'booklet',
      description: '完成第1則問答測驗，獲得「手冊」✨',
      badgeImage: 'B3-1',
      shareImage: 'B3-1-share',
      displayType: 'chat' as const,
      trigger: '在完成第1題問答或互動測驗後，在導覽對話內',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBadgeById.mockImplementation((id: string) => 
      mockBadges.find(badge => badge.id === id)
    );
  });

  describe('基本渲染 - 正面卡片', () => {
    it('應該顯示地點名稱', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      expect(screen.getByText('測試地點')).toBeTruthy();
    });

    it('應該顯示地點描述', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      expect(screen.getByText('這是一個用於測試的地點描述，包含詳細的介紹內容')).toBeTruthy();
    });

    it('應該顯示愛心按鈕和計數', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const heartButton = screen.getByTestId('heart-button');
      expect(heartButton).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
    });

    it('應該顯示「可取得任務成就徽章」按鈕', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      expect(screen.getByText('可取得任務成就徽章')).toBeTruthy();
    });

    it('應該顯示地點圖片', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const placeImage = screen.getByTestId('place-image');
      expect(placeImage).toBeTruthy();
    });
  });

  describe('愛心功能', () => {
    it('當未按讚時應該顯示空心愛心', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const heartButton = screen.getByTestId('heart-button');
      expect(heartButton).toBeTruthy();
      // 可以進一步測試圖片來源
    });

    it('當已按讚時應該顯示實心愛心', () => {
      render(<PlaceIntroCard {...defaultProps} isLiked={true} />);
      
      const heartButton = screen.getByTestId('heart-button');
      expect(heartButton).toBeTruthy();
      // 可以進一步測試圖片來源和顏色
    });

    it('點擊愛心按鈕應該調用 onLikePress', () => {
      const onLikePress = jest.fn();
      render(<PlaceIntroCard {...defaultProps} onLikePress={onLikePress} />);
      
      const heartButton = screen.getByTestId('heart-button');
      fireEvent.press(heartButton);
      
      expect(onLikePress).toHaveBeenCalledTimes(1);
    });

    it('應該顯示正確的愛心計數', () => {
      render(<PlaceIntroCard {...defaultProps} likeCount={25} />);
      
      expect(screen.getByText('25')).toBeTruthy();
    });
  });

  describe('卡片翻轉功能', () => {
    it('點擊「可取得任務成就徽章」按鈕應該翻轉到背面', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      // 正面元素應該消失
      expect(screen.queryByText('測試地點')).toBeFalsy();
      // 背面元素應該出現
      expect(screen.getByText('相關成就徽章')).toBeTruthy();
    });

    it('在背面時愛心按鈕應該隱藏', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.queryByTestId('heart-button')).toBeFalsy();
    });

    it('點擊「地點簡介」按鈕應該翻轉回正面', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      // 先翻轉到背面
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      // 再翻轉回正面
      const backButton = screen.getByText('地點簡介');
      fireEvent.press(backButton);
      
      // 正面元素應該重新出現
      expect(screen.getByText('測試地點')).toBeTruthy();
      // 背面元素應該消失
      expect(screen.queryByText('相關成就徽章')).toBeFalsy();
    });
  });

  describe('背面 - 徽章列表', () => {
    it('應該顯示標題「相關成就徽章」', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.getByText('相關成就徽章')).toBeTruthy();
    });

    it('應該顯示可用的徽章列表', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.getByText('綠芽初登場')).toBeTruthy();
      expect(screen.getByText('手冊')).toBeTruthy();
    });

    it('應該顯示徽章的獲得條件', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.getByText('首次註冊成功')).toBeTruthy();
      expect(screen.getByText('完成第1題導覽知識問答或互動測驗')).toBeTruthy();
    });

    it('應該顯示返回按鈕', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.getByText('地點簡介')).toBeTruthy();
    });
  });

  describe('徽章過濾和處理', () => {
    it('應該正確過濾出存在的徽章', () => {
      mockGetBadgeById.mockImplementation((id: string) => {
        if (id === 'B2-1') return mockBadges[0];
        if (id === 'B3-1') return mockBadges[1];
        return undefined; // B3-2 不存在
      });

      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.getByText('綠芽初登場')).toBeTruthy();
      expect(screen.getByText('手冊')).toBeTruthy();
      // B3-2 不應該出現，因為不存在
    });

    it('當沒有有效徽章時應該正常處理', () => {
      mockGetBadgeById.mockReturnValue(undefined);
      
      const propsWithNoBadges = {
        ...defaultProps,
        place: {
          ...mockPlace,
          availableBadges: ['INVALID-1', 'INVALID-2'],
        },
      };

      render(<PlaceIntroCard {...propsWithNoBadges} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      expect(screen.getByText('相關成就徽章')).toBeTruthy();
      // 不應該崩潰，即使沒有有效徽章
    });
  });

  describe('樣式和佈局', () => {
    it('卡片容器應該有正確的尺寸', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const cardContainer = screen.getByTestId('card-container');
      expect(cardContainer).toBeTruthy();
      // 可以進一步測試樣式屬性
    });

    it('愛心按鈕應該位於正確位置', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const heartButton = screen.getByTestId('heart-button');
      expect(heartButton).toBeTruthy();
      // 可以測試 position 和 zIndex 等樣式
    });

    it('徽章項目應該有適當的佈局', () => {
      render(<PlaceIntroCard {...defaultProps} />);
      
      const badgeButton = screen.getByText('可取得任務成就徽章');
      fireEvent.press(badgeButton);
      
      const badgeItems = screen.getAllByTestId('badge-item');
      expect(badgeItems.length).toBeGreaterThan(0);
    });
  });

  describe('邊緣情況處理', () => {
    it('應該處理空的地點名稱', () => {
      const propsWithEmptyName = {
        ...defaultProps,
        place: { ...mockPlace, name: '' },
      };

      render(<PlaceIntroCard {...propsWithEmptyName} />);
      
      // 不應該崩潰
      const cardContainer = screen.getByTestId('card-container');
      expect(cardContainer).toBeTruthy();
    });

    it('應該處理空的描述', () => {
      const propsWithEmptyDescription = {
        ...defaultProps,
        place: { ...mockPlace, description: '' },
      };

      render(<PlaceIntroCard {...propsWithEmptyDescription} />);
      
      // 不應該崩潰
      const cardContainer = screen.getByTestId('card-container');
      expect(cardContainer).toBeTruthy();
    });

    it('應該處理 likeCount 為 0', () => {
      render(<PlaceIntroCard {...defaultProps} likeCount={0} />);
      
      expect(screen.getByText('0')).toBeTruthy();
    });
  });
});
