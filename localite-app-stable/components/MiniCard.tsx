import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// 定義 MiniCard 的 Props 介面
interface MiniCardProps {
  // 基本資訊
  title: string;
  icon: any; // React Native 的圖片資源類型
  
  // 事件處理
  onPress?: () => void;
  
  // 樣式自訂
  containerStyle?: object;
  iconStyle?: object;
  textStyle?: object;
}

const MiniCard: React.FC<MiniCardProps> = ({
  title,
  icon,
  onPress,
  containerStyle,
  iconStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* 圖示區域 */}
      <View style={styles.iconContainer}>
        <Image 
          source={icon} 
          style={[styles.icon, iconStyle]}
          resizeMode="contain"
        />
      </View>
      
      {/* 標題區域 */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, textStyle]} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MiniCard; 