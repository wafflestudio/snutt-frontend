import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import styled from 'styled-components';

import { IcCalendar } from '@/components/icons/ic-calendar';
import { IcExclamation } from '@/components/icons/ic-exclamation';
import { IcRecycle } from '@/components/icons/ic-recycle';
import { IcTrash } from '@/components/icons/ic-trash';
import { usePopoverContext } from '@/components/popover';
import { serviceContext } from '@/contexts/ServiceContext';
import { NotificationType } from '@/entities/notification';
import { useGuardContext } from '@/hooks/useGuardContext';
import { queryKey } from '@/utils/query-key-factory';

export const LayoutNotificationPopoverContent = () => {
  const { show } = usePopoverContext();
  const { data: notifications } = useNotificationList(show);

  return (
    <NotificationList>
      {notifications?.map((item) => (
        <NotificationListItem data-testid="layout-notification-listitem" key={item.created_at}>
          <NotificationListItemIcon>
            {
              {
                [NotificationType.NORMAL]: <IcExclamation />,
                [NotificationType.COURSEBOOK]: <IcCalendar />,
                [NotificationType.LECTURE_UPDATE]: <IcRecycle />,
                [NotificationType.LECTURE_REMOVE]: <IcTrash />,
                [NotificationType.LINK_ADDR]: <IcExclamation />,
              }[item.type]
            }
          </NotificationListItemIcon>
          <NotificationListItemContent>
            <NotificationContent>{item.message}</NotificationContent>{' '}
            <NotificationDate>{dayjs(item.created_at).format('YYYY년 MM월 DD일')}</NotificationDate>
          </NotificationListItemContent>
        </NotificationListItem>
      ))}
    </NotificationList>
  );
};

const useNotificationList = (show: boolean) => {
  const { notificationService } = useGuardContext(serviceContext);

  return useQuery({
    queryKey: queryKey('notifications'),
    queryFn: () => notificationService.getList(),
    enabled: show,
  });
};

const NotificationList = styled.ul`
  overflow-y: scroll;
  max-height: 200px;
  padding: 0;
  margin: 0;
`;

const NotificationListItem = styled.li`
  border-bottom: 1px solid #eee;
  padding: 8px 0;
  display: flex;
  transition: background-color 0.1s;

  &:hover {
    background-color: #fafafa;
  }
`;

const NotificationListItemIcon = styled.div`
  width: 30px;
  min-width: 30px;
  display: flex;
  justify-content: space-between;
  height: 100%;
  align-items: center;
`;

const NotificationListItemContent = styled.div``;

const NotificationContent = styled.span`
  font-size: 14px;
`;

const NotificationDate = styled.span`
  font-size: 12px;
  opacity: 0.4;
`;
