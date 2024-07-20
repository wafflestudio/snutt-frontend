import { httpClient } from "@/clients/HttpClient";

// 예시용
type AuthRepository = {
  me: () => Promise<void>;
};

export const authRepositry: AuthRepository = {
  me: async () => {
    const res = await httpClient.get<void>("/v1/users/me");

    return res;
  },
};
