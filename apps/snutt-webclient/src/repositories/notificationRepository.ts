import type { HttpClient } from '@/clients/HttpClient';
import type { Notification } from '@/entities/notification';

export interface NotificationRepository {
  getCount(): Promise<{ count: number }>;
  getList(): Promise<Notification[]>;
}

export const getNotificationRepository = ({ httpClient }: { httpClient: HttpClient }): NotificationRepository => {
  return {
    getCount: async () => (await httpClient.get<{ count: number }>(`/v1/notification/count`)).data,
    getList: async () => (await httpClient.get<Notification[]>(`/v1/notification`)).data,
  };
};
