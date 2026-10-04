import { Suspense } from 'react';
import { MainScreen } from '@/features/main/components/MainScreen';

export default function MainPage() {
  // MainScreen 은 URL search params 를 읽으므로 Suspense 안에 둔다 (프로덕션 빌드에서 필요)
  return (
    <Suspense>
      <MainScreen />
    </Suspense>
  );
}
