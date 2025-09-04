import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';
import { PersistenceService } from '../src/services/PersistenceService';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
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
import LearningSheetsListScreen from '../screens/LearningSheetsListScreen';
import BadgeScreen from '../screens/BadgeScreen';
import AboutLocalite from '../screens/AboutLocalite';
import News from '../screens/news';
import Privacy from '../screens/privacy';
import MiniCardPreviewScreen from '../screens/MiniCardPreviewScreen';
import ButtonOptionPreviewScreen from '../screens/ButtonOptionPreviewScreen';
import ButtonCameraPreviewScreen from '../screens/ButtonCameraPreviewScreen';
import ExhibitCardPreviewScreen from '../screens/ExhibitCardPreviewScreen';
import ProfileScreen from '../screens/ProfileScreen';

type ScreenType = 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'news' | 'privacy' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'profile';

export default function Index() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string>('kuron');
  const [returnToChat, setReturnToChat] = useState(false);
  const [showJourneyValidation, setShowJourneyValidation] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // 應用啟動時恢復狀態
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedVoiceEnabled = await PersistenceService.getVoiceEnabled();
        setVoiceEnabled(savedVoiceEnabled);

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
        console.error('恢復狀態失敗:', error);
      }
    };

    restoreState();
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

  const navigateToScreen = (targetScreen: ScreenType) => {
    setNavigationHistory(prev => [...prev, screen]);
    setScreen(targetScreen);
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      let previousScreen = navigationHistory[navigationHistory.length - 1];
      let historyIndex = navigationHistory.length - 1;
      
      while (previousScreen === 'drawerNavigation' && historyIndex > 0) {
        historyIndex--;
        previousScreen = navigationHistory[historyIndex];
      }
      
      setNavigationHistory(prev => prev.slice(0, historyIndex));
      
      if (previousScreen !== 'drawerNavigation') {
        setScreen(previousScreen as ScreenType);
      } else {
        setScreen('home');
      }
    } else {
      setScreen('home');
    }
  };

  // 渲染對應的頁面
  const renderScreen = () => {
    switch (screen) {
      case 'journeyMain':
        return <JourneyMainScreen onClose={goBack} onNavigate={navigateToScreen} />;
      case 'learningSheetsList':
        return <LearningSheetsListScreen onClose={goBack} onNavigate={navigateToScreen} />;
      case 'badge':
        return <BadgeScreen onClose={goBack} onNavigate={navigateToScreen} />;
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
        return <QRCodeScannerScreen onClose={() => navigateToScreen('guide')} />;
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
            onConfirm={(guideId) => {
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
        return <JourneyDetailScreen onClose={goBack} onNavigate={navigateToScreen} />;
      case 'chatEnd':
        return (
          <ChatEndScreen
            guideId={selectedGuide}
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
            onClose={goBack}
            onNavigateToLogin={() => navigateToScreen('login')}
            onNavigateToRegister={() => navigateToScreen('signup')}
            onNavigateToJourneyMain={() => navigateToScreen('journeyMain')}
            onNavigateToLearningSheetsList={() => navigateToScreen('learningSheetsList')}
            onNavigateToBadge={() => navigateToScreen('badge')}
            onNavigateToAboutLocalite={() => navigateToScreen('aboutLocalite')}
            onNavigateToProfile={() => navigateToScreen('profile')}
            isLoggedIn={isLoggedIn}
            userAvatar={null}
            userName="Dannypi"
            voiceEnabled={voiceEnabled}
            onVoiceToggle={setVoiceEnabled}
          />
        );
      case 'login':
        return (
          <LoginScreen 
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
            onNavigateToSignup={() => navigateToScreen('signup')}
            returnToChat={returnToChat}
            showJourneyValidation={showJourneyValidation}
          />
        );
      case 'signup':
        return <SignupScreen onClose={goBack} onNavigateToLogin={() => navigateToScreen('login')} />;
      case 'profile':
        return (
          <ProfileScreen 
            onBack={goBack}
            onLogout={() => {
              setIsLoggedIn(false);
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {renderScreen()}
    </>
  );
}
