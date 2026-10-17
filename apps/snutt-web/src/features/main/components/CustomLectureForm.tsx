'use client';

import { clsx } from 'clsx';
import { type FormEvent, type ReactNode, useId, useState } from 'react';
import type { ColorPair, LectureColor } from '@/domain/color';
import type { CustomLectureInput } from '@/domain/lecture';
import type { Timetable } from '@/domain/timetable';
import { Button } from '@/shared/ui/Button';
import { ColorSelect } from '@/shared/ui/ColorSelect';
import { TextArea, TextField } from '@/shared/ui/TextField';
import { ClassTimeFields, getClassTimeError, newTimeRow, type TimeRow, toClassTimes } from './ClassTimeFields';
import { PanelColumn, PanelNav } from './PanelColumn';

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
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!timetable) return;

    const classTimes = toClassTimes(rows);
    const next: Errors = {};

    if (!title.trim()) next.title = '강의명을 입력하세요';
    if (credit.trim() && !/^\d+$/.test(credit.trim())) next.credit = '학점은 숫자로 입력하세요';
    const timeError = getClassTimeError(classTimes, timetable.lectures);
    if (timeError) next.time = timeError;

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
            <ClassTimeFields id={id} rows={rows} onRowsChange={setRows} minRows={0} error={errors.time} />
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
