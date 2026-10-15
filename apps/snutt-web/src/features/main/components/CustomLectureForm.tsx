'use client';

import { clsx } from 'clsx';
import { type FormEvent, type ReactNode, useId, useState } from 'react';
import type { ColorPair, LectureColor } from '@/domain/color';
import type { ClassTime, CustomLectureInput } from '@/domain/lecture';
import { type Day, DAY_LABELS, DAYS, formatMeridiemMinute, isOverlapping, toMinute } from '@/domain/time';
import { findConflictingLectures, type Timetable } from '@/domain/timetable';
import { Button } from '@/shared/ui/Button';
import { ColorSelect } from '@/shared/ui/ColorSelect';
import { IconAdd, IconRemove } from '@/shared/ui/icons';
import { Select } from '@/shared/ui/Select';
import { TextArea, TextField } from '@/shared/ui/TextField';
import { PanelColumn, PanelNav } from './PanelColumn';

// 시간은 5분 단위로 고른다. 수업은 보통 :15, :45, :50 에 끝나서 30분 단위로는 부족하다
const TIME_STEP = 5;
const FIRST_MINUTE = toMinute(6);
const LAST_MINUTE = toMinute(24);

const DAY_OPTIONS = DAYS.map((day) => ({ value: day, label: DAY_LABELS[day] }));

const timeOptions = (from: number, to: number) =>
  Array.from({ length: (to - from) / TIME_STEP + 1 }, (_, i) => {
    const minute = from + i * TIME_STEP;
    return { value: minute, label: formatMeridiemMinute(minute) };
  });

const START_OPTIONS = timeOptions(FIRST_MINUTE, LAST_MINUTE - TIME_STEP);

type TimeRow = { key: number; day: Day; startMinute: number; endMinute: number; place: string };

// Figma 의 처음 값: 월 오전 9:00 ~ 오전 10:00
const newTimeRow = (key: number): TimeRow => ({
  key,
  day: 0,
  startMinute: toMinute(9),
  endMinute: toMinute(10),
  place: '',
});

type Errors = { title?: string; credit?: string; time?: string };

type CustomLectureFormProps = {
  /** 강의를 추가할 시간표. 학기에 시간표가 없으면 null */
  timetable: Timetable | null;
  palette: readonly ColorPair[];
  onSubmit: (input: CustomLectureInput) => void;
  /** `<` 와 취소: 목록으로 돌아간다 */
  onBack: () => void;
  /** `×`: 패널을 접는다 */
  onClose: () => void;
};

/**
 * 직접 추가 폼 (Figma `직접 추가`, `시간 추가 클릭시`). 목록 패널 자리를 대신한다.
 * 빈 입력은 null 로 바꿔 넘기고(CLAUDE.md "API 층"), 시간표의 다른 강의와 시간이 겹치면 추가하지 않는다.
 */
export function CustomLectureForm({ timetable, palette, onSubmit, onBack, onClose }: CustomLectureFormProps) {
  const id = useId();
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credit, setCredit] = useState('');
  const [color, setColor] = useState<LectureColor>({ type: 'palette', index: 0 });
  const [remark, setRemark] = useState('');
  const [rows, setRows] = useState<TimeRow[]>(() => [newTimeRow(0)]);
  const [nextKey, setNextKey] = useState(1);
  const [errors, setErrors] = useState<Errors>({});

  const updateRow = (key: number, change: Partial<TimeRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!timetable) return;

    const classTimes: ClassTime[] = rows.map(({ day, startMinute, endMinute, place }) => ({
      day,
      startMinute,
      endMinute,
      place: place.trim() || null,
    }));
    const next: Errors = {};

    if (!title.trim()) next.title = '강의명을 입력하세요';
    if (credit.trim() && !/^\d+$/.test(credit.trim())) next.credit = '학점은 숫자로 입력하세요';

    const selfOverlap = classTimes.some((a, i) => classTimes.slice(i + 1).some((b) => isOverlapping(a, b)));
    const conflicts = findConflictingLectures(timetable.lectures, { classTimes });
    if (selfOverlap) next.time = '입력한 시간끼리 겹칩니다';
    else if (conflicts.length > 0) {
      const titles = [...new Set(conflicts.map((lecture) => `‘${lecture.title}’`))].join(', ');
      next.time = `${titles} 강의와 시간이 겹칩니다`;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      title: title.trim(),
      instructor: instructor.trim() || null,
      credit: credit.trim() ? Number(credit.trim()) : null,
      remark: remark.trim() || null,
      classTimes,
      color,
    });
  };

  return (
    <PanelColumn label="직접 추가">
      <PanelNav backLabel="목록으로" onBack={onBack} onClose={onClose} />

      <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        {/* Figma: 왼쪽 여백 30, 오른쪽 32 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-6 pr-8 pl-7.5">
          <h2 className="text-20-bold">강의 직접 추가</h2>

          {/* Figma: 라벨 40px, 라벨과 입력칸 사이 20, 줄 사이 20, 폭 318 */}
          <div className="mt-7.5 flex w-79.5 flex-col gap-5">
            <Field id={`${id}-title`} label="강의명" error={errors.title}>
              <TextField
                id={`${id}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? `${id}-title-error` : undefined}
              />
            </Field>
            <Field id={`${id}-instructor`} label="교수">
              <TextField
                id={`${id}-instructor`}
                placeholder="(없음)"
                value={instructor}
                onChange={(event) => setInstructor(event.target.value)}
              />
            </Field>
            <Field id={`${id}-credit`} label="학점" error={errors.credit}>
              <TextField
                id={`${id}-credit`}
                inputMode="numeric"
                placeholder="(없음)"
                value={credit}
                onChange={(event) => setCredit(event.target.value)}
                aria-invalid={errors.credit ? true : undefined}
                aria-describedby={errors.credit ? `${id}-credit-error` : undefined}
              />
            </Field>
            <Field id={`${id}-color`} label="색상">
              <ColorSelect
                id={`${id}-color`}
                palette={palette}
                value={color}
                onValueChange={setColor}
                className="w-full"
              />
            </Field>
            <Field id={`${id}-remark`} label="비고" alignTop>
              <TextArea
                id={`${id}-remark`}
                placeholder="(없음)"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
              />
            </Field>
          </div>

          <section aria-labelledby={`${id}-times`} className="mt-10 flex flex-col gap-5">
            <h3 id={`${id}-times`} className="text-16-semibold text-plain">
              시간 및 장소
            </h3>
            {rows.map((row, index) => (
              <TimeRowFields
                key={row.key}
                id={`${id}-row-${row.key}`}
                label={`시간 ${index + 1}`}
                row={row}
                onChange={(change) => updateRow(row.key, change)}
                // 첫 줄은 지울 수 없다. 시간이 없는 강의는 그리드에 보이지 않기 때문
                onRemove={
                  index === 0 ? undefined : () => setRows((current) => current.filter(({ key }) => key !== row.key))
                }
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setRows((current) => [...current, newTimeRow(nextKey)]);
                setNextKey((key) => key + 1);
              }}
              // Figma: 여백 6 · 14, 둥글기 5, 글자 Text/med
              className="-mt-3.5 flex items-center gap-1.5 self-center rounded-[5px] px-3.5 py-1.5 text-14-regular text-med hover:bg-light focus-visible:outline-2 focus-visible:outline-snutt-mint"
            >
              <IconAdd className="size-3.5" />
              시간 추가
            </button>
            {errors.time && (
              <p role="alert" className="text-13-regular text-warning">
                {errors.time}
              </p>
            )}
          </section>
        </div>

        {/* Figma: 버튼 116 × 38, 사이 8, 아래 여백 35 */}
        <div className="flex items-center justify-end gap-2 pt-4 pr-8 pb-8.75 pl-7.5">
          {!timetable && <p className="mr-auto text-13-regular text-warning">시간표를 먼저 만들어 주세요</p>}
          <Button variant="secondary" className="w-29" onClick={onBack}>
            취소
          </Button>
          <Button type="submit" className="w-29" disabled={!timetable}>
            추가
          </Button>
        </div>
      </form>
    </PanelColumn>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  /** 여러 줄 입력칸이면 라벨을 위에 맞춘다 */
  alignTop?: boolean;
  children: ReactNode;
};

function Field({ id, label, error, alignTop, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className={clsx('flex gap-5', alignTop ? 'items-start' : 'items-center')}>
        <label htmlFor={id} className={clsx('w-10 shrink-0 text-14-regular text-alternative', alignTop && 'pt-2')}>
          {label}
        </label>
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="pl-15 text-13-regular text-warning">
          {error}
        </p>
      )}
    </div>
  );
}

type TimeRowFieldsProps = {
  id: string;
  /** `시간 1` 처럼 몇 번째 시간인지. 스크린 리더가 읽는 묶음 이름 */
  label: string;
  row: TimeRow;
  onChange: (change: Partial<TimeRow>) => void;
  /** 없으면 지우기 버튼 자리를 비워 둔다 (첫 줄) */
  onRemove?: () => void;
};

function TimeRowFields({ id, label, row, onChange, onRemove }: TimeRowFieldsProps) {
  return (
    <div role="group" aria-label={label} className="flex items-center justify-between">
      {/* Figma: 시간 줄과 장소 줄 사이 6, 선택칸 사이 6, 요일 50px */}
      <div className="flex w-79 flex-col gap-1.5">
        <div className="flex items-center gap-5">
          <span className="w-10 shrink-0 text-14-regular text-alternative">시간</span>
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
              options={START_OPTIONS}
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
              options={timeOptions(row.startMinute + TIME_STEP, LAST_MINUTE)}
              value={row.endMinute}
              onValueChange={(endMinute) => onChange({ endMinute })}
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <label htmlFor={`${id}-place`} className="w-10 shrink-0 text-14-regular text-alternative">
            장소
          </label>
          <TextField
            id={`${id}-place`}
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
