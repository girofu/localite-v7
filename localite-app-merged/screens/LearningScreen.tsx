import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

interface LearningScreenProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  isLoggedIn?: boolean;
  verificationState?: string;
}

export default function LearningScreen({ 
  onClose, 
  onNavigate,
  isLoggedIn = false,
  verificationState = 'pending_verification'
}: LearningScreenProps) {
  
  const { user } = useAuth();
  const isVerified = verificationState === 'verified';
  
  // 檢查是否可以訪問功能
  const canAccessFeature = isLoggedIn && isVerified;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => {
            console.log('漢堡圖示被點擊');
            onNavigate('drawerNavigation');
          }}
        >
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>學習專區</Text>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {!isLoggedIn ? (
        // 未登入狀態
        <View style={styles.contentContainer}>
          {/* Lock Icon */}
          <View style={styles.lockIconContainer}>
            <Image 
              source={require('../assets/icons/icon_lockman.png')} 
              style={styles.lockIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* Login Message */}
          <View style={styles.messageContainer}>
            <View style={styles.messageRow}>
              <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
              <Text style={styles.loginMessage}>登入 Localite 帳號進入學習專區</Text>
            </View>
          </View>
          
          {/* Call to Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => onNavigate('login')}
            >
              <Text style={styles.loginButtonText}>登入</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => onNavigate('guide')}
            >
              <Text style={styles.exploreButtonText}>探索更多地點</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : !isVerified ? (
        // 已登入但未驗證狀態
        <View style={styles.contentContainer}>
          {/* Verification Required Icon */}
          <View style={styles.lockIconContainer}>
            <Image 
              source={require('../assets/icons/icon_lockman.png')} 
              style={styles.lockIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* Verification Message */}
          <View style={styles.messageContainer}>
            <View style={styles.messageRow}>
              <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
              <Text style={styles.verificationMessage}>請驗證您的信箱以進入學習專區</Text>
            </View>
            <Text style={styles.verificationSubMessage}>
              驗證後即可享受完整的學習體驗和專屬內容
            </Text>
          </View>
          
          {/* Call to Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.verificationButton}
              onPress={() => onNavigate('profile')}
            >
              <Text style={styles.verificationButtonText}>前往驗證</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => onNavigate('guide')}
            >
              <Text style={styles.exploreButtonText}>探索更多地點</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // 已登入且已驗證狀態 - 顯示學習內容
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.learningContent}>
            <View style={styles.emptyStateContainer}>
              <Image 
                source={require('../assets/icons/icon_learningsheet.png')} 
                style={styles.emptyIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>學習專區即將上線</Text>
              <Text style={styles.emptySubtitle}>
                我們正在準備豐富的學習內容，包括在地文化、歷史故事等精彩資料
              </Text>
              <TouchableOpacity 
                style={styles.exploreMoreButton}
                onPress={() => onNavigate('guide')}
              >
                <Text style={styles.exploreMoreButtonText}>先去探索景點</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockIcon: {
    width: 120,
    height: 120,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparklesIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#10B981',
  },
  loginMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  verificationMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  verificationSubMessage: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  learningContent: {
    flex: 1,
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
    tintColor: '#6B7280',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreMoreButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
