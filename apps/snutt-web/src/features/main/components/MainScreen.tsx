'use client';

import { clsx } from 'clsx';
import { type ReactNode, useMemo } from 'react';
import { getGridRange, type GridRange } from '@/domain/grid-layout';
import { getNewTimetableTitle, type Timetable } from '@/domain/timetable';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Button } from '@/shared/ui/Button';
import { IconChevronLeft, IconChevronRight, IconCompare, IconEdit } from '@/shared/ui/icons';
import { SAMPLE_PALETTE } from '@/features/main/sample-data';
import { useMainView } from '@/features/main/use-main-view';
import { useTimetables } from '@/features/main/use-timetables';
import { MainPanel } from './MainPanel';
import { AddTimetableButton, TimetableMenu } from './TimetableActions';
import { TimetableTabs } from './TimetableTabs';

/** 메인 화면: 패널(목록 · 상세 · 직접 추가)과 시간표. 무엇을 보여 줄지는 URL 의 MainView 로 정한다. */
export function MainScreen() {
  const { view, setView, togglePanel } = useMainView();
  const timetables = useTimetables();
  const { selected } = timetables;

  // 비교할 시간표는 왼쪽에서 고른 것을 뺀 같은 학기의 시간표다. URL 의 시간표가 없으면(삭제, 학기 변경) 첫 시간표를 보여 준다
  const others = timetables.timetables.filter((timetable) => timetable.id !== selected?.id);
  const compareRight = view.compare && (others.find(({ id }) => id === view.compare?.right) ?? others[0] ?? null);
  const compareTimetable = compareRight && timetables.getTimetable(compareRight.id);

  // 비교할 때는 두 시간표의 줄이 맞도록 두 시간표의 강의를 합친 범위를 같이 쓴다
  const range = useMemo(
    () =>
      getGridRange(
        [selected, compareTimetable].flatMap((timetable) =>
          (timetable?.lectures ?? []).flatMap(({ classTimes }) => classTimes),
        ),
      ),
    [selected, compareTimetable],
  );

  return (
    <>
      {view.panel && (
        <MainPanel
          panel={view.panel}
          onChange={(panel) => setView({ ...view, panel })}
          semesters={timetables.semesters}
          semester={timetables.semester}
          onSemesterChange={timetables.selectSemester}
        />
      )}

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
          timetable={selected}
          range={range}
          header={
            <>
              {/* Figma: 탭과 + 사이 10px */}
              <div className="flex min-w-0 items-center gap-2.5">
                {selected && (
                  <TimetableTabs
                    label="시간표"
                    timetables={timetables.timetables}
                    selectedId={selected.id}
                    onSelect={timetables.select}
                  />
                )}
                <AddTimetableButton
                  defaultTitle={getNewTimetableTitle(timetables.timetables.map(({ title }) => title))}
                  onCreate={timetables.create}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                {selected && (
                  <TimetableMenu
                    timetable={selected}
                    onRename={(title) => timetables.rename(selected.id, title)}
                    onSetPrimary={(isPrimary) => timetables.setPrimary(selected.id, isPrimary)}
                    onRemove={() => timetables.remove(selected.id)}
                  />
                )}
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
                    // 같은 학기에 다른 시간표가 있어야 비교할 수 있다
                    disabled={others.length === 0}
                    onClick={() => setView({ ...view, compare: { right: others[0].id } })}
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
            timetable={compareTimetable}
            range={range}
            header={
              <>
                {compareRight ? (
                  <TimetableTabs
                    label="비교할 시간표"
                    timetables={others}
                    selectedId={compareRight.id}
                    onSelect={(id) => setView({ ...view, compare: { right: id } })}
                  />
                ) : (
                  <p className="text-14-regular text-assistive">비교할 시간표가 없습니다</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setView({ ...view, compare: null })}
                >
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

type TimetableColumnProps = {
  /** null 이면 빈 그리드 (학기에 시간표가 없을 때) */
  timetable: Timetable | null;
  range: GridRange;
  header: ReactNode;
  className?: string;
};

function TimetableColumn({ timetable, range, header, className }: TimetableColumnProps) {
  return (
    <div className={clsx('flex min-w-0 flex-1 flex-col', className)}>
      <header className="flex h-14.25 shrink-0 items-center justify-between gap-2.5 px-5">{header}</header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TimetableGrid range={range}>
          {/* 색은 시간표 테마에서 받는다 (1-2 이후). 강의를 누르면 상세를 여는 것은 6-1 */}
          {timetable && <LectureLayer lectures={timetable.lectures} palette={SAMPLE_PALETTE} />}
        </TimetableGrid>
      </div>
    </div>
  );
}
