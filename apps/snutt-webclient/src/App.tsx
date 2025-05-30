import { GoogleOAuthProvider } from '@react-oauth/google';
import { implSnuttApi } from '@sf/snutt-api';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getTruffleClient } from '@wafflestudio/truffle-browser';
import { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { EnvContext } from '@/contexts/EnvContext';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { TokenManageContext } from '@/contexts/TokenManageContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import { useGuardContext } from '@/hooks/useGuardContext';
import { implAuthSnuttApiRepository } from '@/infrastructures/implAuthSnuttApiRepository';
import { implBookmarkSnuttApiRepository } from '@/infrastructures/implBookmarkSnuttApiRepository';
import {
  implTimetableLocalStorageRepository,
  implTokenLocalStorageRepository,
  implTokenSessionStorageRepository,
} from '@/infrastructures/implBrowserStorageRepository';
import { implFeedbackSnuttApiRepository } from '@/infrastructures/implFeedbackSnuttApiRepository';
import { getNotificationRepository } from '@/infrastructures/implNotificationSnuttApiRepository';
import { implSearchSnuttApiRepository } from '@/infrastructures/implSearchSnuttApiRepository';
import { implSemesterSnuttApiRepository } from '@/infrastructures/implSemesterSnuttApiRepository';
import { implTimetableSnuttApiRepository } from '@/infrastructures/implTimetableSnuttApiRepository';
import { implUserSnuttApiRepository } from '@/infrastructures/implUserSnuttApiRepository';
import { LoadingPage } from '@/pages/loading';
import { Main } from '@/pages/main';
import { MyPage } from '@/pages/mypage';
import { getAuthService } from '@/usecases/authService';
import { getBookmarkService } from '@/usecases/bookmarkService';
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

import { Landing } from './pages/landing';
import { NotFoundPage } from './pages/not-found';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });

export const App = () => {
  const [isWrongTokenDialogOpen, setWrongTokenDialogOpen] = useState(false);
  const ENV = useGuardContext(EnvContext);

  const services = useMemo(() => {
    const snuttApi = implSnuttApi({
      httpClient: {
        call: async (_: {
          method: string;
          path: string;
          body?: Record<string, unknown>;
          headers?: Record<string, string>;
        }) => {
          const response = await fetch(`${ENV.NODE_ENV === 'production' ? ENV.API_BASE_URL : '/api'}${_.path}`, {
            method: _.method,
            headers: _.headers,
            ...(!!_.body ? { body: JSON.stringify(_.body) } : {}),
          });

          const responseBody = (await response.json().catch(() => null)) as unknown;

          if (!response.ok) {
            if (
              responseBody !== null &&
              typeof responseBody === 'object' &&
              'errcode' in responseBody &&
              responseBody.errcode === 8194
            )
              setWrongTokenDialogOpen(true);
            else if (response.status >= 500) {
              services.errorService.captureError(new Error(JSON.stringify(responseBody)));
            }
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

    const feedbackService = getFeedbackService({ feedbackRepository });
    const userService = getUserService({ userRepository });
    const colorService = getColorService();
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
        enabled: ENV.NODE_ENV === 'production' && ENV.APP_ENV !== 'mock',
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
      bookmarkService: getBookmarkService({ bookmarkRepository: implBookmarkSnuttApiRepository({ snuttApi }) }),
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

  return (
    <QueryClientProvider key={token} client={queryClient}>
      <ServiceContext.Provider value={services}>
        <GlobalStyles />
        <TokenManageContext.Provider value={tokenContextValue}>
          <GoogleOAuthProvider clientId={ENV.GOOGLE_APP_ID}>
            {token ? (
              <BrowserRouter>
                <AuthorizedApp
                  token={token}
                  isLogoutDialogOpen={isWrongTokenDialogOpen}
                  closeLogoutDialog={() => setWrongTokenDialogOpen(false)}
                />
              </BrowserRouter>
            ) : (
              <Landing />
            )}
          </GoogleOAuthProvider>
        </TokenManageContext.Provider>
        <ReactQueryDevtools />
      </ServiceContext.Provider>
    </QueryClientProvider>
  );
};

const AuthorizedApp = ({
  token,
  isLogoutDialogOpen,
  closeLogoutDialog,
}: {
  token: string;
  isLogoutDialogOpen: boolean;
  closeLogoutDialog: () => void;
}) => {
  const { clearToken } = useGuardContext(TokenManageContext);
  const [searchParams] = useSearchParams();

  const onClickLogout = () => {
    clearToken();
    closeLogoutDialog();
  };

  const { semesterService } = useGuardContext(ServiceContext);

  const { data: courseBooks } = useQuery({
    queryKey: ['SemesterService', 'getCourseBooks', { token }] as const,
    queryFn: ({ queryKey }) => semesterService.getCourseBooks(queryKey[2]),
    staleTime: Infinity,
  });

  const year = getIfNumber(searchParams.get('year'));
  const semester = getIfNumber(searchParams.get('semester'));

  const currentCourseBook = courseBooks?.find((cb) => cb.year === year && cb.semester === semester) ?? courseBooks?.[0];

  if (!currentCourseBook || !courseBooks)
    return (
      <TokenAuthContext.Provider value={{ token }}>
        <LoadingPage />
      </TokenAuthContext.Provider>
    );

  return (
    <TokenAuthContext.Provider value={{ token }}>
      <YearSemesterContext.Provider value={{ year: currentCourseBook.year, semester: currentCourseBook.semester }}>
        <Routes>
          <Route path="/" element={<Main courseBooks={courseBooks} />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Dialog open={isLogoutDialogOpen}>
          <Dialog.Title>인증정보가 올바르지 않아요</Dialog.Title>
          <Dialog.Content>다시 로그인해 주세요</Dialog.Content>
          <Dialog.Actions>
            <Button data-testid="wrong-token-dialog-logout" onClick={onClickLogout}>
              로그아웃하기
            </Button>
          </Dialog.Actions>
        </Dialog>
      </YearSemesterContext.Provider>
    </TokenAuthContext.Provider>
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

const getIfNumber = (value: string | null): number | null => {
  if (!value) return null;

  const number = Number(value);
  return isNaN(number) ? null : number;
};
