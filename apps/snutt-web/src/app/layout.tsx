import type { Metadata } from 'next';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import { THEME_INIT_SCRIPT } from '@/shared/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNUTT',
  description: '서울대학교 시간표 앱',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme 은 hydration 전에 THEME_INIT_SCRIPT 가 붙이므로 서버 HTML 과 다르다
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
