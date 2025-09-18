// 統一的導航類型定義
export type ScreenType = 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'badgeType' | 'badgeDetail' | 'previewBadge' | 'aboutLocalite' | 'news' | 'privacy' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'profile';

// 導航函數類型
export type NavigationFunction = (screen: ScreenType, params?: any) => void;