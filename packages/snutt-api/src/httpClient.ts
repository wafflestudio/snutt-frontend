export type InternalClient = {
  call: <R extends { status: number; data: unknown }>(_: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    token?: string;
  }) => Promise<R>;
};
