import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView 
} from 'react-native';

interface AboutLocaliteProps {
  onBack: () => void;
  onNavigateToNews?: () => void;
  onNavigateToPrivacy?: () => void;
}

export default function AboutLocalite({ onBack, onNavigateToNews, onNavigateToPrivacy }: AboutLocaliteProps) {
  const handleNewsPress = () => {
    if (onNavigateToNews) {
      onNavigateToNews();
    } else {
      console.log('onNavigateToNews function not provided');
    }
  };

  const handlePrivacyPress = () => {
    if (onNavigateToPrivacy) {
      onNavigateToPrivacy();
    } else {
      console.log('onNavigateToPrivacy function not provided');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>關於 Localite AI</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo/logo-light.png')} style={styles.logo} />
          <Text style={styles.version}>版本 : V1.0.0</Text>
        </View>

        {/* Description Box */}
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            Localite AI 是一款專為熱愛在地旅遊的旅遊玩家設計的導覽平台。透過AI與趣味的導覽員設計，為玩家提供個人化的互動導覽體驗，讓每一次的旅程與參訪都充滿驚喜與收穫。
          </Text>
        </View>

        {/* Interactive Items */}
        <View style={styles.interactiveSection}>
          <TouchableOpacity style={styles.interactiveItem} onPress={handleNewsPress}>
            <Image source={require('../assets/icons/icon_news.png')} style={styles.itemIcon} />
            <Text style={styles.itemText}>最新消息</Text>
            <Image source={require('../assets/icons/icon_angle-right.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.interactiveItem} onPress={handlePrivacyPress}>
            <Image source={require('../assets/icons/icon_privacy.png')} style={styles.itemIcon} />
            <Text style={styles.itemText}>隱私權政策</Text>
            <Image source={require('../assets/icons/icon_angle-right.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.interactiveItem}>
            <Image source={require('../assets/icons/icon_website.png')} style={styles.itemIcon} />
            <Text style={styles.itemText}>Localite 官網</Text>
            <Image source={require('../assets/icons/icon_angle-right.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
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
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 140,
    height: 40,
    marginBottom: 16,
  },
  version: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  descriptionBox: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  interactiveSection: {
    marginBottom: 32,
  },
  interactiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  itemIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    tintColor: '#FFFFFF',
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
});
