import { api } from "@/lib/api";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import type {
    AbilityMaster,
    ItemMaster,
    MoveMaster,
    NatureMaster,
} from "@/types/battleMaster";

export const fetchPokemonList = async (): Promise<Pokemon[]> => {
    const response = await api.get<{ data: Pokemon[] }>("/api/pokemon");

    return response.data.data;
};

export const fetchRoleTags = async (): Promise<RoleTag[]> => {
    const response = await api.get<{ data: RoleTag[] }>("/api/role-tags");

    return response.data.data;
};

export const fetchMoveList = async (
    search = "",
    limit = 50,
): Promise<MoveMaster[]> => {
    const response = await api.get<{ data: MoveMaster[] }>("/api/moves", {
        params: {
            search,
            limit,
        },
    });

    return response.data.data;
};

export const fetchAbilityList = async (
    search = "",
    limit = 50,
): Promise<AbilityMaster[]> => {
    const response = await api.get<{ data: AbilityMaster[] }>(
        "/api/abilities",
        {
            params: {
                search,
                limit,
            },
        },
    );

    return response.data.data;
};

export const fetchItemList = async (
    search = "",
    limit = 50,
): Promise<ItemMaster[]> => {
    const response = await api.get<{ data: ItemMaster[] }>("/api/items", {
        params: {
            search,
            limit,
        },
    });

    return response.data.data;
};

export const fetchNatureList = async (
    search = "",
    limit = 50,
): Promise<NatureMaster[]> => {
    const response = await api.get<{ data: NatureMaster[] }>("/api/natures", {
        params: {
            search,
            limit,
        },
    });

    return response.data.data;
};
