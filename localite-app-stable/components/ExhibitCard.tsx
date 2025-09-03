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
        disabled && styles.disabled,
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
    elevation: 4,
    height: 230,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 180,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  description: {
    color: '#666',
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    height: 120,
    overflow: 'hidden',
  },
  title: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default ExhibitCard; 