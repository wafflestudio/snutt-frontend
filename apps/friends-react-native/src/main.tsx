import { API_URL, ASSET_URL } from '@env';
import { useEffect, useMemo, useState } from 'react';
import { NativeEventEmitter, NativeModules, Text, View } from 'react-native';

import { App } from './app/App';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { featureContext } from './app/contexts/FeatureContext';
import { serviceContext } from './app/contexts/ServiceContext';
import { textContext } from './app/contexts/TextContext';
import { themeContext } from './app/contexts/ThemeContext';
import { getThemeValues } from './app/styles/theme';
import { ClientFeature } from './entities/feature';
import { createAssetService } from './infrastructures/createAssetService';
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
  allowFontScaling: boolean;
  feature?: ClientFeature[];
};

const MyEventEmitter = new NativeEventEmitter(NativeModules.RNEventEmitter);

export const Main = ({
  'x-access-token': xAccessToken,
  'x-access-apikey': xAccessApikey,
  theme,
  allowFontScaling = false,
  feature = [],
}: ExternalProps) => {
  const fetchClient = createFetchClient(API_URL, xAccessToken, xAccessApikey);
  const friendRepository = createFriendRepository(fetchClient);
  const assetService = createAssetService({ baseUrl: ASSET_URL });
  const timetableViewService = createTimetableViewService();
  const colorService = createColorService({ repositories: [createColorRepository({ clients: [fetchClient] })] });
  const friendService = createFriendService({ repositories: [friendRepository] });
  const courseBookService = createCourseBookService();

  const [events, setEvents] = useState<string[]>([]);

  const serviceValue = useMemo(
    () => ({ timetableViewService, colorService, friendService, courseBookService, assetService }),
    [timetableViewService, colorService, friendService, courseBookService, assetService],
  );

  useEffect(() => {
    // 이벤트 리스너 등록
    const listener = MyEventEmitter.addListener('add-friend-kakao', (event) => {
      setEvents((prev) => [...prev, JSON.stringify(event)]);
    });
    const parameters = { eventType: 'add-friend-kakao' };

    NativeModules.RNEventEmitter.sendEvent('register', parameters);

    return () => {
      listener.remove();
      NativeModules.RNEventEmitter.sendEvent('deregister', parameters);
    };
  }, []);

  const themeValue = useMemo(() => getThemeValues(theme), [theme]);

  const textValue = useMemo(() => ({ allowFontScaling }), [allowFontScaling]);

  return (
    <ErrorBoundary
      fallback={
        <View>
          <Text>오류가 발생했습니다.</Text>
        </View>
      }
    >
      <serviceContext.Provider value={serviceValue}>
        <textContext.Provider value={textValue}>
          <themeContext.Provider value={themeValue}>
            <featureContext.Provider value={{ clientFeatures: feature }}>
              <App eventStr={JSON.stringify(events)} />
            </featureContext.Provider>
          </themeContext.Provider>
        </textContext.Provider>
      </serviceContext.Provider>
    </ErrorBoundary>
  );
};
