/* VITE 환경변수에 직접 접근하는 external 파일이므로, import.meta.env 에 직접 접근할 수 있어야 한다. */
/* eslint-disable no-restricted-syntax */

// 환경변수를 직접 받아와서 export하는 파일

export interface EnvironmentVariables {
  APP_ENV?: string;
  GIT_SHA?: string;
  GIT_TAG?: string;
  API_BASE_URL?: string;
  API_KEY?: string;
  FACEBOOK_APP_ID?: string;
  TRUFFLE_API_KEY?: string;
  NODE_ENV?: string;
}

export const viteEnvironmentVariables: EnvironmentVariables = {
  APP_ENV: import.meta.env.VITE_APP_ENV,
  GIT_SHA: import.meta.env.VITE_GIT_SHA,
  GIT_TAG: import.meta.env.VITE_GIT_TAG,
  API_BASE_URL: import.meta.env.VITE_BASE_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
  FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID,
  TRUFFLE_API_KEY: import.meta.env.VITE_TRUFFLE_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
};
