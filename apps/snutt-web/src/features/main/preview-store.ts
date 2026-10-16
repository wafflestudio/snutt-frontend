import { useSyncExternalStore } from 'react';
import type { Lecture } from '@/domain/lecture';

/*
 * 검색 패널과 시간표 그리드가 함께 보는 미리보기 상태 (5-2). 검색 결과에서 커서를 올린(또는 포커스가 간) 강의다.
 * 커서가 움직일 때마다 바뀌므로 메인 화면 전체가 아니라 usePreviewLecture 를 쓰는 미리보기 레이어만 다시 그린다.
 *
 * Zustand 대신 React 의 useSyncExternalStore 로 만들었다. zustand 를 snutt-web 에 넣으면(nohoist 포함)
 * Yarn 1 의 hoisting 이 바뀌어 루트 @types/react 가 19 가 되고, React 18 인 다른 앱의 타입 검사가 깨진다. (CLAUDE.md "상태 관리")
 */

let current: Lecture | null = null;
const listeners = new Set<() => void>();

const set = (lecture: Lecture | null) => {
  if (lecture === current) return;
  current = lecture;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const preview = {
  show: (lecture: Lecture) => set(lecture),
  /** 그 강의를 보여 주는 중일 때만 지운다. 다른 강의로 옮겨 간 뒤 늦게 온 leave 가 새 미리보기를 지우지 않게 한다 */
  hide: (lecture: Lecture) => current?.id === lecture.id && set(null),
  clear: () => set(null),
};

/** 미리 보여 줄 강의. 바뀔 때만 다시 그린다 */
export const usePreviewLecture = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
