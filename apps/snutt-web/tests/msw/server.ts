import { setupServer } from 'msw/node';

/** vitest.config.mts 의 NEXT_PUBLIC_API_BASE_URL */
export const API_BASE_URL = 'https://snutt-api.test';

/** `api('/v2/timetables')` → MSW 핸들러에 쓸 전체 주소 */
export const api = (path: string) => `${API_BASE_URL}${path}`;

export const server = setupServer();
