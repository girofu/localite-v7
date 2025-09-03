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
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/FirestoreService';
import { FirebaseStorageService } from '../../services/FirebaseStorageService';
import { CreatePlaceData } from '../../types/firestore.types';
import { UploadFileData } from '../../types/storage.types';

const firestoreService = new FirestoreService();
const storageService = new FirebaseStorageService();

interface ImageAsset {
  uri: string;
  fileName?: string;
  type?: string;
}

export default function AddPlaceScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'restaurant' as const,
    tags: '',
    street: '',
    city: '',
    country: '台灣',
    postalCode: '',
    latitude: '',
    longitude: '',
    isPublic: true,
  });

  const [images, setImages] = useState<ImageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'restaurant', label: '餐廳' },
    { value: 'attraction', label: '景點' },
    { value: 'hotel', label: '飯店' },
    { value: 'shopping', label: '購物' },
    { value: 'landmark', label: '地標' },
    { value: 'entertainment', label: '娛樂' },
    { value: 'transport', label: '交通' },
    { value: 'food', label: '美食' },
    { value: 'other', label: '其他' },
  ];

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '需要存取相冊權限來上傳圖片');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
        }));
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('錯誤', '選擇圖片時發生錯誤');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '需要相機權限來拍攝照片');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const newImage = {
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
        };
        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('錯誤', '拍攝照片時發生錯誤');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const showImagePicker = () => {
    Alert.alert(
      '選擇圖片',
      '請選擇圖片來源',
      [
        { text: '取消', style: 'cancel' },
        { text: '相機', onPress: takePhoto },
        { text: '相冊', onPress: pickImage },
      ]
    );
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadPromises = images.map(async (image, index) => {
      const fileName = `place_${Date.now()}_${index}.jpg`;
      
      // 創建 File 對象（React Native 環境中需要特殊處理）
      const response = await fetch(image.uri);
      const blob = await response.blob();
      
      const uploadData: UploadFileData = {
        file: blob,
        filename: fileName,
        userId: user?.uid || '',
        folder: 'places',
        isPublic: true,
        metadata: {
          contentType: 'image/jpeg',
          customMetadata: {
            uploadedBy: user?.email || '',
            uploadedAt: new Date().toISOString(),
          }
        }
      };
      
      const uploadResult = await storageService.uploadImage(uploadData);
      return uploadResult.originalUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('錯誤', '請先登入');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('錯誤', '請輸入地點名稱');
      return;
    }

    setIsLoading(true);

    try {
      // 上傳圖片
      const imageUrls = await uploadImages();

      // 處理標籤
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 處理位置資訊
      const location: any = {
        street: formData.street,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
      };

      if (formData.latitude && formData.longitude) {
        location.coordinates = {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        };
      }

      const placeData: CreatePlaceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags,
        images: imageUrls,
        location,
        merchantId: user.uid,
        isPublic: formData.isPublic,
        isActive: true,
      };

      await firestoreService.createPlace(placeData);
      
      Alert.alert(
        '新增成功',
        '地點已成功建立',
        [
          {
            text: '確定',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating place:', error);
      Alert.alert('新增失敗', '請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const renderImage = ({ item, index }: { item: ImageAsset; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Text style={styles.removeImageText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>新增地點</Text>
          <Text style={styles.subtitle}>分享您的推薦地點給遊客</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>地點名稱 *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="請輸入地點名稱"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>類別 *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryButton,
                    formData.category === category.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.value as any })}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === category.value && styles.categoryTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>地點描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="描述這個地點的特色和亮點"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>標籤</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
              placeholder="用逗號分隔，例如：台灣料理,平價,適合家庭"
              placeholderTextColor="#999"
            />
          </View>

          {/* 圖片上傳區域 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>地點圖片</Text>
            <TouchableOpacity style={styles.addImageButton} onPress={showImagePicker}>
              <Text style={styles.addImageText}>+ 新增圖片</Text>
            </TouchableOpacity>
            
            {images.length > 0 && (
              <FlatList
                data={images}
                renderItem={renderImage}
                keyExtractor={(item, index) => `image-${index}`}
                horizontal
                style={styles.imageList}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          {/* 地址資訊 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>地址資訊</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>詳細地址</Text>
            <TextInput
              style={styles.input}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
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

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>緯度</Text>
              <TextInput
                style={styles.input}
                value={formData.latitude}
                onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                placeholder="25.0330"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>經度</Text>
              <TextInput
                style={styles.input}
                value={formData.longitude}
                onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                placeholder="121.5654"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* 發布設定 */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.switchContainer}
              onPress={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            >
              <Text style={styles.switchLabel}>公開顯示</Text>
              <View style={[styles.switch, formData.isPublic && styles.switchActive]}>
                <View style={[styles.switchThumb, formData.isPublic && styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>
            <Text style={styles.switchDescription}>
              開啟後，此地點會在應用中公開顯示給所有用戶
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? '建立中...' : '建立地點'}
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
    height: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addImageButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  addImageText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageList: {
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#007AFF',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
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
