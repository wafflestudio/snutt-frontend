'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { getFailureMessage } from '@/api/errors';
import { type ReactNode, useMemo } from 'react';
import type { ColorPair } from '@/domain/color';
import { getGridRange, type GridRange } from '@/domain/grid-layout';
import type { TimetableLecture } from '@/domain/lecture';
import { toSemesterKey } from '@/domain/semester';
import { getNewTimetableTitle, type Timetable } from '@/domain/timetable';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { PreviewLayer } from '@/shared/timetable-grid/PreviewLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Button } from '@/shared/ui/Button';
import { NoticeDialog } from '@/shared/ui/Dialog';
import { IconChevronLeft, IconChevronRight, IconCompare, IconEdit } from '@/shared/ui/icons';
import { DEFAULT_PANEL } from '@/features/main/main-view';
import { usePreviewLecture } from '@/features/main/preview-store';
import { useMainView } from '@/features/main/use-main-view';
import { useTimetableDetail, useTimetables } from '@/features/main/use-timetables';
import { CustomLectureForm } from './CustomLectureForm';
import { LectureDetailPanel } from './LectureDetailPanel';
import { MainPanel } from './MainPanel';
import { SearchPanel } from './SearchPanel';
import { AddTimetableButton, TimetableMenu } from './TimetableActions';
import { TimetableTabs } from './TimetableTabs';

/** 메인 화면: 패널(목록 · 상세 · 직접 추가)과 시간표. 무엇을 보여 줄지는 URL 의 MainView 로 정한다. */
export function MainScreen() {
  const { view, setView, togglePanel } = useMainView();
  const timetables = useTimetables();
  const { selected, selectedSummary } = timetables;
  const palette = timetables.paletteOf(selected);

  // 비교할 시간표는 왼쪽에서 고른 것을 뺀 같은 학기의 시간표다. URL 의 시간표가 없으면(삭제, 학기 변경) 첫 시간표를 보여 준다
  const others = timetables.timetables.filter((timetable) => timetable.id !== selectedSummary?.id);
  const compareRight = view.compare && (others.find(({ id }) => id === view.compare?.right) ?? others[0] ?? null);
  const compareTimetable = useTimetableDetail(compareRight ?? null);

  // 강의 상세는 지금은 고른 시간표의 강의만 연다 (검색 결과의 상세는 5-1). 없는 강의면 열지 않는다
  const listPanel = view.panel?.type === 'list' ? view.panel : null;
  const detailLecture = listPanel?.detail && selected?.lectures.find(({ id }) => id === listPanel.detail?.lectureId);
  const openDetail = (lecture: TimetableLecture) =>
    setView({
      ...view,
      panel: {
        type: 'list',
        tab: listPanel?.tab ?? 'search',
        detail: { lectureId: lecture.id, view: 'info', editing: false },
      },
    });

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

  if (timetables.status === 'loading') return <MainMessage>불러오는 중</MainMessage>;
  if (timetables.status === 'unauthorized')
    return (
      <MainMessage>
        로그인이 필요합니다
        {/* 보통은 토큰이 지워지면서 RequireSignIn 이 먼저 로그인 화면으로 보낸다 */}
        <Link href="/login" className="text-snutt-mint underline">
          로그인하기
        </Link>
      </MainMessage>
    );
  if (timetables.status === 'error' || !timetables.semester)
    return (
      <MainMessage>
        시간표를 불러오지 못했습니다
        {timetables.error && <span className="text-13-regular">{getFailureMessage(timetables.error)}</span>}
      </MainMessage>
    );

  return (
    // group/main: 패널에 커서를 올리면 패널 접기 버튼을 보여 준다
    <div className="group/main flex min-w-0 flex-1">
      <NoticeDialog
        open={timetables.failure !== null}
        onOpenChange={(open) => !open && timetables.dismissFailure()}
        message={timetables.failure}
      />
      {view.panel?.type === 'custom-form' ? (
        <CustomLectureForm
          // 다른 시간표로 바꾸면 입력을 처음부터 다시 받는다
          key={selected?.id}
          timetable={selected}
          palette={palette}
          onSubmit={(input) => {
            if (!selected) return;
            // 실패하면 입력을 그대로 두고 알림을 띄운다
            timetables.addCustomLecture(selected.id, input, () => setView({ ...view, panel: DEFAULT_PANEL }));
          }}
          onBack={() => setView({ ...view, panel: DEFAULT_PANEL })}
          onClose={() => setView({ ...view, panel: null })}
        />
      ) : (
        listPanel && (
          <>
            <MainPanel
              panel={listPanel}
              onChange={(panel) => setView({ ...view, panel })}
              semesters={timetables.semesters}
              semester={timetables.semester}
              onSemesterChange={timetables.selectSemester}
              search={
                <SearchPanel
                  // 학기를 바꾸면 검색어를 지운다
                  key={toSemesterKey(timetables.semester)}
                  semester={timetables.semester}
                  timetable={selected}
                  onAdd={(lecture, options) => selected && timetables.addLecture(selected.id, lecture.id, options)}
                  onRemove={(lecture) => selected && timetables.removeLecture(selected.id, lecture.id)}
                  onFailure={timetables.notifyFailure}
                />
              }
            />
            {selected && listPanel.detail && detailLecture && (
              <LectureDetailPanel
                // 다른 강의를 열면 삭제 확인 같은 상태를 처음부터 다시 둔다
                key={detailLecture.id}
                detail={listPanel.detail}
                lecture={detailLecture}
                semester={selected.semester}
                palette={palette}
                timetableLectures={selected.lectures}
                onChange={(detail) => setView({ ...view, panel: { ...listPanel, detail } })}
                onClose={() => setView({ ...view, panel: null })}
                onColorChange={(color) => timetables.updateLecture(selected.id, detailLecture.id, { color })}
                onSave={(change, done) => timetables.updateLecture(selected.id, detailLecture.id, change, done)}
                onRemove={() =>
                  timetables.removeLecture(selected.id, detailLecture.id, () =>
                    setView({ ...view, panel: { ...listPanel, detail: null } }),
                  )
                }
              />
            )}
          </>
        )
      )}

      <section className="relative flex min-w-0 flex-1">
        {/*
          패널 접기 · 펼치기. 펼쳐 둘 때는 시각 숫자를 가리지 않도록 숨겨 두고, 패널이나 그리드 왼쪽 가장자리(시각 숫자 칸)에
          커서를 올리거나 포커스가 가면 보인다. 접혀 있을 때는 늘 보인다. (디자인 문의 4-5)
        */}
        <div className="group/edge absolute top-14 bottom-0 left-0 z-10 w-8.75">
          <button
            type="button"
            onClick={togglePanel}
            aria-label={view.panel ? '패널 접기' : '패널 펼치기'}
            aria-expanded={view.panel !== null}
            // Figma: 27 × 57, 오른쪽만 둥근 탭 모양
            className={clsx(
              'absolute top-1/2 left-0 flex h-14.25 w-6.75 -translate-y-1/2 items-center justify-center rounded-r-[10px] border border-l-0 border-line-light bg-normal text-alternative shadow-[0_0_5px_rgb(0_0_0/10%),0_0_2px_rgb(0_0_0/10%)] transition-opacity focus-visible:outline-2 focus-visible:outline-snutt-mint',
              view.panel &&
                'opacity-0 group-hover/edge:opacity-100 group-has-[aside:hover]/main:opacity-100 focus-visible:opacity-100',
            )}
          >
            {view.panel ? <IconChevronLeft className="size-5" /> : <IconChevronRight className="size-5" />}
          </button>
        </div>

        <TimetableColumn
          timetable={selected}
          palette={palette}
          range={range}
          onLectureClick={openDetail}
          // 검색 결과는 왼쪽(고른) 시간표에 담기므로 미리보기도 왼쪽에만
          overlay={<SearchPreview />}
          header={
            <>
              {/* Figma: 탭과 + 사이 10px */}
              <div className="flex min-w-0 items-center gap-2.5">
                {selectedSummary && (
                  <TimetableTabs
                    label="시간표"
                    timetables={timetables.timetables}
                    selectedId={selectedSummary.id}
                    onSelect={timetables.select}
                  />
                )}
                <AddTimetableButton
                  defaultTitle={getNewTimetableTitle(timetables.timetables.map(({ title }) => title))}
                  onCreate={timetables.create}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                {selectedSummary && (
                  <TimetableMenu
                    timetable={selectedSummary}
                    onRename={(title) => timetables.rename(selectedSummary.id, title)}
                    onSetPrimary={(isPrimary) => timetables.setPrimary(selectedSummary.id, isPrimary)}
                    onRemove={() => timetables.remove(selectedSummary.id)}
                  />
                )}
                {/* 비교 중에는 Figma `top` 의 `메인 시간표` 변형처럼 탭 · + · ··· 만 둔다 */}
                {!view.compare && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setView({ ...view, panel: { type: 'custom-form' } })}
                    >
                      <IconEdit />
                      직접 추가
                    </Button>
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
                  </>
                )}
              </div>
            </>
          }
        />

        {view.compare && (
          <TimetableColumn
            className="border-l border-line-light"
            timetable={compareTimetable}
            palette={timetables.paletteOf(compareTimetable)}
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
                  <IconCompare />
                  비교 종료
                </Button>
              </>
            }
          />
        )}
      </section>
    </div>
  );
}

type TimetableColumnProps = {
  /** null 이면 빈 그리드 (학기에 시간표가 없을 때, 받는 중일 때) */
  timetable: Timetable | null;
  /** 시간표 테마의 색 */
  palette: readonly ColorPair[];
  range: GridRange;
  header: ReactNode;
  /** 없으면 강의 블록을 누를 수 없다 (비교의 오른쪽) */
  onLectureClick?: (lecture: TimetableLecture) => void;
  /** 강의 블록 위에 겹쳐 그릴 레이어 (검색 미리보기) */
  overlay?: ReactNode;
  className?: string;
};

function TimetableColumn({
  timetable,
  palette,
  range,
  header,
  onLectureClick,
  overlay,
  className,
}: TimetableColumnProps) {
  return (
    <div className={clsx('flex min-w-0 flex-1 flex-col', className)}>
      {/* Figma `top`: 높이 56, 여백 13 · 20 */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2.5 px-5">{header}</header>
      {/* 그리드는 남은 높이에 맞춰 칸을 나눈다. 스크롤하지 않는다 */}
      <div className="min-h-0 flex-1">
        <TimetableGrid range={range} className="h-full">
          {timetable && (
            <LectureLayer lectures={timetable.lectures} palette={palette} onLectureClick={onLectureClick} />
          )}
          {overlay}
        </TimetableGrid>
      </div>
    </div>
  );
}

/** 검색 결과에서 커서를 올린 강의의 자리 (5-2). 미리보기 상태는 여기서만 읽어 이 레이어만 다시 그린다 */
function SearchPreview() {
  return <PreviewLayer lecture={usePreviewLecture()} />;
}

/** 시간표 자리 대신 보여 주는 안내 (불러오는 중, 로그인 필요, 실패) */
function MainMessage({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-14-regular text-alternative">
      {children}
    </section>
  );
}
