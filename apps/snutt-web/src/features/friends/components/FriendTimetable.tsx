'use client';

import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useMemo, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { friendQueries } from '@/api/friends';
import { type Friend, getFriendName } from '@/domain/friend';
import { getGridRange } from '@/domain/grid-layout';
import type { Semester } from '@/domain/semester';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { SemesterSelect } from '@/shared/ui/SemesterSelect';

/** 친구 시간표의 강의 색은 서버가 정해 준 색(직접 고른 색)으로 바꿔 두어 팔레트가 필요 없다 (`toFriendTimetable`) */
const NO_PALETTE = [] as const;

type FriendTimetableProps = {
  friend: Friend;
};

/**
 * 고른 친구의 학기별 기본 시간표 (읽기 전용). Figma 에 친구 화면이 없어 메인 화면의 시간표 자리
 * (헤더 높이 56 · 여백 20, 학기 드롭다운, 그리드)를 그대로 따랐다. (디자인 문의 4-28)
 * 처음에는 친구가 기본 시간표를 가진 학기 중 가장 최근 학기를 보여 준다. 친구가 바뀌면 부르는 쪽이 key 로 새로 만든다.
 */
export function FriendTimetable({ friend }: FriendTimetableProps) {
  const semesters = useQuery(friendQueries.semesters(friend.id));
  const [picked, setPicked] = useState<Semester | null>(null);
  const semester = picked ?? semesters.data?.[0] ?? null;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* 메인 시간표의 헤더 (Figma `top`): 높이 56, 여백 13 · 20 */}
      <header className="flex h-14 shrink-0 items-center gap-2.5 px-5">
        <h2 className="truncate text-22-bold text-normal">{getFriendName(friend)}</h2>
        {semesters.data && semester && (
          <SemesterSelect semesters={semesters.data} value={semester} onValueChange={setPicked} />
        )}
      </header>
      {semesters.error ? (
        <FailureMessage error={semesters.error} />
      ) : !semesters.data ? (
        <TimetableMessage>불러오는 중</TimetableMessage>
      ) : !semester ? (
        <TimetableMessage>친구의 시간표가 없습니다</TimetableMessage>
      ) : (
        <SemesterTimetable friend={friend} semester={semester} />
      )}
    </div>
  );
}

function SemesterTimetable({ friend, semester }: { friend: Friend; semester: Semester }) {
  const { data: timetable, error } = useQuery(friendQueries.primaryTimetable(friend.id, semester));
  const range = useMemo(
    () => getGridRange((timetable?.lectures ?? []).flatMap(({ classTimes }) => classTimes)),
    [timetable],
  );

  if (error) return <FailureMessage error={error} />;
  if (timetable === undefined) return <TimetableMessage>불러오는 중</TimetableMessage>;
  if (timetable === null) return <TimetableMessage>이 학기에는 친구의 시간표가 없습니다</TimetableMessage>;

  return (
    // 그리드는 남은 높이에 맞춰 칸을 나눈다. 강의 블록을 눌러도 상세를 열지 않는다 (onLectureClick 없음)
    <div className="min-h-0 flex-1">
      <TimetableGrid range={range} className="h-full">
        <LectureLayer lectures={timetable.lectures} palette={NO_PALETTE} />
      </TimetableGrid>
    </div>
  );
}

function FailureMessage({ error }: { error: Error }) {
  return (
    <TimetableMessage>
      시간표를 불러오지 못했습니다
      <span className="text-13-regular">{getFailureMessage(error)}</span>
    </TimetableMessage>
  );
}

/** 시간표 자리 대신 보여 주는 안내 (메인 화면의 MainMessage 와 같은 모양) */
export function TimetableMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-14-regular text-alternative">
      {children}
    </div>
  );
}
