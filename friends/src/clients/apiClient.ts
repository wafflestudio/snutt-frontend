export type ApiClient = {
  get: <T>(url: string) => Promise<T>;
};
