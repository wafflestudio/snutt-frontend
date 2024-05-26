import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { ServiceContext } from '@/contexts/ServiceContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import { type CourseBook } from '@/entities/semester';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = { resetSearchResult: () => void; courseBooks: CourseBook[] };

export const MainSearchbarYearSemesterSelect = ({ resetSearchResult, courseBooks }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { semesterService } = useGuardContext(ServiceContext);
  const { year, semester } = useGuardContext(YearSemesterContext);

  const value = semesterService.courseBookToValue({ year, semester });

  const onChangeBook = ({ year, semester }: { year: number; semester: number }) => {
    resetSearchResult();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('year', `${year}`);
    newParams.set('semester', `${semester}`);
    setSearchParams(newParams);
  };

  return (
    <Select
      data-testid="course-book-select"
      value={value}
      onChange={(e) => onChangeBook(semesterService.valueToCourseBook(e.target.value as `${number}-${1 | 2 | 3 | 4}`))}
    >
      {courseBooks?.map((cb, i) => (
        <option key={i} value={semesterService.courseBookToValue(cb)}>
          {semesterService.courseBookToLabel(cb)}
        </option>
      ))}
    </Select>
  );
};

const Select = styled.select`
  width: 120px;
  height: 30px;
  cursor: pointer;
  border: none;

  opacity: 0.8;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
  }
`;
