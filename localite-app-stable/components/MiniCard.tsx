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
}) => (
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    height: 100,
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: 100,
  },
  icon: {
    height: 40,
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MiniCard; 