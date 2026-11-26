'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { type ComponentType, type ReactNode, useEffect, useRef } from 'react';
import { getFailureMessage } from '@/api/errors';
import { notificationQueries } from '@/api/users';
import { formatNotificationDate, type NotificationType } from '@/domain/notification';
import { Button } from '@/shared/ui/Button';
import { type IconProps, IconCalendar, IconError, IconPersonAdd, IconSync, IconTrash } from '@/shared/ui/icons';
import { MoreSubPage } from './MoreLayout';

/** 종류별 아이콘. Figma 의 아이콘은 컴포넌트가 아니어서 Material Symbols 에서 비슷한 모양을 골랐다 */
const ICONS: Record<NotificationType, ComponentType<IconProps>> = {
  normal: IconError,
  coursebook: IconCalendar,
  'lecture-update': IconSync,
  'lecture-remove': IconTrash,
  link: IconError,
  friend: IconPersonAdd,
  'new-feature': IconError,
};

type NotificationsPageProps = { onBack: () => void; onClose: () => void };

/**
 * 알림 (Figma `더보기_알림`): 최근 알림부터 아이콘 · 제목(15/Semibold) · 날짜(13/Regular) · 본문(14/Regular).
 * 줄 사이 선, 커서를 올리면 Background/light. 끝에 닿으면 다음 쪽을 받는다. 알림을 눌러 이동하는 동작은 Figma 에 없다
 */
export function NotificationsPage({ onBack, onClose }: NotificationsPageProps) {
  const list = useInfiniteQuery(notificationQueries.list());
  const notifications = list.data?.pages.flatMap((page) => page.notifications) ?? [];

  return (
    <MoreSubPage title="알림" onBack={onBack} onClose={onClose}>
      {list.isPending ? (
        <Message>불러오는 중</Message>
      ) : list.isError ? (
        <Message>알림을 불러오지 못했습니다. {getFailureMessage(list.error)}</Message>
      ) : notifications.length === 0 ? (
        <Message>알림이 없습니다</Message>
      ) : (
        <ul className="-mt-2.5 flex flex-col">
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type];
            return (
              <li
                key={notification.id}
                className="flex gap-3 border-b border-line-light px-1.5 py-5 last:border-b-0 hover:bg-light"
              >
                <Icon className="mt-px size-5 shrink-0 text-plain" />
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-15-semibold break-keep text-plain">{notification.title}</p>
                    <time
                      dateTime={notification.createdAt.toISOString()}
                      className="shrink-0 text-13-regular text-assistive"
                    >
                      {formatNotificationDate(notification.createdAt)}
                    </time>
                  </div>
                  <p className="text-14-regular whitespace-pre-line text-alternative">{notification.message}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {list.hasNextPage &&
        (list.isFetchNextPageError ? (
          <Button variant="secondary" className="self-center" onClick={() => void list.fetchNextPage()}>
            다시 불러오기
          </Button>
        ) : (
          <LoadMore count={notifications.length} onVisible={() => !list.isFetching && void list.fetchNextPage()} />
        ))}
    </MoreSubPage>
  );
}

function Message({ children }: { children: ReactNode }) {
  return <p className="px-1.5 text-14-regular text-alternative">{children}</p>;
}

/** 이 자리가 보이면(끝에 닿기 조금 전) 다음 쪽을 받는다. 받은 수가 바뀌면 다시 살핀다 (강의평 목록과 같다) */
function LoadMore({ count, onVisible }: { count: number; onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  useEffect(() => {
    onVisibleRef.current = onVisible;
  });

  useEffect(() => {
    const target = ref.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && onVisibleRef.current(), {
      rootMargin: '0px 0px 200px 0px',
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [count]);

  return <div ref={ref} aria-hidden className="h-px" />;
}
