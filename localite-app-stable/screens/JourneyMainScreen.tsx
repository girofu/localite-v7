import React, { useState } from 'react';
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

interface JourneyMainScreenProps {
  onClose: () => void;
  onNavigate: (screen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation') => void;
}

export default function JourneyMainScreen({ onClose, onNavigate }: JourneyMainScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const currentDay = selectedDate.getDate();
  
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];
  
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

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

  const renderCalendar = () => {
    const rows = [];
    let currentRow = [];
    
    monthDates.forEach((date, index) => {
      currentRow.push(
        <View key={index} style={styles.calendarCell}>
          {date !== null ? (
            <TouchableOpacity
              style={[
                styles.dateButton,
                date === currentDay && styles.todayDate,
                selectedDate.getDate() === date && styles.selectedDate
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[
                styles.dateText,
                date === currentDay && styles.todayDateText,
                selectedDate.getDate() === date && styles.selectedDateText
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

        {/* Today's Exploration Locations */}
        <View style={styles.explorationSection}>
          <Text style={styles.explorationTitle}>本日探索地點</Text>
          <View style={styles.explorationBox}>
            <Text style={styles.noRecordText}>本日無旅程記錄</Text>
          </View>
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
});
