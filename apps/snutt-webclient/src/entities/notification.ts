export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
}

type NotificationType =
  /** detail이 null인 일반 텍스트 알림입니다(홍보 등). */
  | 'NORMAL'
  /** 수강편람이 추가되었을 때 모든 유저에게 전송되는 전역 알림입니다(eg.17년 1학기 수강편람이 새로 나왔습니다). */
  | 'COURSEBOOK'
  /** 내 시간표에 있는 강좌가 업데이트되었을 때 강의별로 전송되는 개인 알림입니다. */
  | 'LECTURE_UPDATE'
  /** 내 시간표에 있는 강좌가 삭제되었을 때 강의별로 전송되는 개인 알림입니다. */
  | 'LECTURE_REMOVE'
  /** 사용자가 알람을 누르면 특정 링크로 연결되는 알림입니다. */
  | 'LINK_ADDR';
