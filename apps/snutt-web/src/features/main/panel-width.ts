import { useSyncExternalStore } from 'react';

/*
 * 목록 패널(검색 · 강의 목록 · 관심강좌)의 폭. 오른쪽 경계를 끌어 바꾼다.
 * 이 브라우저에서만 쓰는 편의 설정이라 localStorage 에 두고, 읽거나 쓰지 못하면 기본 폭으로 쓴다.
 */

/** Figma 의 패널 폭 */
export const PANEL_DEFAULT_WIDTH = 430;
export const PANEL_MIN_WIDTH = 320;
export const PANEL_MAX_WIDTH = 640;

const STORAGE_KEY = 'snutt-web:panel-width';

let current: number | null = null;
const listeners = new Set<() => void>();

const clamp = (width: number) => Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, Math.round(width)));

const read = (): number => {
  if (current !== null) return current;
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    current = saved ? clamp(saved) : PANEL_DEFAULT_WIDTH;
  } catch {
    current = PANEL_DEFAULT_WIDTH;
  }
  return current;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const panelWidth = {
  /** 끄는 동안 부른다. 저장은 save 에서 한다 */
  set: (width: number) => {
    const next = clamp(width);
    if (next === current) return;
    current = next;
    listeners.forEach((listener) => listener());
  },
  save: () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(read()));
    } catch {
      // 저장하지 못해도 이번 화면에서는 바뀐 폭으로 보여 준다
    }
  },
  reset: () => {
    panelWidth.set(PANEL_DEFAULT_WIDTH);
    panelWidth.save();
  },
};

/** 서버 렌더링과 첫 그리기는 기본 폭이고, 저장된 폭은 그 뒤에 읽는다 */
export const usePanelWidth = () => useSyncExternalStore(subscribe, read, () => PANEL_DEFAULT_WIDTH);
