import { ErrorResponse } from '../response';
import { getSnuttApis } from './snutt';
import { getSnuttTimetableApis } from './snutt-timetable';

export type Api = (_: {
  body: never;
  token: string;
  params: never;
  query: never;
}) => Promise<{ status: number; data: unknown }>;

type InternalClient = {
  call: <R extends { status: number; data: unknown }>(_: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    token?: string;
  }) => Promise<R>;
};

export type GetApiSpecsParameter = {
  callWithToken: <R extends { status: number; data: unknown }>(
    p: Parameters<InternalClient['call']>[0] & { token: string },
  ) => Promise<R | ErrorResponse<403, 8194>>;
  callWithoutToken: <R extends { status: number; data: unknown }>(
    p: Omit<Parameters<InternalClient['call']>[0], 'token'> & { token?: never },
  ) => Promise<R>;
};

export const apis = (client: InternalClient) => {
  const callWithToken = <R extends { status: number; data: unknown }>(
    p: Parameters<InternalClient['call']>[0] & { token: string },
  ) => client.call<R | ErrorResponse<403, 8194>>(p);

  const callWithoutToken = <R extends { status: number; data: unknown }>(
    p: Omit<Parameters<InternalClient['call']>[0], 'token'> & { token?: never },
  ) => client.call<R>(p);

  const params = { callWithToken, callWithoutToken };

  return { ...getSnuttApis(params), ...getSnuttTimetableApis(params) } satisfies Record<string, Api>;
};
