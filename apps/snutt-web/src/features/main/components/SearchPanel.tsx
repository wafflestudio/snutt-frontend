'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { lectureQueries } from '@/api/lectures';
import { EMPTY_TIME_FILTER, isTimeFilterEmpty, toSearchTimes } from '@/domain/time-filter';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { SearchField } from '@/shared/ui/SearchField';
import { preview } from '@/features/main/preview-store';
import { type LectureCellsOptions, useLectureCells } from '@/features/main/use-lecture-cells';
import { LectureCell } from './LectureCell';
import { TimeSearchChips, TimeSearchFilterButton } from './TimeSearchDialog';

/** 검색어를 다 친 뒤 이만큼 기다렸다가 검색한다 (ms) */
const SEARCH_DELAY = 300;

type SearchPanelProps = Omit<LectureCellsOptions, 'onBookmarkAdded'> & {
  /** 관심강좌에 넣은 뒤 `관심강좌 탭으로 이동하시겠습니까?` 에 확인하면 부른다 */
  onGoToBookmarks: () => void;
};

/**
 * 검색 탭 (Figma `검색 목록 영역`): 검색창과 결과 목록. 목록만 스크롤한다.
 * 필터 버튼 · 적용한 필터 칩은 5-3, 결과에 커서를 올렸을 때 그리드 미리보기는 5-2.
 * 5-3 전까지는 검색창의 필터 버튼이 시간대 검색 모달(5-4)을 바로 연다.
 */
export function SearchPanel({ onGoToBookmarks, ...options }: SearchPanelProps) {
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DELAY);
  const [timeFilter, setTimeFilter] = useState(EMPTY_TIME_FILTER);
  const occupied = options.timetable?.lectures.flatMap(({ classTimes }) => classTimes) ?? [];
  const search = useInfiniteQuery(
    lectureQueries.search({ semester: options.semester, query, ...toSearchTimes(timeFilter, occupied) }),
  );
  const lectures = search.data?.pages.flatMap((page) => page.lectures) ?? [];

  // 관심강좌에 넣으면 관심강좌 탭으로 갈지 묻는다 (Figma `팝업 예시`)
  const [askingMove, setAskingMove] = useState(false);
  const { cellProps, overlapDialog } = useLectureCells({ ...options, onBookmarkAdded: () => setAskingMove(true) });

  // 커서를 올린 강의는 시간표에 미리 보여 준다. 검색 탭이 사라지면(학기 변경) 지운다
  useEffect(() => preview.clear, []);

  return (
    // Figma: 검색창과 목록 사이 16
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <SearchField
        aria-label="강의 검색"
        placeholder="강의명, 교수명을 검색하세요"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        trailing={<TimeSearchFilterButton value={timeFilter} onChange={setTimeFilter} occupied={occupied} />}
      />
      {!isTimeFilterEmpty(timeFilter) && <TimeSearchChips value={timeFilter} onChange={setTimeFilter} />}

      <ResultList
        count={lectures.length}
        hasMore={search.hasNextPage}
        onMore={() => !search.isFetchingNextPage && void search.fetchNextPage()}
        // 다음 쪽을 받는 중이거나 실패하면 목록 끝에 알린다
        footer={
          search.isFetchingNextPage
            ? '불러오는 중'
            : search.isFetchNextPageError && search.error
              ? getFailureMessage(search.error)
              : null
        }
      >
        {search.isPending ? (
          <Message>불러오는 중</Message>
        ) : search.isError && lectures.length === 0 ? (
          <Message>{getFailureMessage(search.error)}</Message>
        ) : lectures.length === 0 ? (
          <Message>검색 결과가 없습니다</Message>
        ) : (
          lectures.map((lecture) => (
            <li key={lecture.id}>
              <LectureCell {...cellProps(lecture)} />
            </li>
          ))
        )}
      </ResultList>

      <ConfirmDialog {...overlapDialog} />
      <ConfirmDialog
        open={askingMove}
        onOpenChange={setAskingMove}
        message="관심강좌 탭으로 이동하시겠습니까?"
        onConfirm={onGoToBookmarks}
      />
    </div>
  );
}

type ResultListProps = {
  children: ReactNode;
  /** 받은 결과 수. 다음 쪽을 받아도 목록 끝이 보이면 또 받도록 바뀔 때마다 다시 살핀다 */
  count: number;
  hasMore: boolean;
  /** 목록 끝이 보이면 부른다 */
  onMore: () => void;
  footer: string | null;
};

/** 스크롤하는 결과 목록. 끝까지 내리면 다음 쪽을 받는다 */
function ResultList({ children, count, hasMore, onMore, footer }: ResultListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const onMoreRef = useRef(onMore);
  useEffect(() => {
    onMoreRef.current = onMore;
  });

  useEffect(() => {
    const end = endRef.current;
    if (!hasMore || !end || typeof IntersectionObserver === 'undefined') return;
    // 끝에 닿기 조금 전(200px)에 미리 받는다
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && onMoreRef.current(), {
      root: listRef.current,
      rootMargin: '0px 0px 200px 0px',
    });
    observer.observe(end);
    return () => observer.disconnect();
  }, [hasMore, count]);

  return (
    <ul ref={listRef} aria-label="검색 결과" className="min-h-0 flex-1 overflow-y-auto pb-5">
      {children}
      {footer && <Message>{footer}</Message>}
      {hasMore && <li ref={endRef} aria-hidden className="h-px" />}
    </ul>
  );
}

function Message({ children }: { children: ReactNode }) {
  return <li className="py-4 text-center text-14-regular text-assistive">{children}</li>;
}
