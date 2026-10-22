import { useSyncExternalStore } from 'react';

/*
 * 필터 모달 `학과` 의 즐겨찾기(★). 서버에 저장하는 API 가 없어 이 브라우저에만 둔다 (디자인 문의 4-21).
 * 개인 정보가 아니고 잃어도 다시 고르면 되므로 localStorage 에 두고, 읽거나 쓰지 못하면 즐겨찾기 없이 쓴다.
 */

const STORAGE_KEY = 'snutt-web:favorite-departments';
const EMPTY: readonly string[] = [];

let current: readonly string[] | null = null;
const listeners = new Set<() => void>();

const read = (): readonly string[] => {
  if (current) return current;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    current = Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string') : EMPTY;
  } catch {
    current = EMPTY;
  }
  return current;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** 학과를 즐겨찾기에 넣거나 뺀다. 넣은 순서대로 보여 준다 */
export const toggleFavoriteDepartment = (department: string) => {
  const list = read();
  current = list.includes(department) ? list.filter((item) => item !== department) : [...list, department];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // 저장하지 못해도 이번 화면에서는 바뀐 대로 보여 준다
  }
  listeners.forEach((listener) => listener());
};

export const useFavoriteDepartments = () => useSyncExternalStore(subscribe, read, () => EMPTY);
