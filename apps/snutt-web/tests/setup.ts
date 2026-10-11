import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// 컴포넌트 테스트는 파일 첫 줄에 `// @vitest-environment jsdom` 을 둔다. (나머지는 node 에서 돈다)
afterEach(() => cleanup());

// 테스트 파일을 동시에 돌리면 긴 목록(시간 선택 등)이 뜨는 데 기본 1초를 넘길 때가 있다
configure({ asyncUtilTimeout: 3000 });
