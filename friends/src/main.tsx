import { useMemo } from 'react';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { Text, View } from 'react-native';
import { createFetchClient } from './infrastructures/createFetchClient';
import { App } from './app/App';
import { createTimetableViewService } from './infrastructures/createTimetableViewService';
import { createColorService } from './infrastructures/createColorService';
import { createColorRepository } from './infrastructures/createColorRepository';
import { createFriendRepository } from './infrastructures/createFriendRepository';
import { createFriendService } from './infrastructures/createFriendService';
import { createCourseBookService } from './infrastructures/createCourseBookService';
import { serviceContext } from './app/contexts/ServiceContext';

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

export const Main = ({ 'x-access-token': xAccessToken, 'x-access-apikey': xAccessApikey }: ExternalProps) => {
  const fetchClient = createFetchClient(baseUrl, xAccessToken, xAccessApikey);
  const friendRepository = createFriendRepository(fetchClient);
  const timetableViewService = createTimetableViewService();
  const colorService = createColorService({ repositories: [createColorRepository({ clients: [fetchClient] })] });
  const friendService = createFriendService({ repositories: [friendRepository] });
  const courseBookService = createCourseBookService();

  const contextValue = useMemo(
    () => ({ timetableViewService, colorService, friendService, courseBookService }),
    [timetableViewService, colorService, friendService, courseBookService],
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
