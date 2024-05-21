import { IntegerInt64, StringDateTime } from './utils';

export type LocalLoginRequest = {
  id: string;
  password: string;
};

export type LoginResponse = {
  user_id: string;
  token: string;
  message: string;
};

export type OkResponse = {
  message: string;
};

export type NotificationResponse = {
  _id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  deeplink?: string;
  created_at: StringDateTime;
};

export type NotificationCountResponse = {
  count: IntegerInt64;
};
