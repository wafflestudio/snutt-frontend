export type SuccessResponse<T> = { status: 200; data: T };

export type ErrorResponse<
  Status extends number,
  Errcode extends number,
  Ext extends Record<string, never> = Record<string, never>,
> = {
  status: Status;
  data: { errcode: Errcode; ext: Ext; message: string };
};
