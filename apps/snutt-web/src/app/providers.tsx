'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createQueryClient } from '@/api/query-client';

export function Providers({ children }: { children: ReactNode }) {
  // 요청마다(서버) · 탭마다(브라우저) 하나씩
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
