import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';
import { PersistenceService } from '../src/services/PersistenceService';
import { logger, setupGlobalErrorHandler } from '../src/services/LoggingService';
import { useAuth } from '../src/contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import { HybridLoginScreen } from '../src/screens/auth/HybridLoginScreen';
import { HybridRegisterScreen } from '../src/screens/auth/HybridRegisterScreen';
import GuideActivationScreen from '../screens/GuideActivationScreen';
import QRCodeScannerScreen from '../screens/QRCodeScannerScreen';
import MapScreen from '../screens/MapScreen';
import MapLocationScreen from '../screens/MapLocationScreen';
import PlaceIntroScreen from '../screens/PlaceIntroScreen';
import GuideSelectionScreen from '../screens/GuideSelectionScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatEndScreen from '../screens/ChatEndScreen';
import DrawerNavigation from '../screens/DrawerNavigation';
import LearningSheetScreen from '../screens/LearningSheetScreen';
import JourneyDetailScreen from '../screens/JourneyDetailScreen';
import JourneyMainScreen from '../screens/JourneyMainScreen';
import JourneyGenScreen from '../screens/JourneyGenScreen';
import LearningSheetsListScreen from '../screens/LearningSheetsListScreen';
import LearningScreen from '../screens/LearningScreen';
import BadgeScreen from '../screens/BadgeScreen';
import BadgeTypeScreen from '../screens/BadgeTypeScreen';
import BadgeDetailScreen from '../screens/BadgeDetailScreen';
import PreviewBadgeScreen from '../screens/PreviewBadgeScreen';
import AboutLocalite from '../screens/AboutLocalite';
import News from '../screens/news';
import Privacy from '../screens/privacy';
import MiniCardPreviewScreen from '../screens/MiniCardPreviewScreen';
import ButtonOptionPreviewScreen from '../screens/ButtonOptionPreviewScreen';
import ButtonCameraPreviewScreen from '../screens/ButtonCameraPreviewScreen';
import ExhibitCardPreviewScreen from '../screens/ExhibitCardPreviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { JourneyProvider } from '../contexts/JourneyContext';
import { UpdateProvider } from '../contexts/UpdateContext';
import { ScreenType } from '../src/types/navigation.types';
import { ServiceManager } from '../src/services/ServiceManager';

export default function Index() {
  const { user, loading: authLoading, verificationState } = useAuth();
  const [screen, setScreen] = useState<ScreenType>('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string>('kuron');
  const [returnToChat, setReturnToChat] = useState(false);
  const [showJourneyValidation, setShowJourneyValidation] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [screenParams, setScreenParams] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // 使用 AuthContext 的 user 狀態而不是本地狀態
  const isLoggedIn = !!user;

  // 監聽認證狀態變化，登入成功後自動導航
  useEffect(() => {
    if (user && (screen === 'login' || screen === 'signup')) {
      logger.info('用戶登入成功，自動導航', { userId: user.uid, currentScreen: screen });

      // 檢查並授予首次登入徽章
      const checkFirstLoginBadge = async () => {
        try {
          const badgeService = ServiceManager.getBadgeService();
          const awardedBadges = await badgeService.checkBadgeConditions(user.uid, 'first_login');

          if (awardedBadges.length > 0) {
            logger.info('首次登入徽章獲得', {
              userId: user.uid,
              badges: awardedBadges.map(b => b.name)
            });
          }
        } catch (error) {
          console.error('檢查首次登入徽章時發生錯誤:', error);
        }
      };

      checkFirstLoginBadge();

      if (returnToChat) {
        // 從聊天畫面來的登入，返回聊天
        setReturnToChat(false);
        setShowJourneyValidation(false);
        setShowEndOptions(true);
        setScreen('chat');
      } else {
        // 一般登入，返回首頁
        setScreen('home');
      }
    }
  }, [user, screen, returnToChat]);

  // 應用啟動時恢復狀態
  useEffect(() => {
    const restoreState = async () => {
      try {
        logger.info('應用啟動 - 開始恢復狀態', { screen: 'App' });
        
        const savedVoiceEnabled = await PersistenceService.getVoiceEnabled();
        setVoiceEnabled(savedVoiceEnabled);
        
        logger.info('語音設置已恢復', { voiceEnabled: savedVoiceEnabled });

        const savedNavigationState = await PersistenceService.getNavigationState();
        if (savedNavigationState) {
          if (savedNavigationState.selectedPlaceId) {
            setSelectedPlaceId(savedNavigationState.selectedPlaceId);
          }
          if (savedNavigationState.selectedGuide) {
            setSelectedGuide(savedNavigationState.selectedGuide);
          }
          if (savedNavigationState.showJourneyValidation !== undefined) {
            setShowJourneyValidation(savedNavigationState.showJourneyValidation);
          }
          if (savedNavigationState.showEndOptions !== undefined) {
            setShowEndOptions(savedNavigationState.showEndOptions);
          }
        }
      } catch (error) {
        logger.logError(error as Error, '恢復狀態失敗', { screen: 'App' });
        console.error('恢復狀態失敗:', error);
      }
    };

    restoreState();
    setupGlobalErrorHandler();
    
    // 測試日誌連接並記錄啟動
    setTimeout(() => {
      logger.testConnection().then(connected => {
        logger.info('應用啟動完成', { 
          screen: 'App',
          loggingConnected: connected,
          timestamp: new Date().toISOString()
        });
      });
    }, 1000);
  }, []);

  // 狀態改變時保存到持久化存儲
  useEffect(() => {
    const saveState = async () => {
      try {
        const stateToSave = {
          selectedPlaceId,
          selectedGuide,
          showJourneyValidation,
          showEndOptions,
          timestamp: Date.now(),
        };
        await PersistenceService.setNavigationState(stateToSave);
      } catch (error) {
        console.error('保存狀態失敗:', error);
      }
    };

    saveState();
  }, [selectedPlaceId, selectedGuide, showJourneyValidation, showEndOptions]);

  // 語音設定改變時保存
  useEffect(() => {
    const saveVoiceSetting = async () => {
      try {
        await PersistenceService.setVoiceEnabled(voiceEnabled);
      } catch (error) {
        console.error('保存語音設定失敗:', error);
      }
    };

    saveVoiceSetting();
  }, [voiceEnabled]);

  const navigateToScreen = (targetScreen: ScreenType, params?: any) => {
    setNavigationHistory(prev => [...prev, screen]);
    setScreenParams(params);
    setScreen(targetScreen);
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setScreen(previousScreen as ScreenType);
    } else {
      setScreen('home');
    }
  };

  // 專門用於關閉抽屜導航的函數
  const closeDrawer = () => {
    console.log('DrawerNavigation 關閉開始');
    console.log('當前導航歷史:', navigationHistory);
    console.log('當前頁面:', screen);
    
    // DrawerNavigation 和其子頁面，關閉抽屜時應該跳過這些頁面
    const drawerRelatedPages = ['drawerNavigation', 'journeyMain', 'learningSheetsList', 'badge', 'aboutLocalite', 'profile', 'login', 'register'];
    
    // 簡化邏輯：找到最後一個不是 drawer 相關頁面的歷史記錄
    let targetScreen = 'home';
    let newHistory = [];
    
    // 從後往前檢查導航歷史
    for (let i = navigationHistory.length - 1; i >= 0; i--) {
      const historyScreen = navigationHistory[i];
      if (!drawerRelatedPages.includes(historyScreen)) {
        targetScreen = historyScreen;
        newHistory = navigationHistory.slice(0, i);
        console.log(`找到目標頁面: ${targetScreen}, 新歷史長度: ${newHistory.length}`);
        break;
      }
    }
    
    console.log(`最終目標頁面: ${targetScreen}`);
    
    // 確保目標頁面是有效的
    const validScreens = ['home', 'chat', 'guide', 'guideSelection', 'locationScan', 'journeyDetail', 'journeyEnd', 'chatEnd', 'learningSheet', 'news', 'privacy', 'signup'];
    if (!validScreens.includes(targetScreen) || targetScreen === 'drawerNavigation') {
      console.log(`無效的目標頁面 ${targetScreen}, 改為 home`);
      targetScreen = 'home';
      newHistory = [];
    }
    
    // 更新導航歷史和當前頁面
    setNavigationHistory(newHistory);
    
    // 使用 setTimeout 確保狀態更新後立即切換畫面
    setTimeout(() => {
      setScreen(targetScreen as ScreenType);
      console.log('DrawerNavigation 關閉完成，已切換至:', targetScreen);
    }, 0);
  };

  // 渲染對應的頁面
  const renderScreen = () => {
    switch (screen) {
      case 'journeyMain':
        return <JourneyMainScreen onClose={goBack} onNavigate={navigateToScreen} isLoggedIn={isLoggedIn} verificationState={verificationState} />;
      case 'learningSheetsList':
        return <LearningScreen onClose={goBack} onNavigate={navigateToScreen} isLoggedIn={isLoggedIn} verificationState={verificationState} />;
      case 'badge':
        return <BadgeScreen onClose={goBack} onNavigate={navigateToScreen} isLoggedIn={isLoggedIn} verificationState={verificationState} />;
      case 'aboutLocalite':
        return <AboutLocalite onBack={goBack} onNavigateToNews={() => navigateToScreen('news')} onNavigateToPrivacy={() => navigateToScreen('privacy')} />;
      case 'news':
        return <News onBack={goBack} />;
      case 'privacy':
        return <Privacy onBack={goBack} />;
      case 'exhibitCardPreview':
        return <ExhibitCardPreviewScreen onClose={() => setScreen('home')} />;
      case 'buttonCameraPreview':
        return <ButtonCameraPreviewScreen onClose={() => setScreen('home')} />;
      case 'buttonOptionPreview':
        return <ButtonOptionPreviewScreen onClose={() => setScreen('home')} />;
      case 'miniCardPreview':
        return <MiniCardPreviewScreen onClose={() => setScreen('home')} />;
      case 'qr':
        return (
          <QRCodeScannerScreen 
            onClose={() => navigateToScreen('guide')} 
            setSelectedPlaceId={setSelectedPlaceId}
            navigateToScreen={navigateToScreen}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            guideId={selectedGuide}
            placeId={selectedPlaceId}
            onClose={() => setScreen('home')}
            onNavigate={(targetScreen: any, params?: any) => {
              if (targetScreen === 'login' && params?.returnToChat) {
                setReturnToChat(true);
                setShowJourneyValidation(params.showJourneyValidation);
                setScreen('login');
              } else {
                navigateToScreen(targetScreen);
              }
            }}
            initialShowJourneyValidation={showJourneyValidation}
            initialShowEndOptions={showEndOptions}
            isLoggedIn={isLoggedIn}
            voiceEnabled={voiceEnabled}
          />
        );
      case 'guideSelect':
        if (!selectedPlaceId) return null;
        return (
          <GuideSelectionScreen
            placeId={selectedPlaceId}
            onBack={() => setScreen('map')}
            onConfirm={(guideId: string) => {
              setSelectedGuide(guideId);
              setShowEndOptions(false);
              navigateToScreen('chat');
            }}
            onNavigate={navigateToScreen}
          />
        );
      case 'placeIntro':
        if (!selectedPlaceId) return null;
        return (
          <PlaceIntroScreen 
            placeId={selectedPlaceId} 
            onConfirm={() => {
              setShowEndOptions(false);
              setShowJourneyValidation(false);
              navigateToScreen('guideSelect');
            }} 
            onChange={() => navigateToScreen('map')} 
            onBack={() => navigateToScreen('map')} 
            onNavigate={navigateToScreen}
          />
        );
      case 'map':
        return (
          <MapScreen
            onBack={() => navigateToScreen('guide')}
            onPlaceSelect={placeId => {
              setSelectedPlaceId(placeId);
              navigateToScreen('placeIntro');
            }}
          />
        );
      case 'mapLocation':
        return (
          <MapLocationScreen
            onBack={() => navigateToScreen('chat')}
            onPlaceSelect={placeId => {
              setSelectedPlaceId(placeId);
              navigateToScreen('placeIntro');
            }}
          />
        );
      case 'guide':
        return (
          <GuideActivationScreen
            onReturn={() => navigateToScreen('home')}
            onMenu={() => navigateToScreen('drawerNavigation')}
            onQRCode={() => navigateToScreen('qr')}
            onMap={() => navigateToScreen('map')}
            onNavigate={navigateToScreen}
          />
        );
      case 'learningSheet':
        return <LearningSheetScreen onClose={goBack} onNavigate={navigateToScreen} />;
      case 'journeyDetail':
        return (
          <JourneyDetailScreen 
            onClose={goBack} 
            onNavigate={navigateToScreen}
            journeyData={screenParams}
            journeyId={screenParams?.journeyId}
          />
        );
      case 'journeyGen':
        return <JourneyGenScreen onClose={goBack} onNavigate={navigateToScreen} />;
      case 'badgeType':
        return <BadgeTypeScreen onClose={goBack} onNavigate={navigateToScreen} badgeType={screenParams} isLoggedIn={isLoggedIn} />;
      case 'badgeDetail':
        return <BadgeDetailScreen onClose={goBack} onNavigate={navigateToScreen} badge={screenParams} isLoggedIn={isLoggedIn} />;
      case 'previewBadge':
        return <PreviewBadgeScreen onClose={goBack} onNavigate={navigateToScreen} />;
      case 'chatEnd':
        return (
          <ChatEndScreen
            guideId={selectedGuide}
            userId={user?.uid}
            placeId={selectedPlaceId || undefined}
            onClose={goBack}
            onExploreMore={() => navigateToScreen('map')}
            onGenerateRecord={() => navigateToScreen('learningSheet')}
            onGenerateGuestRecord={() => {
              Alert.alert(
                '訪客學習單已生成',
                '您的學習單已臨時保存，建議登入帳號以永久保存學習記錄和獲得徽章。',
                [
                  { text: '立即登入', onPress: () => navigateToScreen('login') },
                  { text: '稍後登入', style: 'cancel' }
                ]
              );
            }}
            onNavigate={navigateToScreen}
            isLoggedIn={isLoggedIn}
          />
        );
      case 'drawerNavigation':
        return (
          <DrawerNavigation
            onClose={closeDrawer}
            onBack={goBack}
            onNavigateToLogin={() => navigateToScreen('login')}
            onNavigateToRegister={() => navigateToScreen('signup')}
            onNavigateToJourneyMain={() => navigateToScreen('journeyMain')}
            onNavigateToLearningSheetsList={() => navigateToScreen('learningSheetsList')}
            onNavigateToBadge={() => navigateToScreen('badge')}
            onNavigateToAboutLocalite={() => navigateToScreen('aboutLocalite')}
            onNavigateToProfile={() => navigateToScreen('profile')}
            isLoggedIn={isLoggedIn}
            userAvatar={null}
            userName={user?.email?.split('@')[0] || '訪客'}
            voiceEnabled={voiceEnabled}
            onVoiceToggle={setVoiceEnabled}
          />
        );
      case 'login':
        return (
          <HybridLoginScreen 
            navigation={{ 
              goBack: () => {
                if (returnToChat) {
                  setReturnToChat(false);
                  setShowJourneyValidation(false);
                  setShowEndOptions(true);
                  navigateToScreen('chat');
                } else {
                  goBack();
                }
              },
              navigate: (screen: string) => {
                if (screen === 'Register') {
                  navigateToScreen('signup');
                }
              }
            }}
            returnToChat={returnToChat}
            onClose={() => {
              if (returnToChat) {
                setReturnToChat(false);
                setShowJourneyValidation(false);
                setShowEndOptions(true);
                navigateToScreen('chat');
              } else {
                goBack();
              }
            }}
          />
        );
      case 'signup':
        return (
          <HybridRegisterScreen 
            navigation={{ 
              navigate: (screen: string) => {
                if (screen === 'Login') {
                  navigateToScreen('login');
                }
              }, 
              goBack 
            }} 
            onClose={goBack}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            onBack={goBack}
            onLogout={() => {
              // 登出由 AuthContext 處理，不需要手動設定 isLoggedIn
              setScreen('home');
            }}
            onUpgradeSubscription={() => {
              Alert.alert('功能開發中', '訂閱升級功能正在開發中');
            }}
            onDeleteAccount={() => {
              Alert.alert('功能開發中', '帳號刪除功能正在開發中');
            }}
          />
        );
      default:
        return (
          <HomeScreen 
            onStart={() => navigateToScreen('guide')}
            onNavigateToLogin={() => navigateToScreen('login')}
            onNavigateToGuideActivation={() => navigateToScreen('guide')}
            isLoggedIn={isLoggedIn}
          />
        );
    }
  };

  return (
    <JourneyProvider>
      <UpdateProvider>
        <Stack.Screen options={{ headerShown: false }} />
        {renderScreen()}
      </UpdateProvider>
    </JourneyProvider>
  );
}
