type Url = string;
type Config = { params: URLSearchParams };

export type HttpClient = {
  get<D = unknown>(url: Url, config?: Partial<Config>): Promise<{ data: D }>;
  post<D = unknown, B = unknown>(url: Url, body?: B, config?: Partial<Config>): Promise<{ data: D }>;
  put<D = unknown, B = unknown>(url: Url, body?: B, config?: Partial<Config>): Promise<{ data: D }>;
  delete<D = unknown>(url: Url, config?: Partial<Config>): Promise<{ data: D }>;
};
