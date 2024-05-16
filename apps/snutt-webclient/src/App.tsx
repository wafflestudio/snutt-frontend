import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getTruffleClient } from '@wafflestudio/truffle-browser';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { envContext } from '@/contexts/EnvContext';
import { serviceContext } from '@/contexts/ServiceContext';
import { tokenContext } from '@/contexts/tokenContext';
import { useGuardContext } from '@/hooks/useGuardContext';
import { createFetchClient } from '@/infrastructures/createFetchClient';
import { createLocalStorageClient } from '@/infrastructures/createLocalStorageClient';
import { createSessionStorageClient } from '@/infrastructures/createSessionStorageClient';
import { ErrorPage } from '@/pages/error';
import { Main } from '@/pages/main';
import { MyPage } from '@/pages/mypage';
import { getAuthRepository } from '@/repositories/authRepository';
import { getColorRepository } from '@/repositories/colorRepository';
import { getErrorRepository } from '@/repositories/errorRepository';
import { getFeedbackRepository } from '@/repositories/feedbackRepository';
import { getNotificationRepository } from '@/repositories/notificationRepository';
import { getSearchRepository } from '@/repositories/searchRepository';
import { getSemesterRepository } from '@/repositories/semesterRepository';
import { getStorageRepository } from '@/repositories/storageRepository';
import { getTimetableRepository } from '@/repositories/timetableRepository';
import { getUserRepository } from '@/repositories/userRepository';
import { getAuthService } from '@/usecases/authService';
import { getColorService } from '@/usecases/colorService';
import { getErrorService } from '@/usecases/errorService';
import { getFeedbackService } from '@/usecases/feedbackService';
import { getHourMinutePickerService } from '@/usecases/hourMinutePickerService';
import { getHourMinuteService } from '@/usecases/hourMinuteService';
import { getLectureService } from '@/usecases/lectureService';
import { getNotificationService } from '@/usecases/notificationService';
import { getSearchService } from '@/usecases/searchService';
import { getSemesterService } from '@/usecases/semesterService';
import { getTimeMaskService } from '@/usecases/timeMaskService';
import { getTimetableService } from '@/usecases/timetableService';
import { getTimetableViewService } from '@/usecases/timetableViewService';
import { getTokenService } from '@/usecases/tokenService';
import { getUserService } from '@/usecases/userService';
import { get } from '@/utils/object/get';

import { Landing } from './pages/landing';
import { NotFoundPage } from './pages/not-found';

export const App = () => {
  const [isWrongTokenDialogOpen, setWrongTokenDialogOpen] = useState(false);
  const ENV = useGuardContext(envContext);

  const errorService = getErrorService({
    repositories: [getErrorRepository()],
    errorCaptureClient: getTruffleClient({
      enabled: ENV.NODE_ENV === 'production' && ENV.APP_ENV !== 'test',
      app: { name: 'snutt-webclient-v2', phase: ENV.APP_ENV },
      apiKey: ENV.TRUFFLE_API_KEY,
    }),
  });

  const persistStorage = createLocalStorageClient();
  const temporaryStorage = createSessionStorageClient();
  const storageRepository = getStorageRepository({ clients: [persistStorage, temporaryStorage] });
  const tokenService = getTokenService({ storageRepository });
  const timetableViewService = getTimetableViewService({ repositories: [storageRepository] });

  const [token, setToken] = useState(tokenService.getToken());

  const tokenContextValue = {
    saveToken: (newToken: string, permanent: boolean) => {
      setToken(newToken);
      tokenService.saveToken(newToken, permanent);
    },
    clearToken: () => {
      setToken(null);
      tokenService.clearToken();
      queryClient.resetQueries();
    },
  };

  const onClickLogout = () => {
    tokenContextValue.clearToken();
    setWrongTokenDialogOpen(false);
  };

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (get(error, ['errcode']) === 8194) setWrongTokenDialogOpen(true);
            else errorService.captureError(new Error(JSON.stringify(error)));
          },
        }),
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
      }),
  );

  const unauthorizedServices = getUnauthorizedServices(ENV);

  return (
    <QueryClientProvider key={token} client={queryClient}>
      <GlobalStyles />
      <tokenContext.Provider value={tokenContextValue}>
        {token ? (
          <serviceContext.Provider
            value={{
              ...getAuthorizedServices(token, ENV),
              errorService,
              timetableViewService,
              feedbackService: unauthorizedServices.feedbackService,
            }}
          >
            <RouterProvider
              router={createBrowserRouter([
                {
                  children: [
                    { path: '/', element: <Main /> },
                    { path: '/mypage', element: <MyPage /> },
                    { path: '/*', element: <NotFoundPage /> },
                  ],
                  errorElement: <ErrorPage errorService={errorService} />,
                },
              ])}
            />
            <Dialog open={isWrongTokenDialogOpen}>
              <Dialog.Title>인증정보가 올바르지 않아요</Dialog.Title>
              <Dialog.Content>다시 로그인해 주세요</Dialog.Content>
              <Dialog.Actions>
                <Button data-testid="wrong-token-dialog-logout" onClick={onClickLogout}>
                  로그아웃하기
                </Button>
              </Dialog.Actions>
            </Dialog>
          </serviceContext.Provider>
        ) : (
          <Landing
            feedbackService={unauthorizedServices.feedbackService}
            authService={unauthorizedServices.authService}
            errorService={errorService}
          />
        )}
      </tokenContext.Provider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: 'Noto Sans KR', sans-serif;
  }

  body {
    background: rgb(247, 248, 249);
    margin: 0;
  }
`;

const getUnauthorizedServices = (ENV: { API_BASE_URL: string; API_KEY: string }) => {
  const httpClient = createFetchClient({
    baseURL: ENV.API_BASE_URL,
    headers: { 'x-access-apikey': ENV.API_KEY },
  });
  const authRepository = getAuthRepository({ httpClient });
  const feedbackRepository = getFeedbackRepository({ httpClient });
  const userRepository = getUserRepository({ httpClient });
  const authService = getAuthService({ repositories: [authRepository, userRepository] });
  const feedbackService = getFeedbackService({ repositories: [feedbackRepository] });

  return { authService, feedbackService };
};

const getAuthorizedServices = (
  token: string,
  ENV: {
    NODE_ENV: 'production' | 'development';
    APP_ENV: 'prod' | 'dev' | 'test';
    API_BASE_URL: string;
    API_KEY: string;
  },
) => {
  const httpClient = createFetchClient({
    baseURL: ENV.API_BASE_URL,
    headers: { 'x-access-apikey': ENV.API_KEY, 'x-access-token': token },
  });

  const userRepository = getUserRepository({ httpClient });
  const authRepository = getAuthRepository({ httpClient });
  const timetableRepository = getTimetableRepository({ httpClient });
  const semesterRepository = getSemesterRepository({ httpClient });
  const searchRepository = getSearchRepository({ httpClient });
  const notificationRepository = getNotificationRepository({ httpClient });
  const colorRepository = getColorRepository({ httpClient });

  const userService = getUserService({ repositories: [userRepository] });
  const colorService = getColorService({ repositories: [colorRepository] });
  const notificationService = getNotificationService({ repositories: [notificationRepository] });
  const searchService = getSearchService({ repositories: [searchRepository] });
  const timetableService = getTimetableService({ repositories: [timetableRepository] });
  const lectureService = getLectureService();
  const timeMaskService = getTimeMaskService();
  const hourMinuteService = getHourMinuteService();
  const hourMinutePickerService = getHourMinutePickerService({ services: [hourMinuteService] });
  const authService = getAuthService({ repositories: [authRepository, userRepository] });
  const semesterService = getSemesterService({ repositories: [semesterRepository] });

  return {
    lectureService,
    timeMaskService,
    hourMinutePickerService,
    hourMinuteService,
    authService,
    timetableService,
    semesterService,
    searchService,
    notificationService,
    colorService,
    userService,
  };
};
