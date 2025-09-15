import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// 定義 ExhibitCard 的 Props 介面
interface ExhibitCardProps {
  // 基本資訊
  title: string;
  description: string;
  image: any;
  
  // 事件處理
  onPress?: () => void;
  onSelect?: () => void;
  
  // 樣式自訂
  containerStyle?: object;
  imageStyle?: object;
  titleStyle?: object;
  descriptionStyle?: object;
  
  // 狀態
  disabled?: boolean;
}

const ExhibitCard: React.FC<ExhibitCardProps> = ({
  title,
  description,
  image,
  onPress,
  onSelect,
  containerStyle,
  imageStyle,
  titleStyle,
  descriptionStyle,
  disabled = false,
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
      style={[
        styles.container, 
        containerStyle,
        disabled && styles.disabled
      ]} 
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
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
        <Text style={[styles.title, titleStyle]}>
          {title}
        </Text>
        
        {/* 描述 */}
        <Text style={[styles.description, descriptionStyle]} numberOfLines={3}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    width: 180,
    height: 230,
    overflow: 'hidden',
  },
  imageContainer: {
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
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ExhibitCard; 