// Mock for @react-navigation/native
import React from 'react';

export const NavigationContainer = ({ children }: any) => React.createElement('div', { 'data-testid': 'navigation-container' }, children);

export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
});

export const useRoute = () => ({
  params: {},
  name: 'MockScreen',
});

export const useFocusEffect = jest.fn((callback: () => void) => {
  React.useEffect(callback, []);
});

// Re-export common types
export type { NavigationProp, RouteProp } from '@react-navigation/native';
