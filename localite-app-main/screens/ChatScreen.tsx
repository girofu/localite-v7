import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
// import * as Speech from 'expo-speech'; // 若要 TTS
import * as ImagePicker from 'expo-image-picker';
import { GUIDES } from '../data/guide';
import { PLACES } from '../data/places';
import RouteCard from '../components/RouteCard';
import MiniCard from '../components/MiniCard';
import ButtonOption from '../components/button_option';

export default function ChatScreen({ onClose, guideId = 'kuron', placeId, onNavigate }) {
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];
  const GUIDE_AVATAR = guide.image;

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

  // 路線資料
  const ROUTE_DATA = {
    teaCulture: {
      title: '茶葉文化路線',
      description: '著重在當時茶葉的文化與歷史,導覽聚焦在茶葉歷史、製茶流程與相關場景。',
      image: require('../assets/places/shinfang.png'),
      worksheetRoutes: ['民生國小', '民權國小', '復興國中'],
    },
    lifeBackground: {
      title: '生活背景',
      description: '著重在新芳春行的以及經營者在當時下的生活及在地互動，深入了解當時的社會環境與人文風貌。',
      image: require('../assets/places/xiahai.png'),
      worksheetRoutes: ['中山國小'],
    },
    historicalArchitecture: {
      title: '歷史建築探索',
      description: '探索大稻埕地區的歷史建築，了解日治時期的建築特色與文化背景。',
      image: require('../assets/places/shinfang.jpg'),
      worksheetRoutes: ['大稻埕國小', '延平國小'],
    },
  };

  // 動態產生訊息
  const MOCK_MESSAGES: Message[] = [
    { id: 1, from: 'ai', guideId: guide.id, text: `歡迎來到${place.name}！我是你的導覽員 ${guide.name}。` },
    { id: 2, from: 'ai', guideId: guide.id, text: place.description },
    { id: 3, from: 'ai', guideId: guide.id, text: '', image: place.image },
    { 
      id: 4, 
      from: 'ai', 
      guideId: guide.id, 
      text: '你想讓我帶你走2條經典路線，還是自己隨意走走，自行探索新芳春的秘密？',
      miniCards: [
        { 
          id: 'fixed-route',
          title: '固定路線',
          icon: require('../assets/icons/icon_mini_set.png'),
        },
        { 
          id: 'free-exploration',
          title: '自由探索',
          icon: require('../assets/icons/icon_mini_free.png'),
        },
      ],
    },
  ];

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const scrollViewRef = useRef(null);

  // Typing indicator & TTS 模擬
  useEffect(() => {
    if (isTyping) {
      // setTimeout(() => setIsTyping(false), 1200);
      // Speech.speak('這是語音朗讀範例。');
    }
  }, [isTyping]);

  // 自動滾到底部
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), from: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { id: Date.now() + 1, from: 'ai', guideId: guide.id, text: '這是 AI 的回覆。' },
      ]);
      setIsTyping(false);
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
            { ...ROUTE_DATA.teaCulture, id: 'tea-culture' },
            { ...ROUTE_DATA.lifeBackground, id: 'life-background' },
            { ...ROUTE_DATA.historicalArchitecture, id: 'historical-architecture' },
          ],
        },
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
          text: '好的！你可以自由探索新芳春的秘密。如果需要任何幫助，隨時告訴我！',
        },
      ]);
    }
  };

  // 處理路線卡片選擇
  const handleRouteCardSelect = (routeId: string) => {
    console.log('選擇路線:', routeId);
    // 這裡可以添加路線選擇的邏輯
    setMessages(msgs => [
      ...msgs,
      { id: Date.now(), from: 'user', text: `我選擇了 ${routeId} 路線` },
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
        <TouchableOpacity style={styles.headerIcon}>
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
              msg.from === 'ai' ? styles.aiRow : styles.userRow,
            ]}>
              {msg.from === 'ai' && (
                <View style={styles.avatarWrapper}>
                  <Image
                    source={GUIDES.find(g => g.id === msg.guideId)?.image || guide.image}
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
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.avatarWrapper}>
                <Image source={guide.image} style={styles.avatar} />
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
                <Image source={guide.image} style={styles.avatar} />
              </View>
              <View style={styles.aiTextWrap}>
                <Text style={styles.aiText}>你想要結束導覽了嗎？是否要：</Text>
                <ButtonOption 
                  title="製作學習單"
                  onPress={() => onNavigate && onNavigate('learningSheet')}
                />
                <ButtonOption 
                  title="繼續導覽"
                  onPress={() => {
                    setShowEndOptions(false);
                    setMessages(msgs => ([
                      ...msgs,
                      { id: Date.now() + 2, from: 'ai', guideId: guide.id, text: '歡迎回來～接下來你想探索什麼呢？' },
                    ]));
                  }}
                />
                <ButtonOption 
                  title="直接結束導覽"
                  onPress={() => onNavigate && onNavigate('journeyDetail')}
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
          <TouchableOpacity onPress={() => setShowOptions(true)}>
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
          <TouchableOpacity onPress={handleSend}>
            <Image source={require('../assets/icons/icon_sendmessage_btn.png')} style={styles.inputIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Overlay 選單 */}
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={styles.overlayMenu}>
            <TouchableOpacity style={styles.overlayItem} onPress={openCamera}>
              <Image source={require('../assets/icons/icon_OCR.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>光學辨識</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayItem} onPress={openLibrary}>
              <Image source={require('../assets/icons/icon_photo.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>相片圖庫</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayItem} onPress={openCamera}>
              <Image source={require('../assets/icons/icon_camera.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>拍攝照片</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  aiImageCard: {
    alignSelf: 'flex-start', borderRadius: 16, height: 120, marginTop: 8, width: 180,
  },
  aiRow: { justifyContent: 'flex-start' },
  aiText: { color: '#fff', fontSize: 18, lineHeight: 26 },
  aiTextWrap: { maxWidth: '85%' },
  avatar: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  avatarWrapper: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 17.5,
    height: 35,
    justifyContent: 'center',
    marginRight: 8,
    width: 35,
  },
  chatArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 108, // header 高度 (48+12+padding)
    bottom: 80, // messenger bar 高度
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  container: { backgroundColor: '#232323', flex: 1, position: 'relative' },
  floatingArrowIcon: {
    height: 36,
    opacity: 0.95,
    tintColor: '#fff',
    width: 36,
  },
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
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerIcon: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 3,
  },
  icon: { height: 28, resizeMode: 'contain', width: 28 },
  input: {
    color: '#232323', flex: 1, fontSize: 18, marginHorizontal: 8, paddingVertical: 8,
  },
  inputBar: {
    alignItems: 'center', backgroundColor: '#fff', borderRadius: 32,
    elevation: 2, flexDirection: 'row', margin: 16, paddingHorizontal: 16,
    paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
  },
  inputBarWrap: {
    backgroundColor: 'transparent', bottom: 0, left: 0, position: 'absolute', right: 0,
  },
  inputIcon: { height: 28, resizeMode: 'contain', width: 28 },
  messageRow: { flexDirection: 'row', marginBottom: 16 },
  miniCardStyle: {
    marginHorizontal: 4,
  },
  miniCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  overlayBg: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.08)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayIcon: {
    height: 22,
    marginRight: 12,
    resizeMode: 'contain',
    width: 22,
  },
  overlayItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  overlayMenu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 8,
    marginBottom: 48,
    marginLeft: 32,
    minWidth: 160,
    paddingHorizontal: 0,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  overlayText: {
    color: '#232323',
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeCardStyle: {
    marginBottom: 8,
    marginTop: 0,
  },
  routeCardWrapper: {
    marginRight: 8,
    width: 180,
  },
  routeCardsContainer: {
    gap: 12,
    marginTop: 12,
  },
  routeCardsHint: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  routeCardsList: {
    paddingHorizontal: 16,
    paddingRight: 100, // 讓第二張卡片露出一半
  },
  typingBubble: {
    backgroundColor: '#444', borderRadius: 16, marginLeft: 4, paddingHorizontal: 16, paddingVertical: 8,
  },
  typingDot: { color: '#fff', fontSize: 22, letterSpacing: 2 },
  userBubble: {
    alignSelf: 'flex-end', backgroundColor: '#eee', borderRadius: 20, maxWidth: '75%',
    paddingHorizontal: 18, paddingVertical: 10,
  },
  userRow: { justifyContent: 'flex-end' },
  userText: { color: '#232323', fontSize: 18, lineHeight: 26 },
});
