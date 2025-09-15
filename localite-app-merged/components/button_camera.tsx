import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';

// 定義 ButtonCamera 的 Props 介面
interface ButtonCameraProps {
  // 基本資訊
  title: string;
  
  // 事件處理
  onPress?: () => void;
  
  // 樣式自訂
  containerStyle?: object;
  textStyle?: object;
  iconStyle?: object;
  
  // 狀態
  disabled?: boolean;
}

const ButtonCamera: React.FC<ButtonCameraProps> = ({
  title,
  onPress,
  containerStyle,
  textStyle,
  iconStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        containerStyle,
        disabled && styles.disabled
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.contentContainer}>
        <Image 
          source={require('../assets/icons/icon_camera.png')} 
          style={[styles.icon, iconStyle]}
          resizeMode="contain"
        />
        <Text style={[styles.text, textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
    borderColor: '#666',
  },
});

export default ButtonCamera; 