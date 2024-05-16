import { createContext, useContext } from 'react';

export type TokenContext = {
  saveToken: (token: string, permanent: boolean) => void;
  clearToken: () => void;
};

export const tokenContext = createContext<TokenContext | null>(null);

export const useTokenContext = () => {
  const value = useContext(tokenContext);
  if (value === null) throw new Error('TokenContextProvider not provided');
  return value;
};
