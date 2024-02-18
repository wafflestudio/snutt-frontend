import { Lecture, YearSemesteLectureMap } from '@/entities/Lecture';

export const groupByYearAndSemester = (lectures: Lecture[]): YearSemesteLectureMap[] => {
  const ret = [] as YearSemesteLectureMap[];

  const result = lectures.reduce<YearSemesteLectureMap[]>((agg, lecture) => {
    const { takenYear, takenSemester } = lecture;
    const existYearSemester = ret.find(({ year, semester }) => year === takenYear && semester === takenSemester);

    if (existYearSemester) {
      return [
        ...agg.filter(({ year, semester }) => year !== takenYear || semester !== takenSemester),
        {
          year: takenYear,
          semester: takenSemester,
          lectures: [...existYearSemester.lectures, lecture],
        },
      ];
    } else
      return [
        ...agg,
        {
          year: takenYear,
          semester: takenSemester,
          lectures: [lecture],
        },
      ];
  }, [] as YearSemesteLectureMap[]);
  return result.sort((a, b) => (a.year === b.year ? b.semester - a.semester : b.year - a.year));
};
