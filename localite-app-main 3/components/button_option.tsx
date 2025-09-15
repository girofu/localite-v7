import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// 定義 ButtonOption 的 Props 介面
interface ButtonOptionProps {
  // 基本資訊
  title: string;
  
  // 事件處理
  onPress?: () => void;
  
  // 樣式自訂
  containerStyle?: object;
  textStyle?: object;
  
  // 狀態
  disabled?: boolean;
}

const ButtonOption: React.FC<ButtonOptionProps> = ({
  title,
  onPress,
  containerStyle,
  textStyle,
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
      <Text style={[styles.text, textStyle]}>
        {title}
      </Text>
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

export default ButtonOption; 