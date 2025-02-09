import { ApiError } from "@/entities/Error";

type HttpClient = {
  get: <T = unknown>(url: string, accessToken?: string) => Promise<T>;
  post: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    accessToken?: string
  ) => Promise<T>;
};

const baseUrl =
  process.env.SERVER_SIDE_API_URL || process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

const BASE_HEADER = {
  "content-type": "application/json;charset=UTF-8",
  "x-access-apikey": apiKey,
};

export const ACCESS_TOKEN_KEY = "x-access-token";

export const httpClient: HttpClient = {
  get: async (url, accessToken) => {
    const headers = {
      ...BASE_HEADER,
      ...(accessToken ? { [ACCESS_TOKEN_KEY]: accessToken } : {}),
    };

    const response = await fetch(baseUrl + url, {
      headers,
    });
    const data = await response.json().catch(() => null);

    if (response.ok) return data;
    else {
      const error = new Error() as ApiError;
      error.name = "API_ERROR";
      error.displayMessage = data.displayMessage;
      error.message = data.message;
      error.errCode = data.errCode;
      throw error;
    }
  },
  post: async (url, body, accessToken) => {
    const headers = {
      ...BASE_HEADER,
      ...(accessToken ? { [ACCESS_TOKEN_KEY]: accessToken } : {}),
    };

    const response = await fetch(baseUrl + url, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
    const data = await response.json().catch(() => null);

    if (response.ok) return data;
    else {
      const error = new Error() as ApiError;
      error.name = "API_ERROR";
      error.displayMessage = data.displayMessage;
      error.message = data.message;
      error.errCode = data.errCode;
      throw error;
    }
  },
};
