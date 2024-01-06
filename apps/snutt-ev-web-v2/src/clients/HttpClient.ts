export type HttpClient = {
  get: <T>(url: string) => Promise<T>;
};
