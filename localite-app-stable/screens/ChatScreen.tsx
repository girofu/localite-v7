import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import * as Speech from 'expo-speech';
import { GUIDES } from '../data/guide';
import { PLACES } from '../data/places';
import * as ImagePicker from 'expo-image-picker';
import RouteCard from '../components/RouteCard';
import MiniCard from '../components/MiniCard';
import ButtonOption from '../components/button_option';
import { JourneyValidationModal } from '../components/LoginValidationModal';
import { NavigationSession } from '../src/services/PersistenceService';

// 導覽員圖片對應表
const GUIDE_IMAGES = {
  kuron: require('../assets/guides/kuron_guide.png'),
  pururu: require('../assets/guides/pururu_guide.png'),
  popo: require('../assets/guides/popo_guide.png'),
  nikko: require('../assets/guides/nikko_guide.png'),
  piglet: require('../assets/guides/piglet_guide.png'),
};

export default function ChatScreen({ onClose, guideId = 'kuron', placeId, onNavigate, initialShowJourneyValidation = false, initialShowEndOptions = false, isLoggedIn = false, voiceEnabled = true }: {
  onClose: () => void;
  guideId?: string;
  placeId?: string;
  onNavigate: (screen: string, params?: any) => void;
  initialShowJourneyValidation?: boolean;
  initialShowEndOptions?: boolean;
  isLoggedIn?: boolean;
  voiceEnabled?: boolean;
}) {
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];
  const GUIDE_AVATAR = GUIDE_IMAGES[guide.id] || GUIDE_IMAGES.kuron;

  // 定義訊息類型
  type Message = {
    id: number;
    from: 'ai' | 'user';
    text?: string;
    guideId?: string;
    image?: any;
    miniCards?: Array<{
      id: string;
      title: string;
      icon: any;
    }>;
    routeCards?: Array<{
      id: string;
      title: string;
      description: string;
      image: any;
      worksheetRoutes?: string[];
    }>;
  };

  // 路線資料 - 根據地點動態調整
  const getRouteData = (placeName: string) => ({
    teaCulture: {
      title: '茶葉文化路線',
      description: '著重在當時茶葉的文化與歷史,導覽聚焦在茶葉歷史、製茶流程與相關場景。',
      image: require('../assets/places/shinfang.png'),
      worksheetRoutes: ['民生國小', '民權國小', '復興國中'],
    },
    lifeBackground: {
      title: '生活背景',
      description: `著重在${placeName}的以及經營者在當時下的生活及在地互動，深入了解當時的社會環境與人文風貌。`,
      image: require('../assets/places/xiahai.png'),
      worksheetRoutes: ['中山國小'],
    },
    historicalArchitecture: {
      title: '歷史建築探索',
      description: `探索${placeName}地區的歷史建築，了解日治時期的建築特色與文化背景。`,
      image: require('../assets/places/shinfang.jpg'),
      worksheetRoutes: ['大稻埕國小', '延平國中'],
    },
  });

  // 動態產生訊息
  const MOCK_MESSAGES: Message[] = [
    { id: 1, from: 'ai', guideId: guide.id, text: `歡迎來到${place.name}！我是你的導覽員 ${guide.name}。` },
    { id: 2, from: 'ai', guideId: guide.id, text: place.description },
    { id: 3, from: 'ai', guideId: guide.id, text: '', image: place.image },
    { 
      id: 4, 
      from: 'ai', 
      guideId: guide.id, 
      text: `你想讓我帶你走2條經典路線，還是自己隨意走走，自行探索${place.name}的秘密？`,
      miniCards: [
        { 
          id: 'fixed-route',
          title: '固定路線',
          icon: require('../assets/icons/icon_mini_set.png')
        },
        { 
          id: 'free-exploration',
          title: '自由探索',
          icon: require('../assets/icons/icon_mini_free.png')
        }
      ]
    },
  ];

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(initialShowEndOptions);
  const [showOptions, setShowOptions] = useState(false);
  const [showJourneyValidation, setShowJourneyValidation] = useState(initialShowJourneyValidation);
  const scrollViewRef = useRef(null);
  const [currentSession, setCurrentSession] = useState<NavigationSession | null>(null);

  // 初始化會話
  useEffect(() => {
    const initSession = async () => {
      try {
        // 創建新會話或恢復現有會話
        const session = new NavigationSession();
        session.setCurrentPlace(place);
        session.setCurrentGuide(guide);

        // 如果有現有的訊息，添加到會話中
        messages.forEach(msg => session.addMessage(msg));

        setCurrentSession(session);
      } catch (error) {
        console.error('初始化會話失敗:', error);
      }
    };

    initSession();
  }, []); // 只在組件初始化時執行

  // 當從 Login 返回時，關閉 JourneyValidationModal，但保持 showEndOptions 狀態
  useEffect(() => {
    // 如果從 Login 返回（initialShowJourneyValidation 為 false），關閉 JourneyValidationModal
    if (initialShowJourneyValidation === false) {
      setShowJourneyValidation(false);
    }
  }, [initialShowJourneyValidation]);

  // 根據狀態決定輸入框右側圖示
  const getInputIcon = () => {
    if (isTyping) {
      return require('../assets/icons/pause_btn.png');
    } else if (input.trim()) {
      return require('../assets/icons/upload_btn.png');
    } else {
      return require('../assets/icons/wave_btn.png');
    }
  };

  // Typing indicator & TTS 語音播放
  useEffect(() => {
    if (isTyping && voiceEnabled) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.from === 'ai' && lastMessage.text) {
        Speech.speak(lastMessage.text, {
          language: 'zh-TW',
          pitch: 1.0,
          rate: 0.8,
        });
      }
      setTimeout(() => setIsTyping(false), 1200);
    }
  }, [isTyping, messages, voiceEnabled]);

  // 自動滾到底部
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  // 組件卸載時保存會話
  useEffect(() => {
    return () => {
      if (currentSession) {
        currentSession.save().catch(error => {
          console.error('組件卸載時保存會話失敗:', error);
        });
      }
    };
  }, [currentSession]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), from: 'user' as const, text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    // 更新會話
    if (currentSession) {
      currentSession.addMessage(userMessage);
    }

    setTimeout(() => {
      const aiMessage = { id: Date.now() + 1, from: 'ai' as const, guideId: guide.id, text: '這是 AI 的回覆。' };
      setMessages(prevMsgs => [...prevMsgs, aiMessage]);
      setIsTyping(false);

      // 更新會話
      if (currentSession) {
        currentSession.addMessage(aiMessage);
        // 保存會話到持久化存儲
        currentSession.save().catch(error => {
          console.error('保存會話失敗:', error);
        });
      }
    }, 1200);
  };

  // 處理 MiniCard 選擇
  const handleMiniCardSelect = (cardId: string) => {
    console.log('選擇 MiniCard:', cardId);
    
    if (cardId === 'fixed-route') {
      // 選擇固定路線，顯示 RouteCard
      setMessages(msgs => [
        ...msgs,
        { id: Date.now(), from: 'user', text: '我想走固定路線' },
        { 
          id: Date.now() + 1, 
          from: 'ai', 
          guideId: guide.id, 
          text: '很棒的選擇👍！我有3條固定路線想推薦給你：',
          routeCards: [
            { ...getRouteData(place.name).teaCulture, id: 'tea-culture' },
            { ...getRouteData(place.name).lifeBackground, id: 'life-background' },
            { ...getRouteData(place.name).historicalArchitecture, id: 'historical-architecture' },
          ]
        }
      ]);
    } else if (cardId === 'free-exploration') {
      // 選擇自由探索
      setMessages(msgs => [
        ...msgs,
        { id: Date.now(), from: 'user', text: '我想自由探索' },
        { 
          id: Date.now() + 1, 
          from: 'ai', 
          guideId: guide.id, 
          text: `好的！你可以自由探索${place.name}的秘密。如果需要任何幫助，隨時告訴我！`
        }
      ]);
    }
  };

  // 處理路線卡片選擇
  const handleRouteCardSelect = (routeId: string) => {
    console.log('選擇路線:', routeId);
    // 這裡可以添加路線選擇的邏輯
    setMessages(msgs => [
      ...msgs,
      { id: Date.now(), from: 'user', text: `我選擇了 ${routeId} 路線` }
    ]);
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setShowScrollToBottom(!isAtBottom);
  };

  // 結束對話時顯示結束選項
  const handleEndChat = () => {
    setShowEndOptions(true);
  };

  // 開啟相機
  const openCamera = async () => {
    console.log('openCamera called');
    setShowOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相機權限');
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    console.log('Camera result:', result);
    if (!result.canceled) {
      console.log('拍照結果:', result);
      // 這裡可以處理照片，例如 setMessages([...])
    }
  };
  // 開啟相簿
  const openLibrary = async () => {
    console.log('openLibrary called');
    setShowOptions(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相簿權限');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    console.log('Library result:', result);
    if (!result.canceled) {
      console.log('相簿選擇:', result);
      // 這裡可以處理照片，例如 setMessages([...])
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => onNavigate && onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{guide.name}</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={handleEndChat}>
          <Image source={require('../assets/icons/icon_close.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      {/* 聊天區域加一層裁切，絕對定位 */}
      <View style={styles.chatArea}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatList}
          contentContainerStyle={{ paddingTop: 16 }}
          onScroll={handleScroll}
          scrollEventThrottle={100}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[
              styles.messageRow,
              msg.from === 'ai' ? styles.aiRow : styles.userRow
            ]}>
              {msg.from === 'ai' && (
                <View style={styles.avatarWrapper}>
                  <Image
                    source={GUIDE_IMAGES[msg.guideId] || GUIDE_IMAGES.kuron}
                    style={styles.avatar}
                  />
                </View>
              )}
              <View style={msg.from === 'user' ? styles.userBubble : styles.aiTextWrap}>
                {msg.text ? (
                  <Text style={msg.from === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
                ) : null}
                {msg.miniCards && (
                  <View style={styles.miniCardsContainer}>
                    {msg.miniCards.map(card => (
                      <MiniCard
                        key={card.id}
                        title={card.title}
                        icon={card.icon}
                        onPress={() => handleMiniCardSelect(card.id)}
                        containerStyle={styles.miniCardStyle}
                      />
                    ))}
                  </View>
                )}
                {msg.routeCards && (
                  <View style={styles.routeCardsContainer}>
                    <Text style={styles.routeCardsHint}>← 左右滑動查看更多路線 →</Text>
                    <FlatList
                      data={msg.routeCards}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.routeCardsList}
                      renderItem={({ item: card }) => (
                        <View style={styles.routeCardWrapper}>
                          <RouteCard
                            title={card.title}
                            description={card.description}
                            image={card.image}
                            worksheetRoutes={card.worksheetRoutes}
                            onSelect={() => handleRouteCardSelect(card.id)}
                            containerStyle={styles.routeCardStyle}
                          />
                        </View>
                      )}
                      keyExtractor={(item) => item.id}
                    />
                  </View>
                )}
                {msg.image && (
                  <Image source={msg.image} style={styles.aiImageCard} />
                )}
                {/* 為 outdoor 地點添加地圖按鈕 - 移到所有內容的最下方 */}
                {msg.from === 'ai' && place.outdoor && (
                  <TouchableOpacity 
                    style={styles.mapButton} 
                    onPress={() => onNavigate && onNavigate('mapLocation')}
                  >
                    <Image source={require('../assets/icons/icon_map.png')} style={styles.mapIcon} />
                    <Text style={styles.mapButtonText}>查看地圖</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.avatarWrapper}>
                <Image source={GUIDE_IMAGES[guide.id] || GUIDE_IMAGES.kuron} style={styles.avatar} />
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingDot}>● ● ●</Text>
              </View>
            </View>
          )}
          {/* 結束導覽選項 */}
          {showEndOptions && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.avatarWrapper}>
                <Image source={GUIDE_IMAGES[guide.id] || GUIDE_IMAGES.kuron} style={styles.avatar} />
              </View>
              <View style={styles.aiTextWrap}>
                <Text style={styles.aiText}>你想要結束導覽了嗎？是否要：</Text>
                <ButtonOption 
                  title="生成旅程記錄"
                  onPress={() => {
                    if (isLoggedIn) {
                      // 如果用戶已登入，直接生成旅程記錄
                      onNavigate && onNavigate('learningSheet');
                    } else {
                      // 如果用戶未登入，顯示登入驗證 modal
                      setShowJourneyValidation(true);
                    }
                  }}
                />
                <ButtonOption 
                  title="繼續導覽"
                  onPress={() => {
                    setShowEndOptions(false);
                    setMessages(msgs => ([
                      ...msgs,
                      { id: Date.now() + 2, from: 'ai', guideId: guide.id, text: '歡迎回來～接下來你想探索什麼呢？' }
                    ]));
                  }}
                />
                <ButtonOption 
                  title="直接結束導覽"
                  onPress={() => onNavigate && onNavigate('chatEnd')}
                />
              </View>
            </View>
          )}
        </ScrollView>
        {/* Scroll to bottom floating arrow */}
        {showScrollToBottom && (
          <TouchableOpacity
            style={styles.floatingDownArrow}
            onPress={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            activeOpacity={0.7}
          >
            <Image source={require('../assets/icons/icon_arrow-down.png')} style={styles.floatingArrowIcon} />
          </TouchableOpacity>
        )}
      </View>
      {/* Chat Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={24}
        style={styles.inputBarWrap}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity testID="add-options-button" onPress={() => setShowOptions(true)}>
            <Image source={require('../assets/icons/icon_add_btn.png')} style={styles.inputIcon} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="輸入你的訊息"
            placeholderTextColor="#bbb"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity testID="send-button" onPress={handleSend}>
            <Image source={getInputIcon()} style={styles.inputIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Overlay 選單 */}
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={styles.overlayMenu}>
            <TouchableOpacity style={styles.overlayItem} testID="ocr-option" onPress={openCamera}>
              <Image source={require('../assets/icons/icon_OCR.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>光學辨識</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayItem} testID="library-option" onPress={openLibrary}>
              <Image source={require('../assets/icons/icon_photo.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>相片圖庫</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayItem} testID="camera-option" onPress={openCamera}>
              <Image source={require('../assets/icons/icon_camera.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>拍攝照片</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Journey Validation Modal */}
      <JourneyValidationModal
        visible={showJourneyValidation}
        onLogin={() => {
          setShowJourneyValidation(false);
          onNavigate && onNavigate('login', { returnToChat: true, showJourneyValidation: true });
        }}
        onCancel={() => setShowJourneyValidation(false)}
        onClose={() => setShowJourneyValidation(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#232323', position: 'relative' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 28, height: 28, resizeMode: 'contain' },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 3,
  },
  chatArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 90, // header 高度 (50+20+padding)
    bottom: 80, // messenger bar 高度
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: { flexDirection: 'row', marginBottom: 16 },
  aiRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  avatarWrapper: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  aiTextWrap: { maxWidth: '85%' },
  aiText: { color: '#fff', fontSize: 18, lineHeight: 26 },
  aiImageCard: {
    width: 180, height: 120, borderRadius: 16, marginTop: 8, alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#eee', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18,
    maxWidth: '75%', alignSelf: 'flex-end',
  },
  userText: { color: '#232323', fontSize: 18, lineHeight: 26 },
  typingBubble: {
    backgroundColor: '#444', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 4,
  },
  typingDot: { color: '#fff', fontSize: 22, letterSpacing: 2 },
  inputBarWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'transparent',
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 32, margin: 16, paddingHorizontal: 16, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  input: {
    flex: 1, fontSize: 18, color: '#232323', marginHorizontal: 8, paddingVertical: 8,
  },
  inputIcon: { width: 28, height: 28, resizeMode: 'contain' },
  floatingDownArrow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // 緊貼 chatArea 最下緣
    alignItems: 'center',
    zIndex: 20,
    paddingVertical: 6,
    marginBottom: 8, // 與 messenger bar 有一點間距
  },
  floatingArrowIcon: {
    width: 36,
    height: 36,
    tintColor: '#fff',
    opacity: 0.95,
  },

  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  overlayMenu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginLeft: 32,
    marginBottom: 48,
    minWidth: 160,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  overlayIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    resizeMode: 'contain',
  },
  overlayText: {
    fontSize: 18,
    color: '#232323',
    fontWeight: 'bold',
  },
  routeCardsContainer: {
    marginTop: 12,
    gap: 12,
  },
  routeCardStyle: {
    marginBottom: 8,
    marginTop: 0,
  },
  routeCardsList: {
    paddingHorizontal: 16,
    paddingRight: 100, // 讓第二張卡片露出一半
  },
  routeCardWrapper: {
    width: 180,
    marginRight: 8,
  },
  routeCardsHint: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  miniCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  miniCardStyle: {
    marginHorizontal: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  mapIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
