import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/contexts/AuthContext';

interface ProfileScreenProps {
  onBack?: () => void;
  onLogout?: () => void;
  onUpgradeSubscription?: () => void;
  onDeleteAccount?: () => void;
}

export default function ProfileScreen({ 
  onBack, 
  onLogout, 
  onUpgradeSubscription, 
  onDeleteAccount 
}: ProfileScreenProps) {
  // 🔥 使用實際認證狀態，而非硬編碼
  const { user, signOut } = useAuth();
  const userEmail = user?.email || '';
  const emailPrefix = userEmail.split('@')[0]; // 提取 @ 前的部分
  
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(emailPrefix || '訪客');
  const [tempName, setTempName] = useState(displayName);

  // 🔥 當用戶狀態變化時更新顯示名稱
  useEffect(() => {
    const newDisplayName = emailPrefix || '訪客';
    setDisplayName(newDisplayName);
    setTempName(newDisplayName);
  }, [emailPrefix]);

  // 🔥 處理登出功能
  const handleLogout = async () => {
    try {
      await signOut(); // 調用認證系統的登出
      onLogout?.(); // 調用 parent component 的回調
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('登出失敗', '請稍後再試');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('權限被拒絕', '需要相簿權限才能選擇頭像');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('錯誤', '選擇圖片時發生錯誤');
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTempName(displayName);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setDisplayName(tempName.trim());
      setIsEditingName(false);
    } else {
      Alert.alert('錯誤', '姓名不能為空');
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setTempName(displayName);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '確認刪除帳號',
      '此操作無法復原，確定要刪除您的帳號嗎？',
      [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: onDeleteAccount }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Image 
            source={require('../assets/icons/icon_angle-left.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人檔案</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Profile Details Container */}
        <View style={styles.profileContainer}>
          {/* Avatar Selection */}
          <View style={styles.profileRow}>
            <View style={styles.rowLeft}>
              <Image 
                source={require('../assets/icons/icon_profile.png')} 
                style={styles.rowIcon} 
              />
              <Text style={styles.rowLabel}>選擇頭像</Text>
            </View>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Image 
                    source={require('../assets/icons/icon_user.png')} 
                    style={styles.defaultAvatarIcon} 
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.profileRow}>
            <View style={styles.rowLeft}>
              <Image 
                source={require('../assets/icons/icon_mail.png')} 
                style={styles.rowIcon} 
              />
              <Text style={styles.rowLabel}>電子郵件</Text>
            </View>
            <Text style={styles.emailText}>
              {userEmail || '請先登入您的帳號'}
            </Text>
          </View>

          {/* Name/Nickname */}
          <View style={styles.profileRow}>
            <View style={styles.rowLeft}>
              <Image 
                source={require('../assets/icons/icon_user.png')} 
                style={styles.rowIcon} 
              />
              <Text style={styles.rowLabel}>姓名/匿稱</Text>
            </View>
            {isEditingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="輸入姓名"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleNameSave}>
                    <Text style={styles.saveButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleNameCancel}>
                    <Text style={styles.cancelButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.nameContainer} onPress={handleNameEdit}>
                <Text style={styles.nameText}>{displayName}</Text>
                <Image 
                  source={require('../assets/icons/icon_edit.png')} 
                  style={styles.editIcon} 
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Subscription Plan */}
          <View style={styles.profileRow}>
            <View style={styles.rowLeft}>
              <Image 
                source={require('../assets/icons/icon_hand.png')} 
                style={styles.rowIcon} 
              />
              <Text style={styles.rowLabel}>訂閱方案</Text>
            </View>
            <Text style={styles.subscriptionText}>免費遊覽方案</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.upgradeButton} 
          onPress={onUpgradeSubscription}
          activeOpacity={0.8}
        >
          <Image 
            source={require('../assets/icons/icon_sparkles.png')} 
            style={styles.upgradeIcon} 
          />
          <Text style={styles.upgradeButtonText}>昇級訂閱方案</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>刪除個人帳號</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <View style={styles.logoutDivider} />
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Image 
            source={require('../assets/icons/icon_logout.png')} 
            style={styles.logoutIcon} 
          />
          <Text style={styles.logoutText}>登出</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarIcon: {
    width: 30,
    height: 30,
    tintColor: '#999',
  },
  emailText: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '400',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
    marginRight: 8,
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#999',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 120,
  },
  editButtons: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
  },
  upgradeButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  upgradeIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    marginRight: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    width: '100%',
    marginTop: 20,
  },
  logoutDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
