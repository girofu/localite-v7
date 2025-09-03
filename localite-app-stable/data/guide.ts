export interface Guide {
  id: string;
  name: string;
  image: any;
  description: string;
}

export const GUIDES: Guide[] = [
  {
    id: 'kuron',
    name: 'KURON',
    image: require('../assets/guides/kuron.png'),
    description: '急驚風，超想幫忙，方向感超強的小夥伴。有全方位的知識，擅長「指引」。',
  },
  {
    id: 'pururu',
    name: 'PURURU',
    image: require('../assets/guides/pururu.png'),
    description: '慢悠悠，厭世但溫和的暖男小夥伴。最了解景點周邊的美食、飲品、和休息的地方。擅長「陪伴」。',
  },
  {
    id: 'popo',
    name: 'POPO',
    image: require('../assets/guides/popo.png'),
    description: '害羞又聰明的小學霸，具有高度的知識，知道很多別人不知道的冷知識哦。',
  },
  {
    id: 'nikko',
    name: 'NIKKO',
    image: require('../assets/guides/nikko.png'),
    description: '像日光一樣溫暖，像花苞一樣甜蜜，最擅長「鼓勵」大家的幸福小夥伴。',
  },
  {
    id: 'tea-abe',
    name: '茶農阿伯',
    image: require('../assets/guides/tea-abe.png'),
    description: '有著40年種茶與經營經驗的茶農阿伯，有關茶葉的所有小知識問他就對了！',
  },
  {
    id: 'piglet',
    name: '小豬忠忠',
    image: require('../assets/guides/piglet.png'),
    description: '來自忠寮社區的小豬忠忠，個性溫和有禮貌，身上總是帶著迷人的香味。',
  },
  // 之後可再新增更多導覽員
]; 