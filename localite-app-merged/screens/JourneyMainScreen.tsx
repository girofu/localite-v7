import React, { useState, ReactElement } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { useJourney } from '../contexts/JourneyContext';
import { ScreenType } from '../src/types/navigation.types';

interface JourneyMainScreenProps {
  onClose: () => void;
  onNavigate: (screen: ScreenType, params?: any) => void;
  isLoggedIn?: boolean;
  verificationState?: string;
}

export default function JourneyMainScreen({ 
  onClose, 
  onNavigate,
  isLoggedIn = false,
  verificationState = 'pending_verification'
}: JourneyMainScreenProps) {
  
  const { getJourneyRecordsByDate, hasJourneyRecord, deleteJourneyRecord, loading, error, refreshJourneyRecords, journeyRecords } = useJourney();
  
  // 日曆相關狀態
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const isVerified = verificationState === 'verified';
  
  // 日曆相關常量和函數
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const currentDay = selectedDate.getDate();
  
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];
  
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // 格式化日期為 YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 獲取選定日期的旅程記錄
  const selectedDateString = formatDate(selectedDate);
  const selectedDateJourneys = getJourneyRecordsByDate(selectedDateString);
  
  // 調試資訊
  console.log('📅 JourneyMainScreen state:', {
    selectedDate: selectedDate.toISOString(),
    selectedDateString,
    totalJourneyRecords: journeyRecords?.length || 0,
    selectedDateJourneys: selectedDateJourneys?.length || 0,
    loading,
    error,
    isVerified
  });

  // 生成當前月份的日期
  const generateMonthDates = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const dates = [];
    
    // 添加前面的空位
    for (let i = 0; i < startDay; i++) {
      dates.push(null);
    }
    
    // 添加日期
    for (let i = 1; i <= totalDays; i++) {
      dates.push(i);
    }
    
    // 確保總共有 7 的倍數個項目，以便完整顯示
    const totalCells = dates.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      dates.push(null);
    }
    
    return dates;
  };

  const monthDates = generateMonthDates();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  const handleDateSelect = (date: number | null) => {
    if (date !== null) {
      const newDate = new Date(selectedDate);
      newDate.setDate(date);
      setSelectedDate(newDate);
    }
  };

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearPicker(false);
  };

  const renderCalendar = (): ReactElement[] => {
    const rows: ReactElement[] = [];
    let currentRow: ReactElement[] = [];
    
    monthDates.forEach((date, index) => {
      const isCurrentMonth = selectedDate.getMonth() === currentMonth;
      const isCurrentYear = selectedDate.getFullYear() === currentYear;
      const isToday = isCurrentMonth && isCurrentYear && date === currentDay;
      const isSelected = selectedDate.getDate() === date;
      
      // 檢查該日期是否有旅程記錄
      let hasJourney = false;
      if (date !== null && isCurrentMonth && isCurrentYear) {
        const checkDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date);
        hasJourney = hasJourneyRecord(formatDate(checkDate));
      }
      
      currentRow.push(
        <View key={index} style={styles.calendarCell}>
          {date !== null ? (
            <TouchableOpacity
              style={[
                styles.dateButton,
                isToday && styles.todayDate,
                isSelected && styles.selectedDate,
                hasJourney && styles.journeyDate
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[
                styles.dateText,
                isToday && styles.todayDateText,
                isSelected && styles.selectedDateText
              ]}>
                {date}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCell} />
          )}
        </View>
      );
      
      if (currentRow.length === 7) {
        rows.push(
          <View key={`row-${rows.length}`} style={styles.calendarRow}>
            {currentRow}
          </View>
        );
        currentRow = [];
      }
    });
    
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => {
            console.log('漢堡圖示被點擊');
            onNavigate('drawerNavigation');
          }}
        >
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>旅程紀錄</Text>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {!isLoggedIn ? (
        // 未登入狀態
        <View style={styles.contentContainer}>
          {/* Lock Icon */}
          <View style={styles.lockIconContainer}>
            <Image 
              source={require('../assets/icons/icon_lockman.png')} 
              style={styles.lockIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* Login Message */}
          <View style={styles.messageContainer}>
            <View style={styles.messageRow}>
              <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
              <Text style={styles.loginMessage}>登入 Localite 帳號查看你的旅程</Text>
            </View>
          </View>
          
          {/* Call to Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => onNavigate('login')}
            >
              <Text style={styles.loginButtonText}>登入</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => onNavigate('guide')}
            >
              <Text style={styles.exploreButtonText}>探索更多地點</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : !isVerified ? (
        // 已登入但未驗證狀態
        <View style={styles.contentContainer}>
          {/* Verification Required Icon */}
          <View style={styles.lockIconContainer}>
            <Image 
              source={require('../assets/icons/icon_lockman.png')} 
              style={styles.lockIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* Verification Message */}
          <View style={styles.messageContainer}>
            <View style={styles.messageRow}>
              <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
              <Text style={styles.verificationMessage}>請驗證您的信箱以查看旅程紀錄</Text>
            </View>
            <Text style={styles.verificationSubMessage}>
              驗證後即可儲存和查看您的專屬旅程
            </Text>
          </View>
          
          {/* Call to Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.verificationButton}
              onPress={() => onNavigate('profile')}
            >
              <Text style={styles.verificationButtonText}>前往驗證</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => onNavigate('guide')}
            >
              <Text style={styles.exploreButtonText}>探索更多地點</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // 已登入且已驗證狀態 - 顯示完整日曆和旅程內容
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* 錯誤狀態 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>載入失敗: {error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={refreshJourneyRecords}
              >
                <Text style={styles.retryButtonText}>重試</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 載入指示器 */}
          {loading && !error && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>載入旅程記錄中...</Text>
            </View>
          )}
          {/* Calendar Title */}
          <View style={styles.calendarTitleContainer}>
            <TouchableOpacity 
              style={styles.yearSelector}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.yearText}>{currentYear}</Text>
              <Text style={styles.chevronText}>⌵</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.monthSelector}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.monthText}>{months[currentMonth]}</Text>
              <Text style={styles.chevronText}>⌵</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            {/* Week Days Header */}
            <View style={styles.weekDaysHeader}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>
            
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>

        {/* Today's Exploration Locations */}
        <View style={styles.explorationSection}>
          <View style={styles.explorationTitleContainer}>
            <Text style={styles.explorationTitle}>本日探索地點</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditMode(!editMode)}
            >
              <Image source={require('../assets/icons/icon_filedit.png')} style={styles.editIcon} />
              <Text style={styles.editText}>編輯</Text>
            </TouchableOpacity>
          </View>
          
          {/* Debug 訊息已移除 - 功能穩定後不再需要 */}
          {loading ? (
            <View style={styles.explorationBox}>
              <Text style={styles.noRecordText}>正在載入旅程記錄...</Text>
            </View>
          ) : error ? (
            <View style={styles.explorationBox}>
              <Text style={[styles.noRecordText, { color: '#ff6b6b' }]}>載入失敗：{error}</Text>
              <TouchableOpacity 
                style={styles.exploreMoreButton}
                onPress={refreshJourneyRecords}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreMoreButtonText}>重試</Text>
              </TouchableOpacity>
            </View>
          ) : selectedDateJourneys.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.journeyCardsContainer}
              contentContainerStyle={styles.journeyCardsContent}
            >
                {selectedDateJourneys.map((journey: any, index: number) => (
                  <View key={journey.id} style={styles.journeyCardWrapper}>
                    <TouchableOpacity
                      style={styles.journeyCard}
                      onPress={() => !editMode && onNavigate('journeyDetail', journey)}
                    >
                      <Image 
                        source={journey.photos[0] ? { uri: journey.photos[0] } : require('../assets/places/shinfang.png')} 
                        style={styles.journeyCardImage} 
                      />
                      <Text style={styles.journeyCardTitle}>{journey.title}</Text>
                      <View style={styles.timeRangeContainer}>
                        <Image source={require('../assets/icons/icon_clock.png')} style={styles.clockIcon} />
                        <Text style={styles.timeRangeText}>
                          {journey.timeRange.start}-{journey.timeRange.end}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {editMode && (
                      <View style={styles.editControls}>
                        <TouchableOpacity 
                          style={styles.keepButton}
                          onPress={() => setEditMode(false)}
                        >
                          <Text style={styles.keepButtonText}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={async () => {
                            try {
                              await deleteJourneyRecord(journey.id);
                            } catch (error) {
                              console.error('刪除旅程記錄失敗:', error);
                            }
                          }}
                        >
                          <Text style={styles.deleteButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.explorationBox}>
                <Text style={styles.noRecordText}>本日無旅程記錄</Text>
                <TouchableOpacity 
                  style={styles.exploreMoreButton}
                  onPress={() => onNavigate('guide')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exploreMoreButtonText}>探索更多地點</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
      )}
      
      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    year === currentYear && styles.pickerItemSelected
                  ]}
                  onPress={() => handleYearChange(year)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    year === currentYear && styles.pickerItemTextSelected
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerItem,
                    index === currentMonth && styles.pickerItemSelected
                  ]}
                  onPress={() => handleMonthChange(index)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    index === currentMonth && styles.pickerItemTextSelected
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockIcon: {
    width: 120,
    height: 120,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparklesIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#10B981',
  },
  loginMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  verificationMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  verificationSubMessage: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  // 錯誤和載入狀態樣式
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  // Calendar 相關樣式
  calendarTitleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 8,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  chevronText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 4,
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarGrid: {
    // 日曆網格樣式
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDate: {
    backgroundColor: '#4A90E2', // 藍色背景表示今天
  },
  selectedDate: {
    backgroundColor: '#FFD700', // 黃色背景表示選中
  },
  journeyDate: {
    backgroundColor: '#FFC5C5', // 淺粉色背景表示有旅程記錄
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  todayDateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#000000', // 選中日期使用黑色文字
    fontWeight: 'bold',
  },
  emptyCell: {
    width: 40,
    height: 40,
  },
  explorationSection: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  explorationTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  explorationTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginRight: 4,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  explorationBox: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  noRecordText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreMoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  exploreMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#333333',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#4A90E2',
  },
  pickerItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Journey Cards Styles
  journeyCardsContainer: {
    width: '100%',
  },
  journeyCardsContent: {
    paddingHorizontal: 16,
    paddingRight: 32, // 增加右側間距，讓最後一張卡片也能完整顯示
  },
  journeyCardWrapper: {
    position: 'relative',
    marginRight: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  journeyCard: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  keepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  keepButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  journeyCardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  journeyCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232323',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginBottom: 20, // 增加底部間距
  },
  clockIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFFFFF',
    marginRight: 6,
  },
  timeRangeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});