# Localite APP 元件使用指南

本文件列出了 Localite APP 中所有可重複使用的 UI 元件，包含詳細的使用方法和範例。

## 📋 可重複使用元件清單

### 1. **RouteCard** - 路線卡片元件
- **檔案位置**: `components/RouteCard.tsx`
- **用途**: 顯示路線資訊，包含圖片、標題、描述和學習單標籤
- **尺寸**: W180 x H280
- **特色**: 支援學習單標籤顯示

### 2. **MiniCard** - 小型卡片元件
- **檔案位置**: `components/MiniCard.tsx`
- **用途**: 顯示小型互動卡片，包含圖示和標題
- **尺寸**: W100 x H100
- **特色**: 支援自訂圖示和標題

### 3. **ButtonOption** - 選項按鈕元件
- **檔案位置**: `components/button_option.tsx`
- **用途**: 顯示選項按鈕，用於聊天結束時的選項
- **特色**: 白色邊框，透明背景

### 4. **ButtonCamera** - 相機按鈕元件
- **檔案位置**: `components/button_camera.tsx`
- **用途**: 顯示帶有相機圖示的按鈕
- **特色**: 基於 ButtonOption 設計，但加入相機圖示

### 5. **ExhibitCard** - 展覽卡片元件
- **檔案位置**: `components/ExhibitCard.tsx`
- **用途**: 顯示展覽資訊，去除學習單內容
- **尺寸**: W180 x H230
- **特色**: 簡化版 RouteCard，專用於展覽展示

## 🎯 詳細使用指南

### RouteCard 元件

#### 基本使用
```tsx
import RouteCard from '../components/RouteCard';

<RouteCard 
  title="茶文化路線"
  description="探索茶文化的深厚底蘊，體驗製茶工藝的精髓。"
  image={require('../assets/places/shinfang.jpg')}
  worksheetRoutes={['茶葉認識', '製茶流程', '品茶技巧']}
  onSelect={() => console.log('路線被選擇')}
/>
```

#### Props 介面
```tsx
interface RouteCardProps {
  title: string;                    // 路線標題
  description: string;              // 路線描述
  image: any;                      // 路線圖片
  worksheetRoutes?: string[];      // 學習單標籤（可選）
  onPress?: () => void;            // 點擊事件
  onSelect?: () => void;           // 選擇事件
  containerStyle?: object;          // 自訂容器樣式
  disabled?: boolean;               // 禁用狀態
}
```

#### 在聊天介面中使用
```tsx
// 在 ChatScreen.tsx 中
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
          />
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  </View>
)}
```

### MiniCard 元件

#### 基本使用
```tsx
import MiniCard from '../components/MiniCard';

<MiniCard 
  title="固定路線"
  icon={require('../assets/icons/icon_mini_set.png')}
  onPress={() => console.log('MiniCard 被點擊')}
/>
```

#### Props 介面
```tsx
interface MiniCardProps {
  title: string;                   // 卡片標題
  icon: any;                      // 卡片圖示
  onPress?: () => void;           // 點擊事件
  containerStyle?: object;         // 自訂容器樣式
  iconStyle?: object;             // 自訂圖示樣式
  textStyle?: object;             // 自訂文字樣式
}
```

#### 在聊天介面中使用
```tsx
// 在 ChatScreen.tsx 中
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
```

### ButtonOption 元件

#### 基本使用
```tsx
import ButtonOption from '../components/button_option';

<ButtonOption 
  title="製作學習單"
  onPress={() => console.log('按鈕被點擊')}
/>
```

#### Props 介面
```tsx
interface ButtonOptionProps {
  title: string;                   // 按鈕文字
  onPress?: () => void;           // 點擊事件
  containerStyle?: object;         // 自訂容器樣式
  textStyle?: object;             // 自訂文字樣式
  disabled?: boolean;              // 禁用狀態
}
```

#### 在聊天結束選項中使用
```tsx
// 在 ChatScreen.tsx 中
<ButtonOption 
  title="製作學習單"
  onPress={() => onNavigate && onNavigate('learningSheet')}
/>
<ButtonOption 
  title="查看旅程"
  onPress={() => onNavigate && onNavigate('journeyDetail')}
/>
<ButtonOption 
  title="返回首頁"
  onPress={() => onClose && onClose()}
/>
```

### ButtonCamera 元件

#### 基本使用
```tsx
import ButtonCamera from '../components/button_camera';

<ButtonCamera 
  title="拍下照片"
  onPress={() => console.log('相機按鈕被點擊')}
/>
```

#### Props 介面
```tsx
interface ButtonCameraProps {
  title: string;                   // 按鈕文字
  onPress?: () => void;           // 點擊事件
  containerStyle?: object;         // 自訂容器樣式
  textStyle?: object;             // 自訂文字樣式
  iconStyle?: object;             // 自訂圖示樣式
  disabled?: boolean;              // 禁用狀態
}
```

#### 自訂樣式範例
```tsx
<ButtonCamera 
  title="主要拍照"
  onPress={() => handleCameraAction()}
  containerStyle={styles.primaryButton}
  textStyle={styles.primaryText}
  iconStyle={styles.primaryIcon}
/>
```

### ExhibitCard 元件

#### 基本使用
```tsx
import ExhibitCard from '../components/ExhibitCard';

<ExhibitCard 
  title="切茶機"
  description="切茶機便是用於茶工中將毛茶切短、葉分離。"
  image={require('../assets/places/shinfang.jpg')}
  onSelect={() => console.log('展覽被選擇')}
/>
```

#### Props 介面
```tsx
interface ExhibitCardProps {
  title: string;                   // 展覽標題
  description: string;             // 展覽描述
  image: any;                     // 展覽圖片
  onPress?: () => void;           // 點擊事件
  onSelect?: () => void;          // 選擇事件
  containerStyle?: object;         // 自訂容器樣式
  imageStyle?: object;            // 自訂圖片樣式
  titleStyle?: object;            // 自訂標題樣式
  descriptionStyle?: object;      // 自訂描述樣式
  disabled?: boolean;              // 禁用狀態
}
```

#### 平行 Slide 展示
```tsx
// 在聊天介面中使用
{msg.exhibitCards && (
  <View style={styles.exhibitCardsContainer}>
    <Text style={styles.exhibitCardsHint}>← 左右滑動查看更多展覽 →</Text>
    <FlatList
      data={msg.exhibitCards}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.exhibitCardsList}
      renderItem={({ item: card }) => (
        <View style={styles.exhibitCardWrapper}>
          <ExhibitCard
            title={card.title}
            description={card.description}
            image={card.image}
            onSelect={() => handleExhibitCardSelect(card.id)}
          />
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  </View>
)}
```

## 🎨 樣式指南

### 通用樣式設定

#### RouteCard 樣式
```tsx
routeCardsList: {
  paddingHorizontal: 16,
  paddingRight: 100, // 讓第二張卡片露出一半
},
routeCardWrapper: {
  width: 180,
  marginRight: 8,
},
```

#### MiniCard 樣式
```tsx
miniCardsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 12,
  paddingHorizontal: 8,
},
miniCardStyle: {
  marginHorizontal: 4,
},
```

#### ExhibitCard 樣式
```tsx
exhibitCardsList: {
  paddingHorizontal: 16,
  paddingRight: 100, // 讓第二張卡片露出一半
},
exhibitCardWrapper: {
  width: 180,
  marginRight: 8,
},
```

## 🔄 聊天流程整合

### 觸發邏輯

#### 1. 進入聊天介面
```tsx
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
      { id: 'fixed-route', title: '固定路線', icon: require('../assets/icons/icon_mini_set.png') },
      { id: 'free-exploration', title: '自由探索', icon: require('../assets/icons/icon_mini_free.png') }
    ]
  },
];
```

#### 2. MiniCard 選擇處理
```tsx
const handleMiniCardSelect = (cardId: string) => {
  if (cardId === 'fixed-route') {
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
        ]
      }
    ]);
  }
};
```

## 📱 預覽頁面

每個元件都有對應的預覽頁面：

- `screens/MiniCardPreviewScreen.tsx` - MiniCard 預覽
- `screens/ButtonOptionPreviewScreen.tsx` - ButtonOption 預覽
- `screens/ButtonCameraPreviewScreen.tsx` - ButtonCamera 預覽
- `screens/ExhibitCardPreviewScreen.tsx` - ExhibitCard 預覽

### 切換預覽頁面
在 `App.tsx` 中修改初始狀態：
```tsx
const [screen, setScreen] = useState<'home' | ... | 'exhibitCardPreview'>('exhibitCardPreview');
```

## 🛠️ 開發指南

### 新增元件步驟

1. **建立元件檔案**
   ```tsx
   // components/NewComponent.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   
   interface NewComponentProps {
     // 定義 props
   }
   
   const NewComponent: React.FC<NewComponentProps> = ({ ... }) => {
     return (
       <View style={styles.container}>
         {/* 元件內容 */}
       </View>
     );
   };
   
   const styles = StyleSheet.create({
     // 定義樣式
   });
   
   export default NewComponent;
   ```

2. **建立預覽頁面**
   ```tsx
   // screens/NewComponentPreviewScreen.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import NewComponent from '../components/NewComponent';
   
   export default function NewComponentPreviewScreen({ onClose }: { onClose: () => void }) {
     return (
       <View style={styles.container}>
         {/* 預覽內容 */}
       </View>
     );
   }
   ```

3. **更新 App.tsx**
   ```tsx
   import NewComponentPreviewScreen from './screens/NewComponentPreviewScreen';
   
   const [screen, setScreen] = useState<'home' | ... | 'newComponentPreview'>('newComponentPreview');
   
   if (screen === 'newComponentPreview') {
     return <NewComponentPreviewScreen onClose={() => setScreen('home')} />;
   }
   ```

4. **更新 CHANGELOG.md**
   ```markdown
   ### 新增
   - **NewComponent 元件**：描述新元件的功能
   ```

## 📋 元件清單總結

| 元件名稱 | 檔案位置 | 主要用途 | 尺寸 | 特色 |
|---------|---------|---------|------|------|
| **RouteCard** | `components/RouteCard.tsx` | 路線資訊展示 | W180 x H280 | 支援學習單標籤 |
| **MiniCard** | `components/MiniCard.tsx` | 小型互動卡片 | W100 x H100 | 圖示 + 標題 |
| **ButtonOption** | `components/button_option.tsx` | 選項按鈕 | 自適應 | 白色邊框 |
| **ButtonCamera** | `components/button_camera.tsx` | 相機按鈕 | 自適應 | 相機圖示 |
| **ExhibitCard** | `components/ExhibitCard.tsx` | 展覽資訊展示 | W180 x H230 | 簡化版卡片 |

---

**最後更新**: 2024-12-19  
**版本**: 1.0.0  
**維護者**: Localite 開發團隊 