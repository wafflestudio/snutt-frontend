import { createContext, useContext, useMemo } from 'react';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { Text, View } from 'react-native';
import { createFetchClient } from './infrastructures/createFetchClient';
import { createTimetableRepository } from './infrastructures/createTimetableRepository';
import { createTimetableService } from './infrastructures/createTimetableService';
import { TimetableService } from './usecases/timetableService';
import { App } from './app/App';

type ServiceContext = { timetableService: TimetableService };
const serviceContext = createContext<ServiceContext | null>(null);
export const useServiceContext = () => {
  const context = useContext(serviceContext);
  if (!context) throw new Error('context not provided');
  return context;
};

export const Main = ({ token }: { token: string }) => {
  const fetchClient = createFetchClient(baseUrl, token, apiKey);
  const timetableRepository = createTimetableRepository(fetchClient);
  const timetableService = createTimetableService({
    repositories: [timetableRepository],
  });

  const contextValue = useMemo(
    () => ({ timetableService }),
    [timetableService],
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
const apiKey = // TODO: change this from props
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdHJpbmciOiJ0ZXN0Iiwia2V5X3ZlcnNpb24iOiIwIiwiaWF0IjoxNTA3NzIzNzA3fQ.Oux87M0p4FPwVFAM9HmOmmVh-FKyre7DJ0tUZlX5mQg';
