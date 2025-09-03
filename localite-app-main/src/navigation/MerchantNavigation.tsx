/**
 * 商戶導航組件 - 管理商戶相關頁面的導航
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MerchantStackParamList } from '../types/navigation.types';

// 商戶畫面
import MerchantRegisterScreen from '../screens/merchant/MerchantRegisterScreen';
import MerchantDashboardScreen from '../screens/merchant/MerchantDashboardScreen';
import AddPlaceScreen from '../screens/merchant/AddPlaceScreen';

const MerchantStack = createStackNavigator<MerchantStackParamList>();

export const MerchantNavigation = () => {
  return (
    <MerchantStack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <MerchantStack.Screen 
        name="MerchantRegister" 
        component={MerchantRegisterScreen}
        options={{
          title: '商戶註冊',
          headerBackTitle: '返回',
        }}
      />
      
      <MerchantStack.Screen 
        name="MerchantDashboard" 
        component={MerchantDashboardScreen}
        options={{
          title: '商戶控制台',
          headerLeft: () => null, // 隱藏返回按鈕
        }}
      />
      
      <MerchantStack.Screen 
        name="AddPlace" 
        component={AddPlaceScreen}
        options={{
          title: '新增地點',
          headerBackTitle: '返回',
        }}
      />
      
      {/* 未來可以添加更多商戶相關的畫面 */}
      {/* 
      <MerchantStack.Screen 
        name="EditPlace" 
        component={EditPlaceScreen}
        options={{
          title: '編輯地點',
          headerBackTitle: '返回',
        }}
      />
      
      <MerchantStack.Screen 
        name="PlaceDetails" 
        component={PlaceDetailsScreen}
        options={{
          title: '地點詳情',
          headerBackTitle: '返回',
        }}
      />
      */}
    </MerchantStack.Navigator>
  );
};
