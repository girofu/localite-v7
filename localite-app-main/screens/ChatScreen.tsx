import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
// import * as Speech from 'expo-speech'; // 若要 TTS
import * as ImagePicker from 'expo-image-picker';
import { GUIDES } from '../data/guide';
import { PLACES } from '../data/places';
import RouteCard from '../components/RouteCard';
import MiniCard from '../components/MiniCard';
import ButtonOption from '../components/button_option';
import { GoogleAIService } from '../src/services/GoogleAIService';
import { GoogleTTSService } from '../src/services/GoogleTTSService';
import { ChatMessage, ChatResponse, ImageAnalysisRequest } from '../src/types/ai.types';
import { TTSRequest, TTSResponse } from '../src/types/tts.types';

export default function ChatScreen({ onClose, guideId = 'kuron', placeId, onNavigate }) {
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];
  const GUIDE_AVATAR = guide.image;

  // 服務實例
  const aiServiceRef = useRef<GoogleAIService | null>(null);
  const ttsServiceRef = useRef<GoogleTTSService | null>(null);

  // 初始化服務
  useEffect(() => {
    // 初始化 AI 服務
    aiServiceRef.current = new GoogleAIService({
      systemPrompt: `你是 ${guide.name}，一位專業的${place.name}導覽員。請提供友善、準確且實用的導覽資訊。`,
      temperature: 0.7,
      language: 'zh-TW', // 修正：添加 language 參數以符合測試預期
    });

    // 初始化 TTS 服務
    ttsServiceRef.current = new GoogleTTSService({
      enableCaching: true,
      cacheSize: 50,
      cacheTTL: 1800, // 30 分鐘
      enableLogging: true,
    });

    return () => {
      aiServiceRef.current?.cleanup();
      ttsServiceRef.current?.cleanup();
    };
  }, [guide.name, place.name]);

  // 定義訊息類型
  type Message = {
    id: string;
    from: 'ai' | 'user';
    text?: string;
    guideId?: string;
    image?: any;
    isError?: boolean;
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

  // 動態產生初始訊息
  const getInitialMessages = useCallback((): Message[] => [
    { 
      id: `init-1-${Date.now()}`, 
      from: 'ai', 
      guideId: guide.id, 
      text: `歡迎來到${place.name}！我是你的導覽員 ${guide.name}。` 
    },
    { 
      id: `init-2-${Date.now() + 1}`, 
      from: 'ai', 
      guideId: guide.id, 
      text: place.description 
    },
    { 
      id: `init-3-${Date.now() + 2}`, 
      from: 'ai', 
      guideId: guide.id, 
      text: '', 
      image: place.image 
    },
    { 
      id: `init-4-${Date.now() + 3}`, 
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
  ], [guide.id, guide.name, place.name, place.description, place.image]);

  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages());
  const [input, setInput] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isPhotoAnalyzing, setIsPhotoAnalyzing] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // 語音控制狀態
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [synthesizingMessageId, setSynthesizingMessageId] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const scrollViewRef = useRef(null);

  // 自動滾到底部
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isAIProcessing, isPhotoAnalyzing]);

  // 輔助函數：將圖片 URI 轉換為 Buffer
  const imageUriToBuffer = async (uri: string): Promise<Buffer> => {
    try {
      // 處理 data URI (base64 格式)
      if (uri.startsWith('data:')) {
        const base64Data = uri.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }

      // 處理普通 URL
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('轉換圖片失敗:', error);
      throw error;
    }
  };

  // AI 訊息發送處理
  const handleSend = useCallback(async () => {
    if (!input.trim() || isAIProcessing) return;
    
    const userMessage = input.trim();
    const userMessageId = `user-${Date.now()}`;
    
    // 立即添加用戶訊息並清空輸入
    setMessages(prev => [...prev, {
      id: userMessageId,
      from: 'user',
      text: userMessage,
    }]);
    setInput('');
    setIsAIProcessing(true);

    try {
      // 創建 ChatMessage 物件
      const chatMessage: ChatMessage = {
        content: userMessage,
        role: 'user',
        timestamp: new Date(),
      };

      // 調用 AI 服務 - 如果有照片分析歷史，啟用對話歷史
      const hasPhotoAnalysis = messages.some(msg => msg.text?.includes('📸') || msg.image);
      const aiResponse = await aiServiceRef.current?.sendMessage(
        chatMessage,
        hasPhotoAnalysis ? { useConversationHistory: true } : undefined
      );
      
      if (aiResponse) {
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: aiMessageId,
          from: 'ai',
          guideId: guide.id,
          text: aiResponse.content,
        }]);
      }
    } catch (error) {
      console.error('AI 服務錯誤:', error);
      
      // 顯示錯誤訊息
      const errorMessageId = `error-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: errorMessageId,
        from: 'ai',
        guideId: guide.id,
        text: '抱歉，AI 服務暫時無法使用，請稍後再試。',
        isError: true,
      }]);
    } finally {
      setIsAIProcessing(false);
    }
  }, [input, isAIProcessing, guide.id]);

  // 處理照片分析
  const handlePhotoAnalysis = useCallback(async (imageUri: string, fileName: string) => {
    setIsPhotoAnalyzing(true);
    
    try {
      // 添加用戶的照片消息
      const userPhotoMessageId = `user-photo-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: userPhotoMessageId,
        from: 'user',
        text: '📸 上傳了一張照片',
        image: { uri: imageUri },
      }]);

      // 轉換圖片為 Buffer
      const imageBuffer = await imageUriToBuffer(imageUri);
      
      // 創建圖片分析請求
      const analysisRequest: ImageAnalysisRequest = {
        image: {
          buffer: imageBuffer,
          mimeType: 'image/jpeg', // 簡化假設，實際應該從文件類型判斷
          filename: fileName,
        },
        query: '分析這張照片，告訴我這是什麼地方或物品，並提供相關的導覽資訊。',
        context: {
          location: { latitude: place.lat, longitude: place.lng },
          timestamp: new Date(),
          userLanguage: 'zh-TW',
          useConversationHistory: true,
          additionalContext: `使用者正在參觀 ${place.name}，我是導覽員 ${guide.name}`
        }
      };

      // 調用 AI 圖片分析
      const analysisResponse = await aiServiceRef.current?.analyzeImage(analysisRequest);

      if (analysisResponse) {
        const aiAnalysisMessageId = `ai-analysis-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: aiAnalysisMessageId,
          from: 'ai',
          guideId: guide.id,
          text: analysisResponse.analysis,
        }]);
      }
    } catch (error) {
      console.error('照片分析錯誤:', error);
      
      const errorMessageId = `photo-error-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: errorMessageId,
        from: 'ai',
        guideId: guide.id,
        text: '抱歉，照片分析失敗了。請再試一次或描述您看到的內容。',
        isError: true,
      }]);
    } finally {
      setIsPhotoAnalyzing(false);
    }
  }, [guide.id, guide.name, place.name, place.lat, place.lng]);

  // 語音播放控制
  const handleVoicePlay = useCallback(async (messageId: string, text: string) => {
    if (!text.trim()) return;
    
    // 如果正在播放其他訊息，先停止
    if (playingMessageId && playingMessageId !== messageId) {
      await ttsServiceRef.current?.stopAudio();
      setPlayingMessageId(null);
    }
    
    // 如果正在播放這個訊息，則暫停
    if (playingMessageId === messageId) {
      await ttsServiceRef.current?.pauseAudio();
      setPlayingMessageId(null);
      return;
    }

    setSynthesizingMessageId(messageId);
    setVoiceError(null);

    let errorOccurred = false;
    try {
      // 創建 TTS 請求
      const ttsRequest: TTSRequest = {
        text: text.trim(),
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          sampleRateHertz: 24000,
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
          effectsProfileId: ['telephony-class-application'],
        },
      };

      // 合成語音
      const ttsResponse = await ttsServiceRef.current?.synthesizeText(text.trim(), {
        languageCode: ttsRequest.voice.languageCode,
        voiceConfig: ttsRequest.voice,
        audioConfig: ttsRequest.audioConfig,
      });
      
      if (ttsResponse) {
        // 播放語音
        await ttsServiceRef.current?.playAudio(ttsResponse.audioBuffer);
        setPlayingMessageId(messageId);
        
        // TODO: 監聽播放完成事件，重置狀態
        // 暫時使用定時器模擬播放完成
        const estimatedDuration = text.length * 100; // 粗略估算播放時長
        setTimeout(() => {
          if (playingMessageId === messageId) {
            setPlayingMessageId(null);
          }
        }, estimatedDuration);
      }
    } catch (error) {
      console.error('語音合成失敗:', error);
      setVoiceError(`語音播放失敗: ${error.message}`);
      // 保持 synthesizingMessageId 不變，讓錯誤指示器能夠顯示
      return;
    } finally {
      // 只有在沒有發生錯誤時才清除合成狀態
      if (!errorOccurred) {
        setSynthesizingMessageId(null);
      }
    }
  }, [playingMessageId, guide.name, place.name, voiceError]);

  // 語音暫停控制
  const handleVoicePause = useCallback(async () => {
    if (playingMessageId) {
      await ttsServiceRef.current?.pauseAudio();
      setPlayingMessageId(null);
    }
  }, [playingMessageId]);

  // 處理 MiniCard 選擇
  const handleMiniCardSelect = (cardId: string) => {
    console.log('選擇 MiniCard:', cardId);
    
    if (cardId === 'fixed-route') {
      // 選擇固定路線，顯示 RouteCard
      setMessages(msgs => [
        ...msgs,
        { id: Date.now().toString(), from: 'user', text: '我想走固定路線' },
        { 
          id: (Date.now() + 1).toString(), 
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
        { id: Date.now().toString(), from: 'user', text: '我想自由探索' },
        { 
          id: (Date.now() + 1).toString(), 
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
      { id: Date.now().toString(), from: 'user', text: `我選擇了 ${routeId} 路線` },
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
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('需要相機權限才能拍照分析');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `camera-${Date.now()}.jpg`;
        await handlePhotoAnalysis(asset.uri, fileName);
      }
    } catch (error) {
      console.error('拍照失敗:', error);
      alert('拍照失敗，請重試');
    }
  };

  // 開啟相簿
  const openLibrary = async () => {
    console.log('openLibrary called');
    setShowOptions(false);
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('需要相簿權限才能選擇照片分析');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `library-${Date.now()}.jpg`;
        await handlePhotoAnalysis(asset.uri, fileName);
      }
    } catch (error) {
      console.error('選擇照片失敗:', error);
      alert('選擇照片失敗，請重試');
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
            <View 
              key={msg.id} 
              style={[
                styles.messageRow,
                msg.from === 'ai' ? styles.aiRow : styles.userRow,
              ]}
              testID={
                msg.from === 'ai' && msg.text && !msg.isError ? 'ai-analysis-result' :
                msg.isError ? 'photo-analysis-error' :
                undefined
              }
            >
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
                  <View style={msg.from === 'ai' ? styles.aiMessageContent : undefined}>
                    <Text style={[
                      msg.from === 'user' ? styles.userText : styles.aiText,
                      msg.isError && styles.errorText
                    ]}>
                      {msg.text}
                    </Text>
                    {msg.from === 'ai' && msg.text && !msg.isError && (
                      <View style={styles.voiceControlContainer}>
                        {synthesizingMessageId === msg.id ? (
                          <TouchableOpacity 
                            style={styles.voiceButton}
                            testID="voice-loading-indicator"
                            disabled
                          >
                            <Text style={styles.voiceButtonText}>🔄</Text>
                          </TouchableOpacity>
                        ) : playingMessageId === msg.id ? (
                          <TouchableOpacity 
                            style={[styles.voiceButton, styles.voiceButtonActive]}
                            onPress={handleVoicePause}
                            testID="voice-pause-button"
                          >
                            <Text style={styles.voiceButtonText}>⏸️</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={styles.voiceButton}
                            onPress={() => handleVoicePlay(msg.id, msg.text!)}
                            testID="voice-play-button"
                          >
                            <Text style={styles.voiceButtonText}>🔊</Text>
                          </TouchableOpacity>
                        )}
                        {voiceError && synthesizingMessageId === msg.id && (
                          <Text 
                            style={styles.voiceErrorText}
                            testID="voice-error-indicator"
                          >
                            語音失敗
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
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
          {isAIProcessing && (
            <View style={[styles.messageRow, styles.aiRow]} testID="ai-loading-indicator">
              <View style={styles.avatarWrapper}>
                <Image source={guide.image} style={styles.avatar} />
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingDot}>● ● ●</Text>
              </View>
            </View>
          )}
          {isPhotoAnalyzing && (
            <View style={[styles.messageRow, styles.aiRow]} testID="photo-analysis-loading">
              <View style={styles.avatarWrapper}>
                <Image source={guide.image} style={styles.avatar} />
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingDot}>📸 分析中...</Text>
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
                      { id: (Date.now() + 2).toString(), from: 'ai', guideId: guide.id, text: '歡迎回來～接下來你想探索什麼呢？' },
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
          <TouchableOpacity 
            onPress={() => setShowOptions(true)}
            testID="add-options-button"
          >
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
          <TouchableOpacity onPress={handleSend} testID="send-button">
            <Image source={require('../assets/icons/icon_sendmessage_btn.png')} style={styles.inputIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Overlay 選單 */}
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={styles.overlayMenu}>
            <TouchableOpacity style={styles.overlayItem} onPress={openCamera} testID="ocr-option">
              <Image source={require('../assets/icons/icon_OCR.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>光學辨識</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayItem} onPress={openLibrary} testID="library-option">
              <Image source={require('../assets/icons/icon_photo.png')} style={styles.overlayIcon} />
              <Text style={styles.overlayText}>相片圖庫</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayItem} onPress={openCamera} testID="camera-option">
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
  errorText: { 
    color: '#ff6b6b',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  aiMessageContent: {
    width: '100%',
  },
  voiceControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  voiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  voiceButtonText: {
    fontSize: 14,
  },
  voiceErrorText: {
    color: '#ff6b6b',
    fontSize: 10,
    marginLeft: 8,
    opacity: 0.8,
  },
});
