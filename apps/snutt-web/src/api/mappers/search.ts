import type { SnuttV2 } from '@sf/snutt-api';
import type { EtcTag, SearchConditions, SearchSort, SearchTags } from '@/domain/search-filter';
import type { DayTimeRange } from '@/domain/time';

// 검색 필터 domain ↔ v2 검색 요청 · 학기 태그 응답

const SORT_PARAMS: Record<SearchSort, SnuttV2.LectureSearchRequest['sort']> = {
  rating: 'RATING_DESC',
  evaluationCount: 'COUNT_DESC',
};

// 예전 웹과 같은 값. 서버 태그 응답에는 없다
const ETC_TAG_PARAMS: Record<EtcTag, string> = { english: 'E', militaryRemote: 'MO' };

/** 조건이 없으면 null 로 보낸다 (빈 배열이어도 서버가 조건으로 보는지 확인하지 않았다) */
const orNull = <T>(values: readonly T[]) => (values.length > 0 ? [...values] : null);

const toSearchTimes = (ranges: readonly DayTimeRange[]) =>
  orNull(ranges.map(({ day, startMinute, endMinute }) => ({ day, startMinute, endMinute })));

/** 검색 요청의 조건 부분 (학기 · 검색어 · 쪽은 부르는 쪽이 채운다) */
export const toSearchConditionsRequest = (conditions: SearchConditions) => ({
  classification: orNull(conditions.classification),
  department: orNull(conditions.department),
  academicYear: orNull(conditions.academicYear),
  credit: orNull(conditions.credit),
  category: orNull(conditions.category),
  categoryPre2025: orNull(conditions.categoryPre2025),
  etcTags: orNull(conditions.etc.map((tag) => ETC_TAG_PARAMS[tag])),
  times: toSearchTimes(conditions.times),
  timesToExclude: toSearchTimes(conditions.excludedTimes),
  sort: conditions.sort ? SORT_PARAMS[conditions.sort] : 'DEFAULT',
});

/** 정렬기준 목록(sortCriteria)은 앱이 정한 두 가지를 쓰므로 받지 않는다. 강사 목록도 필터에 없어서 받지 않는다 */
export const toSearchTags = (tags: SnuttV2.TagListResponse): SearchTags => ({
  classification: tags.classification,
  department: tags.department,
  academicYear: tags.academicYear,
  credit: tags.credit,
  category: tags.category,
  categoryPre2025: tags.categoryPre2025,
});
