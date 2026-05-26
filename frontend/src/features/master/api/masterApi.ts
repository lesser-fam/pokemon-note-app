import { api } from "@/lib/api";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";

export const fetchPokemonList = async (): Promise<Pokemon[]> => {
    const response = await api.get<{ data: Pokemon[] }>("/api/pokemon");

    return response.data.data;
};

export const fetchRoleTags = async (): Promise<RoleTag[]> => {
    const response = await api.get<{ data: RoleTag[] }>("/api/role-tags");

    return response.data.data;
};
