import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { FirestoreService } from '../src/services/FirestoreService';
import { useAuth } from '../src/contexts/AuthContext';
import { SavedJourneyRecord } from '../src/types/journey.types';

interface JourneyMainScreenProps {
  onClose: () => void;
  onNavigate: (screen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation') => void;
  newJourneyId?: string;
}

export default function JourneyMainScreen({ onClose, onNavigate, newJourneyId }: JourneyMainScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [journeyRecords, setJourneyRecords] = useState<SavedJourneyRecord[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [showNewJourneyHighlight, setShowNewJourneyHighlight] = useState(false);
  
  const { user } = useAuth();
  const [firestoreService] = useState(() => new FirestoreService());
  
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const currentDay = selectedDate.getDate();
  
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];
  
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // 載入用戶的旅程記錄
  useEffect(() => {
    loadJourneyRecords();
  }, [user]);

  // 處理新旅程高亮顯示
  useEffect(() => {
    if (newJourneyId) {
      setShowNewJourneyHighlight(true);
      // 3秒後移除高亮
      const timer = setTimeout(() => {
        setShowNewJourneyHighlight(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [newJourneyId]);

  const loadJourneyRecords = async () => {
    if (!user?.uid) {
      setJourneyRecords([]);
      return;
    }

    try {
      setLoadingJourneys(true);
      const records = await firestoreService.getUserJourneyRecords(user.uid, { limit: 50 });
      setJourneyRecords(records);
      console.log('✅ 載入旅程記錄成功:', records.length);
    } catch (error) {
      console.error('❌ 載入旅程記錄失敗:', error);
      setJourneyRecords([]);
    } finally {
      setLoadingJourneys(false);
    }
  };

  // 獲取指定日期的旅程記錄
  const getJourneysForDate = (date: Date) => {
    return journeyRecords.filter(journey => {
      const journeyDate = new Date(journey.createdAt);
      return journeyDate.getFullYear() === date.getFullYear() &&
             journeyDate.getMonth() === date.getMonth() &&
             journeyDate.getDate() === date.getDate();
    });
  };

  // 檢查指定日期是否有旅程記錄
  const hasJourneysOnDate = (date: Date) => {
    return getJourneysForDate(date).length > 0;
  };

  // 檢查是否為新建立的旅程記錄日期
  const isNewJourneyDate = (date: Date) => {
    if (!newJourneyId) return false;
    
    const newJourney = journeyRecords.find(j => j.id === newJourneyId);
    if (!newJourney) return false;
    
    const journeyDate = new Date(newJourney.createdAt);
    return journeyDate.getFullYear() === date.getFullYear() &&
           journeyDate.getMonth() === date.getMonth() &&
           journeyDate.getDate() === date.getDate();
  };

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

  // 渲染旅程記錄
  const renderJourneyRecords = () => {
    if (loadingJourneys) {
      return (
        <View style={styles.explorationBox}>
          <Text style={styles.noRecordText}>載入中...</Text>
        </View>
      );
    }

    const dateJourneys = getJourneysForDate(selectedDate);
    
    if (dateJourneys.length === 0) {
      return (
        <View style={styles.explorationBox}>
          <Text style={styles.noRecordText}>本日無旅程記錄</Text>
        </View>
      );
    }

    return (
      <View style={styles.journeyListContainer}>
        {dateJourneys.map((journey, index) => (
          <TouchableOpacity
            key={journey.id}
            style={[
              styles.journeyCard,
              journey.id === newJourneyId && showNewJourneyHighlight && styles.newJourneyCard
            ]}
            onPress={() => onNavigate('journeyDetail', { journeyId: journey.id })}
          >
            <View style={styles.journeyHeader}>
              <Text style={styles.journeyTitle}>{journey.title}</Text>
              <Text style={styles.journeyTime}>
                {new Date(journey.createdAt).toLocaleTimeString('zh-TW', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            <Text style={styles.journeyPlace}>{journey.placeName} · {journey.guideName}</Text>
            <Text style={styles.journeySummary} numberOfLines={2}>
              {journey.summary}
            </Text>
            <View style={styles.journeyFooter}>
              <Text style={styles.conversationCount}>
                對話 {journey.conversationCount} 次
              </Text>
              {journey.highlights && journey.highlights.length > 0 && (
                <View style={styles.highlightsContainer}>
                  {journey.highlights.slice(0, 2).map((highlight, idx) => (
                    <View key={idx} style={styles.highlightTag}>
                      <Text style={styles.highlightText}>{highlight}</Text>
                    </View>
                  ))}
                  {journey.highlights.length > 2 && (
                    <Text style={styles.moreHighlights}>+{journey.highlights.length - 2}</Text>
                  )}
                </View>
              )}
            </View>
            {journey.id === newJourneyId && showNewJourneyHighlight && (
              <View style={styles.newJourneyBadge}>
                <Text style={styles.newJourneyBadgeText}>新</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCalendar = () => {
    const rows: React.ReactNode[] = [];
    let currentRow: React.ReactNode[] = [];
    
    monthDates.forEach((date, index) => {
      currentRow.push(
        <View key={index} style={styles.calendarCell}>
          {date !== null ? (
            <TouchableOpacity
              style={[
                styles.dateButton,
                date === currentDay && styles.todayDate,
                selectedDate.getDate() === date && styles.selectedDate,
                hasJourneysOnDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date)) && styles.hasJourneyDate,
                isNewJourneyDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date)) && showNewJourneyHighlight && styles.newJourneyDate
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[
                styles.dateText,
                date === currentDay && styles.todayDateText,
                selectedDate.getDate() === date && styles.selectedDateText,
                hasJourneysOnDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date)) && styles.hasJourneyDateText
              ]}>
                {date}
              </Text>
              {hasJourneysOnDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), date)) && (
                <View style={styles.journeyIndicator} />
              )}
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
        <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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

        {/* Selected Date Journey Records */}
        <View style={styles.explorationSection}>
          <Text style={styles.explorationTitle}>
            {selectedDate.getDate() === currentDay ? '本日' : `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`}探索地點
          </Text>
          {renderJourneyRecords()}
        </View>
      </ScrollView>

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
  menuButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
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
  explorationTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  // 旅程記錄相關樣式
  hasJourneyDate: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  hasJourneyDateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  newJourneyDate: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  journeyIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 6,
    height: 6,
    backgroundColor: '#00FF88',
    borderRadius: 3,
  },
  journeyListContainer: {
    gap: 12,
  },
  journeyCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    position: 'relative',
  },
  newJourneyCard: {
    backgroundColor: '#4A4A2A',
    borderColor: '#FFD700',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  journeyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  journeyTime: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  journeyPlace: {
    color: '#4A90E2',
    fontSize: 14,
    marginBottom: 8,
  },
  journeySummary: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  journeyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationCount: {
    color: '#999999',
    fontSize: 12,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  highlightTag: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  highlightText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  moreHighlights: {
    color: '#999999',
    fontSize: 10,
    alignSelf: 'center',
  },
  newJourneyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newJourneyBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
