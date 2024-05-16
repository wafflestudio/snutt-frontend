import { type Context, useContext } from 'react';

export const useGuardContext = <T extends Record<string, unknown>>(context: Context<T | null>): T => {
  const contextValue = useContext(context);
  if (contextValue === null) throw new Error('Context value is null ' + context.displayName);
  return contextValue;
};
