import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { ErrorBoundary } from '@/components/error-boundary';
import { envContext } from '@/contexts/EnvContext';
import { ErrorPage } from '@/pages/error';

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
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
  };

  if (ENV.APP_ENV === 'mock') {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  window.git = { sha: ENV.GIT_SHA, tag: ENV.GIT_TAG };

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <envContext.Provider value={ENV}>
        <ErrorBoundary fallback={<ErrorPage />}>
          <App />
        </ErrorBoundary>
      </envContext.Provider>
    </StrictMode>,
  );
}

startApp();
