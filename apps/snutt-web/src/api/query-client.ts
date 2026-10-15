import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

/** 4xx 는 다시 보내도 결과가 같으므로 재시도하지 않는다. 네트워크 오류 · 5xx 만 두 번까지 */
export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 && !(error instanceof ApiError && error.status < 500);

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: shouldRetry },
    },
  });
