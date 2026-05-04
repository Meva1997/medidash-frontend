import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { type User, type Role } from "@/types";

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: Role;
}

export function useRegister() {
  return useMutation<User, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<User>("/auth/register", payload);
      return data;
    },
  });
}
