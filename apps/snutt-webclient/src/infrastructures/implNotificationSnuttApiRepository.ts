import { type SnuttApi } from '@sf/snutt-api';

import { type Notification } from '@/entities/notification';
import { type getNotificationService } from '@/usecases/notificationService';

export const getNotificationRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getNotificationService>[0]['notificationRepository'] => {
  return {
    getList: async ({ token }) => {
      const { status, data } = await snuttApi['GET /v1/notification']({ token });
      if (status === 200) {
        const typeMap: Record<(typeof data)[number]['type'], Notification['type']> = {
          0: 'NORMAL',
          1: 'COURSEBOOK',
          2: 'LECTURE_UPDATE',
          3: 'LECTURE_REMOVE',
          4: 'LINK_ADDR',
          5: 'FRIEND',
          6: 'NEW_FEATURE',
        };

        return {
          type: 'success',
          data: {
            notifications: data.map((notification) => ({
              id: notification._id,
              title: notification.title,
              message: notification.message,
              createdAt: new Date(notification.created_at),
              type: typeMap[notification.type],
            })),
          },
        };
      }

      return { type: 'error', errcode: data.errcode };
    },
  };
};
