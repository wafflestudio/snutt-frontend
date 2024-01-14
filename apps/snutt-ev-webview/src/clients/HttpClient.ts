export type HttpClient = {
  get: <T = unknown>(url: string) => Promise<T>;
  post: <T = unknown, B = unknown>(url: string, body?: B) => Promise<T>;
  delete<T = unknown>(url: string): Promise<T>;
};
