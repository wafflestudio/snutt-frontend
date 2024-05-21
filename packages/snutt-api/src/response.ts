export type SuccessResponse<T, Status extends number = 200> = {
  status: Status;
  data: T;
};

export type ErrorResponse<
  Status extends 400 | 401 | 403 | 404,
  Errcode extends number,
  Ext extends Record<string, never> = Record<string, never>,
> = {
  status: Status;
  data: { errcode: Errcode; ext: Ext; message: string };
};
