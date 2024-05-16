import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { serviceContext } from '@/contexts/ServiceContext';
import { useCourseBooks } from '@/hooks/useCourseBooks';
import { useGuardContext } from '@/hooks/useGuardContext';
import { useYearSemester } from '@/hooks/useYearSemester';

type Props = { resetSearchResult: () => void };

export const MainSearchbarYearSemesterSelect = ({ resetSearchResult }: Props) => {
  const { data: courseBooks } = useCourseBooks();
  const [searchParams, setSearchParams] = useSearchParams();
  const { year, semester } = useYearSemester();
  const { semesterService } = useGuardContext(serviceContext);

  const value = year && semester ? semesterService.courseBookToValue({ year, semester }) : 0;

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
