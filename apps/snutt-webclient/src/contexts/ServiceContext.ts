import { createContext } from 'react';

import { type AuthService } from '@/usecases/authService';
import { type BookmarkService } from '@/usecases/bookmarkService';
import { type ColorService } from '@/usecases/colorService';
import { type ErrorService } from '@/usecases/errorService';
import { type FeedbackService } from '@/usecases/feedbackService';
import { type HourMinutePickerService } from '@/usecases/hourMinutePickerService';
import { type HourMinuteService } from '@/usecases/hourMinuteService';
import { type LectureService } from '@/usecases/lectureService';
import { type NotificationService } from '@/usecases/notificationService';
import { type SearchService } from '@/usecases/searchService';
import { type SemesterService } from '@/usecases/semesterService';
import { type TimeMaskService } from '@/usecases/timeMaskService';
import { type TimetableService } from '@/usecases/timetableService';
import { type TimetableViewService } from '@/usecases/timetableViewService';
import { type UserService } from '@/usecases/userService';

export type ServiceContext = {
  authService: AuthService;
  lectureService: LectureService;
  timeMaskService: TimeMaskService;
  hourMinuteService: HourMinuteService;
  hourMinutePickerService: HourMinutePickerService;
  timetableViewService: TimetableViewService;
  timetableService: TimetableService;
  semesterService: SemesterService;
  searchService: SearchService;
  notificationService: NotificationService;
  feedbackService: FeedbackService;
  errorService: ErrorService;
  colorService: ColorService;
  userService: UserService;
  bookmarkService: BookmarkService;
};

export const ServiceContext = createContext<ServiceContext | null>(null);
