'use client';

import { Suspense } from 'react';
import { MainScreen } from '@/features/main/components/MainScreen';
import { MorePanel } from '@/features/more/components/MorePanel';

export default function MainPage() {
  // MainScreen 은 URL search params 를 읽으므로 Suspense 안에 둔다 (프로덕션 빌드에서 필요)
  // 좌측 바 `더보기` 의 패널은 메인 화면의 목록 패널 자리에 열린다 (Figma `더보기` 섹션).
  // 더보기는 다른 feature 라 여기서 이어 준다. 함수를 넘기므로 이 page 는 클라이언트 컴포넌트다
  return (
    <Suspense>
      <MainScreen renderMore={(props) => <MorePanel {...props} />} />
    </Suspense>
  );
}
