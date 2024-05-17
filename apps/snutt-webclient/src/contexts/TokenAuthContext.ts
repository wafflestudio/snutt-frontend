import { createContext, useContext } from 'react';

type TokenAuthContext = { token: string };

export const TokenAuthContext = createContext<TokenAuthContext | null>(null);

export const useTokenAuthContext = () => {
  const value = useContext(TokenAuthContext);
  if (value === null) throw new Error('TokenAuthContext not provided');
  return value;
};
