import { createContext } from 'react';

export type TokenManageContext = {
  saveToken: (token: string, permanent: boolean) => void;
  clearToken: () => void;
};

export const TokenManageContext = createContext<TokenManageContext | null>(null);
