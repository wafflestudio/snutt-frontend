import type { Timetable } from '@/entities/timetable';

export interface GroupedTimetables {
  year: number;
  semester: 1 | 2 | 3 | 4;
  timetables: Timetable[];
}

export const groupTimetablesBySemester = (timetables: Timetable[]): GroupedTimetables[] => {
  const grouped = new Map<string, GroupedTimetables>();

  timetables.forEach((timetable) => {
    const key = `${timetable.year}-${timetable.semester}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        year: timetable.year,
        semester: timetable.semester,
        timetables: [],
      });
    }
    grouped.get(key)!.timetables.push(timetable);
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const sortKeyA = a.year * 10 + a.semester;
    const sortKeyB = b.year * 10 + b.semester;
    return sortKeyB - sortKeyA;
  });
};
