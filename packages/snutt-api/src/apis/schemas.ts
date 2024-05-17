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
