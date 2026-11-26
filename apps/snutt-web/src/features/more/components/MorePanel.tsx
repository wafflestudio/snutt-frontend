'use client';

import type { MorePage } from '@/shared/lib/more-page';
import { AccountPage } from './AccountPage';
import { ColorModePage } from './ColorModePage';
import { FeedbackPage } from './FeedbackPage';
import { MoreMenu } from './MoreMenu';
import { NotificationsPage } from './NotificationsPage';
import { TimetableSettingsPage } from './TimetableSettingsPage';

type MorePanelProps = {
  page: MorePage;
  onNavigate: (page: MorePage) => void;
  /** `×` 와 패널 접기 */
  onCollapse: () => void;
};

/**
 * 좌측 바 `더보기` 의 패널 (Figma `더보기` 섹션). 메인 화면의 목록 패널 자리에 열리고, 옆의 시간표는 그대로 보인다.
 * 어느 화면인지는 URL(MainView 의 panel.page)이 갖는다. 안의 화면은 `<` 로 목록에 돌아가고 `×` 로 패널을 접는다.
 */
export function MorePanel({ page, onNavigate, onCollapse }: MorePanelProps) {
  const sub = { onBack: () => onNavigate('menu'), onClose: onCollapse };
  switch (page) {
    case 'menu':
      return <MoreMenu onNavigate={onNavigate} onCollapse={onCollapse} />;
    case 'account':
      return <AccountPage {...sub} />;
    case 'notifications':
      return <NotificationsPage {...sub} />;
    case 'color-mode':
      return <ColorModePage {...sub} />;
    case 'timetable-settings':
      return <TimetableSettingsPage {...sub} />;
    case 'feedback':
      return <FeedbackPage {...sub} />;
  }
}
