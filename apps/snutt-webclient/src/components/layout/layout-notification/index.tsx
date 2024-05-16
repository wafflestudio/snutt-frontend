import styled, { keyframes } from 'styled-components';

import { IcAlarm } from '@/components/icons/ic-alarm';
import { Popover } from '@/components/popover';

import { LayoutNotificationPopoverContent } from './layout-notification-popover-content';

export const LayoutNotification = () => {
  return (
    <Popover>
      <TransparentButton>
        <NotificationIcon data-testid="layout-notification" />
      </TransparentButton>
      <Pop>
        알림
        <LayoutNotificationPopoverContent />
      </Pop>
    </Popover>
  );
};

const shake = keyframes`
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(-30deg);
    opacity: 0.6;
  }
  30% {
    transform: rotate(30deg);
    opacity: 0.9;
  }
  50% {
    transform: rotate(-30deg);
  }
  70% {
    transform: rotate(30deg);
    opacity: 0.5;
  }
  100% {
    transform: rotate3d(1, 1, 1, 360deg);
  }
`;

const NotificationIcon = styled(IcAlarm)`
  opacity: 0.6;
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    opacity: 1;
    animation: ${shake} 1s infinite linear;
  }
`;

const TransparentButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 0;
`;

const Pop = styled(Popover.Pop)`
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  right: -120px;
  box-shadow: 0 2px 4px #888;
`;
