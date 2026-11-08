import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InlineLogin } from '@/features/auth/components/AuthGuard';
import { TimetablePickerScreen } from '@/features/timetable-picker/components/TimetablePickerScreen';

export const metadata: Metadata = { title: '시간표 선택 | SNUTT' };

/**
 * timetable-picker 페이지.
 * (main) · (auth) 레이아웃 밖에 있어 로그인 가드가 없다.
 * 로그인 여부 확인은 TimetablePickerScreen 이, 로그인 UI 는 InlineLogin 이 담당한다.
 *
 * 소비자: RN 앱(팝업 / WebView). 쿼리 ?origin=<허용된 출처>.
 */
export default function TimetablePickerPage() {
  return (
    // useSearchParams 를 쓰는 컴포넌트가 있으므로 Suspense 로 감싼다
    <Suspense>
      <TimetablePickerScreen login={<InlineLogin />} />
    </Suspense>
  );
}
