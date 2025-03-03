import { type SearchTimeDto } from '@sf/snutt-api/src/apis/snutt-timetable/schemas';
import { type FormEvent, useState } from 'react';
import styled from 'styled-components';

import { IcFilter } from '@/components/icons/ic-filter';
import { IcSearch } from '@/components/icons/ic-search';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import type { SearchFilter } from '@/entities/search';
import { type CourseBook } from '@/entities/semester';
import type { FullTimetable } from '@/entities/timetable';
import { useGuardContext } from '@/hooks/useGuardContext';
import { type SearchService } from '@/usecases/searchService';
import { formatDate } from '@/utils/formatDate';

import { MainSearchbarFilterDialog } from './main-searchbar-filter-dialog';
import { MainSearchbarYearSemesterSelect } from './main-searchbar-year-semester-select';

type Props = {
  onSearch: (filter: Parameters<SearchService['search']>[0]) => void;
  currentFullTimetable: FullTimetable | null;
  resetSearchResult: () => void;
  courseBooks: CourseBook[];
};

export type SearchForm = {
  title: SearchFilter['title'];
  academicYear: SearchFilter['academicYear'];
  category: SearchFilter['category'];
  categoryPre2025: SearchFilter['categoryPre2025'];
  credit: SearchFilter['credit'];
  etc: SearchFilter['etc'];
  classification: SearchFilter['classification'];
  department: SearchFilter['department'];
  times: SearchFilter['times'];
  timeType: 'manual' | 'auto' | null;
};

const initialForm = {
  title: '',
  academicYear: [],
  credit: [],
  etc: [],
  category: [],
  categoryPre2025: [],
  classification: [],
  department: [],
  times: [],
  timeType: null,
};

const isInitialForm = (form: SearchForm) => JSON.stringify(initialForm) === JSON.stringify(form);

export const MainSearchbar = ({ onSearch, currentFullTimetable, resetSearchResult, courseBooks }: Props) => {
  const [open, setOpen] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchForm>(initialForm);
  const { year, semester } = useGuardContext(YearSemesterContext);
  const { timeMaskService } = useGuardContext(ServiceContext);
  const currentCourseBook = courseBooks?.find((c) => c.year === year && c.semester === semester);
  if (!currentCourseBook) throw new Error('currentCourseBook is not found');
  const currentCourseBookUpdatedAt = formatDate(
    currentCourseBook.updatedAt,
    ({ YYYY, MM, DD }) => `${YYYY}. ${MM}. ${DD}`,
  );

  const { token } = useGuardContext(TokenAuthContext);

  const onSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const undefinedIfEmpty = <T,>(e: T[]) => (e.length === 0 ? undefined : e);

    onSearch({
      token,
      params: {
        academicYear: undefinedIfEmpty(searchForm.academicYear),
        category: undefinedIfEmpty(searchForm.category),
        categoryPre2025: undefinedIfEmpty(searchForm.categoryPre2025),
        classification: undefinedIfEmpty(searchForm.classification),
        credit: undefinedIfEmpty(searchForm.credit),
        department: undefinedIfEmpty(searchForm.department),
        etc: undefinedIfEmpty(searchForm.etc),
        year,
        semester,
        title: searchForm.title,
        times: undefinedIfEmpty(searchForm.times),
        timesToExclude:
          searchForm.timeType === 'auto' && currentFullTimetable
            ? timeMaskService.getTimesByTimeTable(currentFullTimetable)
            : undefined,
        limit: 200,
      },
    });
  };

  const onChangeTimes = (times: SearchTimeDto[]) => setSearchForm((sf) => ({ ...sf, times }));

  const onChangeCheckbox = <
    F extends 'academicYear' | 'category' | 'categoryPre2025' | 'classification' | 'credit' | 'department' | 'etc',
  >(
    field: F,
    e: SearchForm[F][number],
  ) => {
    setSearchForm((sf) => {
      const org = sf[field] as (typeof e)[];
      return {
        ...sf,
        [field]: org.includes(e) ? org.filter((c) => c !== e) : org.concat(e),
      };
    });
  };

  return (
    <Wrapper>
      <MainSearchbarYearSemesterSelect resetSearchResult={resetSearchResult} courseBooks={courseBooks} />
      <Form onSubmit={onSubmit}>
        <Input
          data-testid="main-searchbar-input"
          placeholder={`원하는 강의를 검색하세요. (수강편람 최근 업데이트: ${currentCourseBookUpdatedAt})`}
          value={searchForm.title ?? ''}
          onChange={(e) => setSearchForm((sf) => ({ ...sf, title: e.target.value }))}
        />
        <TransparentButton data-testid="main-searchbar-search" type="submit">
          <SearchIcon />
        </TransparentButton>
        <TransparentButton type="button" data-testid="layout-searchbar-filter-button" onClick={() => setOpen(true)}>
          <FilterIcon />
        </TransparentButton>
        <MainSearchbarFilterDialog
          open={open}
          onSubmit={onSubmit}
          onReset={isInitialForm(searchForm) ? null : () => setSearchForm(initialForm)}
          onClose={() => setOpen(false)}
          searchForm={searchForm}
          onChangeCheckbox={onChangeCheckbox}
          onChangeDepartment={(department) => setSearchForm((sf) => ({ ...sf, department }))}
          onChangeTimeRadio={(timeType) => setSearchForm((sf) => ({ ...sf, timeType }))}
          onChangeTimes={onChangeTimes}
        />
      </Form>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const FilterIcon = styled(IcFilter)`
  width: 30px;
  height: 30px;
`;

const SearchIcon = styled(IcSearch)`
  width: 20px;
  height: 20px;
`;

const Form = styled.form`
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TransparentButton = styled.button`
  border: none;
  cursor: pointer;
  background: transparent;
  min-width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 4px;
  transition: opacity 0.2s;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  border-radius: 15px;
  border-width: 1px;
  border-style: solid;
  border-color: #d5dbe0;
  outline: none;
  padding-inline: 20px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #bec4c9;
  }

  &:focus {
    border-color: #1bd0c8;
  }

  &::placeholder {
    color: #d5dbe0;
  }
`;
