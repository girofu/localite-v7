import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { GUIDES } from '../data/guide';
import { JourneyValidationModal } from '../components/LoginValidationModal';

interface ChatEndScreenProps {
  guideId?: string;
  onClose?: () => void;
  onExploreMore?: () => void;
  onGenerateRecord?: () => void;
  onGenerateGuestRecord?: () => void;
  onNavigate: (screen: any) => void;
  isLoggedIn?: boolean;
}

export default function ChatEndScreen({
  guideId = 'piglet',
  onClose,
  onExploreMore,
  onGenerateRecord,
  onGenerateGuestRecord,
  onNavigate,
  isLoggedIn = false
}: ChatEndScreenProps) {
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];
  const [showJourneyValidation, setShowJourneyValidation] = useState(false);
  
  // 根據導覽員 ID 獲取對應的 bye 圖像
  const getByeImage = (guideId: string) => {
    switch (guideId) {
      case 'piglet':
        return require('../assets/scenario/piglet_bye.png');
      case 'kuron':
        return require('../assets/scenario/kuron_bye.png');
      case 'nikko':
        return require('../assets/scenario/nikko_bye.png');
      case 'pururu':
        return require('../assets/scenario/pururu_bye.png');
      case 'popo':
        return require('../assets/scenario/popo_bye.png');
      default:
        return require('../assets/scenario/piglet_bye.png');
    }
  };

  return (
    <SafeAreaView style={styles.container}>


      {/* Main Content */}
      <View style={styles.content}>
        {/* GoodBye Message */}
        <Text style={styles.goodbyeText}>
          GoodBye!{'\n'}祝你有個美好的旅程!
        </Text>

        {/* Character Image */}
        <Image 
          source={getByeImage(guide.id)} 
          style={styles.characterImage} 
          resizeMode="contain"
        />

        {/* Explore More Button */}
        <TouchableOpacity 
          style={styles.exploreButton} 
          onPress={onExploreMore}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreButtonText}>探索更多地點</Text>
        </TouchableOpacity>

        {/* Generate Record Prompt */}
        <TouchableOpacity
          style={styles.generatePrompt}
          onPress={() => {
            if (isLoggedIn) {
              // 如果用戶已登入，直接生成旅程記錄
              onGenerateRecord && onGenerateRecord();
            } else {
              // 如果用戶未登入，提供訪客模式選項
              setShowJourneyValidation(true);
            }
          }}
          activeOpacity={0.8}
        >
          <Image
            source={require('../assets/icons/icon_sparkles.png')}
            style={styles.sparklesIcon}
          />
          <Text style={styles.generatePromptText}>
            離開前別忘了記錄本日旅程,還可以收藏專屬徽章哦!
            <Text style={styles.generateLink}>記錄旅程→</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Journey Validation Modal */}
      <JourneyValidationModal
        visible={showJourneyValidation}
        onLogin={() => {
          setShowJourneyValidation(false);
          onGenerateRecord && onGenerateRecord();
        }}
        onCancel={() => setShowJourneyValidation(false)}
        onGuestMode={() => {
          setShowJourneyValidation(false);
          onGenerateGuestRecord && onGenerateGuestRecord();
        }}
        onClose={() => setShowJourneyValidation(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60, // 向上移動內容
  },
  goodbyeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 40,
  },
  characterImage: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  generatePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 280,
    alignSelf: 'center', // 讓整個容器置中
  },
  sparklesIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  generatePromptText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left', // 文字內容向左對齊
    flex: 1,
  },
  generateLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
