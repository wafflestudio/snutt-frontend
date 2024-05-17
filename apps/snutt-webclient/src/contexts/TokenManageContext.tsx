import { createContext, useContext } from 'react';

export type TokenManageContext = {
  saveToken: (token: string, permanent: boolean) => void;
  clearToken: () => void;
};

export const TokenManageContext = createContext<TokenManageContext | null>(null);

export const useTokenManageContext = () => {
  const value = useContext(TokenManageContext);
  if (value === null) throw new Error('TokenManageContext not provided');
  return value;
};
