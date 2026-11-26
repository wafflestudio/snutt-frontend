'use client';

import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useMemo, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { friendQueries } from '@/api/friends';
import { type Friend, getFriendLabel } from '@/domain/friend';
import { getGridRange } from '@/domain/grid-layout';
import type { TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { IconMoreHorizontal } from '@/shared/ui/icons';
import { SemesterSelect } from '@/shared/ui/SemesterSelect';
import { FriendMenu } from './FriendMenu';

/** 친구 시간표의 강의 색은 서버가 정해 준 색(직접 고른 색)으로 바꿔 두어 팔레트가 필요 없다 (`toFriendTimetable`) */
const NO_PALETTE = [] as const;
const NO_LECTURES: readonly TimetableLecture[] = [];

const NO_TIMETABLE_MESSAGE = '친구에게 대표 시간표가 없습니다.';

type FriendTimetableProps = {
  /** null 이면 빈 그리드 (친구가 없을 때) */
  friend: Friend | null;
  onRename: (friend: Friend) => void;
  onDelete: (friend: Friend) => void;
  /** 헤더 왼쪽 끝에 둘 것 (목록 패널을 접었을 때 펼치기 버튼) */
  leading?: ReactNode;
};

/**
 * 고른 친구의 학기별 기본 시간표 (읽기 전용, Figma 친구 시간표). 헤더 왼쪽에 친구 이름, 오른쪽에 ··· 메뉴와 학기 드롭다운.
 * 처음에는 친구가 기본 시간표를 가진 학기 중 가장 최근 학기를 보여 준다. 친구가 바뀌면 부르는 쪽이 key 로 새로 만든다.
 * 기본 시간표가 없으면 빈 그리드 위에 알림 팝업을 띄운다 (Figma `친구 시간표_선택한 친구가 시간표가 없을때`).
 */
export function FriendTimetable({ friend, onRename, onDelete, leading }: FriendTimetableProps) {
  const semesters = useQuery({ ...friendQueries.semesters(friend?.id ?? ''), enabled: friend !== null });
  const [picked, setPicked] = useState<Semester | null>(null);
  const semester = picked ?? semesters.data?.[0] ?? null;
  const timetable = useQuery({
    ...friendQueries.primaryTimetable(friend?.id ?? '', semester ?? { year: 0, term: 1 }),
    enabled: friend !== null && semester !== null,
  });
  // 알림을 닫으면 빈 그리드만 남긴다. 학기를 바꾸면 다시 알린다
  const [dismissed, setDismissed] = useState(false);

  const lectures = timetable.data?.lectures ?? NO_LECTURES;
  const range = useMemo(() => getGridRange(lectures.flatMap(({ classTimes }) => classTimes)), [lectures]);
  const error = semesters.error ?? timetable.error;
  const noTimetable = (semesters.data !== undefined && semester === null) || timetable.data === null;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* 메인 시간표의 헤더 (Figma `top`): 높이 56, 여백 13 · 20 */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2.5 px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          {leading}
          {friend && (
            // 메인 시간표 탭의 고른 탭 모양 (여백 4 · 8, 둥글기 5, Background/lightField)
            <h2 className="truncate rounded-[5px] bg-light-field px-2 py-1 text-14-semibold text-normal">
              {getFriendLabel(friend)}
            </h2>
          )}
        </div>
        {friend && (
          <div className="flex shrink-0 items-center gap-2.5">
            <FriendMenu
              trigger={<IconButton label="친구 메뉴" icon={<IconMoreHorizontal className="size-4!" />} />}
              onRename={() => onRename(friend)}
              onDelete={() => onDelete(friend)}
            />
            {semesters.data && semester && (
              <SemesterSelect
                variant="field"
                className="px-2.5"
                semesters={semesters.data}
                value={semester}
                onValueChange={(next) => {
                  setPicked(next);
                  setDismissed(false);
                }}
              />
            )}
          </div>
        )}
      </header>
      {error ? (
        <TimetableMessage>
          시간표를 불러오지 못했습니다
          <span className="text-13-regular">{getFailureMessage(error)}</span>
        </TimetableMessage>
      ) : (
        // 그리드는 남은 높이에 맞춰 칸을 나눈다. 강의 블록을 눌러도 상세를 열지 않는다 (onLectureClick 없음)
        <div className="relative min-h-0 flex-1">
          <TimetableGrid range={range} className="h-full">
            <LectureLayer lectures={lectures} palette={NO_PALETTE} />
          </TimetableGrid>
          {noTimetable && !dismissed && <NoTimetableNotice onDismiss={() => setDismissed(true)} />}
        </div>
      )}
    </div>
  );
}

/**
 * 대표 시간표가 없다는 안내. Figma 는 알림 팝업(`alert`) 모양이 빈 그리드 가운데에 떠 있고 뒤를 어둡게 하지 않아,
 * 모달이 아닌 그리드 위 상자로 그린다(목록은 계속 누를 수 있다). 고양이 그림은 아직 받지 못했다 (디자인 문의 4-31)
 */
function NoTimetableNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        role="status"
        className="pointer-events-auto flex w-66 flex-col gap-6 rounded-[10px] bg-normal px-3 pt-9 pb-3 shadow-[0_0_10px_rgb(0_0_0/10%)]"
      >
        <p className="text-center text-14-regular text-normal">{NO_TIMETABLE_MESSAGE}</p>
        <Button onClick={onDismiss}>확인</Button>
      </div>
    </div>
  );
}

/** 시간표 자리 대신 보여 주는 안내 (메인 화면의 MainMessage 와 같은 모양) */
function TimetableMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-14-regular text-alternative">
      {children}
    </div>
  );
}
