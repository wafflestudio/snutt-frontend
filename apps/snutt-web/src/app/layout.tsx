import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNUTT',
  description: '서울대학교 시간표 앱',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
