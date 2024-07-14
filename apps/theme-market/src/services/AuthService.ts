import { authRepositry } from "@/repositories/AuthRepository";

// 예시용
type AuthService = {
  me: () => Promise<void>;
};

export const authService: AuthService = {
  me: async () => {
    return await authRepositry.me();
  },
};
