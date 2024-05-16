/* eslint-disable no-restricted-syntax */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { envContext } from '@/contexts/EnvContext';

import { App } from './App';

async function startApp() {
  const ENV = {
    APP_ENV: import.meta.env.VITE_APP_ENV,
    GIT_SHA: import.meta.env.VITE_GIT_SHA,
    GIT_TAG: import.meta.env.VITE_GIT_TAG,
    API_BASE_URL: import.meta.env.VITE_BASE_URL,
    API_KEY: import.meta.env.VITE_API_KEY,
    FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID,
    TRUFFLE_API_KEY: import.meta.env.VITE_TRUFFLE_API_KEY,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
  };

  if (ENV.APP_ENV === 'test') {
    const { worker } = await import('@/mocks/browser');
    worker.start({ onUnhandledRequest: 'bypass' });
  }

  import('@/assets/members').then(({ members }) => {
    console.log(members[Math.floor(Math.random() * members.length)]);
  });

  window.git = { sha: ENV.GIT_SHA, tag: ENV.GIT_TAG };

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <envContext.Provider value={ENV}>
        <App />
      </envContext.Provider>
    </StrictMode>,
  );
}

startApp();
