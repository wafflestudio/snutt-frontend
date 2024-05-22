import { implSnuttApi } from '@sf/snutt-api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getTruffleClient } from '@wafflestudio/truffle-browser';
import { useMemo, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { envContext } from '@/contexts/EnvContext';
import { serviceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { TokenManageContext } from '@/contexts/TokenManageContext';
import { useGuardContext } from '@/hooks/useGuardContext';
import { implAuthSnuttApiRepository } from '@/infrastructures/implAuthSnuttApiRepository';
import {
  implTimetableLocalStorageRepository,
  implTokenLocalStorageRepository,
  implTokenSessionStorageRepository,
} from '@/infrastructures/implBrowserStorageRepository';
import { implColorSnuttApiRepository } from '@/infrastructures/implColorSnuttApiRepository';
import { implFeedbackSnuttApiRepository } from '@/infrastructures/implFeedbackSnuttApiRepository';
import { getNotificationRepository } from '@/infrastructures/implNotificationSnuttApiRepository';
import { implSearchSnuttApiRepository } from '@/infrastructures/implSearchSnuttApiRepository';
import { implSemesterSnuttApiRepository } from '@/infrastructures/implSemesterSnuttApiRepository';
import { implTimetableSnuttApiRepository } from '@/infrastructures/implTimetableSnuttApiRepository';
import { implUserSnuttApiRepository } from '@/infrastructures/implUserSnuttApiRepository';
import { ErrorPage } from '@/pages/error';
import { Main } from '@/pages/main';
import { MyPage } from '@/pages/mypage';
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

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });

export const App = () => {
  const [isWrongTokenDialogOpen, setWrongTokenDialogOpen] = useState(false);
  const ENV = useGuardContext(envContext);

  const services = useMemo(() => {
    const snuttApi = implSnuttApi({
      httpClient: {
        call: async (_: {
          method: string;
          path: string;
          body?: Record<string, unknown>;
          headers?: Record<string, string>;
        }) => {
          const response = await fetch(`${ENV.API_BASE_URL}${_.path}`, {
            method: _.method,
            headers: _.headers,
            ...(!!_.body ? { body: JSON.stringify(_.body) } : {}),
          });

          const responseBody = (await response.json().catch(() => null)) as unknown;

          if (!response.ok) {
            if (get(responseBody, ['errcode']) === 8194) setWrongTokenDialogOpen(true);
            else services.errorService.captureError(new Error(JSON.stringify(responseBody)));
          }

          return {
            status: response.status,
            data: responseBody,
          };
        },
      },
      apiKey: ENV.API_KEY,
    });

    const feedbackRepository = implFeedbackSnuttApiRepository({ snuttApi });
    const userRepository = implUserSnuttApiRepository({ snuttApi });
    const authRepository = implAuthSnuttApiRepository({ snuttApi });
    const timetableRepository = implTimetableSnuttApiRepository({ snuttApi });
    const semesterRepository = implSemesterSnuttApiRepository({ snuttApi });
    const searchRepository = implSearchSnuttApiRepository({ snuttApi });
    const notificationRepository = getNotificationRepository({ snuttApi });
    const colorRepository = implColorSnuttApiRepository({ snuttApi });

    const feedbackService = getFeedbackService({ feedbackRepository });
    const userService = getUserService({ userRepository });
    const colorService = getColorService({ colorRepository });
    const notificationService = getNotificationService({ notificationRepository });
    const searchService = getSearchService({ searchRepository });
    const timetableService = getTimetableService({ timetableRepository });
    const lectureService = getLectureService();
    const timeMaskService = getTimeMaskService();
    const hourMinuteService = getHourMinuteService();
    const hourMinutePickerService = getHourMinutePickerService({ services: [hourMinuteService] });
    const authService = getAuthService({ authRepository });
    const semesterService = getSemesterService({ semesterRepository });
    const errorService = getErrorService({
      errorCaptureClient: getTruffleClient({
        enabled: ENV.NODE_ENV === 'production' && ENV.APP_ENV !== 'test',
        app: { name: 'snutt-webclient-v2', phase: ENV.APP_ENV },
        apiKey: ENV.TRUFFLE_API_KEY,
      }),
    });
    const tokenService = getTokenService({
      persistStorageRepository: implTokenLocalStorageRepository(),
      temporaryStorageRepository: implTokenSessionStorageRepository(),
    });
    const timetableViewService = getTimetableViewService({
      persistStorageRepository: implTimetableLocalStorageRepository(),
    });

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
      feedbackService,
      errorService,
      tokenService,
      timetableViewService,
    };
  }, [ENV]);

  const [token, setToken] = useState(services.tokenService.getToken());

  const tokenContextValue = {
    saveToken: (newToken: string, permanent: boolean) => {
      setToken(newToken);
      services.tokenService.saveToken(newToken, permanent);
    },
    clearToken: () => {
      setToken(null);
      services.tokenService.clearToken();
      queryClient.resetQueries();
    },
  };

  const onClickLogout = () => {
    tokenContextValue.clearToken();
    setWrongTokenDialogOpen(false);
  };

  return (
    <QueryClientProvider key={token} client={queryClient}>
      <serviceContext.Provider value={services}>
        <GlobalStyles />
        <TokenManageContext.Provider value={tokenContextValue}>
          {token ? (
            <TokenAuthContext.Provider value={{ token }}>
              <RouterProvider
                router={createBrowserRouter([
                  {
                    children: [
                      { path: '/', element: <Main /> },
                      { path: '/mypage', element: <MyPage /> },
                      { path: '/*', element: <NotFoundPage /> },
                    ],
                    errorElement: <ErrorPage />,
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
            </TokenAuthContext.Provider>
          ) : (
            <Landing />
          )}
        </TokenManageContext.Provider>
        <ReactQueryDevtools />
      </serviceContext.Provider>
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
