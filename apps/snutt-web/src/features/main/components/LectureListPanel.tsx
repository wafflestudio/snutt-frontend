'use client';

import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useMemo } from 'react';
import { bookmarkQueries, useAddBookmark, useRemoveBookmark } from '@/api/bookmarks';
import { sortByFirstClassTime, type TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import type { Timetable } from '@/domain/timetable';
import { LectureCell } from './LectureCell';

type LectureListPanelProps = {
  semester: Semester;
  /** 고른 시간표. 학기에 시간표가 없으면 null */
  timetable: Timetable | null;
  /** 시간표에서 뺀다 (검색 결과의 `−` 와 같다) */
  onRemove: (lecture: TimetableLecture) => void;
  /** 셀을 누르면 시간표 강의의 상세를 연다 (그리드의 블록을 누른 것과 같다) */
  onOpen: (lecture: TimetableLecture) => void;
  onFailure: (error: Error) => void;
};

/**
 * 강의 목록 탭 (7-2): 고른 시간표에 담긴 강의를 검색 결과와 같은 셀(Figma `cell`)로 보여 준다.
 * Figma 에 탭 이름만 있어 "고른 시간표의 강의" 로 추정해 만들었다 (디자인 문의 4-33).
 * 모두 담긴 강의라 오른쪽 버튼은 빼기(−)이고, 이미 그리드에 있어 커서를 올려도 미리보기를 띄우지 않는다.
 * 시간표 강의는 평점을 몰라 평점을 숨기고, 직접 추가한 강의는 관심강좌 버튼을 숨긴다. 순서는 가장 이른 수업 시간 순
 */
export function LectureListPanel({ semester, timetable, onRemove, onOpen, onFailure }: LectureListPanelProps) {
  const bookmarks = useQuery(bookmarkQueries.list(semester));
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const lectures = useMemo(() => sortByFirstClassTime(timetable?.lectures ?? []), [timetable]);

  return (
    <ul aria-label="강의 목록" className="min-h-0 flex-1 overflow-y-auto pb-5">
      {timetable === null ? (
        <Message>이 학기에는 시간표가 없습니다</Message>
      ) : lectures.length === 0 ? (
        <Message>시간표에 담긴 강의가 없습니다</Message>
      ) : (
        lectures.map((lecture) => {
          const { lectureId } = lecture;
          const bookmarked = lectureId !== null && (bookmarks.data?.some(({ id }) => id === lectureId) ?? false);
          return (
            <li key={lecture.id}>
              <LectureCell
                lecture={{ ...lecture, semester }}
                added
                canAdd
                onAddToggle={() => onRemove(lecture)}
                onOpen={() => onOpen(lecture)}
                bookmark={
                  lectureId === null
                    ? undefined
                    : {
                        bookmarked,
                        onToggle: () =>
                          (bookmarked ? removeBookmark : addBookmark).mutate(
                            { id: lectureId, semester },
                            { onError: onFailure },
                          ),
                      }
                }
              />
            </li>
          );
        })
      )}
    </ul>
  );
}

function Message({ children }: { children: ReactNode }) {
  return <li className="py-4 text-center text-14-regular text-assistive">{children}</li>;
}
