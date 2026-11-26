'use client';

import { formatSemesterTitle, parseSemesterKey, type Semester, toSemesterKey } from '@/domain/semester';
import { Select, type SelectVariant } from './Select';

type SemesterSelectProps = {
  /** 고를 수 있는 학기. 최근 학기가 앞에 온다 */
  semesters: readonly Semester[];
  value: Semester;
  onValueChange: (semester: Semester) => void;
  /** 패널 위의 제목 글자(title, 기본) · 친구 시간표 헤더의 테두리 있는 칸(field) */
  variant?: Extract<SelectVariant, 'title' | 'field'>;
  className?: string;
};

/** 학기 선택 (Figma `연도 선택`, `2026년 2학기 ⌄`). 여름 · 겨울학기도 함께 고른다. 메인 패널 위, 친구 시간표 위에서 쓴다 */
export function SemesterSelect({ semesters, value, onValueChange, variant = 'title', className }: SemesterSelectProps) {
  return (
    <Select
      variant={variant}
      aria-label="학기"
      options={semesters.map((semester) => ({
        value: toSemesterKey(semester),
        label: formatSemesterTitle(semester),
      }))}
      value={toSemesterKey(value)}
      onValueChange={(key) => {
        const semester = parseSemesterKey(key);
        if (semester) onValueChange(semester);
      }}
      className={className}
    />
  );
}
