'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ApiError } from '@/api/client';
import { getFailureMessage } from '@/api/errors';
import { semesterQueries } from '@/api/semesters';
import { themeQueries } from '@/api/themes';
import {
  timetableQueries,
  useAddCustomLecture,
  useAddLecture,
  useCreateTimetable,
  useRemoveLecture,
  useRemoveTimetable,
  useRenameTimetable,
  useSetPrimaryTimetable,
  useUpdateLecture,
} from '@/api/timetables';
import type { CustomLectureInput, LectureId, TimetableLectureId } from '@/domain/lecture';
import { isSameSemester, type Semester } from '@/domain/semester';
import { pickDefaultTimetable, type Timetable, type TimetableId, type TimetableSummary } from '@/domain/timetable';

/** 화면 상태: 불러오는 중 · 로그인 필요 · 불러오지 못함 · 준비됨 */
export type TimetablesStatus = 'loading' | 'unauthorized' | 'error' | 'ready';

/** 시간이 겹치는 강의를 담으려 할 때 서버가 주는 에러 */
const isTimeOverlap = (error: Error) => error instanceof ApiError && error.type === '/problems/lecture-time-overlap';

/** `'…' 강의와 시간이 겹칩니다. 강의를 덮어씌우겠습니까?` 를 두 문장으로 나눠 확인 팝업에서 두 줄로 보여 준다 */
const toOverlapQuestion = (error: Error) => getFailureMessage(error).replace(/\. /, '.\n');

/**
 * 시간표 상세. 이름과 기본 여부는 목록(summary)을 따른다.
 * 이름 변경 · 기본 지정은 목록만 새로 받으므로, 상세를 다시 받지 않아도 화면이 맞는다.
 * `initial` 은 이미 받은 상세(처음의 `GET /v2/timetables/recent`)로, 같은 시간표면 다시 받지 않는다.
 */
export function useTimetableDetail(summary: TimetableSummary | null, initial?: Timetable) {
  const { data } = useQuery({
    ...timetableQueries.detail(summary?.id ?? ''),
    enabled: summary !== null,
    initialData: initial && initial.id === summary?.id ? initial : undefined,
  });
  return useMemo(
    () => (data && summary ? { ...data, title: summary.title, isPrimary: summary.isPrimary } : null),
    [data, summary],
  );
}

/**
 * 학기 선택과 그 학기의 시간표 목록 · 고른 시간표, 그리고 시간표를 바꾸는 동작.
 * 처음 학기 · 시간표는 `GET /v2/timetables/recent` 로 정하고, 학기 목록은 수강편람이 있는 학기다.
 */
export function useTimetables() {
  // 사용자가 고른 것. 고르기 전에는 null 이고 recent 를 따른다
  const [semesterChoice, setSemesterChoice] = useState<Semester | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<TimetableId | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const list = useQuery(timetableQueries.list());
  const coursebooks = useQuery(semesterQueries.coursebooks());
  // 처음 화면만 정하므로 다시 받지 않는다. 실패해도(시간표가 하나도 없는 경우 등) 최근 학기로 연다
  const recent = useQuery({ ...timetableQueries.recent(), staleTime: Infinity, retry: false });
  const themes = useQuery(themeQueries.list());

  const semester = semesterChoice ?? recent.data?.semester ?? coursebooks.data?.[0] ?? null;
  const timetables = useMemo(
    () => (semester ? (list.data ?? []).filter((timetable) => isSameSemester(timetable.semester, semester)) : []),
    [list.data, semester],
  );
  const selectedSummary =
    timetables.find(({ id }) => id === selectedChoice) ??
    (semesterChoice === null ? timetables.find(({ id }) => id === recent.data?.id) : undefined) ??
    pickDefaultTimetable(timetables);
  const selected = useTimetableDetail(selectedSummary, recent.data);

  const error = list.error ?? coursebooks.error;
  const status: TimetablesStatus = error
    ? error instanceof ApiError && error.status === 401
      ? 'unauthorized'
      : 'error'
    : list.isPending || coursebooks.isPending || recent.isPending
      ? 'loading'
      : 'ready';

  const createTimetable = useCreateTimetable();
  const renameTimetable = useRenameTimetable();
  const removeTimetable = useRemoveTimetable();
  const setPrimaryTimetable = useSetPrimaryTimetable();
  const addLecture = useAddLecture();
  const addCustomLecture = useAddCustomLecture();
  const updateLecture = useUpdateLecture();
  const removeLecture = useRemoveLecture();
  const onError = (failed: Error) => setFailure(getFailureMessage(failed));

  return {
    status,
    /** 불러오지 못한 이유 (status 가 error 일 때) */
    error,
    semesters: coursebooks.data ?? [],
    semester,
    /** 고른 학기의 시간표 */
    timetables,
    selectedSummary,
    /** 고른 시간표의 상세. 받는 중이면 null */
    selected,
    /** 시간표 테마의 색 목록. 테마를 받기 전이면 빈 목록 (블록은 기본 색으로 그린다) */
    paletteOf: (timetable: Pick<Timetable, 'themeId'> | null) =>
      themes.data?.find((theme) => theme.id === timetable?.themeId)?.colors ?? [],
    /** 마지막으로 실패한 동작의 메시지. 보여 준 뒤 dismissFailure 로 지운다 */
    failure,
    dismissFailure: () => setFailure(null),
    /** 시간표 밖의 요청(관심강좌 등)이 실패했을 때도 같은 알림으로 보여 준다 */
    notifyFailure: onError,

    selectSemester: (next: Semester) => {
      setSemesterChoice(next);
      setSelectedChoice(null);
    },
    select: setSelectedChoice,
    /** 고른 학기에 시간표를 만들고 그것을 고른다 */
    create: (title: string) => {
      if (!semester) return;
      const before = new Set(list.data?.map(({ id }) => id));
      createTimetable.mutate(
        { semester, title },
        {
          onSuccess: (next) => {
            const created = next.find(({ id }) => !before.has(id));
            if (created) setSelectedChoice(created.id);
          },
          onError,
        },
      );
    },
    rename: (id: TimetableId, title: string) => renameTimetable.mutate({ id, title }, { onError }),
    remove: (id: TimetableId) => removeTimetable.mutate(id, { onError }),
    setPrimary: (id: TimetableId, isPrimary: boolean) => setPrimaryTimetable.mutate({ id, isPrimary }, { onError }),
    /**
     * 수강편람 강의를 담는다. 시간이 겹치면 onOverlap 에 서버 메시지(`'…' 강의와 시간이 겹칩니다. 강의를 덮어씌우겠습니까?`)를 주고,
     * 확인받은 뒤 force 로 다시 부르면 서버가 겹치는 강의를 빼고 넣는다
     */
    addLecture: (
      id: TimetableId,
      lectureId: LectureId,
      { force = false, onOverlap }: { force?: boolean; onOverlap: (message: string) => void },
    ) =>
      addLecture.mutate(
        { id, lectureId, isForced: force },
        { onError: (failed) => (isTimeOverlap(failed) ? onOverlap(toOverlapQuestion(failed)) : onError(failed)) },
      ),
    /** 시간 충돌은 부르는 쪽(직접 추가 폼)에서 먼저 확인한다. 성공하면 onSuccess 를 부른다 */
    addCustomLecture: (id: TimetableId, input: CustomLectureInput, onSuccess?: () => void) =>
      addCustomLecture.mutate({ id, input }, { onSuccess, onError }),
    /**
     * 강의 상세의 색상과 강의 편집. 바뀐 필드만 넘긴다. 성공하면 onSuccess 를 부른다.
     * 시간이 겹치면 addLecture 처럼 onOverlap 에 서버 메시지를 주고, force 로 다시 부르면 겹치는 강의를 빼고 고친다
     */
    updateLecture: (
      id: TimetableId,
      lectureId: TimetableLectureId,
      change: Partial<CustomLectureInput>,
      {
        force = false,
        onSuccess,
        onOverlap,
      }: { force?: boolean; onSuccess?: () => void; onOverlap?: (message: string) => void } = {},
    ) =>
      updateLecture.mutate(
        { id, lectureId, change, isForced: force },
        {
          onSuccess,
          onError: (failed) =>
            onOverlap && isTimeOverlap(failed) ? onOverlap(toOverlapQuestion(failed)) : onError(failed),
        },
      ),
    removeLecture: (id: TimetableId, lectureId: TimetableLectureId, onSuccess?: () => void) =>
      removeLecture.mutate({ id, lectureId }, { onSuccess, onError }),
  };
}

export type TimetablesController = ReturnType<typeof useTimetables>;
