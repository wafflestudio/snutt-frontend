import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

// 폴더 간 경계 규칙 (CLAUDE.md "경계 규칙" 참고)
// flat config 는 같은 rule 을 뒤의 설정이 덮어쓰므로, 폴더별 설정마다 공통 제한을 함께 넣는다.
const snuttApiOnlyInApi = {
  group: ['@sf/snutt-api', '@sf/snutt-api/*'],
  message: '@sf/snutt-api 는 src/api 에서만 사용합니다.',
};
const noRelativeParent = {
  group: ['../*'],
  message: '상위 폴더는 @/ 절대 경로로 import 합니다. (경계 규칙 검사를 위해)',
};
const restrict = (...patterns) => ['error', { patterns: [snuttApiOnlyInApi, noRelativeParent, ...patterns] }];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ['src/**'],
    rules: { 'no-restricted-imports': restrict() },
  },
  {
    files: ['src/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            noRelativeParent,
            { group: ['@/features/*', '@/shared/ui/*'], message: 'api 는 UI 를 import 하지 않습니다.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/**'],
    rules: {
      'no-restricted-imports': restrict({
        group: [
          'react',
          'react-dom',
          'react/*',
          'next',
          'next/*',
          '@tanstack/*',
          '@/api/*',
          '@/features/*',
          '@/shared/*',
        ],
        message: 'domain 은 순수 TS 로 유지합니다. domain 밖의 것을 import 하지 않습니다.',
      }),
    },
  },
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': restrict({
        group: ['@/api/*', '@/features/*'],
        message: 'shared 는 api 나 feature 에 의존하지 않습니다.',
      }),
    },
  },
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts']),
]);
