import type { Notification } from '@/entities/notification';
import type { NotificationRepository } from '@/repositories/notificationRepository';

export interface NotificationService {
  getCount(): Promise<{ count: number }>;
  getList(): Promise<Notification[]>;
}

type Deps = { repositories: [NotificationRepository] };
export const getNotificationService = ({ repositories: [notificationRepository] }: Deps): NotificationService => {
  return {
    getCount: () => notificationRepository.getCount(),
    getList: () => notificationRepository.getList(),
  };
};
