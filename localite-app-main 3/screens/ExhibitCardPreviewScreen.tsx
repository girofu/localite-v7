import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import ExhibitCard from '../components/ExhibitCard';
import BadgeMessage from '../components/BadgeMessage';
import { getBadgesByType } from '../data/badges';

export default function ExhibitCardPreviewScreen({ onClose }: { onClose: () => void }) {
  // 獲取任務成就徽章
  const taskBadges = getBadgesByType('任務成就');
  
  // 展覽卡片資料
  const EXHIBIT_DATA = [
    {
      id: 'tea-cutting-machine',
      title: '切茶機',
      description: '切茶機便是用於茶工中將毛茶切短、葉分離。',
      image: require('../assets/places/shinfang.jpg'),
    },
    {
      id: 'tea-stem-picking-machine',
      title: '撿梗機',
      description: '在用切茶機將茶葉與茶梗(骨肉)分離之後,接著便是「撿梗機」登場的時候了!',
      image: require('../assets/places/shinfang.png'),
    },
    {
      id: 'tea-processing',
      title: '製茶工藝',
      description: '傳統製茶工藝展現了茶農的智慧與技術傳承。',
      image: require('../assets/places/xiahai.png'),
    },
    {
      id: 'tea-culture',
      title: '茶文化',
      description: '茶文化承載著深厚的歷史底蘊與人文精神。',
      image: require('../assets/places/shinfang.jpg'),
    },
  ];

  const handleExhibitSelect = (exhibitId: string) => {
    console.log('選擇展覽:', exhibitId);
  };

  const renderExhibitCard = ({ item }: { item: any }) => (
    <View style={styles.exhibitCardWrapper}>
      <ExhibitCard
        title={item.title}
        description={item.description}
        image={item.image}
        onSelect={() => handleExhibitSelect(item.id)}
        containerStyle={styles.exhibitCardStyle}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ExhibitCard 預覽</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* 預覽內容 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>ExhibitCard 元件預覽</Text>
        
        {/* 平行 Slide 展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>平行 Slide 展示方式</Text>
          <Text style={styles.sectionHint}>← 左右滑動查看更多展覽 →</Text>
          <FlatList
            data={EXHIBIT_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exhibitCardsList}
            renderItem={renderExhibitCard}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* 單一卡片展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>單一卡片展示</Text>
          <View style={styles.singleCardContainer}>
            <ExhibitCard
              title="切茶機"
              description="切茶機便是用於茶工中將毛茶切短、葉分離。"
              image={require('../assets/places/shinfang.jpg')}
              onSelect={() => handleExhibitSelect('single-card')}
            />
          </View>
        </View>

        {/* 自訂樣式展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>自訂樣式展示</Text>
          <View style={styles.singleCardContainer}>
            <ExhibitCard
              title="撿梗機"
              description="在用切茶機將茶葉與茶梗(骨肉)分離之後,接著便是「撿梗機」登場的時候了!"
              image={require('../assets/places/shinfang.png')}
              onSelect={() => handleExhibitSelect('custom-style')}
              containerStyle={styles.customCardStyle}
              titleStyle={styles.customTitleStyle}
              descriptionStyle={styles.customDescriptionStyle}
            />
          </View>
        </View>

        {/* 禁用狀態展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>禁用狀態展示</Text>
          <View style={styles.singleCardContainer}>
            <ExhibitCard
              title="禁用展覽"
              description="這個展覽目前無法查看。"
              image={require('../assets/places/xiahai.png')}
              onSelect={() => handleExhibitSelect('disabled')}
              disabled={true}
            />
          </View>
        </View>

        {/* 聊天氣泡中的展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>聊天氣泡中的展示</Text>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>
              讓我來為你介紹「撿梗間」的小秘密:
            </Text>
            <FlatList
              data={EXHIBIT_DATA.slice(0, 2)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chatExhibitCardsList}
              renderItem={renderExhibitCard}
              keyExtractor={(item) => `chat-${item.id}`}
            />
          </View>
        </View>

        {/* 徽章訊息預覽 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>徽章訊息預覽</Text>
          <Text style={styles.sectionHint}>任務成就徽章在聊天中的顯示效果</Text>
          <View style={styles.badgePreviewContainer}>
            {taskBadges.map((badge, index) => (
              <BadgeMessage 
                key={badge.id} 
                badge={badge} 
                guideId={index % 2 === 0 ? 'piglet' : 'kuron'} 
              />
            ))}
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
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  sectionHint: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
    textAlign: 'center',
  },
  exhibitCardsList: {
    paddingHorizontal: 16,
    paddingRight: 100, // 讓第二張卡片露出一半
  },
  exhibitCardWrapper: {
    width: 180,
    marginRight: 8,
  },
  exhibitCardStyle: {
    // 可以自訂樣式
  },
  singleCardContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  customCardStyle: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  customTitleStyle: {
    color: '#495057',
    fontSize: 18,
  },
  customDescriptionStyle: {
    color: '#6c757d',
    fontSize: 13,
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
  chatExhibitCardsList: {
    paddingRight: 100, // 讓第二張卡片露出一半
  },
  badgePreviewContainer: {
    backgroundColor: '#2F2F2F',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
}); 