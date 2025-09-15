import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView 
} from 'react-native';

interface PrivacyProps {
  onBack: () => void;
}

export default function Privacy({ onBack }: PrivacyProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>隱私權政策</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dates */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>生效日期：2025年9月1日</Text>
          <Text style={styles.dateText}>最後更新：2024年9月3日</Text>
        </View>

        {/* Policy Content */}
        <View style={styles.policySection}>
          <Text style={styles.sectionTitle}>1. 政策概述</Text>
          <Text style={styles.paragraph}>
            Localite（以下簡稱「我們」或「本應用程式」）非常重視您的隱私權保護。本隱私權政策說明我們如何收集、使用、儲存和保護您的個人資訊。使用本應用程式即表示您同意本政策的內容。
          </Text>

          <Text style={styles.sectionTitle}>2. 我們收集的資訊</Text>
          
          <Text style={styles.subsectionTitle}>2.1 您主動提供的資訊</Text>
          <Text style={styles.bulletPoint}>• 帳戶資訊：註冊時提供的電子郵件地址、使用者名稱</Text>
          <Text style={styles.bulletPoint}>• 個人資料：個人偏好設定、興趣愛好</Text>
          <Text style={styles.bulletPoint}>• 內容分享：您選擇分享的旅程照片、評論和體驗</Text>
          
          <Text style={styles.subsectionTitle}>2.2 自動收集的資訊</Text>
          <Text style={styles.bulletPoint}>• 裝置資訊：裝置型號、作業系統版本、應用程式版本</Text>
          <Text style={styles.bulletPoint}>• 使用數據：應用程式使用頻率、功能使用情況、停留時間</Text>
          <Text style={styles.bulletPoint}>• 位置資訊：GPS座標、景點探索記錄（僅在您授權後收集）</Text>
          <Text style={styles.bulletPoint}>• 相機權限：QR Code掃描功能（僅在您授權後使用）</Text>
          
          <Text style={styles.subsectionTitle}>2.3 第三方來源資訊</Text>
          <Text style={styles.bulletPoint}>• 社交媒體：如果您選擇透過社交媒體帳戶登入</Text>
          <Text style={styles.bulletPoint}>• 合作夥伴：與在地商家和文化機構的合作資訊</Text>

          <Text style={styles.sectionTitle}>3. 資訊使用目的</Text>
          
          <Text style={styles.subsectionTitle}>3.1 核心服務提供</Text>
          <Text style={styles.bulletPoint}>• 提供個人化景點導覽和推薦</Text>
          <Text style={styles.bulletPoint}>• 支援QR Code掃描和景點識別</Text>
          <Text style={styles.bulletPoint}>• 啟用地圖導航和路線規劃功能</Text>
          <Text style={styles.bulletPoint}>• 提供AI導覽員互動服務</Text>
          
          <Text style={styles.subsectionTitle}>3.2 服務優化</Text>
          <Text style={styles.bulletPoint}>• 改善應用程式功能和用戶體驗</Text>
          <Text style={styles.bulletPoint}>• 分析使用模式以優化服務</Text>
          <Text style={styles.bulletPoint}>• 開發新功能和特色</Text>
          
          <Text style={styles.subsectionTitle}>3.3 個人化體驗</Text>
          <Text style={styles.bulletPoint}>• 根據您的偏好提供客製化內容</Text>
          <Text style={styles.bulletPoint}>• 推薦適合的景點和導覽路線</Text>
          <Text style={styles.bulletPoint}>• 提供個人化的學習內容和挑戰</Text>
          
          <Text style={styles.subsectionTitle}>3.4 通訊服務</Text>
          <Text style={styles.bulletPoint}>• 發送服務相關通知和更新</Text>
          <Text style={styles.bulletPoint}>• 回應您的詢問和技術支援請求</Text>
          <Text style={styles.bulletPoint}>• 提供新功能介紹和活動資訊</Text>

          <Text style={styles.sectionTitle}>4. 資訊分享與揭露</Text>
          <Text style={styles.paragraph}>4.1 我們不會出售您的個人資訊</Text>
          
          <Text style={styles.subsectionTitle}>4.2 有限度的資訊分享</Text>
          <Text style={styles.bulletPoint}>• 服務提供者：與協助我們提供服務的第三方合作</Text>
          <Text style={styles.bulletPoint}>• 法律要求：依法規要求或政府機關要求</Text>
          <Text style={styles.bulletPoint}>• 安全保護：保護我們、用戶或公眾的權利、財產或安全</Text>
          
          <Text style={styles.subsectionTitle}>4.3 匿名化數據分享</Text>
          <Text style={styles.bulletPoint}>• 我們可能分享經過匿名化處理的統計數據</Text>
          <Text style={styles.bulletPoint}>• 這些數據不會包含可識別個人身份的資訊</Text>

          <Text style={styles.sectionTitle}>5. 資料安全與保護</Text>
          
          <Text style={styles.subsectionTitle}>5.1 技術保護措施</Text>
          <Text style={styles.bulletPoint}>• 使用加密技術保護資料傳輸和儲存</Text>
          <Text style={styles.bulletPoint}>• 實施適當的存取控制和安全措施</Text>
          <Text style={styles.bulletPoint}>• 定期更新安全協議和技術</Text>
          
          <Text style={styles.subsectionTitle}>5.2 資料儲存</Text>
          <Text style={styles.bulletPoint}>• 您的個人資料儲存在安全的雲端伺服器</Text>
          <Text style={styles.bulletPoint}>• 實施資料備份和災難復原計畫</Text>
          <Text style={styles.bulletPoint}>• 定期審查和更新安全措施</Text>

          <Text style={styles.sectionTitle}>6. 您的權利與選擇</Text>
          
          <Text style={styles.subsectionTitle}>6.1 存取與更新</Text>
          <Text style={styles.bulletPoint}>• 您可以檢視和更新您的個人資料</Text>
          <Text style={styles.bulletPoint}>• 透過應用程式設定或聯繫我們進行資料管理</Text>
          
          <Text style={styles.subsectionTitle}>6.2 資料刪除</Text>
          <Text style={styles.bulletPoint}>• 您可以在個人檔案內直接刪除您的帳戶和相關資料</Text>

          <Text style={styles.sectionTitle}>7. 位置服務與權限</Text>
          
          <Text style={styles.subsectionTitle}>7.1 位置權限</Text>
          <Text style={styles.bulletPoint}>• 本應用程式需要位置權限以提供地圖導覽服務</Text>
          <Text style={styles.bulletPoint}>• 您可以隨時在裝置設定中停用位置權限</Text>
          <Text style={styles.bulletPoint}>• 停用位置權限可能影響部分功能的使用</Text>
          
          <Text style={styles.subsectionTitle}>7.2 相機權限</Text>
          <Text style={styles.bulletPoint}>• QR Code掃描功能需要相機權限</Text>
          <Text style={styles.bulletPoint}>• 我們不會儲存或上傳您拍攝的照片</Text>
          <Text style={styles.bulletPoint}>• 相機權限僅用於即時掃描和識別</Text>

          <Text style={styles.sectionTitle}>8. 兒童隱私保護</Text>
          
          <Text style={styles.subsectionTitle}>8.1 年齡限制</Text>
          <Text style={styles.bulletPoint}>• 本應用程式不針對13歲以下兒童設計</Text>
          <Text style={styles.bulletPoint}>• 我們不會故意收集13歲以下兒童的個人資訊</Text>
          
          <Text style={styles.subsectionTitle}>8.2 家長監護</Text>
          <Text style={styles.bulletPoint}>• 如果您是家長且發現孩子提供了個人資訊，請聯繫我們，我們將立即刪除相關資訊</Text>

          <Text style={styles.sectionTitle}>9. 國際資料傳輸</Text>
          
          <Text style={styles.subsectionTitle}>9.1 資料傳輸</Text>
          <Text style={styles.bulletPoint}>• 您的資料可能在台灣境內或境外處理</Text>
          <Text style={styles.bulletPoint}>• 我們確保所有資料傳輸都符合適用的隱私法規</Text>
          
          <Text style={styles.subsectionTitle}>9.2 資料保護標準</Text>
          <Text style={styles.bulletPoint}>• 我們要求所有服務提供者遵守相同的隱私保護標準</Text>
          <Text style={styles.bulletPoint}>• 實施適當的資料傳輸協議</Text>

          <Text style={styles.sectionTitle}>10. 應用程式追蹤與分析</Text>
          
          <Text style={styles.subsectionTitle}>10.1 使用分析</Text>
          <Text style={styles.bulletPoint}>• 我們使用應用程式分析工具來了解使用模式和改善服務</Text>
          <Text style={styles.bulletPoint}>• 這些工具收集匿名化的使用數據，不會識別個人身份</Text>
          <Text style={styles.bulletPoint}>• 分析數據用於優化應用程式功能和用戶體驗</Text>
          
          <Text style={styles.subsectionTitle}>10.2 裝置識別</Text>
          <Text style={styles.bulletPoint}>• 應用程式可能使用裝置識別碼來提供個人化服務</Text>
          <Text style={styles.bulletPoint}>• 這些識別碼僅用於技術目的，不會與第三方分享</Text>
          <Text style={styles.bulletPoint}>• 您可以選擇重置裝置識別碼或停用相關功能</Text>
          
          <Text style={styles.subsectionTitle}>10.3 第三方分析服務</Text>
          <Text style={styles.bulletPoint}>• 我們可能使用第三方分析服務（如 Firebase Analytics）</Text>
          <Text style={styles.bulletPoint}>• 這些服務有自己的隱私權政策</Text>
          <Text style={styles.bulletPoint}>• 我們確保所有第三方服務都符合隱私保護標準</Text>

          <Text style={styles.sectionTitle}>11. 第三方服務</Text>
          
          <Text style={styles.subsectionTitle}>11.1 第三方整合</Text>
          <Text style={styles.bulletPoint}>• 本應用程式可能整合第三方服務（如地圖服務、社交媒體）</Text>
          <Text style={styles.bulletPoint}>• 這些服務有自己的隱私權政策</Text>
          
          <Text style={styles.subsectionTitle}>11.2 建議</Text>
          <Text style={styles.bulletPoint}>• 我們建議您檢視所有第三方服務的隱私權政策</Text>
          <Text style={styles.bulletPoint}>• 我們對第三方服務的隱私做法不承擔責任</Text>

          <Text style={styles.sectionTitle}>12. 政策更新</Text>
          
          <Text style={styles.subsectionTitle}>12.1 更新通知</Text>
          <Text style={styles.bulletPoint}>• 我們會更新本隱私權政策</Text>
          <Text style={styles.bulletPoint}>• 重大變更將透過應用程式內的最新消息通知</Text>
          
          <Text style={styles.subsectionTitle}>12.2 持續使用</Text>
          <Text style={styles.bulletPoint}>• 繼續使用應用程式即表示您同意更新後的政策</Text>
          <Text style={styles.bulletPoint}>• 我們建議您定期檢視本政策</Text>

          <Text style={styles.sectionTitle}>13. 聯絡我們</Text>
          <Text style={styles.paragraph}>
            如果您對本隱私權政策有任何疑問、意見或建議，請透過以下方式聯繫我們：
          </Text>
          <Text style={styles.contactInfo}>電子郵件：hello@localite.ai</Text>

          <Text style={styles.sectionTitle}>14. 法律適用</Text>
          <Text style={styles.paragraph}>
            本隱私權政策適用於台灣法律，並受台灣法院管轄。如有任何爭議，將優先適用台灣法律。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 20,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  policySection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  subsectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactInfo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
