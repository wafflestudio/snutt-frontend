'use client';

import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { type ReactNode, useId, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { evaluationQueries, useUpdateEvaluation, useWriteEvaluation } from '@/api/evaluations';
import {
  EVALUATION_CONTENT_MIN_LENGTH,
  EVALUATION_SCORE_MAX,
  EVALUATION_SCORE_QUESTIONS,
  EVALUATION_SCORE_STEP,
  type Evaluation,
  type EvaluationDraft,
  type EvaluationScores,
  getEvaluationChange,
  getWritableEvaluationLectures,
  isValidEvaluationContent,
  type TakenLecture,
  toEvaluationInput,
} from '@/domain/evaluation';
import type { CourseId, LectureId } from '@/domain/lecture';
import { formatSemesterTitle } from '@/domain/semester';
import { Button } from '@/shared/ui/Button';
import { IconStarFill } from '@/shared/ui/icons';
import { Select } from '@/shared/ui/Select';
import { TextArea } from '@/shared/ui/TextField';

const SCORE_KEYS = Object.keys(EVALUATION_SCORE_QUESTIONS) as (keyof EvaluationScores)[];

/**
 * - write: 강좌에 쓴다. 강좌의 학기별 강의 중 아직 쓰지 않은 것을 고르고, 처음에는 lectureId(지금 보고 있는 강의)를 고른다
 * - write-lecture: 수강한 강의에 바로 쓴다 (강의평 탭의 최근 강의). 학기는 바꿀 수 없다
 * - edit: 내 강의평을 고친다. 학기는 바꿀 수 없고 바뀐 값만 보낸다
 */
export type EvaluationFormTarget =
  | { type: 'write'; courseId: CourseId; lectureId: LectureId | null }
  | { type: 'write-lecture'; lecture: TakenLecture }
  | { type: 'edit'; evaluation: Evaluation };

type EvaluationFormProps = {
  target: EvaluationFormTarget;
  /** 있으면 맨 위에 강의명 · 교수 / 학점을 두고 오른쪽에 학기를 둔다 (강의평 탭). 없으면 학기만 오른쪽에 둔다 (강의 상세) */
  heading?: { title: string; subtitle: string | null };
  /** 있으면 `작성완료` 옆에 `취소` 를 둔다. 강의평 탭은 맨 위 `<` 로 돌아가므로 두지 않는다 */
  onCancel?: () => void;
  /** 저장하면 부른다. 고쳤는지 새로 썼는지 넘긴다 */
  onSaved: (result: 'written' | 'updated') => void;
};

const EMPTY_DRAFT: EvaluationDraft = {
  content: '',
  rating: null,
  scores: { gradeSatisfaction: null, teachingSkill: null, gains: null, lifeBalance: null },
};

/**
 * 강의평 작성 · 수정 폼 (Figma `강의평_강의평 작성`). 패널 안에 그린다.
 * 위에서부터 학기, `강의 총평`(총점과 항목별 질문 4개, 별 반 개 단위), `강의 리뷰`(선택, 쓰면 20자 이상), `작성완료`.
 * `강의 키워드` 는 서버에 받을 곳이 없어 뺐다 (디자인 문의 4-30)
 */
export function EvaluationForm({ target, heading, onCancel, onSaved }: EvaluationFormProps) {
  const isEdit = target.type === 'edit';
  const [draft, setDraft] = useState<EvaluationDraft>(() =>
    isEdit
      ? { content: target.evaluation.content, rating: target.evaluation.rating, scores: target.evaluation.scores }
      : EMPTY_DRAFT,
  );
  const write = useWriteEvaluation();
  const update = useUpdateEvaluation();
  const mutation = isEdit ? update : write;

  // 강좌에 쓸 때만: 강좌의 학기별 강의 중 아직 쓰지 않은 것
  const lectures = useQuery({
    ...evaluationQueries.lectures(target.type === 'write' ? target.courseId : ''),
    enabled: target.type === 'write',
    select: getWritableEvaluationLectures,
  });
  const [pickedLectureId, setPickedLectureId] = useState<LectureId | null>(null);
  const writable = lectures.data ?? [];
  const lectureId =
    target.type === 'write-lecture'
      ? target.lecture.lectureId
      : (pickedLectureId ??
        (target.type === 'write' && writable.some(({ lectureId }) => lectureId === target.lectureId)
          ? target.lectureId
          : null));
  const sameSemesterCount = (lecture: (typeof writable)[number]) =>
    writable.filter(({ semester }) => formatSemesterTitle(semester) === formatSemesterTitle(lecture.semester)).length;

  const input = toEvaluationInput(draft);
  const change = target.type === 'edit' ? getEvaluationChange(target.evaluation, draft) : null;
  const canSubmit = !mutation.isPending && (isEdit ? change !== null : input !== null && lectureId !== null);

  const submit = () => {
    if (!canSubmit) return;
    if (target.type === 'edit' && change) {
      update.mutate({ evaluation: target.evaluation, change }, { onSuccess: () => onSaved('updated') });
    } else if (input && lectureId) {
      write.mutate({ lectureId, input }, { onSuccess: () => onSaved('written') });
    }
  };

  const contentId = useId();
  const contentHintId = useId();
  // 고칠 때 원래 본문 그대로면 짧아도 괜찮다 (getEvaluationChange)
  const contentTooShort =
    !isValidEvaluationContent(draft.content) &&
    (target.type !== 'edit' || draft.content.trim() !== target.evaluation.content);

  const semester =
    target.type === 'edit' ? (
      <SemesterText>{formatSemesterTitle(target.evaluation.semester)}</SemesterText>
    ) : target.type === 'write-lecture' ? (
      <SemesterText>{formatSemesterTitle(target.lecture.semester)}</SemesterText>
    ) : lectures.isPending ? (
      <SemesterText muted>불러오는 중</SemesterText>
    ) : lectures.isError ? (
      <p className="text-14-regular text-warning">{getFailureMessage(lectures.error)}</p>
    ) : writable.length === 0 ? (
      <SemesterText muted>강의평을 쓸 수 있는 학기가 없습니다</SemesterText>
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
        placeholder="수강 학기"
        className="w-auto min-w-36"
      />
    );

  return (
    <form
      aria-label={isEdit ? '강의평 수정' : '강의평 작성'}
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {/* Figma: 강의명 · 교수 / 학점 왼쪽, 학기 드롭다운 오른쪽 */}
      <div className="flex items-start justify-between gap-3">
        {heading && (
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-20-bold break-keep text-normal">{heading.title}</h2>
            {heading.subtitle && <p className="text-14-regular text-plain">{heading.subtitle}</p>}
          </div>
        )}
        <div className="ml-auto shrink-0">{semester}</div>
      </div>

      {/* Figma: 강의 총평 아래 질문마다 이름 · 별 */}
      <fieldset className="mt-8 flex flex-col gap-4">
        <legend className="mb-3 text-15-semibold text-normal">강의 총평</legend>
        <ScoreInput
          label="총점"
          value={draft.rating}
          onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))}
        />
        {SCORE_KEYS.map((key) => (
          <ScoreInput
            key={key}
            label={EVALUATION_SCORE_QUESTIONS[key]}
            value={draft.scores[key]}
            onChange={(score) => setDraft((prev) => ({ ...prev, scores: { ...prev.scores, [key]: score } }))}
          />
        ))}
      </fieldset>

      <hr className="my-6 border-line-light" />

      <div className="flex flex-col gap-3">
        <label htmlFor={contentId} className="flex items-baseline gap-1.5">
          <span className="text-15-semibold text-normal">강의 리뷰</span>
          <span className="text-13-regular text-assistive">선택</span>
        </label>
        <TextArea
          id={contentId}
          aria-label="강의 리뷰"
          rows={6}
          value={draft.content}
          aria-describedby={contentHintId}
          aria-invalid={contentTooShort || undefined}
          onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
          placeholder={'강의에 대한 솔직한 리뷰를 남겨주세요.\nex) 과제, 출석, 교수님, 시험 난이도, 팀플 유무 등'}
        />
        <p
          id={contentHintId}
          className={clsx('self-end text-12-regular', contentTooShort ? 'text-warning' : 'text-assistive')}
        >
          (최소 {EVALUATION_CONTENT_MIN_LENGTH}자)
        </p>
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-3 text-14-regular text-warning">
          {getFailureMessage(mutation.error)}
        </p>
      )}

      {/* Figma: 오른쪽 아래 민트 버튼 `작성완료` */}
      <div className="mt-6 flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit}>
          {isEdit ? '저장' : '작성완료'}
        </Button>
      </div>
    </form>
  );
}

function SemesterText({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <p aria-label="수강 학기" className={clsx('py-2 text-14-regular', muted ? 'text-assistive' : 'text-plain')}>
      {children}
    </p>
  );
}

const SCORES = Array.from(
  { length: EVALUATION_SCORE_MAX / EVALUATION_SCORE_STEP },
  (_, index) => (index + 1) * EVALUATION_SCORE_STEP,
);

type ScoreInputProps = {
  label: string;
  value: number | null;
  onChange: (score: number) => void;
};

/**
 * 별 다섯 개를 반 개 단위로 고르는 점수 입력 (Figma 는 2.5 점을 별 두 개 반으로 그린다).
 * 별마다 왼쪽 반은 .5 점, 오른쪽 반은 정수 점수다. 라디오 버튼이라 방향키로도 고른다
 */
function ScoreInput({ label, value, onChange }: ScoreInputProps) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-1.5">
      {/* legend 는 flex 배치를 따르지 않아 이름은 숨겨 읽히고, 보이는 글자는 따로 둔다 */}
      <legend className="sr-only">{label}</legend>
      <span aria-hidden className="text-14-regular text-plain">
        {label}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: EVALUATION_SCORE_MAX }, (_, index) => {
          const filled = value === null ? 0 : Math.min(Math.max(value - index, 0), 1);
          return (
            <span key={index} className="relative size-6">
              <IconStarFill aria-hidden className="absolute inset-0 size-6 text-line-light" />
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${filled * 100}%` }}>
                <IconStarFill aria-hidden className="size-6 text-snutt-yellow" />
              </span>
              {SCORES.filter((score) => score > index && score <= index + 1).map((score) => (
                <label
                  key={score}
                  className={clsx(
                    'absolute inset-y-0 w-1/2 cursor-pointer rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-snutt-mint',
                    score === index + 1 ? 'right-0' : 'left-0',
                  )}
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
                </label>
              ))}
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}
