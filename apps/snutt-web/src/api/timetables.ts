import { queryOptions, type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CustomLectureInput, LectureId, TimetableLectureId } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import { getTotalCredit, type Timetable, type TimetableId, type TimetableSummary } from '@/domain/timetable';
import { callApi } from './client';
import { toCustomLectureRequest, toLectureModifyRequest, toTimetable, toTimetableSummary } from './mappers/timetable';

export const timetableQueries = {
  all: () => ['timetables'] as const,
  /** 내 시간표 전체 (모든 학기) */
  list: () =>
    queryOptions({
      queryKey: [...timetableQueries.all(), 'list'],
      queryFn: async () => (await callApi('GET /v2/timetables')).map(toTimetableSummary),
    }),
  detail: (id: TimetableId) =>
    queryOptions({
      queryKey: [...timetableQueries.all(), 'detail', id],
      queryFn: async () =>
        toTimetable(await callApi('GET /v2/timetables/:timetableId', { params: { timetableId: id } })),
    }),
  /** 처음 열 시간표: 마지막으로 고친 시간표 (학기와 상관없이 updatedAt 이 가장 늦은 것. dev 서버에서 확인) */
  recent: () =>
    queryOptions({
      queryKey: [...timetableQueries.all(), 'recent'],
      queryFn: async () => toTimetable(await callApi('GET /v2/timetables/recent')),
    }),
};

// 바꾸는 요청은 서버가 바뀐 목록이나 시간표를 돌려준다. 다시 받지 않고 그 응답으로 캐시를 바꾼다

const setList = (queryClient: QueryClient, list: TimetableSummary[]) =>
  queryClient.setQueryData(timetableQueries.list().queryKey, list);

/** 강의가 바뀐 시간표를 상세에 넣고, 목록의 학점도 맞춘다 */
const setTimetable = (queryClient: QueryClient, timetable: Timetable) => {
  queryClient.setQueryData(timetableQueries.detail(timetable.id).queryKey, timetable);
  queryClient.setQueryData(timetableQueries.list().queryKey, (list) =>
    list?.map((summary) =>
      summary.id === timetable.id
        ? { ...summary, totalCredit: getTotalCredit(timetable.lectures), updatedAt: timetable.updatedAt }
        : summary,
    ),
  );
};

/** 성공하면 새 목록을 돌려준다. 만든 시간표는 이전 목록에 없던 것이다 */
export const useCreateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ semester, title }: { semester: Semester; title: string }) =>
      (await callApi('POST /v2/timetables', { body: { year: semester.year, semester: semester.term, title } })).map(
        toTimetableSummary,
      ),
    onSuccess: (list) => setList(queryClient, list),
  });
};

export const useRenameTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: TimetableId; title: string }) =>
      (await callApi('PATCH /v2/timetables/:timetableId', { params: { timetableId: id }, body: { title } })).map(
        toTimetableSummary,
      ),
    onSuccess: (list) => setList(queryClient, list),
  });
};

export const useRemoveTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: TimetableId) =>
      (await callApi('DELETE /v2/timetables/:timetableId', { params: { timetableId: id } })).map(toTimetableSummary),
    onSuccess: (list, id) => {
      setList(queryClient, list);
      queryClient.removeQueries({ queryKey: timetableQueries.detail(id).queryKey });
    },
  });
};

/** 기본 시간표는 학기마다 하나라서, 지정하면 같은 학기의 다른 시간표는 서버가 해제한다 */
export const useSetPrimaryTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPrimary }: { id: TimetableId; isPrimary: boolean }) =>
      (
        await callApi(
          isPrimary ? 'PUT /v2/timetables/:timetableId/primary' : 'DELETE /v2/timetables/:timetableId/primary',
          {
            params: { timetableId: id },
          },
        )
      ).map(toTimetableSummary),
    onSuccess: (list) => setList(queryClient, list),
  });
};

/**
 * 수강편람 강의를 담는다. 시간이 겹치면 서버가 `lecture-time-overlap` 으로 거절하고,
 * isForced 로 다시 보내면 겹치는 강의를 빼고 넣는다 (dev 서버에서 확인)
 */
export const useAddLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lectureId, isForced }: { id: TimetableId; lectureId: LectureId; isForced: boolean }) =>
      toTimetable(
        await callApi('POST /v2/timetables/:timetableId/lectures', {
          params: { timetableId: id },
          body: { lectureId: Number(lectureId), isForced },
        }),
      ),
    onSuccess: (timetable) => setTimetable(queryClient, timetable),
  });
};

export const useAddCustomLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: TimetableId; input: CustomLectureInput }) =>
      toTimetable(
        await callApi('POST /v2/timetables/:timetableId/lectures/custom', {
          params: { timetableId: id },
          body: toCustomLectureRequest(input),
        }),
      ),
    onSuccess: (timetable) => setTimetable(queryClient, timetable),
  });
};

export const useUpdateLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      lectureId,
      change,
      isForced = false,
    }: {
      id: TimetableId;
      lectureId: TimetableLectureId;
      change: Partial<CustomLectureInput>;
      isForced?: boolean;
    }) =>
      toTimetable(
        await callApi('PATCH /v2/timetables/:timetableId/lectures/:timetableLectureId', {
          params: { timetableId: id, timetableLectureId: lectureId },
          body: toLectureModifyRequest(change, isForced),
        }),
      ),
    onSuccess: (timetable) => setTimetable(queryClient, timetable),
  });
};

export const useRemoveLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lectureId }: { id: TimetableId; lectureId: TimetableLectureId }) =>
      toTimetable(
        await callApi('DELETE /v2/timetables/:timetableId/lectures/:timetableLectureId', {
          params: { timetableId: id, timetableLectureId: lectureId },
        }),
      ),
    onSuccess: (timetable) => setTimetable(queryClient, timetable),
  });
};
