export type FullTimetable = {
  id: string;
  lectures: ({
    id: string;
    courseTitle: string;
    classPlaceAndTimes: {
      day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      place: string;
      startMinute: number;
      endMinute: number;
    }[];
  } & (
    | { color: Record<'bg' | 'fg', never>; colorIndex: 0 }
    | { color: Record<'bg' | 'fg', string>; colorIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  ))[];
};
