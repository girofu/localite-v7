import { Badge } from '../types/badge.types';

export const BADGES: Badge[] = [
  // 成長里程碑
  {
    id: 'B2-1',
    type: '成長里程碑',
    name: '綠芽初登場',
    englishName: 'babyron',
    description: '首次成功登入，你已解鎖「綠芽」限定導覽員，獲得「綠芽初登場」徽章',
    badgeImage: 'B2-1',
    shareImage: 'B2-1-share',
    displayType: 'modal',
    condition: '首次註冊成功',
    trigger: '首次登入/註冊後',
  },
  {
    id: 'B2-2',
    type: '成長里程碑',
    name: '探索者1號',
    englishName: 'map',
    description: '完成3次導覽，獲得「探索者1號」徽章',
    badgeImage: 'B2-2',
    shareImage: 'B2-2-share',
    displayType: 'modal',
    condition: '不限時間完成任意3個導覽點',
    trigger: '生成完成3份導覽遊記後',
  },
  {
    id: 'B2-3',
    type: '成長里程碑',
    name: '探索者2號',
    englishName: 'maginifer',
    description: '完成5次導覽，獲得「探索者2號」徽章',
    badgeImage: 'B2-3',
    shareImage: 'B2-3-share',
    displayType: 'modal',
    condition: '不限時間完成任意5個導覽點',
    trigger: '生成完成5份導覽遊記後',
  },
];

// 根據類型分組的徽章
export const BADGES_BY_TYPE = {
  '成長里程碑': BADGES.filter(badge => badge.type === '成長里程碑'),
  '任務成就': BADGES.filter(badge => badge.type === '任務成就'),
  '探索成就': BADGES.filter(badge => badge.type === '探索成就'),
  '社群分享成就': BADGES.filter(badge => badge.type === '社群分享成就'),
  '特別活動限定': BADGES.filter(badge => badge.type === '特別活動限定'),
  '特別地點限定': BADGES.filter(badge => badge.type === '特別地點限定'),
};

// 根據 ID 查找徽章的輔助函數
export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(badge => badge.id === id);
};

// 徽章條件配置
export const BADGE_CONDITIONS = {
  FIRST_LOGIN: 'B2-1',
  TOURS_COMPLETED_3: 'B2-2',
  TOURS_COMPLETED_5: 'B2-3',
  TOURS_COMPLETED_10: 'B2-4',
} as const;
