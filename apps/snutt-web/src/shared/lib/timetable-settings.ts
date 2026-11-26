import { useSyncExternalStore } from 'react';
import { DEFAULT_TIMETABLE_SETTINGS, type TimetableSettings } from '@/domain/timetable-settings';

/*
 * 시간표 설정 (더보기 → 시간표 설정). 서버에 없는 이 브라우저의 설정이라 localStorage 에 둔다 (패널 폭과 같은 방식).
 * 읽거나 쓰지 못하면 기본값으로 쓴다.
 */

const STORAGE_KEY = 'snutt-web:timetable-settings';

let current: TimetableSettings | null = null;
const listeners = new Set<() => void>();

/** 저장된 값 중 모양이 맞는 것만 읽고 나머지는 기본값으로 채운다 (예전 버전이 저장한 값, 사용자가 고친 값) */
const parse = (raw: string | null): TimetableSettings => {
  const saved = (() => {
    try {
      return raw ? (JSON.parse(raw) as Partial<Record<string, unknown>>) : {};
    } catch {
      return {};
    }
  })();
  const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);
  const display = (saved.display ?? {}) as Partial<Record<string, unknown>>;
  const defaults = DEFAULT_TIMETABLE_SETTINGS;
  return {
    autoFit: bool(saved.autoFit, defaults.autoFit),
    display: {
      title: bool(display.title, defaults.display.title),
      place: bool(display.place, defaults.display.place),
      lectureNumber: bool(display.lectureNumber, defaults.display.lectureNumber),
      instructor: bool(display.instructor, defaults.display.instructor),
    },
  };
};

const read = (): TimetableSettings => {
  if (current !== null) return current;
  try {
    current = parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    current = DEFAULT_TIMETABLE_SETTINGS;
  }
  return current;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const timetableSettings = {
  set: (next: TimetableSettings) => {
    current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장하지 못해도 이번 화면에서는 바뀐 설정으로 보여 준다
    }
    listeners.forEach((listener) => listener());
  },
  /** 테스트에서 저장소를 바꾼 뒤 다시 읽게 한다 */
  reset: () => {
    current = null;
    listeners.forEach((listener) => listener());
  },
};

/** 서버 렌더링과 첫 그리기는 기본값이고, 저장된 설정은 그 뒤에 읽는다 */
export const useTimetableSettings = () => useSyncExternalStore(subscribe, read, () => DEFAULT_TIMETABLE_SETTINGS);
