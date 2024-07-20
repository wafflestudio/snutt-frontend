import { createContext } from 'react';

export type EnvContext = {
  API_BASE_URL: string;
  API_KEY: string;
  NODE_ENV: 'production' | 'development';
  APP_ENV: 'prod' | 'dev' | 'mock';
  TRUFFLE_API_KEY: string;
  FACEBOOK_APP_ID: string;
  GOOGLE_APP_ID: string;
  KAKAO_APP_ID: string;
};

export const EnvContext = createContext<EnvContext | null>(null);
