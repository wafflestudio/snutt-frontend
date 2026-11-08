'use client';

/**
 * timetable-picker 의 데이터 훅.
 * 수강편람 · 시간표 목록 · 선택한 시간표 상세 · 테마 팔레트를 한 곳에서 관리한다.
 */
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { semesterQueries } from '@/api/semesters';
import { themeQueries } from '@/api/themes';
import { timetableQueries } from '@/api/timetables';
import { findThemePalette } from '@/domain/color';
import { isSameSemester } from '@/domain/semester';
import { pickDefaultTimetable, type Timetable, type TimetableId, type TimetableSummary } from '@/domain/timetable';

/** 화면 상태 */
export type PickerStatus = 'loading' | 'error' | 'empty' | 'ready';

/**
 * timetable-picker 에서 선택할 시간표 목록과 상세를 반환한다.
 *
 * 기본 선택 규칙 (레거시 계약 유지):
 * 1. 사용자가 선택한 시간표
 * 2. 현재 학기(coursebooks[0])의 기본 시간표(isPrimary) → 없으면 그 학기 첫 번째
 * 3. 전체 목록의 첫 번째
 */
export function usePickerTimetables() {
  const [selectedId, setSelectedId] = useState<TimetableId | null>(null);

  const list = useQuery(timetableQueries.list());
  const coursebooks = useQuery(semesterQueries.coursebooks());
  const themes = useQuery(themeQueries.list());

  const currentSemester = coursebooks.data?.[0] ?? null;

  /** 현재 학기의 기본 시간표(없으면 첫 번째) → 전체 목록 첫 번째 */
  const defaultTimetable = useMemo((): TimetableSummary | null => {
    const all = list.data ?? [];
    if (all.length === 0) return null;
    if (!currentSemester) return all[0] ?? null;
    const current = all.filter((t) => isSameSemester(t.semester, currentSemester));
    return current.length > 0 ? pickDefaultTimetable(current) : (all[0] ?? null);
  }, [list.data, currentSemester]);

  /** 사용자 선택 → 기본 선택 */
  const selectedSummary = useMemo((): TimetableSummary | null => {
    if (!selectedId) return defaultTimetable;
    return list.data?.find((t) => t.id === selectedId) ?? defaultTimetable;
  }, [selectedId, list.data, defaultTimetable]);

  /** 시간표 상세. 선택 중 이전 데이터를 흐리게 보여 주기 위해 placeholderData 를 쓴다 */
  const detail = useQuery({
    ...timetableQueries.detail(selectedSummary?.id ?? ''),
    enabled: selectedSummary !== null,
    placeholderData: (prev: Timetable | undefined) => prev,
  });

  const error = list.error ?? coursebooks.error;
  const status: PickerStatus = error
    ? 'error'
    : list.isPending || coursebooks.isPending
      ? 'loading'
      : (list.data?.length ?? 0) === 0
        ? 'empty'
        : 'ready';

  return {
    status,
    error,
    /** 수강편람이 있는 가장 최근 학기 */
    currentSemester,
    /** 전체 시간표 목록 */
    timetables: list.data ?? [],
    selectedSummary,
    /** 선택한 시간표의 상세. 받는 중(처음 또는 교체 중)이면 null */
    selectedDetail: detail.data ?? null,
    /** 상세를 불러오는 중 (이전 데이터가 placeholderData 로 있는 중) */
    isDetailLoading: detail.isPlaceholderData || detail.isPending,
    /** 선택한 시간표 팔레트 */
    palette: findThemePalette(themes.data ?? [], selectedSummary?.id ? detail.data?.themeId : undefined),
    select: setSelectedId,
  };
}
