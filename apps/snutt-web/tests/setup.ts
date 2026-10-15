import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

// 컴포넌트 테스트는 파일 첫 줄에 `// @vitest-environment jsdom` 을 둔다. (나머지는 node 에서 돈다)
afterEach(() => cleanup());

// 테스트 파일을 동시에 돌리면 긴 목록(시간 선택 등)이 뜨는 데 기본 1초를 넘길 때가 있다
configure({ asyncUtilTimeout: 3000 });

// API 요청은 MSW 가 받는다. 테스트마다 server.use(...) 로 응답을 정하고, 정하지 않은 요청은 실패시킨다
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
