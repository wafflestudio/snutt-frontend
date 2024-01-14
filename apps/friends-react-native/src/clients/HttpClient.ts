export type HttpClient = {
  get: (url: string) => Promise<unknown>;
  post: <B extends Record<string, unknown>>(url: string, body?: B) => Promise<unknown>;
  delete: (url: string) => Promise<unknown>;
  patch: <B extends Record<string, unknown>>(url: string, body?: B) => Promise<unknown>;
};
