import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Animated
} from 'react-native';
import { newsData, newsImages, NewsItem } from '../data/news';

interface NewsProps {
  onBack: () => void;
}

export default function News({ onBack }: NewsProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    if (expandedItem === id) {
      // 如果點擊的是已展開的項目，則關閉它
      setExpandedItem(null);
    } else {
      // 否則展開新的項目（會自動關閉其他項目）
      setExpandedItem(id);
    }
  };

  const handleCtaPress = (ctaLink?: string) => {
    if (ctaLink) {
      if (ctaLink.startsWith('http')) {
        // 處理外部連結
        console.log('開啟外部連結:', ctaLink);
      } else {
        // 處理內部導航
        console.log('導航到:', ctaLink);
      }
    }
  };

  const renderNewsItem = (item: NewsItem) => {
    const isExpanded = expandedItem === item.id;
    
    return (
      <View key={item.id} style={styles.newsItem}>
        <TouchableOpacity 
          style={styles.newsHeader} 
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.newsHeaderContent}>
            <Text style={styles.newsTitle} numberOfLines={isExpanded ? undefined : 2}>
              {item.title}
            </Text>
            <Text style={styles.newsDate}>{item.date}</Text>
          </View>
          <Image 
            source={require('../assets/icons/icon_down.png')} 
            style={[
              styles.expandIcon, 
              { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }
            ]} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.newsContent}>
            <Text style={styles.newsContentText}>{item.content}</Text>
            
            {item.image && newsImages[item.image] && (
              <View style={styles.newsImageContainer}>
                <Image source={newsImages[item.image]} style={styles.newsImage} />
              </View>
            )}
            
            {item.ctaText && item.ctaLink && (
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => handleCtaPress(item.ctaLink)}
              >
                <Text style={styles.ctaButtonText}>{item.ctaText}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>最新消息</Text>
      </View>

      {/* News List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {newsData.map(renderNewsItem)}
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
  scrollView: {
    flex: 1,
  },
  newsItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  newsHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  newsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  newsDate: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  expandIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginTop: 1,
  },
  newsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  newsContentText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  newsImageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  newsImage: {
    width: 270,
    height: 200,
    resizeMode: 'cover',
  },
  ctaButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
