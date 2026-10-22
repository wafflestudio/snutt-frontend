import type { DayTimeRange } from './time';
import { EMPTY_TIME_FILTER, type TimeFilter, toSearchTimes } from './time-filter';

/** 정렬기준. 고르지 않으면 서버 기본 순서 */
export type SearchSort = 'rating' | 'evaluationCount';

export const SEARCH_SORT_LABELS: Record<SearchSort, string> = {
  rating: '평점 높은 순',
  evaluationCount: '강의평 많은 순',
};

/** 기타. 영어진행 강의 · 군휴학 원격수업 */
export type EtcTag = 'english' | 'militaryRemote';

export const ETC_TAG_LABELS: Record<EtcTag, string> = { english: '영강', militaryRemote: '군휴학' };

/**
 * 검색 필터 (필터 모달). 정렬기준은 하나만, 나머지는 여러 개 고른다. 같은 종류 안에서는 하나라도 맞으면 되고(또는),
 * 종류끼리는 모두 맞아야 한다(그리고). 고를 수 있는 값은 학기마다 서버가 준다 (`SearchTags`)
 */
export type SearchFilter = {
  sort: SearchSort | null;
  classification: string[];
  department: string[];
  academicYear: string[];
  credit: number[];
  category: string[];
  categoryPre2025: string[];
  etc: EtcTag[];
  time: TimeFilter;
};

export const EMPTY_SEARCH_FILTER: SearchFilter = {
  sort: null,
  classification: [],
  department: [],
  academicYear: [],
  credit: [],
  category: [],
  categoryPre2025: [],
  etc: [],
  time: EMPTY_TIME_FILTER,
};

/** 여러 개 고르는 필터 */
export type MultiFilterField =
  'classification' | 'department' | 'academicYear' | 'credit' | 'category' | 'categoryPre2025';

/** 학기의 필터 값 (`GET /v2/tags/{year}/{semester}`). 학기마다 다르다 */
export type SearchTags = {
  classification: string[];
  department: string[];
  academicYear: string[];
  credit: number[];
  category: string[];
  categoryPre2025: string[];
};

/** 값 하나를 넣거나 뺀다 */
export const toggleValue = <T>(values: readonly T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export type FilterChipKind = 'sort' | MultiFilterField | 'etc' | 'time';

/** 적용한 필터 하나 (`3학점 ×`). remove 는 그것만 뺀 필터를 돌려준다 */
export type FilterChip = {
  key: string;
  kind: FilterChipKind;
  label: string;
  remove: (filter: SearchFilter) => SearchFilter;
};

/** 필터를 칩 목록으로. 필터 모달의 순서(정렬기준, 분류, 학과 …)대로 늘어놓는다 */
export const getFilterChips = (filter: SearchFilter): FilterChip[] => {
  const multi = <F extends MultiFilterField>(
    kind: F,
    label: (value: SearchFilter[F][number]) => string,
  ): FilterChip[] =>
    (filter[kind] as SearchFilter[F][number][]).map((value) => ({
      key: `${kind}:${value}`,
      kind,
      label: label(value),
      remove: (current) => ({ ...current, [kind]: (current[kind] as unknown[]).filter((item) => item !== value) }),
    }));
  return [
    ...(filter.sort
      ? [
          {
            key: 'sort',
            kind: 'sort' as const,
            label: SEARCH_SORT_LABELS[filter.sort],
            remove: (f: SearchFilter) => ({ ...f, sort: null }),
          },
        ]
      : []),
    ...multi('classification', String),
    ...multi('department', String),
    ...multi('academicYear', String),
    ...multi('credit', (credit) => `${credit}학점`),
    ...multi('category', String),
    ...multi('categoryPre2025', (category) => `(구)${category}`),
    ...filter.etc.map((tag) => ({
      key: `etc:${tag}`,
      kind: 'etc' as const,
      label: ETC_TAG_LABELS[tag],
      remove: (f: SearchFilter) => ({ ...f, etc: f.etc.filter((item) => item !== tag) }),
    })),
    ...(filter.time.times.length > 0
      ? [
          {
            key: 'time:times',
            kind: 'time' as const,
            label: '시간대 검색',
            remove: (f: SearchFilter) => ({ ...f, time: { ...f.time, times: [] } }),
          },
        ]
      : []),
    ...(filter.time.emptyOnly
      ? [
          {
            key: 'time:empty',
            kind: 'time' as const,
            label: '빈 시간대만',
            remove: (f: SearchFilter) => ({ ...f, time: { ...f.time, emptyOnly: false } }),
          },
        ]
      : []),
  ];
};

export const isSearchFilterEmpty = (filter: SearchFilter) => getFilterChips(filter).length === 0;

/** 검색 요청에 넣을 조건. 값을 정렬해서, 고른 순서가 달라도 조건이 같으면 query key 도 같게 한다 */
export type SearchConditions = Omit<SearchFilter, 'time'> & { times: DayTimeRange[]; excludedTimes: DayTimeRange[] };

/** occupied: 고른 시간표의 수업 시간 (빈 시간대만 검색) */
export const toSearchConditions = (filter: SearchFilter, occupied: readonly DayTimeRange[]): SearchConditions => {
  const sorted = <T extends string | number>(values: readonly T[]) => [...values].sort();
  return {
    sort: filter.sort,
    classification: sorted(filter.classification),
    department: sorted(filter.department),
    academicYear: sorted(filter.academicYear),
    credit: [...filter.credit].sort((a, b) => a - b),
    category: sorted(filter.category),
    categoryPre2025: sorted(filter.categoryPre2025),
    etc: sorted(filter.etc),
    ...toSearchTimes(filter.time, occupied),
  };
};

/*
 * 교양영역 묶음. 서버는 영역 이름만 평평하게 주므로 묶음은 Figma `교양영역 목록` · `(구)교양영역 목록` 과 예전 웹을 따라 여기서 정한다.
 * 이름은 서버 값과 같아야 한다. 어느 묶음에도 없는 영역은 마지막의 이름 없는 묶음에 넣는다 (디자인 문의 4-21)
 */
export type CategoryGroup = { title: string | null; categories: string[] };

type CategoryGroupSpec = { title: string; categories: readonly string[] };

/** 2025 학년도부터 (교양영역) */
const CATEGORY_GROUPS: readonly CategoryGroupSpec[] = [
  { title: '학문의 토대', categories: ['글쓰기와 말하기', '외국어', '수학과학컴퓨팅'] },
  {
    title: '지성의 열쇠',
    categories: ['문화 해석과 상상', '역사적 탐구와 철학적 사유', '인간의 이해와 사회 분석', '과학적 사고와 응용'],
  },
  { title: '지성의 확장', categories: ['지식의 세계', '공감과 공존', '자율과 창의', '예술과 체육', '학부생 세미나'] },
];

/** 2025 학년도 전 ((구)교양영역, 2025 전 학기의 교양영역). 예전 웹과 같다 */
const CATEGORY_PRE2025_GROUPS: readonly CategoryGroupSpec[] = [
  {
    title: '학문의 기초',
    categories: ['사고와 표현', '외국어', '수량적 분석과 추론', '과학적 사고와 실험', '컴퓨터와 정보 활용'],
  },
  {
    title: '학문의 세계',
    categories: [
      '언어와 문학',
      '문화와 예술',
      '역사와 철학',
      '정치와 경제',
      '인간과 사회',
      '자연과 기술',
      '생명과 환경',
    ],
  },
  { title: '선택 교양', categories: ['체육', '예술 실기', '예술실기', '대학과 리더십', '창의와 융합', '한국의 이해'] },
  { title: '전공영역', categories: ['교과교육', '교육실습', '교직소양', '교직이론'] },
];

/**
 * 학기의 영역을 묶음으로. 영역이 없는 묶음은 빼고, 한 영역은 처음 맞는 묶음에만 넣는다.
 * 2025 전 학기는 교양영역(category)에도 예전 이름이 오므로 교양영역은 새 묶음 다음에 예전 묶음도 본다
 */
export const groupCategories = (
  categories: readonly string[],
  field: 'category' | 'categoryPre2025',
): CategoryGroup[] => {
  const specs = field === 'category' ? [...CATEGORY_GROUPS, ...CATEGORY_PRE2025_GROUPS] : CATEGORY_PRE2025_GROUPS;
  const left = new Set(categories);
  const groups: CategoryGroup[] = [];
  for (const { title, categories: names } of specs) {
    const found = names.filter((name) => left.has(name));
    found.forEach((name) => left.delete(name));
    if (found.length > 0) groups.push({ title, categories: found });
  }
  if (left.size > 0) groups.push({ title: null, categories: categories.filter((name) => left.has(name)) });
  return groups;
};
