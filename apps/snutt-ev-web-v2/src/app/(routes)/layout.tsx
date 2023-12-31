import '@/app/_styles/reset.css';
import '@/app/_styles/palette.css';
import '@/app/_styles/theme.css';

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import { Box } from '@/app/_components/Box';

export const metadata: Metadata = {
  title: 'SNUTT 강의평',
};

export default function RootLayout({ children }: PropsWithChildren) {
  const theme = cookies().get('theme')?.value ?? 'light';

  return (
    <html lang="ko" data-theme={theme}>
      <Box as="body">{children}</Box>
    </html>
  );
}
