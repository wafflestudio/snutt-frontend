import { httpClient } from "@/clients/HttpClient";
import { User } from "@/entities/User";

type AuthRepository = {
  me: (accessToken?: string) => Promise<User>;
};

export const authRepositry: AuthRepository = {
  me: async (accessToken?: string) => {
    const res = await httpClient.get<User>("/v1/users/me", accessToken);

    return res;
  },
};
