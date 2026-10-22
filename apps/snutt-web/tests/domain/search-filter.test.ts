import { describe, expect, it } from 'vitest';
import {
  EMPTY_SEARCH_FILTER,
  getFilterChips,
  groupCategories,
  isSearchFilterEmpty,
  type SearchFilter,
  toggleValue,
  toSearchConditions,
} from '@/domain/search-filter';

const filter = (change: Partial<SearchFilter>): SearchFilter => ({ ...EMPTY_SEARCH_FILTER, ...change });

describe('getFilterChips', () => {
  it('필터 모달의 순서대로 칩을 만든다', () => {
    const chips = getFilterChips(
      filter({
        etc: ['english'],
        credit: [3],
        sort: 'rating',
        categoryPre2025: ['외국어'],
        time: { times: [{ day: 0, startMinute: 540, endMinute: 600 }], emptyOnly: true },
      }),
    );
    expect(chips.map(({ label }) => label)).toEqual([
      '평점 높은 순',
      '3학점',
      '(구)외국어',
      '영강',
      '시간대 검색',
      '빈 시간대만',
    ]);
  });

  it('칩의 remove 는 그 값만 뺀다', () => {
    const value = filter({ academicYear: ['1학년', '3학년'], sort: 'rating' });
    const [sort, first] = getFilterChips(value);
    expect(first.remove(value)).toEqual(filter({ academicYear: ['3학년'], sort: 'rating' }));
    expect(sort.remove(value).sort).toBeNull();
  });

  it('아무것도 고르지 않으면 비어 있다', () => {
    expect(isSearchFilterEmpty(EMPTY_SEARCH_FILTER)).toBe(true);
    expect(isSearchFilterEmpty(filter({ time: { times: [], emptyOnly: true } }))).toBe(false);
  });
});

describe('toSearchConditions', () => {
  it('고른 순서와 상관없이 같은 조건이 된다', () => {
    const a = toSearchConditions(filter({ credit: [3, 1], department: ['B', 'A'] }), []);
    const b = toSearchConditions(filter({ credit: [1, 3], department: ['A', 'B'] }), []);
    expect(a).toEqual(b);
    expect(a.credit).toEqual([1, 3]);
  });

  it('빈 시간대만이면 시간표의 수업 시간을 뺄 시간으로 넣는다', () => {
    const occupied = [{ day: 1 as const, startMinute: 600, endMinute: 660, place: '301-101' }];
    expect(toSearchConditions(filter({}), occupied).excludedTimes).toEqual([]);
    expect(toSearchConditions(filter({ time: { times: [], emptyOnly: true } }), occupied).excludedTimes).toEqual([
      { day: 1, startMinute: 600, endMinute: 660 },
    ]);
  });
});

describe('toggleValue', () => {
  it('없으면 넣고 있으면 뺀다', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('groupCategories', () => {
  it('묶음 순서대로 나누고, 묶음에 없는 영역은 이름 없는 마지막 묶음에 둔다', () => {
    expect(groupCategories(['공감과 공존', '외국어', '새 영역', '글쓰기와 말하기'], 'category')).toEqual([
      { title: '학문의 토대', categories: ['글쓰기와 말하기', '외국어'] },
      { title: '지성의 확장', categories: ['공감과 공존'] },
      { title: null, categories: ['새 영역'] },
    ]);
  });

  it('교양영역은 2025 전 학기의 예전 이름도 묶고, 두 묶음에 있는 이름(외국어)은 새 묶음에 넣는다', () => {
    expect(groupCategories(['외국어', '사고와 표현'], 'category')).toEqual([
      { title: '학문의 토대', categories: ['외국어'] },
      { title: '학문의 기초', categories: ['사고와 표현'] },
    ]);
  });

  it('(구)교양영역은 예전 묶음만 쓴다', () => {
    expect(groupCategories(['외국어', '사고와 표현'], 'categoryPre2025')).toEqual([
      { title: '학문의 기초', categories: ['사고와 표현', '외국어'] },
    ]);
  });
});
