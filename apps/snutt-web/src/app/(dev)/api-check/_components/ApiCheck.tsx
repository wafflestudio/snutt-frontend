'use client';

import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useLocalLogin, useLogout } from '@/api/auth';
import { ApiError } from '@/api/client';
import { themeQueries } from '@/api/themes';
import { timetableQueries } from '@/api/timetables';
import { DevHeader } from '@/app/(dev)/_components/DevHeader';
import { FALLBACK_LECTURE_COLOR } from '@/domain/color';
import { getGridRange } from '@/domain/grid-layout';
import { formatSemester } from '@/domain/semester';
import { getTotalCredit, type TimetableId } from '@/domain/timetable';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';

const errorText = (error: Error) =>
  error instanceof ApiError
    ? `${error.status} ${error.title}${error.detail ? ` · ${error.detail}` : ''}`
    : error.message;

/** 로그인 → 시간표 목록 · 최근 시간표 · 테마를 실제 서버에서 받아 본다 */
export function ApiCheck() {
  const [selectedId, setSelectedId] = useState<TimetableId | null>(null);
  const list = useQuery(timetableQueries.list());
  const recent = useQuery(timetableQueries.recent());

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-normal p-8 text-plain">
      <DevHeader title="API 확인" />
      <LoginForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-16-semibold">GET /v2/timetables</h2>
        {list.isPending && <p>불러오는 중</p>}
        {list.error && <p className="text-snutt-red">{errorText(list.error)}</p>}
        {list.data && (
          <ul className="flex flex-wrap gap-2">
            {list.data.map((timetable) => (
              <li key={timetable.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(timetable.id)}
                  className="rounded-md border border-line-border px-3 py-1.5 text-14-regular aria-pressed:bg-snutt-dark-mint1 aria-pressed:text-on-bg"
                  aria-pressed={timetable.id === (selectedId ?? recent.data?.id)}
                >
                  {formatSemester(timetable.semester)} · {timetable.title} · {timetable.totalCredit}학점
                  {timetable.isPrimary && ' · 기본'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-16-semibold">
          {selectedId ? 'GET /v2/timetables/:timetableId' : 'GET /v2/timetables/recent'}
        </h2>
        {recent.error && !selectedId && <p className="text-snutt-red">{errorText(recent.error)}</p>}
        <TimetablePreview id={selectedId ?? recent.data?.id ?? null} />
      </section>
    </main>
  );
}

function LoginForm() {
  const login = useLocalLogin();
  const logout = useLogout();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login.mutate({ localId: String(form.get('localId')), password: String(form.get('password')) });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-[12rem_12rem_auto_auto_1fr] items-center gap-2">
      <TextField name="localId" aria-label="아이디" placeholder="아이디" autoComplete="username" />
      <TextField
        name="password"
        type="password"
        aria-label="비밀번호"
        placeholder="비밀번호"
        autoComplete="current-password"
      />
      <Button type="submit" disabled={login.isPending}>
        로그인
      </Button>
      <Button variant="secondary" onClick={logout}>
        로그아웃
      </Button>
      {login.isSuccess && <span className="text-14-regular">로그인했습니다</span>}
      {login.error && <span className="text-14-regular text-snutt-red">{errorText(login.error)}</span>}
    </form>
  );
}

function TimetablePreview({ id }: { id: TimetableId | null }) {
  const detail = useQuery({ ...timetableQueries.detail(id ?? ''), enabled: id !== null });
  const themes = useQuery(themeQueries.list());

  if (!id) return null;
  if (detail.error) return <p className="text-snutt-red">{errorText(detail.error)}</p>;
  if (!detail.data) return <p>불러오는 중</p>;

  const timetable = detail.data;
  const palette = themes.data?.find((theme) => theme.id === timetable.themeId)?.colors ?? [FALLBACK_LECTURE_COLOR];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-14-regular">
        {formatSemester(timetable.semester)} · {timetable.title} · 강의 {timetable.lectures.length}개 ·{' '}
        {getTotalCredit(timetable.lectures)}학점 · 테마 {timetable.themeId}
        {themes.error && ` (테마 오류: ${errorText(themes.error)})`}
      </p>
      <TimetableGrid
        range={getGridRange(timetable.lectures.flatMap((lecture) => lecture.classTimes))}
        className="h-200 max-w-200"
      >
        <LectureLayer lectures={timetable.lectures} palette={palette} />
      </TimetableGrid>
    </div>
  );
}
