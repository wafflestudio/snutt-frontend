import type { SnuttV2 } from '@sf/snutt-api';
import type { Notification, NotificationType } from '@/domain/notification';
import type { AuthProvider, User } from '@/domain/user';

// v2 내 정보 · 알림 응답 → domain 타입. 서버는 null 인 필드를 보내지 않는다

const PROVIDERS: Record<SnuttV2.UserResponse['authProviders'][number], AuthProvider> = {
  LOCAL: 'local',
  KAKAO: 'kakao',
  GOOGLE: 'google',
  APPLE: 'apple',
  FACEBOOK: 'facebook',
};

export const toUser = (user: SnuttV2.UserResponse): User => ({
  nickname: user.nickname,
  nicknameTag: user.nicknameTag,
  email: user.email ?? null,
  isEmailVerified: user.isEmailVerified,
  providers: user.authProviders.map((provider) => PROVIDERS[provider]),
});

const NOTIFICATION_TYPES: Record<SnuttV2.NotificationResponse['type'], NotificationType> = {
  0: 'normal',
  1: 'coursebook',
  2: 'lecture-update',
  3: 'lecture-remove',
  4: 'link',
  5: 'friend',
  6: 'new-feature',
  // 명세에만 있고 뜻을 알 수 없다
  7: 'normal',
};

export const toNotification = (notification: SnuttV2.NotificationResponse): Notification => ({
  id: String(notification.id),
  type: NOTIFICATION_TYPES[notification.type] ?? 'normal',
  title: notification.title,
  message: notification.message,
  createdAt: new Date(notification.createdAt),
});
