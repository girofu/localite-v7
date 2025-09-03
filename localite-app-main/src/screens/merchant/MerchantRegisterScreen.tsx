import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MerchantStackParamList } from '../../types/navigation.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/FirestoreService';
import { CreateMerchantData } from '../../types/firestore.types';

const firestoreService = new FirestoreService();

export default function MerchantRegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<MerchantStackParamList>>();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    businessType: 'restaurant' as const,
    phone: '',
    address: '',
    city: '',
    country: '台灣',
    postalCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const businessTypes = [
    { value: 'restaurant', label: '餐廳' },
    { value: 'hotel', label: '飯店' },
    { value: 'attraction', label: '景點' },
    { value: 'tour_operator', label: '旅遊業者' },
    { value: 'retail', label: '零售店' },
    { value: 'other', label: '其他' },
  ];

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('錯誤', '請先登入');
      return;
    }

    if (!formData.businessName.trim()) {
      Alert.alert('錯誤', '請輸入商戶名稱');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('錯誤', '請輸入聯絡電話');
      return;
    }

    setIsLoading(true);

    try {
      const merchantData: CreateMerchantData = {
        uid: user.uid,
        email: user.email || '',
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        businessType: formData.businessType,
        contactInfo: {
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            country: formData.country,
            postalCode: formData.postalCode,
          },
        },
      };

      await firestoreService.createMerchant(merchantData);
      
      Alert.alert(
        '註冊成功',
        '商戶帳號已成功建立，等待管理員審核',
        [
          {
            text: '確定',
            onPress: () => {
              // 導航到商戶主頁面或待審核頁面
              navigation.navigate('MerchantDashboard');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Merchant registration error:', error);
      Alert.alert('註冊失敗', '請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>商戶註冊</Text>
          <Text style={styles.subtitle}>加入在地人導覽平台，開始推廣您的業務</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>商戶名稱 *</Text>
            <TextInput
              style={styles.input}
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
              placeholder="請輸入商戶或企業名稱"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>業務類型 *</Text>
            <View style={styles.businessTypeContainer}>
              {businessTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.businessTypeButton,
                    formData.businessType === type.value && styles.businessTypeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, businessType: type.value as any })}
                >
                  <Text
                    style={[
                      styles.businessTypeText,
                      formData.businessType === type.value && styles.businessTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>業務描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.businessDescription}
              onChangeText={(text) => setFormData({ ...formData, businessDescription: text })}
              placeholder="簡單描述您的業務特色"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>聯絡電話 *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="請輸入聯絡電話"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>地址</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="請輸入詳細地址"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>城市</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="台北市"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>郵政編碼</Text>
              <TextInput
                style={styles.input}
                value={formData.postalCode}
                onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                placeholder="10001"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? '註冊中...' : '提交註冊申請'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
  },
  businessTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  businessTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  businessTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  businessTypeText: {
    fontSize: 14,
    color: '#666',
  },
  businessTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
