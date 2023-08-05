import { createContext, useContext, useMemo } from 'react';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { Text, View } from 'react-native';
import { createFetchClient } from './infrastructures/createFetchClient';
import { createTimetableRepository } from './infrastructures/createTimetableRepository';
import { createTimetableService } from './infrastructures/createTimetableService';
import { TimetableService } from './usecases/timetableService';
import { App } from './app/App';
import { TimetableViewService } from './usecases/timetableViewService';
import { createTimetableViewService } from './infrastructures/createTimetableViewService';
import { ColorService } from './usecases/colorService';
import { createColorService } from './infrastructures/createColorService';
import { createColorRepository } from './infrastructures/createColorRepository';
import { FriendService } from './usecases/friendService';
import { createFriendRepository } from './infrastructures/createFriendRepository';
import { createFriendService } from './infrastructures/createFriendService';

type ExternalProps = {
  'x-access-token': string;
  'x-build-number': string;
  'x-os-version': string;
  'x-device-model': string;
  'x-os-type': 'android' | 'ios';
  'x-access-apikey': string;
  'x-device-id': string;
  'x-app-type': string;
  'x-app-version': string;
};
type ServiceContext = {
  timetableService: TimetableService;
  timetableViewService: TimetableViewService;
  colorService: ColorService;
  friendService: FriendService;
};
const serviceContext = createContext<ServiceContext | null>(null);
export const useServiceContext = () => {
  const context = useContext(serviceContext);
  if (!context) throw new Error('context not provided');
  return context;
};

export const Main = ({ 'x-access-token': xAccessToken, 'x-access-apikey': xAccessApikey }: ExternalProps) => {
  const fetchClient = createFetchClient(baseUrl, xAccessToken, xAccessApikey);
  const friendRepository = createFriendRepository(fetchClient);
  const timetableRepository = createTimetableRepository(fetchClient);
  const timetableService = createTimetableService({
    repositories: [timetableRepository],
  });
  const timetableViewService = createTimetableViewService();
  const colorService = createColorService({ repositories: [createColorRepository({ clients: [fetchClient] })] });
  const friendService = createFriendService({ repositories: [friendRepository] });

  const contextValue = useMemo(
    () => ({ timetableService, timetableViewService, colorService, friendService }),
    [timetableService, timetableViewService, colorService, friendService],
  );

  return (
    <ErrorBoundary
      fallback={
        <View>
          <Text>오류가 발생했습니다.</Text>
        </View>
      }
    >
      <serviceContext.Provider value={contextValue}>
        <App />
      </serviceContext.Provider>
    </ErrorBoundary>
  );
};

const baseUrl = 'https://snutt-api-dev.wafflestudio.com';
