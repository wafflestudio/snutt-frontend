import { createContext } from 'react';

export type EnvContext = {
  API_BASE_URL: string;
  API_KEY: string;
  NODE_ENV: 'production' | 'development';
  APP_ENV: 'prod' | 'dev' | 'test';
  TRUFFLE_API_KEY: string;
  FACEBOOK_APP_ID: string;
};

export const envContext = createContext<EnvContext | null>(null);
envContext.displayName = 'EnvContext';
