import { InternalClient } from '../httpClient';

type Request = {
  id: string;
  password: string;
};

type Response = {
  user_id: string;
  token: string;
  message: string;
};

export const postV1AuthLoginLocal = (httpClient: InternalClient) => (req: Request) =>
  httpClient.call<Response>({
    method: 'post',
    path: '/v1/auth/login_local',
    body: { id: req.id, password: req.password },
  });
