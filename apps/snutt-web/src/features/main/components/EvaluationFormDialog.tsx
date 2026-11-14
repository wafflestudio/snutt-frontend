'use client';

import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useId, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { evaluationQueries, useUpdateEvaluation, useWriteEvaluation } from '@/api/evaluations';
import {
  type Evaluation,
  EVALUATION_SCORE_LABELS,
  EVALUATION_SCORE_MAX,
  type EvaluationDraft,
  type EvaluationScores,
  getEvaluationChange,
  getWritableEvaluationLectures,
  toEvaluationInput,
} from '@/domain/evaluation';
import type { CourseId, LectureId } from '@/domain/lecture';
import { formatSemesterTitle } from '@/domain/semester';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogCloseButton, DialogTitle } from '@/shared/ui/Dialog';
import { IconStarFill } from '@/shared/ui/icons';
import { Select } from '@/shared/ui/Select';
import { TextArea } from '@/shared/ui/TextField';

const SCORE_KEYS = Object.keys(EVALUATION_SCORE_LABELS) as (keyof EvaluationScores)[];

/** 쓰기: 강좌와 처음 고를 강의(지금 보고 있는 강의). 고치기: 고칠 강의평 */
export type EvaluationFormTarget =
  { type: 'write'; courseId: CourseId; lectureId: LectureId | null } | { type: 'edit'; evaluation: Evaluation };

type EvaluationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: EvaluationFormTarget;
  /** 강의명. 폼 위에 보여 준다 */
  courseTitle: string;
  /** 저장하면 부른다. 알릴 말을 넘긴다 */
  onSaved: (message: string) => void;
};

/**
 * 강의평 작성 · 수정 모달. Figma 에 화면이 없어 기존 모달 · 입력칸으로 만들었다 (디자인 문의 4-27).
 * 쓸 때는 수강 학기(강의)와 총점 · 항목별 점수 · 본문이 모두 있어야 하고, 고칠 때는 학기를 바꿀 수 없고 바뀐 값만 보낸다.
 */
export function EvaluationFormDialog({ open, onOpenChange, ...props }: EvaluationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="flex w-100 flex-col overflow-y-auto">
      {/* 열 때마다 새로 그려서 입력값이 처음으로 돌아간다 */}
      <EvaluationForm {...props} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

function EvaluationForm({
  target,
  courseTitle,
  onSaved,
  onClose,
}: Omit<EvaluationFormDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const isEdit = target.type === 'edit';
  const [draft, setDraft] = useState<EvaluationDraft>(() =>
    isEdit
      ? { content: target.evaluation.content, rating: target.evaluation.rating, scores: target.evaluation.scores }
      : {
          content: '',
          rating: null,
          scores: { gradeSatisfaction: null, teachingSkill: null, gains: null, lifeBalance: null },
        },
  );
  const write = useWriteEvaluation();
  const update = useUpdateEvaluation();
  const mutation = isEdit ? update : write;

  // 쓸 때만: 강좌의 학기별 강의 중 아직 쓰지 않은 것. 처음에는 지금 보고 있는 강의를 고른다
  const lectures = useQuery({
    ...evaluationQueries.lectures(isEdit ? target.evaluation.courseId : target.courseId),
    enabled: !isEdit,
    select: getWritableEvaluationLectures,
  });
  const [pickedLectureId, setPickedLectureId] = useState<LectureId | null>(null);
  const writable = lectures.data ?? [];
  const lectureId =
    pickedLectureId ??
    (!isEdit && writable.some(({ lectureId }) => lectureId === target.lectureId) ? target.lectureId : null);
  const sameSemesterCount = (lecture: (typeof writable)[number]) =>
    writable.filter(({ semester }) => formatSemesterTitle(semester) === formatSemesterTitle(lecture.semester)).length;

  const input = toEvaluationInput(draft);
  const change = isEdit ? getEvaluationChange(target.evaluation, draft) : null;
  const canSubmit = !mutation.isPending && (isEdit ? change !== null : input !== null && lectureId !== null);

  const submit = () => {
    if (!canSubmit) return;
    if (target.type === 'edit' && change) {
      update.mutate(
        { evaluation: target.evaluation, change },
        {
          onSuccess: () => {
            onSaved('강의평을 수정했습니다');
            onClose();
          },
        },
      );
    } else if (input && lectureId) {
      write.mutate(
        { lectureId, input },
        {
          onSuccess: () => {
            onSaved('강의평을 등록했습니다');
            onClose();
          },
        },
      );
    }
  };

  const contentId = useId();

  return (
    <form
      className="flex flex-col gap-5 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle>{isEdit ? '강의평 수정' : '강의평 작성'}</DialogTitle>
          <p className="truncate text-14-regular text-plain">{courseTitle}</p>
        </div>
        <DialogCloseButton className="-mt-1 -mr-2" />
      </div>

      <div className="flex flex-col gap-2">
        {/* 고를 때는 셀렉트 이름으로, 고칠 때는 학기 글자 앞에서 읽는다 */}
        <p aria-hidden={target.type === 'write'} className="text-14-semibold text-normal">
          수강 학기
        </p>
        {target.type === 'edit' ? (
          <p className="text-14-regular text-plain">{formatSemesterTitle(target.evaluation.semester)}</p>
        ) : lectures.isPending ? (
          <p className="text-14-regular text-assistive">불러오는 중</p>
        ) : lectures.isError ? (
          <p className="text-14-regular text-warning">{getFailureMessage(lectures.error)}</p>
        ) : writable.length === 0 ? (
          <p className="text-14-regular text-assistive">강의평을 쓸 수 있는 학기가 없습니다</p>
        ) : (
          <Select
            aria-label="수강 학기"
            options={writable.map((lecture) => ({
              value: lecture.lectureId,
              // 한 학기에 분반이 여럿이면 분반을 붙인다
              label:
                formatSemesterTitle(lecture.semester) +
                (sameSemesterCount(lecture) > 1 ? ` (${lecture.lectureNumber}분반)` : ''),
            }))}
            value={lectureId}
            onValueChange={setPickedLectureId}
            placeholder="학기를 고르세요"
            className="w-full"
          />
        )}
      </div>

      <ScoreInput
        label="총점"
        size="lg"
        value={draft.rating}
        onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">항목별 점수</legend>
        <span aria-hidden className="text-14-semibold text-normal">
          항목별 점수
        </span>
        {SCORE_KEYS.map((key) => (
          <ScoreInput
            key={key}
            label={EVALUATION_SCORE_LABELS[key]}
            size="sm"
            value={draft.scores[key]}
            onChange={(score) => setDraft((prev) => ({ ...prev, scores: { ...prev.scores, [key]: score } }))}
          />
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={contentId} className="text-14-semibold text-normal">
          강의평
        </label>
        <TextArea
          id={contentId}
          rows={6}
          value={draft.content}
          onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
          placeholder="수업은 어땠나요? 다른 학생들에게 도움이 되도록 솔직하게 적어 주세요"
        />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-14-regular text-warning">
          {getFailureMessage(mutation.error)}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={!canSubmit}>
          {isEdit ? '저장' : '등록'}
        </Button>
      </div>
    </form>
  );
}

type ScoreInputProps = {
  label: string;
  /** lg: 총점 (별 28px, 이름이 위), sm: 항목별 점수 (별 20px, 이름이 왼쪽) */
  size: 'lg' | 'sm';
  value: number | null;
  onChange: (score: number) => void;
};

/** 별 다섯 개 중 하나를 고르는 점수 입력. 라디오 버튼이라 방향키로도 고른다 */
function ScoreInput({ label, size, value, onChange }: ScoreInputProps) {
  const name = useId();
  return (
    <fieldset className={clsx('flex', size === 'lg' ? 'flex-col gap-2' : 'items-center justify-between')}>
      {/* legend 는 flex 배치를 따르지 않아 이름은 숨겨 읽히고, 보이는 글자는 따로 둔다 */}
      <legend className="sr-only">{label}</legend>
      <span aria-hidden className={size === 'lg' ? 'text-14-semibold text-normal' : 'text-14-regular text-plain'}>
        {label}
      </span>
      <div className="flex">
        {Array.from({ length: EVALUATION_SCORE_MAX }, (_, index) => {
          const score = index + 1;
          return (
            <label
              key={score}
              className="cursor-pointer rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-snutt-mint"
            >
              <input
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                aria-label={`${score}점`}
                className="sr-only"
              />
              <IconStarFill
                aria-hidden
                className={clsx(
                  size === 'lg' ? 'size-7' : 'size-5',
                  value !== null && score <= value ? 'text-snutt-yellow' : 'text-line-light',
                )}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
