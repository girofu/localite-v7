// Mock for @react-navigation/bottom-tabs
import React from 'react';

const createBottomTabNavigator = () => {
  const Tab = {
    Navigator: ({ children, ...props }: any) =>
      React.createElement('div', {
        'data-testid': 'tab-navigator',
        ...props
      }, children),
    Screen: ({ name, component, ...props }: any) => {
      let Component = component;
      if (Component && Component.default) {
        Component = Component.default;
      }
      if (typeof Component === 'function') {
        return React.createElement('div', {
          'data-testid': `tab-screen-${name}`,
          ...props
        }, React.createElement(Component));
      } else {
        return React.createElement('div', {
          'data-testid': `tab-screen-${name}`,
          ...props
        }, 'Mock Tab Screen');
      }
    },
    Group: ({ children, ...props }: any) =>
      React.createElement('div', {
        'data-testid': 'tab-group',
        ...props
      }, children),
  };

  return Tab;
};

export { createBottomTabNavigator };
