import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 컴포넌트 테스트는 파일 첫 줄에 `// @vitest-environment jsdom` 을 둔다. (나머지는 node 에서 돈다)
afterEach(() => cleanup());
