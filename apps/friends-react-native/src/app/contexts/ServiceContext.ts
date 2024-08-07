import { createContext, useContext } from 'react';

import { AssetService } from '../../usecases/assetService';
import { ColorService } from '../../usecases/colorService';
import { CourseBookService } from '../../usecases/courseBookService';
import { FriendService } from '../../usecases/friendService';
import { TimetableViewService } from '../../usecases/timetableViewService';
import { NativeEventService } from '../../usecases/nativeEventService';

type ServiceContext = {
  timetableViewService: TimetableViewService;
  colorService: ColorService;
  friendService: FriendService;
  courseBookService: CourseBookService;
  assetService: AssetService;
  nativeEventService: NativeEventService;
};

export const serviceContext = createContext<ServiceContext | null>(null);
export const useServiceContext = () => {
  const context = useContext(serviceContext);
  if (!context) throw new Error('context not provided');
  return context;
};
