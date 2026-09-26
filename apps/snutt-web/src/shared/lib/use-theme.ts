'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { type Theme, THEME_STORAGE_KEY } from '@/shared/lib/theme';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};

const getSnapshot = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

// 서버는 테마를 모른다. (브라우저 설정과 localStorage 로 정해짐)
const getServerSnapshot = () => null;

/** 현재 테마. 서버 렌더링과 hydration 중에는 null 이다. */
export const useTheme = () => {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 저장하지 못해도 지금 화면에는 적용된다
    }
  }, []);

  return { theme, setTheme };
};
