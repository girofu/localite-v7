import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MiniCard from '../components/MiniCard';

export default function MiniCardPreviewScreen({ onClose }: { onClose: () => void }) {
  // MiniCard 資料
  const miniCardData = {
    fixedRoute: {
      title: '固定路線',
      icon: require('../assets/icons/icon_mini_set.png'),
    },
    freeExploration: {
      title: '自由探索',
      icon: require('../assets/icons/icon_mini_free.png'),
    },
  };

  const handleMiniCardPress = (type: string) => {
    console.log('選擇了:', type);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MiniCard 預覽</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* 預覽內容 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>MiniCard 元件預覽</Text>
        
        {/* 基本 MiniCard */}
        <View style={styles.cardSection}>
          <Text style={styles.cardLabel}>基本 MiniCard</Text>
          <View style={styles.cardsRow}>
            <MiniCard
              title={miniCardData.fixedRoute.title}
              icon={miniCardData.fixedRoute.icon}
              onPress={() => handleMiniCardPress('固定路線')}
            />
            <MiniCard
              title={miniCardData.freeExploration.title}
              icon={miniCardData.freeExploration.icon}
              onPress={() => handleMiniCardPress('自由探索')}
            />
          </View>
        </View>

        {/* 聊天氣泡中的 MiniCard */}
        <View style={styles.cardSection}>
          <Text style={styles.cardLabel}>聊天氣泡中的 MiniCard</Text>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>
              你好 👋! 我是你的在地人導覽員 KURON。歡迎來到新芳春~你想自己隨意走走, 自行探索新芳春的秘密? 還是讓我帶你走2條經典路線呢?
            </Text>
            <View style={styles.cardsRow}>
              <MiniCard
                title={miniCardData.fixedRoute.title}
                icon={miniCardData.fixedRoute.icon}
                onPress={() => handleMiniCardPress('固定路線')}
              />
              <MiniCard
                title={miniCardData.freeExploration.title}
                icon={miniCardData.freeExploration.icon}
                onPress={() => handleMiniCardPress('自由探索')}
              />
            </View>
          </View>
        </View>

        {/* 自訂樣式的 MiniCard */}
        <View style={styles.cardSection}>
          <Text style={styles.cardLabel}>自訂樣式的 MiniCard</Text>
          <View style={styles.cardsRow}>
            <MiniCard
              title="自訂樣式"
              icon={miniCardData.fixedRoute.icon}
              onPress={() => handleMiniCardPress('自訂樣式')}
              containerStyle={styles.customCard}
              textStyle={styles.customText}
            />
            <MiniCard
              title="深色主題"
              icon={miniCardData.freeExploration.icon}
              onPress={() => handleMiniCardPress('深色主題')}
              containerStyle={styles.darkCard}
              textStyle={styles.darkText}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  cardSection: {
    marginBottom: 32,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  chatBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  customCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  customText: {
    color: '#1976d2',
  },
  darkCard: {
    backgroundColor: '#424242',
    borderColor: '#666',
  },
  darkText: {
    color: '#fff',
  },
}); 