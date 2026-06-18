import { api } from "@/lib/api";
import type { User } from "@/types/user";

export const fetchCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>("/api/user");

    return response.data;
};
