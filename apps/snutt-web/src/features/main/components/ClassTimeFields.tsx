'use client';

import type { ClassTime, TimetableLecture } from '@/domain/lecture';
import { type Day, DAY_LABELS, DAYS, formatMeridiemMinute, isOverlapping, toMinute } from '@/domain/time';
import { findConflictingLectures } from '@/domain/timetable';
import { IconAdd, IconRemove } from '@/shared/ui/icons';
import { Select } from '@/shared/ui/Select';
import { TextField, type TextFieldVariant } from '@/shared/ui/TextField';

// 시간은 5분 단위로 고른다. 수업은 보통 :15, :45, :50 에 끝나서 30분 단위로는 부족하다
const TIME_STEP = 5;
const FIRST_MINUTE = toMinute(6);
const LAST_MINUTE = toMinute(24);

const DAY_OPTIONS = DAYS.map((day) => ({ value: day, label: DAY_LABELS[day] }));

/** from ~ to 의 5분 단위 시각. 수강편람 강의의 시간이 그 밖이거나(오전 6시 전) 5분 단위가 아니면 그 시각도 넣는다 */
const timeOptions = (from: number, to: number, current: number) => {
  const minutes = Array.from({ length: (to - from) / TIME_STEP + 1 }, (_, i) => from + i * TIME_STEP);
  if (!minutes.includes(current)) minutes.push(current);
  return minutes.sort((a, b) => a - b).map((minute) => ({ value: minute, label: formatMeridiemMinute(minute) }));
};

export type TimeRow = { key: number; day: Day; startMinute: number; endMinute: number; place: string };

// Figma (직접 추가) 의 처음 값: 월 오전 9:00 ~ 오전 10:00
export const newTimeRow = (key: number): TimeRow => ({
  key,
  day: 0,
  startMinute: toMinute(9),
  endMinute: toMinute(10),
  place: '',
});

/** 강의의 수업 시간 → 입력 줄. key 는 0 부터 매긴다 */
export const toTimeRows = (classTimes: readonly ClassTime[]): TimeRow[] =>
  classTimes.map(({ day, startMinute, endMinute, place }, key) => ({
    key,
    day,
    startMinute,
    endMinute,
    place: place ?? '',
  }));

/** 입력 줄 → 수업 시간. 빈 장소는 null (CLAUDE.md "API 층") */
export const toClassTimes = (rows: readonly TimeRow[]): ClassTime[] =>
  rows.map(({ day, startMinute, endMinute, place }) => ({ day, startMinute, endMinute, place: place.trim() || null }));

/** 입력한 시간끼리, 또는 시간표의 다른 강의와 겹치면 알릴 문구. 겹치지 않으면 null */
export const getClassTimeError = (classTimes: readonly ClassTime[], lectures: readonly TimetableLecture[]) => {
  if (classTimes.some((a, i) => classTimes.slice(i + 1).some((b) => isOverlapping(a, b))))
    return '입력한 시간끼리 겹칩니다';
  const conflicts = findConflictingLectures(lectures, { classTimes });
  if (conflicts.length === 0) return null;
  return `${[...new Set(conflicts.map((lecture) => `‘${lecture.title}’`))].join(', ')} 강의와 시간이 겹칩니다`;
};

type ClassTimeFieldsProps = {
  /** 입력칸 id 의 앞부분 */
  id: string;
  rows: readonly TimeRow[];
  onRowsChange: (rows: TimeRow[]) => void;
  /** 이만큼은 남긴다. 직접 추가는 1 (시간이 없는 강의는 그리드에 보이지 않는다) */
  minRows: number;
  error?: string | null;
  /** 장소 입력칸 모양 */
  variant?: TextFieldVariant;
};

/** 시간 및 장소 입력 줄들과 `시간 추가` 버튼 (직접 추가, 강의 편집) */
export function ClassTimeFields({ id, rows, onRowsChange, minRows, error, variant }: ClassTimeFieldsProps) {
  const update = (key: number, change: Partial<TimeRow>) =>
    onRowsChange(rows.map((row) => (row.key === key ? { ...row, ...change } : row)));
  const nextKey = Math.max(-1, ...rows.map(({ key }) => key)) + 1;

  return (
    <>
      {rows.map((row, index) => (
        <TimeRowFields
          key={row.key}
          id={`${id}-row-${row.key}`}
          label={`시간 ${index + 1}`}
          row={row}
          variant={variant}
          onChange={(change) => update(row.key, change)}
          onRemove={rows.length > minRows ? () => onRowsChange(rows.filter(({ key }) => key !== row.key)) : undefined}
        />
      ))}
      <button
        type="button"
        onClick={() => onRowsChange([...rows, newTimeRow(nextKey)])}
        // Figma: 여백 6 · 14, 둥글기 5, 글자 Text/med
        className="-mt-3.5 flex items-center gap-1.5 self-center rounded-[5px] px-3.5 py-1.5 text-14-regular text-med hover:bg-light focus-visible:outline-2 focus-visible:outline-snutt-mint"
      >
        <IconAdd className="size-3.5" />
        시간 추가
      </button>
      {error && (
        <p role="alert" className="text-13-regular text-warning">
          {error}
        </p>
      )}
    </>
  );
}

type TimeRowFieldsProps = {
  id: string;
  /** `시간 1` 처럼 몇 번째 시간인지. 스크린 리더가 읽는 묶음 이름 */
  label: string;
  row: TimeRow;
  variant?: TextFieldVariant;
  onChange: (change: Partial<TimeRow>) => void;
  /** 없으면 지우기 버튼 자리를 비워 둔다 */
  onRemove?: () => void;
};

function TimeRowFields({ id, label, row, variant, onChange, onRemove }: TimeRowFieldsProps) {
  const labelClasses = 'w-10 shrink-0 text-14-regular text-alternative';
  return (
    <div role="group" aria-label={label} className="flex items-center justify-between gap-3">
      {/* Figma: 시간 줄과 장소 줄 사이 6, 선택칸 사이 6, 요일 50px. 직접 추가는 폭 316 */}
      <div className="flex max-w-79 min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-5">
          <span className={labelClasses}>시간</span>
          <div className="flex min-w-0 flex-1 gap-1.5">
            <Select
              aria-label="요일"
              options={DAY_OPTIONS}
              value={row.day}
              onValueChange={(day) => onChange({ day })}
              className="w-12.5 shrink-0"
            />
            <Select
              aria-label="시작 시간"
              options={timeOptions(FIRST_MINUTE, LAST_MINUTE - TIME_STEP, row.startMinute)}
              value={row.startMinute}
              onValueChange={(startMinute) =>
                // 끝 시간이 시작보다 앞서게 되면 한 시간 뒤로 옮긴다
                onChange({
                  startMinute,
                  endMinute:
                    row.endMinute > startMinute ? row.endMinute : Math.min(startMinute + toMinute(1), LAST_MINUTE),
                })
              }
              className="flex-1"
            />
            <Select
              aria-label="끝 시간"
              options={timeOptions(row.startMinute + TIME_STEP, LAST_MINUTE, row.endMinute)}
              value={row.endMinute}
              onValueChange={(endMinute) => onChange({ endMinute })}
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <label htmlFor={`${id}-place`} className={labelClasses}>
            장소
          </label>
          <TextField
            id={`${id}-place`}
            variant={variant}
            placeholder="(없음)"
            value={row.place}
            onChange={(event) => onChange({ place: event.target.value })}
          />
        </div>
      </div>
      {/* Figma: 22px 원 안의 − */}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${label} 삭제`}
          className="flex size-5.5 shrink-0 items-center justify-center rounded-full border border-line-border text-assistive hover:bg-light focus-visible:outline-2 focus-visible:outline-snutt-mint"
        >
          <IconRemove className="size-3.5" />
        </button>
      ) : (
        <span className="size-5.5 shrink-0" />
      )}
    </div>
  );
}
