export interface Badge {
  id: string;
  type: string; // 成長里程碑、任務成就、探索成就等
  name: string;
  englishName: string;
  description: string;
  badgeImage: string;
  shareImage: string;
  displayType: 'modal' | 'chat';
  condition: string;
  trigger: string;
}

export interface UserBadge {
  badgeId: string;
  userId: string;
  awardedAt: Date;
  isShared?: boolean;
}

export interface BadgeAwardResult {
  success: boolean;
  badge?: Badge;
  reason?: string;
}

export type BadgeTriggerType = 
  | 'first_login' 
  | 'tour_completed' 
  | 'quiz_completed'
  | 'share_journey'
  | 'location_specific';

export interface BadgeTriggerMetadata {
  completedToursCount?: number;
  quizCorrectAnswers?: number;
  shareCount?: number;
  locationId?: string;
  [key: string]: any;
}
