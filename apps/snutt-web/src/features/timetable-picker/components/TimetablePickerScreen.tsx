'use client';

/**
 * timetable-picker 메인 화면.
 *
 * 순서: origin 검사 → signedIn null(빈 화면) → false(login 슬롯) → true(picker).
 * URL 을 바꾸지 않는 인라인 렌더링 (RN WebView 내비게이션 가로채기 회피).
 *
 * props:
 *   login  — 미로그인 상태일 때 보여 줄 슬롯 (InlineLogin 등)
 */
import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSignedIn } from '@/api/auth';
import { isAllowedOrigin, PICKER_ALLOWED_ORIGINS } from '@/features/timetable-picker/allowed-origins';
import { createPickerMessage } from '@/features/timetable-picker/picker-message';
import { resolvePickerTarget, sendPickerMessage } from '@/features/timetable-picker/picker-target';
import { usePickerTimetables } from '@/features/timetable-picker/use-picker-timetables';
import { PickerPreview } from './PickerPreview';
import { PickerTimetableList } from './PickerTimetableList';

type Props = {
  /** 미로그인 상태에서 보여 줄 로그인 UI */
  login: ReactNode;
};

export function TimetablePickerScreen({ login }: Props) {
  const searchParams = useSearchParams();
  // origin 쿼리 값은 처음 읽은 값으로 고정 (RN WebView URL 변경 방지)
  // useRef 를 render 중에 .current 로 읽으면 react-hooks/refs 오류가 발생하므로 useState 를 쓴다
  const [origin] = useState<string | null>(() => searchParams.get('origin'));

  const signedIn = useSignedIn();

  if (!isAllowedOrigin(origin)) {
    return (
      <div className="flex h-screen items-center justify-center bg-normal">
        <p className="text-16-regular text-normal">허용되지 않은 요청입니다</p>
      </div>
    );
  }

  // SSR / 첫 hydration 에서는 토큰을 읽을 수 없으므로 빈 화면
  if (signedIn === null) return null;

  // 미로그인: 인라인 로그인 슬롯 표시
  if (!signedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-normal">
        <div className="w-full max-w-sm">{login}</div>
      </div>
    );
  }

  return <PickerContent origin={origin} />;
}

/** origin 검사와 로그인 확인이 끝난 뒤 실제 picker UI */
function PickerContent({ origin }: { origin: string }) {
  const { status, error, timetables, selectedSummary, selectedDetail, isDetailLoading, palette, select } =
    usePickerTimetables();
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const onConfirm = () => {
    if (!selectedDetail) return;

    const target = resolvePickerTarget(window);
    if (!target) {
      setConfirmError('시간표를 요청한 창을 찾을 수 없습니다. 창을 닫고 다시 시도해주세요.');
      return;
    }

    const message = createPickerMessage(selectedDetail);
    sendPickerMessage(target, message, origin, PICKER_ALLOWED_ORIGINS);
    window.close();
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-normal">
        <p className="text-14-regular text-alternative">불러오는 중</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-screen items-center justify-center bg-normal">
        <p role="alert" className="text-14-regular text-warning">
          {error instanceof Error ? error.message : '오류가 발생했습니다'}
        </p>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="flex h-screen bg-normal">
        <div className="flex w-75 items-center justify-center border-r border-line-divider bg-bg-normal">
          <p className="text-14-regular text-alternative">시간표가 없습니다</p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-14-regular text-alternative">시간표를 만들어주세요</p>
        </div>
      </div>
    );
  }

  // md 이상: 왼쪽 300px 목록 + 오른쪽 그리드. 좁은 화면(RN): 세로 배치
  return (
    <div className="flex h-screen flex-col bg-normal md:flex-row">
      {/* 왼쪽: 시간표 목록 */}
      <div className="border-b border-line-divider bg-bg-normal md:w-75 md:border-b-0 md:border-r md:overflow-y-auto">
        <PickerTimetableList
          timetables={timetables}
          selectedId={selectedSummary?.id ?? null}
          onSelect={select}
        />
      </div>

      {/* 오른쪽: 미리보기 + 확인 */}
      <PickerPreview
        timetable={selectedDetail}
        palette={palette}
        isLoading={isDetailLoading}
        confirmError={confirmError}
        onConfirm={onConfirm}
      />
    </div>
  );
}
