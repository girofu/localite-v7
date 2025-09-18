import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Switch
} from 'react-native';
import { useUpdate } from '../contexts/UpdateContext';

interface DrawerNavigationProps {
  onClose?: () => void;
  onBack?: () => void; // 新增：返回上一頁的回調函數
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToJourneyMain?: () => void;
  onNavigateToLearningSheetsList?: () => void;
  onNavigateToBadge?: () => void;
  onNavigateToAboutLocalite?: () => void;
  onNavigateToProfile?: () => void;
  // Mock user data - in real app this would come from user context/state
  isLoggedIn?: boolean;
  userAvatar?: string | null;
  userName?: string;
  voiceEnabled?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;
}

export default function DrawerNavigation({
  onClose,
  onBack,
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToJourneyMain,
  onNavigateToLearningSheetsList,
  onNavigateToBadge,
  onNavigateToAboutLocalite,
  onNavigateToProfile,
  isLoggedIn = false,
  userAvatar = null,
  userName = 'Dannypi',
  voiceEnabled = true,
  onVoiceToggle
}: DrawerNavigationProps) {
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  
  // 狀態管理
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('中文');

  // 更新狀態管理
  const { updateState, markBadgesAsRead, markNewsAsRead } = useUpdate();

  const languages = ['中文', '英文', '日文'];

  useEffect(() => {
    // 進入時從左邊滑出
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    // 關閉時向左滑出
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
    });
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageDropdown(false);
  };

  const toggleVoice = (value: boolean) => {
    onVoiceToggle && onVoiceToggle(value);
  };

  // 處理徽章導航
  const handleBadgeNavigation = () => {
    markBadgesAsRead();
    onNavigateToBadge && onNavigateToBadge();
  };

  // 處理關於頁面導航
  const handleAboutNavigation = () => {
    markNewsAsRead();
    onNavigateToAboutLocalite && onNavigateToAboutLocalite();
  };

  // 處理右側更多選項導航
  const handleMoreOptionsNavigation = () => {
    if (isLoggedIn) {
      // 已登入：進入個人檔案
      onNavigateToProfile && onNavigateToProfile();
    } else {
      // 未登入：引導到登入頁面
      onNavigateToLogin && onNavigateToLogin();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* 背景遮罩 */}
        <TouchableOpacity 
          style={styles.backgroundOverlay} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        {/* 側邊欄內容 */}
        <Animated.View 
          style={[
            styles.drawerContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Image source={require('../assets/icons/icon_close.png')} style={styles.closeIcon} />
              </TouchableOpacity>
              <Text style={styles.title}>Localite AI</Text>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => onBack && onBack()}
              >
                <Image source={require('../assets/icons/icon_left.png')} style={styles.backIcon} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
              {/* 旅程記錄 */}
              <TouchableOpacity style={styles.menuItem} onPress={onNavigateToJourneyMain}>
                <Image source={require('../assets/icons/icon_journey.png')} style={styles.menuIcon} />
                <Text style={styles.menuText}>旅程記錄</Text>
              </TouchableOpacity>

              {/* 學習專區 */}
              <TouchableOpacity style={styles.menuItem} onPress={onNavigateToLearningSheetsList}>
                <Image source={require('../assets/icons/icon_learningsheet.png')} style={styles.menuIcon} />
                <Text style={styles.menuText}>學習專區</Text>
              </TouchableOpacity>

              {/* 我的徽章 */}
              <TouchableOpacity style={styles.menuItem} onPress={handleBadgeNavigation}>
                <Image source={require('../assets/icons/icon_badge.png')} style={styles.menuIcon} />
                <View style={styles.textWithNotificationContainer}>
                  <Text style={styles.menuTextWithDot}>我的徽章</Text>
                  {updateState.hasNewBadges && (
                    <View style={styles.notificationDot} />
                  )}
                </View>
              </TouchableOpacity>

              {/* 語言設定 */}
              <View style={styles.menuItem}>
                <Image source={require('../assets/icons/icon_earth.png')} style={styles.menuIcon} />
                <Text style={styles.menuText}>語言設定</Text>
                <TouchableOpacity 
                  style={styles.languageSelector}
                  onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <Text style={styles.languageText}>{selectedLanguage}</Text>
                  <Text style={[
                    styles.chevronText,
                    { transform: [{ rotate: showLanguageDropdown ? '180deg' : '0deg' }] }
                  ]}>
                    ⌵
                  </Text>
                </TouchableOpacity>
                
                {/* 語言下拉選單 */}
                {showLanguageDropdown && (
                  <View style={styles.languageDropdown}>
                    {languages.map((language) => (
                      <TouchableOpacity
                        key={language}
                        style={[
                          styles.languageOption,
                          selectedLanguage === language && styles.languageOptionSelected
                        ]}
                        onPress={() => handleLanguageSelect(language)}
                      >
                        <Text style={[
                          styles.languageOptionText,
                          selectedLanguage === language && styles.languageOptionTextSelected
                        ]}>
                          {language}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* 語音設定 */}
              <View style={styles.menuItem}>
                <Image source={require('../assets/icons/icon_speak.png')} style={styles.menuIcon} />
                <Text style={styles.menuText}>語音設定</Text>
                <View style={styles.switchContainer}>
                  <Switch
                    value={voiceEnabled}
                    onValueChange={toggleVoice}
                    trackColor={{ false: '#767577', true: '#4A90E2' }}
                    thumbColor={voiceEnabled ? '#FFFFFF' : '#f4f3f4'}
                    ios_backgroundColor="#767577"
                  />
                </View>
              </View>

              {/* 關於 Localite AI */}
              <TouchableOpacity style={styles.menuItem} onPress={handleAboutNavigation}>
                <Image source={require('../assets/icons/icon_website.png')} style={styles.menuIcon} />
                <View style={styles.textWithNotificationContainer}>
                  <Text style={styles.menuTextWithDot}>關於 Localite AI</Text>
                  {updateState.hasNewNews && (
                    <View style={styles.notificationDot} />
                  )}
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <View style={styles.footerContent}>
                {isLoggedIn ? (
                  // 已登入：顯示用戶頭像和姓名
                  <TouchableOpacity style={styles.footerLeft} onPress={onNavigateToProfile}>
                    <View style={styles.userAvatarContainer}>
                      {userAvatar ? (
                        <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.defaultUserAvatar}>
                          <Image 
                            source={require('../assets/icons/icon_user.png')} 
                            style={styles.defaultUserAvatarIcon} 
                          />
                        </View>
                      )}
                    </View>
                    <Text style={styles.userNameText}>{userName}</Text>
                  </TouchableOpacity>
                ) : (
                  // 未登入：顯示登入｜註冊
                  <TouchableOpacity style={styles.footerLeft} onPress={onNavigateToLogin}>
                    <Image source={require('../assets/icons/icon_login.png')} style={styles.footerIcon} />
                    <Text style={styles.footerText}>登入 | 註冊</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.footerRight} onPress={handleMoreOptionsNavigation}>
                  <Image source={require('../assets/icons/icon_more.png')} style={styles.footerIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backgroundOverlay: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
    position: 'relative',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    tintColor: '#FFFFFF',
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  chevronText: {
    color: '#FFFFFF',
    fontSize: 16, // 與 languageText 的 fontSize 保持一致
    marginLeft: 8,
    fontWeight: 'bold',
  },
  languageDropdown: {
    position: 'absolute',
    top: '100%',
    right: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 120,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#333333',
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  languageOptionSelected: {
    backgroundColor: '#4A90E2',
  },
  languageOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  languageOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchContainer: {
    marginLeft: 'auto',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  rightText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginBottom: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRight: {
    padding: 12,
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  userAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  defaultUserAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultUserAvatarIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  textWithNotificationContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  menuTextWithDot: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});
