'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { type MainView, parseMainView, toSearchParams } from '@/features/main/main-view';

/** history.pushState 는 Next 라우터와 연동되어 useSearchParams 가 새 값을 돌려준다. (Next 16 SPA 가이드) */
const pushParams = (params: URLSearchParams) => {
  const query = params.toString();
  window.history.pushState(null, '', query ? `?${query}` : window.location.pathname);
};

/**
 * URL 에 저장된 MainView 를 읽고 바꾼다. 바꿀 때마다 history 에 쌓여서 뒤로 가기로 되돌릴 수 있다.
 * useSearchParams 를 쓰므로 이 hook 을 쓰는 컴포넌트는 Suspense 안에 둔다.
 */
export function useMainView() {
  const searchParams = useSearchParams();
  const view = useMemo(() => parseMainView(searchParams), [searchParams]);

  const setView = useCallback((next: MainView) => pushParams(toSearchParams(next)), []);

  return { view, setView };
}
