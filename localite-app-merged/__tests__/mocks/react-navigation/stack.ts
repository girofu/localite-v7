// Mock for @react-navigation/stack
import React from 'react';

const createStackNavigator = () => {
  const Stack = {
    Navigator: ({ children, ...props }: any) =>
      React.createElement('div', {
        'data-testid': 'stack-navigator',
        ...props
      }, children),
    Screen: ({ name, component, ...props }: any) => {
      let Component = component;
      if (Component && Component.default) {
        Component = Component.default;
      }
      if (typeof Component === 'function') {
        return React.createElement('div', {
          'data-testid': `stack-screen-${name}`,
          ...props
        }, React.createElement(Component));
      } else {
        return React.createElement('div', {
          'data-testid': `stack-screen-${name}`,
          ...props
        }, 'Mock Screen');
      }
    },
    Group: ({ children, ...props }: any) =>
      React.createElement('div', {
        'data-testid': 'stack-group',
        ...props
      }, children),
  };

  return Stack;
};

export { createStackNavigator };
