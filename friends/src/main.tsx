import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { App } from './app/App';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { serviceContext } from './app/contexts/ServiceContext';
import { themeContext } from './app/contexts/ThemeContext';
import { getThemeValues } from './app/styles/theme';
import { createColorRepository } from './infrastructures/createColorRepository';
import { createColorService } from './infrastructures/createColorService';
import { createCourseBookService } from './infrastructures/createCourseBookService';
import { createFetchClient } from './infrastructures/createFetchClient';
import { createFriendRepository } from './infrastructures/createFriendRepository';
import { createFriendService } from './infrastructures/createFriendService';
import { createTimetableViewService } from './infrastructures/createTimetableViewService';

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
  theme: 'light' | 'dark';
};

export const Main = ({ 'x-access-token': xAccessToken, 'x-access-apikey': xAccessApikey, theme }: ExternalProps) => {
  const fetchClient = createFetchClient(baseUrl, xAccessToken, xAccessApikey);
  const friendRepository = createFriendRepository(fetchClient);
  const timetableViewService = createTimetableViewService();
  const colorService = createColorService({ repositories: [createColorRepository({ clients: [fetchClient] })] });
  const friendService = createFriendService({ repositories: [friendRepository] });
  const courseBookService = createCourseBookService();

  const serviceValue = useMemo(
    () => ({ timetableViewService, colorService, friendService, courseBookService }),
    [timetableViewService, colorService, friendService, courseBookService],
  );

  const themeValue = useMemo(() => getThemeValues(theme), [theme]);

  return (
    <ErrorBoundary
      fallback={
        <View>
          <Text>오류가 발생했습니다.</Text>
        </View>
      }
    >
      <serviceContext.Provider value={serviceValue}>
        <themeContext.Provider value={themeValue}>
          <App />
        </themeContext.Provider>
      </serviceContext.Provider>
    </ErrorBoundary>
  );
};

const baseUrl = 'https://snutt-api-dev.wafflestudio.com';
