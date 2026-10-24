'use client';

import { useQuery } from '@tanstack/react-query';
import { type ComponentProps, useState } from 'react';
import { bookmarkQueries, useAddBookmark, useRemoveBookmark } from '@/api/bookmarks';
import type { Lecture, TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import type { Timetable, TimetableId } from '@/domain/timetable';
import type { ConfirmDialogProps } from '@/shared/ui/Dialog';
import type { LectureCell } from '@/features/main/components/LectureCell';
import { preview } from '@/features/main/preview-store';

export type LectureCellsOptions = {
  semester: Semester;
  /** 담을 시간표. 학기에 시간표가 없으면 null 이고 담을 수 없다 */
  timetable: Timetable | null;
  /** 비교 중이면 오른쪽 시간표. 담기를 누르면 두 시간표 중 어디에 담을지 고른다 (9-2) */
  compareTimetable?: Timetable | null;
  /** to 시간표에 담는다. 시간이 겹치면 onOverlap 에 서버 메시지를 준다. 확인받으면 force 로 다시 부른다 */
  onAdd: (
    to: TimetableId,
    lecture: Lecture,
    options: { force?: boolean; onOverlap: (message: string) => void },
  ) => void;
  /** timetable(왼쪽)에서 뺀다 */
  onRemove: (lecture: TimetableLecture) => void;
  /** 셀을 누르면 강의 상세를 연다 */
  onOpen: (lecture: Lecture) => void;
  onFailure: (error: Error) => void;
  /** 관심강좌에 넣으면 부른다 (검색 탭의 `관심강좌 탭으로 이동` 확인) */
  onBookmarkAdded?: () => void;
};

/**
 * 수강편람 강의 셀(검색 결과, 관심강좌)이 함께 쓰는 동작. 담기 · 빼기(시간이 겹치면 덮어쓸지 묻는다), 관심강좌 켜고 끄기,
 * 시간표 미리보기, 상세 열기. `<LectureCell {...cellProps(lecture)} />` 와 `<ConfirmDialog {...overlapDialog} />` 로 쓴다.
 */
export function useLectureCells({
  semester,
  timetable,
  compareTimetable = null,
  onAdd,
  onRemove,
  onOpen,
  onFailure,
  onBookmarkAdded,
}: LectureCellsOptions) {
  const bookmarks = useQuery(bookmarkQueries.list(semester));
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  // 시간이 겹쳐서 덮어쓸지 묻는 중인 강의와 담을 시간표
  const [overlap, setOverlap] = useState<{ to: TimetableId; lecture: Lecture; message: string } | null>(null);
  const add = (to: TimetableId, lecture: Lecture, force = false) =>
    onAdd(to, lecture, { force, onOverlap: (message) => setOverlap({ to, lecture, message }) });

  const cellProps = (lecture: Lecture): ComponentProps<typeof LectureCell> => {
    const added = timetable?.lectures.find(({ lectureId }) => lectureId === lecture.id) ?? null;
    const bookmarked = bookmarks.data?.some(({ id }) => id === lecture.id) ?? false;
    return {
      lecture,
      added: added !== null,
      canAdd: timetable !== null,
      bookmarked,
      onAddToggle: () => (added ? onRemove(added) : timetable && add(timetable.id, lecture)),
      // Figma `드롭다운`: 기본은 왼쪽(메인) 시간표, 보조는 오른쪽(비교) 시간표. 이미 담긴 쪽은 고를 수 없다
      addTargets:
        timetable && compareTimetable
          ? [timetable, compareTimetable].map((target, index) => ({
              label: index === 0 ? '기본 시간표에 추가' : '보조 시간표에 추가',
              disabled: target.lectures.some(({ lectureId }) => lectureId === lecture.id),
              onSelect: () => add(target.id, lecture),
            }))
          : undefined,
      onOpen: () => onOpen(lecture),
      onPreviewChange: (previewing) => (previewing ? preview.show(lecture) : preview.hide(lecture)),
      onBookmarkToggle: () =>
        bookmarked
          ? // 관심강좌 탭에서 빼면 셀이 사라져 커서가 벗어났다는 알림이 오지 않으므로 미리보기를 직접 지운다
            removeBookmark.mutate(lecture, { onSuccess: () => preview.hide(lecture), onError: onFailure })
          : addBookmark.mutate(lecture, { onSuccess: onBookmarkAdded, onError: onFailure }),
    };
  };

  const overlapDialog: ConfirmDialogProps = {
    open: overlap !== null,
    onOpenChange: (open) => !open && setOverlap(null),
    message: overlap?.message,
    onConfirm: () => overlap && add(overlap.to, overlap.lecture, true),
  };

  return { bookmarks, cellProps, overlapDialog };
}
