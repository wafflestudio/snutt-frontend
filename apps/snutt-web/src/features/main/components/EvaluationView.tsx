'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getFailureMessage, isEmailNotVerified } from '@/api/errors';
import {
  evaluationQueries,
  useDeleteEvaluation,
  useReportEvaluation,
  useToggleEvaluationLike,
} from '@/api/evaluations';
import {
  type CourseEvaluationSummary,
  type Evaluation,
  EVALUATION_SCORE_LABELS,
  type EvaluationScores,
  type EvaluationSort,
} from '@/domain/evaluation';
import type { CourseId, Lecture, LectureId, TimetableLecture } from '@/domain/lecture';
import { formatSemesterShortTitle, formatSemesterTitle } from '@/domain/semester';
import { ConfirmDialog, NoticeDialog, PromptDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconEdit, IconMoreVertical, IconStarFill, IconThumbUp } from '@/shared/ui/icons';
import { Menu, MenuItem } from '@/shared/ui/Menu';
import { Toast } from '@/shared/ui/Toast';
import { EmailVerificationCard } from './EmailVerificationCard';
import { EvaluationForm } from './EvaluationForm';

const SORT_LABELS: Record<EvaluationSort, string> = { recommended: '추천순', latest: '최신순' };

const SCORE_KEYS = Object.keys(EVALUATION_SCORE_LABELS) as (keyof EvaluationScores)[];

/** 교수 / 학점 (`정상준 / 3학점`). 둘 다 없으면 null */
export const formatInstructorCredit = ({ instructor, credit }: { instructor: string | null; credit: number | null }) =>
  [instructor, credit !== null && `${credit}학점`].filter(Boolean).join(' / ') || null;

/**
 * 강의 상세의 `강의평` 쪽 (Figma `강의평 상세`): 교수 / 학점, 평균 점수와 항목별 점수, 강의평 작성 버튼, 강의평 목록(추천순 / 최신순).
 * 목록은 패널을 끝까지 내리면 다음 쪽을 받는다. 강의평마다 좋아요 버튼과 ⋮ 메뉴(내 강의평이면 수정 · 삭제, 아니면 신고)가 있다.
 * 태그 탭(성적 · 과제 · 수강신청 · 팀플) 통계는 API 가 없어 뺐다 (디자인 문의 4-19). 작성 폼 · 메뉴는 디자인 문의 4-27
 */
export function EvaluationView({ lecture }: { lecture: Lecture | TimetableLecture }) {
  return (
    // Figma: 교수 / 학점은 제목 바로 아래, 왼쪽은 제목에 맞춘다
    <div className="flex flex-col pb-5">
      <p className="pr-7 pl-7.25 text-14-regular text-plain">{formatInstructorCredit(lecture)}</p>
      {lecture.courseId === null ? (
        <Message>직접 추가한 강의는 강의평이 없습니다</Message>
      ) : (
        <CourseEvaluations
          courseId={lecture.courseId}
          // 강의평 탭과 같은 인증 팝업 (Figma `강의평_인증_메일 입력`, 디자인 문의 4-19 2번)
          notVerified={
            <div className="px-6.5 pt-10">
              <EmailVerificationCard />
            </div>
          }
          // 강의평은 수강한 강의에 쓴다. 처음에는 지금 보고 있는 강의를 고른다
          lectureId={'lectureId' in lecture ? lecture.lectureId : lecture.id}
        />
      )}
    </div>
  );
}

/** 강의평에 대해 띄우는 것. 한 번에 하나만 연다. 작성 · 수정은 패널 안의 폼, 삭제 · 신고는 팝업 */
type EvaluationDialog =
  | { type: 'write' }
  | { type: 'edit'; evaluation: Evaluation }
  | { type: 'delete'; evaluation: Evaluation }
  | { type: 'report'; evaluation: Evaluation };

/** 강의평 하나에 하는 동작 (⋮ 메뉴) */
export type EvaluationAction = 'edit' | 'delete' | 'report';

type CourseEvaluationsProps = {
  courseId: CourseId;
  /** 강의평을 쓸 때 처음 고를 강의 (지금 보고 있는 강의) */
  lectureId: LectureId | null;
  /** 이메일 인증을 하지 않아 볼 수 없을 때 보여 줄 것 (인증 팝업). 없으면 서버 문구만 */
  notVerified?: ReactNode;
};

/** 강좌의 강의평: 요약, 작성 버튼, 목록. 작성 · 수정을 누르면 이 자리에 폼을 그린다 (Figma `강의평_강의평 작성`, 디자인 문의 4-27) */
export function CourseEvaluations({ courseId, lectureId, notVerified: notVerifiedView }: CourseEvaluationsProps) {
  const [sort, setSort] = useState<EvaluationSort>('recommended');
  const [dialog, setDialog] = useState<EvaluationDialog | null>(null);
  // 끝난 동작은 토스트로, 실패한 동작은 알림 팝업으로 알린다
  const [toast, setToast] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const toggleLike = useToggleEvaluationLike();
  const onError = (error: Error) => setFailure(getFailureMessage(error));
  const summary = useQuery(evaluationQueries.summary(courseId));
  const list = useInfiniteQuery(evaluationQueries.list({ courseId, sort }));
  const evaluations = list.data?.pages.flatMap((page) => page.evaluations) ?? [];

  // 이메일 인증을 하지 않으면 강의평 API 가 모두 403 이다. 인증 팝업을 보여 준다
  const notVerified = [summary.error, list.error].find(isEmailNotVerified);
  if (notVerified) return notVerifiedView ?? <Message>{getFailureMessage(notVerified)}</Message>;

  if (dialog?.type === 'write' || dialog?.type === 'edit')
    return (
      <div className="px-6.5 pt-5">
        <EvaluationForm
          target={
            dialog.type === 'edit'
              ? { type: 'edit', evaluation: dialog.evaluation }
              : { type: 'write', courseId, lectureId }
          }
          onCancel={() => setDialog(null)}
          onSaved={(result) => {
            setDialog(null);
            setToast(result === 'updated' ? '강의평을 수정했습니다' : '강의평을 등록했습니다');
          }}
        />
      </div>
    );

  const toastView = (
    <Toast open={toast !== null} onOpenChange={(open) => !open && setToast(null)} message={toast ?? ''} />
  );

  // Figma `강의평 상세_ empty 케이스`: 요약 · 목록 없이 가운데 안내와 작성 버튼
  if (summary.data?.count === 0)
    return (
      <>
        <EmptyEvaluations onWrite={() => setDialog({ type: 'write' })} />
        {toastView}
      </>
    );

  return (
    <>
      {/* Figma: 교수 / 학점 아래 20, 평균 점수 아래 20 에 구분선 */}
      <div className="mt-5 pr-7 pl-7.25">
        {summary.isPending ? (
          <p className="text-14-regular text-assistive">불러오는 중</p>
        ) : summary.isError ? (
          <p className="text-14-regular text-assistive">{getFailureMessage(summary.error)}</p>
        ) : (
          <Summary summary={summary.data} />
        )}
      </div>

      {/* Figma: 통계 아래 가운데 민트 버튼, 아래에 구분선 */}
      <WriteButton onClick={() => setDialog({ type: 'write' })} />

      <hr className="mx-6.5 mt-5 border-line-light" />

      <section aria-label="강의평 목록" className="flex flex-col">
        <SortToggle value={sort} onChange={setSort} />
        {list.isPending ? (
          <Message>불러오는 중</Message>
        ) : list.isError && evaluations.length === 0 ? (
          <Message>{getFailureMessage(list.error)}</Message>
        ) : evaluations.length === 0 ? (
          <Message>아직 강의평이 없습니다</Message>
        ) : (
          <ul className="flex flex-col px-6.5">
            {evaluations.map((evaluation) => (
              <li key={evaluation.id} className="border-b border-line-light last:border-b-0">
                <EvaluationItem
                  evaluation={evaluation}
                  heading="semester"
                  liking={toggleLike.isPending && toggleLike.variables.id === evaluation.id}
                  onLike={() => toggleLike.mutate(evaluation, { onError })}
                  onAction={(type) => setDialog({ type, evaluation })}
                />
              </li>
            ))}
          </ul>
        )}
        {list.isFetchingNextPage ? (
          <Message>불러오는 중</Message>
        ) : (
          list.isFetchNextPageError && list.error && <Message>{getFailureMessage(list.error)}</Message>
        )}
        {list.hasNextPage && (
          <LoadMore
            count={evaluations.length}
            onVisible={() => !list.isFetching && !list.isFetchNextPageError && void list.fetchNextPage()}
          />
        )}
      </section>

      <EvaluationActionDialogs
        dialog={dialog?.type === 'delete' || dialog?.type === 'report' ? dialog : null}
        onClose={() => setDialog(null)}
        onDone={setToast}
        onError={onError}
      />
      {toastView}
      <NoticeDialog open={failure !== null} onOpenChange={(open) => !open && setFailure(null)} message={failure} />
    </>
  );
}

type EvaluationActionDialogsProps = {
  dialog: { type: 'delete' | 'report'; evaluation: Evaluation } | null;
  onClose: () => void;
  /** 끝나면 알릴 말을 넘긴다 */
  onDone: (message: string) => void;
  onError: (error: Error) => void;
};

/** ⋮ 메뉴의 삭제 확인 · 신고 사유 팝업 (디자인 문의 4-27 7번) */
export function EvaluationActionDialogs({ dialog, onClose, onDone, onError }: EvaluationActionDialogsProps) {
  const deleteEvaluation = useDeleteEvaluation();
  const reportEvaluation = useReportEvaluation();
  return (
    <>
      <ConfirmDialog
        open={dialog?.type === 'delete'}
        onOpenChange={(open) => !open && onClose()}
        message="강의평을 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={() =>
          dialog?.type === 'delete' &&
          deleteEvaluation.mutate(dialog.evaluation, { onSuccess: () => onDone('강의평을 삭제했습니다'), onError })
        }
      />
      <PromptDialog
        open={dialog?.type === 'report'}
        onOpenChange={(open) => !open && onClose()}
        title="신고 사유"
        submitLabel="신고"
        onSubmit={(content) =>
          dialog?.type === 'report' &&
          reportEvaluation.mutate(
            { evaluation: dialog.evaluation, content },
            { onSuccess: () => onDone('강의평을 신고했습니다'), onError },
          )
        }
      />
    </>
  );
}

/** Figma `강의평 상세_ empty 케이스`: `아직 강의평이 없어요.` · `첫 강의평을 남겨보세요!` · 작성 버튼. 고양이 그림은 받지 못해 뺐다 (디자인 문의 4-30) */
function EmptyEvaluations({ onWrite }: { onWrite: () => void }) {
  return (
    <section aria-label="강의평 없음" className="flex flex-col items-center gap-1 px-6.5 pt-30 pb-10 text-center">
      <p className="text-15-semibold text-normal">아직 강의평이 없어요.</p>
      <p className="text-13-regular text-alternative">첫 강의평을 남겨보세요!</p>
      <WriteButton onClick={onWrite} />
    </section>
  );
}

/**
 * Figma `Button/filled`: 폭 123 · 높이 36, 둥글기 17, 여백 8 · 16, 아이콘(연필 20)과 글자 사이 5, 배경 SNUTT/mint,
 * 글자 Text/onBG 14 Bold, 그림자 0 0 3.5 검정 25%
 */
export function WriteButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-5 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          'inline-flex h-9 w-30.75 items-center justify-center gap-1.25 rounded-[17px] bg-snutt-mint px-4 py-2',
          'text-14-bold text-on-bg shadow-[0_0_3.5px_rgb(0_0_0/25%)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
        )}
      >
        <IconEdit aria-hidden className="size-5" />
        강의평 작성
      </button>
    </div>
  );
}

/** 평균 점수 `4.0 (4)` 와 별, 오른쪽에 항목별 평균 2 × 2. 강의평이 없으면 점수 자리에 `-` */
function Summary({ summary }: { summary: CourseEvaluationSummary }) {
  return (
    <section aria-label="강의평 요약" className="flex items-start justify-between gap-5">
      <div className="flex flex-col gap-1.5">
        <p className="flex items-end gap-1">
          <span className="text-36-medium text-normal">{formatScore(summary.rating)}</span>
          <span className="text-13-body-regular text-alternative">({summary.count})</span>
        </p>
        <Stars rating={summary.rating ?? 0} />
      </div>
      {/* Figma: 두 줄, 칸 사이 가로 20 · 세로 12 */}
      <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
        {SCORE_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <IconStarFill aria-hidden className="size-3.25 text-snutt-yellow" />
            {/* 읽는 순서는 이름 → 점수, 보이는 순서는 점수 → 이름 */}
            <dt className="order-last ml-0.5 text-13-regular text-plain">{EVALUATION_SCORE_LABELS[key]}</dt>
            <dd className="text-13-semibold text-normal">{formatScore(summary.scores[key])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** 점수는 소수 첫째 자리까지. 모르면 `-` */
const formatScore = (score: number | null) => (score === null ? '-' : score.toFixed(1));

/** 별 다섯 개(Figma 14px). 점수만큼 노랗게 칠한다 (4.5 면 네 개 반) */
export function Stars({ rating }: { rating: number }) {
  const stars = (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <IconStarFill key={index} aria-hidden className="size-3.5 shrink-0" />
      ))}
    </>
  );
  return (
    <span role="img" aria-label={`별점 ${rating}점`} className="relative inline-flex w-fit">
      <span className="flex text-line-light">{stars}</span>
      <span
        className="absolute inset-y-0 left-0 flex overflow-hidden text-snutt-yellow"
        style={{ width: `${(Math.min(Math.max(rating, 0), 5) / 5) * 100}%` }}
      >
        {stars}
      </span>
    </span>
  );
}

type SortToggleProps = {
  value: EvaluationSort;
  onChange: (sort: EvaluationSort) => void;
  /** 배치. 없으면 강의 상세처럼 목록 위 오른쪽 */
  className?: string;
};

/** Figma: 강의 상세는 목록 위 오른쪽, 강의평 탭은 왼쪽. 고른 것만 회색 배경 */
export function SortToggle({ value, onChange, className = 'justify-end px-6.5 pt-5' }: SortToggleProps) {
  return (
    <div role="group" aria-label="정렬" className={clsx('flex gap-1', className)}>
      {(Object.keys(SORT_LABELS) as EvaluationSort[]).map((sort) => (
        <button
          key={sort}
          type="button"
          aria-pressed={sort === value}
          onClick={() => onChange(sort)}
          className={clsx(
            'rounded-sm px-2 py-1 text-12-medium',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-snutt-mint',
            sort === value ? 'bg-light-field text-normal' : 'text-assistive',
          )}
        >
          {SORT_LABELS[sort]}
        </button>
      ))}
    </div>
  );
}

type EvaluationItemProps = {
  evaluation: Evaluation;
  /**
   * 맨 위에 무엇을 보여 줄지.
   * - semester: 수강 학기 · 별 (강의 상세. 강좌가 같으므로 강의명이 없다)
   * - course: 강의명, `★ 4.0 교수` (강의평 탭 둘러보기). 학기는 본문 아래에 짧게
   * - mine: 강의명, 별 · 교수 (강의평 탭 나의 강의평. 학기로 묶여 있다)
   */
  heading: 'semester' | 'course' | 'mine';
  /** 좋아요를 보내는 중. 그동안은 다시 누를 수 없다 */
  liking: boolean;
  onLike: () => void;
  /** 없으면 ⋮ 메뉴를 두지 않는다 (Figma `강의평 메인`) */
  onAction?: (action: EvaluationAction) => void;
  /** 있으면 강의명을 눌러 강좌의 강의평을 연다 */
  onOpenCourse?: () => void;
};

/** 강의평 한 개: 수강 학기 · 강의명과 ⋮ 메뉴, 별점, 본문(두 줄 넘으면 `더보기`), 좋아요 버튼 */
export function EvaluationItem({ evaluation, heading, liking, onLike, onAction, onOpenCourse }: EvaluationItemProps) {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  // 두 줄에서 잘렸는지는 그려 본 뒤에 안다
  const [clamped, setClamped] = useState(false);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (content && !expanded) setClamped(content.scrollHeight > content.clientHeight);
  }, [evaluation.content, expanded]);

  return (
    // Figma: 위아래 20, 학기 · 별 · 본문 사이 8
    <article
      aria-label={
        heading === 'semester'
          ? `${formatSemesterTitle(evaluation.semester)} 강의평`
          : `${evaluation.courseTitle} ${formatSemesterTitle(evaluation.semester)} 강의평`
      }
      className="flex flex-col gap-2 py-5"
    >
      <div className="flex items-start justify-between gap-2">
        {heading === 'semester' ? (
          <div className="flex flex-col">
            <p className="text-13-body-regular text-alternative">{formatSemesterTitle(evaluation.semester)}</p>
            <Stars rating={evaluation.rating} />
          </div>
        ) : (
          // Figma `강의평 메인` · `강의평_나의 강의평`: 강의명 15/Bold, 아래에 점수 · 교수
          <div className="flex min-w-0 flex-col gap-1">
            {onOpenCourse ? (
              <button
                type="button"
                onClick={onOpenCourse}
                className="self-start rounded-sm text-left text-15-bold text-normal hover:underline focus-visible:outline-2 focus-visible:outline-snutt-mint"
              >
                {evaluation.courseTitle}
              </button>
            ) : (
              <p className="text-15-bold text-normal">{evaluation.courseTitle}</p>
            )}
            <p className="flex items-center gap-1.5 text-13-regular text-alternative">
              {heading === 'course' ? (
                <span className="flex items-center gap-0.5 text-13-semibold text-normal">
                  <IconStarFill aria-hidden className="size-3.5 text-snutt-yellow" />
                  <span className="sr-only">별점</span>
                  {evaluation.rating.toFixed(1)}
                </span>
              ) : (
                <Stars rating={evaluation.rating} />
              )}
              {evaluation.instructor}
            </p>
          </div>
        )}
        {/* 고칠 수 있는지(내 강의평인지)는 서버의 isModifiable 로 정한다 */}
        {onAction && (
          <Menu
            align="end"
            trigger={<IconButton label="강의평 메뉴" icon={<IconMoreVertical />} className="-mr-1.5" />}
          >
            {evaluation.isModifiable ? (
              <>
                <MenuItem onClick={() => onAction('edit')}>수정</MenuItem>
                <MenuItem onClick={() => onAction('delete')}>삭제</MenuItem>
              </>
            ) : (
              <MenuItem onClick={() => onAction('report')}>신고</MenuItem>
            )}
          </Menu>
        )}
      </div>
      <div>
        <p
          ref={contentRef}
          className={clsx('text-13-body-regular break-all whitespace-pre-line text-plain', !expanded && 'line-clamp-2')}
        >
          {evaluation.content}
        </p>
        {clamped && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-13-body-regular text-alternative underline"
          >
            더보기
          </button>
        )}
      </div>
      {heading === 'course' && (
        <p className="text-13-body-regular text-alternative">{formatSemesterShortTitle(evaluation.semester)}</p>
      )}
      {/* Figma: 오른쪽 아래 둥근 테두리 안에 엄지 · 수. 누른 상태는 Figma 에 없어 민트로 칠한다 (디자인 문의 4-27) */}
      <button
        type="button"
        aria-pressed={evaluation.isLiked}
        aria-label={`좋아요 ${evaluation.likeCount}개`}
        disabled={liking}
        onClick={onLike}
        className={clsx(
          'flex items-center gap-1 self-end rounded-full border px-2.5 py-1 text-13-regular',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
          evaluation.isLiked ? 'border-current text-snutt-mint' : 'border-line-light text-alternative hover:bg-light',
        )}
      >
        <IconThumbUp aria-hidden className="size-4" />
        {evaluation.likeCount}
      </button>
    </article>
  );
}

/** 이 자리가 보이면(끝에 닿기 조금 전) 다음 쪽을 받는다. 받은 수가 바뀌면 다시 살펴 또 보이면 또 받는다 */
export function LoadMore({ count, onVisible }: { count: number; onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  useEffect(() => {
    onVisibleRef.current = onVisible;
  });

  useEffect(() => {
    const target = ref.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    // 패널(스크롤하는 조상)에서 가려지면 보이지 않는 것으로 친다
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && onVisibleRef.current(), {
      rootMargin: '0px 0px 200px 0px',
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [count]);

  return <div ref={ref} aria-hidden className="h-px" />;
}

export function Message({ children }: { children: ReactNode }) {
  return <p className="px-6.5 py-5 text-center text-14-regular text-assistive">{children}</p>;
}
