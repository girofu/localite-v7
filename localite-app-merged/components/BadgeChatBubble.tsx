import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet
} from 'react-native';
import { Badge } from '../data/badges';

interface BadgeChatBubbleProps {
  badge: Badge;
  guideId?: string;
}

export default function BadgeChatBubble({ badge, guideId = 'kuron' }: BadgeChatBubbleProps) {
  // 導覽員圖片對應表
  const GUIDE_IMAGES = {
    kuron: require('../assets/guides/kuron_guide.png'),
    pururu: require('../assets/guides/pururu_guide.png'),
    popo: require('../assets/guides/popo_guide.png'),
    nikko: require('../assets/guides/nikko_guide.png'),
    piglet: require('../assets/guides/piglet_guide.png'),
  };

  // 根據 badge ID 動態載入對應的圖片
  const getBadgeImage = (badgeId: string) => {
    const imageMap: { [key: string]: any } = {
      'B3-1': require('../assets/badges/b3-1.png'),
      'B3-2': require('../assets/badges/b3-2.png'),
      'B3-3': require('../assets/badges/b3-3.png'),
    };
    return imageMap[badgeId] || require('../assets/badges/b3-1.png');
  };

  return (
    <View style={styles.container} testID="chat-bubble-container">
      {/* 導覽員頭像 */}
      <View style={styles.avatarContainer}>
        <Image 
          source={(GUIDE_IMAGES as Record<string, any>)[guideId] || GUIDE_IMAGES.kuron} 
          style={styles.avatar} 
          testID="guide-avatar"
        />
      </View>

      {/* 徽章訊息氣泡 */}
      <View style={styles.bubbleContainer}>
        <View style={styles.messageBubble} testID="message-bubble">
          {/* 文字內容 */}
          <Text style={styles.messageText}>
            {badge.description}
          </Text>
          
          {/* 徽章圖片 */}
          <View style={styles.badgeImageContainer}>
            <Image 
              source={getBadgeImage(badge.id)} 
              style={styles.badgeImage} 
              resizeMode="contain"
              testID="badge-image"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bubbleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  messageBubble: {
    backgroundColor: '#4CAF50', // 綠色背景
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: '85%',
    alignItems: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  badgeImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
});
