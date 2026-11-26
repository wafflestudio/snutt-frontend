'use client';

import { Suspense } from 'react';
import { MainScreen } from '@/features/main/components/MainScreen';
import { ReviewsPanel } from '@/features/main/components/ReviewsPanel';

/**
 * 강의평 탭 (8-6): 메인 화면의 목록 패널 자리에 강의평 패널을 둔다. 시간표는 메인과 같다.
 * 패널을 함수로 넘기므로 클라이언트 컴포넌트다 (서버 컴포넌트는 함수를 넘길 수 없다)
 */
export default function ReviewsPage() {
  // MainScreen 은 URL search params 를 읽으므로 Suspense 안에 둔다 (프로덕션 빌드에서 필요)
  return (
    <Suspense>
      <MainScreen aside={({ onCollapse }) => <ReviewsPanel onCollapse={onCollapse} />} />
    </Suspense>
  );
}
