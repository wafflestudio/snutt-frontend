'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { type ReactNode, useState } from 'react';
import { getFailureMessage, isEmailNotVerified } from '@/api/errors';
import { evaluationQueries, useToggleEvaluationLike } from '@/api/evaluations';
import {
  type CourseSummary,
  EVALUATION_SORT_TAGS,
  type Evaluation,
  type EvaluationSort,
  getEvaluationChipTags,
  groupBySemester,
  type TakenLecture,
} from '@/domain/evaluation';
import type { CourseId } from '@/domain/lecture';
import { formatSemesterShortTitle } from '@/domain/semester';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, NoticeDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconChevronDown, IconDockToRight, IconEdit, IconStarFill } from '@/shared/ui/icons';
import { SearchField } from '@/shared/ui/SearchField';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import { Toast } from '@/shared/ui/Toast';
import { EmailVerificationCard } from './EmailVerificationCard';
import { EvaluationForm } from './EvaluationForm';
import {
  type EvaluationAction,
  EvaluationActionDialogs,
  CourseEvaluations,
  EvaluationItem,
  formatInstructorCredit,
  LoadMore,
  Message,
  SortToggle,
} from './EvaluationView';
import { PanelColumn, PanelNav } from './PanelColumn';

/** 강의평 탭에서 연 강좌. 강의평 · 검색 결과에서 연다 */
type CourseRef = { id: CourseId; title: string; instructor: string };

/** 패널 안에서 옮겨 다니는 화면. 앞 화면으로 돌아갈 수 있게 쌓아 둔다 */
type Screen =
  | { type: 'home' }
  /** Figma `강의평 상세`: 강좌의 강의평 */
  | { type: 'course'; course: CourseRef }
  /** Figma `강의평_나의 강의평_최근 강의목록` */
  | { type: 'taken' }
  /** Figma `강의평_강의평 작성`: 수강한 강의에 쓴다 */
  | { type: 'write'; lecture: TakenLecture };

type HomeTab = 'all' | 'mine';

const SEARCH_DELAY = 300;

/**
 * 강의평 탭 (`/reviews`, 8-6). 메인 화면의 목록 패널 자리에 그린다.
 * - 전체보기: 검색창(강좌 검색), 태그 칩, 추천순 · 최신순, 강의평 목록 (Figma `강의평 메인`)
 * - 나의 강의평: 최근 수강한 강의, 내가 쓴 강의평을 학기별로 (Figma `강의평_나의 강의평`)
 * 강의명을 누르면 강좌의 강의평(`강의평 상세`), 수강한 강의의 연필을 누르면 작성 화면을 같은 패널에 연다.
 * 이메일 인증 전이면 인증 팝업만 보여 준다. 정해지지 않은 것은 디자인 문의 4-30
 */
export function ReviewsPanel({ onCollapse }: { onCollapse: () => void }) {
  const [tab, setTab] = useState<HomeTab>('all');
  const [screens, setScreens] = useState<Screen[]>([{ type: 'home' }]);
  const screen = screens[screens.length - 1];
  const open = (next: Screen) => setScreens((prev) => [...prev, next]);
  const back = () => setScreens((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const home = () => setScreens([{ type: 'home' }]);
  // 수강한 강의에 쓰고 나면 `강의평 등록 완료` 팝업을 띄운다
  const [written, setWritten] = useState(false);

  return (
    <PanelColumn label="강의평" className="min-h-0">
      {screen.type === 'home' ? (
        <ReviewsHome tab={tab} onTabChange={setTab} onCollapse={onCollapse} onOpen={open} />
      ) : (
        <>
          <PanelNav backLabel="뒤로" onBack={back} onClose={home} closeLabel="강의평 처음으로" />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {screen.type === 'course' ? (
              <CourseScreen key={screen.course.id} course={screen.course} />
            ) : screen.type === 'taken' ? (
              <TakenLecturesScreen onWrite={(lecture) => open({ type: 'write', lecture })} />
            ) : (
              <div className="px-7.25 pt-4 pb-5">
                <EvaluationForm
                  key={screen.lecture.lectureId}
                  target={{ type: 'write-lecture', lecture: screen.lecture }}
                  heading={{ title: screen.lecture.title, subtitle: formatInstructorCredit(screen.lecture) }}
                  onSaved={() => {
                    back();
                    setWritten(true);
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
      <ConfirmDialog
        open={written}
        onOpenChange={setWritten}
        message={
          <>
            <strong className="block text-14-semibold text-normal">강의평 등록 완료</strong>
            남겨주신 강의평은 다른 사용자들에게
            <br />큰 도움이 됩니다.
          </>
        }
        confirmLabel="남은 강의평 작성"
        onConfirm={() => setScreens([{ type: 'home' }, { type: 'taken' }])}
      />
    </PanelColumn>
  );
}

type ReviewsHomeProps = {
  tab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
  onCollapse: () => void;
  onOpen: (screen: Screen) => void;
};

/** 패널 제목 `강의평` 과 접기 버튼, `전체보기 | 나의 강의평` 탭 */
function ReviewsHome({ tab, onTabChange, onCollapse, onOpen }: ReviewsHomeProps) {
  return (
    // Figma `강의평 메인`: 메인 목록 패널처럼 여백 위 · 양옆 20, 제목 · 탭 · 검색창 사이 20
    <div className="flex min-h-0 flex-1 flex-col gap-5 px-5 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-22-bold text-normal">강의평</h1>
        <IconButton label="패널 접기" icon={<IconDockToRight className="size-4!" />} onClick={onCollapse} />
      </div>
      <Tabs value={tab} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col gap-5">
        <TabList>
          <Tab value="all">전체보기</Tab>
          <Tab value="mine">나의 강의평</Tab>
        </TabList>
        <TabPanel value="all" keepMounted className="flex min-h-0 flex-1 flex-col">
          <AllEvaluations onOpenCourse={(course) => onOpen({ type: 'course', course })} />
        </TabPanel>
        <TabPanel value="mine" className="flex min-h-0 flex-1 flex-col">
          <MyEvaluations
            onOpenCourse={(course) => onOpen({ type: 'course', course })}
            onOpenTaken={() => onOpen({ type: 'taken' })}
            onWrite={(lecture) => onOpen({ type: 'write', lecture })}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}

const toCourseRef = ({ courseId, courseTitle, instructor }: Evaluation): CourseRef => ({
  id: courseId,
  title: courseTitle,
  instructor,
});

/** 전체보기: 검색어가 있으면 강좌 검색 결과, 없으면 태그 · 정렬로 고른 강의평 */
function AllEvaluations({ onOpenCourse }: { onOpenCourse: (course: CourseRef) => void }) {
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DELAY);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Figma 의 필터 버튼과 적용 필터 칩은 강좌 검색에 거를 값이 정해지지 않아 뺐다 (디자인 문의 4-30) */}
      <SearchField
        aria-label="강의평 검색"
        placeholder="강의명, 교수명을 검색하세요"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      {query ? (
        <CourseResults key={query} query={query} onOpenCourse={onOpenCourse} />
      ) : (
        <TaggedEvaluations onOpenCourse={onOpenCourse} />
      )}
    </div>
  );
}

/**
 * 태그 칩(명강 · 고진감래 등)과 추천순 · 최신순. 서버는 추천 · 최신도 태그로 주므로 칩을 고르지 않았을 때만 정렬을 보여 준다.
 * 같은 칩을 다시 누르면 고른 것을 푼다 (디자인 문의 4-30)
 */
function TaggedEvaluations({ onOpenCourse }: { onOpenCourse: (course: CourseRef) => void }) {
  const [sort, setSort] = useState<EvaluationSort>('recommended');
  const [chip, setChip] = useState<string | null>(null);
  const tags = useQuery({ ...evaluationQueries.tags(), select: getEvaluationChipTags });
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {tags.data && tags.data.length > 0 && (
        // Figma: 칩 높이 26, 둥글게, 사이 6
        <div role="group" aria-label="태그" className="flex flex-wrap gap-1.5">
          {tags.data.map(({ key, title, description }) => (
            <button
              key={key}
              type="button"
              title={description}
              aria-pressed={chip === key}
              onClick={() => setChip((prev) => (prev === key ? null : key))}
              className={clsx(
                'inline-flex h-6.5 items-center rounded-full border px-3.5 text-12-medium whitespace-nowrap',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-snutt-mint',
                chip === key ? 'border-transparent bg-snutt-mint text-on-bg' : 'border-line-light bg-normal text-plain',
              )}
            >
              {title}
            </button>
          ))}
        </div>
      )}
      {chip === null && <SortToggle value={sort} onChange={setSort} className="pt-1" />}
      <div className="-mx-5 min-h-0 flex-1 overflow-y-auto">
        <EvaluationFeed
          key={chip ?? sort}
          query={evaluationQueries.byTag(chip ?? EVALUATION_SORT_TAGS[sort])}
          onOpenCourse={onOpenCourse}
        />
      </div>
    </div>
  );
}

type EvaluationFeedProps = {
  query: ReturnType<typeof evaluationQueries.byTag>;
  onOpenCourse: (course: CourseRef) => void;
};

/** 여러 강좌가 섞인 강의평 목록 (Figma `강의평 메인`). 강의명을 누르면 강좌의 강의평을 연다 */
function EvaluationFeed({ query, onOpenCourse }: EvaluationFeedProps) {
  const list = useInfiniteQuery(query);
  const evaluations = list.data?.pages.flatMap((page) => page.evaluations) ?? [];
  const { onLike, likingId, failureDialog } = useLike();

  if (isEmailNotVerified(list.error)) return <VerifyEmail />;
  return (
    <section aria-label="강의평 목록" className="flex flex-col">
      {list.isPending ? (
        <Message>불러오는 중</Message>
      ) : list.isError && evaluations.length === 0 ? (
        <Message>{getFailureMessage(list.error)}</Message>
      ) : evaluations.length === 0 ? (
        <Message>아직 강의평이 없습니다</Message>
      ) : (
        <ul className="flex flex-col px-5">
          {evaluations.map((evaluation) => (
            <li key={evaluation.id} className="border-b border-line-light last:border-b-0">
              <EvaluationItem
                evaluation={evaluation}
                heading="course"
                liking={likingId === evaluation.id}
                onLike={() => onLike(evaluation)}
                onOpenCourse={() => onOpenCourse(toCourseRef(evaluation))}
              />
            </li>
          ))}
        </ul>
      )}
      {list.hasNextPage && (
        <LoadMore
          count={evaluations.length}
          onVisible={() => !list.isFetching && !list.isFetchNextPageError && void list.fetchNextPage()}
        />
      )}
      {failureDialog}
    </section>
  );
}

/** 좋아요 누르기 · 취소. 실패하면 알림 팝업 */
function useLike() {
  const toggleLike = useToggleEvaluationLike();
  const [failure, setFailure] = useState<string | null>(null);
  return {
    onLike: (evaluation: Evaluation) =>
      toggleLike.mutate(evaluation, { onError: (error) => setFailure(getFailureMessage(error)) }),
    likingId: toggleLike.isPending ? toggleLike.variables.id : null,
    failureDialog: (
      <NoticeDialog open={failure !== null} onOpenChange={(open) => !open && setFailure(null)} message={failure} />
    ),
  };
}

/** 강좌 검색 결과: 강의명, `★ 4.0 (12)` · 교수. 누르면 강좌의 강의평 */
function CourseResults({ query, onOpenCourse }: { query: string; onOpenCourse: (course: CourseRef) => void }) {
  const result = useInfiniteQuery(evaluationQueries.courses(query));
  const courses = result.data?.pages.flatMap((page) => page.courses) ?? [];
  if (isEmailNotVerified(result.error)) return <VerifyEmail />;
  return (
    <section aria-label="검색 결과" className="-mx-5 min-h-0 flex-1 overflow-y-auto">
      {result.isPending ? (
        <Message>불러오는 중</Message>
      ) : result.isError && courses.length === 0 ? (
        <Message>{getFailureMessage(result.error)}</Message>
      ) : courses.length === 0 ? (
        <Message>검색 결과가 없습니다</Message>
      ) : (
        <ul className="flex flex-col px-5">
          {courses.map((course) => (
            <li key={course.id} className="border-b border-line-light last:border-b-0">
              <CourseRow course={course} onClick={() => onOpenCourse(course)} />
            </li>
          ))}
        </ul>
      )}
      {result.hasNextPage && (
        <LoadMore
          count={courses.length}
          onVisible={() => !result.isFetching && !result.isFetchNextPageError && void result.fetchNextPage()}
        />
      )}
    </section>
  );
}

function CourseRow({ course, onClick }: { course: CourseSummary; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-1 rounded-md py-4 text-left hover:bg-light focus-visible:outline-2 focus-visible:outline-snutt-mint"
    >
      <span className="text-15-bold text-normal">{course.title}</span>
      <span className="flex items-center gap-1.5 text-13-regular text-alternative">
        <span className="flex items-center gap-0.5">
          <IconStarFill
            aria-hidden
            className={clsx('size-3.5', course.rating === null ? 'text-line-light' : 'text-snutt-yellow')}
          />
          <span className="text-13-semibold text-normal">
            {course.rating === null ? '-' : course.rating.toFixed(1)}
          </span>
          <span>({course.count})</span>
        </span>
        {course.instructor}
      </span>
    </button>
  );
}

/** 나의 강의평: 강의평을 남길 최근 강의, 지난 학기 강의 안내, 내가 쓴 강의평 (학기별) */
function MyEvaluations({
  onOpenCourse,
  onOpenTaken,
  onWrite,
}: {
  onOpenCourse: (course: CourseRef) => void;
  onOpenTaken: () => void;
  onWrite: (lecture: TakenLecture) => void;
}) {
  const taken = useQuery(evaluationQueries.takenLectures());
  const list = useInfiniteQuery(evaluationQueries.myList());
  const evaluations = list.data?.pages.flatMap((page) => page.evaluations) ?? [];
  const { onLike, likingId, failureDialog } = useLike();
  const [action, setAction] = useState<{ type: EvaluationAction; evaluation: Evaluation } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  if ([taken.error, list.error].some(isEmailNotVerified)) return <VerifyEmail />;
  if (action?.type === 'edit')
    return (
      <div className="min-h-0 flex-1 overflow-y-auto pb-5">
        <EvaluationForm
          target={{ type: 'edit', evaluation: action.evaluation }}
          heading={{ title: action.evaluation.courseTitle, subtitle: action.evaluation.instructor }}
          onCancel={() => setAction(null)}
          onSaved={() => {
            setAction(null);
            setToast('강의평을 수정했습니다');
          }}
        />
      </div>
    );

  const next = taken.data?.[0];
  return (
    <div className="-mx-5 min-h-0 flex-1 overflow-y-auto px-5 pb-5">
      {/* Figma: 맨 위에 강의평을 쓸 강의 하나와 `강의평 작성` 버튼 */}
      {next && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-15-bold text-normal">{next.title}</p>
            <p className="text-13-regular text-alternative">{next.instructor}</p>
          </div>
          <Button className="shrink-0" onClick={() => onWrite(next)}>
            <IconEdit />
            강의평 작성
          </Button>
        </div>
      )}
      {/* Figma: 옅은 민트 상자. 누르면 최근 강의 목록 */}
      <button
        type="button"
        onClick={onOpenTaken}
        className="mt-4 flex w-full flex-col items-center gap-1 rounded-md bg-snutt-mint/8 px-4 py-6 text-center focus-visible:outline-2 focus-visible:outline-snutt-mint"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-snutt-mint/15 text-snutt-mint">
          <IconEdit aria-hidden className="size-3.5" />
        </span>
        <span className="text-14-semibold text-snutt-mint">지난학기에 수강한 강의</span>
        <span className="text-13-regular text-assistive">강의평을 남겨보세요!</span>
      </button>

      <section aria-label="내 강의평" className="mt-6 flex flex-col">
        {list.isPending ? (
          <Message>불러오는 중</Message>
        ) : list.isError && evaluations.length === 0 ? (
          <Message>{getFailureMessage(list.error)}</Message>
        ) : evaluations.length === 0 ? (
          <Message>아직 쓴 강의평이 없습니다</Message>
        ) : (
          groupBySemester(evaluations, ({ semester }) => semester).map(({ semester, items }) => (
            <div key={`${semester.year}-${semester.term}`} className="flex flex-col">
              <SemesterLabel>{formatSemesterShortTitle(semester)}</SemesterLabel>
              <ul className="flex flex-col px-1.5">
                {items.map((evaluation) => (
                  <li key={evaluation.id} className="border-b border-line-light last:border-b-0">
                    <EvaluationItem
                      evaluation={evaluation}
                      heading="mine"
                      liking={likingId === evaluation.id}
                      onLike={() => onLike(evaluation)}
                      onAction={(type) => setAction({ type, evaluation })}
                      onOpenCourse={() => onOpenCourse(toCourseRef(evaluation))}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        {list.hasNextPage && (
          <LoadMore
            count={evaluations.length}
            onVisible={() => !list.isFetching && !list.isFetchNextPageError && void list.fetchNextPage()}
          />
        )}
      </section>
      <EvaluationActionDialogs
        dialog={action?.type === 'delete' || action?.type === 'report' ? { ...action, type: action.type } : null}
        onClose={() => setAction(null)}
        onDone={setToast}
        onError={(error) => setFailure(getFailureMessage(error))}
      />
      <Toast open={toast !== null} onOpenChange={(open) => !open && setToast(null)} message={toast ?? ''} />
      <NoticeDialog open={failure !== null} onOpenChange={(open) => !open && setFailure(null)} message={failure} />
      {failureDialog}
    </div>
  );
}

/** Figma: 학기 묶음 위 회색 상자 `26년 1학기` */
function SemesterLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 self-start rounded-sm bg-light-field px-2 py-1 text-12-medium text-alternative">{children}</p>
  );
}

/** Figma `강의평 상세`(강의평 탭): 강의명 · 교수, 그 강좌의 강의평. 강의 상세로 바꾸는 버튼은 강의(학기)를 몰라 뺐다 */
function CourseScreen({ course }: { course: CourseRef }) {
  return (
    <div className="flex flex-col pb-5">
      <div className="flex flex-col gap-1 pt-2 pr-7 pl-7.25">
        <h2 className="text-20-bold break-keep text-normal">{course.title}</h2>
        <p className="text-14-regular text-plain">{course.instructor}</p>
      </div>
      <CourseEvaluations courseId={course.id} lectureId={null} notVerified={<VerifyEmail />} />
    </div>
  );
}

/**
 * Figma `강의평_나의 강의평_최근 강의목록`: `강의 목록` 제목과 안내, 학기별 강의와 연필 버튼.
 * 가장 최근 학기만 먼저 보여 주고 `이전학기 강의 보기` 로 나머지를 펼친다.
 * 강의마다 `★ 4.6` 평점은 서버가 주지 않아 뺐다 (디자인 문의 4-30)
 */
function TakenLecturesScreen({ onWrite }: { onWrite: (lecture: TakenLecture) => void }) {
  const taken = useQuery(evaluationQueries.takenLectures());
  const [expanded, setExpanded] = useState(false);
  if (isEmailNotVerified(taken.error)) return <VerifyEmail />;
  const groups = groupBySemester(taken.data ?? [], ({ semester }) => semester);
  const shown = expanded ? groups : groups.slice(0, 1);
  return (
    <section aria-label="최근 강의 목록" className="flex flex-col px-5 pb-5">
      <div className="flex flex-col gap-1 px-2.25 pt-2">
        <h2 className="text-20-bold text-normal">강의 목록</h2>
        <p className="text-14-regular text-plain">지난학기에 수강한 강의의 강의평을 남겨보세요.</p>
      </div>
      {taken.isPending ? (
        <Message>불러오는 중</Message>
      ) : taken.isError ? (
        <Message>{getFailureMessage(taken.error)}</Message>
      ) : groups.length === 0 ? (
        <Message>강의평을 남길 강의가 없습니다</Message>
      ) : (
        <>
          {shown.map(({ semester, items }) => (
            <div key={`${semester.year}-${semester.term}`} className="mt-4 flex flex-col">
              <SemesterLabel>{formatSemesterShortTitle(semester)}</SemesterLabel>
              <ul className="mt-2 flex flex-col">
                {items.map((lecture) => (
                  // Figma: 커서를 올린 줄은 회색 배경, 오른쪽 둥근 연필 버튼
                  <li
                    key={lecture.lectureId}
                    className="flex items-center justify-between gap-3 rounded-md px-2.5 py-3 hover:bg-light"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-15-semibold text-normal">{lecture.title}</p>
                      <p className="text-13-regular text-alternative">{lecture.instructor}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`${lecture.title} 강의평 작성`}
                      onClick={() => onWrite(lecture)}
                      className="flex size-7.5 shrink-0 items-center justify-center rounded-full border border-line-light bg-normal text-alternative hover:bg-light-field focus-visible:outline-2 focus-visible:outline-snutt-mint"
                    >
                      <IconEdit aria-hidden className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!expanded && groups.length > 1 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-4 flex items-center justify-center gap-1 self-center rounded-sm text-14-regular text-assistive focus-visible:outline-2 focus-visible:outline-snutt-mint"
            >
              이전학기 강의 보기
              <IconChevronDown aria-hidden className="size-4" />
            </button>
          )}
        </>
      )}
    </section>
  );
}

function VerifyEmail() {
  return (
    <div className="flex flex-1 items-start justify-center px-5 pt-10">
      <EmailVerificationCard />
    </div>
  );
}
