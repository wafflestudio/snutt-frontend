import { ApiError } from './client';

/** 실패한 요청을 사용자에게 알릴 말. 서버가 준 메시지(detail)가 있으면 그것을 쓴다 */
export const getFailureMessage = (error: Error) =>
  error instanceof ApiError ? (error.detail ?? error.title) : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요';

/** 이메일 인증을 하지 않아 강의평을 볼 수 없다 (강의평 API 전부 403 `email-not-verified`) */
export const isEmailNotVerified = (error: unknown) =>
  error instanceof ApiError && error.type === '/problems/email-not-verified';
