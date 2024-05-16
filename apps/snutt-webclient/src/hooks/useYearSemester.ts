import { useSearchParams } from 'react-router-dom';

import { useCourseBooks } from './useCourseBooks';

export const useYearSemester = (): { year?: number; semester?: 1 | 2 | 3 | 4 } => {
  const { data } = useCourseBooks();
  const [searchParams] = useSearchParams();

  const year = searchParams.get('year');
  const semester = searchParams.get('semester');

  if (year && semester) return { year: Number(year), semester: Number(semester) as 1 | 2 | 3 | 4 };

  return data?.[0] ?? {};
};
