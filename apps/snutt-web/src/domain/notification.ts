/**
 * 알림의 종류. 아이콘을 고르는 데 쓴다 (snutt-webclient 의 v1 매핑과 같은 순서).
 * 서버 명세의 7 은 뜻을 알 수 없어 normal 로 읽는다.
 */
export type NotificationType =
  'normal' | 'coursebook' | 'lecture-update' | 'lecture-remove' | 'link' | 'friend' | 'new-feature';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
};

const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  // 학교 시간으로 보여 준다. 테스트도 컴퓨터 시간대와 관계없이 같은 글자가 나온다
  timeZone: 'Asia/Seoul',
});

/** Figma `더보기_알림`: `2026. 8. 27. 오전 10:28` */
export const formatNotificationDate = (date: Date) => DATE_FORMAT.format(date);
