import { type DefaultBodyType, HttpResponse, type PathParams, type ResponseResolver } from 'msw';
import { type HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';

import { type CoreServerError } from '@/entities/error';

import { mockUsers } from '../fixtures/user';

type Options = { token: boolean };

export const withValidateAccess = <
  Param extends PathParams<keyof Param>,
  ReqBody extends DefaultBodyType,
  ResBody extends DefaultBodyType,
>(
  callback: (args: { params: Param; body: ReqBody; token: string | null; cookies: Record<string, string> }) =>
    | {
        body: Exclude<ResBody, CoreServerError>;
        type: 'success';
      }
    | { body: CoreServerError; type: 'error'; status?: 400 | 401 | 403 | 404 | 409 },
  options: Partial<Options> = { token: true },
): ResponseResolver<HttpRequestResolverExtras<Param>, ReqBody, ResBody | CoreServerError> => {
  const isValidateToken = options.token;

  return async (args) => {
    const xApiKey = args.request.headers.get('x-access-apikey');
    const xToken = args.request.headers.get('x-access-token');

    if (xApiKey !== 'test')
      return HttpResponse.json({ ext: {}, message: 'invalid api key', errcode: 8192 }, { status: 403 });

    if (isValidateToken && mockUsers.every((u) => u.auth.token !== xToken))
      return HttpResponse.json({ ext: {}, message: 'Failed to authenticate token', errcode: 8194 }, { status: 403 });

    const body = await (async () => {
      try {
        return await args.request.json();
      } catch (e) {
        return {} as ReqBody;
      }
    })();

    const response = callback({
      params: args.params,
      body,
      token: xToken,
      cookies: args.cookies,
    });

    return HttpResponse.json(response.body, { status: 'status' in response ? response.status : 200 });
  };
};
