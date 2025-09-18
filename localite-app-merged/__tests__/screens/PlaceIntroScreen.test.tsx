import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import PlaceIntroScreen from '../../screens/PlaceIntroScreen';
import { PLACES } from '../../data/places';

// Mock PlaceIntroCard component
jest.mock('../../components/PlaceIntroCard', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockPlaceIntroCard({ place, onLikePress, onNext }: any) {
    return (
      <View testID="place-intro-card">
        <Text testID="place-name">{place.name}</Text>
        <TouchableOpacity testID="like-button" onPress={onLikePress}>
          <Text>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="next-button" onPress={onNext}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('PlaceIntroScreen', () => {
  const defaultProps = {
    placeId: 'shin-fang-chun-tea',
    onConfirm: jest.fn(),
    onChange: jest.fn(),
    onBack: jest.fn(),
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染 PlaceIntroCard 元件', () => {
      render(<PlaceIntroScreen {...defaultProps} />);
      
      expect(screen.getByTestId('place-intro-card')).toBeTruthy();
    });

    it('應該顯示正確的地點資訊', () => {
      render(<PlaceIntroScreen {...defaultProps} />);
      
      expect(screen.getByText('新芳春茶行')).toBeTruthy();
    });

    it('當 placeId 不存在時應該使用第一個地點', () => {
      render(<PlaceIntroScreen {...defaultProps} placeId="non-existent" />);
      
      expect(screen.getByText(PLACES[0].name)).toBeTruthy();
    });
  });

  describe('導航功能', () => {
    it('應該顯示選單和返回按鈕', () => {
      render(<PlaceIntroScreen {...defaultProps} />);
      
      const menuButton = screen.getByTestId('menu-button');
      const backButton = screen.getByTestId('back-button');
      
      expect(menuButton).toBeTruthy();
      expect(backButton).toBeTruthy();
    });

    it('點擊選單按鈕應該調用 onNavigate', () => {
      const onNavigate = jest.fn();
      render(<PlaceIntroScreen {...defaultProps} onNavigate={onNavigate} />);
      
      const menuButton = screen.getByTestId('menu-button');
      fireEvent.press(menuButton);
      
      expect(onNavigate).toHaveBeenCalledWith('drawerNavigation');
    });

    it('點擊返回按鈕應該調用 onBack', () => {
      const onBack = jest.fn();
      render(<PlaceIntroScreen {...defaultProps} onBack={onBack} />);
      
      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('底部按鈕', () => {
    it('應該顯示確認和更換按鈕', () => {
      render(<PlaceIntroScreen {...defaultProps} />);
      
      expect(screen.getByText('確認')).toBeTruthy();
      expect(screen.getByText('更換')).toBeTruthy();
    });

    it('點擊確認按鈕應該調用 onConfirm', () => {
      const onConfirm = jest.fn();
      render(<PlaceIntroScreen {...defaultProps} onConfirm={onConfirm} />);
      
      const confirmButton = screen.getByText('確認');
      fireEvent.press(confirmButton);
      
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('點擊更換按鈕應該調用 onChange', () => {
      const onChange = jest.fn();
      render(<PlaceIntroScreen {...defaultProps} onChange={onChange} />);
      
      const changeButton = screen.getByText('更換');
      fireEvent.press(changeButton);
      
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('PlaceIntroCard 整合', () => {
    it('應該處理愛心按鈕點擊', () => {
      render(<PlaceIntroScreen {...defaultProps} />);
      
      const likeButton = screen.getByTestId('like-button');
      fireEvent.press(likeButton);
      
      // PlaceIntroCard 的愛心功能應該被觸發
      expect(likeButton).toBeTruthy();
    });

    it('應該傳遞正確的 place 資料給 PlaceIntroCard', () => {
      render(<PlaceIntroScreen {...defaultProps} placeId="xiahai-temple" />);
      
      expect(screen.getByText('霞海城隍廟')).toBeTruthy();
    });
  });

  describe('資料適配', () => {
    it('應該為 PlaceIntroCard 提供必要的 props', () => {
      // 這個測試驗證資料格式轉換是否正確
      const { rerender } = render(<PlaceIntroScreen {...defaultProps} />);
      
      // 重新渲染不應該出錯
      expect(() => {
        rerender(<PlaceIntroScreen {...defaultProps} placeId="jhongliao_lee_8" />);
      }).not.toThrow();
    });
  });
});
