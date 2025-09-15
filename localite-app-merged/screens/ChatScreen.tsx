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
import BadgeMessage from '../components/BadgeMessage';
import { NavigationSession, HybridNavigationSession } from '../src/services/PersistenceService';
import { FirestoreService } from '../src/services/FirestoreService';
import LoggingService from '../src/services/LoggingService';
import { GoogleAIService } from '../src/services/GoogleAIService';
import { JourneySummaryService } from '../src/services/JourneySummaryService';
import { ChatMessage, ChatResponse } from '../src/types/ai.types';
import { Badge } from '../src/types/badge.types';
import { useAuth } from '../src/contexts/AuthContext';

// 導覽員圖片對應表
const GUIDE_IMAGES: Record<string, any> = {
  kuron: require('../assets/guides/kuron_guide.png'),
  pururu: require('../assets/guides/pururu_guide.png'),
  popo: require('../assets/guides/popo_guide.png'),
  nikko: require('../assets/guides/nikko_guide.png'),
  piglet: require('../assets/guides/piglet_guide.png'),
};

export default function ChatScreen({ onClose, guideId = 'kuron', placeId, onNavigate, initialShowJourneyValidation = false, initialShowEndOptions = false, isLoggedIn = false, voiceEnabled = true, currentUser = null }: {
  onClose: () => void;
  guideId?: string;
  placeId?: string | null;
  onNavigate: (screen: string, params?: any) => void;
  initialShowJourneyValidation?: boolean;
  initialShowEndOptions?: boolean;
  isLoggedIn?: boolean;
  voiceEnabled?: boolean;
  currentUser?: any;
}) {
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];
  const GUIDE_AVATAR = GUIDE_IMAGES[guide.id] || GUIDE_IMAGES.kuron;

  // 🆕 整合 AuthContext 徽章功能
  const { 
    checkBadgeConditions, 
    hasUserBadge, 
    user 
  } = useAuth();

  // 定義訊息類型
  type Message = {
    id: number;
    from: 'ai' | 'user';
    text?: string;
    guideId?: string;
    image?: any; // 支持靜態 require() 或 {uri: string} 格式
    badge?: Badge; // 🆕 徽章消息支援
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSession, setCurrentSession] = useState<HybridNavigationSession | null>(null);
  const [aiService, setAiService] = useState<GoogleAIService | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('disabled');
  const [isGeneratingJourney, setIsGeneratingJourney] = useState(false);
  const [journeyGenerationError, setJourneyGenerationError] = useState<string | null>(null);
  
  // 服務實例
  const [firestoreService] = useState(() => new FirestoreService());
  const [loggingService] = useState(() => new LoggingService());
  const [journeySummaryService, setJourneySummaryService] = useState<JourneySummaryService | null>(null);

  // 🆕 徽章處理方法
  const addBadgeMessage = (badge: Badge) => {
    const badgeMessage: Message = {
      id: Date.now() + Math.random(), // 確保唯一 ID
      from: 'ai',
      badge: badge,
      guideId: guideId,
    };

    setMessages(prevMessages => [...prevMessages, badgeMessage]);
    
    // 記錄徽章顯示
    if (user?.uid) {
      loggingService.info('Badge displayed in chat', {
        userId: user.uid,
        badgeId: badge.id,
        badgeName: badge.name,
        guideId: guideId,
        placeId: placeId
      });
    }
  };

  // 🆕 檢查並觸發徽章獲得
  const triggerBadgeCheck = async (triggerType: 'quiz_completed' | 'tour_completed' | 'location_specific', metadata?: any) => {
    if (!isLoggedIn || !user?.uid) return;

    try {
      const newBadges = await checkBadgeConditions(triggerType, metadata);
      
      for (const badge of newBadges) {
        if (badge.displayType === 'chat') {
          // 在聊天中顯示徽章
          addBadgeMessage(badge);
        } else if (badge.displayType === 'modal') {
          // Modal 類型徽章將在上級組件處理
          // 這裡只記錄日誌
          loggingService.info('Modal badge awarded', {
            userId: user.uid,
            badgeId: badge.id,
            badgeName: badge.name
          });
        }
      }
    } catch (error) {
      console.warn('Badge check failed:', error);
      // 徽章檢查失敗不應該影響聊天流程
    }
  };

  // 初始化會話和 AI 服務
  useEffect(() => {
    const initSession = async () => {
      try {
        // 使用混合會話系統
        const sessionId = `session-${Date.now()}-${guideId}-${placeId}`;
        const session = new HybridNavigationSession(sessionId, currentUser?.uid);
        
        // 設置基本資訊
        session.setCurrentPlace(place);
        session.setCurrentGuide(guide);

        // 如果有現有的訊息，批量添加到會話中
        if (messages.length > 0) {
          await session.addMessages(messages);
        }

        // 如果用戶已登入，啟用遠端同步
        if (isLoggedIn && currentUser?.uid) {
          try {
            console.log('🔄 啟用遠端同步功能...');
            await session.enableRemoteSync(firestoreService, loggingService, currentUser.uid);
            console.log('✅ 遠端同步功能已啟用');
            
            // 更新同步狀態
            const status = await session.getSyncStatus();
            setSyncStatus(status);
            
            // 嘗試從遠端載入現有對話
            const loaded = await session.loadFromRemote();
            if (loaded) {
              console.log('✅ 從遠端載入了現有對話');
              // 這裡可以更新 messages 狀態來反映遠端資料
            }
          } catch (error) {
            console.warn('⚠️ 啟用遠端同步失敗，使用本地模式:', error);
            setSyncStatus('error');
          }
        } else {
          console.log('👤 訪客模式，僅使用本地存儲');
          setSyncStatus('guest');
        }

        setCurrentSession(session);

        // 🆕 檢查地點特定徽章（如忠寮地區徽章）
        if (isLoggedIn && place.id && place.name) {
          await triggerBadgeCheck('location_specific', {
            placeId: place.id,
            placeName: place.name,
            guideId: guide.id,
            isFirstVisit: true // 可以根據實際邏輯判斷
          });
        }

        // 初始化 AI 服務
        try {
          console.log('🎯 開始初始化 AI 服務...');
          const ai = new GoogleAIService({
            systemPrompt: `你是 ${guide.name}，一位專業的台灣旅遊導覽員，正在為遊客介紹 ${place.name}。請以友善、專業的語調回應，提供實用的旅遊資訊和建議。請用繁體中文回覆。`
          });
          setAiService(ai);
          
          // 初始化旅程總結服務
          const journeyService = new JourneySummaryService(ai, firestoreService);
          setJourneySummaryService(journeyService);
          
          console.log('✅ AI 服務和旅程總結服務設置成功');
        } catch (error) {
          console.error('❌ AI 服務初始化失敗:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          loggingService.error('AI service initialization failed', { 
            error: errorMessage,
            guideId,
            placeId 
          });
        }
      } catch (error) {
        console.error('初始化會話失敗:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        loggingService.error('Session initialization failed', { 
          error: errorMessage,
          guideId,
          placeId,
          userId: currentUser?.uid 
        });
      }
    };

    initSession();
  }, [guide.name, place.name, isLoggedIn, currentUser?.uid]); // 增加登入狀態和用戶 ID 依賴

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

  // 組件卸載時保存會話並清理資源
  useEffect(() => {
    return () => {
      if (currentSession) {
        currentSession.save().catch(error => {
          console.error('組件卸載時保存會話失敗:', error);
        });
        
        // 清理混合會話的額外資源
        currentSession.cleanup();
      }
    };
  }, [currentSession]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), from: 'user' as const, text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // 更新會話
    if (currentSession) {
      currentSession.addMessage(userMessage);
    }

    try {
      let aiResponseText = '這是 AI 的回覆。'; // 預設回應

      if (aiService) {
        // 使用真實的 AI 服務
        const chatMessage: ChatMessage = {
          content: currentInput,
          role: 'user',
          timestamp: new Date()
        };

        const response: ChatResponse = await aiService.sendMessage(chatMessage, {
          language: 'zh-TW',
          responseStyle: 'informative'
        });

        aiResponseText = response.content;
      }

      const aiMessage = { 
        id: Date.now() + 1, 
        from: 'ai' as const, 
        guideId: guide.id, 
        text: aiResponseText 
      };

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

      // 🆕 檢查問答完成徽章
      // 簡單檢測：如果 AI 回應包含某些關鍵詞，視為問答完成
      const isQuizResponse = aiResponseText.includes('正確') || 
                             aiResponseText.includes('很好') || 
                             aiResponseText.includes('答對了') ||
                             aiResponseText.includes('✨');
      
      if (isQuizResponse) {
        await triggerBadgeCheck('quiz_completed', {
          userInput: currentInput,
          aiResponse: aiResponseText,
          guideId: guide.id,
          placeId: place.id
        });
      }
    } catch (error) {
      console.error('AI 回應失敗:', error);
      // 如果 AI 服務失敗，顯示錯誤訊息
      const errorMessage = { 
        id: Date.now() + 1, 
        from: 'ai' as const, 
        guideId: guide.id, 
        text: '抱歉，我現在無法回應您的問題。請稍後再試或重新表達您的問題。' 
      };
      setMessages(prevMsgs => [...prevMsgs, errorMessage]);
      setIsTyping(false);
    }
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

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setShowScrollToBottom(!isAtBottom);
  };

  // 結束對話時顯示結束選項
  const handleEndChat = () => {
    setShowEndOptions(true);
  };

  // 生成旅程記錄
  const handleGenerateJourneyRecord = async () => {
    if (!isLoggedIn || !user?.uid || !journeySummaryService) {
      // 如果未登入或服務未初始化，顯示登入驗證
      setShowJourneyValidation(true);
      return;
    }

    try {
      setIsGeneratingJourney(true);
      setJourneyGenerationError(null);

      loggingService.info('開始生成旅程記錄', {
        userId: user.uid,
        placeId: place.id,
        placeName: place.name,
        guideId: guide.id,
        guideName: guide.name,
        messageCount: messages.length
      });

      // 🆕 導覽完成徽章檢查
      await triggerBadgeCheck('tour_completed', {
        placeId: place.id,
        placeName: place.name,
        guideId: guide.id,
        guideName: guide.name,
        messageCount: messages.length
      });

      // 準備對話消息數據（過濾掉徽章消息等特殊消息）
      const conversationMessages = messages
        .filter(msg => msg.text && msg.text.trim() && !msg.badge)
        .map(msg => ({
          id: msg.id,
          from: msg.from,
          text: msg.text,
          guideId: msg.guideId,
          timestamp: new Date()
        }));

      console.log('🔄 開始生成旅程總結...', {
        messageCount: conversationMessages.length,
        placeName: place.name,
        guideName: guide.name
      });

      // 調用旅程總結服務
      const result = await journeySummaryService.generateAndSaveJourney(
        conversationMessages,
        place.name,
        guide.name,
        user.uid
      );

      loggingService.info('旅程記錄生成成功', {
        userId: user.uid,
        journeyId: result.journeyId,
        summaryTitle: result.summary.title
      });

      console.log('✅ 旅程記錄生成成功:', result.journeyId);

      // 跳轉到旅程記錄頁面
      onNavigate && onNavigate('journeyMain', {
        newJourneyId: result.journeyId
      });

    } catch (error: any) {
      console.error('❌ 旅程記錄生成失敗:', error);
      const errorMessage = error.message || '未知錯誤';
      setJourneyGenerationError('生成旅程記錄時發生錯誤，請稍後重試');
      
      loggingService.error('Journey record generation failed', {
        userId: user?.uid,
        error: errorMessage,
        placeId: place.id,
        guideId: guide.id,
        messageCount: messages.length
      });
    } finally {
      setIsGeneratingJourney(false);
    }
  };

  // 同步狀態輔助函數
  const getSyncStatusText = (status: string): string => {
    switch (status) {
      case 'synced': return '已同步';
      case 'pending': return '待同步';
      case 'syncing': return '同步中...';
      case 'error': return '同步錯誤';
      case 'offline': return '離線';
      case 'guest': return '訪客';
      default: return '';
    }
  };

  const getSyncStatusStyle = (status: string) => {
    switch (status) {
      case 'synced': return { color: '#4CAF50' };
      case 'pending': return { color: '#FF9800' };
      case 'syncing': return { color: '#2196F3' };
      case 'error': return { color: '#F44336' };
      case 'offline': return { color: '#9E9E9E' };
      case 'guest': return { color: '#607D8B' };
      default: return { color: '#FFF' };
    }
  };

  // 開啟相機
  const openCamera = async () => {
    console.log('openCamera called');
    setShowOptions(false);
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('需要相機權限才能拍照');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      console.log('Camera result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('拍照成功，URI:', imageUri);
        
        // 添加用戶拍照訊息到聊天
        const userMessage = { 
          id: Date.now(), 
          from: 'user' as const, 
          text: '我拍了一張照片',
          image: { uri: imageUri }
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setIsTyping(true);
        
        // 更新會話
        if (currentSession) {
          currentSession.addMessage(userMessage);
        }
        
        // AI 回應照片
        const aiMessage = { 
          id: Date.now() + 1, 
          from: 'ai' as const, 
          guideId: guide.id, 
          text: '我看到你拍了一張照片！這個景點很有特色呢！你想了解更多關於這個地方的故事嗎？' 
        };
        
        setTimeout(() => {
          setMessages(prevMsgs => [...prevMsgs, aiMessage]);
          setIsTyping(false);
          
          // 更新會話
          if (currentSession) {
            currentSession.addMessage(aiMessage);
            currentSession.save().catch(error => {
              console.error('保存會話失敗:', error);
            });
          }
        }, 1500);
      }
    } catch (error) {
      console.error('拍照過程出錯:', error);
      alert('拍照失敗，請重試');
    }
  };
  // 開啟相簿
  const openLibrary = async () => {
    console.log('🎯 openLibrary called - 開始執行相簿選擇');
    setShowOptions(false);
    
    let permissionResult;
    
    try {
      console.log('📋 正在檢查媒體庫權限...');
      
      // 檢查是否可以使用圖片庫
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📋 權限結果:', permissionResult);
      
      if (permissionResult.status !== 'granted') {
        console.log('❌ 權限被拒絕:', permissionResult.status);
        alert('需要相簿權限才能選擇照片\n請在設備設定中允許存取照片');
        return;
      }
      
      console.log('✅ 權限已獲得，啟動圖片選擇器...');
      
      // 針對 iOS limited 權限使用簡化的參數
      if (permissionResult.accessPrivileges === 'limited') {
        console.log('📱 檢測到 iOS limited 權限，使用相容參數');
      }
      
      // 直接使用經過測試的有效參數組合
      const result = await ImagePicker.launchImageLibraryAsync();
      
      console.log('📸 圖片選擇結果:', JSON.stringify(result, null, 2));
      
      if (result.canceled) {
        console.log('🚫 用戶取消了選擇');
        return;
      }
      
      if (!result.assets || result.assets.length === 0) {
        console.log('❌ 沒有選擇到任何圖片');
        alert('沒有選擇到圖片，請重試');
        return;
      }
      
      const selectedAsset = result.assets[0];
      console.log('✅ 選擇成功:', {
        uri: selectedAsset.uri,
        width: selectedAsset.width,
        height: selectedAsset.height,
        fileSize: selectedAsset.fileSize
      });
      
      // 添加用戶上傳照片訊息到聊天
      const userMessage = { 
        id: Date.now(), 
        from: 'user' as const, 
        text: '我選了一張照片',
        image: { uri: selectedAsset.uri }
      };
      
      console.log('📤 正在添加用戶訊息到聊天...');
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsTyping(true);
      
      // 更新會話
      if (currentSession) {
        currentSession.addMessage(userMessage);
      }
      
      // AI 回應照片
      const aiMessage = { 
        id: Date.now() + 1, 
        from: 'ai' as const, 
        guideId: guide.id, 
        text: '哇！這張照片很棒呢！讓我來為你介紹一下照片中可能包含的歷史故事和文化背景！' 
      };
      
      console.log('🤖 準備 AI 回應...');
      setTimeout(() => {
        setMessages(prevMsgs => [...prevMsgs, aiMessage]);
        setIsTyping(false);
        
        // 更新會話
        if (currentSession) {
          currentSession.addMessage(aiMessage);
          currentSession.save().catch(error => {
            console.error('保存會話失敗:', error);
          });
        }
        console.log('✅ 圖片處理流程完成');
      }, 1500);
      
    } catch (error) {
      console.error('❌ 選擇照片過程出錯:', error);
      console.error('錯誤詳情:', error instanceof Error ? error.message : String(error));
      
      // 簡化的錯誤處理
      let errorMessage = `選擇照片失敗：${error instanceof Error ? error.message : String(error)}\n\n`;
      
      if (permissionResult?.accessPrivileges === 'limited') {
        errorMessage += `檢測到 iOS 限制權限模式\n\n建議解決方案:\n1. 設定 → 隱私與安全性 → 照片 → 本應用\n2. 選擇「所有照片」替代「已選取的照片」\n3. 重啟應用後重試`;
      } else {
        errorMessage += `請檢查:\n• 設備是否有照片\n• 應用是否有相簿權限\n• 網路連線是否正常`;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <View style={styles.container} testID="chat-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => onNavigate && onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{guide.name}</Text>
          {syncStatus !== 'disabled' && (
            <Text style={[styles.syncStatus, getSyncStatusStyle(syncStatus)]}>
              {getSyncStatusText(syncStatus)}
            </Text>
          )}
        </View>
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
          testID="messages-list"
        >
          {messages.map(msg => {
            // 🆕 徽章消息特殊處理
            if (msg.badge && msg.from === 'ai') {
              return (
                <View key={msg.id} style={[styles.messageRow, styles.aiRow]} testID="badge-message">
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={GUIDE_IMAGES[msg.guideId || guideId] || GUIDE_IMAGES.kuron}
                      style={styles.avatar}
                    />
                  </View>
                  <View style={styles.aiTextWrap}>
                    <BadgeMessage 
                      badge={msg.badge}
                      guideId={msg.guideId || guideId}
                    />
                  </View>
                </View>
              );
            }

            // 標準消息渲染
            return (
              <View key={msg.id} style={[
                styles.messageRow,
                msg.from === 'ai' ? styles.aiRow : styles.userRow
              ]}>
                {msg.from === 'ai' && (
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={GUIDE_IMAGES[msg.guideId || 'kuron'] || GUIDE_IMAGES.kuron}
                      style={styles.avatar}
                    />
                  </View>
                )}
                <View style={msg.from === 'user' ? styles.userBubble : styles.aiTextWrap}>
                  {msg.text ? (
                    <Text style={msg.from === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
                  ) : null}
                  {msg.from === 'user' && msg.image && (
                    <Image source={msg.image} style={styles.userImageCard} />
                  )}
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
            );
          })}
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
                  title={isGeneratingJourney ? "生成中..." : "生成旅程記錄"}
                  onPress={handleGenerateJourneyRecord}
                  disabled={isGeneratingJourney}
                />
                {journeyGenerationError && (
                  <Text style={styles.errorText}>{journeyGenerationError}</Text>
                )}
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
            onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 3,
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
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
  userImageCard: {
    width: 160, height: 120, borderRadius: 16, marginTop: 8, alignSelf: 'flex-end',
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
});
