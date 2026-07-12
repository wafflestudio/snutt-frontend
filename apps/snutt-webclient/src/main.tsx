import { getTruffleClient } from '@wafflestudio/truffle-browser';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { ErrorBoundary } from '@/components/error-boundary';
import { EnvContext } from '@/contexts/EnvContext';
import { ErrorPage } from '@/pages/error';
import { getErrorService } from '@/usecases/errorService';

import { App } from './App';

async function startApp() {
  const ENV = {
    APP_ENV: import.meta.env.MODE as 'prod' | 'dev' | 'mock',
    GIT_SHA: import.meta.env.VITE_GIT_SHA,
    GIT_TAG: import.meta.env.VITE_GIT_TAG,
    API_BASE_URL: import.meta.env.VITE_BASE_URL,
    API_KEY: import.meta.env.VITE_API_KEY,
    FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID,
    TRUFFLE_API_KEY: import.meta.env.VITE_TRUFFLE_API_KEY,
    GOOGLE_APP_ID: import.meta.env.VITE_GOOGLE_APP_ID,
    KAKAO_APP_ID: import.meta.env.VITE_KAKAO_APP_ID,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
  };

  if (ENV.APP_ENV === 'mock') {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  window.git = { sha: ENV.GIT_SHA, tag: ENV.GIT_TAG };

  const errorService = getErrorService({
    errorCaptureClient: getTruffleClient({
      enabled: ENV.NODE_ENV === 'production' && ENV.APP_ENV !== 'mock',
      app: { name: 'snutt-webclient-v2', phase: ENV.APP_ENV },
      apiKey: ENV.TRUFFLE_API_KEY,
    }),
  });

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <EnvContext.Provider value={ENV}>
        <ErrorBoundary fallback={<ErrorPage />} onError={(error) => errorService.captureError(error)}>
          <App />
        </ErrorBoundary>
      </EnvContext.Provider>
    </StrictMode>,
  );
}

startApp();
