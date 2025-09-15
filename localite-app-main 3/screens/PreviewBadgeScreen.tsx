import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { BADGES, BADGES_BY_TYPE, Badge } from '../data/badges';
import BadgeModal from '../components/BadgeModal';

interface PreviewBadgeScreenProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const badgeItemWidth = (screenWidth - 48) / 2; // 兩列佈局，考慮間距

export default function PreviewBadgeScreen({ onClose, onNavigate }: PreviewBadgeScreenProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 根據 badge ID 動態載入對應的圖片
  const getBadgeImage = (badgeId: string) => {
    const imageMap: { [key: string]: any } = {
      'B2-1': require('../assets/badges/b2-1.png'),
      'B2-2': require('../assets/badges/b2-2.png'),
      'B2-3': require('../assets/badges/b2-3.png'),
      'B2-4': require('../assets/badges/b2-4.png'),
      'B2-5': require('../assets/badges/b2-5.png'),
      'B3-1': require('../assets/badges/b3-1.png'),
      'B3-2': require('../assets/badges/b3-2.png'),
      'B3-3': require('../assets/badges/b3-3.png'),
      'B4-1': require('../assets/badges/b4-1.png'),
      'B5-1': require('../assets/badges/b5-1.png'),
      'B5-2': require('../assets/badges/b5-2.png'),
      'B5-3': require('../assets/badges/b5-3.png'),
      'B6-1': require('../assets/badges/b6-1.png'),
      'B6-2': require('../assets/badges/b6-2.png'),
      'B6-3': require('../assets/badges/b6-3.png'),
      'B7-1': require('../assets/badges/b7-1.png'),
    };
    return imageMap[badgeId] || require('../assets/badges/b2-1.png');
  };

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBadge(null);
  };

  const renderBadgeItem = ({ item }: { item: Badge }) => (
    <TouchableOpacity
      style={styles.badgeItem}
      onPress={() => handleBadgePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.badgeImageContainer}>
        <Image 
          source={getBadgeImage(item.id)} 
          style={styles.badgeImage} 
          resizeMode="contain"
        />
      </View>
      <Text style={styles.badgeName}>{item.name}</Text>
      <Text style={styles.badgeType}>{item.type}</Text>
    </TouchableOpacity>
  );

  const renderTypeSection = (type: string, badges: Badge[]) => (
    <View key={type} style={styles.typeSection}>
      <Text style={styles.typeTitle}>{type}</Text>
      <FlatList
        data={badges}
        renderItem={renderBadgeItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.badgesGrid}
        columnWrapperStyle={styles.badgesRow}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>徽章預覽</Text>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(BADGES_BY_TYPE).map(([type, badges]) => 
          renderTypeSection(type, badges)
        )}
      </ScrollView>

      {/* Badge Modal */}
      <BadgeModal
        visible={showModal}
        badge={selectedBadge}
        onContinue={handleModalClose}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F', // 深灰色背景
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  typeSection: {
    marginBottom: 32,
  },
  typeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingLeft: 4,
  },
  badgesGrid: {
    paddingBottom: 8,
  },
  badgesRow: {
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: badgeItemWidth,
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeImageContainer: {
    width: 60,
    height: 60,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  badgeName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeType: {
    color: '#B0B0B0',
    fontSize: 12,
    textAlign: 'center',
  },
});
