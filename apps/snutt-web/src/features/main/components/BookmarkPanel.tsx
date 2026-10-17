'use client';

import { type ReactNode, useEffect } from 'react';
import { getFailureMessage } from '@/api/errors';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { preview } from '@/features/main/preview-store';
import { type LectureCellsOptions, useLectureCells } from '@/features/main/use-lecture-cells';
import { LectureCell } from './LectureCell';

/**
 * 관심강좌 탭 (Figma `관심강좌`): 학기의 관심강좌 목록. 셀은 검색 결과와 같고, 커서를 올리면 시간표에 미리 보여 준다.
 * 관심강좌를 끄면 목록에서 빠진다. Figma 프레임의 검색창 · 필터 칩은 검색 탭과 같은 것인지 확인 중이라 두지 않았다 (디자인 문의 4-17)
 */
export function BookmarkPanel(options: Omit<LectureCellsOptions, 'onBookmarkAdded'>) {
  const { bookmarks, cellProps, overlapDialog } = useLectureCells(options);
  const lectures = bookmarks.data ?? [];

  // 탭을 옮기면 이 목록이 사라지므로, 커서를 올려 둔 강의의 미리보기를 지운다
  useEffect(() => preview.clear, []);

  return (
    <>
      <ul aria-label="관심강좌" className="min-h-0 flex-1 overflow-y-auto pb-5">
        {bookmarks.isPending ? (
          <Message>불러오는 중</Message>
        ) : bookmarks.isError ? (
          <Message>{getFailureMessage(bookmarks.error)}</Message>
        ) : lectures.length === 0 ? (
          <Message>관심강좌가 없습니다</Message>
        ) : (
          lectures.map((lecture) => (
            <li key={lecture.id}>
              <LectureCell {...cellProps(lecture)} />
            </li>
          ))
        )}
      </ul>
      <ConfirmDialog {...overlapDialog} />
    </>
  );
}

function Message({ children }: { children: ReactNode }) {
  return <li className="py-4 text-center text-14-regular text-assistive">{children}</li>;
}
