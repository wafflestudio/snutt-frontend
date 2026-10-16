'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { bookmarkQueries, useAddBookmark, useRemoveBookmark } from '@/api/bookmarks';
import { getFailureMessage } from '@/api/errors';
import { lectureQueries } from '@/api/lectures';
import type { Lecture, TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import type { Timetable } from '@/domain/timetable';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { SearchField } from '@/shared/ui/SearchField';
import { LectureCell } from './LectureCell';

/** 검색어를 다 친 뒤 이만큼 기다렸다가 검색한다 (ms) */
const SEARCH_DELAY = 300;

type SearchPanelProps = {
  semester: Semester;
  /** 담을 시간표. 학기에 시간표가 없으면 null 이고 담을 수 없다 */
  timetable: Timetable | null;
  /** 시간이 겹치면 onOverlap 에 서버 메시지를 준다. 확인받으면 force 로 다시 부른다 */
  onAdd: (lecture: Lecture, options: { force?: boolean; onOverlap: (message: string) => void }) => void;
  onRemove: (lecture: TimetableLecture) => void;
  onFailure: (error: Error) => void;
};

/**
 * 검색 탭 (Figma `검색 목록 영역`): 검색창과 결과 목록. 목록만 스크롤한다.
 * 필터 버튼 · 적용한 필터 칩은 5-3, 결과에 커서를 올렸을 때 그리드 미리보기는 5-2.
 */
export function SearchPanel({ semester, timetable, onAdd, onRemove, onFailure }: SearchPanelProps) {
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DELAY);
  const search = useInfiniteQuery(lectureQueries.search({ semester, query }));
  const lectures = search.data?.pages.flatMap((page) => page.lectures) ?? [];

  const bookmarks = useQuery(bookmarkQueries.list(semester));
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const isBookmarked = (lecture: Lecture) => bookmarks.data?.some(({ id }) => id === lecture.id) ?? false;

  // 시간이 겹쳐서 덮어쓸지 묻는 중인 강의
  const [overlap, setOverlap] = useState<{ lecture: Lecture; message: string } | null>(null);
  const add = (lecture: Lecture, force = false) =>
    onAdd(lecture, { force, onOverlap: (message) => setOverlap({ lecture, message }) });

  return (
    // Figma: 검색창과 목록 사이 16
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <SearchField
        aria-label="강의 검색"
        placeholder="강의명, 교수명을 검색하세요"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

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
          lectures.map((lecture) => {
            const added = timetable?.lectures.find(({ lectureId }) => lectureId === lecture.id) ?? null;
            const bookmarked = isBookmarked(lecture);
            return (
              <li key={lecture.id}>
                <LectureCell
                  lecture={lecture}
                  added={added !== null}
                  canAdd={timetable !== null}
                  bookmarked={bookmarked}
                  onAddToggle={() => (added ? onRemove(added) : add(lecture))}
                  onBookmarkToggle={() =>
                    (bookmarked ? removeBookmark : addBookmark).mutate(lecture, { onError: onFailure })
                  }
                />
              </li>
            );
          })
        )}
      </ResultList>

      <ConfirmDialog
        open={overlap !== null}
        onOpenChange={(open) => !open && setOverlap(null)}
        message={overlap?.message}
        onConfirm={() => overlap && add(overlap.lecture, true)}
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
