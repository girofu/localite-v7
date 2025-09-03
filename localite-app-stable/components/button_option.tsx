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
}) => (
    <TouchableOpacity 
      style={[
        styles.container, 
        containerStyle,
        disabled && styles.disabled,
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  disabled: {
    borderColor: '#666',
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default ButtonOption; 