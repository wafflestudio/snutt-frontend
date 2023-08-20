import { createContext, useContext } from 'react';
import { ColorService } from '../../usecases/colorService';
import { CourseBookService } from '../../usecases/courseBookService';
import { FriendService } from '../../usecases/friendService';
import { TimetableViewService } from '../../usecases/timetableViewService';

type ServiceContext = {
  timetableViewService: TimetableViewService;
  colorService: ColorService;
  friendService: FriendService;
  courseBookService: CourseBookService;
};
export const serviceContext = createContext<ServiceContext | null>(null);
export const useServiceContext = () => {
  const context = useContext(serviceContext);
  if (!context) throw new Error('context not provided');
  return context;
};
