import { ApiError } from './client';

/** 실패한 요청을 사용자에게 알릴 말. 서버가 준 메시지(detail)가 있으면 그것을 쓴다 */
export const getFailureMessage = (error: Error) =>
  error instanceof ApiError ? (error.detail ?? error.title) : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요';
