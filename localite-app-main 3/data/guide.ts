export interface Guide {
  id: string;
  id_no: string; // 導覽員編號
  name: string;
  image: any;
  description: string;
  limitedPlaces?: string[]; // 限定出現的地點id_no
  isFirstLoginOnly?: boolean; // 是否僅限首次登入用戶可見
}

export const GUIDES: Guide[] = [
  {
    id: 'kuron',
    id_no: 'g01',
    name: 'KURON',
    image: require('../assets/guides/kuron.png'),
    description: '急驚風，超想幫忙，方向感超強的小夥伴。有全方位的知識，擅長「指引」。',
  },
  {
    id: 'pururu',
    id_no: 'g02',
    name: 'PURURU',
    image: require('../assets/guides/pururu.png'),
    description: '慢悠悠，厭世但溫和的暖男小夥伴。最了解景點周邊的美食、飲品、和休息的地方。擅長「陪伴」。',
  },
  {
    id: 'popo',
    id_no: 'g03',
    name: 'POPO',
    image: require('../assets/guides/popo.png'),
    description: '害羞又聰明的小學霸，具有高度的知識，知道很多別人不知道的冷知識哦。',
  },
  {
    id: 'nikko',
    id_no: 'g04',
    name: 'NIKKO',
    image: require('../assets/guides/nikko.png'),
    description: '像日光一樣溫暖，像花苞一樣甜蜜，最擅長「鼓勵」大家的幸福小夥伴。',
  },
  {
    id: 'piglet',
    id_no: 'g06',
    name: '小豬忠忠',
    image: require('../assets/guides/piglet.png'),
    description: '來自忠寮社區的小豬忠忠，個性溫和有禮貌，身上總是帶著迷人的香味。',
    limitedPlaces: ['p03', 'p04'], // 限定在忠寮李舉人宅(p03)和忠寮竹圍仔十號宅(p04)出現
  },
  {
    id: 'babyron',
    id_no: 'g07',
    name: '綠芽',
    image: require('../assets/guides/babyron.png'),
    description: '似乎什麼都會一點的神祕小生物，擅長「撒嬌」，到哪兒都想黏著你的小夥伴。',
    isFirstLoginOnly: true, // 僅限首次登入用戶可見
  },
  // 之後可再新增更多導覽員
]; 