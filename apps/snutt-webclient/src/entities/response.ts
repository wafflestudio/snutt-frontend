export type RepositoryResponse<T> = Promise<
  (T extends void ? { type: 'success' } : { type: 'success'; data: T }) | { type: 'error'; errcode: number }
>;

export type UsecaseResponse<T> = Promise<
  (T extends void ? { type: 'success' } : { type: 'success'; data: T }) | { type: 'error'; message: string }
>;
