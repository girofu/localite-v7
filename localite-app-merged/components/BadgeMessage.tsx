import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet
} from 'react-native';
import { Badge } from '../src/types/badge.types';

interface BadgeMessageProps {
  badge: Badge;
  guideId?: string;
}

// 導覽員圖片對應表
const GUIDE_IMAGES = {
  kuron: require('../assets/guides/kuron_guide.png'),
  pururu: require('../assets/guides/pururu_guide.png'),
  popo: require('../assets/guides/popo_guide.png'),
  nikko: require('../assets/guides/nikko_guide.png'),
  piglet: require('../assets/guides/piglet_guide.png'),
  babyron: require('../assets/guides/babyron_guide.png'),
};

export default function BadgeMessage({ badge, guideId = 'kuron' }: BadgeMessageProps) {
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
    <View style={styles.badgeBubble}>
      <Text style={styles.badgeText}>
        {badge.description}
      </Text>
      <View style={styles.badgeImageContainer}>
        <Image 
          source={getBadgeImage(badge.id)} 
          style={styles.badgeImage} 
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeBubble: {
    backgroundColor: '#81B171',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: '85%',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 16,
    fontWeight: '500',
  },
  badgeImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
});
