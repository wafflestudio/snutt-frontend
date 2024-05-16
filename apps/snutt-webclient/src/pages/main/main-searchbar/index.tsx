import dayjs from 'dayjs';
import { type FormEvent, useState } from 'react';
import styled from 'styled-components';

import { IcFilter } from '@/components/icons/ic-filter';
import { IcSearch } from '@/components/icons/ic-search';
import { serviceContext } from '@/contexts/ServiceContext';
import type { SearchFilter } from '@/entities/search';
import type { FullTimetable } from '@/entities/timetable';
import { useCourseBooks } from '@/hooks/useCourseBooks';
import { useGuardContext } from '@/hooks/useGuardContext';
import { useYearSemester } from '@/hooks/useYearSemester';
import type { ArrayElement } from '@/utils/array-element';

import { MainSearchbarFilterDialog } from './main-searchbar-filter-dialog';
import { MainSearchbarYearSemesterSelect } from './main-searchbar-year-semester-select';

type Props = {
  onSearch: (filter: Partial<SearchFilter>) => void;
  currentFullTimetable?: FullTimetable;
  resetSearchResult: () => void;
};

export type SearchForm = {
  title: SearchFilter['title'];
  academicYear: SearchFilter['academic_year'];
  category: SearchFilter['category'];
  credit: SearchFilter['credit'];
  etc: SearchFilter['etc'];
  classification: SearchFilter['classification'];
  department: SearchFilter['department'];
  manualBitmask: number[];
  timeType: 'auto' | 'manual' | null;
};

const initialForm = {
  academicYear: [],
  credit: [],
  etc: [],
  category: [],
  classification: [],
  department: [],
  timeType: null,
  title: '',
  manualBitmask: [],
};

const isInitialForm = (form: SearchForm) => JSON.stringify(initialForm) === JSON.stringify(form);

export const MainSearchbar = ({ onSearch, currentFullTimetable, resetSearchResult }: Props) => {
  const [open, setOpen] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchForm>(initialForm);
  const { year, semester } = useYearSemester();
  const { data: courseBooks } = useCourseBooks();
  const { timeMaskService } = useGuardContext(serviceContext);
  const currentCourseBook = courseBooks?.find((c) => c.year === year && c.semester === semester);
  const currentCourseBookUpdatedAt = currentCourseBook
    ? dayjs(currentCourseBook.updated_at).format('YYYY. MM. DD')
    : '';

  const onSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!year || !semester) return;

    const undefinedIfEmpty = <T,>(e: T[]) => (e.length === 0 ? undefined : e);

    onSearch({
      academic_year: undefinedIfEmpty(searchForm.academicYear),
      category: undefinedIfEmpty(searchForm.category),
      classification: undefinedIfEmpty(searchForm.classification),
      credit: undefinedIfEmpty(searchForm.credit),
      department: undefinedIfEmpty(searchForm.department),
      etc: undefinedIfEmpty(searchForm.etc),
      year,
      semester,
      title: searchForm.title,
      time_mask:
        searchForm.timeType === 'manual'
          ? searchForm.manualBitmask
          : searchForm.timeType === 'auto'
            ? timeMaskService.getTimetableEmptyTimeBitMask(currentFullTimetable)
            : undefined,
      limit: 200,
    });
  };

  const onChangeBitMask = (manualBitmask: number[]) => setSearchForm((sf) => ({ ...sf, manualBitmask }));

  const onChangeCheckbox = <F extends 'academicYear' | 'category' | 'classification' | 'credit' | 'department' | 'etc'>(
    field: F,
    e: ArrayElement<SearchForm[F]>,
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
      <MainSearchbarYearSemesterSelect resetSearchResult={resetSearchResult} />
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
          onChangeBitMask={onChangeBitMask}
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
