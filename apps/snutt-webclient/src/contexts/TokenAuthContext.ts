import { createContext } from 'react';

type TokenAuthContext = { token: string };

export const TokenAuthContext = createContext<TokenAuthContext | null>(null);
