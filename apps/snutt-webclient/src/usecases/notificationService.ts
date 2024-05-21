import type { Notification } from '@/entities/notification';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';

export type NotificationService = {
  getList(_: { token: string }): UsecaseResponse<Notification[]>;
};

export const getNotificationService = ({
  notificationRepository,
}: {
  notificationRepository: {
    getList: ({ token }: { token: string }) => RepositoryResponse<{ notifications: Notification[] }>;
  };
}): NotificationService => {
  return {
    getList: async ({ token }) => {
      const data = await notificationRepository.getList({ token });
      if (data.type === 'success') return { type: 'success', data: data.data.notifications };
      else return { type: 'error', message: '오류가 발생했습니다.' };
    },
  };
};
