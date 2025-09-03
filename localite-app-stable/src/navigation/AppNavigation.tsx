/**
 * 主要應用導航 - 整合認證和主要導航流程
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types/navigation.types';
import { FirestoreService } from '../services/FirestoreService';
import { Merchant } from '../types/firestore.types';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../../screens/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Merchant Navigation
import { MerchantNavigation } from './MerchantNavigation';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const firestoreService = new FirestoreService();

// 認證相關導航
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      id={undefined}
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// 主要應用導航（Tab 導航）
const MainNavigator = () => {
  return (
    <MainTab.Navigator 
      id={undefined}
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
        },
        tabBarActiveTintColor: '#4299E1',
        tabBarInactiveTintColor: '#718096',
      }}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: '首頁',
        }}
      />
      <MainTab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarLabel: '探索',
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: '個人',
        }}
      />
    </MainTab.Navigator>
  );
};

// 根據認證狀態顯示不同的導航
const RootNavigator = () => {
  const { user, loading } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  // 檢查用戶是否為商戶
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          const merchantData = await firestoreService.getMerchantById(user.uid);
          setMerchant(merchantData);
        } catch (error) {
          console.log('User is not a merchant or error occurred:', error);
          setMerchant(null);
        }
      } else {
        setMerchant(null);
      }
      setCheckingRole(false);
    };

    if (!loading) {
      checkUserRole();
    }
  }, [user, loading]);

  if (loading || checkingRole) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4299E1" />
      </View>
    );
  }

  return (
    <RootStack.Navigator 
      id={undefined}
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        // 如果用戶是商戶，顯示商戶導航；否則顯示一般用戶導航
        merchant ? (
          <RootStack.Screen name="Merchant" component={MerchantNavigation} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};
