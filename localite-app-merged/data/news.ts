export interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  createdAt: string;
}

export const newsData: NewsItem[] = [
  {
    id: 'n005',
    title: '【忠寮專屬】限定版AI導覽員出沒，立即登入收藏他！',
    date: '2025.09.05',
    content: '嗯？這個背影究竟是誰！現在登入Localite 開啟忠寮社區導覽，就有機會收集專屬限定 AI 導覽員，現在就來體驗 Localite AI 導覽，體驗全新不同的遊戲互動導覽體驗吧～',
    image: 'n005',
    createdAt: '2025.09.05'
  },
  {
    id: 'n004',
    title: '淡水古蹟區上線！一起探索忠寮社區之美',
    date: '2025.09.05',
    content: '全新上線的「淡水古蹟區」導覽，特別串連忠寮社區的步行路線，帶大家以全新角度探索淡水古蹟與居民生活日常的連結。\n\n忠寮社區隱身在淡水河畔的山腳下，村里之間保留了早期古厝的生活痕跡。漫步其中，可以看見居民親手維護古厝，還能感受到山林田野氛圍。這裡是一般觀光客甚少涉足的秘境，卻收納了許古史與文物，以及饒富文采的詩歌風情。快和Localite一起踏上忠寮社區的新旅程，發現忠寮社區的獨特之美吧！',
    image: 'n004',
    createdAt: '2025.09.04'
  },
  {
    id: 'n003',
    title: '徽章系統正式啟用！快來解鎖專屬成就徽章',
    date: '2025.09.03',
    content: 'Localite徽章系統正式上線！完成導覽任務、探索新景點、與導覽員互動，都有機會獲得專屬徽章。從「初探者」到「文化達人」，每個徽章都記錄著您的導覽成就。快來挑戰各種任務，收集屬於您的專屬徽章吧！',
    image: 'n003',
    createdAt: '2025.09.03'
  },
  {
    id: 'n002',
    title: 'AI導覽員正式登場！導覽體驗就像遊戲一樣好玩',
    date: '2025.09.03',
    content: 'Localite隆重推出四位專屬AI導覽員：急驚風Kuron、甜蜜Nikki、慢悠悠的Pururu，以及害羞的Popo。每位導覽員都有獨特的個性和專業領域，為您量身打造最適合的導覽內容。想一探他們的樣貌嗎？快來選擇您最喜歡的導覽員，開啟你的導覽遊戲體驗吧！',
    image: 'n002',
    ctaText: '了解更多',
    ctaLink: 'https://localite.ai/news',
    createdAt: '2025.09.03'
  },
  {
    id: 'n001',
    title: '🎉 Localite正式上線！全新導覽體驗等你來探索',
    date: '2025.09.01',
    content: 'Localite導覽應用程式正式上線！我們為您帶來全新的數位導覽體驗，結合可愛趣味的AI導覽員、QR Code掃描、互動聊天等創新功能。無論是古蹟巡禮還是深度文化探索，Localite都能為您提供最貼心的導覽服務。立即下載體驗，開啟您的智慧導覽之旅！',
    image: 'n001',
    createdAt: '2025.09.01'
  }
];

// 圖片資源對應表
export const newsImages: { [key: string]: any } = {
  n001: require('../assets/news/n001.png'),
  n002: require('../assets/news/n002.png'),
  n003: require('../assets/news/n003.png'),
  n004: require('../assets/news/n004.png'),
  n005: require('../assets/news/n005.png')
};
