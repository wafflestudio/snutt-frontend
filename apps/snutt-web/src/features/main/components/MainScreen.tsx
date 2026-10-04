'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { getGridRange } from '@/domain/grid-layout';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Button } from '@/shared/ui/Button';
import { IconChevronLeft, IconChevronRight, IconCompare, IconEdit } from '@/shared/ui/icons';
import { useMainView } from '@/features/main/use-main-view';
import { MainPanel } from './MainPanel';

// 시간표 데이터는 1-2 (API) 이후에 연결한다. 그때까지 빈 그리드를 보여 준다
const EMPTY_RANGE = getGridRange([]);
// 비교할 시간표는 4-3 (시간표 탭) 이후에 고른다
const COMPARE_PLACEHOLDER_ID = 'placeholder';

/** 메인 화면: 패널(목록 · 상세 · 직접 추가)과 시간표. 무엇을 보여 줄지는 URL 의 MainView 로 정한다. */
export function MainScreen() {
  const { view, setView, togglePanel } = useMainView();

  return (
    <>
      {view.panel && <MainPanel panel={view.panel} onChange={(panel) => setView({ ...view, panel })} />}

      <section className="relative flex min-w-0 flex-1">
        <button
          type="button"
          onClick={togglePanel}
          aria-label={view.panel ? '패널 접기' : '패널 펼치기'}
          aria-expanded={view.panel !== null}
          // Figma: 27 × 57, 오른쪽만 둥근 탭 모양
          className="absolute top-1/2 left-0 z-10 flex h-14.25 w-6.75 -translate-y-1/2 items-center justify-center rounded-r-[10px] border border-l-0 border-line-light bg-normal text-alternative shadow-[0_0_5px_rgb(0_0_0/10%),0_0_2px_rgb(0_0_0/10%)] focus-visible:outline-2 focus-visible:outline-snutt-mint"
        >
          {view.panel ? <IconChevronLeft className="size-5" /> : <IconChevronRight className="size-5" />}
        </button>

        <TimetableColumn
          header={
            <>
              {/* 시간표 탭은 4-3 */}
              <div />
              <div className="flex gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setView({ ...view, panel: { type: 'custom-form' } })}
                >
                  <IconEdit />
                  직접 추가
                </Button>
                {!view.compare && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setView({ ...view, compare: { right: COMPARE_PLACEHOLDER_ID } })}
                  >
                    <IconCompare />
                    시간표 비교
                  </Button>
                )}
              </div>
            </>
          }
        />

        {view.compare && (
          <TimetableColumn
            className="border-l border-line-light"
            header={
              <>
                <div />
                <Button size="sm" variant="outline" onClick={() => setView({ ...view, compare: null })}>
                  비교 종료
                </Button>
              </>
            }
          />
        )}
      </section>
    </>
  );
}

function TimetableColumn({ header, className }: { header: ReactNode; className?: string }) {
  return (
    <div className={clsx('flex min-w-0 flex-1 flex-col', className)}>
      <header className="flex h-14.25 shrink-0 items-center justify-between px-5">{header}</header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TimetableGrid range={EMPTY_RANGE} />
      </div>
    </div>
  );
}
