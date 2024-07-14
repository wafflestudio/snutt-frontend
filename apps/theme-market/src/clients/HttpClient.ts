type HttpClient = {
  get: <T = unknown>(url: string) => Promise<T>;
  post: <T = unknown, B = unknown>(url: string, body?: B) => Promise<T>;
};

// TODO env 따라감
const baseUrl = "https://snutt-api-dev.wafflestudio.coom";

export const httpClient: HttpClient = {
  get: async (url) => {
    const response = await fetch(baseUrl + url);
    const data = await response.json().catch(() => null);

    if (response.ok) return data;
    else throw data;
  },
  post: async (url, body) => {
    const response = await fetch(baseUrl + url, {
      method: "POST",
      body: JSON.stringify(body),
      // headers,
    });
    const data = await response.json().catch(() => null);

    if (response.ok) return data;
    else throw data;
  },
};
