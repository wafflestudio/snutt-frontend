import { TimetableRepository } from '../repositories/timetableRepository';
import { TimetableService } from '../usecases/timetableService';

export const createTimetableService = ({
  repositories: [timetableRepository],
}: {
  repositories: [TimetableRepository];
}): TimetableService => {
  return { listTimetables: () => timetableRepository.listTimetables() };
};
