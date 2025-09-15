import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { JourneyProvider } from './contexts/JourneyContext';
import { UpdateProvider } from './contexts/UpdateContext';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import GuideActivationScreen from './screens/GuideActivationScreen';
import QRCodeScannerScreen from './screens/QRCodeScannerScreen';
import MapScreen from './screens/MapScreen';
import MapLocationScreen from './screens/MapLocationScreen';
import PlaceIntroScreen from './screens/PlaceIntroScreen';
import GuideSelectionScreen from './screens/GuideSelectionScreen';
import ChatScreen from './screens/ChatScreen';
import ChatEndScreen from './screens/ChatEndScreen';
import DrawerNavigation from './screens/DrawerNavigation';
import LearningSheetScreen from './screens/LearningSheetScreen';
import JourneyDetailScreen from './screens/JourneyDetailScreen';
import JourneyMainScreen from './screens/JourneyMainScreen';
import JourneyGenScreen from './screens/JourneyGenScreen';
import LearningSheetsListScreen from './screens/LearningSheetsListScreen';
import BadgeScreen from './screens/BadgeScreen';
import BadgeTypeScreen from './screens/BadgeTypeScreen';
import BadgeDetailScreen from './screens/BadgeDetailScreen';
import PreviewBadgeScreen from './screens/PreviewBadgeScreen';
import AboutLocalite from './screens/AboutLocalite';
import News from './screens/news';
import Privacy from './screens/privacy';
import MiniCardPreviewScreen from './screens/MiniCardPreviewScreen';
import ButtonOptionPreviewScreen from './screens/ButtonOptionPreviewScreen';
import ButtonCameraPreviewScreen from './screens/ButtonCameraPreviewScreen';
import ExhibitCardPreviewScreen from './screens/ExhibitCardPreviewScreen';
import ProfileScreen from './screens/ProfileScreen';
import { PLACES } from './data/places';


function AppContent() {
  const [screen, setScreen] = useState<'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'badgeType' | 'badgeDetail' | 'previewBadge' | 'aboutLocalite' | 'news' | 'privacy' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'profile'>('home');
  const [selectedBadgeType, setSelectedBadgeType] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string>('kuron');
  const [returnToChat, setReturnToChat] = useState(false);
  const [showJourneyValidation, setShowJourneyValidation] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentPlaceName, setCurrentPlaceName] = useState<string>('忠寮李舉人宅');
  const [journeyData, setJourneyData] = useState<any>(null);
  const [fromJourneyDetail, setFromJourneyDetail] = useState<boolean>(false);
  const [journeyGenSource, setJourneyGenSource] = useState<'chatEnd' | 'chat' | null>(null); // 追蹤進入 JourneyGenScreen 的來源
  
  // User login state - in real app this would come from user context/state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 預設未登入狀態
  const [hasEverLoggedIn, setHasEverLoggedIn] = useState(false); // 預設未登入過
  const [avatarUri, setAvatarUri] = useState<string | null>(null); // 用戶頭像狀態

  const navigateToScreen = (targetScreen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'badgeType' | 'badgeDetail' | 'previewBadge' | 'aboutLocalite' | 'news' | 'privacy' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'profile', data?: any, badge?: any) => {
    setNavigationHistory(prev => [...prev, screen]);
    setScreen(targetScreen);
    
    // 處理 badgeType 導航
    if (targetScreen === 'badgeType' && typeof data === 'string') {
      setSelectedBadgeType(data);
    }
    
    // 處理 badgeDetail 導航
    if (targetScreen === 'badgeDetail' && badge) {
      setSelectedBadge(badge);
    }
    
    // 處理 journeyGen 導航來源追蹤
    if (targetScreen === 'journeyGen') {
      if (screen === 'chatEnd') {
        setJourneyGenSource('chatEnd');
      } else if (screen === 'chat') {
        setJourneyGenSource('chat');
      } else {
        setJourneyGenSource(null);
      }
    } else {
      // 離開 journeyGen 時重置來源
      setJourneyGenSource(null);
    }
    
    if (data) {
      setJourneyData(data);
      // 檢查是否從 JourneyDetail 導航到 JourneyMain
      if (targetScreen === 'journeyMain' && data.fromJourneyDetail) {
        setFromJourneyDetail(true);
      } else if (targetScreen !== 'journeyMain') {
        setFromJourneyDetail(false);
      }
    } else {
      setFromJourneyDetail(false);
    }
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      // 找到最後一個非 drawerNavigation 和非 profile 的頁面
      let previousScreen = navigationHistory[navigationHistory.length - 1];
      let historyIndex = navigationHistory.length - 1;
      
      // 如果最後一個頁面是 drawerNavigation 或 profile，則尋找更早的頁面
      while ((previousScreen === 'drawerNavigation' || previousScreen === 'profile') && historyIndex > 0) {
        historyIndex--;
        previousScreen = navigationHistory[historyIndex];
      }
      
      // 移除從找到的頁面開始到現在的所有歷史記錄
      setNavigationHistory(prev => prev.slice(0, historyIndex));
      
      if (previousScreen !== 'drawerNavigation' && previousScreen !== 'profile') {
        setScreen(previousScreen as 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'previewBadge' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'profile');
      } else {
        setScreen('home');
      }
    } else {
      setScreen('home');
    }
  };

  if (screen === 'journeyMain') {
    return <JourneyMainScreen onClose={goBack} onNavigate={navigateToScreen} fromJourneyDetail={fromJourneyDetail} />;
  }
  if (screen === 'journeyGen') {
    return <JourneyGenScreen onClose={goBack} onNavigate={navigateToScreen} placeName={currentPlaceName} source={journeyGenSource} />;
  }
  if (screen === 'learningSheetsList') {
    return <LearningSheetsListScreen onClose={goBack} onNavigate={navigateToScreen} />;
  }
  if (screen === 'badge') {
    return <BadgeScreen onClose={goBack} onNavigate={navigateToScreen} isLoggedIn={isLoggedIn} />;
  }
  if (screen === 'badgeType') {
    return <BadgeTypeScreen onClose={goBack} onNavigate={navigateToScreen} badgeType={selectedBadgeType} isLoggedIn={isLoggedIn} />;
  }
  if (screen === 'badgeDetail') {
    return <BadgeDetailScreen onClose={goBack} onNavigate={navigateToScreen} badge={selectedBadge} isLoggedIn={isLoggedIn} />;
  }
  if (screen === 'previewBadge') {
    return <PreviewBadgeScreen onClose={goBack} onNavigate={navigateToScreen} />;
  }
  if (screen === 'aboutLocalite') {
    return <AboutLocalite onBack={goBack} onNavigateToNews={() => navigateToScreen('news')} onNavigateToPrivacy={() => navigateToScreen('privacy')} />;
  }
  if (screen === 'news') {
    return <News onBack={goBack} />;
  }
  if (screen === 'privacy') {
    return <Privacy onBack={goBack} />;
  }
  if (screen === 'exhibitCardPreview') {
    return <ExhibitCardPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'buttonCameraPreview') {
    return <ButtonCameraPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'buttonOptionPreview') {
    return <ButtonOptionPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'miniCardPreview') {
    return <MiniCardPreviewScreen onClose={() => setScreen('home')} />;
  }
  if (screen === 'qr') {
    return <QRCodeScannerScreen onClose={() => navigateToScreen('guide')} />;
  }
  if (screen === 'chat') {
    return <ChatScreen 
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
    />;
  }
  if (screen === 'guideSelect' && selectedPlaceId) {
    return <GuideSelectionScreen
      placeId={selectedPlaceId}
      onBack={() => setScreen('map')}
      onConfirm={(guideId) => {
        setSelectedGuide(guideId);
        // 重新選擇導覽員時，重置結束導覽選項狀態
        setShowEndOptions(false);
        navigateToScreen('chat');
      }}
      onNavigate={navigateToScreen}
      isLoggedIn={isLoggedIn}
      hasEverLoggedIn={hasEverLoggedIn}
    />;
  }
  if (screen === 'placeIntro' && selectedPlaceId) {
    return <PlaceIntroScreen 
      placeId={selectedPlaceId} 
      onConfirm={() => {
        // 選擇新地點時，重置相關狀態
        setShowEndOptions(false);
        setShowJourneyValidation(false);
        navigateToScreen('guideSelect');
      }} 
      onChange={() => navigateToScreen('map')} 
      onBack={() => navigateToScreen('map')} 
      onNavigate={navigateToScreen}
    />;
  }
  if (screen === 'map') {
    return <MapScreen
      onBack={() => navigateToScreen('guide')}
      onPlaceSelect={placeId => {
        setSelectedPlaceId(placeId);
        // 根據 placeId 更新地點名稱
        const place = PLACES.find(p => p.id === placeId);
        if (place) {
          setCurrentPlaceName(place.name);
        }
        navigateToScreen('placeIntro');
      }}
    />;
  }
  if (screen === 'mapLocation') {
    return <MapLocationScreen
      onBack={() => navigateToScreen('chat')}
    />;
  }
  if (screen === 'guide') {
    return (
      <GuideActivationScreen
        onReturn={() => navigateToScreen('home')}
        onMenu={() => navigateToScreen('drawerNavigation')}
        onQRCode={() => navigateToScreen('qr')}
        onMap={() => navigateToScreen('map')}
        onNavigate={navigateToScreen}
      />
    );
  }
  if (screen === 'learningSheet') {
    return <LearningSheetScreen onClose={goBack} onNavigate={navigateToScreen} />;
  }
  if (screen === 'journeyDetail') {
    return <JourneyDetailScreen 
      onClose={goBack} 
      onNavigate={navigateToScreen} 
      journeyData={journeyData}
      onSaveJourney={() => {
        // 保存旅程後可以執行額外的邏輯
        console.log('旅程已保存');
      }}
    />;
  }
  if (screen === 'chatEnd') {
    return <ChatEndScreen 
      guideId={selectedGuide}
      onClose={goBack}
      onExploreMore={() => navigateToScreen('guide')}
      onGenerateRecord={() => navigateToScreen('journeyGen')}
      onNavigate={navigateToScreen}
      isLoggedIn={isLoggedIn}
    />;
  }
  if (screen === 'drawerNavigation') {
    return <DrawerNavigation 
      onClose={goBack}
      onNavigateToLogin={() => navigateToScreen('login')}
      onNavigateToRegister={() => navigateToScreen('signup')}
      onNavigateToJourneyMain={() => navigateToScreen('journeyMain')}
      onNavigateToLearningSheetsList={() => navigateToScreen('learningSheetsList')}
      onNavigateToBadge={() => navigateToScreen('badge')}
      onNavigateToAboutLocalite={() => navigateToScreen('aboutLocalite')}
      onNavigateToProfile={() => navigateToScreen('profile')}
      // Mock user data - in real app this would come from user context/state
      isLoggedIn={isLoggedIn}
      userAvatar={avatarUri}
      userName="Dannypi"
    />;
  }
  if (screen === 'login') {
    return <LoginScreen 
      onClose={() => {
        if (returnToChat) {
          setReturnToChat(false);
          // 從 Login 返回 Chat 時，重置 showJourneyValidation 為 false，但保持 showEndOptions 為 true
          setShowJourneyValidation(false);
          setShowEndOptions(true);
          navigateToScreen('chat');
        } else {
          goBack();
        }
      }} 
      onLogin={(email) => {
        // 用戶登入成功，標記為已登入過
        setIsLoggedIn(true);
        setHasEverLoggedIn(true);
        if (returnToChat) {
          setReturnToChat(false);
          setShowJourneyValidation(false);
          setShowEndOptions(true);
          navigateToScreen('chat');
        } else {
          navigateToScreen('home');
        }
      }}
      onGoogleLogin={() => {
        // Google 登入成功，標記為已登入過
        setIsLoggedIn(true);
        setHasEverLoggedIn(true);
        if (returnToChat) {
          setReturnToChat(false);
          setShowJourneyValidation(false);
          setShowEndOptions(true);
          navigateToScreen('chat');
        } else {
          navigateToScreen('home');
        }
      }}
      onAppleLogin={() => {
        // Apple 登入成功，標記為已登入過
        setIsLoggedIn(true);
        setHasEverLoggedIn(true);
        if (returnToChat) {
          setReturnToChat(false);
          setShowJourneyValidation(false);
          setShowEndOptions(true);
          navigateToScreen('chat');
        } else {
          navigateToScreen('home');
        }
      }}
      onNavigateToSignup={() => navigateToScreen('signup')}
      returnToChat={returnToChat}
      showJourneyValidation={showJourneyValidation}
    />;
  }
  if (screen === 'signup') {
    return <SignupScreen 
      onClose={goBack}
      onNavigateToLogin={() => navigateToScreen('login')}
    />;
  }
  if (screen === 'profile') {
    return <ProfileScreen 
      onBack={goBack}
      onNavigate={navigateToScreen}
      avatarUri={avatarUri}
      onUpdateAvatar={setAvatarUri}
      onLogout={() => {
        // 登出後更新登入狀態並返回主頁
        setIsLoggedIn(false);
        // 不重置 hasEverLoggedIn，讓用戶重新登入時仍能看到綠芽
        setScreen('home');
      }}
      onUpgradeSubscription={() => {
        // 這裡可以導向訂閱升級頁面
        Alert.alert('功能開發中', '訂閱升級功能正在開發中');
      }}
      onDeleteAccount={() => {
        // 這裡可以處理帳號刪除
        Alert.alert('功能開發中', '帳號刪除功能正在開發中');
      }}
    />;
  }

  return <HomeScreen 
    onStart={() => navigateToScreen('guide')}
    onNavigateToLogin={() => navigateToScreen('login')}
    onNavigateToGuideActivation={() => navigateToScreen('guide')}
    isLoggedIn={isLoggedIn}
  />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <JourneyProvider>
        <UpdateProvider>
          <AppContent />
        </UpdateProvider>
      </JourneyProvider>
    </SafeAreaProvider>
  );
}