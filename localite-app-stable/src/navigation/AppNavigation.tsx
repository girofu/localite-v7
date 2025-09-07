/**
 * 主要應用導航 - 僅用戶系統
 * 管理員和商家功能已分離為獨立系統
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types/navigation.types';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../../screens/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

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

  if (loading) {
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
        <RootStack.Screen name="Main" component={MainNavigator} />
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