'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getFailureMessage, isEmailNotVerified } from '@/api/errors';
import { evaluationQueries } from '@/api/evaluations';
import {
  type CourseEvaluationSummary,
  type Evaluation,
  EVALUATION_SCORE_LABELS,
  type EvaluationScores,
  type EvaluationSort,
} from '@/domain/evaluation';
import type { CourseId, Lecture, TimetableLecture } from '@/domain/lecture';
import { formatSemesterTitle } from '@/domain/semester';
import { IconStarFill, IconThumbUp } from '@/shared/ui/icons';

const SORT_LABELS: Record<EvaluationSort, string> = { recommended: '추천순', latest: '최신순' };

const SCORE_KEYS = Object.keys(EVALUATION_SCORE_LABELS) as (keyof EvaluationScores)[];

/**
 * 강의 상세의 `강의평` 쪽 (Figma `강의평 상세`): 교수 / 학점, 평균 점수와 항목별 점수, 강의평 목록(추천순 / 최신순).
 * 목록은 패널을 끝까지 내리면 다음 쪽을 받는다.
 * 태그 탭(성적 · 과제 · 수강신청 · 팀플) 통계는 API 가 없어 뺐고, 강의평 작성 · 좋아요 누르기 · ⋮ 메뉴는 8-5 (디자인 문의 4-19)
 */
export function EvaluationView({ lecture }: { lecture: Lecture | TimetableLecture }) {
  return (
    // Figma: 교수 / 학점은 제목 바로 아래, 왼쪽은 제목에 맞춘다
    <div className="flex flex-col pb-5">
      <p className="pr-7 pl-7.25 text-14-regular text-plain">
        {[lecture.instructor, lecture.credit !== null && `${lecture.credit}학점`].filter(Boolean).join(' / ')}
      </p>
      {lecture.courseId === null ? (
        <Message>직접 추가한 강의는 강의평이 없습니다</Message>
      ) : (
        <CourseEvaluations courseId={lecture.courseId} />
      )}
    </div>
  );
}

function CourseEvaluations({ courseId }: { courseId: CourseId }) {
  const [sort, setSort] = useState<EvaluationSort>('recommended');
  const summary = useQuery(evaluationQueries.summary(courseId));
  const list = useInfiniteQuery(evaluationQueries.list({ courseId, sort }));
  const evaluations = list.data?.pages.flatMap((page) => page.evaluations) ?? [];

  // 이메일 인증을 하지 않으면 강의평 API 가 모두 403 이다. 서버 문구(`이메일 인증이 완료된 후 ...`)만 보여 준다
  // 인증 화면이 아직 없어 안내만 한다 (디자인 문의 4-19)
  const notVerified = [summary.error, list.error].find(isEmailNotVerified);
  if (notVerified) return <Message>{getFailureMessage(notVerified)}</Message>;

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
                <EvaluationItem evaluation={evaluation} />
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
    </>
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
function Stars({ rating }: { rating: number }) {
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

type SortToggleProps = { value: EvaluationSort; onChange: (sort: EvaluationSort) => void };

/** Figma: 목록 위 오른쪽, 고른 것만 회색 배경 */
function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div role="group" aria-label="정렬" className="flex justify-end gap-1 px-6.5 pt-5">
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

/** 강의평 한 개: 수강 학기, 별점, 본문(두 줄 넘으면 `더보기`), 좋아요 수. 좋아요를 누르는 것은 8-5 */
function EvaluationItem({ evaluation }: { evaluation: Evaluation }) {
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
    <article aria-label={`${formatSemesterTitle(evaluation.semester)} 강의평`} className="flex flex-col gap-2 py-5">
      <div className="flex flex-col">
        <p className="text-13-body-regular text-alternative">{formatSemesterTitle(evaluation.semester)}</p>
        <Stars rating={evaluation.rating} />
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
      {/* Figma: 오른쪽 아래 둥근 테두리 안에 엄지 · 수 */}
      <p
        aria-label={`좋아요 ${evaluation.likeCount}개`}
        className="flex items-center gap-1 self-end rounded-full border border-line-light px-2.5 py-1 text-13-regular text-alternative"
      >
        <IconThumbUp aria-hidden className="size-4" />
        {evaluation.likeCount}
      </p>
    </article>
  );
}

/** 이 자리가 보이면(끝에 닿기 조금 전) 다음 쪽을 받는다. 받은 수가 바뀌면 다시 살펴 또 보이면 또 받는다 */
function LoadMore({ count, onVisible }: { count: number; onVisible: () => void }) {
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

function Message({ children }: { children: ReactNode }) {
  return <p className="px-6.5 py-5 text-center text-14-regular text-assistive">{children}</p>;
}
