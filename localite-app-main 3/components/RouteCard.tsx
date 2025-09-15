import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// 定義 RouteCard 的 Props 介面
interface RouteCardProps {
  // 基本資訊
  title: string;
  description: string;
  image: any; // React Native 的圖片資源類型
  
  // 學習單路線標籤
  worksheetRoutes?: string[];
  
  // 事件處理
  onPress?: () => void;
  onSelect?: () => void;
  
  // 樣式自訂
  containerStyle?: object;
  imageStyle?: object;
}

const RouteCard: React.FC<RouteCardProps> = ({
  title,
  description,
  image,
  worksheetRoutes = [],
  onPress,
  onSelect,
  containerStyle,
  imageStyle,
}) => {
  const handlePress = () => {
    if (onSelect) {
      onSelect();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* 圖片區域 */}
      <View style={styles.imageContainer}>
        <Image 
          source={image} 
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      </View>
      
      {/* 內容區域 */}
      <View style={styles.contentContainer}>
        {/* 標題 */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {/* 描述 */}
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
        
        {/* 學習單路線標籤 */}
        {worksheetRoutes.length > 0 && (
          <View style={styles.worksheetSection}>
            <Text style={styles.worksheetLabel}>
              指定學習單路線:
            </Text>
            <View style={styles.worksheetTags}>
              {worksheetRoutes.map((route, index) => (
                <View key={index} style={styles.worksheetTag}>
                  <Text style={styles.worksheetTagText}>
                    {route}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 16,
    marginTop: 8,
    width: 180,
    height: 280,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#232323',
    marginBottom: 6,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  worksheetSection: {
    marginTop: 6,
  },
  worksheetLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  worksheetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  worksheetTag: {
    backgroundColor: '#232323',
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  worksheetTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '500',
  },
});

export default RouteCard; 