export type InternalClient = {
  call: <R>(_: { method: string; path: string; body?: Record<string, unknown>; token?: string }) => Promise<R>;
};
